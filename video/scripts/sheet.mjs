// Renders chosen seconds of the film into one contact sheet for review.
import { bundle } from '@remotion/bundler'
import { renderStill, selectComposition } from '@remotion/renderer'
import { chromium } from 'playwright'
const secs = process.argv.slice(3).map(Number); const name = process.argv[2]
const serveUrl = await bundle({ entryPoint: 'src/index.jsx', publicDir: 'public' })
const composition = await selectComposition({ serveUrl, id: process.env.COMP ?? 'Launch' })
const files = []
await Promise.all(secs.map(async (s) => { const output = `out/chk/${name}-${s}.png`; await renderStill({ composition, serveUrl, output, frame: Math.round(s * 30), scale: 0.4 }); files.push([s, output]) }))
files.sort((a, b) => a[0] - b[0])
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1560, height: 900 } })
const fs = await import('fs')
const imgs = files.map(([s, f]) => `<div style="position:relative"><img style="width:100%;display:block" src="data:image/png;base64,${fs.readFileSync(f).toString('base64')}"><b style="position:absolute;left:4px;top:4px;background:#ff0;font:14px sans-serif">${s}s</b></div>`).join('')
await p.setContent(`<body style="margin:0;display:grid;grid-template-columns:repeat(3,1fr);gap:4px;background:#333">${imgs}</body>`)
await p.waitForTimeout(400)
await p.screenshot({ path: `out/chk/${name}.png`, fullPage: true }); await b.close()
