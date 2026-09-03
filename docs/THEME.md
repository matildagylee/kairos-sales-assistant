# Kairos Theme — Gorgias brand (modern, dark)

The panel uses the Gorgias brand directly (coral on ink), not the Gaia web-app palette. Goal: sleek, flat, one accent, hairline borders. It sits beside a dark Meet/Zoom window and reads as a focused copilot.

## Tokens (source of truth: `src/sidepanel.css` `:root`)

```css
/* Surfaces — Gorgias ink */
--bg:            #14171B;   /* app base */
--bg-2:          #181C21;   /* settings / controls band */
--surface:       #1A1E23;   /* Gorgias helpdesk ink */
--card:          #21262D;   /* bubbles / cards */
--card-2:        #272D35;   /* inputs / elevated */

/* Text */
--foreground:        #F3F4F6;
--muted-foreground:  #9AA2AD;
--faint:             #6A727C;

/* Accent — Gorgias coral (the ONLY accent) */
--primary:       #FF7A5A;   /* coral */
--primary-hover: #FF8E70;
--primary-ink:   #17110E;   /* text ON coral — warm near-black */
--accent-2:      #E8542E;   /* deep coral for depth */
--primary-soft:  hsl(14 100% 66% / 0.12);  /* coral tint fill */
--primary-line:  hsl(14 100% 66% / 0.28);  /* coral hairline */

/* States */
--destructive: #FF5468;
--success:     #37C793;
--warning-fg:  #F0B072;

/* Borders — subtle warm-white */
--border:        hsl(210 14% 100% / 0.07);
--border-strong: hsl(210 14% 100% / 0.12);

/* Radius */
--radius:    12px;  /* card */
--radius-md: 9px;   /* button / input */
--radius-sm: 7px;
```

## Typography

- **Body:** `'Inter', ui-sans-serif, system-ui, -apple-system, sans-serif`
- **Display / wordmark + card titles (`--font-display`):** `'Inter Tight', 'Inter', ui-sans-serif, system-ui, sans-serif`
- No font files are bundled; both degrade gracefully to the system UI font. (Inter Tight is the current Gorgias display face; swap in a bundled `.woff2` later if you want it pixel-exact offline.)

## Principles

- **One accent.** Coral carries every interactive state (primary buttons, active tab, focus ring, links, live-note accents). No secondary accent color.
- **Text on coral is ink, not white** — cleaner and more modern on a light-ish coral.
- **Flat and quiet.** Solid surfaces, hairline borders, one soft shadow on cards. The old glassmorphism/multi-glow HUD was removed; a single faint coral glow sits at the very top of the panel.
- **Radii:** 12px cards, 9px controls, 999px chips.
- **Recording state** uses `--destructive` with a subtle ring pulse — the only animation.

## Logo

Standard Gorgias logo at `assets/icons/gorgias-logo.png`, inverted to white in the header.
