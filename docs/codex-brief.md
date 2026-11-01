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

## 5. Page layout and which image goes where

The integrator will build these sections. Make each image for its slot, respecting the **safe area** (where text will sit on top, which must stay calm and empty).

1. **Home hero:** full-bleed background behind the huge "न्यायमित्र" headline (centre).
2. **Two door cards** (side by side, about 600×450 each): one for सहाय, one for अभ्यास. The image fades in on hover behind white-ish text on the left half.
3. **"How it works" stacking cards:** gnani.ai-style sticky stack of 4 cards, each about 1200×700, pinned 24 px lower than the previous one as you scroll. Each card has text on the **left 45%** and the image on the **right 55%**.
4. **Languages strip:** wide band (about 2400×600) behind a row of 17 language names.
5. **Footer card:** the pastel card overlapping the dark footer (about 1600×600), with text centred in the top third.
6. **Social preview (OG image):** 1200×630.

## 6. Raster images (generate these; prompts are exact)

Generate each at the listed size or larger, keep the best of 2–4 tries, then export **WebP, quality 82, under 350 KB**. Also export an **800 px wide** version named `*-800.webp`. Put everything in `web/public/img/`. Every prompt implicitly includes the global negative list in §3.

### 6.1 `hero-rays.webp`: 2400×1400
> Abstract soft sunburst of light rays radiating upward from below the bottom centre of the frame, like dawn light through mist. Fine, evenly spaced translucent white rays over a smooth gradient: pale cyan (#A2EBFC) on the upper left, lavender (#E2E0FB) on the upper right, warm peach (#FFD3B7) glowing near the bottom centre where the rays originate. Very soft focus, subtle film grain, airy and luminous, high-key. The central 60% of the frame is the calmest, brightest area (headline sits there). Edges fade to off-white #F9FAFB. No objects, no horizon line, purely atmospheric. 16:9-ish wide composition.

### 6.2 `door-sahay.webp`: 1600×1200
> Soft 3D editorial illustration, matte clay-like materials, pastel palette. A young Indian woman in a simple cotton salwar kurta stands at a small roadside tea stall at early evening, seen from three-quarter behind, holding a basic smartphone to her ear, calm and focused. Warm string light, a steel kettle, a bench, a parked bicycle, out-of-focus shop shutters. Soft sound-wave ripples in translucent lavender (#E2E0FB) gently radiate from the phone into the air. Lighting: golden hour mixed with cool cyan sky (#A2EBFC), peach highlights (#FFD3B7). Left half of the frame is quieter, softer background (text overlays there); subject placed right of centre. Gentle depth of field, film grain, dignified and hopeful mood.

### 6.3 `door-abhyas.webp`: 1600×1200
> Soft 3D editorial illustration, matte clay-like materials, pastel palette. Interior of a small Indian district courtroom, empty, morning light: a raised wooden judge's bench with a plain high-backed chair, a ceiling fan, tall windows with light streaming in as soft rays, a lectern for the advocate in the foreground, stacks of case files tied with faded red cloth tape on a side table, a wall clock. One young advocate in a black coat and white bands stands at the lectern seen from behind, mid-gesture. Translucent violet (#8981F1) sound-wave ribbons travel from the bench toward the advocate, suggesting the judge speaking. Palette: off-white walls, honey wood, lavender and cyan light, peach accents. Left half calmer for text. Camera: eye level from behind the lectern, 35mm feel. No gavel, no flags, no emblems, no visible text anywhere.

### 6.4 Stacking cards: `stack-1-speak.webp`, `stack-2-path.webp`, `stack-3-letter.webp`, `stack-4-court.webp`: each 1800×1400
Shared style for all four (keep them visually consistent, as one series): *soft 3D still life on a seamless off-white (#F9FAFB) to lavender (#E2E0FB) sweep, matte clay and frosted-glass materials, single soft key light from the upper left, gentle long shadows in lavender (not black), subtle grain, objects placed in the right two-thirds, left third empty.*

1. **`stack-1-speak`:** A simple smartphone lying at a slight angle, from which a series of rounded, translucent frosted-glass waveform bars rise and float upward, tinted cyan (#A2EBFC) to violet (#8981F1), like a voice becoming solid. Small floating spheres of peach light around them.
2. **`stack-2-path`:** A winding ribbon path made of cream paper (#FCF7F2), rising in gentle switchbacks from the bottom toward the top right, with four small rounded milestone tokens along it in cyan, lavender, peach and violet. At the end, a tiny glowing doorway shape. It suggests "step by step, here's where to go".
3. **`stack-3-letter`:** A neatly folded formal letter and envelope in cream paper, with a soft violet wax-style seal (plain circle, no symbol), resting on a frosted glass tray. Beside it a fountain pen and a small stack of documents with a paperclip. A soft peach glow behind the letter, like it's ready to send. Paper looks blank (no writing).
4. **`stack-4-court`:** A miniature, toy-like district courtroom diorama on a round frosted-glass pedestal: a small judge's bench, a lectern, two tiny chairs, a ceiling fan. A translucent violet speech-wave ribbon arcs from the bench to the lectern. Playful but dignified, in the same clay style.

### 6.5 `languages-band.webp`: 2400×600
> Abstract wide banner: seventeen soft, flowing translucent silk ribbons weaving horizontally across the frame and interlacing, each a different gentle hue from the palette (cyan #A2EBFC, lavender #E2E0FB, peach #FFD3B7, violet #8981F1, cream, pale mint, rose). Background off-white #F9FAFB. Light and airy, soft shadows, subtle grain. The vertical centre band (middle 40% of the height) stays low-contrast because text sits over it. No letters or symbols.

### 6.6 `footer-card.webp`: 1600×600
> Abstract pastel light field: soft radial glows of cyan (#A2EBFC) top left, lavender (#E2E0FB) top right, peach (#FFD3B7) bottom centre, with faint fine light rays rising from the bottom centre. Smooth, minimal, grainy, no objects. The top third is the calmest area.

### 6.7 `og-image.png`: 1200×630 (composited, not generated as one shot)
Composite with code (sharp or ImageMagick) rather than asking the image model for text:
- Background: crop `hero-rays.webp` to 1200×630.
- Left-aligned, vertically centred: `logo-mark.svg` at 72 px, then the wordmark "न्यायमित्र" in **Tiro Devanagari Sanskrit** (download the font from Google Fonts into a temp folder, not into the repo) at 110 px in `#0B0B0F`, then the line "A friend in court, in your language." in Gambarino or Georgia at 40 px, `#344054`.
- Bottom-left small text in Inter 22 px, `#667085`: "Built on Gnani Prisma · Timbre · Evon".
- 72 px padding all round. Check the Devanagari conjuncts (न्या, त्र) render correctly; if your renderer breaks them, render the text via a headless browser screenshot instead.

## 7. `web/public/img/MANIFEST.md`

For every file you made, one row: filename, pixel size, file size, the slot it's for (§5), the final prompt you actually used (if you changed it, say why), and **alt text** (one plain sentence, e.g. "A woman at a tea stall talking on her phone at dusk, soft sound waves rising from it."). Add the brand files and say which logo variant you chose and why.

## 8. Quality bar (check each before keeping it)

1. Squint test: does the image read in one second at 300 px wide?
2. Text-overlay test: put the text "न्यायमित्र" over the safe area in your head. Is it still readable?
3. Does it look like the same family as the other images (palette, grain, materials)?
4. Anything from the negative list sneaking in, especially garbled text, gavels or flags? Regenerate.
5. File size under 350 KB (WebP) and the 800 px variant exists.

When done, print a short summary: files created, the chosen logo variant, anything you couldn't do. Leave everything uncommitted.
