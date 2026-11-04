import React, { useState, useEffect } from 'react';
import {
  Play,
  HardDrive,
  Zap,
  ShieldCheck,
  ChevronRight,
  Users,
  DownloadCloud,
  Gamepad2,
  Sparkles,
  Download,
  CheckCircle2,
} from 'lucide-react';
import { GameSettings, StorageStatus } from '../types';

interface DashboardProps {
  onStartGame: (offlinePreload?: boolean) => void;
  settings: GameSettings;
  storage: StorageStatus;
  activeModsCount?: number;
  onOpenMods: () => void;
  onOpenControls: () => void;
  onOpenMultiplayer: () => void;
  onOpenSettings: () => void;
  onOpenStorage: () => void;
  webGpuName?: string;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onStartGame,
  settings,
  storage,
  activeModsCount = 0,
  onOpenMods,
  onOpenControls,
  onOpenMultiplayer,
  onOpenSettings,
  onOpenStorage,
  webGpuName,
}) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [pwaInstalled, setPwaInstalled] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      (window as any).deferredInstallPrompt = e;
    };
    window.addEventListener('beforeinstallprompt', handler);
    if ((window as any).deferredInstallPrompt) {
      setDeferredPrompt((window as any).deferredInstallPrompt);
    }
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallApp = async () => {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          setPwaInstalled(true);
        }
        setDeferredPrompt(null);
      } catch {}
    } else {
      const isIos = /iPhone|iPad|iPod/.test(navigator.userAgent);
      if (isIos) {
        alert('To add NFS Most Wanted to your Home Screen:\n1. Tap the Share button at the bottom of Safari.\n2. Tap "Add to Home Screen".');
      } else {
        alert('To install on Chrome / Edge:\nClick the "Install app" icon at the right of your address bar (or Menu ⋮ -> "Install Need for Speed").');
      }
    }
  };

  return (
    <div className="page-responsive-container">
      {/* Hero Banner - Authentic NFSMW 2005 Industrial Aesthetic */}
      <div
        className="glass-panel"
        style={{
          padding: 'clamp(24px, 4vw, 44px) clamp(20px, 3.5vw, 36px)',
          marginBottom: '28px',
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, rgba(20, 24, 34, 0.96) 0%, rgba(10, 13, 18, 0.99) 100%)',
          border: '1px solid #273042',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(245, 158, 11, 0.2)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: '-60px',
            width: '380px',
            height: '100%',
            background: 'linear-gradient(135deg, transparent 40%, rgba(245, 158, 11, 0.05) 50%, transparent 60%)',
            pointerEvents: 'none',
          }}
        />

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 'clamp(24px, 3.5vw, 48px)',
            position: 'relative',
            zIndex: 10,
            flexWrap: 'wrap',
          }}
        >
          {/* Left Column: Title, Badges, Details, Action Buttons */}
          <div style={{ flex: '1 1 540px', maxWidth: '780px' }}>
            {/* Badge Row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '16px' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '5px 14px',
                  borderRadius: '20px',
                  background: 'rgba(245, 158, 11, 0.12)',
                  border: '1px solid rgba(245, 158, 11, 0.35)',
                }}
              >
                <Zap size={14} color="#f59e0b" />
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: 800,
                    color: '#f59e0b',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                  }}
                >
                  WebGPU • 120 Hz Simulation • Real OPFS Mod Engine
                </span>
              </div>

              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '5px 12px',
                  borderRadius: '20px',
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#10b981',
                }}
              >
                <ShieldCheck size={14} />
                <span>Offline Ready</span>
              </div>
            </div>

            {/* Title */}
            <h1
              style={{
                fontSize: 'clamp(32px, 5vw, 48px)',
                fontWeight: 900,
                lineHeight: 1.1,
                marginBottom: '14px',
                color: '#ffffff',
                letterSpacing: '-0.02em',
              }}
            >
              NEED FOR SPEED <span style={{ color: '#f59e0b' }}>MOST WANTED</span>{' '}
              <span style={{ color: '#94a3b8', fontSize: 'clamp(22px, 3.2vw, 34px)', fontWeight: 800 }}>2005</span>
            </h1>

            <p style={{ color: '#94a3b8', fontSize: 'clamp(14px, 1.8vw, 16px)', marginBottom: '28px', lineHeight: 1.6 }}>
              Run the authentic 2005 Black Edition directly in modern desktop and mobile browsers ({webGpuName || 'WebGPU'} • {settings.resolution.toUpperCase()} 120 Hz).
              Community mods write directly to browser OPFS <code style={{ color: '#f59e0b', background: '#181e2b', padding: '2px 6px', borderRadius: '4px' }}>/opfs/nfsmw/game/</code> with seamless background asset downloading to prevent in-race lag.
            </p>

            {/* Action Buttons Row */}
            <div style={{ display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={() => onStartGame(false)}
                className="btn btn-primary"
                style={{
                  padding: '14px 34px',
                  fontSize: '15px',
                  fontWeight: 900,
                  letterSpacing: '0.06em',
                  boxShadow: '0 0 24px rgba(245, 158, 11, 0.45)',
                }}
              >
                <Play size={18} fill="#000" />
                START ENGINE / PLAY NOW
              </button>

              <button
                onClick={() => onStartGame(true)}
                className="btn btn-secondary"
                style={{
                  padding: '14px 22px',
                  fontSize: '14px',
                  fontWeight: 800,
                  borderColor: '#10b981',
                  color: '#10b981',
                  background: 'rgba(16, 185, 129, 0.1)',
                }}
                title="Pre-downloads all maps into local OPFS cache for 0 network lag"
              >
                <DownloadCloud size={17} color="#10b981" />
                0-Lag Offline Launch
              </button>

              <button
                onClick={handleInstallApp}
                className="btn btn-secondary"
                style={{
                  padding: '14px 20px',
                  fontSize: '14px',
                  fontWeight: 700,
                  borderColor: '#06b6d4',
                  color: '#06b6d4',
                  background: 'rgba(6, 182, 212, 0.1)',
                }}
                title="Adds app icon to your phone home screen or desktop app launcher"
              >
                {pwaInstalled ? <CheckCircle2 size={17} color="#10b981" /> : <Download size={17} color="#06b6d4" />}
                {pwaInstalled ? 'Installed to Home Screen' : '📲 Add Home Screen Shortcut'}
              </button>

              <button
                onClick={onOpenMods}
                className="btn btn-secondary"
                style={{
                  padding: '14px 20px',
                  fontSize: '14px',
                  fontWeight: 700,
                  borderColor: '#f59e0b',
                  color: '#f59e0b',
                }}
              >
                <Sparkles size={17} color="#f59e0b" />
                Mods Workshop ({activeModsCount} Active)
              </button>
            </div>
          </div>

          {/* Right Column: Authentic NFSMW BMW M3 GTR Cover Car Artwork Showcase */}
          <div
            className="hero-car-showcase"
            style={{
              flex: '0 0 auto',
              width: 'clamp(260px, 25vw, 340px)',
              margin: '0 auto',
              position: 'relative',
            }}
          >
            <div
              style={{
                position: 'relative',
                borderRadius: '16px',
                overflow: 'hidden',
                border: '2px solid rgba(245, 158, 11, 0.55)',
                boxShadow:
                  '0 20px 50px rgba(0, 0, 0, 0.85), 0 0 35px rgba(245, 158, 11, 0.3), 0 0 20px rgba(14, 165, 233, 0.25)',
                background: 'linear-gradient(135deg, #141b29 0%, #0c1018 100%)',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
              }}
              onClick={() => onStartGame(false)}
              title="Click to Launch Game with the legendary BMW M3 GTR"
            >
              {/* Top Banner Tag */}
              <div
                style={{
                  position: 'absolute',
                  top: '10px',
                  left: '10px',
                  zIndex: 2,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(9, 12, 18, 0.88)',
                  border: '1px solid #f59e0b',
                  borderRadius: '20px',
                  padding: '4px 10px',
                  fontSize: '11px',
                  fontWeight: 900,
                  color: '#f59e0b',
                  letterSpacing: '0.05em',
                  backdropFilter: 'blur(8px)',
                  boxShadow: '0 4px 14px rgba(0, 0, 0, 0.7)',
                }}
              >
                ★ BLACKLIST #1 TARGET
              </div>

              {/* The Car Cover Image */}
              <img
                src="/images/nfsmw-cover.png"
                alt="Need for Speed: Most Wanted (2005) - BMW M3 GTR"
                style={{
                  width: '100%',
                  height: 'auto',
                  display: 'block',
                  filter: 'contrast(1.06) saturate(1.05)',
                  transform: 'scale(1.01)',
                  transition: 'transform 0.35s ease',
                }}
              />

              {/* Bottom Specs Overlay */}
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  background: 'linear-gradient(0deg, rgba(8, 11, 16, 0.98) 0%, rgba(8, 11, 16, 0.82) 70%, transparent 100%)',
                  padding: '22px 14px 12px 14px',
                  backdropFilter: 'blur(4px)',
                }}
              >
                <div style={{ fontSize: '13.5px', fontWeight: 900, color: '#fff', letterSpacing: '0.04em' }}>
                  BMW M3 GTR (E46)
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '3px' }}>
                  <span style={{ fontSize: '11px', color: '#38bdf8', fontWeight: 700 }}>
                    4.0L P60B40 V8 • 500 HP
                  </span>
                  <span style={{ fontSize: '10.5px', color: '#f59e0b', fontWeight: 900 }}>
                    PLAY NOW ▶
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Essential Quick Cards (Responsive Fluid Grid) */}
      <div
        className="responsive-grid-2"
        style={{ marginBottom: '32px' }}
      >
        {/* Card 1: 1-Click Mod Workshop */}
        <div
          className="glass-panel"
          style={{
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            cursor: 'pointer',
            transition: 'border-color 0.2s',
            border: '1px solid rgba(245, 158, 11, 0.3)',
          }}
          onClick={onOpenMods}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <span style={{ color: '#94a3b8', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                COMMUNITY MODS
              </span>
              <Sparkles size={18} color="#f59e0b" />
            </div>

            <div style={{ fontSize: '19px', fontWeight: 800, color: '#fff', marginBottom: '6px' }}>
              Real OPFS Mod Engine
            </div>

            <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.5, marginBottom: '16px' }}>
              Install ThirteenAG Widescreen, Xbox 360 Visuals, 4K Redux, and Extra Options with real file override and automatic restore.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12.5px', borderTop: '1px solid #232b3c', paddingTop: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Installed Mods:</span>
                <span style={{ color: '#f59e0b', fontWeight: 700 }}>{activeModsCount} Real Mods Layered</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Custom Mods:</span>
                <span style={{ color: '#10b981', fontWeight: 700 }}>Native ZIP / .mwmod Unpacker</span>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '6px', color: '#f59e0b', fontSize: '13px', fontWeight: 700 }}>
            <span>Explore Mod Workshop</span>
            <ChevronRight size={15} />
          </div>
        </div>

        {/* Card 2: PC Keybindings & Touch Customizer */}
        <div
          className="glass-panel"
          style={{
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            cursor: 'pointer',
            transition: 'border-color 0.2s',
          }}
          onClick={onOpenControls}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <span style={{ color: '#94a3b8', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                HARDWARE & CONTROLS
              </span>
              <Gamepad2 size={18} color="#06b6d4" />
            </div>

            <div style={{ fontSize: '19px', fontWeight: 800, color: '#fff', marginBottom: '6px' }}>
              Keybindings, Gamepads & Touch Placement
            </div>

            <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.5, marginBottom: '16px' }}>
              Rebind PC keys, connect gamepads, or customize the exact placement and offsets of pedals & steering on touch screens.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12.5px', borderTop: '1px solid #232b3c', paddingTop: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Custom Placement:</span>
                <span style={{ color: '#06b6d4', fontWeight: 700 }}>Interactive Drag & Offsets</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Motion Steering:</span>
                <span style={{ color: '#10b981', fontWeight: 700 }}>Gyroscope Tilt Sensors</span>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '6px', color: '#06b6d4', fontSize: '13px', fontWeight: 700 }}>
            <span>Configure Controls & Placement</span>
            <ChevronRight size={15} />
          </div>
        </div>

        {/* Card 3: Online Multiplayer Rooms */}
        <div
          className="glass-panel"
          style={{
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            cursor: 'pointer',
            transition: 'border-color 0.2s',
          }}
          onClick={onOpenMultiplayer}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <span style={{ color: '#94a3b8', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                ONLINE MULTIPLAYER
              </span>
              <Users size={18} color="#3b82f6" />
            </div>

            <div style={{ fontSize: '19px', fontWeight: 800, color: '#fff', marginBottom: '6px' }}>
              Race in Private Rooms
            </div>

            <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.5, marginBottom: '16px' }}>
              Host or join multiplayer rooms with 6-character room codes. Synchronized telemetry, police pursuits & radio taunts.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12.5px', borderTop: '1px solid #232b3c', paddingTop: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Networking:</span>
                <span style={{ color: '#10b981', fontWeight: 700 }}>P2P WebRTC / Broadcast</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Modes:</span>
                <span style={{ color: '#3b82f6', fontWeight: 700 }}>Sprint, Circuit & Tag</span>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '6px', color: '#3b82f6', fontSize: '13px', fontWeight: 700 }}>
            <span>Join or Create Room</span>
            <ChevronRight size={15} />
          </div>
        </div>

        {/* Card 4: Storage & Offline Cache */}
        <div
          className="glass-panel"
          style={{
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            cursor: 'pointer',
            transition: 'border-color 0.2s',
          }}
          onClick={onOpenStorage}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <span style={{ color: '#94a3b8', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                LOCAL OPFS STORAGE
              </span>
              <HardDrive size={18} color="#10b981" />
            </div>

            <div style={{ fontSize: '19px', fontWeight: 800, color: '#fff', marginBottom: '6px' }}>
              Zero-Lag Asset Cache
            </div>

            <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.5, marginBottom: '16px' }}>
              Pre-downloads maps in the background to eliminate in-race stuttering, or sync from your local retail folder.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12.5px', borderTop: '1px solid #232b3c', paddingTop: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Storage Path:</span>
                <span style={{ color: '#06b6d4', fontWeight: 700 }}>/opfs/nfsmw/game/</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Executable:</span>
                <span style={{ color: storage.hasSpeedExe ? '#10b981' : '#f59e0b', fontWeight: 700 }}>
                  {storage.hasSpeedExe ? 'speed.exe Ready' : 'Download on Launch'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Offline Persistence:</span>
                <span style={{ color: '#10b981', fontWeight: 700 }}>Browser OPFS Active</span>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981', fontSize: '13px', fontWeight: 700 }}>
            <span>Manage Cache & Preload</span>
            <ChevronRight size={15} />
          </div>
        </div>
      </div>

      {/* Free Hosting & Open Source Notice */}
      <div
        className="glass-panel"
        style={{
          padding: '20px 24px',
          background: 'rgba(15, 20, 28, 0.7)',
          border: '1px solid #232b3c',
          borderRadius: '12px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <ShieldCheck size={22} color="#10b981" />
          <div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>
              100% Free Hosting on Vercel & GitHub Pages ($0 Cost)
            </div>
            <div style={{ fontSize: '12.5px', color: '#94a3b8' }}>
              Host the web app on Vercel/GitHub Pages and stream 1.4 GB game assets for free using Cloudflare R2 (0 egress fees).
            </div>
          </div>
        </div>

        <button
          onClick={onOpenSettings}
          className="btn btn-secondary"
          style={{ padding: '8px 18px', fontSize: '13px', fontWeight: 700, borderColor: '#f59e0b', color: '#f59e0b' }}
        >
          Graphics & Audio
        </button>
      </div>
    </div>
  );
};
