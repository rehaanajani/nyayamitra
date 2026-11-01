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

## 5. Direction (read this first)

**Approved, keep it:** the empty-ish district courtroom (advocate in a black gown from behind at the lectern, judge on the bench with a blank, featureless face, a violet sound ribbon flowing from bench to advocate, lavender morning light through tall windows, ceiling fan, files tied with red cloth tape). Save it as `web/public/img/scene-court.webp`. **This image is the style anchor: every scene must look like it belongs in the same film.**

**Rejected:** the woman at the tea stall at sunset. The orange sunset, saturated sky and busy street don't match the anchor. Delete it.

**Where scenes are used:** the two door cards, the two page headers (सहाय, अभ्यास), the home "one case, both doors" band, and under the सहाय path card. The "How it works" stacking cards show real product UI built in code, as on gnani.ai, so don't make images for them.

### Approved so far
- `scene-court.webp`: the anchor. Keep it untouched.
- `scene-sahay.webp`: the woman at home on the phone. Approved.

### Rejected, never repeat
The winding cream path with a girl in casual clothes, coloured milestone stones and an arch doorway. It's a **toy diorama**: big head, clay rocks, plastic plants, isometric game look. The person meant to be the advocate wears no coat. Low effort. Delete it and anything like it.

### Realism rule (non-negotiable)
Premium **cinematic 3D**, like a frame from a high-end brand film or an architectural visualisation, matching `scene-court`:
- **Realistic adult proportions** (about 7.5–8 heads tall), real hands, real fabric folds and weight.
- Physically based materials: wood grain, paper, cotton, wool; soft global illumination.
- A shallow photographic depth of field (35–50mm lens look), subtle film grain.
- **Not** cartoon, Pixar-cute, chibi, clay or toy, isometric diorama, low-poly or vector. No floating props, no plastic plants, no "game level" paths.
- Faces are never the focus: subjects turned away, three-quarter from behind, or naturally out of focus. No identifiable faces.

### Cast bible (same people, same clothes, in every image)
| Who | Always |
|---|---|
| **Meena** (the citizen) | Indian woman, about 28, slim. **Lavender cotton salwar kurta with small white block-print motifs**, matching lavender dupatta, long black hair in a low braid, a simple tan cloth tote. Basic smartphone. |
| **Advocate Kabir** (the young lawyer) | Indian man, about 27, short black hair, neat. **Black advocate's coat (single-breasted, worn buttoned), crisp white shirt, white advocate bands (two white tabs at the collar), black trousers, black leather shoes.** Carries a buff case file tied with **faded red cloth tape**. The black coat and white bands are visible in **every** image he appears in. A black gown only in courtroom shots. |
| **The judge** | Older man, grey hair, black coat and white bands, seated at a raised wooden bench. Face featureless or in soft shadow. |

### Scene style (copy into every prompt)
*Cinematic 3D still matching the reference courtroom: realistic proportions, physically based materials, lavender-and-cream morning daylight through tall windows, soft volumetric light, cool shadows tinted lavender (never black or brown). Palette: cream walls, honey wood, lavender #E2E0FB, cyan #A2EBFC sky, peach #FFD3B7 accents. One translucent violet #8981F1 sound ribbon is the hero element, flowing from whoever is speaking. Calm, dignified, hopeful. 35–50mm lens, shallow depth of field, slight grain. No text, letters, numbers or signage anywhere; papers and screens are blank.*

### Shot list (make these, 1600×1200, each with an `-800.webp` copy)
1. **`scene-journey.webp`** (home page, "one case, both doors"): Morning, outside an Indian district court complex: wide stone steps, cream colonial building with arches, neem trees, soft lavender sky. **Meena** and **Advocate Kabir** walk up the steps side by side, seen from behind and slightly to the side. Kabir in his black coat and white bands holds the red-taped file; Meena holds her phone. A thin violet sound ribbon drifts from her phone ahead of them toward the open doorway. Two or three blurred background figures at most. Left 40% quieter (sky and steps).
2. **`scene-practice.webp`** (अभ्यास page header): Night, a small rented room. **Advocate Kabir** stands rehearsing aloud at a desk, coat on, bands on, one hand gesturing, files with red tape and a bare-act book open. A laptop on the desk glows with a blank screen. From the laptop, a translucent violet sound ribbon reaches toward him (the AI judge talking back). A warm desk lamp plus cool lavender moonlight from the window. Seen three-quarter from behind. Right 40% quieter.
3. **`scene-legal-aid.webp`** (सहाय results, under the path card): Daytime, a modest legal-aid office: a steel almirah, stacked files, a wooden desk, a window with soft light. **Meena** sits across the desk from **Advocate Kabir** (coat and bands), who is pointing to a blank document on the desk. A violet ribbon flows between them, calm and connected. Seen over Meena's shoulder; Kabir's face soft and out of focus. Left 40% quieter.

### Check every image before saving
1. Put it next to `scene-court`. Same film? Same light, materials and grade?
2. Is Kabir wearing the **black coat and white bands**? Is Meena in the **lavender block-print kurta**? If not, regenerate.
3. Any cartoon or toy look, a big head, plastic textures, text or signage? Regenerate (up to 4 tries per image).

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
