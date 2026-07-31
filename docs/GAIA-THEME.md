# Gaia UI — Design System Spec

Extracted from `gorgias/gaia` → `gaia_ui/src/index.css` (Tailwind v4 + shadcn/ui, slate base).
Use these tokens to restyle the Chrome extension so it matches the Gaia web app.

## Colors — ready-to-use CSS

```css
:root {
  /* Neutral */
  --background: #ffffff;
  --foreground: hsl(220 4% 11%);

  /* Surface hierarchy */
  --surface: hsl(220 14% 96%);
  --surface-raised: hsl(0 0% 100%);
  --surface-overlay: hsl(0 0% 100%);

  /* Card / Popover */
  --card: hsl(0 0% 100%);
  --card-foreground: hsl(220 4% 11%);
  --popover: hsl(0 0% 100%);
  --popover-foreground: hsl(220 4% 11%);

  /* Primary — Gorgias purple */
  --primary: hsl(262 60% 55%);            /* ≈ #7B52D9 */
  --primary-foreground: hsl(0 0% 100%);

  /* Secondary */
  --secondary: hsl(220 14% 96%);
  --secondary-foreground: hsl(220 4% 11%);

  /* Muted */
  --muted: hsl(220 14% 96%);
  --muted-foreground: hsl(218 10% 35%);

  /* Accent — light purple tint */
  --accent: hsl(255 100% 96%);            /* ≈ #F1ECFF */
  --accent-foreground: hsl(262 60% 55%);

  /* States */
  --destructive: hsl(0 72% 51%);
  --destructive-foreground: hsl(0 0% 100%);
  --success: hsl(152 60% 40%);
  --success-foreground: hsl(0 0% 100%);
  --warning: hsl(38 92% 50%);
  --warning-foreground: hsl(220 4% 11%);

  /* Intelligence — AI purple (same as primary) */
  --intelligence: hsl(262 60% 55%);
  --intelligence-foreground: hsl(0 0% 100%);

  /* Borders & inputs — subtle black-based */
  --border: hsl(0 0% 0% / 0.11);
  --input: hsl(0 0% 0% / 0.11);
  --ring: hsl(262 60% 55%);

  /* Radius — 10px base */
  --radius: 0.625rem;                     /* 10px */

  /* Sidebar */
  --sidebar-background: hsl(0 0% 100%);
  --sidebar-foreground: hsl(218 9% 40%);
  --sidebar-border: hsl(0 0% 0% / 0.08);
  --sidebar-active: #f1ecff;
  --sidebar-active-foreground: #6245e4;
  --sidebar-primary: hsl(262 60% 55%);

  /* Shadows */
  --shadow-sm: 0 1px 2px 0 oklch(0 0 0 / 0.04);
  --shadow-md: 0 2px 4px -1px oklch(0 0 0 / 0.06), 0 1px 2px -1px oklch(0 0 0 / 0.04);
  --shadow-lg: 0 4px 8px -2px oklch(0 0 0 / 0.08), 0 2px 4px -2px oklch(0 0 0 / 0.04);
  --shadow-xl: 0 8px 16px -4px oklch(0 0 0 / 0.1), 0 4px 6px -4px oklch(0 0 0 / 0.05);
}

.dark {
  --background: #1a1e23;                   /* helpdesk outer bg */
  --foreground: #fafafa;

  --surface: #2c2f35;                      /* helpdesk content bg */
  --surface-raised: #363a41;
  --surface-overlay: #42474e;

  --card: #2c2f35;
  --card-foreground: #fafafa;
  --popover: #363a41;
  --popover-foreground: #fafafa;

  --primary: #9b7bff;                      /* brightened purple */
  --primary-foreground: #ffffff;

  --secondary: #363a41;
  --secondary-foreground: #d5d7dd;

  --muted: #363a41;
  --muted-foreground: #c7cad1;

  --accent: #4c3c9d;                       /* solid purple */
  --accent-foreground: #b7a7ff;

  --destructive: #ff425d;
  --destructive-foreground: #ffffff;
  --success: #32c898;
  --success-foreground: #ffffff;
  --warning: #ff9a57;
  --warning-foreground: #1a1e23;

  --intelligence: #9b7bff;
  --intelligence-foreground: #ffffff;

  --border: rgba(199, 222, 255, 0.2);
  --input: rgba(199, 222, 255, 0.2);
  --ring: #9b7bff;

  --sidebar-background: #1a1e23;
  --sidebar-foreground: #c7cad1;
  --sidebar-border: rgba(199, 222, 255, 0.2);
  --sidebar-active: #4c3c9d;
}
```

Radius scale (Tailwind): `--radius-sm = radius - 4px` (6px), `--radius-md = radius - 2px` (8px), `--radius-lg = radius` (10px), `--radius-xl = radius + 4px` (14px).

## Typography

- **Primary / body font stack:**
  `'Inter', ui-sans-serif, system-ui, -apple-system, sans-serif`
  (`--font-sans` and `--font-primary` are identical.)
- **Logo / display font (`--font-logo`):**
  `'BB Modern Semi Condensed', 'Inter', ui-sans-serif, system-ui, -apple-system, sans-serif`
- **Custom font file:** `gaia_ui/public/fonts/bb-modern-semi-condensed-font.otf`
  - `@font-face` family name: `'BB Modern Semi Condensed'`, weight 400, `font-display: swap`.
  - Used only for the Gaia wordmark/logo. NOT downloaded. If unavailable, substitute a condensed grotesque (e.g. a `font-stretch: condensed` sans) or fall back to Inter.

## Component styling (shadcn defaults, as used in Gaia)

- **Button:** `rounded-md` (8px), `text-sm font-medium`, sizes: default `h-10 px-4 py-2`, sm `h-9 px-3`, lg `h-11 px-8`, icon `h-10 w-10`.
  - Primary/default: solid fill `bg-primary text-primary-foreground`, hover `bg-primary/90`.
  - Outline: `border border-input bg-background`, hover `bg-accent text-accent-foreground`.
  - Focus ring: `ring-2 ring-ring ring-offset-2`.
- **Input:** `h-10 w-full rounded-md border border-input bg-background px-3 py-2`, text-sm, `placeholder:text-muted-foreground`, focus `ring-2 ring-ring ring-offset-2`.
- **Card:** `rounded-lg` (10px) `border bg-card text-card-foreground shadow-sm`.
- **General look:** white/light surfaces, subtle low-alpha borders, Gorgias purple as the single accent color, soft oklch shadows, generous 8–10px radii.

## Logo

- Saved to `icons/gaia_logo.svg` (from `gaia_ui/public/gaia_logo.svg`, 67×67 viewBox, filtered/gradient SVG). Confirmed.
