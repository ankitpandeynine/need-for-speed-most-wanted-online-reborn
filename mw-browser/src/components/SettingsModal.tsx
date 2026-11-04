import React, { useState, useEffect, useRef } from 'react';
import { GameSettings } from '../types';
import { Monitor, Volume2, Smartphone, Download, CheckCircle2, Folder, FileCode, Upload } from 'lucide-react';
import { ProfileSyncService } from '../services/profileSync';

interface SettingsModalProps {
  settings: GameSettings;
  onUpdateSettings: (newSettings: Partial<GameSettings>) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onUpdateSettings,
}) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [installStatus, setInstallStatus] = useState<string | null>(null);
  const [backupStatus, setBackupStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleExportBackup = async () => {
    try {
      const sync = ProfileSyncService.getInstance();
      const res = await sync.exportBackup();
      sync.downloadFile(res.blob, res.filename);
      setBackupStatus(`Exported backup successfully: ${res.filename}`);
      setTimeout(() => setBackupStatus(null), 4000);
    } catch (err: any) {
      alert('Error exporting backup: ' + err.message);
    }
  };

  const handleImportBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const sync = ProfileSyncService.getInstance();
      const res = await sync.importBackup(file);
      setBackupStatus(res.summary);
      setTimeout(() => setBackupStatus(null), 4000);
    } catch (err: any) {
      alert('Error importing backup: ' + err.message);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

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

  const handleInstallPwa = async () => {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          setInstallStatus('Installed successfully to Home Screen / App Drawer!');
        } else {
          setInstallStatus('Installation was dismissed.');
        }
        setDeferredPrompt(null);
      } catch (err: any) {
        setInstallStatus(`Install prompt error: ${err.message}`);
      }
    } else {
      // In iOS Safari or already installed Chrome
      const isIos = /iPhone|iPad|iPod/.test(navigator.userAgent);
      if (isIos) {
        alert('To add NFS Most Wanted to your Home Screen on iOS:\n1. Tap the Share button at the bottom of Safari.\n2. Scroll down and tap "Add to Home Screen".');
      } else {
        alert('To install on Chrome / Edge:\nClick the "Install app" icon at the right edge of the address bar (or Menu ⋮ -> "Install Need for Speed").');
      }
    }
  };

  return (
    <div className="page-responsive-container">
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: 'clamp(24px, 3.5vw, 32px)', fontWeight: 800, color: '#fff', marginBottom: '6px', letterSpacing: '-0.02em' }}>
          ENGINE CONFIGURATION & OFFLINE PWA
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '14.5px' }}>
          Tune WebGPU rendering pipelines, install the progressive web app shortcut, and inspect exact local device file storage.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* 1. Offline Launch & Home Screen Shortcut Section */}
        <div className="glass-panel" style={{ padding: '24px', border: '1px solid rgba(245, 158, 11, 0.4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', borderBottom: '1px solid #273042', paddingBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Smartphone size={20} color="#f59e0b" />
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', margin: 0 }}>
                  Add to Home Screen & Offline Web App (PWA)
                </h3>
                <div style={{ fontSize: '12.5px', color: '#94a3b8' }}>
                  Install as a standalone native-like app on Chrome, Edge, Android, and iOS for zero-lag offline launch.
                </div>
              </div>
            </div>

            <button
              onClick={handleInstallPwa}
              className="btn btn-primary"
              style={{ padding: '10px 22px', fontSize: '13.5px', fontWeight: 800 }}
            >
              <Download size={16} fill="#000" />
              📲 Add Home Screen Shortcut
            </button>
          </div>

          {installStatus && (
            <div style={{ padding: '10px 14px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', borderRadius: '8px', color: '#10b981', fontSize: '13px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={16} />
              <span>{installStatus}</span>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
            {/* Background Downloading Toggle */}
            <div style={{ padding: '16px', background: '#121622', borderRadius: '10px', border: '1px solid #273042' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>
                  Pre-Download Maps in Background
                </span>
                <input
                  type="checkbox"
                  checked={settings.backgroundDownloading}
                  onChange={(e) => onUpdateSettings({ backgroundDownloading: e.target.checked })}
                  style={{ width: '18px', height: '18px', accentColor: '#10b981' }}
                />
              </div>
              <div style={{ fontSize: '12px', color: '#94a3b8', lineHeight: 1.5 }}>
                Keeps downloading all map sectors and car models in the background while you drive so you never experience download lag or stutters during high-speed police chases.
              </div>
            </div>

            {/* Offline Preload Mode Toggle */}
            <div style={{ padding: '16px', background: '#121622', borderRadius: '10px', border: '1px solid #273042' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>
                  Full Offline Launch Mode
                </span>
                <input
                  type="checkbox"
                  checked={settings.offlinePreload}
                  onChange={(e) => onUpdateSettings({ offlinePreload: e.target.checked })}
                  style={{ width: '18px', height: '18px', accentColor: '#f59e0b' }}
                />
              </div>
              <div style={{ fontSize: '12px', color: '#94a3b8', lineHeight: 1.5 }}>
                Enforces complete offline caching before game start. The game will boot entirely from local device disk without requiring an active internet connection.
              </div>
            </div>
          </div>

          {/* Local Device Storage Path Card */}
          <div style={{ marginTop: '16px', padding: '16px', background: '#0d111a', borderRadius: '10px', border: '1px solid #273042' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Folder size={16} color="#06b6d4" />
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#06b6d4', textTransform: 'uppercase' }}>
                Device Storage Location (All Game Files Kept Here)
              </span>
            </div>
            <div style={{ fontSize: '12.5px', color: '#cbd5e1', lineHeight: 1.6 }}>
              <div>• <strong>Virtual Path:</strong> <code style={{ color: '#f59e0b' }}>/opfs/nfsmw/game/</code> (Game Assets) & <code style={{ color: '#f59e0b' }}>/opfs/nfsmw/profile/</code> (Saves)</div>
              <div>• <strong>macOS Chrome Storage:</strong> <code style={{ color: '#94a3b8' }}>~/Library/Application Support/Google/Chrome/Default/File System/</code></div>
              <div>• <strong>Windows Chrome Storage:</strong> <code style={{ color: '#94a3b8' }}>%LOCALAPPDATA%\Google\Chrome\User Data\Default\File System\</code></div>
              <div>• <strong>Android Chrome Storage:</strong> <code style={{ color: '#94a3b8' }}>/data/data/com.android.chrome/app_chrome/Default/File System/</code></div>
            </div>
          </div>
        </div>

        {/* 2. Graphics Section */}
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

        {/* 3. Sound Section */}
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
        {/* 4. Universal Settings & Career Progress Backup */}
        <div className="glass-panel" style={{ padding: '24px', border: '1px solid rgba(16, 185, 129, 0.4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid #273042', paddingBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FileCode size={20} color="#10b981" />
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', margin: 0 }}>
                  Universal Settings & Career Progress Backup (.nfsmwcfg)
                </h3>
                <div style={{ fontSize: '12px', color: '#64748b' }}>
                  Export all your settings, mods, touch placements, controller rebinds, and career save files into a single portable backup file.
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleExportBackup}
                className="btn btn-primary"
                style={{ padding: '8px 16px', fontSize: '12px', fontWeight: 800, background: '#10b981', borderColor: '#34d399' }}
              >
                <Download size={14} />
                <span>Export Backup (.nfsmwcfg)</span>
              </button>

              <label
                className="btn btn-secondary"
                style={{ padding: '8px 16px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
              >
                <Upload size={14} />
                <span>Restore / Import</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".nfsmwcfg,.json"
                  onChange={handleImportBackup}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
          </div>

          {backupStatus && (
            <div style={{ padding: '8px 14px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', borderRadius: '8px', color: '#10b981', fontSize: '12.5px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={15} />
              <span>{backupStatus}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
