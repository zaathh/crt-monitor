# zath-crt-monitor

A hardware-accelerated WebGL Cathode Ray Tube (CRT) monitor and vintage analog display simulation library for React.

[![npm version](https://img.shields.io/npm/v/zath-crt-monitor.svg?style=flat-square)](https://www.npmjs.com/package/zath-crt-monitor)
[![npm downloads](https://img.shields.io/npm/dm/zath-crt-monitor.svg?style=flat-square)](https://www.npmjs.com/package/zath-crt-monitor)
[![bundle size](https://img.shields.io/bundlephobia/minzip/zath-crt-monitor?style=flat-square)](https://bundlephobia.com/package/zath-crt-monitor)
[![license](https://img.shields.io/github/license/zaathh/crt-monitor.svg?style=flat-square)](./LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/zaathh/crt-monitor?style=flat-square)](https://github.com/zaathh/crt-monitor/stargazers)

---

## Overview

`zath-crt-monitor` encapsulates complex multi-pass GLSL post-processing shaders into a lightweight React component. It transforms any child DOM element (`<canvas>`, `<video>`, `<img>`, or standard HTML) into a realistic retro display with physical barrel curvature, phosphor grids, RGB chromatic aberration, scanlines, and glass reflections.

### Rendering Pipeline

```
  Child Element (Canvas / Video / Image)
                 │
                 ▼
  WebGL Texture Stream (texSubImage2D)
                 │
                 ▼
  GLSL Shader Pipeline
  ├── Barrel Distortion (Spherical Fish-eye Warp)
  ├── RGB Chromatic Aberration (Radial Color Fringing)
  ├── Scanline Generation (Configurable Spacing & Opacity)
  ├── Shadow Mask / Aperture Grille (Phosphor Dot Grid)
  ├── Analog Vignette & Edge Roll-off
  └── Specular Glass Reflection & Glare
                 │
                 ▼
         Output Display (60 FPS)
```

---

## Key Highlights

- **Hardware Accelerated**: Custom WebGL render loop utilizing direct GLSL fragment shaders.
- **Zero React Overhead**: Renders on a dedicated `requestAnimationFrame` loop without triggering React component reconciliations.
- **Smart Uniform Caching**: Only uploads updated shader uniforms to the GPU when properties change, reducing GPU driver calls by up to 94%.
- **Lifecycle Resource Management**: Suspends rendering automatically when the component leaves the viewport via `IntersectionObserver` or when the browser tab is hidden via the Page Visibility API.
- **Interactive Coordinate Mapping**: Exports an `unwarpCoords` utility and `onScreenClick` callback to accurately map pointer clicks through the curved screen geometry back to original coordinates.
- **Zero Runtime Dependencies**: Pure WebGL implementation with no third-party rendering engines required.

---

## Installation

```bash
npm install zath-crt-monitor
```

```bash
pnpm add zath-crt-monitor
```

```bash
yarn add zath-crt-monitor
```

---

## Quick Start

### Basic Implementation

Wrap any renderable target with `<CRTScreen />`:

```tsx
import React from 'react';
import { CRTScreen } from 'zath-crt-monitor';

export function ArcadeMonitor() {
  return (
    <div style={{ width: 800, height: 600 }}>
      <CRTScreen preset="ARCADE" width="100%" height="100%">
        <canvas id="game-canvas" width={800} height={600} />
      </CRTScreen>
    </div>
  );
}
```

### Granular Prop Overrides

Override specific effect parameters directly without mutating preset definitions:

```tsx
import React from 'react';
import { CRTScreen } from 'zath-crt-monitor';

export function CustomMonitor() {
  return (
    <CRTScreen
      preset="RETRO TV"
      width="100%"
      height="100%"
      screenWarp={{ bulge: 0.35, edgeDarken: 0.15 }}
      scanlines={{ opacity: 0.22, lineSpacing: 2 }}
      screenGlare={{ size: 0.6, opacity: 0.4 }}
    >
      <video src="/content.mp4" autoPlay loop muted />
    </CRTScreen>
  );
}
```

### Interactive Canvas & Click Unwarping

Because barrel distortion curves screen geometry, screen-space clicks do not correspond to flat canvas coordinates. Use `onScreenClick` to retrieve the unwarped coordinates:

```tsx
import React, { useRef } from 'react';
import { CRTScreen, type CRTScreenHandle } from 'zath-crt-monitor';

export function InteractiveRetroGame() {
  const monitorRef = useRef<CRTScreenHandle>(null);

  const handleScreenClick = (coords: { x: number; y: number }, e: React.MouseEvent) => {
    // coords.x and coords.y are mapped directly to original unwarped canvas space
    console.log('Unwarped click at:', coords.x, coords.y);
  };

  return (
    <CRTScreen
      ref={monitorRef}
      preset="ARCADE"
      width={800}
      height={600}
      onScreenClick={handleScreenClick}
    >
      <canvas id="game" width={800} height={600} />
    </CRTScreen>
  );
}
```

---

## Presets Reference

The library includes 9 carefully calibrated display profiles:

| Preset Name | Target Aesthetic | Characteristics |
| :--- | :--- | :--- |
| `ARCADE` | 1980s Coin-op Arcade Cabinet | Pronounced barrel warp, deep scanlines, subtle RGB fringing. |
| `RETRO TV` | Consumer 90s CRT Television | Warm phosphor grille, mild curvature, soft scanlines. |
| `BROADCAST PVM` | Sony Trinitron / Studio Monitor | Razor-sharp phosphors, flat face, minimal geometric distortion. |
| `VHS TAPE` | Magnetic Analog Tape | Tracking artifacts, chromatic bleed, horizontal sync rolls. |
| `COMMODORE` | 1980s 8-bit Home Computer | High contrast, dense scanline structure, phosphor dot grid. |
| `TERMINAL` | Green Monochrome Mainframe | P1 phosphor green tint, high contrast, subtle persistence. |
| `AMBER CRT` | Amber Monochrome Terminal | P4 phosphor amber glow, soft edge roll-off. |
| `CYBERPUNK` | Futuristic Analog Interface | Aggressive chromatic aberration, glitch tearing, vivid fringes. |
| `MILD` | Modern Web Application | Minimal distortion suitable for production portfolios and dashboards. |

---

## API Reference

### Component Props (`CRTScreenProps`)

| Property | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `preset` | `PresetName` | `'ARCADE'` | Preset configuration template to apply. |
| `settings` | `CRTSettings` | `undefined` | Full custom configuration object. Overrides `preset`. |
| `screenWarp` | `Partial<ScreenWarpSettings>` | `undefined` | Barrel curvature controls (`bulge`, `edgeDarken`, `enabled`). |
| `monitorBezel` | `Partial<MonitorBezelSettings>` | `undefined` | CRT chassis frame controls (`thickness`, `bezelColor`, `enabled`). |
| `scanlines` | `Partial<ScanlinesSettings>` | `undefined` | Scanline configuration (`opacity`, `lineSpacing`, `enabled`). |
| `chromaticAberration` | `Partial<ChromaticAberrationSettings>` | `undefined` | RGB offset parameters (`shiftAmount`, `enabled`). |
| `phosphorDotGrid` | `Partial<PhosphorDotGridSettings>` | `undefined` | Phosphor matrix parameters (`opacity`, `enabled`). |
| `vignette` | `Partial<VignetteSettings>` | `undefined` | Corner vignette shading (`strength`, `roundness`, `falloff`, `color`). |
| `screenGlare` | `Partial<ScreenGlareSettings>` | `undefined` | Glass specular highlight (`opacity`, `size`, `positionX`, `positionY`). |
| `animations` | `Partial<AnimationSettings>` | `undefined` | Real-time animations (`glitch`, `jitter`, `flicker`, `scanlineRoll`, `staticNoise`). |
| `enabled` | `boolean` | `true` | When set to `false`, shader passes are bypassed. |
| `width` | `number \| string` | `'100%'` | Width of the screen container. |
| `height` | `number \| string` | `'100%'` | Height of the screen container. |
| `onScreenClick` | `(coords, event) => void` | `undefined` | Callback invoked with geometrically unwarped `{ x, y }` coordinates. |
| `className` | `string` | `''` | Optional CSS class name for container. |
| `style` | `React.CSSProperties` | `{}` | Optional inline styles for container. |

---

## Performance Considerations

| Metric | Before Optimization | After Optimization | Impact |
| :--- | :--- | :--- | :--- |
| DOM Lookups | 60/sec | 0/sec | Cached element references |
| Per-frame Allocations | 120 objects/sec | 0 objects/sec | Zero garbage collection spikes |
| `gl.uniform` Updates | 1,920 calls/sec | 120 calls/sec | 94% reduction via dirty checking |
| Texture Streaming | Full texture realloc | `texSubImage2D` in-place | Continuous buffer reuse |
| Background Tab CPU | 100% active | 0% | Suspended via Page Visibility API |
| Off-screen Viewport CPU | 100% active | 0% | Suspended via IntersectionObserver |

---

## Local Development

```bash
# Clone the repository
git clone https://github.com/zaathh/crt-monitor.git
cd crt-monitor

# Install dependencies
pnpm install

# Run the interactive demo suite
pnpm dev

# Build production bundle
pnpm run build:lib
```

---

## License

This project is licensed under the MIT License. See [LICENSE](./LICENSE) for details.
