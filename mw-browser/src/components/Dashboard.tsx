import React from 'react';
import { Play, Smartphone, Sliders, HardDrive, Zap, ShieldCheck, ChevronRight } from 'lucide-react';
import { GameSettings, StorageStatus } from '../types';

interface DashboardProps {
  onStartGame: () => void;
  settings: GameSettings;
  storage: StorageStatus;
  onOpenControls: () => void;
  onOpenSettings: () => void;
  onOpenStorage: () => void;
  webGpuName?: string;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onStartGame,
  settings,
  storage,
  onOpenControls,
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
        {/* Subtle decorative background stripe */}
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

        <div style={{ maxWidth: '720px', position: 'relative', zIndex: 10 }}>
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
              WebGPU • Ahead-Of-Time Recompiled WASM
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
            Run the authentic 2005 Black Edition directly in modern desktop and mobile browsers.
            Featuring locked 120 Hz physics simulation, on-screen mobile touch pedals, gyroscope tilt steering, and native OPFS storage caching.
          </p>

          {/* Single-Click Big Action Buttons */}
          <div style={{ display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={onStartGame}
              className="btn btn-primary"
              style={{
                padding: '14px 34px',
                fontSize: '16px',
                fontWeight: 900,
                letterSpacing: '0.06em',
                boxShadow: '0 0 24px rgba(245, 158, 11, 0.45)',
              }}
            >
              <Play size={20} fill="#000" />
              START ENGINE / PLAY NOW
            </button>

            <button
              onClick={onOpenControls}
              className="btn btn-secondary"
              style={{
                padding: '14px 20px',
                fontSize: '14px',
                fontWeight: 700,
                borderColor: '#f59e0b',
                color: '#f59e0b',
              }}
            >
              <Smartphone size={17} color="#f59e0b" />
              Mobile & Touch Controls
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
        {/* Card 1: Mobile & Touch Controls */}
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
                CONTROLS & MOBILE
              </span>
              <Smartphone size={18} color="#f59e0b" />
            </div>

            <div style={{ fontSize: '19px', fontWeight: 800, color: '#fff', marginBottom: '6px' }}>
              Touch & Gyro Steering
            </div>

            <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.5, marginBottom: '16px' }}>
              On-screen virtual pedals for Gas, Brake, Left, Right, Nitrous, Handbrake, plus phone tilt steering.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12.5px', borderTop: '1px solid #232b3c', paddingTop: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Touch Layout:</span>
                <span style={{ color: '#10b981', fontWeight: 700 }}>Adaptive (Split Pedals)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Phone Gyroscope:</span>
                <span style={{ color: settings.mobileControls.gyroEnabled ? '#06b6d4' : '#cbd5e1', fontWeight: 700 }}>
                  {settings.mobileControls.gyroEnabled ? 'Sensors Active' : 'Supported'}
                </span>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '6px', color: '#f59e0b', fontSize: '13px', fontWeight: 700 }}>
            <span>Customize Touch Controls</span>
            <ChevronRight size={15} />
          </div>
        </div>

        {/* Card 2: Engine & Graphics */}
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
          onClick={onOpenSettings}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <span style={{ color: '#94a3b8', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                ENGINE & GRAPHICS
              </span>
              <Sliders size={18} color="#06b6d4" />
            </div>

            <div style={{ fontSize: '19px', fontWeight: 800, color: '#fff', marginBottom: '6px' }}>
              WebGPU Metal / Vulkan
            </div>

            <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.5, marginBottom: '16px' }}>
              {webGpuName ? `${webGpuName} • ` : ''}Direct3D 9 translated to WebGPU WGSL shaders. Runs smoothly at locked 120 Hz physics simulation.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12.5px', borderTop: '1px solid #232b3c', paddingTop: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Resolution:</span>
                <span style={{ color: '#f59e0b', fontWeight: 700 }}>1280×720 (16:9 Widescreen)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Physics Rate:</span>
                <span style={{ color: '#10b981', fontWeight: 700 }}>120 Hz Fixed Rate</span>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '6px', color: '#06b6d4', fontSize: '13px', fontWeight: 700 }}>
            <span>Tune Display & Sound</span>
            <ChevronRight size={15} />
          </div>
        </div>

        {/* Card 3: Storage & Game Files */}
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
                GAME ASSETS
              </span>
              <HardDrive size={18} color="#10b981" />
            </div>

            <div style={{ fontSize: '19px', fontWeight: 800, color: '#fff', marginBottom: '6px' }}>
              OPFS Browser Storage
            </div>

            <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.5, marginBottom: '16px' }}>
              Cached locally in your browser’s Origin Private File System. Import your retail folder once or stream on demand.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12.5px', borderTop: '1px solid #232b3c', paddingTop: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Asset Cache:</span>
                <span style={{ color: storage.hasSpeedExe ? '#10b981' : '#f59e0b', fontWeight: 700 }}>
                  {storage.hasSpeedExe ? 'Speed.exe Ready' : 'Download on Launch'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Storage Persistence:</span>
                <span style={{ color: '#10b981', fontWeight: 700 }}>Persistent (No Wipe)</span>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981', fontSize: '13px', fontWeight: 700 }}>
            <span>Manage Storage & Import</span>
            <ChevronRight size={15} />
          </div>
        </div>
      </div>

      {/* Quick Play Instructions */}
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
              100% Free & Open Source ($0 Cost)
            </div>
            <div style={{ fontSize: '12.5px', color: '#94a3b8' }}>
              Host anywhere on GitHub Pages or Vercel. Stream assets via Cloudflare R2 or import your local game folder.
            </div>
          </div>
        </div>

        <button
          onClick={onStartGame}
          className="btn btn-secondary"
          style={{ padding: '8px 18px', fontSize: '13px', fontWeight: 700, borderColor: '#f59e0b', color: '#f59e0b' }}
        >
          Launch Now
        </button>
      </div>
    </div>
  );
};
