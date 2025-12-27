# Mood Board — Voice Patches Consulting

## Brand Palette (finalized)
- **Dark / Primary text**: #39393A
- **Light Neutral / Surface**: #E6E6E6
- **Action / CTA (Red)**: #DC2121
- **Accent / Optimistic (Yellow)**: #D6BB20
- **Near white / Background**: #F6F4EE  /* warm off-white */

## Usage guidance
- Backgrounds: **#FCFFFD** (near white) for large areas to keep brightness without harsh contrast.
- Surface cards: **#FFFFFF** with a thin border or subtle shadow atop `--surface`.
- Primary CTAs: **#DC2121** — use white text on the button; ensure contrast checks (WCAG AA/AAA).
- Accents & micro-interactions: **#D6BB20** — used conservatively for icons, small highlights, or animation accents.
- Neutral buffers: use **#E6E6E6** and `#9AA6A3` (or similar) for secondary UI.

## Typography
- Headings: **Poppins** (friendly, rounded forms useful for kid-focused audience)
- Body: **Roboto** (neutral, legible)
- For kids & parents: slightly larger headings and comfortable line-height; friendly tone in microcopy.

## Hero copy variations (two prototype directions)
- Playful (kids & parents):
  - Headline: "Find Their Voice — Gentle, playful therapy for kids & families"
  - Subtext: "Fun, evidence-based sessions designed for children and their caregivers. Celebrate every step forward."
  - CTA: "Book a Fun Consultation"

- Calm (trusted & professional):
  - Headline: "Rediscover Your Voice — Compassionate therapy for children and adults"
  - Subtext: "Personalized, evidence-based programs to support communication and confidence."
  - CTA: "Start Your Journey"

## Accessibility & Emotional Checks
- Run contrast checks (buttons and text). If CTA red fails contrast on white, use white text on a darkened red background.
- Test emotional response (A/B test yellow variations): some children/parents react better to warmer shades; keep yellow muted.
- Respect `prefers-reduced-motion`: keep animations optional and short (5s).

## Files & next steps
- Implement final tokens in `styles.css` (done).
- Create two hero prototypes (playful & calm) for stakeholder review (in `prototypes/`).
- Next: A/B test with small sample of parents for emotional tone on the hero.
