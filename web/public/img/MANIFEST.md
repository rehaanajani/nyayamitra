# Nyayamitra scene assets

Five cinematic 3D scenes for the Nyayamitra site: the approved courtroom and Sahay home scene, plus journey, practice and legal-aid shots following the revised §5 realism rule and cast bible. This delivery writes only inside `web/public/img/`; no brand, code, configuration or Git history changes were made by this work.

The approved `scene-court` and `scene-sahay` assets, including both 800px copies, remain byte-for-byte unchanged. The rejected winding-path/toy-diorama images and tea-stall images are absent from this repository asset folder; no such repo file existed to delete in this run. New images use the built-in image-generation tool, with `scene-court.webp` supplied as a reference on every attempt. Targeted edits also supplied the candidate shot as a second image, explicitly labelled as the edit target.

## Files

| Filename | Pixel size | File size | Slot | How made | Alt text |
|---|---|---|---|---|---|
| `scene-court.webp` | 1448×1086 | 99,990 bytes | Abhyas door card and page header | Approved courtroom source, unchanged composition and colour; WebP q85, effort 6. | A junior advocate addresses a district judge as a violet voice ribbon crosses a lavender-lit courtroom. |
| `scene-court-800.webp` | 800×600 | 48,838 bytes | Abhyas door card and page header | Approved courtroom source resized directly to 800 px wide with Lanczos3; WebP q85, effort 6. | A junior advocate addresses a district judge as a violet voice ribbon crosses a lavender-lit courtroom. |
| `scene-sahay.webp` | 1600×1200 | 110,328 bytes | Sahay door card and page header; left 45% for text | Built-in image generation with approved courtroom as style reference; full final prompt below; Lanczos3 resize to 1600×1200; WebP q85, effort 6. | A woman at home speaks on her phone beside a morning-lit window, with a violet ribbon flowing toward the light. |
| `scene-sahay-800.webp` | 800×600 | 47,216 bytes | Sahay door card and page header; left 45% for text | Selected Sahay source resized directly to 800 px wide with Lanczos3; WebP q85, effort 6. | A woman at home speaks on her phone beside a morning-lit window, with a violet ribbon flowing toward the light. |

| `scene-journey.webp` | 1600×1200 | 190,478 bytes | Home: one case, both doors band; quiet left 40% | Built-in generation using courtroom reference; selected attempt 3; resized directly from selected PNG with Lanczos3; WebP q85, effort 6; full prompt chain below. | Meena in a lavender block-print kurta and Advocate Kabir in a black coat climb district-court steps with a violet voice ribbon leading ahead. |
| `scene-journey-800.webp` | 800×600 | 80,154 bytes | Home: one case, both doors band; quiet left 40% | Built-in generation using courtroom reference; selected attempt 3; resized directly from selected PNG with Lanczos3; WebP q85, effort 6; full prompt chain below. | Meena in a lavender block-print kurta and Advocate Kabir in a black coat climb district-court steps with a violet voice ribbon leading ahead. |
| `scene-practice.webp` | 1600×1200 | 115,164 bytes | Abhyas page header; quiet upper-right area | Built-in generation using courtroom reference; selected attempt 3; resized directly from selected PNG with Lanczos3; WebP q85, effort 6; full prompt chain below. | Advocate Kabir rehearses at his desk at night while a violet voice ribbon reaches from a blank laptop screen toward him. |
| `scene-practice-800.webp` | 800×600 | 49,956 bytes | Abhyas page header; quiet upper-right area | Built-in generation using courtroom reference; selected attempt 3; resized directly from selected PNG with Lanczos3; WebP q85, effort 6; full prompt chain below. | Advocate Kabir rehearses at his desk at night while a violet voice ribbon reaches from a blank laptop screen toward him. |
| `scene-legal-aid.webp` | 1600×1200 | 131,922 bytes | Sahay results beneath path card; quieter left side | Built-in generation using courtroom reference; selected attempt 1; resized directly from selected PNG with Lanczos3; WebP q85, effort 6; full prompt chain below. | Meena meets Advocate Kabir in a sunlit legal-aid office as he points to a blank document and a violet voice ribbon connects them. |
| `scene-legal-aid-800.webp` | 800×600 | 57,166 bytes | Sahay results beneath path card; quieter left side | Built-in generation using courtroom reference; selected attempt 1; resized directly from selected PNG with Lanczos3; WebP q85, effort 6; full prompt chain below. | Meena meets Advocate Kabir in a sunlit legal-aid office as he points to a blank document and a violet voice ribbon connects them. |

