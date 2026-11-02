// A second real hearing with the same arguments, held until the written verdict appears.
import { chromium } from 'playwright'
const SITE='https://nyayamitra-gnani.vercel.app'
const b=await chromium.launch(); const p=await (await b.newContext({viewport:{width:1440,height:810},deviceScaleFactor:2})).newPage()
await p.route(/\/api\/tts/,r=>r.fulfill({status:200,contentType:'audio/wav',body:Buffer.from('UklGRiQAAABXQVZFZm10IBAAAAABAAEAwF0AAIC7AAACABAAZGF0YQAAAAA=','base64')}))
await p.goto(SITE+'/#/abhyas'); await p.waitForTimeout(2200); await p.locator('button.card').first().click(); await p.waitForTimeout(1000)
await p.getByRole('button',{name:/Enter court/}).click(); await p.waitForTimeout(2200)
const say=async t=>{const f=p.locator('form input').last(); for(let i=0;i<60&&!(await f.isEnabled());i++) await p.waitForTimeout(800); await f.fill(t); await f.press('Enter')}
await say('My Lord, under Section 318 of the Bharatiya Nyaya Sanhita this is cheating, and the bank records show the money moved the same day.'); await p.waitForTimeout(5000)
await say('The accused had dishonest intention from the start, because the promise was made after the account was already empty.'); await p.waitForTimeout(5000)
const f=p.locator('form input').last(); for(let i=0;i<60&&!(await f.isEnabled());i++) await p.waitForTimeout(800)
await p.getByRole('button',{name:/End hearing/}).click()
await p.getByText('out of 100').first().waitFor({timeout:90000}); await p.waitForTimeout(1500)
await p.screenshot({path:'public/shots/verdict.png'}); await p.screenshot({path:'public/shots/verdict-full.png',fullPage:true}); console.log('ok'); await b.close()
