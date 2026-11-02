import React from 'react';
import { Play, HardDrive, Zap, ShieldCheck, ChevronRight, Users, DownloadCloud, Gamepad2 } from 'lucide-react';
import { GameSettings, StorageStatus } from '../types';

interface DashboardProps {
  onStartGame: (offlinePreload?: boolean) => void;
  settings: GameSettings;
  storage: StorageStatus;
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
  onOpenControls,
  onOpenMultiplayer,
  onOpenSettings,
  onOpenStorage,
  webGpuName,
}) => {
  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 20px' }}>
      {/* Hero Banner - Authentic NFSMW 2005 Industrial Aesthetic */}
      <div
        className="glass-panel"
        style={{
          padding: '40px 32px',
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
            width: '320px',
            height: '100%',
            background: 'linear-gradient(135deg, transparent 40%, rgba(245, 158, 11, 0.05) 50%, transparent 60%)',
            pointerEvents: 'none',
          }}
        />

        <div style={{ maxWidth: '750px', position: 'relative', zIndex: 10 }}>
          {/* Badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '5px 14px',
              borderRadius: '20px',
              background: 'rgba(245, 158, 11, 0.12)',
              border: '1px solid rgba(245, 158, 11, 0.35)',
              marginBottom: '16px',
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
              WebGPU • 120 Hz Simulation • Zero-Lag Offline Caching
            </span>
          </div>

          {/* Title */}
          <h1
            style={{
              fontSize: 'clamp(32px, 5vw, 44px)',
              fontWeight: 900,
              lineHeight: 1.1,
              marginBottom: '14px',
              color: '#ffffff',
              letterSpacing: '-0.02em',
            }}
          >
            NEED FOR SPEED <span style={{ color: '#f59e0b' }}>MOST WANTED</span>
          </h1>

          <p style={{ color: '#94a3b8', fontSize: '15.5px', marginBottom: '28px', lineHeight: 1.6 }}>
            Run the authentic 2005 Black Edition directly in modern desktop and mobile browsers ({webGpuName || 'WebGPU'} • {settings.resolution.toUpperCase()} 120 Hz).
            Now with background asset pre-downloading for zero-lag offline gameplay, PC key rebinding, gamepad controller support, and online multiplayer rooms.
          </p>

          {/* Big Action Buttons */}
          <div style={{ display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => onStartGame(false)}
              className="btn btn-primary"
              style={{
                padding: '14px 32px',
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
              onClick={onOpenMultiplayer}
              className="btn btn-secondary"
              style={{
                padding: '14px 20px',
                fontSize: '14px',
                fontWeight: 700,
                borderColor: '#06b6d4',
                color: '#06b6d4',
              }}
            >
              <Users size={17} color="#06b6d4" />
              Multiplayer Rooms
            </button>
          </div>
        </div>
      </div>

      {/* 3 Essential Quick Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px',
          marginBottom: '32px',
        }}
      >
        {/* Card 1: PC Keybindings & Gamepad */}
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
              <Gamepad2 size={18} color="#f59e0b" />
            </div>

            <div style={{ fontSize: '19px', fontWeight: 800, color: '#fff', marginBottom: '6px' }}>
              Keybindings & Gamepads
            </div>

            <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.5, marginBottom: '16px' }}>
              Rebind PC keys, connect Xbox / PlayStation controllers, or use mobile touch pedals & tilt steering.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12.5px', borderTop: '1px solid #232b3c', paddingTop: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>PC Keyboard:</span>
                <span style={{ color: '#f59e0b', fontWeight: 700 }}>Custom Rebinding Active</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Gamepad Support:</span>
                <span style={{ color: '#06b6d4', fontWeight: 700 }}>RT / LT & Dual Analogue</span>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '6px', color: '#f59e0b', fontSize: '13px', fontWeight: 700 }}>
            <span>Configure Keybinds & Gamepad</span>
            <ChevronRight size={15} />
          </div>
        </div>

        {/* Card 2: Online Multiplayer Rooms */}
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
              <Users size={18} color="#06b6d4" />
            </div>

            <div style={{ fontSize: '19px', fontWeight: 800, color: '#fff', marginBottom: '6px' }}>
              Race in Private Rooms
            </div>

            <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.5, marginBottom: '16px' }}>
              Host or join multiplayer rooms with 6-character room codes. Synchronized telemetry & real-time radio taunts.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12.5px', borderTop: '1px solid #232b3c', paddingTop: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Networking:</span>
                <span style={{ color: '#10b981', fontWeight: 700 }}>P2P WebRTC / BroadcastChannel</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Modes:</span>
                <span style={{ color: '#06b6d4', fontWeight: 700 }}>Sprint, Circuit & Pursuit Tag</span>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '6px', color: '#06b6d4', fontSize: '13px', fontWeight: 700 }}>
            <span>Join or Create Room</span>
            <ChevronRight size={15} />
          </div>
        </div>

        {/* Card 3: Storage & Offline Cache */}
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
                GAME ASSETS & OFFLINE CACHE
              </span>
              <HardDrive size={18} color="#10b981" />
            </div>

            <div style={{ fontSize: '19px', fontWeight: 800, color: '#fff', marginBottom: '6px' }}>
              OPFS Browser Storage
            </div>

            <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.5, marginBottom: '16px' }}>
              Pre-download maps to eliminate in-race stuttering on slow internet, or select your local game folder.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12.5px', borderTop: '1px solid #232b3c', paddingTop: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Asset Cache:</span>
                <span style={{ color: storage.hasSpeedExe ? '#10b981' : '#f59e0b', fontWeight: 700 }}>
                  {storage.hasSpeedExe ? 'Speed.exe Ready' : 'Download on Launch'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Offline Ready:</span>
                <span style={{ color: '#10b981', fontWeight: 700 }}>OPFS Persistent</span>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981', fontSize: '13px', fontWeight: 700 }}>
            <span>Manage Cache & Pre-Download</span>
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
              100% Free to Host on Vercel & GitHub Pages ($0 Cost)
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
