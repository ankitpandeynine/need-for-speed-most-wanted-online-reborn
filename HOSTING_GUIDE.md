# Need for Speed: Most Wanted (2005) — Complete Deployment, Cloud Hosting & Zero-Lag Guide

This document gives you the **exact, production-ready methods** to host **Need for Speed: Most Wanted (2005) Reborn** on **Vercel** and **GitHub Pages**, host the 1.4 GB game assets on the cloud for **$0 cost**, eliminate in-race network lag with OPFS pre-downloading, and connect PC gamepads and keyboard bindings.

---

## Architecture Summary ($0 Forever Plan)

| Resource | Size | Recommended Solution | Monthly Cost |
| :--- | :--- | :--- | :--- |
| **Web App Frontend & WebGPU Engine** | ~78 MB | **Vercel** or **GitHub Pages** | **$0.00** |
| **Security Headers (COOP / COEP)** | Embedded | `vercel.json` or `coi-serviceworker.js` | **$0.00** |
| **Cloud Game Assets (`CARS`, `TRACKS`, etc.)** | ~1.4 GB | **Cloudflare R2** or **GitHub Releases** | **$0.00** (0 Egress Fees) |
| **Offline Player Storage** | ~1.4 GB | **Browser OPFS (Origin Private File System)** | **$0.00** (Local Device Disk) |

---

## METHOD 1: Deploy on Vercel + Cloud Game Asset Hosting ($0 Cost)

Vercel is the recommended hosting platform because it supports native edge HTTP headers (`Cross-Origin-Opener-Policy` and `Cross-Origin-Embedder-Policy`), giving instant WebAssembly SharedArrayBuffer and WebGPU acceleration on initial page load.

### Part A: Host the 1.4 GB Game Assets on Cloudflare R2 ($0 Cost, 0 Egress)

> [!NOTE]
> Standard cloud providers (like AWS S3 or Google Cloud) charge **$0.09 per GB of egress bandwidth**, meaning if 1,000 players download your 1.4 GB game, AWS would bill you \$126.  
> **Cloudflare R2 provides 10 GB of storage free forever with $0.00 egress fees**, meaning unlimited players can download the game without you paying a single cent.