## Sources and resolution

The approved courtroom remains at its original 1448×1086 dimensions to preserve it as supplied. Sahay's native generated source was also 1448×1086; the model did not honor the requested native dimensions, so its final main export was resampled to the requested 1600×1200. Each 800px copy was rendered directly from its source PNG to avoid an extra lossy compression pass. No colour grading, retouching, cropping, or scene edits were applied to the courtroom.

Courtroom source: `exec-5a28846b-2adc-40f3-b3cf-d6f5e8a47eda.png` (approved anchor).

Sahay source: `exec-5f492fae-6a8b-4134-a8c9-b1601a25d107.png` (first replacement attempt, accepted after comparison). The courtroom was supplied as the sole image reference.

## Final Sahay prompt

The scene style and scene prompt from §5 were combined verbatim. The required global negative list was appended, followed by reference-matching, blank-surface and size instructions to enforce the latest user request.

Soft 3D animated-film still, matte materials, gentle subsurface skin. Lavender-and-cream morning daylight through tall windows, soft volumetric light rays, cool shadows tinted lavender (never black or brown). Palette: cream walls, honey wood, lavender #E2E0FB, cyan #A2EBFC sky, small peach #FFD3B7 accents, one translucent violet #8981F1 sound ribbon as the hero element. Faces are blank or turned away, with no detailed features. Calm, dignified, hopeful. Shallow depth of field, slight grain. No sunsets, no orange skies, no crowds, no text or signage anywhere. Inside a small, tidy Indian home in the morning: a young woman in a simple cotton kurta sits at a wooden table by a tall window with lavender morning light, seen from three-quarter behind, holding a basic phone to her ear. On the table: a steel tumbler of tea, a folded salary slip and an envelope. A translucent violet sound ribbon flows from her phone out toward the window light, calm and reassuring. Potted tulsi plant, a wall calendar with no readable text. Left 45% of the frame quieter (text sits there).

