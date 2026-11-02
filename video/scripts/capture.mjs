// Records the real product on the live site: every shot and line below is real output.
import { chromium } from 'playwright'
import fs from 'fs'
const SITE = 'https://nyayamitra-gnani.vercel.app'
const log = { sahay: [], abhyas: [] }
const b = await chromium.launch()
const ctx = await b.newContext({ viewport: { width: 1440, height: 810 }, deviceScaleFactor: 2 })
const p = await ctx.newPage()
// the app's voice calls get silence, so nothing plays in the recorder and the UI behaves normally
const SILENCE = Buffer.alloc(44 + 4800); SILENCE.write('RIFF', 0); SILENCE.writeUInt32LE(36 + 4800, 4); SILENCE.write('WAVEfmt ', 8); SILENCE.writeUInt32LE(16, 16); SILENCE.writeUInt16LE(1, 20); SILENCE.writeUInt16LE(1, 22); SILENCE.writeUInt32LE(24000, 24); SILENCE.writeUInt32LE(48000, 28); SILENCE.writeUInt16LE(2, 32); SILENCE.writeUInt16LE(16, 34); SILENCE.write('data', 36); SILENCE.writeUInt32LE(4800, 40)
await p.route(/\/api\/.*(tts|synth|speak)/i, r => r.fulfill({ status: 200, contentType: 'audio/wav', body: SILENCE }))
p.on('response', async r => {
  const u = r.url()
  if (r.request().method() !== 'POST') return
  try {
    if (u.includes('/api/sahay/turn')) log.sahay.push(await r.json())
    if (u.includes('/api/abhyas/')) log.abhyas.push({ url: u, req: r.request().postDataJSON(), res: await r.json() })
  } catch {}
})
const shot = async n => { await p.waitForTimeout(700); await p.screenshot({ path: `public/shots/${n}.png` }); console.log('shot', n) }

await p.goto(SITE); await p.waitForTimeout(3500); await shot('home')

// Sahay
await p.goto(SITE + '/#/sahay'); await p.waitForTimeout(1800); await shot('sahay-empty')
await p.getByText('मेरे boss ने 3 महीने से salary नहीं दी').click()
const ANSWERS = ['मैं Pune में एक private company में काम करता हूँ, दो साल से।', 'हाँ, offer letter और bank statement मेरे पास हैं। HR को email भी किया था।', 'कंपनी का office Pune में ही है, 40 लोग काम करते हैं। आखिरी salary जुलाई में मिली थी।', 'नहीं, अभी तक कोई complaint नहीं की।', 'हाँ, मुझे आगे का रास्ता बताइए।', 'जी, बस इतना ही।']
const input = p.getByPlaceholder('Or type here…')
const waitReply = async n => { for (let i = 0; i < 60 && log.sahay.length < n; i++) await p.waitForTimeout(500); await p.waitForTimeout(800) }
await waitReply(1); await shot('sahay-t1')
for (let i = 0; i < ANSWERS.length; i++) {
  if (await p.getByText('Your path').count()) break
  await input.fill(ANSWERS[i]); await input.press('Enter'); await waitReply(i + 2); await shot(`sahay-t${i + 2}`)
}
await p.waitForTimeout(1500)
if (await p.getByText('Your path').count()) {
  await shot('sahay-card')
  await p.keyboard.press('Escape'); await p.waitForTimeout(600); await shot('sahay-final')
}

// Abhyas
await p.goto(SITE + '/#/abhyas'); await p.waitForTimeout(2200); await shot('abhyas-picker')
await p.locator('button.card').first().click(); await p.waitForTimeout(1200); await shot('abhyas-setup')
await p.getByRole('button', { name: /Enter court/ }).click(); await p.waitForTimeout(2500); await shot('court-open')
const say = async t => { const f = p.locator('form input').last(); await f.fill(t); await f.press('Enter') }
await say('My Lord, under Section 420 of the IPC the accused is clearly guilty of cheating my client.')
await p.waitForTimeout(6000); await shot('court-correction')
const turnWait = async () => { for (let i = 0; i < 50; i++) { await p.waitForTimeout(800); if (await p.locator('form input').last().isEnabled()) break } await p.waitForTimeout(1200) }
await turnWait()
await say('My Lord, under Section 318 of the Bharatiya Nyaya Sanhita this is cheating, and the bank records show the money moved the same day.')
await p.waitForTimeout(3500); await shot('court-counsel')
await turnWait(); await shot('court-scored')
await say('The accused had dishonest intention from the start, because the promise was made after the account was already empty.')
await p.waitForTimeout(3500); await shot('court-counsel2'); await turnWait(); await shot('court-scored2')
await p.getByRole('button', { name: /End hearing/ }).click(); await p.waitForTimeout(9000); await shot('verdict')
fs.writeFileSync('scripts/capture-log.json', JSON.stringify(log, null, 1))
await b.close()
