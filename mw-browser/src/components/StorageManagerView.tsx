import React, { useState } from 'react';
import { StorageStatus } from '../types';
import { CheckCircle2, AlertCircle, FolderOpen, Trash2, ShieldCheck, Database, Zap, RefreshCw } from 'lucide-react';
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

      setImportMessage('Scanning game files and indexing directory structure...');

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

  // Fast local streaming preparation
  const handleSetupStream = async () => {
    try {
      setImporting(true);
      setImportMessage('Preparing local disk stream (pinning speed.exe)...');

      const worker = new Worker('/worker.js', { type: 'module' });
      let nextId = 1;

      worker.onmessage = ({ data }) => {
        if (data.progress) {
          const p = data.progress;
          const percent = p.bytesTotal ? Math.floor((p.bytesDone / p.bytesTotal) * 100) : 0;
          setImportMessage(`Streaming speed.exe: ${percent}% (${formatBytes(p.bytesDone)} / ${formatBytes(p.bytesTotal)})`);
          return;
        }

        if (data.id === nextId) {
          worker.terminate();
          setImporting(false);
          if (data.error) {
            setImportMessage(`Setup error: ${data.error}`);
          } else {
            setImportMessage('Local streaming setup complete! Launch Game now to play.');
            onImportComplete(1364);
            setTimeout(() => setImportMessage(null), 5000);
          }
        }
      };

      const games = await fetch('/games.json').then((r) => r.json());
      const game = games[0];
      const manifestUrl = new URL(game.hostedAssets, new URL('/games.json', location.href)).href;

      worker.postMessage({
        id: nextId,
        cmd: 'streamSetup',
        game,
        manifestUrl,
      });
    } catch (err: any) {
      setImportMessage(`Stream setup error: ${err.message}`);
      setImporting(false);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>
          GAME ASSET STORAGE & VERIFICATION
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '14px' }}>
          Manage your local Need for Speed: Most Wanted Black Edition game installation in the browser.
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
          <RefreshCw size={18} className={importing ? 'spin' : ''} />
          <span>{importMessage}</span>
        </div>
      )}

      {/* Actions */}
      <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>
            Import Game Files & Setup
          </h4>
          <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0 }}>
            Choose either <strong>Instant Local Stream</strong> (zero waiting) or <strong>Import Folder</strong> to cache assets in your browser.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={handleSetupStream}
            disabled={importing}
            className="btn btn-primary"
            style={{ fontSize: '13px', padding: '10px 18px' }}
          >
            <Zap size={16} />
            Quick Stream Local Game
          </button>

          <button
            onClick={handleRealImport}
            disabled={importing}
            className="btn btn-secondary"
            style={{ fontSize: '13px', padding: '10px 18px' }}
          >
            <FolderOpen size={16} />
            Import Game Folder
          </button>

          {storage.hasSpeedExe && (
            <button
              onClick={onClearStorage}
              className="btn btn-danger"
              style={{ fontSize: '13px', padding: '10px 16px' }}
            >
              <Trash2 size={16} />
              Clear Storage
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
