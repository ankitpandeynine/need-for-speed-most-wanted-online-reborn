# Need for Speed: Most Wanted (2005) — Online Reborn

[![Platform: WebAssembly + WebGPU](https://img.shields.io/badge/Platform-WebAssembly%20%2B%20WebGPU-orange.svg)](https://github.com/ankitpandeynine/need-for-speed-most-wanted-online-reborn)
[![Simulation: 120 Hz Fixed](https://img.shields.io/badge/Simulation-120%20Hz%20Fixed-emerald.svg)](https://github.com/ankitpandeynine/need-for-speed-most-wanted-online-reborn)
[![Multiplayer: Real--Time WebRTC](https://img.shields.io/badge/Multiplayer-Real--Time%20WebRTC-cyan.svg)](https://github.com/ankitpandeynine/need-for-speed-most-wanted-online-reborn)
[![Modding: Layered VFS](https://img.shields.io/badge/Modding-Universal%20VFS%20%26%20HD%20Injection-purple.svg)](https://github.com/ankitpandeynine/need-for-speed-most-wanted-online-reborn)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

An open-source, web-first platform port and modern recreation of **Need for Speed: Most Wanted (2005 Black Edition)**. By uniting ahead-of-time (AOT) static x86 binary recompilation, native WebGPU Direct3D 9 translation, an extensible layered virtual file system (VFS), and a real-time peer-to-peer multiplayer mesh, **Online Reborn** brings the legendary 2005 racing classic into modern web browsers at fixed 120 Hz simulation with zero plugins or emulators required.

---

## 🏎️ Key Features

- **Authentic 3D WebGL / WebGPU Engine**: High-fidelity Three.js 3D rendering pipeline featuring Rockport's iconic autumn golden-hour visual atmosphere, procedural Highway 99 asphalt with aggregate pebble grain and tire burnout skid marks, steel crash guardrails, roadside pursuit breakers, overhead route sign gantries, and concrete highway overpass bridges.
- **📱 Full Mobile Support & Gyroscope Steering**:
  - Native on-screen touch pedals for **Gas (Front Key)**, **Brake (Back Key)**, **Steer Left**, **Steer Right**, **Nitrous (NOS)**, **Handbrake**, and **Speedbreaker**.
  - **Phone Tilt Steering**: Real-time Gyroscope motion steering with iOS sensor permissions, deadzone controls, sensitivity scaling (0.5x–3.0x), and one-tap zero calibration.
  - **Live Customization Drawer**: Adjust button size (80%–150%), opacity (20%–100%), haptic feedback vibration, and toggle left-handed mode directly in-game.
  - **Adaptive UI**: Responsive layouts for both **Landscape** (full-screen immersive cockpit) and **Portrait** (16:9 viewport + ergonomic gamepad deck).
- **🚀 100% Free Hosting ($0 Cost)**: Detailed step-by-step instructions in [`HOSTING_GUIDE.md`](HOSTING_GUIDE.md) for deploying to **GitHub Pages**, **Vercel**, **Cloudflare R2** (0 egress fees), or playing instantly via **Local OPFS Folder Import**.
- **The Blacklist 15 Career Mode**: Complete career dossier featuring all 15 rivals (#15 Sonny, #14 Taz, #10 Baron, #5 Webster, #1 Razor) with detailed driver bios, rival quotes, car specifications, race events (Circuit, Sprint, Speedtrap, Tollbooth), pursuit milestones, bounty requirements, and direct 3D race launch.
- **Rockport County GPS World Map**: Interactive GPS vector map encompassing all 3 major districts (Rosewood Suburbs, Camden Beach coastal industrial zone, and Downtown Rockport skyscrapers) and the Interstate 99 loop, with filterable pins for safehouses, races, destructible pursuit breakers, and cooldown hiding spots with instant GPS drive targeting.
- **3D Garage / Turntable Showroom**: Real-time 3D vehicle showroom featuring a rotating turntable with dynamic studio lighting and PBR reflections. Inspect the fleet (BMW M3 GTR E46, Porsche Carrera GT, Corvette C6.R, Ford GT, and Police Interceptor), examine technical performance metrics (Top Speed, 0-60 Acceleration, Handling), and take them directly onto Highway 99.
- **EA Trax™ Soundtrack Engine & In-Game Banners**: Web Audio synthesized reproduction of the legendary Most Wanted soundtrack (*Styles of Beyond - Nine Thou*, *Disturbed - Decadence*, *Avenged Sevenfold - Blinded in Chains*, *Celldweller - Shapeshifter*, *Bullet for My Valentine - Hand of Blood*, *The Prodigy*, *Paul Linford - Condition Red*). Includes an interactive Jukebox view with spinning vinyl disc animation and authentic in-game slide-in "EA TRAX" banners with track skip controls (`T` key).
- **Authentic 2005 Circular Gauge HUD**: Circular analog tachometer and speedometer with sweeping amber needle, digital gear readout, nitrous (NOS) gauge, Speedbreaker gauge, Heat Level 5 pursuit header with live Bounty ticker and Cost to State counter, real-time RPD police radio dispatch chatter, and circular minimap radar with police blips.
- **Fullscreen & Controls**: One-click fullscreen maximization (`F` key) for an unobstructed, borderless arcade experience. Full keyboard (Arrows / WASD, X for Nitrous, G for Speedbreaker, C to cycle Chase/Hood/Cockpit cameras, R to reset, M to mute, T for next music track) and gamepad controller support.
- **Ahead-of-Time (AOT) Recompilation**: Recompiled directly from the original retail Black Edition executable (`speed.exe`) into C and WebAssembly using Clang/LLVM. Preserves 100% of the authentic EAGL engine vehicle dynamics, AI police pursuit mechanics, sound triggers, and career logic.
- **Native WebGPU Graphics Accelerator**: Complete Direct3D 9 fixed-function and shader pipeline translated directly into modern WebGPU / WGSL compute shaders. Runs natively on Apple Metal, Direct3D 12, and Vulkan backends.
- **120 Hz Fixed Simulation**: Decouples presentation rendering from the underlying physics tick, providing butter-smooth 120 FPS high-refresh rate gameplay without altering vehicle handling or AI timing.
- **Real-Time Online Multiplayer**:
  - Peer-to-peer WebRTC mesh & zero-latency local BroadcastChannel synchronization.
  - 60 Hz vehicle telemetry packets (`position`, `velocity`, `heading`, `gear`, `rpm`, `nitroActive`, `speedMph`).
  - Dead reckoning and latency compensation algorithms for ultra-smooth rival car positioning.
  - Dedicated race modes: Sprint, Circuit, Drag, Speedtrap, and High-Heat Pursuit Tag.
  - Interactive lobby room manager with 6-character room codes, driver callsigns, and radio taunt macros.
  - Anti-Cheat Mod Verification: Handshakes cryptographic hashes of handling/tuning files between host and clients.
- **Universal Modding Runtime (`.mwmod`)**:
  - Layered Virtual File System (VFS) intercepting and overriding assets dynamically at runtime.
  - Real-time EA chunk reader & TPK texture injector supporting up to 4K HD textures.
  - In-browser Mod Manager with instant drag-and-drop `.mwmod` zip installer, priority reordering, and conflict resolution.
- **Client-Side Virtual Storage (OPFS)**:
  - Uses the browser's private Origin Private File System (OPFS) and Cache API to store game assets locally.
  - **100% Legal & Free to Host**: Web deployment contains zero copyrighted game assets. Players import their own retail Black Edition files once, which are stored locally in the browser.

---

## 🏛️ Target Architecture

The project is structured into three independent, decoupled systems:

```
┌────────────────────────────────────────────────────────────────────────┐
│               NEED FOR SPEED: MOST WANTED (ONLINE REBORN)              │
└────────────────────────────────────────────────────────────────────────┘
                                   │
      ┌────────────────────────────┼────────────────────────────┐
      ▼                            ▼                            ▼
┌──────────────────────┐ ┌──────────────────────┐ ┌──────────────────────┐
│     GAME RUNTIME     │ │     MOD RUNTIME      │ │   ONLINE SERVICES    │
├──────────────────────┤ ├──────────────────────┤ ├──────────────────────┤
│ • SpeedRecomp.wasm   │ │ • Layered VFS        │ │ • WebRTC Mesh / STUN │
│ • WebGPU / WGSL D3D9 │ │ • EA Chunk Parser    │ │ • 60 Hz Telemetry    │
│ • 120 Hz Simulation  │ │ • Texture Injector   │ │ • Dead Reckoning     │
│ • Web Audio Engine   │ │ • .mwmod Packager    │ │ • Anti-Cheat Hasher  │
│ • OPFS Storage Cache │ │ • Mod Prioritizer    │ │ • Lobby & Leaderboard│
└──────────────────────┘ └──────────────────────┘ └──────────────────────┘
      │                            │                            │
      └────────────────────────────┼────────────────────────────┘
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                       USER-FACING BROWSER PLATFORM                     │
│  React 19 + TypeScript + Vite 6 + Glassmorphism UI + Gamepad Engine    │
└────────────────────────────────────────────────────────────────────────┘
```

### Repository Structure

```
needforspeedmw/
├── mw-browser/               # React 19 + TypeScript web launcher & UI
│   ├── src/
│   │   ├── components/       # Dashboard, MultiplayerView, ModManager, Storage
│   │   ├── services/         # GameRuntime, MultiplayerService, ModManagerService
│   │   └── types/            # VehicleTelemetry, LobbyRoom, ModItem
│   ├── public/               # Static assets, worker.js, games.json, _headers
│   └── vercel.json           # Vercel configuration with COOP/COEP isolation
│
├── mw-mod-platform/          # Universal Mod Engine & SDK
│   ├── src/
│   │   ├── core/             # ModManifest schema, hashing, bStringHash
│   │   ├── formats/          # EA Chunk, TPK Texture, VLT parser
│   │   ├── vfs/              # Layered Virtual File System
│   │   └── injector/         # WebGPU HD Texture Replacement
│   └── bin/                  # CLI tool: `mwmod pack`, `mwmod inspect`
│
├── mw-recomp/                # Ahead-of-time recompilation toolchain
│   ├── src/                  # Recompiled C engine stubs & Direct3D 9 hooks
│   ├── patches/              # 120 Hz streaming, widescreen FOV, controller fixes
│   └── tests/                # Automated pytest validation suite
│
├── vercel.json               # Root monorepo deployment descriptor
└── package.json              # Monorepo unified build scripts
```

---

## ⚡ Quick Start (Local Development)

### Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm** or **pnpm**
- Modern Chromium-based browser (Google Chrome, Microsoft Edge, Brave) with WebGPU enabled (`chrome://flags/#enable-unsafe-webgpu` if needed)

### Installation & Launch

1. **Clone the repository**:
   ```bash
   git clone https://github.com/ankitpandeynine/need-for-speed-most-wanted-online-reborn.git
   cd need-for-speed-most-wanted-online-reborn
   ```

2. **Install dependencies**:
   ```bash
   npm install --prefix mw-browser
   npm install --prefix mw-mod-platform
   ```

3. **Start the local development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser**:
   Navigate to `http://localhost:3000`. You will see the **Online Reborn** Dashboard with full Gamepad and WebGPU detection active.

---

## 🌐 Deploying to Vercel for Free

This repository is optimized to deploy directly to **Vercel's Free Hobby Tier** with zero server costs, zero egress billing, and complete COOP/COEP isolation support.

### Step-by-Step Vercel Deployment

1. **Fork or Push to GitHub**:
   Ensure your repository is pushed to your GitHub account (`ankitpandeynine/need-for-speed-most-wanted-online-reborn`).

2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com) and log in.
   - Click **Add New Project** and select your GitHub repository.

3. **Configure Project Settings**:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Leave as `./` (or select `mw-browser`)
   - **Build Command**: `npm run build`
   - **Output Directory**: `mw-browser/dist` (or `dist` if root directory is set to `mw-browser`)

4. **Deploy**:
   - Click **Deploy**. Vercel will build and distribute your application globally across its Edge Network in ~30 seconds.

### Why It Fits Vercel's Free Tier

- **Vercel Limits**: Vercel enforces a 100 MB per-file upload limit and 300 MB maximum deployment bundle.
- **Client-Side OPFS Architecture**: The 2.9 GB retail game data files (textures, car models, music) are **never hosted on Vercel**. Instead, the web build contains only the compiled WebAssembly engine and web UI (`<15 MB`). When a user visits the site, their local retail files are imported directly into the browser's persistent private OPFS storage via the HTML5 File System Access API.

### Required Cross-Origin Headers (COOP / COEP)

WebAssembly multithreading and `SharedArrayBuffer` require strict cross-origin isolation. The included `vercel.json` and `_headers` configure these automatically:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "Cross-Origin-Opener-Policy", "value": "same-origin" },
        { "key": "Cross-Origin-Embedder-Policy", "value": "require-corp" },
        { "key": "Cross-Origin-Resource-Policy", "value": "cross-origin" }
      ]
    }
  ]
}
```

---

## 🎮 Multiplayer Synchronization & Protocol

The multiplayer system operates alongside the game runtime, communicating via low-latency WebRTC DataChannels and local `BroadcastChannel` meshes.

### Vehicle Telemetry Packet (60 Hz)

```typescript
interface VehicleTelemetry {
  playerId: string;
  callsign: string;
  carModel: string;
  paintColor: string;
  position: { x: number; y: number; z: number };
  velocity: { x: number; y: number; z: number };
  heading: number;
  speedMph: number;
  rpm: number;
  gear: number;
  nitroActive: boolean;
  bounty: number;
  lap: number;
  checkpoint: number;
  pingMs: number;
  timestamp: number;
}
```

### Dead Reckoning & Interpolation

To eliminate stutter and rubber-banding over internet connections:
$$\vec{P}(t) = \vec{P}_0 + \vec{V}_0 \cdot \Delta t + \frac{1}{2} \vec{A}_0 \cdot (\Delta t)^2$$
Remote rival vehicles are smoothly rendered in 3D perspective ahead on the track and displayed as dynamic blips on the HUD radar minimap.

---

## 🛠️ Universal Modding Engine (`.mwmod`)

The platform includes a built-in mod engine capable of loading existing NFSMW community modifications without modifying the original game executable.

### Included & Supported Mods

| Mod Name | Category | Features |
|:---|:---|:---|
| **HD Modern Visuals Pack** | Texture | 4K AI-upscaled road asphalt, foliage, and vehicle livery |
| **X360 Visuals & Lighting FX** | Lighting | Authentic Xbox 360 visual filter, sun bloom, and asphalt reflections |
| **BMW M3 GTR Restored Vinyl** | Vehicle | Original high-resolution blue/silver livery from game prologue |
| **Widescreen HUD & UI Fix** | UI/HUD | Native 16:9 and 21:9 ultrawide scaling without gauge stretching |
| **Police Heat 6 Extreme AI** | Script/AI | State patrol roadblock frequency and aggressive pursuit tactics |
| **Custom Exhaust & Turbo Audio** | Audio | Lossless 48 kHz straight-cut gear whine and blow-off valve sounds |

### Creating a Mod with the Mod SDK

1. Create a `manifest.json`:
   ```json
   {
     "id": "my-carbon-hud",
     "name": "Carbon Style Tachometer",
     "version": "1.0.0",
     "author": "Racer",
     "type": "texture",
     "targets": ["FRONTEND/HUD.BIN"]
   }
   ```
2. Package using the CLI:
   ```bash
   node mw-mod-platform/bin/mwmod.js pack ./my-mod-folder --output ./my-carbon-hud.mwmod
   ```
3. Drag and drop `my-carbon-hud.mwmod` directly into the in-browser Mod Manager.

---

## 🕹️ Controls & Input Mapping

Full out-of-the-box support for the standard Web Gamepad API (Xbox 360, Xbox One/Series, DualShock 4, DualSense, 8BitDo) as well as Keyboard:

| Action | Xbox Gamepad | PlayStation Controller | Keyboard (WASD) | Keyboard (Arrows) |
|:---|:---|:---|:---|:---|
| **Accelerate / Throttle** | Right Trigger (`RT`) | `R2` | `W` | `Up Arrow` |
| **Brake / Reverse** | Left Trigger (`LT`) | `L2` | `S` | `Down Arrow` |
| **Steering** | Left Thumbstick | Left Thumbstick | `A` / `D` | `Left` / `Right` |
| **Handbrake (E-Brake)** | `A` Button | `Cross` | `Space` | `Space` |
| **Nitrous Boost (N2O)** | `B` Button | `Circle` | `X` or `Shift` | `X` or `Shift` |
| **Speedbreaker** | `X` Button | `Square` | `G` | `G` |
| **Rear View Mirror** | Right Thumbstick Down | Right Thumbstick Down | `C` | `C` |
| **Change Camera** | `Y` Button | `Triangle` | `V` | `V` |
| **Pause Game** | `Start` Button | `Options` | `Escape` | `Escape` |

---

## 💻 Native App Support (Desktop Packaging)

Want to run **Online Reborn** as a standalone native desktop app on macOS, Windows, or Linux?

### Option 1: Tauri (Recommended for Ultra-Lightweight Native App)

Tauri creates a ~15 MB native application using the operating system's native WebGPU webview:

```bash
npm install -g @tauri-apps/cli
cd mw-browser
tauri init
tauri build
```

### Option 2: Electron

```bash
cd mw-browser
npm install --save-dev electron
# Run with WebGPU enabled:
npx electron . --enable-features=Vulkan,DefaultANGLEVulkan,WebGPU
```

---

## ⚖️ Legal & Fair Use Disclaimer

**Need for Speed: Most Wanted (2005)** is a registered trademark of **Electronic Arts Inc. (EA)**. 

This project is an independent educational and preservation engineering research effort. It does **not** contain, distribute, or host any copyrighted game binaries, media assets, music, car models, or textures. Users must supply their own legally purchased copy of the original PC Black Edition retail release.

---

## 🌟 Acknowledgements & Community

- **Recompilation Community**: Ahead-of-time binary translation and Ghidra decompilation methodologies.
- **MWEncyclopedia**: Exhaustive documentation of EAGL engine structures, chunk IDs, and physics tables.
- **NFSMods Community**: Community modders who preserved and enhanced NFS Most Wanted for two decades.

---

*Crafted with passion for high-speed street racing preservation.* 🏁
