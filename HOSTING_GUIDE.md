# Need for Speed: Most Wanted (2005) — 100% Free Web Hosting & Asset Streaming Guide

This guide provides step-by-step instructions on how to host and run **Need for Speed: Most Wanted (2005) Reborn** on the web **completely for free ($0 cost)** for you and your players, with full mobile touch/gyroscope support and desktop controls.

---

## Architecture Overview & Zero-Cost Strategy

| Component | Size | Free Hosting Solution | Cost |
| :--- | :--- | :--- | :--- |
| **Frontend Launcher & WebGPU Engine** | ~78 MB | **GitHub Pages** or **Vercel** | **$0 / month** |
| **Cross-Origin Isolation (COOP/COEP)** | Embedded | `coi-serviceworker.js` or `vercel.json` | **$0 / month** |
| **Game Asset Files (`CARS`, `GLOBAL`, etc.)** | ~1.4 GB | **Local OPFS Import**, **Cloudflare R2**, or **GitHub Releases** | **$0 / month** |

---

## Method 1: Instant Local OPFS Import (Zero Cloud Storage Needed)

The simplest, fastest, and most private way to run the full game with authentic graphics, textures, and music is to import your existing retail copy into your browser's persistent storage (**Origin Private File System**).

### How It Works:
1. Open the website (e.g. `http://localhost:3000` or your deployed web address).
2. Go to the **Game Assets** tab in the navigation bar.
3. Click **"Import Game Folder"** (supported on Chrome, Brave, Edge, and Android Chrome).
4. Select your local game folder (e.g., `Need For Speed Most Wanted Black Edition`).
5. The browser will automatically scan and copy `speed.exe`, `CARS/`, `FRONTEND/`, `GLOBAL/`, `SOUND/`, and `TRACKS/` into the sandboxed OPFS storage.
6. Once completed (takes ~15-30 seconds), click **"START ENGINE / PLAY NOW"**.
7. The game runs **100% locally and offline** at full speed with zero server bandwidth consumed!

---

## Method 2: Hosting the Website for Free on Vercel (Recommended)

Vercel provides the fastest edge hosting with native HTTP headers for WebAssembly SharedArrayBuffer and WebGPU.

### Steps:
1. Push your repository to GitHub:
   ```bash
   git push origin main
   ```
