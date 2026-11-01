# Need for Speed: Most Wanted (2005) — Browser Edition

A high-performance, browser-native platform engineering project bringing the classic 2005 PC Black Edition of **Need for Speed: Most Wanted** to modern web browsers through **Ahead-of-Time WebAssembly translation**, **WebGPU rendering**, and an **open modern modding ecosystem**.

---

## Architecture Overview

Rather than a simple one-off game port, this project is architected as an extensible **browser game platform** split into three decoupled subsystems:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        MW Browser Edition                              │
├────────────────────────────────────────────────────────────────────────┤
│ 1. User-Facing Platform (mw-browser)                                   │
│    • React 19 + TypeScript + Vite launcher & dashboard                 │
│    • Origin Private File System (OPFS) & IndexedDB asset manager       │
│    • Interactive mod manager (toggle, reorder, drag & drop)            │
│    • WebGPU settings (720p/1080p, 60/120 Hz, FOV, 1-16x AF)            │
│    • Gamepad API (Xbox 360 / PS2 layout) & keyboard mapping            │
├────────────────────────────────────────────────────────────────────────┤
│ 2. Universal Mod Runtime (mw-mod-platform)                             │
│    • Layered Virtual File System (VFS) with case-insensitive matching  │
│    • WebGPU HD Texture Replacer & injection pipeline                   │
│    • .mwmod packaging format with SHA-256 integrity checks             │
│    • EA Chunk (0x00030201/2) & TPK parser with bStringHash             │
├────────────────────────────────────────────────────────────────────────┤
│ 3. Core Recompilation Engine (mw-recomp)                               │
│    • Ahead-of-time x86 translation to C compiled to WebAssembly        │
│    • Direct3D 9 translated directly to WebGPU WGSL shaders             │
│    • Fixed 120 Hz vehicle physics & simulation rate                    │
│    • Widescreen view, aspect correction, and HUD repositioning         │
│    • Web Audio API sound playback via DirectSound shims                │
└────────────────────────────────────────────────────────────────────────┘
```

---

## Directory Structure

| Subsystem | Directory | Purpose |
| :--- | :--- | :--- |
| **Engine Recompilation** | `mw-recomp/` | Game recompilation, Direct3D 9 to WebGPU translation, and Emscripten runtime |
| **Universal Mod Platform** | `mw-mod-platform/` | Mod SDK, `.mwmod` packager CLI (`mwmod`), VFS overlay, and HD texture injector |
| **Browser Application** | `mw-browser/` | React launcher UI, OPFS storage manager, settings, and telemetry HUD |

---

## Current Status & Milestones

- [x] **Toolchain & Native Baseline:** AppleClang, CMake, Ninja, and Python 3.12 verified; native stub and macOS app build passed.
- [x] **WebAssembly & WebGPU Build Pipeline:** Emscripten 6.0.13 integrated with WebGPU WGSL shader generation and WasmFS LRU caching; `SpeedRecomp.wasm` builds cleanly.
- [x] **Streamed File & Scheduler Stalls Solved:** Kit updated to `8614a82` to release scheduler during chunked asset reads and skip 0x0 canvas presents.
- [x] **Universal Mod SDK (`mw-mod-platform`):**
  - Fully tested VFS overlay with priority layers and path normalization.
  - Native EA `bStringHash` implementation matching retail executable.
  - WebGPU HD Texture Replacer with runtime injection telemetry.
  - Starter HD visuals package (`hd-modern-visuals-1.0.0.mwmod`) packaged and tested.
- [x] **Modern Browser Platform (`mw-browser`):**
  - Cross-Origin Isolation headers (`COOP: same-origin`, `COEP: require-corp`) for multithreaded WASM.
  - Interactive launcher with WebGPU capability probing, OPFS file management, and real-time telemetry HUD.

---

## Getting Started

### Prerequisites
- macOS 14+ (tested on Apple Silicon M-series) or Linux / Windows
- Python 3.12+ with `uv`
- Homebrew with `emscripten` (or Emscripten SDK 6.0+)
- Node.js 20+ and npm

### 1. Build the Mod Platform
```bash
cd mw-mod-platform
npm install
npm run build
npm test
```

### 2. Run the Browser Platform
```bash
cd mw-browser
npm install
npm run dev
```
Open `http://localhost:3000` in Google Chrome or any WebGPU-capable browser.

### 3. Build the WebAssembly Game Engine (Stub / Game)
```bash
cd mw-recomp
PATH="$PWD/.venv/bin:/opt/homebrew/bin:$PATH" \
EMSDK="../.tools/emsdk" \
.venv/bin/python tools/build.py --target web --stub
```

---

## Mod Packaging with `mwmod` CLI

To package a custom mod into a `.mwmod` bundle:
```bash
node mw-mod-platform/bin/mwmod.js pack path/to/mod-folder output-mod.mwmod
node mw-mod-platform/bin/mwmod.js validate output-mod.mwmod
node mw-mod-platform/bin/mwmod.js hash "BMWM3_TEXTURES"
```

---

## Next Steps on the Technical Roadmap

1. **Race Loading Reliability:** Profile and benchmark 20 consecutive career and quick-race launches under WebAssembly worker threads.
2. **HD Texture Asset Integration:** Ingest and verify community 4K/2K texture packs for Black Edition tracks and cars.
3. **Vehicle Replacement Pipeline:** Geometry parser and material binding for replacing base vehicle slots with custom car models.
4. **Multiplayer Staged Rollout:** Phase 4 WebSocket lobby signaling, WebRTC DataChannels, and ghost-car time trial racing.

---

## License & Ownership

- Original Need for Speed: Most Wanted (2005) code and assets are the property of Electronic Arts Inc.
- No copyrighted game files or binaries are distributed with this repository.
- Recompilation engine and tooling are powered by [recomp-kit](https://github.com/veritr1x/recomp-kit).
- Browser platform and mod SDK are licensed under MIT.
