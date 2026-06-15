# Design System — $ASSET Genesis Staking Calculator

## Brand Reference
Matching Real Finance staking site (staking.real.finance) exactly.

## Colors
```css
--bg-0: #0a0b0f        /* deepest background */
--bg-1: #0f1118        /* page background */
--bg-2: #141720        /* card background */
--bg-3: #1a1e2a        /* elevated card / input bg */
--surface-glass: rgba(255,255,255,0.04)
--surface-glass-strong: rgba(255,255,255,0.08)
--accent: #2050f2      /* Real Finance blue */
--accent-glow: rgba(32,80,242,0.4)
--text: #ffffff
--text-dim: rgba(255,255,255,0.55)
--text-faint: rgba(255,255,255,0.3)
--line: rgba(255,255,255,0.08)
--line-strong: rgba(255,255,255,0.12)
--success: #30e000
--warn: #ffd641
--warn-soft: rgba(255,214,65,0.08)
--hot: #f24050
```

## Typography
- Font: System sans-serif stack — `-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`
- Display: uppercase, tight tracking (`tracking-[0.04em]` to `tracking-[0.06em]`)
- Body: 14px, relaxed line height
- Numbers: tabular, monospace feel — use `font-variant-numeric: tabular-nums`

## Layout
- Max width: 1080px centered
- Single page, vertically stacked sections
- Card-based panels with `border border-line-strong bg-bg-2 rounded-2xl`
- Generous padding: `p-8` to `p-10`

## Components

### Input
- Dark fill: `bg-bg-3 border border-line-strong`
- Focus: `border-accent` with subtle glow
- Text: white, placeholder dim
- Full width, tall hit area: `py-4 px-5`
- Monospace for address input

### Button (Primary)
- `bg-accent text-white uppercase tracking-[0.05em] font-medium`
- Hover: `bg-white text-bg-0`
- Transition: 200ms

### Stats Card
- Minimal: label (text-faint, uppercase, 11px), value (white, large)
- Dividers between stats: `border-r border-line`

### Result Panel
- Prominent USDC value: large white number, "USDC" label in accent
- Pool share %: secondary
- Accrued so far: smaller, text-dim
- Early exit warning in warn-soft box

### Live Badge
- Green dot with glow + "LIVE" text — `text-[11px] uppercase tracking-[0.06em]`

## Motion
- Fade + slide up on result reveal (CSS transition, 300ms)
- Loading spinner: simple rotating ring in accent color
- No excessive animations

## Anti-patterns to avoid
- No white backgrounds
- No rounded pill buttons (use `rounded-md`)
- No gradient text unless for $ASSET token name