No text, letters, numbers or scripts of any kind (AI renders Indian scripts as gibberish). No logos or brand marks. No **gavels** (Indian courts don't use them). No blindfolded Lady Justice statue. No national flags, emblems or the Ashoka pillar. No real or recognisable people, judges or politicians. No photoreal faces: people are stylised, seen from behind or side, or faces softly abstracted. No blood, handcuffs, police violence or prisons. No neon, cyberpunk, glowing circuit boards or "AI brain" clichés. No harsh black shadows. No watermark.

Reference image: the approved scene-court, a style anchor only. Match its lavender morning lighting, matte animated-film materials, level of detail, and translucent violet sound ribbon. New scene at home as described above; keep left 45% quiet. No sunset, no orange sky. Salary slip, envelope and calendar must have completely blank surfaces; no glyphs, no marks. Output 1600×1200 pixels or larger.

## New shots: sources and resolution

Each selected source PNG is 1448×1086. The tool returned this native resolution despite the 1600×1200 request. The main assets were resampled to the requested 1600×1200; 800×600 copies were resized directly from their selected PNGs, not from the lossy main WebPs. All six exports use quality 85 and are below 250,000 bytes.

- `scene-journey`: `exec-12bbeae1-c5ae-445e-b758-85147a549150.png`, selected attempt 3.
- `scene-practice`: `exec-5297c79d-ce5b-4704-a8a2-af76c5ff72b3.png`, selected attempt 3.
- `scene-legal-aid`: `exec-16b90b2a-5a73-4eea-b26e-f4327530fa07.png`, selected attempt 1.

## §5 inspection results

Every selected shot was displayed next to the approved courtroom before saving. All show the same cinematic material family and fine violet sound ribbon, with naturally proportioned adults, realistic cloth, wood, paper and shallow photographic depth of field. No toy-diorama staging, oversized heads, plastic foliage, visible lettering or signage was accepted. The practice shot intentionally uses the specified warm desk lamp and cool lavender night light rather than morning daylight.

| Shot | Cast and costume | Scene and safe area | Iteration outcome |
|---|---|---|---|
| Journey | Meena: lavender kurta with white block-print motifs, matching dupatta, low braid, tan tote and blank phone. Kabir: black buttoned coat, white shirt and two white bands at the front collar, black trousers and shoes, buff file with red cloth tape; no gown. | Real full-size court steps and building, lavender sky, quieter sky/steps on left; no background people in final. | Attempt 1 rejected: bands at back of neck. Attempt 2 corrected collar but exceeded background-figure count. Attempt 3 removed all background figures while preserving the accepted composition. |
| Practice | Kabir: buttoned black advocate coat, crisp white shirt and front white bands; no gown. Natural gesturing hand, face turned away. | Real rented room at night; blank-screen laptop, open blank book, red-tied files, warm lamp, lavender moonlight; upper-right wall subdued. | Attempt 1 rejected: stray lettering on book spines and wall papers. Attempt 2 removed those but retained ruled/print-like lines on open pages. Attempt 3 cleared both pages to blank cream. |
| Legal aid | Meena: lavender kurta with white block-print motifs, matching dupatta, low braid and tan tote. Kabir: black coat, white shirt and front white bands; face softly defocused. | Steel almirah and red-tied files, honey-wood desk, blank document, lavender window light; quieter left side. | Attempt 1 passed the side-by-side, clothing, realism and no-text checks. |

## New shots: exact prompt chains

The revised Scene style paragraph and each shot prompt were included verbatim. Extra instructions enforce the cast bible, correct placement of advocate bands, blank surfaces, safe areas and native size request. The practice prompt explicitly resolves the shared morning-light wording in favour of its prescribed night setting.

### scene-journey

#### Attempt 1 — not selected

```text
Cinematic 3D still matching the reference courtroom: realistic proportions, physically based materials, lavender-and-cream morning daylight through tall windows, soft volumetric light, cool shadows tinted lavender (never black or brown). Palette: cream walls, honey wood, lavender #E2E0FB, cyan #A2EBFC sky, peach #FFD3B7 accents. One translucent violet #8981F1 sound ribbon is the hero element, flowing from whoever is speaking. Calm, dignified, hopeful. 35–50mm lens, shallow depth of field, slight grain. No text, letters, numbers or signage anywhere; papers and screens are blank.

Shot (follow exactly):
Morning, outside an Indian district court complex: wide stone steps, cream colonial building with arches, neem trees, soft lavender sky. **Meena** and **Advocate Kabir** walk up the steps side by side, seen from behind and slightly to the side. Kabir in his black coat and white bands holds the red-taped file; Meena holds her phone. A thin violet sound ribbon drifts from her phone ahead of them toward the open doorway. Two or three blurred background figures at most. Left 40% quieter (sky and steps).

Cast bible (mandatory):
| **Meena** (the citizen) | Indian woman, about 28, slim. **Lavender cotton salwar kurta with small white block-print motifs**, matching lavender dupatta, long black hair in a low braid, a simple tan cloth tote. Basic smartphone. |
| **Advocate Kabir** (the young lawyer) | Indian man, about 27, short black hair, neat. **Black advocate's coat (single-breasted, worn buttoned), crisp white shirt, white advocate bands (two white tabs at the collar), black trousers, black leather shoes.** Carries a buff case file tied with **faded red cloth tape**. The black coat and white bands are visible in **every** image he appears in. A black gown only in courtroom shots. |

Realism rule:
(non-negotiable)
Premium **cinematic 3D**, like a frame from a high-end brand film or an architectural visualisation, matching `scene-court`:
- **Realistic adult proportions** (about 7.5–8 heads tall), real hands, real fabric folds and weight.
- Physically based materials: wood grain, paper, cotton, wool; soft global illumination.
- A shallow photographic depth of field (35–50mm lens look), subtle film grain.
- **Not** cartoon, Pixar-cute, chibi, clay or toy, isometric diorama, low-poly or vector. No floating props, no plastic plants, no "game level" paths.
- Faces are never the focus: subjects turned away, three-quarter from behind, or naturally out of focus. No identifiable faces.

No text, letters, numbers or scripts of any kind (AI renders Indian scripts as gibberish). No logos or brand marks. No **gavels** (Indian courts don't use them). No blindfolded Lady Justice statue. No national flags, emblems or the Ashoka pillar. No real or recognisable people, judges or politicians. No photoreal faces: people are stylised, seen from behind or side, or faces softly abstracted. No blood, handcuffs, police violence or prisons. No neon, cyberpunk, glowing circuit boards or "AI brain" clichés. No harsh black shadows. No watermark.

Image reference: scene-court.webp is the sole style anchor, not the scene to reproduce. Create the new outdoor court-steps shot above with the same cinematic 3D film grade and material detail. Meena and Kabir have natural adult proportions, approximately 7.5–8 heads tall. Meena's kurta is lavender with small white block-print motifs, not the reverse, with a matching dupatta, low braid and tan cloth tote. Kabir wears a buttoned single-breasted black advocate's coat over a white shirt and two white advocate bands at the FRONT of his collar; no gown outside the courtroom. His three-quarter-back position should reveal enough of the front collar to make both white tabs visible without an identifiable face. Keep the left 40% quiet for overlay. Real stairs and real court architecture, not a winding path, arch token, coloured stones or miniature. Output: 1600×1200 pixels or larger, landscape 4:3.
```

#### Attempt 2 — not selected

```text
Cinematic 3D still matching the reference courtroom: realistic proportions, physically based materials, lavender-and-cream morning daylight through tall windows, soft volumetric light, cool shadows tinted lavender (never black or brown). Palette: cream walls, honey wood, lavender #E2E0FB, cyan #A2EBFC sky, peach #FFD3B7 accents. One translucent violet #8981F1 sound ribbon is the hero element, flowing from whoever is speaking. Calm, dignified, hopeful. 35–50mm lens, shallow depth of field, slight grain. No text, letters, numbers or signage anywhere; papers and screens are blank.

Shot (follow exactly):
Morning, outside an Indian district court complex: wide stone steps, cream colonial building with arches, neem trees, soft lavender sky. **Meena** and **Advocate Kabir** walk up the steps side by side, seen from behind and slightly to the side. Kabir in his black coat and white bands holds the red-taped file; Meena holds her phone. A thin violet sound ribbon drifts from her phone ahead of them toward the open doorway. Two or three blurred background figures at most. Left 40% quieter (sky and steps).

Cast bible (mandatory):
| **Meena** (the citizen) | Indian woman, about 28, slim. **Lavender cotton salwar kurta with small white block-print motifs**, matching lavender dupatta, long black hair in a low braid, a simple tan cloth tote. Basic smartphone. |
| **Advocate Kabir** (the young lawyer) | Indian man, about 27, short black hair, neat. **Black advocate's coat (single-breasted, worn buttoned), crisp white shirt, white advocate bands (two white tabs at the collar), black trousers, black leather shoes.** Carries a buff case file tied with **faded red cloth tape**. The black coat and white bands are visible in **every** image he appears in. A black gown only in courtroom shots. |

Realism rule:
(non-negotiable)
Premium **cinematic 3D**, like a frame from a high-end brand film or an architectural visualisation, matching `scene-court`:
- **Realistic adult proportions** (about 7.5–8 heads tall), real hands, real fabric folds and weight.
- Physically based materials: wood grain, paper, cotton, wool; soft global illumination.
- A shallow photographic depth of field (35–50mm lens look), subtle film grain.
- **Not** cartoon, Pixar-cute, chibi, clay or toy, isometric diorama, low-poly or vector. No floating props, no plastic plants, no "game level" paths.
- Faces are never the focus: subjects turned away, three-quarter from behind, or naturally out of focus. No identifiable faces.

No text, letters, numbers or scripts of any kind (AI renders Indian scripts as gibberish). No logos or brand marks. No **gavels** (Indian courts don't use them). No blindfolded Lady Justice statue. No national flags, emblems or the Ashoka pillar. No real or recognisable people, judges or politicians. No photoreal faces: people are stylised, seen from behind or side, or faces softly abstracted. No blood, handcuffs, police violence or prisons. No neon, cyberpunk, glowing circuit boards or "AI brain" clichés. No harsh black shadows. No watermark.

Image reference: scene-court.webp is the sole style anchor, not the scene to reproduce. Create the new outdoor court-steps shot above with the same cinematic 3D film grade and material detail. Meena and Kabir have natural adult proportions, approximately 7.5–8 heads tall. Meena's kurta is lavender with small white block-print motifs, not the reverse, with a matching dupatta, low braid and tan cloth tote. Kabir wears a buttoned single-breasted black advocate's coat over a white shirt and two white advocate bands at the FRONT of his collar; no gown outside the courtroom. His three-quarter-back position should reveal enough of the front collar to make both white tabs visible without an identifiable face. Keep the left 40% quiet for overlay. Real stairs and real court architecture, not a winding path, arch token, coloured stones or miniature. Output: 1600×1200 pixels or larger, landscape 4:3.

CRITICAL COSTUME AND CAMERA CORRECTION: The white advocate bands are NOT a decoration on the back of a coat. No white tabs, ribbons or strips on the nape or back of Kabir. Position Kabir on the right of Meena with his chest turned partly LEFT toward her while he continues climbing the real steps. Photograph them from their rear-left SIDE, so Meena is seen from behind and Kabir is seen in an oblique SIDE view with a narrow view of his FRONT black lapels and FRONT white collar bands. His face is turned away toward the doorway or softly out of focus. Both white tabs must hang down his front shirt between the lapels, as on the reference judge. Keep his black coat buttoned, and the buff file with faded red tape in his hand. The back of his coat is plain black. Meena's phone has a completely blank screen, no screen icons. Keep realistic adult anatomy and the quieter left 40%.
```

#### Attempt 3 — selected

```text
Cinematic 3D still matching the reference courtroom: realistic proportions, physically based materials, lavender-and-cream morning daylight through tall windows, soft volumetric light, cool shadows tinted lavender (never black or brown). Palette: cream walls, honey wood, lavender #E2E0FB, cyan #A2EBFC sky, peach #FFD3B7 accents. One translucent violet #8981F1 sound ribbon is the hero element, flowing from whoever is speaking. Calm, dignified, hopeful. 35–50mm lens, shallow depth of field, slight grain. No text, letters, numbers or signage anywhere; papers and screens are blank.

Original shot specification:
Morning, outside an Indian district court complex: wide stone steps, cream colonial building with arches, neem trees, soft lavender sky. **Meena** and **Advocate Kabir** walk up the steps side by side, seen from behind and slightly to the side. Kabir in his black coat and white bands holds the red-taped file; Meena holds her phone. A thin violet sound ribbon drifts from her phone ahead of them toward the open doorway. Two or three blurred background figures at most. Left 40% quieter (sky and steps).

Image roles: Image 1 is scene-court.webp, the approved STYLE REFERENCE. Image 2 is the EDIT TARGET, an already composed new shot. Do not edit or reproduce image 1. Apply only the following correction to image 2, keeping its framing and every other detail unchanged:
Remove ALL background people from image 2, including the three near the doorway and the tiny distant figures at the lower left. Restore the real steps and doorway behind them. Only Meena and Kabir remain. Preserve their current natural adult proportions, positions, walking pose, faces turned away, lavender white-block-print kurta, low braid, dupatta and tote, black buttoned coat and FRONT white collar bands, buff file and red tape, violet ribbon, blank phone, quiet left area, architecture, photographic detail and soft morning film grade exactly.

No text, letters, numbers or scripts of any kind (AI renders Indian scripts as gibberish). No logos or brand marks. No **gavels** (Indian courts don't use them). No blindfolded Lady Justice statue. No national flags, emblems or the Ashoka pillar. No real or recognisable people, judges or politicians. No photoreal faces: people are stylised, seen from behind or side, or faces softly abstracted. No blood, handcuffs, police violence or prisons. No neon, cyberpunk, glowing circuit boards or "AI brain" clichés. No harsh black shadows. No watermark.

Preserve full landscape 4:3 frame. Output 1600×1200 pixels or larger.
```

### scene-practice

#### Attempt 1 — not selected

```text
Cinematic 3D still matching the reference courtroom: realistic proportions, physically based materials, lavender-and-cream morning daylight through tall windows, soft volumetric light, cool shadows tinted lavender (never black or brown). Palette: cream walls, honey wood, lavender #E2E0FB, cyan #A2EBFC sky, peach #FFD3B7 accents. One translucent violet #8981F1 sound ribbon is the hero element, flowing from whoever is speaking. Calm, dignified, hopeful. 35–50mm lens, shallow depth of field, slight grain. No text, letters, numbers or signage anywhere; papers and screens are blank.

Shot (follow exactly):
Night, a small rented room. **Advocate Kabir** stands rehearsing aloud at a desk, coat on, bands on, one hand gesturing, files with red tape and a bare-act book open. A laptop on the desk glows with a blank screen. From the laptop, a translucent violet sound ribbon reaches toward him (the AI judge talking back). A warm desk lamp plus cool lavender moonlight from the window. Seen three-quarter from behind. Right 40% quieter.

Cast bible (mandatory):
| **Advocate Kabir** (the young lawyer) | Indian man, about 27, short black hair, neat. **Black advocate's coat (single-breasted, worn buttoned), crisp white shirt, white advocate bands (two white tabs at the collar), black trousers, black leather shoes.** Carries a buff case file tied with **faded red cloth tape**. The black coat and white bands are visible in **every** image he appears in. A black gown only in courtroom shots. |

Realism rule:
(non-negotiable)
Premium **cinematic 3D**, like a frame from a high-end brand film or an architectural visualisation, matching `scene-court`:
- **Realistic adult proportions** (about 7.5–8 heads tall), real hands, real fabric folds and weight.
- Physically based materials: wood grain, paper, cotton, wool; soft global illumination.
- A shallow photographic depth of field (35–50mm lens look), subtle film grain.
- **Not** cartoon, Pixar-cute, chibi, clay or toy, isometric diorama, low-poly or vector. No floating props, no plastic plants, no "game level" paths.
- Faces are never the focus: subjects turned away, three-quarter from behind, or naturally out of focus. No identifiable faces.

No text, letters, numbers or scripts of any kind (AI renders Indian scripts as gibberish). No logos or brand marks. No **gavels** (Indian courts don't use them). No blindfolded Lady Justice statue. No national flags, emblems or the Ashoka pillar. No real or recognisable people, judges or politicians. No photoreal faces: people are stylised, seen from behind or side, or faces softly abstracted. No blood, handcuffs, police violence or prisons. No neon, cyberpunk, glowing circuit boards or "AI brain" clichés. No harsh black shadows. No watermark.

Image reference: scene-court.webp is the sole style anchor for cinematic 3D materials, adult anatomy and violet ribbon detail. The shot explicitly takes place at NIGHT, so replace the shared style's morning daylight with the prescribed warm desk lamp and cool lavender moonlight; keep the same lavender-and-cream film grade, softly lifted shadows and physically based materials. Kabir is alone in a modest real room. His buttoned single-breasted black advocate's coat, white shirt, black trousers and black shoes must be visible. No gown in this rehearsal room. His two white advocate collar bands hang down the FRONT of his chest over the shirt, below the throat, between the black lapels. They MUST NOT hang down the back or nape of his neck. Use a three-quarter side/back view with his torso partly turned toward the desk and camera so the front collar and both tabs can be seen; his head remains turned away, no identifiable face. He gestures naturally with one anatomically correct hand. All book pages, files and laptop screen are completely blank: not even blurred writing. Keep the right 40% quiet. A real full-size scene, no tiny props, toy people, clay or plastic. Output: 1600×1200 pixels or larger, landscape 4:3.
```

#### Attempt 2 — not selected

```text
Cinematic 3D still matching the reference courtroom: realistic proportions, physically based materials, lavender-and-cream morning daylight through tall windows, soft volumetric light, cool shadows tinted lavender (never black or brown). Palette: cream walls, honey wood, lavender #E2E0FB, cyan #A2EBFC sky, peach #FFD3B7 accents. One translucent violet #8981F1 sound ribbon is the hero element, flowing from whoever is speaking. Calm, dignified, hopeful. 35–50mm lens, shallow depth of field, slight grain. No text, letters, numbers or signage anywhere; papers and screens are blank.

Shot (follow exactly):
Night, a small rented room. **Advocate Kabir** stands rehearsing aloud at a desk, coat on, bands on, one hand gesturing, files with red tape and a bare-act book open. A laptop on the desk glows with a blank screen. From the laptop, a translucent violet sound ribbon reaches toward him (the AI judge talking back). A warm desk lamp plus cool lavender moonlight from the window. Seen three-quarter from behind. Right 40% quieter.

Cast bible (mandatory):
| **Advocate Kabir** (the young lawyer) | Indian man, about 27, short black hair, neat. **Black advocate's coat (single-breasted, worn buttoned), crisp white shirt, white advocate bands (two white tabs at the collar), black trousers, black leather shoes.** Carries a buff case file tied with **faded red cloth tape**. The black coat and white bands are visible in **every** image he appears in. A black gown only in courtroom shots. |

Realism rule:
(non-negotiable)
Premium **cinematic 3D**, like a frame from a high-end brand film or an architectural visualisation, matching `scene-court`:
- **Realistic adult proportions** (about 7.5–8 heads tall), real hands, real fabric folds and weight.
- Physically based materials: wood grain, paper, cotton, wool; soft global illumination.
- A shallow photographic depth of field (35–50mm lens look), subtle film grain.
- **Not** cartoon, Pixar-cute, chibi, clay or toy, isometric diorama, low-poly or vector. No floating props, no plastic plants, no "game level" paths.
- Faces are never the focus: subjects turned away, three-quarter from behind, or naturally out of focus. No identifiable faces.

No text, letters, numbers or scripts of any kind (AI renders Indian scripts as gibberish). No logos or brand marks. No **gavels** (Indian courts don't use them). No blindfolded Lady Justice statue. No national flags, emblems or the Ashoka pillar. No real or recognisable people, judges or politicians. No photoreal faces: people are stylised, seen from behind or side, or faces softly abstracted. No blood, handcuffs, police violence or prisons. No neon, cyberpunk, glowing circuit boards or "AI brain" clichés. No harsh black shadows. No watermark.

Image reference: scene-court.webp is the sole style anchor for cinematic 3D materials, adult anatomy and violet ribbon detail. The shot explicitly takes place at NIGHT, so replace the shared style's morning daylight with the prescribed warm desk lamp and cool lavender moonlight; keep the same lavender-and-cream film grade, softly lifted shadows and physically based materials. Kabir is alone in a modest real room. His buttoned single-breasted black advocate's coat, white shirt, black trousers and black shoes must be visible. No gown in this rehearsal room. His two white advocate collar bands hang down the FRONT of his chest over the shirt, below the throat, between the black lapels. They MUST NOT hang down the back or nape of his neck. Use a three-quarter side/back view with his torso partly turned toward the desk and camera so the front collar and both tabs can be seen; his head remains turned away, no identifiable face. He gestures naturally with one anatomically correct hand. All book pages, files and laptop screen are completely blank: not even blurred writing. Keep the right 40% quiet. A real full-size scene, no tiny props, toy people, clay or plastic. Output: 1600×1200 pixels or larger, landscape 4:3.

CRITICAL NO-TEXT CORRECTION: Use absolutely BLANK, UNPRINTED book spines, covers, documents and walls. No marks resembling handwriting or typography, even blurred. No framed certificate, wall calendar, poster, diagram, labels, papers pinned to the wall, or titled books. Leave the walls bare cream/lavender. The only open bare-act book has pure blank cream pages. Use the required red-tied files, blank-screen laptop, desk lamp, window and modest room furnishing, without adding text-bearing decorations. Maintain the buttoned black coat, FRONT white collar tabs, anatomically natural hand, realistic adult proportions and quiet right 40%. A natural cinematic interior at night, no cartoon styling.
```

#### Attempt 3 — selected

```text
Cinematic 3D still matching the reference courtroom: realistic proportions, physically based materials, lavender-and-cream morning daylight through tall windows, soft volumetric light, cool shadows tinted lavender (never black or brown). Palette: cream walls, honey wood, lavender #E2E0FB, cyan #A2EBFC sky, peach #FFD3B7 accents. One translucent violet #8981F1 sound ribbon is the hero element, flowing from whoever is speaking. Calm, dignified, hopeful. 35–50mm lens, shallow depth of field, slight grain. No text, letters, numbers or signage anywhere; papers and screens are blank.

Original shot specification:
Night, a small rented room. **Advocate Kabir** stands rehearsing aloud at a desk, coat on, bands on, one hand gesturing, files with red tape and a bare-act book open. A laptop on the desk glows with a blank screen. From the laptop, a translucent violet sound ribbon reaches toward him (the AI judge talking back). A warm desk lamp plus cool lavender moonlight from the window. Seen three-quarter from behind. Right 40% quieter.

Image roles: Image 1 is scene-court.webp, the approved STYLE REFERENCE. Image 2 is the EDIT TARGET, an already composed new shot. Do not edit or reproduce image 1. Apply only the following correction to image 2, keeping its framing and every other detail unchanged:
Remove ALL thin lines, rules, print-like rows and any marks from BOTH visible pages of the open book on the desk in image 2. Those two page surfaces must be pristine solid blank cream paper following the existing page curvature and light, with NO horizontal or vertical rules, no text, no glyphs, no grids. All other details must stay exactly the same: Kabir's natural adult proportions and hand, buttoned black advocate coat and FRONT white bands, head turned away, blank-screen laptop, violet ribbon, files and red cloth tape, warm lamp, cool lavender moonlight, blank books and wall, cinematic materials, camera and quiet upper-right area.

No text, letters, numbers or scripts of any kind (AI renders Indian scripts as gibberish). No logos or brand marks. No **gavels** (Indian courts don't use them). No blindfolded Lady Justice statue. No national flags, emblems or the Ashoka pillar. No real or recognisable people, judges or politicians. No photoreal faces: people are stylised, seen from behind or side, or faces softly abstracted. No blood, handcuffs, police violence or prisons. No neon, cyberpunk, glowing circuit boards or "AI brain" clichés. No harsh black shadows. No watermark.

Preserve full landscape 4:3 frame. Output 1600×1200 pixels or larger.
```

### scene-legal-aid

#### Attempt 1 — selected

```text
Cinematic 3D still matching the reference courtroom: realistic proportions, physically based materials, lavender-and-cream morning daylight through tall windows, soft volumetric light, cool shadows tinted lavender (never black or brown). Palette: cream walls, honey wood, lavender #E2E0FB, cyan #A2EBFC sky, peach #FFD3B7 accents. One translucent violet #8981F1 sound ribbon is the hero element, flowing from whoever is speaking. Calm, dignified, hopeful. 35–50mm lens, shallow depth of field, slight grain. No text, letters, numbers or signage anywhere; papers and screens are blank.

Shot (follow exactly):
Daytime, a modest legal-aid office: a steel almirah, stacked files, a wooden desk, a window with soft light. **Meena** sits across the desk from **Advocate Kabir** (coat and bands), who is pointing to a blank document on the desk. A violet ribbon flows between them, calm and connected. Seen over Meena's shoulder; Kabir's face soft and out of focus. Left 40% quieter.

Cast bible (mandatory):
| **Meena** (the citizen) | Indian woman, about 28, slim. **Lavender cotton salwar kurta with small white block-print motifs**, matching lavender dupatta, long black hair in a low braid, a simple tan cloth tote. Basic smartphone. |
| **Advocate Kabir** (the young lawyer) | Indian man, about 27, short black hair, neat. **Black advocate's coat (single-breasted, worn buttoned), crisp white shirt, white advocate bands (two white tabs at the collar), black trousers, black leather shoes.** Carries a buff case file tied with **faded red cloth tape**. The black coat and white bands are visible in **every** image he appears in. A black gown only in courtroom shots. |

Realism rule:
(non-negotiable)
Premium **cinematic 3D**, like a frame from a high-end brand film or an architectural visualisation, matching `scene-court`:
- **Realistic adult proportions** (about 7.5–8 heads tall), real hands, real fabric folds and weight.
- Physically based materials: wood grain, paper, cotton, wool; soft global illumination.
- A shallow photographic depth of field (35–50mm lens look), subtle film grain.
- **Not** cartoon, Pixar-cute, chibi, clay or toy, isometric diorama, low-poly or vector. No floating props, no plastic plants, no "game level" paths.
- Faces are never the focus: subjects turned away, three-quarter from behind, or naturally out of focus. No identifiable faces.

No text, letters, numbers or scripts of any kind (AI renders Indian scripts as gibberish). No logos or brand marks. No **gavels** (Indian courts don't use them). No blindfolded Lady Justice statue. No national flags, emblems or the Ashoka pillar. No real or recognisable people, judges or politicians. No photoreal faces: people are stylised, seen from behind or side, or faces softly abstracted. No blood, handcuffs, police violence or prisons. No neon, cyberpunk, glowing circuit boards or "AI brain" clichés. No harsh black shadows. No watermark.

Image reference: scene-court.webp is the sole style anchor for material realism, photographic depth, lavender-and-cream morning grade and the fine translucent violet voice ribbon. New scene: a real full-size legal-aid office, never a miniature or cartoon. Meena's lavender cotton kurta has small WHITE block-print motifs on lavender, matching lavender dupatta, long low black braid, tan cloth tote beside her. Kabir's buttoned single-breasted black advocate's coat and crisp white shirt are unmistakable. Both white advocate bands hang down the FRONT of his collar and are clearly visible between black lapels. No gown in this office. Kabir points naturally to the completely blank paper with an anatomically correct hand; his face is naturally defocused, not a toy head. Adult proportions, approximately 7.5–8 heads tall. Steel almirah has no labels; files, books, papers, walls and all other surfaces have NO lettering, numerals, symbols or pseudo-writing. The left 40% must stay subdued and quiet for overlay, even in the over-shoulder view. Output: 1600×1200 pixels or larger, landscape 4:3.
```