#### Step 1: Create a Cloudflare R2 Bucket
1. Sign up for a free account at [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. In the sidebar, click **R2 Object Storage**.
3. Click **Create bucket** and enter a name (e.g. `nfsmw-assets`).
4. Select location: **Automatic** (or closest to your players). Click **Create Bucket**.

#### Step 2: Enable Public Access & CORS
1. In your bucket page, click the **Settings** tab.
2. Scroll to **Public Access** and click **Connect Domain** (or enable **R2.dev subdomain** for a free instant URL like `https://pub-abcdef123456.r2.dev`).
3. Scroll down to **CORS Policy** and click **Add CORS Policy**. Paste the following JSON:
   ```json
   [
     {
       "AllowedOrigins": ["*"],
       "AllowedMethods": ["GET", "HEAD"],
       "AllowedHeaders": ["*"],
       "ExposeHeaders": ["ETag", "Content-Length", "Content-Type"],
       "MaxAgeSeconds": 86400
     }
   ]
   ```
4. Click **Save CORS policy**.

#### Step 3: Upload the Game Asset Pack to R2
Upload the contents of your Need for Speed: Most Wanted retail directory:
- `assets.json` (the file index generated in `mw-browser/public/nfsmw/assets.json`)
- `speed.exe`
- `00000000.256`
- `CARS/`
- `FRONTEND/`
- `GLOBAL/`
- `SOUND/`
- `TRACKS/`

You can drag-and-drop files directly in the Cloudflare R2 web dashboard, or use the high-speed AWS S3 CLI / `rclone`:
```bash
aws s3 sync "/Users/ankit/Downloads/ga/Need For Speed Most Wanted Black Edition" s3://nfsmw-assets \
  --endpoint-url https://<ACCOUNT_ID>.r2.cloudflarestorage.com
```

#### Step 4: Link Your R2 URL in `games.json`
Open [`mw-browser/public/games.json`](file:///Users/ankit/projects/mac-software/windows/needforspeedmw/mw-browser/public/games.json) and set your public R2 URL:
```json
{
  "id": "nfsmw",
  "title": "Need for Speed: Most Wanted",
  "executable": "speed.exe",
  "hostedAssets": "./nfsmw/assets.json",
  "assetBase": "https://pub-abcdef123456.r2.dev"
}
```

---

### Part B: Deploy the Web Application on Vercel

1. Push your repository to GitHub:
   ```bash
   git push origin main
   ```
2. Log in to [Vercel](https://vercel.com) using your GitHub account.
3. Click **Add New...** → **Project**.
4. Import your repository: `ankitpandeynine/need-for-speed-most-wanted-online-reborn`.
5. Vercel automatically detects the included [`vercel.json`](file:///Users/ankit/projects/mac-software/windows/needforspeedmw/vercel.json):
   - **Build Command**: `cd mw-browser && npm install && npm run build`
   - **Output Directory**: `mw-browser/dist`
   - **Headers**: Configured with `Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Embedder-Policy: require-corp`.
6. Click **Deploy**. In ~45 seconds, your game is live globally at `https://your-project.vercel.app`!

---

## METHOD 2: Deploy for Free on GitHub Pages ($0 Cost)

GitHub Pages provides unlimited free static hosting directly from your GitHub repository.

### Step 1: Enable GitHub Pages with GitHub Actions
1. Go to your repository on GitHub:
   `https://github.com/ankitpandeynine/need-for-speed-most-wanted-online-reborn`
2. Click **Settings** → **Pages** (in the left sidebar).
3. Under **Build and deployment** → **Source**, change from "Deploy from a branch" to:
   👉 **GitHub Actions**

### Step 2: Push to Trigger the Deployment Workflow
The repository already includes [`.github/workflows/deploy.yml`](file:///Users/ankit/projects/mac-software/windows/needforspeedmw/.github/workflows/deploy.yml). When you push to `main`:
1. GitHub Actions automatically installs Node.js 20.
2. It builds `@nfsmw/mod-platform` and tests all EA chunk parsers.
3. It builds `@nfsmw/browser` with Vite.
4. It publishes `mw-browser/dist` to GitHub Pages at:
   `https://ankitpandeynine.github.io/need-for-speed-most-wanted-online-reborn/`

### Step 3: How Cross-Origin Isolation Works on GitHub Pages
Standard GitHub Pages does not allow custom response headers.  
This project includes [`mw-browser/public/coi-serviceworker.js`](file:///Users/ankit/projects/mac-software/windows/needforspeedmw/mw-browser/public/coi-serviceworker.js). On the user's first visit, the service worker registers in ~50ms, intercepts outgoing requests to inject COOP/COEP headers, and reloads once. WebAssembly, WebGPU, and SharedArrayBuffer work immediately at $0 cost!

---

## Eliminating Low-Network Lag: Pre-Downloading Maps & Offline Mode

When playing over slow, jittery, or mobile internet, streaming tracks on-the-fly over HTTP can cause frame drops and pauses. The engine provides three solutions:

### 1. "0-Lag Offline Launch" (Pre-Download Before Playing)
- On the **Play Dashboard** or **Game Assets** tab, click **"0-Lag Offline Launch"** or **"Pre-Download Full Game (1.4 GB) to OPFS"**.
- The browser downloads all tracks, cars, sounds, and textures up front into the browser's persistent **Origin Private File System (OPFS)**.
- Once downloaded, the game runs **100% locally from your device disk** with zero internet requests and zero lag!

### 2. Automatic Background Asset Downloader
- If a player chooses "Start Engine / Play Now" immediately, the game starts with on-demand streaming.
- While the player drives around the starting district, an automatic **Background Web Worker** continuously downloads and commits all remaining tracks and cars into OPFS in the background!
- You can monitor the progress bar directly in the top HUD toolbar:  
  `⚡ Caching in background: 54% (750 MB / 1.4 GB)`.
- As soon as a file is cached in OPFS, the game engine reads it from local storage, eliminating subsequent streaming delays.

### 3. Instant Local Folder Import (Zero Cloud Hosting Needed)
- If you or your players already have the retail game files on your Mac or PC:
  1. Open the website.
  2. Click the **Game Assets** tab.
  3. Click **"Select Local Game Folder"**.
  4. Select your `Need For Speed Most Wanted Black Edition` folder.
  5. The browser indexes the files into OPFS in ~15 seconds. You can now launch and play the entire game 100% offline without uploading or downloading anything!

---

## Hardware Input: Keybindings, Gamepads & ESC Key

### 1. Escape Key in Fullscreen (Fixed)
- In standard web browsers, pressing `Escape` in fullscreen causes the browser to exit fullscreen mode.
- We utilize the modern **W3C Keyboard Lock API** (`navigator.keyboard.lock(['Escape'])`) when fullscreen is enabled.
- Pressing `Escape` opens the authentic **Need for Speed: Most Wanted in-game pause/options menu** without exiting fullscreen!
- You can also press **`P`** or click the **"Menu (Esc)"** button on the HUD toolbar.
- To exit fullscreen, press **`F`** or click "Exit Fullscreen".

### 2. PC Keyboard Keybindings
- In the **Controls & Hardware** tab, you can customize every in-game action:
  - **Accelerate (Gas)**: Up Arrow / W
  - **Brake / Reverse**: Down Arrow / S
  - **Steer Left / Right**: Left / Right / A, D
  - **Nitrous (NOS)**: Left Shift / X
  - **Handbrake**: Spacebar
  - **Speedbreaker**: G Key
  - **Camera**: C Key
  - **Reset Car**: R Key
  - **Pause**: Escape / P
- Click any action in the table to rebind to your preferred key. Binds are saved in your browser's `localStorage`.

### 3. Controller & Gamepad Connectivity
- Supports all standard USB and Bluetooth gamepads (Xbox Series/One, PlayStation DualSense/DualShock, Nintendo Switch Pro, generic PC controllers):
  - **Right Trigger (RT / R2)**: Accelerate (Gas)
  - **Left Trigger (LT / L2)**: Brake / Reverse
  - **Left Stick**: Smooth 360° Steering
  - **Button A / Cross**: Nitrous (NOS Boost)
  - **Button X / Square**: Handbrake (Drift Initiation)
  - **Button B / Circle**: Speedbreaker
  - **Button Y / Triangle**: Switch Camera
  - **Start / Options**: In-Game Pause Menu (Escape)
  - **Back / Share**: Reset Car

---

## Online Multiplayer Rooms

1. Click the **Multiplayer** tab in the navigation bar.
2. **Create Room**: Choose a room name, track (Rosewood, Camden Turnpike, Downtown Rockport, Ocean Drive), game mode (Sprint, Circuit, Pursuit Tag), and max players. You will receive a unique 6-character room code (e.g. `ROCK99`).
3. **Join Room**: Enter any room code to enter the lobby.
4. **Lobby Features**:
   - Live connected player list with ping indicator, driver callsign, and car model.
   - Real-time in-lobby chat with pre-baked police radio taunts.
   - P2P WebRTC mesh and BroadcastChannel telemetry synchronization.
5. Click **"Start Race"** to launch into the room grid!

---

## Game Assets Setup & Mod Management Architecture

This web application operates as a **100% serverless, zero-egress architecture**. The browser itself manages the game engine, file system, asset caching, and mod injection client-side using WebGPU, WebAssembly, and the Origin Private File System (OPFS).

### 1. Where to Set Up the Game Files

You have three options for providing the authentic Need for Speed: Most Wanted (2005) game assets:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        GAME ASSET SETUP OPTIONS                        │
├────────────────────────────┬────────────────────────────┬──────────────┤
│ METHOD                     │ STORAGE LOCATION           │ BANDWIDTH    │
├────────────────────────────┼────────────────────────────┼──────────────┤
│ 1. Cloudflare R2 ($0)      │ Cloud Object Storage       │ Free / 0 fee │
│ 2. GitHub Releases ($0)    │ GitHub CDN Releases        │ Free / 0 fee │
│ 3. Local Folder Import ($0)│ Player's Local Hard Drive  │ 100% Offline │
└────────────────────────────┴────────────────────────────┴──────────────┘
```

#### Option A: Cloudflare R2 (Recommended for Public Websites)
* **Cost**: $0.00 forever (Cloudflare R2 provides 10 GB storage and **0 egress fees**).
* **Setup**:
  1. Create a bucket `nfsmw-assets` on the [Cloudflare Dashboard](https://dash.cloudflare.com/).
  2. Enable public read access and paste the CORS policy from [Part A](#part-a-host-the-14-gb-game-assets-on-cloudflare-r2-0-cost-0-egress).
  3. Upload the retail game folders (`CARS/`, `TRACKS/`, `GLOBAL/`, `SOUND/`, `MOVIES/`, and `speed.exe`).
  4. In [`mw-browser/public/games.json`](mw-browser/public/games.json), set `assetBase` to your public R2 URL (`https://pub-xxx.r2.dev`).
  5. When players visit the website, assets stream on demand and are permanently saved to their local browser OPFS cache.

#### Option B: GitHub Releases (Zero Setup Required)
* **Cost**: $0.00 forever.
* **Setup**:
  1. Zip your game assets into chunks under 2 GB (e.g. `nfsmw-tracks.zip`, `nfsmw-cars.zip`).
  2. Go to your GitHub repository → **Releases** → **Draft a new release**.
  3. Upload the zip files as release assets and publish.
  4. Set `assetBase` in `games.json` to `https://github.com/ankitpandeynine/need-for-speed-most-wanted-online-reborn/releases/download/v1.0.0`.

#### Option C: Instant Local Folder Import (No Cloud Storage Needed)
* **Cost**: $0.00 (Zero hosting overhead).
* **Setup**:
  1. Open the hosted website on any device.
  2. Click the **Game Assets** tab in the navigation bar.
  3. Click **"Select Local Game Folder"** and pick your existing PC retail installation of Need for Speed Most Wanted.
  4. The browser copies the files directly into the browser's OPFS sandbox (`/opfs/nfsmw/game/`) in ~15 seconds.
  5. The player can play the full game completely offline without uploading a single file to any server.

---

### 2. Major Pre-Packaged Mods (Included Out of the Box)

The website includes pre-packaged, validated mods in [`mw-browser/public/mods/`](mw-browser/public/mods/) that can be activated or deactivated with a single click:

| Mod Name | Version | Category | Description |
| :--- | :--- | :--- | :--- |
| **ThirteenAG Widescreen Fix** | v1.2.0 | HUD & UI | Authentic 16:9 / 21:9 / 32:9 widescreen FOV, corrected HUD aspect ratio, and borderless rendering. |
| **Xbox 360 Visuals & Prompts** | v2.1.0 | HUD & UI | Xbox 360 HUD icons, controller button prompts, and high-contrast speedometer. |
| **MW Eternal Overhaul** | v1.0.0 | Graphics & HUD | 11 custom HUDs (`HUDS_Custom_*.bin`), InGame/Global bundles, PlayStation/Xbox prompts, and lighting tweaks. |
| **NFSMW Remastered Graphics (RG v9.1)** | v9.1.0 | Graphics | Authentic DirectX 9 `IDI_*` shader bytecode objects, dynamic bloom, and enhanced lighting. |
| **NFS MW Redux 2026 4K Textures** | v3.0.0 | Graphics | 4K road tarmac, ultra-detailed building surfaces, and realistic skyboxes. |
| **EA HD Logos & Movie** | v1.0.0 | Audio & Cutscenes | Crystal clear 1080p EA startup vector animations and splash screens. |
| **NFSMW Extra Options** | v1.0.0 | Gameplay | Unlocks hidden police chases, debug cameras, and customization options. |

---

### 3. How Users Can Find & Add Any NFSMW Mod Themselves

Players are not limited to pre-packaged mods; they can download and inject any community mod:

#### Recommended Mod Repositories:
* **[NFSMods.xyz](https://nfsmods.xyz/search?game=1)**: The largest modern archive of NFSMW mods (car add-ons, replacements, scripts, and visual overhauls).
* **[NFSAddons.com](https://www.nfsaddons.com/downloads/nfsmw/)**: Classic repository with thousands of cars, vinyls, and handling profiles.
* **[NFSCars.net](https://www.nfscars.net/need-for-speed-most-wanted/)**: Historical modding archive.

#### How Users Inject Any Mod into the Hosted Web Game:
1. Open the hosted website and click the **Mods** tab.
2. Drag and drop any `.zip`, `.mwmod`, or extracted mod folder directly onto the page (or click **"Add Custom Mod"**).
3. The client-side mod unpacker analyzes the files:
   - **Automatic Validation**: Checks for real game assets. Empty archives or folders that only contain a `readme.txt` with external links are automatically rejected with an informative notice.
   - **Universal Path Normalization**: Detects ModLoader paths (`ADDONS/CARS_REPLACE/<CAR>/`), loose `.asi` / `.ini` scripts, global files (`GLOBAL/`), and shaders, mapping them automatically to their proper runtime locations.
   - **Compatibility Assessment**: Scores the mod for WebGPU compatibility. If the mod contains desktop Win32 hooks (`d3d9.dll`, `dinput8.dll`), the user receives an advisory notice with a **`⚡ FORCE MERGE & RUN ANYWAY`** button to inject all data files, textures, and shaders while bypassing desktop hooks.
4. Toggle the mod switch **ON**.
5. Click **"Launch Game"** — the website automatically merges all active mods into the game directory before starting the engine!

---

### 4. Client-Side Mod Injection Engine (Technical Deep Dive)

```
┌────────────────────────────────────────────────────────────────────────┐
│                   CLIENT-SIDE MOD INJECTION LIFECYCLE                  │
├────────────────────────────────────────────────────────────────────────┤
│ 1. USER UPLOADS MOD ARCHIVE (.zip, .mwmod, or folder)                  │
│    │                                                                   │
│    ▼                                                                   │
│ 2. CLIENT-SIDE UNPACKER & PATH NORMALIZER                              │
│    ├── ADDONS/CARS_REPLACE/<CAR>/...  ──►  /CARS/<CAR>/...             │
│    ├── Loose *.asi, *.ini, *.nfsms   ──►  /scripts/...                │
│    ├── IDI_* (DirectX 9 Shaders)      ──►  / (Executable Root)         │
│    ├── attributes.bin, gameplay.bin   ──►  /GLOBAL/...                 │
│    └── *.vp6 (Movies)                 ──►  /MOVIES/...                 │
│    │                                                                   │
│    ▼                                                                   │
│ 3. COMPATIBILITY ASSESSMENT                                            │
│    ├── 100% Compatible (Textures, BINs, BUNs, Shaders, Scripts)       │
│    └── Partial (Win32 DLL hooks bypassed with Force Merge option)     │
│    │                                                                   │
│    ▼                                                                   │
│ 4. OPFS MOD STORAGE (/opfs/nfsmw/mods/<mod_id>/)                      │
│    │                                                                   │
│    ▼                                                                   │
│ 5. AUTO-MERGE ON LAUNCH (autoMergeEnabledModsToOPFS)                  │
│    └── Injects active mods in layer order directly into                │
│        /opfs/nfsmw/game/ before WebGPU Recomp engine boots.            │
└────────────────────────────────────────────────────────────────────────┘
```

#### Why This Is Optimized for Hosted Websites:
* **Zero Server Overhead**: The hosting server (Vercel or GitHub Pages) only serves static JavaScript, HTML, and CSS. All mod unpacking, path rewriting, and file merging take place in the user's browser thread.
* **Instant Switching**: Players can enable or disable any combination of mods without re-downloading the base game.
* **Crash-Proof Isolation**: If a custom mod corrupts the game state, the player can click **"Restore Original Assets"** in the Mod Manager to cleanly reset `/opfs/nfsmw/game/` from the base cache in seconds.
* **Universal Settings & Progress Backup**: Players can click **"Export Universal Backup (.nfsmwcfg)"** in Controls & Hardware to download a single file containing all their controller binds, keybindings, touch placements, active mods, and career save files to restore on any other browser or device.
