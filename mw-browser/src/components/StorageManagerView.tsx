import React, { useState } from 'react';
import { StorageStatus } from '../types';
import { CheckCircle2, AlertCircle, FolderOpen, Trash2, ShieldCheck, Database, RefreshCw, DownloadCloud } from 'lucide-react';
import { PINNED_SPEED_EXE_SHA256 } from '../services/storage';

interface StorageManagerViewProps {
  storage: StorageStatus;
  onRequestPersistence: () => Promise<boolean>;
  onClearStorage: () => void;
  onImportComplete: (fileCount: number) => void;
}

export const StorageManagerView: React.FC<StorageManagerViewProps> = ({
  storage,
  onRequestPersistence,
  onClearStorage,
  onImportComplete,
}) => {
  const [importing, setImporting] = useState(false);
  const [importMessage, setImportMessage] = useState<string | null>(null);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i];
  };

  // Real OPFS import using File System Access API
  const handleRealImport = async () => {
    try {
      if (!('showDirectoryPicker' in window)) {
        alert('Your browser does not support the File System Access API. Please use Google Chrome, Brave, or Microsoft Edge.');
        return;
      }

      setImporting(true);
      setImportMessage('Select your "Need For Speed Most Wanted Black Edition" folder in the file dialog...');

      const handle = await (window as any).showDirectoryPicker({ id: 'game-nfsmw', mode: 'read' });

      setImportMessage('Scanning game files and indexing directory structure into OPFS...');

      const worker = new Worker('/worker.js', { type: 'module' });
      let nextId = 1;

      worker.onmessage = ({ data }) => {
        if (data.progress) {
          const p = data.progress;
          const percent = p.bytesTotal ? Math.floor((p.bytesDone / p.bytesTotal) * 100) : 0;
          setImportMessage(`Caching into OPFS: ${percent}% (${formatBytes(p.bytesDone)} / ${formatBytes(p.bytesTotal)}) - ${p.current || ''}`);
          return;
        }

        if (data.id === nextId) {
          worker.terminate();
          setImporting(false);
          if (data.error) {
            setImportMessage(`Import error: ${data.error}`);
          } else {
            setImportMessage('Game imported successfully into browser storage! You can launch now.');
            onImportComplete(1364);
            setTimeout(() => setImportMessage(null), 5000);
          }
        }
      };

      const games = await fetch('/games.json').then((r) => r.json());
      const game = games[0];

      worker.postMessage({
        id: nextId,
        cmd: 'import',
        game,
        kind: 'handle',
        handle,
      });
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setImportMessage(`Could not select folder: ${err.message}`);
      }
      setImporting(false);
    }
  };

  // Pre-download ALL game assets & maps into OPFS for 0-lag offline play
  const handlePreDownloadAll = async () => {
    try {
      setImporting(true);
      setImportMessage('Connecting to game repository and preparing full pre-download...');

      const worker = new Worker('/worker.js', { type: 'module' });
      let nextId = 1;

      worker.onmessage = ({ data }) => {
        if (data.progress) {
          const p = data.progress;
          const percent = p.bytesTotal ? Math.floor((p.bytesDone / p.bytesTotal) * 100) : 0;
          setImportMessage(`Pre-downloading maps & assets: ${percent}% (${formatBytes(p.bytesDone)} / ${formatBytes(p.bytesTotal)}) - ${p.current || ''}`);
          return;
        }

        if (data.id === nextId) {
          worker.terminate();
          setImporting(false);
          if (data.error) {
            setImportMessage(`Download error: ${data.error}`);
          } else {
            setImportMessage('✓ All maps, tracks, cars & audio cached in OPFS! Game is ready for 0-lag offline play.');
            onImportComplete(1406);
            setTimeout(() => setImportMessage(null), 8000);
          }
        }
      };

      const games = await fetch('/games.json').then((r) => r.json());
      const game = games[0];
      const manifestUrl = new URL(game.hostedAssets, new URL('/games.json', location.href)).href;

      worker.postMessage({
        id: nextId,
        cmd: 'import',
        game,
        kind: 'hosted',
        manifestUrl,
      });
    } catch (err: any) {
      setImportMessage(`Pre-download error: ${err.message}`);
      setImporting(false);
    }
  };

  return (
    <div className="page-responsive-container">
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#fff', marginBottom: '4px', letterSpacing: '-0.02em' }}>
          GAME ASSET STORAGE & OFFLINE CACHE
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '14.5px' }}>
          Manage your local Need for Speed: Most Wanted Black Edition game installation, OPFS browser storage, and zero-lag offline caching.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        {/* Verification Status Card */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            {storage.speedExeValid ? (
              <CheckCircle2 size={24} color="#10b981" />
            ) : (
              <AlertCircle size={24} color="#f59e0b" />
            )}
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', margin: 0 }}>
              Executable Fingerprint
            </h3>
          </div>

          <div style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '12px' }}>
            Expected Black Edition SHA-256:
          </div>
          <div className="mono-font" style={{ fontSize: '11px', background: '#0b0d13', padding: '8px 12px', borderRadius: '6px', color: '#06b6d4', wordBreak: 'break-all', marginBottom: '16px', border: '1px solid #1e2533' }}>
            {PINNED_SPEED_EXE_SHA256}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', borderTop: '1px solid #273042', paddingTop: '12px' }}>
            <span style={{ color: '#94a3b8' }}>Status:</span>
            <span style={{ color: storage.speedExeValid ? '#10b981' : '#f59e0b', fontWeight: 600 }}>
              {storage.speedExeValid ? 'Verified Compatible' : 'Not Loaded Yet'}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginTop: '6px' }}>
            <span style={{ color: '#94a3b8' }}>Indexed Files:</span>
            <span style={{ color: '#fff', fontWeight: 600 }}>{storage.totalGameFiles} files</span>
          </div>
        </div>

        {/* Browser Quota Card */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <Database size={24} color="#06b6d4" />
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', margin: 0 }}>
              Browser Storage Quota
            </h3>
          </div>

          <div style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '8px' }}>
            Used: {formatBytes(storage.storageUsedBytes)} of {formatBytes(storage.storageQuotaBytes)}
          </div>
          <div style={{ width: '100%', height: '8px', background: '#1e2533', borderRadius: '4px', overflow: 'hidden', marginBottom: '16px' }}>
            <div
              style={{
                width: storage.storageQuotaBytes ? `${Math.min(100, (storage.storageUsedBytes / storage.storageQuotaBytes) * 100)}%` : '5%',
                height: '100%',
                background: '#06b6d4',
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', borderTop: '1px solid #273042', paddingTop: '12px' }}>
            <span style={{ color: '#94a3b8' }}>Storage Persistence:</span>
            <span style={{ color: storage.isPersistent ? '#10b981' : '#f59e0b', fontWeight: 600 }}>
              {storage.isPersistent ? 'Permanent (Granted)' : 'Session / Normal'}
            </span>
          </div>
          {!storage.isPersistent && (
            <button
              onClick={onRequestPersistence}
              className="btn btn-secondary"
              style={{ marginTop: '12px', width: '100%', fontSize: '12px', padding: '6px 12px' }}
            >
              <ShieldCheck size={14} /> Request Storage Persistence
            </button>
          )}
        </div>
      </div>

      {importMessage && (
        <div style={{ padding: '14px 18px', background: 'rgba(6, 182, 212, 0.15)', border: '1px solid rgba(6, 182, 212, 0.4)', borderRadius: '8px', color: '#06b6d4', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px', fontSize: '14px' }}>
          <RefreshCw size={18} className={importing ? 'spin-anim' : ''} />
          <span>{importMessage}</span>
        </div>
      )}

      {/* Action Options */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        {/* Option 1: Pre-download Full Game for Zero-Lag Offline Play */}
        <div className="glass-panel" style={{ padding: '24px', border: '1px solid rgba(245, 158, 11, 0.35)', background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.05) 0%, rgba(15, 20, 28, 0.95) 100%)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <DownloadCloud size={22} color="#f59e0b" />
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', margin: 0 }}>
              Zero-Lag Offline Mode (Pre-download)
            </h3>
          </div>
          <p style={{ color: '#94a3b8', fontSize: '13.5px', lineHeight: 1.5, marginBottom: '20px' }}>
            Eliminates buffering and in-race lag spikes on slow internet. Pre-downloads all tracks, textures, and cars into your browser's OPFS storage once.
          </p>
          <button
            onClick={handlePreDownloadAll}
            disabled={importing}
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', fontSize: '14px', fontWeight: 800 }}
          >
            <DownloadCloud size={16} fill="#000" />
            {importing ? 'Downloading...' : 'Pre-Download Full Game (1.4 GB) to OPFS'}
          </button>
        </div>

        {/* Option 2: Import Local Game Folder */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <FolderOpen size={22} color="#10b981" />
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', margin: 0 }}>
              Import Local NFS Folder
            </h3>
          </div>
          <p style={{ color: '#94a3b8', fontSize: '13.5px', lineHeight: 1.5, marginBottom: '20px' }}>
            Have Need for Speed: Most Wanted installed on your computer? Select your folder to import directly with 0 download required.
          </p>
          <button
            onClick={handleRealImport}
            disabled={importing}
            className="btn btn-secondary"
            style={{ width: '100%', padding: '12px', fontSize: '14px', fontWeight: 800, borderColor: '#10b981', color: '#10b981' }}
          >
            <FolderOpen size={16} color="#10b981" />
            Select Local Game Folder
          </button>
        </div>
      </div>

      {/* Danger Zone: Clear Storage */}
      <div className="glass-panel" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', borderColor: '#451a1a' }}>
        <div>
          <div style={{ fontSize: '15px', fontWeight: 700, color: '#fca5a5' }}>
            Clear Browser Game Cache
          </div>
          <div style={{ fontSize: '12.5px', color: '#94a3b8' }}>
            Deletes all cached tracks and binaries from OPFS. (Your career save files are preserved).
          </div>
        </div>

        <button
          onClick={() => {
            if (confirm('Are you sure you want to clear cached game files from browser storage?')) {
              onClearStorage();
            }
          }}
          className="btn btn-danger"
          style={{ padding: '8px 18px', fontSize: '13px' }}
        >
          <Trash2 size={14} /> Clear Cache
        </button>
      </div>
    </div>
  );
};
