import React from 'react';
import { Play, Sparkles, HardDrive, Zap, Gamepad2, Info, Trophy, Gauge, Shield, Users } from 'lucide-react';
import { GameSettings, ModItem, StorageStatus } from '../types';

interface DashboardProps {
  onStartGame: () => void;
  settings: GameSettings;
  storage: StorageStatus;
  mods: ModItem[];
  onOpenMods: () => void;
  onOpenStorage: () => void;
  onOpenMultiplayer?: () => void;
  webGpuName?: string;
}

const FEATURED_CARS = [
  {
    name: 'BMW M3 GTR (E46)',
    class: 'Custom Tuned Blacklist #1',
    topSpeed: '242 MPH',
    accel: '9.8 / 10',
    handling: '10.0 / 10',
    color: '#06b6d4',
  },
  {
    name: 'Porsche Carrera GT',
    class: 'Super Exotic (Blacklist #2)',
    topSpeed: '238 MPH',
    accel: '9.5 / 10',
    handling: '9.4 / 10',
    color: '#f59e0b',
  },
  {
    name: 'Ford GT',
    class: 'Exotic Muscle (Blacklist #4)',
    topSpeed: '235 MPH',
    accel: '9.2 / 10',
    handling: '9.0 / 10',
    color: '#10b981',
  },
  {
    name: 'Lamborghini Gallardo',
    class: 'All-Wheel Drive (Blacklist #6)',
    topSpeed: '228 MPH',
    accel: '9.6 / 10',
    handling: '9.3 / 10',
    color: '#a855f7',
  },
];

const BLACKLIST_RIVALS = [
  { rank: '#1', name: 'Razor (Clarence Callahan)', car: 'BMW M3 GTR', heat: 'Heat 5+' },
  { rank: '#2', name: 'Bull (Toru Sato)', car: 'Mercedes-Benz SLR McLaren', heat: 'Heat 5' },
  { rank: '#3', name: 'Ronnie (Ronald McCrea)', car: 'Aston Martin DB9', heat: 'Heat 5' },
  { rank: '#4', name: 'JV (Joe Vega)', car: 'Dodge Viper SRT-10', heat: 'Heat 4' },
  { rank: '#5', name: 'Webster (Wes Allen)', car: 'Chevrolet Corvette C6', heat: 'Heat 4' },
];