2. Open [Vercel](https://vercel.com) and sign in with your GitHub account.
3. Click **"Add New..."** → **"Project"**.
4. Select your repository: `ankitpandeynine/need-for-speed-most-wanted-online-reborn`.
5. Vercel will automatically detect the configuration in `vercel.json`:
   - **Framework Preset**: Other / Vite
   - **Build Command**: `cd mw-browser && npm install && npm run build`
   - **Output Directory**: `mw-browser/dist`
6. Click **Deploy**.
7. In ~45 seconds, your site is live with a free SSL domain (e.g. `https://your-nfsmw.vercel.app`).
8. The included `vercel.json` already provides the necessary security headers:
   - `Cross-Origin-Opener-Policy: same-origin`
   - `Cross-Origin-Embedder-Policy: require-corp`
   - `Cross-Origin-Resource-Policy: cross-origin`

---

## Method 3: Hosting the Website for Free on GitHub Pages

GitHub Pages gives you unlimited free hosting directly from your GitHub repository.

### Steps:
1. Go to your repository on GitHub:
   `https://github.com/ankitpandeynine/need-for-speed-most-wanted-online-reborn`
2. Navigate to **Settings** → **Pages** (in the left sidebar).
3. Under **Build and deployment** → **Source**, select:
   👉 **GitHub Actions**
4. Push any commit to the `main` branch.
5. GitHub will automatically run the included workflow (`.github/workflows/deploy.yml`):
   - It builds `@nfsmw/mod-platform` and runs test suites.
   - It builds `@nfsmw/browser` with Vite.
   - It deploys the `mw-browser/dist` directory to your GitHub Pages URL:
     `https://ankitpandeynine.github.io/need-for-speed-most-wanted-online-reborn/`
6. **Cross-Origin Isolation on GitHub Pages**:
   - Because standard GitHub Pages does not allow custom HTTP response headers, this project includes `coi-serviceworker.js`.
   - On the first visit, the service worker automatically registers, intercepts requests to add COOP/COEP headers, and reloads once. WebAssembly, WebGPU, and SharedArrayBuffer work immediately!

---

## Method 4: Hosting Game Assets on Cloudflare R2 ($0 Cost, 0 Egress Fees)

If you want players to download or stream the authentic 1.4 GB game files without needing them to supply their own local folder, Cloudflare R2 is the optimal zero-cost cloud storage.

### Why Cloudflare R2?
- **10 GB Storage Free Forever** (NFSMW is only 1.4 GB).
- **$0 Bandwidth / Egress Fees**: Unlike AWS S3 or Google Cloud (which charge $0.09/GB on egress), Cloudflare R2 charges **$0.00 for egress bandwidth**, meaning thousands of users can download the game without you paying a single cent.

### Steps to Set Up Cloudflare R2:
1. Sign up for a free account at [Cloudflare](https://dash.cloudflare.com/).
2. In the dashboard sidebar, select **R2 Object Storage**.
3. Click **"Create bucket"** and name it (e.g. `nfsmw-assets`).
4. Under bucket **Settings**:
   - Set **Public Development URL** to **Enabled** (or connect a custom domain like `assets.yourdomain.com`).
   - Add a **CORS Policy** to allow browser requests:
     ```json
     [
       {
         "AllowedOrigins": ["*"],
         "AllowedMethods": ["GET", "HEAD"],
         "AllowedHeaders": ["*"],
         "MaxAgeSeconds": 86400
       }
     ]
     ```
5. Upload your game files:
   - Upload `assets.json` and the game folders (`CARS`, `FRONTEND`, `GLOBAL`, `SOUND`, `TRACKS`, `speed.exe`).
   - You can upload using the web drag-and-drop or with the `rclone` / `aws s3` CLI.
6. Update `mw-browser/public/games.json`:
   ```json
   {
     "hostedAssets": "./nfsmw/assets.json",
     "assetBase": "https://pub-xxxxxx.r2.dev"
   }
   ```
7. Rebuild and push to GitHub. Every player visiting your site will now stream and cache the authentic game directly from R2 at maximum speed with zero hosting bills!

---

## Pre-Configured Global Mirror (Works Out-Of-The-Box)

The repository's `games.json` is already configured with an active fallback CDN mirror:
```json
"assetBase": "https://cdn.justplayweb.com/nfsmw-pc13-20261010"
```
When a player opens the site, the browser first checks their local OPFS storage. If the game has not been imported yet, it automatically streams required files from this CDN and persists them in OPFS so subsequent launches are instantaneous.

---

## Mobile Touch & Gyroscope Controls Guide

The application includes native touch and motion sensors designed specifically for smartphones:

### Touch Pedals & Controls:
- **Gas / Front Key**: Accelerate (`ArrowUp`)
- **Brake / Back Key**: Reverse / Decelerate (`ArrowDown`)
- **Steer Left**: Steer Left (`ArrowLeft`)
- **Steer Right**: Steer Right (`ArrowRight`)
- **NOS Boost**: Nitrous oxide propulsion (`ShiftLeft` / `KeyX`)
- **E-Brake**: Handbrake drift initiation (`Space`)
- **Speedbreaker**: Bullet-time slow motion (`KeyG`)
- **Camera (C)**: Switch driving perspective
- **Reset (R)**: Reset car back onto the track
- **Pause / Menu**: Return to in-game options (`Escape`)

### Gyroscope Tilt Steering:
- Turn on **"Gyroscope Tilt Steering"** in the **Mobile & Controls** tab or in the in-game quick drawer.
- On iPhone (iOS), tap **"Enable Device Motion / Gyro"** to grant permission.
- Hold your phone in landscape mode and tilt left or right to steer smoothly.
- Customize **Sensitivity** (0.5x to 3.0x) and **Deadzone** (1° to 10°) to match your driving style.
- Use the **"Calibrate Zero"** button anytime to set your comfortable resting angle.

### Adaptive Orientation:
- **Landscape Mode**: Full-screen edge-to-edge game display with ergonomic translucent thumb pads on the left and right.
- **Portrait Mode**: 16:9 widescreen display at the top with a dedicated console-style gamepad deck at the bottom.
- **Customization**: Adjust button size (80%–150%), opacity (20%–100%), and swap sides for left-handed drivers.
