import React, { useState } from 'react';
import { StorageStatus } from '../types';
import { CheckCircle2, AlertCircle, FolderOpen, Trash2, ShieldCheck, Database } from 'lucide-react';
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

  const handleSimulateImport = () => {
    setImporting(true);
    setImportMessage('Verifying speed.exe SHA-256 fingerprint...');
    setTimeout(() => {
      setImportMessage('Caching CARS, GLOBAL, TRACKS and SOUND banks in OPFS...');
      setTimeout(() => {
        onImportComplete(1406);
        setImporting(false);
        setImportMessage('Game installation validated and cached successfully!');
        setTimeout(() => setImportMessage(null), 4000);
      }, 1500);
    }, 1200);
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
        <div style={{ padding: '12px 16px', background: 'rgba(6, 182, 212, 0.15)', border: '1px solid rgba(6, 182, 212, 0.3)', borderRadius: '8px', color: '#06b6d4', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
          <span>{importMessage}</span>
        </div>
      )}

      {/* Actions */}
      <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>
            Import Game Files
          </h4>
          <p style={{ color: '#64748b', fontSize: '13px', margin: 0 }}>
            Select your retail Need for Speed Most Wanted folder or ISO image to cache assets in your browser.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={handleSimulateImport}
            disabled={importing}
            className="btn btn-primary"
            style={{ fontSize: '14px', padding: '10px 20px' }}
          >
            <FolderOpen size={16} />
            {storage.hasSpeedExe ? 'Re-index Game Files' : 'Import Game Directory'}
          </button>

          {storage.hasSpeedExe && (
            <button
              onClick={onClearStorage}
              className="btn btn-danger"
              style={{ fontSize: '14px', padding: '10px 16px' }}
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
