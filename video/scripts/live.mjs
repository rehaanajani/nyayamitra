// Films the real app on the live site with a working microphone: each character's line is played
// into getUserMedia, so Prisma, the model and Timbre all run for real. Frames and every sound the
// app plays are saved with timestamps. Usage: node scripts/live.mjs sahay|court
import { chromium } from 'playwright'
import fs from 'fs'
const clip = process.argv[2]
const SITE = 'https://nyayamitra-gnani.vercel.app'
const DIR = process.env.REC_DIR ? `${process.env.REC_DIR}/${clip}` : `public/rec/${clip}`
fs.rmSync(DIR, { recursive: true, force: true }); fs.mkdirSync(`${DIR}/f`, { recursive: true }); fs.mkdirSync(`${DIR}/a`, { recursive: true })
const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required', '--use-fake-ui-for-media-stream'] })
const ctx = await b.newContext({ viewport: { width: 1440, height: 810 }, deviceScaleFactor: 4 / 3, permissions: ['microphone'] })
const p = await ctx.newPage()
const events = []; const sounds = []; const frames = []
const ttsTexts = []
p.on('request', (r) => { if (r.url().includes('/api/tts') && r.method() === 'POST') { try { ttsTexts.push(r.postDataJSON().text.replace(/^<[^>]+>\s*/, '')) } catch {} } })
const mark = (name, extra) => { events.push({ t: Date.now(), name, ...extra }); console.log(name, extra ? JSON.stringify(extra).slice(0, 140) : '') }

function wav(float32, sr) {
  const n = float32.length; const buf = Buffer.alloc(44 + n * 2)
  buf.write('RIFF', 0); buf.writeUInt32LE(36 + n * 2, 4); buf.write('WAVEfmt ', 8); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(1, 22)
  buf.writeUInt32LE(sr, 24); buf.writeUInt32LE(sr * 2, 28); buf.writeUInt16LE(2, 32); buf.writeUInt16LE(16, 34); buf.write('data', 36); buf.writeUInt32LE(n * 2, 40)
  for (let i = 0; i < n; i++) buf.writeInt16LE(Math.max(-1, Math.min(1, float32[i])) * 32767 | 0, 44 + i * 2)
  return buf
}
await p.exposeFunction('__sound', (t, b64, sr, kind) => {
  const f = new Float32Array(Uint8Array.from(Buffer.from(b64, 'base64')).buffer)
  const name = `${sounds.length}.wav`; fs.writeFileSync(`${DIR}/a/${name}`, wav(f, sr)); sounds.push({ t, file: name, dur: f.length / sr, kind }); console.log('sound', kind, (f.length / sr).toFixed(1))
})
await p.addInitScript(() => {
  const b64 = (f) => { const u = new Uint8Array(f.buffer); let s = ''; for (let i = 0; i < u.length; i += 8192) s += String.fromCharCode(...u.subarray(i, i + 8192)); return btoa(s) }
  const start = AudioBufferSourceNode.prototype.start
  AudioBufferSourceNode.prototype.start = function (...a) { if (this.buffer) window.__sound(Date.now(), b64(this.buffer.getChannelData(0).slice()), this.buffer.sampleRate, this.__mic ? 'mic' : 'app'); return start.apply(this, a) }
  let mc, dest
  const ensure = () => { if (!mc) { mc = new AudioContext({ sampleRate: 48000 }); dest = mc.createMediaStreamDestination(); const o = mc.createOscillator(); const g = mc.createGain(); g.gain.value = 0; o.connect(g).connect(dest); o.start() } return mc }
  navigator.mediaDevices.getUserMedia = async () => { ensure(); await mc.resume(); return new MediaStream(dest.stream.getAudioTracks().map((t) => t.clone())) }
  window.__speak = async (url) => { ensure(); await mc.resume(); const r = await fetch(url); const d = await mc.decodeAudioData(await r.arrayBuffer()); const s = mc.createBufferSource(); s.__mic = true; s.buffer = d; s.connect(dest); await new Promise((res) => { s.onended = res; s.start() }); return d.duration }
})
// voice lines are served to the page from local disk
await p.route('https://mic.local/**', (r) => { const id = r.request().url().split('/').pop(); r.fulfill({ status: 200, contentType: 'audio/wav', headers: { 'access-control-allow-origin': '*' }, body: fs.readFileSync(`public/vo/${id}.wav`) }) })
const cdp = await ctx.newCDPSession(p)
let last = 0
cdp.on('Page.screencastFrame', async ({ data, metadata, sessionId }) => {
  const t = metadata.timestamp * 1000
  if (t - last >= 30) { last = t; const n = `${String(frames.length).padStart(6, '0')}.jpg`; fs.writeFileSync(`${DIR}/f/${n}`, Buffer.from(data, 'base64')); frames.push({ t: Math.round(t), n }) }
  await cdp.send('Page.screencastFrameAck', { sessionId }).catch(() => {})
})
await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 88, maxWidth: 1920, maxHeight: 1080, everyNthFrame: 1 })
const say = async (id) => { mark('say', { id }); await p.evaluate((u) => window.__speak(u), `https://mic.local/${id}`); mark('said', { id }) }
const wait = (ms) => p.waitForTimeout(ms)
const quiet = async (ms = 90000) => { // until the app has stopped talking and its mic label says go
  const end = Date.now() + ms; let lastSound = 0
  while (Date.now() < end) { await wait(500); const s = sounds.filter((x) => x.kind === 'app').at(-1); const busy = s && Date.now() < s.t + s.dur * 1000 + 900; if (sounds.filter((x) => x.kind === 'app').length > lastSound && !busy) return; if (busy) lastSound = 0 }
}
const silentFor = async (ms = 1400) => { for (;;) { await wait(200); const s = sounds.filter((x) => x.kind === 'app').at(-1); if (!s || Date.now() > s.t + s.dur * 1000 + ms) return } }
const myTurn = async (re, ms = 120000) => { await wait(500); await p.getByText(re).first().waitFor({ timeout: ms }); await silentFor(); await wait(300) }
const appSoundsBefore = () => sounds.filter((x) => x.kind === 'app').length
const replyDone = async (n, ms = 60000) => { const end = Date.now() + ms; while (Date.now() < end) { await wait(300); const a = sounds.filter((x) => x.kind === 'app'); if (a.length > n) { const s = a.at(-1); if (Date.now() > s.t + s.dur * 1000 + 1500) return true } } return false }

