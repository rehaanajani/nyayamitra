# Nyayamitra scene assets

Current delivery follows the latest request: preserve the approved courtroom and replace only the rejected tea-stall scene. No rejected tea-stall asset was copied into the repository. No code, configuration, or Git history was changed. Earlier logo and texture requests are outside this scene-only delivery; no brand files have been created or modified.

Both scenes were inspected side by side before export: lavender-and-cream morning lighting, matte materials, honey wood, fine translucent violet voice ribbons, and comparable detail. The Sahay scene keeps the left side quiet and has blank paper and calendar surfaces.

## Files

| Filename | Pixel size | File size | Slot | How made | Alt text |
|---|---|---|---|---|---|
| `scene-court.webp` | 1448×1086 | 99,990 bytes | Abhyas door card and page header | Approved courtroom source, unchanged composition and colour; WebP q85, effort 6. | A junior advocate addresses a district judge as a violet voice ribbon crosses a lavender-lit courtroom. |
| `scene-court-800.webp` | 800×600 | 48,838 bytes | Abhyas door card and page header | Approved courtroom source resized directly to 800 px wide with Lanczos3; WebP q85, effort 6. | A junior advocate addresses a district judge as a violet voice ribbon crosses a lavender-lit courtroom. |
| `scene-sahay.webp` | 1600×1200 | 110,328 bytes | Sahay door card and page header; left 45% for text | Built-in image generation with approved courtroom as style reference; full final prompt below; Lanczos3 resize to 1600×1200; WebP q85, effort 6. | A woman at home speaks on her phone beside a morning-lit window, with a violet ribbon flowing toward the light. |
| `scene-sahay-800.webp` | 800×600 | 47,216 bytes | Sahay door card and page header; left 45% for text | Selected Sahay source resized directly to 800 px wide with Lanczos3; WebP q85, effort 6. | A woman at home speaks on her phone beside a morning-lit window, with a violet ribbon flowing toward the light. |

## Sources and resolution

The approved courtroom remains at its original 1448×1086 dimensions to preserve it as supplied. Sahay's native generated source was also 1448×1086; the model did not honor the requested native dimensions, so its final main export was resampled to the requested 1600×1200. Each 800px copy was rendered directly from its source PNG to avoid an extra lossy compression pass. No colour grading, retouching, cropping, or scene edits were applied to the courtroom.

Courtroom source: `exec-5a28846b-2adc-40f3-b3cf-d6f5e8a47eda.png` (approved anchor).

Sahay source: `exec-5f492fae-6a8b-4134-a8c9-b1601a25d107.png` (first replacement attempt, accepted after comparison). The courtroom was supplied as the sole image reference.

## Final Sahay prompt

The scene style and scene prompt from §5 were combined verbatim. The required global negative list was appended, followed by reference-matching, blank-surface and size instructions to enforce the latest user request.

Soft 3D animated-film still, matte materials, gentle subsurface skin. Lavender-and-cream morning daylight through tall windows, soft volumetric light rays, cool shadows tinted lavender (never black or brown). Palette: cream walls, honey wood, lavender #E2E0FB, cyan #A2EBFC sky, small peach #FFD3B7 accents, one translucent violet #8981F1 sound ribbon as the hero element. Faces are blank or turned away, with no detailed features. Calm, dignified, hopeful. Shallow depth of field, slight grain. No sunsets, no orange skies, no crowds, no text or signage anywhere. Inside a small, tidy Indian home in the morning: a young woman in a simple cotton kurta sits at a wooden table by a tall window with lavender morning light, seen from three-quarter behind, holding a basic phone to her ear. On the table: a steel tumbler of tea, a folded salary slip and an envelope. A translucent violet sound ribbon flows from her phone out toward the window light, calm and reassuring. Potted tulsi plant, a wall calendar with no readable text. Left 45% of the frame quieter (text sits there).

No text, letters, numbers or scripts of any kind (AI renders Indian scripts as gibberish). No logos or brand marks. No **gavels** (Indian courts don't use them). No blindfolded Lady Justice statue. No national flags, emblems or the Ashoka pillar. No real or recognisable people, judges or politicians. No photoreal faces: people are stylised, seen from behind or side, or faces softly abstracted. No blood, handcuffs, police violence or prisons. No neon, cyberpunk, glowing circuit boards or "AI brain" clichés. No harsh black shadows. No watermark.

Reference image: the approved scene-court, a style anchor only. Match its lavender morning lighting, matte animated-film materials, level of detail, and translucent violet sound ribbon. New scene at home as described above; keep left 45% quiet. No sunset, no orange sky. Salary slip, envelope and calendar must have completely blank surfaces; no glyphs, no marks. Output 1600×1200 pixels or larger.
