import React from 'react';
import { Play, Sparkles, HardDrive, ShieldCheck, Zap, Gamepad2, Info } from 'lucide-react';
import { GameSettings, ModItem, StorageStatus } from '../types';

interface DashboardProps {
  onStartGame: () => void;
  settings: GameSettings;
  storage: StorageStatus;
  mods: ModItem[];
  onOpenMods: () => void;
  onOpenStorage: () => void;
  webGpuName?: string;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onStartGame,
  settings,
  storage,
  mods,
  onOpenMods,
  onOpenStorage,
  webGpuName,
}) => {
  const activeModsCount = mods.filter((m) => m.enabled).length;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
      {/* Hero Banner */}
      <div
        className="glass-panel"
        style={{
          padding: '40px',
          marginBottom: '32px',
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, rgba(24, 29, 39, 0.9) 0%, rgba(18, 21, 28, 0.95) 100%)',
          border: '1px solid #273042',
        }}
      >
        <div style={{ maxWidth: '640px', position: 'relative', zIndex: 10 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 12px', borderRadius: '20px', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', marginBottom: '16px' }}>
            <Zap size={16} color="#f59e0b" />
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#f59e0b', textTransform: 'uppercase' }}>
              Ahead-of-Time WebAssembly + WebGPU Pipeline
            </span>
          </div>

          <h2 style={{ fontSize: '38px', fontWeight: 800, lineHeight: 1.15, marginBottom: '16px', color: '#fff' }}>
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
            <button onClick={onOpenMods} className="btn btn-secondary" style={{ padding: '14px 24px' }}>
              <Sparkles size={18} color="#f59e0b" />
              Manage Mods ({activeModsCount} Active)
            </button>
          </div>
        </div>
      </div>

      {/* Status Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        {/* Card 1: Graphics & Renderer */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ color: '#94a3b8', fontSize: '14px', fontWeight: 600 }}>GRAPHICS ENGINE</span>
            <Zap size={18} color="#06b6d4" />
          </div>
          <div style={{ fontSize: '20px', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>
            WebGPU Native
          </div>
          <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
            {webGpuName || 'Direct3D 9 to WGSL Translation'}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', borderTop: '1px solid #273042', paddingTop: '10px' }}>
            <span style={{ color: '#94a3b8' }}>Target Res:</span>
            <span style={{ color: '#f59e0b', fontWeight: 600 }}>{settings.resolution.toUpperCase()}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginTop: '6px' }}>
            <span style={{ color: '#94a3b8' }}>Simulation Rate:</span>
            <span style={{ color: '#10b981', fontWeight: 600 }}>{settings.simulationHz} Hz Fixed</span>
          </div>
        </div>

        {/* Card 2: Mod Ecosystem */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ color: '#94a3b8', fontSize: '14px', fontWeight: 600 }}>MOD RUNTIME</span>
            <Sparkles size={18} color="#f59e0b" />
          </div>
          <div style={{ fontSize: '20px', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>
            {activeModsCount} Mods Active
          </div>
          <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
            Layered VFS & HD Texture Injector
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', borderTop: '1px solid #273042', paddingTop: '10px' }}>
            <span style={{ color: '#94a3b8' }}>HD Textures:</span>
            <span style={{ color: '#10b981', fontWeight: 600 }}>Enabled (8x AF)</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginTop: '6px' }}>
            <span style={{ color: '#94a3b8' }}>Widescreen HUD:</span>
            <span style={{ color: '#10b981', fontWeight: 600 }}>Active</span>
          </div>
        </div>

        {/* Card 3: Storage & Assets */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ color: '#94a3b8', fontSize: '14px', fontWeight: 600 }}>GAME STORAGE</span>
            <HardDrive size={18} color="#10b981" />
          </div>
          <div style={{ fontSize: '20px', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>
            {storage.hasSpeedExe ? 'Game Ready' : 'Awaiting Files'}
          </div>
          <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
            {storage.hasSpeedExe ? 'Speed.exe verified (Black Edition)' : 'Import folder or ISO once'}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', borderTop: '1px solid #273042', paddingTop: '10px' }}>
            <span style={{ color: '#94a3b8' }}>Storage Type:</span>
            <span style={{ color: '#06b6d4', fontWeight: 600 }}>OPFS / Cache Storage</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginTop: '6px' }}>
            <span style={{ color: '#94a3b8' }}>Action:</span>
            <button onClick={onOpenStorage} style={{ background: 'none', border: 'none', color: '#f59e0b', fontSize: '12px', cursor: 'pointer', padding: 0 }}>
              {storage.hasSpeedExe ? 'Inspect Files' : 'Import Game'}
            </button>
          </div>
        </div>

        {/* Card 4: Controller */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ color: '#94a3b8', fontSize: '14px', fontWeight: 600 }}>INPUT & CONTROLS</span>
            <Gamepad2 size={18} color="#a855f7" />
          </div>
          <div style={{ fontSize: '20px', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>
            Console Gamepad
          </div>
          <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
            Xbox 360 / PS2 Layout & WASD
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', borderTop: '1px solid #273042', paddingTop: '10px' }}>
            <span style={{ color: '#94a3b8' }}>Gas / Brake:</span>
            <span style={{ color: '#fff', fontWeight: 600 }}>RT / LT (Up / Down)</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginTop: '6px' }}>
            <span style={{ color: '#94a3b8' }}>Nitrous / Speedbreaker:</span>
            <span style={{ color: '#fff', fontWeight: 600 }}>B / X (X / G keys)</span>
          </div>
        </div>
      </div>

      {/* Controller Quick Reference Pill */}
      <div className="glass-panel" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Info size={18} color="#f59e0b" />
          <span style={{ fontSize: '14px', color: '#cbd5e1' }}>
            <strong style={{ color: '#fff' }}>Input Mapping:</strong> RT Accelerate • LT Brake/Reverse • Left Stick Steer • A E-Brake/Accept • B Nitrous • X Speedbreaker • Y Camera • Back Reset • Start Pause
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldCheck size={16} color="#10b981" />
          <span style={{ fontSize: '13px', color: '#10b981', fontWeight: 600 }}>Cross-Origin Isolated Context</span>
        </div>
      </div>
    </div>
  );
};
