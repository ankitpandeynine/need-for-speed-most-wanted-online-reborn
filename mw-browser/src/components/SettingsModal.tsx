import React from 'react';
import { GameSettings } from '../types';
import { Monitor, Gamepad2, Volume2 } from 'lucide-react';

interface SettingsModalProps {
  settings: GameSettings;
  onUpdateSettings: (newSettings: Partial<GameSettings>) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onUpdateSettings,
}) => {
  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>
          ENGINE & GRAPHICS CONFIGURATION
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '14px' }}>
          Tune rendering resolution, WebGPU graphics pipelines, simulation rates, and controller mappings.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Graphics Section */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #273042', paddingBottom: '12px' }}>
            <Monitor size={20} color="#f59e0b" />
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', margin: 0 }}>
              Rendering & Display (WebGPU)
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#cbd5e1', marginBottom: '8px' }}>
                Internal Resolution
              </label>
              <select
                value={settings.resolution}
                onChange={(e) => onUpdateSettings({ resolution: e.target.value as GameSettings['resolution'] })}
                style={{ width: '100%', background: '#12151c', border: '1px solid #273042', borderRadius: '8px', color: '#fff', padding: '10px 12px', fontSize: '14px' }}
              >
                <option value="720p">1280 x 720 (Recommended for M5 Air)</option>
                <option value="1080p">1920 x 1080 Full HD</option>
                <option value="1440p">2560 x 1440 QHD</option>
                <option value="auto">Auto (Match Window Shape)</option>
              </select>
              <span style={{ fontSize: '12px', color: '#64748b', marginTop: '4px', display: 'block' }}>
                Game renders internally at this target, then scales cleanly.
              </span>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#cbd5e1', marginBottom: '8px' }}>
                Frame Rate Cap
              </label>
              <select
                value={settings.frameRateLimit}
                onChange={(e) => onUpdateSettings({ frameRateLimit: parseInt(e.target.value, 10) as GameSettings['frameRateLimit'] })}
                style={{ width: '100%', background: '#12151c', border: '1px solid #273042', borderRadius: '8px', color: '#fff', padding: '10px 12px', fontSize: '14px' }}
              >
                <option value="30">30 FPS (Battery Saver)</option>
                <option value="60">60 FPS (Balanced)</option>
                <option value="120">120 FPS (Smooth 120 Hz Native)</option>
              </select>
              <span style={{ fontSize: '12px', color: '#64748b', marginTop: '4px', display: 'block' }}>
                Physics simulation remains strictly locked at 120 Hz independently of frame cap.
              </span>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#cbd5e1', marginBottom: '8px' }}>
                Anisotropic Filtering
              </label>
              <select
                value={settings.anisotropicFiltering}
                onChange={(e) => onUpdateSettings({ anisotropicFiltering: parseInt(e.target.value, 10) as GameSettings['anisotropicFiltering'] })}
                style={{ width: '100%', background: '#12151c', border: '1px solid #273042', borderRadius: '8px', color: '#fff', padding: '10px 12px', fontSize: '14px' }}
              >
                <option value="1">1x (Off)</option>
                <option value="4">4x</option>
                <option value="8">8x (Recommended)</option>
                <option value="16">16x Ultra</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#cbd5e1', marginBottom: '8px' }}>
                Field of View (FOV) Mode
              </label>
              <select
                value={settings.fovMode}
                onChange={(e) => onUpdateSettings({ fovMode: e.target.value as GameSettings['fovMode'] })}
                style={{ width: '100%', background: '#12151c', border: '1px solid #273042', borderRadius: '8px', color: '#fff', padding: '10px 12px', fontSize: '14px' }}
              >
                <option value="xbox360">Xbox 360 Camera FOV (Default)</option>
                <option value="exact">Hor+ Exact Scaling</option>
                <option value="original">Original 2005 4:3 FOV</option>
              </select>
            </div>
          </div>
        </div>

        {/* Input & Controls Section */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #273042', paddingBottom: '12px' }}>
            <Gamepad2 size={20} color="#06b6d4" />
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', margin: 0 }}>
              Controls & Controller Mapping
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#cbd5e1', marginBottom: '8px' }}>
                Controller Profile
              </label>
              <select
                value={settings.controllerLayout}
                onChange={(e) => onUpdateSettings({ controllerLayout: e.target.value as GameSettings['controllerLayout'] })}
                style={{ width: '100%', background: '#12151c', border: '1px solid #273042', borderRadius: '8px', color: '#fff', padding: '10px 12px', fontSize: '14px' }}
              >
                <option value="xbox">Xbox Controller (RT/LT, A/B/X/Y)</option>
                <option value="playstation">PlayStation DualSense / DualShock (R2/L2, Cross/Circle)</option>
                <option value="keyboard_wasd">Keyboard: WASD + Space (E-Brake) + X (NOS)</option>
                <option value="keyboard_arrows">Keyboard: Arrow Keys + Space</option>
              </select>
            </div>
          </div>
        </div>

        {/* Sound Section */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #273042', paddingBottom: '12px' }}>
            <Volume2 size={20} color="#10b981" />
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', margin: 0 }}>
              Sound & Web Audio
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600, color: '#cbd5e1', marginBottom: '8px' }}>
                <span>Master Sound Effects</span>
                <span>{settings.audioVolume}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={settings.audioVolume}
                onChange={(e) => onUpdateSettings({ audioVolume: parseInt(e.target.value, 10) })}
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600, color: '#cbd5e1', marginBottom: '8px' }}>
                <span>Music & EA Trax</span>
                <span>{settings.musicVolume}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={settings.musicVolume}
                onChange={(e) => onUpdateSettings({ musicVolume: parseInt(e.target.value, 10) })}
                style={{ width: '100%' }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
