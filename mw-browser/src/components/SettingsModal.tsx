import React from 'react';
import { GameSettings } from '../types';
import { Monitor, Volume2, Smartphone } from 'lucide-react';

interface SettingsModalProps {
  settings: GameSettings;
  onUpdateSettings: (newSettings: Partial<GameSettings>) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onUpdateSettings,
}) => {
  const handleUpdateMobile = (partialMobile: Partial<GameSettings['mobileControls']>) => {
    onUpdateSettings({
      mobileControls: {
        ...settings.mobileControls,
        ...partialMobile,
      },
    });
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '32px 20px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#fff', marginBottom: '6px', letterSpacing: '-0.02em' }}>
          ENGINE & GRAPHICS CONFIGURATION
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '14.5px' }}>
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
                <option value="720p">1280 × 720 (Native Internal 16:9)</option>
                <option value="1080p">1920 × 1080 Full HD</option>
                <option value="1440p">2560 × 1440 QHD</option>
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

        {/* Mobile & Touch Controls Section */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid #273042', paddingBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Smartphone size={20} color="#f59e0b" />
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', margin: 0 }}>
                Mobile Touch Controls & Gyroscope
              </h3>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '8px' }}>
              <input
                type="checkbox"
                checked={settings.mobileControls.enabled}
                onChange={(e) => handleUpdateMobile({ enabled: e.target.checked })}
                style={{ width: '18px', height: '18px', accentColor: '#f59e0b' }}
              />
              <span style={{ fontSize: '13px', fontWeight: 700, color: settings.mobileControls.enabled ? '#f59e0b' : '#64748b' }}>
                {settings.mobileControls.enabled ? 'ON-SCREEN ACTIVE' : 'OFF'}
              </span>
            </label>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600, color: '#cbd5e1', marginBottom: '8px' }}>
                <span>Button Size / Scale</span>
                <span style={{ color: '#f59e0b', fontWeight: 700 }}>{Math.round(settings.mobileControls.buttonScale * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.8"
                max="1.5"
                step="0.05"
                value={settings.mobileControls.buttonScale}
                onChange={(e) => handleUpdateMobile({ buttonScale: parseFloat(e.target.value) })}
                style={{ width: '100%', accentColor: '#f59e0b' }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600, color: '#cbd5e1', marginBottom: '8px' }}>
                <span>Button Transparency</span>
                <span style={{ color: '#f59e0b', fontWeight: 700 }}>{Math.round(settings.mobileControls.opacity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="1.0"
                step="0.05"
                value={settings.mobileControls.opacity}
                onChange={(e) => handleUpdateMobile({ opacity: parseFloat(e.target.value) })}
                style={{ width: '100%', accentColor: '#f59e0b' }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600, color: '#cbd5e1', marginBottom: '8px' }}>
                <span>Gyro Tilt Sensitivity</span>
                <span style={{ color: '#06b6d4', fontWeight: 700 }}>{settings.mobileControls.gyroSensitivity.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="3.0"
                step="0.1"
                value={settings.mobileControls.gyroSensitivity}
                onChange={(e) => handleUpdateMobile({ gyroSensitivity: parseFloat(e.target.value) })}
                style={{ width: '100%', accentColor: '#06b6d4' }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600, color: '#cbd5e1', marginBottom: '8px' }}>
                <span>Gyro Center Deadzone</span>
                <span style={{ color: '#06b6d4', fontWeight: 700 }}>{settings.mobileControls.gyroDeadzone}°</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={settings.mobileControls.gyroDeadzone}
                onChange={(e) => handleUpdateMobile({ gyroDeadzone: parseInt(e.target.value, 10) })}
                style={{ width: '100%', accentColor: '#06b6d4' }}
              />
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
                style={{ width: '100%', accentColor: '#10b981' }}
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
                style={{ width: '100%', accentColor: '#10b981' }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
