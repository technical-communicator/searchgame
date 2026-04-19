# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

"A Day with Search" is a single-session HTML5 game prototype using **p5.js**. The full specification lives in `SCF_Prototype_BuildSpec.docx`. The implementation is a **single `index.html` file** — no build system, no framework, no backend.

## Running the Game

Open `index.html` directly in a browser. No build step or server required.

The HTML file must set an `ASSET_BASE_URL` constant pointing to the GitHub raw content URL where the PNGs are hosted:
```js
const ASSET_BASE_URL = "https://raw.githubusercontent.com/[USERNAME]/[REPO]/main/";
```

## Architecture

### Technology
- **p5.js 1.9.0** via CDN: `https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.0/p5.min.js`
- **Canvas**: 390×844px (iPhone 14 portrait, mobile-first)
- **Interaction**: tap/click only

### Game State Machine

| State | Value | Description |
|-------|-------|-------------|
| INTRO | 0 | Title screen, Search sprite idle animation |
| MORNING | 1 | Three sequential dialogue choice screens |
| MAP | 2 | Search walks across scrolling background, venues appear |
| VENUE | 3 | Venue arrival animation with mascot |
| ENDCARD | 4 | Personality label shown, game ends |

### Player Stats (tracked, not displayed in prototype UI)

- **Energy** (0–2, starts at 1/Mid): sum of choice modifiers, clamped
- **Social Battery** (0–2, starts at 1/Mid): sum of choice modifiers, clamped
- **Vibe sub-type**: most frequent tag among choices (Cozy / Indie / Edgy / Artsy / Queer); ties favor the later choice

### Morning Choices (prototype has 3)

**Choice 1 — Breakfast:**
- Skip it → −1 Energy, Hunger flag
- Make at home → +1 Energy, Cozy vibe
- Grab on the way → +1 Energy, Indie vibe, +1 Social Battery

**Choice 2 — Music:**
- Lo-fi → Cozy/Indie vibe
- Indie punk → +1 Energy, Edgy vibe
- Pop → +1 Energy, Queer vibe, +1 Social Battery
- Classical/Ambient → −1 Energy, Artsy vibe, −1 Social Battery
- Podcast → +1 Energy, Indie vibe, −1 Social Battery

**Choice 3 — Outfit:**
- Cozy hoodie → +1 Energy, Cozy vibe
- Leather jacket → Edgy vibe, +1 Social Battery
- Vintage thrift → Artsy vibe
- Casual → +1 Energy
- Pride fit → Queer vibe, +1 Social Battery

### Venues (fixed order, 4 in prototype)

| Venue | Asset | Vibe | Floating Icons |
|-------|-------|------|----------------|
| Diablicos Coffee | `diablicos.png` | Artsy | ☕✨ float upward |
| Will's Pub | `wills.png` | Indie | ♪♫★ float & rotate |
| Syzn Thrift | `syzn.png` | Edgy | ✦⚡★ burst outward |
| Funky's Vintage | `funkys.png` | Indie | ✦♻👗 float upward |

### Animation Patterns

**Search sprite (main character):**
- Idle bob: `yOffset = sin(frameCount * 0.05) * 4`
- Walking tilt: `tilt = sin(frameCount * 0.2) * 0.05`
- Arrival pop: scale 1.0 → 1.2 → 1.0 over 20 frames

**Venue mascots:**
- Idle bob (phase-offset from Search): `yOffset = sin(frameCount * 0.05 + 1.0) * 4`
- Slide-in entrance from right over 30 frames

**Floating icons:**
- Spawn at random x near mascot, float up and fade over 60 frames
- New icon spawns every 20 frames while in VENUE state

**Scrolling background:**
- PNG ≥ 1200px wide, scrolls left as Search walks in MAP state

## Assets

| File | Description |
|------|-------------|
| `search.png` | Main character sprite (2000×2000px RGBA) |
| `diablicos.png` | Diablicos Coffee mascot |
| `wills.png` | Will's Pub mascot |
| `syzn.png` | Syzn Thrift mascot |
| `funkys.png` | Funky's Vintage mascot |

## Prototype Scope Limits

Not included in this prototype (reserved for production):
- Morning choices 4 & 5
- HUD stat bars
- Audio
- Instagram sharing
- Full 16-venue roster
- Venue routing logic based on computed stats
