# Codex brief: brand assets and imagery for न्यायमित्र (Nyayamitra)

You are producing **visual assets only** for a web app. Another developer integrates them into the code. Read this whole file before generating anything.

## 1. Context

- **Product:** न्यायमित्र (Nyāyamitra, "friend of justice"; the Sanskrit for *amicus curiae*). A voice app with two doors:
  - **सहाय (Sahāya):** an ordinary person describes a legal problem in their own language (unpaid salary, landlord keeping a deposit, police refusing an FIR, UPI scam) and gets a path: where to go, what to carry, the deadline, a drafted letter, free legal aid.
  - **अभ्यास (Abhyāsa):** law students and junior advocates practise arguing in an Indian **district court** (not the Supreme Court) against an AI judge that interrupts them in Hindi or Tamil.
- **Audience:** Indian students, junior lawyers and ordinary citizens. It's an entry in Gnani AI's Great Indian AI Internship Challenge.
- **Live site:** https://nyayamitra-gnani.vercel.app. Open it and look at every page (`#/`, `#/sahay`, `#/abhyas`) before you start.
- **Visual reference:** https://www.gnani.ai. Study its hero (pastel sunburst light rays), its serif headlines, its sticky **stacking cards** and its calm off-white canvas. Match that *feel*. **Never copy their images, logo or text.**
- **Repo:** this folder (`~/codebases/nyayamitra`). Frontend is React + Vite + Tailwind in `web/`.

## 2. Where you may write (and where you may not)

| Do | Don't |
|---|---|
| Create files **only** in `web/public/brand/` and `web/public/img/` | Edit anything in `web/src/`, `server/`, `deploy/`, `package.json`, configs or `index.html` |
| Write `web/public/img/MANIFEST.md` (spec below) | Run `git commit`, `git push`, or change git config. Leave changes uncommitted |
| Use scripts for conversion and optimisation (sharp, cwebp, svgo, ImageMagick) **outside** the repo or via `npx` | Add npm dependencies to the project |
| Ask yourself "would this look at home on gnani.ai?" before keeping an image | Make a mascot or character (separate task, not yours) |

## 3. Design system (follow exactly)

- **Canvas:** off-white `#F9FAFB`; cream `#FCF7F2`.
- **Ink:** `#0B0B0F` (text, logo), secondary `#344054`, muted `#667085`, lines `#E4E7EC`.
- **Light palette (the Gnani wash):** cyan `#A2EBFC`, peach `#FFD3B7`, lavender `#E2E0FB`, violet `#8981F1`, deep violet `#5B50E6`.
- **Type on the site:** Gambarino (serif display), Tiro Devanagari Sanskrit (Devanagari), Inter (body). Images must **not** contain text; the site adds all text in code.
- **Mood:** calm, hopeful, dignified, modern Indian. Soft daylight, gentle film grain, matte surfaces, generous empty space. Think "editorial magazine illustration meets soft 3D". Not corporate stock photo, not dark, not dramatic.