export const Dashboard: React.FC<DashboardProps> = ({
  onStartGame,
  settings,
  storage,
  mods,
  onOpenMods,
  onOpenStorage,
  onOpenMultiplayer,
  webGpuName,
}) => {
  const activeModsCount = mods.filter((m) => m.enabled).length;

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '32px 24px' }}>
      {/* Hero Banner */}
      <div
        className="glass-panel"
        style={{
          padding: '44px',
          marginBottom: '32px',
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, rgba(22, 27, 37, 0.95) 0%, rgba(13, 16, 23, 0.98) 100%)',
          border: '1px solid #273042',
        }}
      >
        <div style={{ maxWidth: '680px', position: 'relative', zIndex: 10 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              borderRadius: '20px',
              background: 'rgba(245, 158, 11, 0.12)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              marginBottom: '16px',
            }}
          >
            <Zap size={16} color="#f59e0b" />
            <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Ahead-of-Time WebAssembly + WebGPU Engine
            </span>
          </div>

          <h2 style={{ fontSize: '42px', fontWeight: 800, lineHeight: 1.12, marginBottom: '16px', color: '#fff' }}>
            NEED FOR SPEED <span style={{ color: '#f59e0b' }}>MOST WANTED</span> (2005)
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '16px', marginBottom: '28px', lineHeight: 1.6 }}>
            Run the original 2005 Black Edition in modern web browsers at fixed 120 Hz physics simulation.
            Featuring high-definition texture injection, widescreen FOV, custom vehicle mods, and browser-native virtual storage.
          </p>

          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button onClick={onStartGame} className="btn btn-primary" style={{ padding: '14px 28px', fontSize: '16px' }}>
              <Play size={20} fill="#000" />
              Launch Game Now
            </button>
            {onOpenMultiplayer && (
              <button
                onClick={onOpenMultiplayer}
                className="btn btn-secondary"
                style={{
                  padding: '14px 24px',
                  border: '1px solid #f59e0b',
                  color: '#fff',
                }}
              >
                <Users size={18} color="#f59e0b" />
                Multiplayer Grid <span className="live-pill" style={{ marginLeft: '4px' }}>LIVE</span>
              </button>
            )}
            <button onClick={onOpenMods} className="btn btn-secondary" style={{ padding: '14px 24px' }}>
              <Sparkles size={18} color="#06b6d4" />
              Manage Mods ({activeModsCount} Active)
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Status Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        {/* Card 1: Graphics & Renderer */}
        <div className="glass-panel" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ color: '#94a3b8', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              GRAPHICS ENGINE
            </span>
            <Zap size={18} color="#06b6d4" />
          </div>
          <div style={{ fontSize: '20px', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>
            WebGPU Native
          </div>
          <div style={{ fontSize: '12.5px', color: '#64748b', marginBottom: '16px' }}>
            {webGpuName || 'Direct3D 9 to WGSL Translation'}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', borderTop: '1px solid #232b3c', paddingTop: '10px' }}>
            <span style={{ color: '#94a3b8' }}>Target Res:</span>
            <span style={{ color: '#f59e0b', fontWeight: 600 }}>{settings.resolution.toUpperCase()}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginTop: '6px' }}>
            <span style={{ color: '#94a3b8' }}>Simulation Rate:</span>
            <span style={{ color: '#10b981', fontWeight: 600 }}>{settings.simulationHz} Hz Fixed</span>
          </div>
        </div>

        {/* Card 2: Mod Ecosystem */}
        <div className="glass-panel" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ color: '#94a3b8', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              MOD RUNTIME
            </span>
            <Sparkles size={18} color="#f59e0b" />
          </div>
          <div style={{ fontSize: '20px', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>
            {activeModsCount} Mods Active
          </div>
          <div style={{ fontSize: '12.5px', color: '#64748b', marginBottom: '16px' }}>
            Layered VFS & HD Texture Injector
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', borderTop: '1px solid #232b3c', paddingTop: '10px' }}>
            <span style={{ color: '#94a3b8' }}>HD Textures:</span>
            <span style={{ color: '#10b981', fontWeight: 600 }}>Enabled (8x AF)</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginTop: '6px' }}>
            <span style={{ color: '#94a3b8' }}>Widescreen HUD:</span>
            <span style={{ color: '#10b981', fontWeight: 600 }}>Active</span>
          </div>
        </div>

        {/* Card 3: Storage & Assets */}
        <div className="glass-panel" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ color: '#94a3b8', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              GAME STORAGE
            </span>
            <HardDrive size={18} color="#10b981" />
          </div>
          <div style={{ fontSize: '20px', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>
            {storage.hasSpeedExe ? 'Game Ready' : 'Awaiting Files'}
          </div>
          <div style={{ fontSize: '12.5px', color: '#64748b', marginBottom: '16px' }}>
            {storage.hasSpeedExe ? 'Speed.exe verified (Black Edition)' : 'Import folder or ISO once'}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', borderTop: '1px solid #232b3c', paddingTop: '10px' }}>
            <span style={{ color: '#94a3b8' }}>Storage Type:</span>
            <span style={{ color: '#06b6d4', fontWeight: 600 }}>OPFS / Cache Storage</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginTop: '6px' }}>
            <span style={{ color: '#94a3b8' }}>Action:</span>
            <button onClick={onOpenStorage} style={{ background: 'none', border: 'none', color: '#f59e0b', fontSize: '13px', cursor: 'pointer', padding: 0, fontWeight: 600 }}>
              {storage.hasSpeedExe ? 'Inspect Files' : 'Import Game'}
            </button>
          </div>
        </div>

        {/* Card 4: Controller */}
        <div className="glass-panel" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ color: '#94a3b8', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              INPUT & CONTROLS
            </span>
            <Gamepad2 size={18} color="#a855f7" />
          </div>
          <div style={{ fontSize: '20px', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>
            Console Gamepad
          </div>
          <div style={{ fontSize: '12.5px', color: '#64748b', marginBottom: '16px' }}>
            Xbox 360 / PS2 Layout & WASD
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', borderTop: '1px solid #232b3c', paddingTop: '10px' }}>
            <span style={{ color: '#94a3b8' }}>Gas / Brake:</span>
            <span style={{ color: '#fff', fontWeight: 600 }}>RT / LT (Up / Down)</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginTop: '6px' }}>
            <span style={{ color: '#94a3b8' }}>Nitrous / Speedbreaker:</span>
            <span style={{ color: '#fff', fontWeight: 600 }}>B / X (X / G keys)</span>
          </div>
        </div>
      </div>

      {/* Featured Vehicles Showcase */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#fff', margin: 0 }}>
              ICONIC CARS & MODDING ROSTER
            </h3>
            <p style={{ color: '#64748b', fontSize: '13px', margin: 0 }}>
              High-polygon 3D meshes, custom bodykits, and engine performance profiles.
            </p>
          </div>
          <span style={{ fontSize: '12px', color: '#f59e0b', fontWeight: 600 }}>4 Configured Vehicles</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))', gap: '16px' }}>
          {FEATURED_CARS.map((car, idx) => (
            <div key={idx} className="glass-panel" style={{ padding: '18px', borderLeft: `3px solid ${car.color}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '11px', color: car.color, fontWeight: 700, textTransform: 'uppercase' }}>
                  {car.class}
                </span>
                <Gauge size={15} color={car.color} />
              </div>
              <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', marginBottom: '12px' }}>
                {car.name}
              </h4>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#94a3b8', borderTop: '1px solid #232b3c', paddingTop: '8px' }}>
                <span>Top Speed: <strong style={{ color: '#fff' }}>{car.topSpeed}</strong></span>
                <span>Accel: <strong style={{ color: '#fff' }}>{car.accel}</strong></span>
                <span>Handling: <strong style={{ color: '#fff' }}>{car.handling}</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Blacklist 15 Career Preview */}
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <Trophy size={20} color="#f59e0b" />
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', margin: 0 }}>
            ROCKPORT BLACKLIST 15 LEADERBOARD
          </h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          {BLACKLIST_RIVALS.map((rival, idx) => (
            <div key={idx} style={{ background: '#10141d', padding: '12px 14px', borderRadius: '8px', border: '1px solid #232b3c' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '13px', fontWeight: 800, color: '#f59e0b' }}>{rival.rank}</span>
                <span style={{ fontSize: '11px', color: '#ef4444', fontWeight: 600 }}>{rival.heat}</span>
              </div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>{rival.name}</div>
              <div style={{ fontSize: '11.5px', color: '#64748b' }}>{rival.car}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Controller Quick Reference Pill */}
      <div className="glass-panel" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Info size={18} color="#f59e0b" />
          <span style={{ fontSize: '13.5px', color: '#cbd5e1' }}>
            <strong style={{ color: '#fff' }}>Control Scheme:</strong> RT Accelerate • LT Brake/Reverse • Left Stick Steer • A E-Brake/Accept • B Nitrous • X Speedbreaker • Y Camera • Back Reset • Start Pause
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Shield size={16} color="#10b981" />
          <span style={{ fontSize: '13px', color: '#10b981', fontWeight: 600 }}>Cross-Origin Isolated Context</span>
        </div>
      </div>
    </div>
  );
};
