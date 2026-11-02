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