### Global negative list (applies to every raster image)
No text, letters, numbers or scripts of any kind (AI renders Indian scripts as gibberish). No logos or brand marks. No **gavels** (Indian courts don't use them). No blindfolded Lady Justice statue. No national flags, emblems or the Ashoka pillar. No real or recognisable people, judges or politicians. No photoreal faces: people are stylised, seen from behind or side, or faces softly abstracted. No blood, handcuffs, police violence or prisons. No neon, cyberpunk, glowing circuit boards or "AI brain" clichés. No harsh black shadows. No watermark.

## 4. The logo (vector, hand-authored SVG, not image generation)

Write the SVG by hand in code so it's crisp at any size.

**Concept:** a **balance (तराज़ू) whose two pans are a speech waveform**. A single horizontal beam rests on a short centre post. From each end of the beam hangs a pan, and the pans are made of 3–4 vertical rounded bars of varying height, like an audio waveform, so the scales read as "a voice being weighed fairly". Optional: the centre post's top is a small dot, like the bindu (ं) in Devanagari, to nod to the script without using a letter.

- Geometry on a **32×32 grid**, stroke width **2.25** at 32px, `stroke-linecap="round"`, `stroke-linejoin="round"`. All strokes, no fills except the bindu dot.
- It must stay legible at **16×16** (favicon). Test by viewing it at 16px. If the waveform bars merge, use fewer bars.
- Balanced and symmetric. The beam is perfectly level (fairness), and the pans hang at equal height.
- It must sit comfortably next to the wordmark "न्यायमित्र" set in Tiro Devanagari Sanskrit at about 24px, with the mark about 1.4× the cap height.
- Do **not** use the letter N, the Devanagari letter न्, a gavel, a shield, a book or a speech bubble outline.

**Files** in `web/public/brand/`:

| File | What |
|---|---|
| `logo-mark.svg` | The mark only, `viewBox="0 0 32 32"`, stroke `#0B0B0F` |
| `logo-mark-white.svg` | Same, stroke `#FFFFFF` (for the dark footer) |
| `logo-mark-gradient.svg` | Same, stroke is a linear gradient `#5B50E6 → #8981F1 → #FF9E7A` at 135° |
| `logo-tile.svg` | The white mark centred on a 64×64 rounded square (`rx=16`) filled `#0B0B0F`. Used as the favicon and app icon |
| `favicon-32.png`, `favicon-16.png`, `apple-touch-icon.png` (180×180) | Rasterised from `logo-tile.svg` |
| `logo-explorations.svg` | A 3×2 sheet of **six variants** you considered (different bar counts and beam curvature), labelled A–F in small Inter text. Put the one you chose in slot A |

Keep the SVGs clean: no metadata, no editor junk, run through svgo.

## 5. Direction change (read this first)

The first round of scene illustrations (a woman at a tea stall, a courtroom) **is rejected**: it looked like generic 3D stock, oversaturated and off-palette. **Delete any scene images you made.**

gnani.ai's cards don't use illustrations. They show **real product UI floating on soft pastel gradients**. We do the same, and the integrator builds the UI in code. So your raster work is **only abstract gradient and light textures**. No people, no places, no objects, no scenes.

## 6. Gradient textures (generate or render; prompts are exact)

These are backgrounds only. Each is smooth, grainy, with no shapes that pull the eye. If the model adds objects, render them in code instead (layered radial gradients plus a noise overlay via sharp or ImageMagick), which is often better. Export **WebP quality 85, under 250 KB**, plus a `*-800.webp` variant, into `web/public/img/`.

Shared style: *an ultra-smooth airbrushed pastel gradient, like soft studio light on matte paper, fine even film grain (about 4%), no banding, no objects, no texture patterns, no text.*

| File | Size | Prompt / recipe |
|---|---|---|
| `hero-rays.webp` | 2400×1400 | Soft sunburst of fine translucent white light rays radiating up from just below the bottom centre, over pale cyan `#A2EBFC` (upper left) → lavender `#E2E0FB` (upper right) → peach `#FFD3B7` glow at the bottom centre. Centre 60% calm and bright. Edges fade to `#F9FAFB`. |
| `card-violet.webp` | 1800×1100 | Diagonal gradient from top-right lavender-violet `#BDB9F7` through white at 45% to off-white bottom-left. Like the "Agents" card on gnani.ai. |
| `card-peach.webp` | 1800×1100 | Diagonal gradient from white at the left to peach `#FFD3B7` at bottom-centre and lavender `#E2E0FB` at the top-right corner. Like the "Analytics" card on gnani.ai. |
| `card-cyan.webp` | 1800×1100 | Soft gradient from cyan `#A2EBFC` at the top-left through white to pale lavender `#E2E0FB` at the bottom-right. |
| `card-dawn.webp` | 1800×1100 | Peach `#FFD3B7` glow at the bottom-right, violet `#8981F1` at 25% opacity at the top-right, white elsewhere, with faint vertical light rays. |
| `footer-card.webp` | 1600×600 | Cyan glow at the top-left, lavender at the top-right, peach at the bottom-centre, faint rays rising from the bottom-centre. Top third calmest. |

### `og-image.png`: 1200×630 (composited in code, not generated)
- Background: crop `hero-rays.webp`.
- Left-aligned and vertically centred: `logo-mark.svg` at 72 px, the wordmark "न्यायमित्र" in Tiro Devanagari Sanskrit at 110 px `#0B0B0F` (font downloaded to a temp folder, not the repo), then "A friend in court, in your language." in Georgia or Gambarino at 40 px `#344054`.
- Bottom-left: Inter 22 px `#667085`, "Built on Gnani Prisma · Timbre · Evon". 72 px padding.
- Check the conjuncts न्या and त्र render correctly. If they break, render via a headless browser screenshot.

## 7. `web/public/img/MANIFEST.md`

For every file you made, one row: filename, pixel size, file size, what it's for, and how you made it (prompt or code recipe). Add the brand files and say which logo variant you chose and why.

## 8. Quality bar (check each before keeping it)

1. Squint test: does the image read in one second at 300 px wide?
2. Background test: would a white UI card and black text sit on it cleanly?
3. Does it look like the same family as the other images (palette, grain, materials)?
4. Anything from the negative list sneaking in, especially garbled text, gavels or flags? Regenerate.
5. File size under 250 KB (WebP) and the 800 px variant exists.

When done, print a short summary: files created, the chosen logo variant, anything you couldn't do. Leave everything uncommitted.