if (clip === 'sahay') {
  await p.goto(SITE + '/#/sahay'); await wait(2200); mark('page')
  await p.locator('button[aria-pressed]').click(); mark('mic-on')
  const GO = /सुन रही हूँ · बोलिए/
  await myTurn(GO); mark('greeted')
  for (const id of ['m1', 'm2', 'm3', 'm4', 'm5']) {
    if (await p.getByText('Your path').count()) break
    await say(id); await wait(1500); mark('wait-reply', { id })
    await Promise.race([p.getByText('Your path').first().waitFor({ timeout: 100000 }), myTurn(GO)]).catch(() => {})
    await silentFor(); mark('replied', { id })
  }
  await wait(1800); mark('card', { open: await p.getByText('Your path').count() }); await wait(3500)
  await p.keyboard.press('Escape'); await wait(1000)
} else {
  await p.goto(SITE + '/#/abhyas'); await wait(2500); mark('page')
  const story = 'Meena, a garment worker in Lucknow, has not been paid for three months. Her employer promised payment in writing again and again and kept taking her work, with no intention of paying. She filed a complaint alleging cheating. We act for Meena.'
  const box = p.locator('textarea').first(); await box.scrollIntoViewIfNeeded(); await wait(400); mark('typing')
  await box.pressSequentially(story, { delay: 16 }); await wait(500)
  const enter = p.getByRole('button', { name: /Enter court/ })
  for (let i = 0; i < 4 && !(await enter.count()); i++) {
    await p.getByRole('button', { name: /Build practice case/ }).click(); mark('building', { try: i })
    await enter.waitFor({ timeout: 45000 }).catch(() => {})
  }
  await wait(1800); mark('built')
  await p.screenshot({ path: `${DIR}/setup.png` })
  await p.getByRole('button', { name: /Enter court/ }).click(); await wait(2200); mark('in-court')
  await p.locator('button[aria-pressed]').click(); mark('mic-on')
  const GO = /Your turn · speak now/
  await myTurn(GO); mark('ready')
  await say('a1'); await wait(1500); await myTurn(GO); mark('judge-done')
  await say('a2'); await wait(4000); await myTurn(GO); mark('round1-done')
  await say('a3'); await wait(4000); await myTurn(GO); mark('round2-done')
  await p.getByRole('button', { name: /End hearing/ }).click(); mark('ending')
  await p.getByText('out of 100').first().waitFor({ timeout: 120000 }); await wait(2500); mark('verdict')
  await p.screenshot({ path: `${DIR}/verdict.png` }); await p.mouse.wheel(0, 500); await wait(2500); await p.mouse.wheel(0, 500); await wait(2500)
}
await cdp.send('Page.stopScreencast').catch(() => {})
sounds.filter((x) => x.kind === 'app').forEach((x, i) => { x.text = ttsTexts[i] ?? '' })
fs.writeFileSync(`${DIR}/index.json`, JSON.stringify({ frames, sounds, events }))
const dt = (frames.at(-1).t - frames[0].t) / 1000; console.log('frames', frames.length, 'over', dt.toFixed(0) + 's', 'fps', (frames.length / dt).toFixed(1))
await b.close()
