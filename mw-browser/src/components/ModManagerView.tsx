import React, { useState } from 'react';
import { ModItem } from '../types';
import { Layers, Upload, Check, Power, ArrowUp, ArrowDown } from 'lucide-react';

interface ModManagerViewProps {
  mods: ModItem[];
  onToggleMod: (id: string) => void;
  onUpdatePriority: (id: string, newPriority: number) => void;
  onInstallMod: (file: File) => void;
}

export const ModManagerView: React.FC<ModManagerViewProps> = ({
  mods,
  onToggleMod,
  onUpdatePriority,
  onInstallMod,
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [installSuccess, setInstallSuccess] = useState<string | null>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith('.mwmod') || file.name.endsWith('.zip')) {
        onInstallMod(file);
        setInstallSuccess(`Installed ${file.name}!`);
        setTimeout(() => setInstallSuccess(null), 4000);
      } else {
        alert('Please drop a .mwmod or .zip mod archive');
      }
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '28px', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>
            UNIVERSAL MOD RUNTIME & MANAGER
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '14px' }}>
            Install and manage browser-compatible .mwmod packages, HD texture packs, and gameplay plugins.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label className="btn btn-primary" style={{ cursor: 'pointer', fontSize: '14px', padding: '10px 18px' }}>
            <Upload size={16} />
            Install .mwmod
            <input
              type="file"
              accept=".mwmod,.zip"
              style={{ display: 'none' }}
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  onInstallMod(e.target.files[0]);
                  setInstallSuccess(`Installed ${e.target.files[0].name}!`);
                  setTimeout(() => setInstallSuccess(null), 4000);
                }
              }}
            />
          </label>
        </div>
      </div>

      {installSuccess && (
        <div style={{ padding: '12px 16px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '8px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
          <Check size={18} />
          <span>{installSuccess}</span>
        </div>
      )}

      {/* Drag and Drop Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        style={{
          border: `2px dashed ${dragOver ? '#f59e0b' : '#273042'}`,
          borderRadius: '12px',
          padding: '32px',
          textAlign: 'center',
          backgroundColor: dragOver ? 'rgba(245, 158, 11, 0.05)' : 'rgba(18, 21, 28, 0.5)',
          marginBottom: '32px',
          transition: 'all 0.2s ease',
        }}
      >
        <Upload size={32} color={dragOver ? '#f59e0b' : '#64748b'} style={{ margin: '0 auto 12px' }} />
        <h4 style={{ fontSize: '16px', fontWeight: 600, color: '#fff', marginBottom: '4px' }}>
          Drop .mwmod packages or texture packs here
        </h4>
        <p style={{ color: '#64748b', fontSize: '13px' }}>
          Packages are verified by SHA-256 and layered through the Virtual File System (VFS)
        </p>
      </div>

      {/* Mods List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {mods.map((mod) => (
          <div
            key={mod.id}
            className="glass-panel"
            style={{
              padding: '20px 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderLeft: mod.enabled ? '4px solid #f59e0b' : '4px solid #334155',
              opacity: mod.enabled ? 1 : 0.7,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  background: mod.enabled ? 'rgba(245, 158, 11, 0.15)' : 'rgba(51, 65, 85, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Layers size={22} color={mod.enabled ? '#f59e0b' : '#64748b'} />
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                  <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#fff', margin: 0 }}>
                    {mod.name}
                  </h3>
                  <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '4px', background: '#273042', color: '#94a3b8' }}>
                    v{mod.version}
                  </span>
                  <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '4px', background: 'rgba(6, 182, 212, 0.15)', color: '#06b6d4', textTransform: 'uppercase' }}>
                    {mod.type}
                  </span>
                  <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '4px', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
                    Priority: {mod.priority}
                  </span>
                </div>
                <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0 }}>
                  {mod.description}
                </p>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>
                  By <span style={{ color: '#cbd5e1' }}>{mod.author}</span> • {mod.assetsCount} mapped assets
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              {/* Priority reordering */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <button
                  onClick={() => onUpdatePriority(mod.id, mod.priority + 10)}
                  title="Increase Priority"
                  style={{ background: '#1e2533', border: '1px solid #273042', color: '#94a3b8', borderRadius: '4px', padding: '4px', cursor: 'pointer' }}
                >
                  <ArrowUp size={14} />
                </button>
                <button
                  onClick={() => onUpdatePriority(mod.id, Math.max(0, mod.priority - 10))}
                  title="Decrease Priority"
                  style={{ background: '#1e2533', border: '1px solid #273042', color: '#94a3b8', borderRadius: '4px', padding: '4px', cursor: 'pointer' }}
                >
                  <ArrowDown size={14} />
                </button>
              </div>

              {/* Toggle switch */}
              <button
                onClick={() => onToggleMod(mod.id)}
                className={`btn ${mod.enabled ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '13px', padding: '8px 16px' }}
              >
                <Power size={14} />
                {mod.enabled ? 'Enabled' : 'Disabled'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
