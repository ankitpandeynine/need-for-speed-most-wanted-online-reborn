import React, { useState } from 'react';
import { ModItem } from '../types';
import { Layers, Upload, Check, Power, ArrowUp, ArrowDown, Search, Filter, RefreshCw } from 'lucide-react';

interface ModManagerViewProps {
  mods: ModItem[];
  onToggleMod: (id: string) => void;
  onUpdatePriority: (id: string, newPriority: number) => void;
  onInstallMod: (file: File) => void;
  onResetDefaults?: () => void;
}

export const ModManagerView: React.FC<ModManagerViewProps> = ({
  mods,
  onToggleMod,
  onUpdatePriority,
  onInstallMod,
  onResetDefaults,
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [installSuccess, setInstallSuccess] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

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

  const filteredMods = mods.filter((mod) => {
    const matchesSearch =
      mod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mod.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mod.author.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (categoryFilter === 'all') return true;
    if (categoryFilter === 'graphics') return mod.type === 'texture';
    if (categoryFilter === 'gameplay') return mod.type === 'options' || mod.type === 'police';
    if (categoryFilter === 'vehicles') return mod.type === 'vehicle' || mod.type === 'handling';
    return true;
  });

  const activeCount = mods.filter((m) => m.enabled).length;

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '32px 24px' }}>
      {/* Top Banner */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#fff', marginBottom: '4px' }}>
            UNIVERSAL MOD RUNTIME & POPULAR MODS
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '14px' }}>
            {activeCount} of {mods.length} mods enabled • High-res textures, Xbox 360 shaders, and custom physics layered over Black Edition.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {onResetDefaults && (
            <button
              onClick={onResetDefaults}
              className="btn btn-secondary"
              style={{ fontSize: '13px', padding: '9px 16px' }}
              title="Reset to recommended community catalog"
            >
              <RefreshCw size={15} />
              Reset Catalog
            </button>
          )}
          <label className="btn btn-primary" style={{ cursor: 'pointer', fontSize: '13px', padding: '9px 18px' }}>
            <Upload size={16} />
            Install Custom .mwmod
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
        <div style={{ padding: '12px 18px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '8px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <Check size={18} />
          <span style={{ fontWeight: 600 }}>{installSuccess}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="glass-panel" style={{ padding: '16px 20px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '260px' }}>
          <Search size={18} color="#64748b" />
          <input
            type="text"
            placeholder="Search mods by name, author, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#fff',
              fontSize: '14px',
              width: '100%',
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Filter size={15} color="#64748b" style={{ marginRight: '4px' }} />
          {[
            { id: 'all', label: 'All Mods' },
            { id: 'graphics', label: 'Graphics & Shaders' },
            { id: 'gameplay', label: 'Gameplay & AI' },
            { id: 'vehicles', label: 'Cars & Physics' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              style={{
                background: categoryFilter === cat.id ? '#f59e0b' : '#121620',
                color: categoryFilter === cat.id ? '#000' : '#94a3b8',
                border: '1px solid #232b3c',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '12.5px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Drag and Drop Target */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        style={{
          border: `2px dashed ${dragOver ? '#f59e0b' : '#273042'}`,
          borderRadius: '12px',
          padding: '28px',
          textAlign: 'center',
          backgroundColor: dragOver ? 'rgba(245, 158, 11, 0.05)' : 'rgba(16, 20, 28, 0.6)',
          marginBottom: '28px',
          transition: 'all 0.2s ease',
        }}
      >
        <Upload size={28} color={dragOver ? '#f59e0b' : '#64748b'} style={{ margin: '0 auto 8px' }} />
        <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>
          Drag & Drop custom .mwmod packages or ZIP archives here
        </h4>
        <p style={{ color: '#64748b', fontSize: '12.5px', margin: 0 }}>
          Compatible with NFSMods, NFSAddons, and community Black Edition replacement packs.
        </p>
      </div>

      {/* Mod List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {filteredMods.map((mod) => (
          <div
            key={mod.id}
            className="glass-panel"
            style={{
              padding: '18px 22px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderLeft: mod.enabled ? '4px solid #f59e0b' : '4px solid #334155',
              backgroundColor: mod.enabled ? 'rgba(20, 25, 36, 0.9)' : 'rgba(14, 18, 25, 0.65)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  background: mod.enabled ? 'rgba(245, 158, 11, 0.15)' : 'rgba(51, 65, 85, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Layers size={20} color={mod.enabled ? '#f59e0b' : '#64748b'} />
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px', flexWrap: 'wrap' }}>
                  <h3 style={{ fontSize: '16.5px', fontWeight: 700, color: '#fff', margin: 0 }}>
                    {mod.name}
                  </h3>
                  <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '4px', background: '#232b3c', color: '#94a3b8' }}>
                    v{mod.version}
                  </span>
                  <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '4px', background: 'rgba(6, 182, 212, 0.15)', color: '#06b6d4', textTransform: 'uppercase', fontWeight: 600 }}>
                    {mod.type}
                  </span>
                  <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '4px', background: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b', fontWeight: 600 }}>
                    Priority: {mod.priority}
                  </span>
                </div>
                <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0 }}>
                  {mod.description}
                </p>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>
                  Author: <span style={{ color: '#cbd5e1' }}>{mod.author}</span> • {mod.assetsCount} mapped game assets
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexShrink: 0 }}>
              {/* Priority Reordering Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <button
                  onClick={() => onUpdatePriority(mod.id, mod.priority + 10)}
                  title="Increase Load Priority"
                  style={{ background: '#1c2331', border: '1px solid #273042', color: '#94a3b8', borderRadius: '4px', padding: '3px 6px', cursor: 'pointer' }}
                >
                  <ArrowUp size={13} />
                </button>
                <button
                  onClick={() => onUpdatePriority(mod.id, Math.max(0, mod.priority - 10))}
                  title="Decrease Load Priority"
                  style={{ background: '#1c2331', border: '1px solid #273042', color: '#94a3b8', borderRadius: '4px', padding: '3px 6px', cursor: 'pointer' }}
                >
                  <ArrowDown size={13} />
                </button>
              </div>

              {/* Toggle switch */}
              <button
                onClick={() => onToggleMod(mod.id)}
                className={`btn ${mod.enabled ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '12.5px', padding: '8px 16px' }}
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
