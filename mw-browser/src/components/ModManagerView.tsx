import React, { useState } from 'react';
import { ModItem } from '../types';
import {
  Sparkles,
  Upload,
  Check,
  Power,
  ArrowUp,
  ArrowDown,
  Search,
  RefreshCw,
  Link,
  Car,
  Sliders,
  Flame,
  Volume2,
  Tv,
  CheckCircle2,
} from 'lucide-react';

interface ModManagerViewProps {
  mods: ModItem[];
  onToggleMod: (id: string) => void;
  onUpdatePriority: (id: string, newPriority: number) => void;
  onInstallMod: (file: File) => void;
  onEnableAllRecommended?: () => void;
  onResetDefaults?: () => void;
}

export const ModManagerView: React.FC<ModManagerViewProps> = ({
  mods,
  onToggleMod,
  onUpdatePriority,
  onInstallMod,
  onEnableAllRecommended,
  onResetDefaults,
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [installSuccess, setInstallSuccess] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showUrlModal, setShowUrlModal] = useState(false);
  const [modUrl, setModUrl] = useState('');
  const [urlDownloading, setUrlDownloading] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith('.mwmod') || file.name.endsWith('.zip') || file.name.endsWith('.bin')) {
        onInstallMod(file);
        setInstallSuccess(`Successfully installed "${file.name}"!`);
        setTimeout(() => setInstallSuccess(null), 4000);
      } else {
        alert('Please drop a .mwmod, .zip, or .bin mod archive from NFSMods or NexusMods.');
      }
    }
  };

  const handleInstallFromUrl = async () => {
    if (!modUrl.trim()) return;
    try {
      setUrlDownloading(true);
      const res = await fetch(modUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch mod file`);
      const blob = await res.blob();
      const fileName = modUrl.split('/').pop()?.split('?')[0] || 'community-mod.zip';
      const file = new File([blob], fileName);
      onInstallMod(file);
      setUrlDownloading(false);
      setShowUrlModal(false);
      setModUrl('');
      setInstallSuccess(`Successfully downloaded and installed "${fileName}"!`);
      setTimeout(() => setInstallSuccess(null), 4000);
    } catch (err: any) {
      alert(`Could not download mod: ${err.message}. Make sure the URL allows CORS.`);
      setUrlDownloading(false);
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
    if (categoryFilter === 'vehicles') return mod.type === 'vehicle';
    if (categoryFilter === 'gameplay') return mod.type === 'options' || mod.type === 'police';
    if (categoryFilter === 'handling') return mod.type === 'handling';
    if (categoryFilter === 'audio_video') return mod.type === 'composite' || mod.id.includes('ea-trax') || mod.id.includes('cutscenes');
    return true;
  });

  const activeCount = mods.filter((m) => m.enabled).length;

  const getTypeIcon = (type: string, id: string) => {
    if (id.includes('ea-trax')) return <Volume2 size={14} color="#10b981" />;
    if (id.includes('cutscenes')) return <Tv size={14} color="#3b82f6" />;
    if (type === 'texture') return <Sparkles size={14} color="#06b6d4" />;
    if (type === 'vehicle') return <Car size={14} color="#f59e0b" />;
    if (type === 'handling') return <Flame size={14} color="#ef4444" />;
    return <Sliders size={14} color="#a855f7" />;
  };

  const getTypeLabel = (type: string, id: string) => {
    if (id.includes('ea-trax')) return 'Audio Remaster';
    if (id.includes('cutscenes')) return '60 FPS Video';
    if (type === 'texture') return 'Visuals / Textures';
    if (type === 'vehicle') return 'Vehicle Pack';
    if (type === 'handling') return 'Physics / Drift';
    if (type === 'police') return 'Police AI';
    return 'Core Option';
  };

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '32px 20px' }}>
      {/* Top Banner */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '5px 12px',
              borderRadius: '16px',
              background: 'rgba(245, 158, 11, 0.12)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              marginBottom: '10px',
            }}
          >
            <Sparkles size={14} color="#f59e0b" />
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              One-Click In-Browser Modding
            </span>
          </div>
          <h2 style={{ fontSize: '30px', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', margin: 0 }}>
            COMMUNITY MOD WORKSHOP
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '14.5px', marginTop: '6px' }}>
            <span style={{ color: '#10b981', fontWeight: 700 }}>{activeCount} of {mods.length} mods active</span> • Layered Virtual File System (VFS) dynamically overrides game assets at runtime.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {onEnableAllRecommended && (
            <button
              onClick={onEnableAllRecommended}
              className="btn btn-primary"
              style={{ fontSize: '13px', padding: '10px 18px', fontWeight: 800 }}
              title="Enables ThirteenAG Widescreen, Xbox 360 Visuals, 4K HUD, and Extra Options with 1 click"
            >
              <Sparkles size={15} fill="#000" />
              1-Click Install Recommended Pack
            </button>
          )}

          <button
            onClick={() => setShowUrlModal(true)}
            className="btn btn-secondary"
            style={{ fontSize: '13px', padding: '10px 16px', borderColor: '#06b6d4', color: '#06b6d4' }}
            title="Download and install a mod directly from an HTTP URL"
          >
            <Link size={15} />
            Install from URL
          </button>

          <label className="btn btn-secondary" style={{ cursor: 'pointer', fontSize: '13px', padding: '10px 16px', borderColor: '#f59e0b', color: '#f59e0b' }}>
            <Upload size={15} />
            Import .mwmod / .zip
            <input
              type="file"
              accept=".mwmod,.zip,.bin"
              style={{ display: 'none' }}
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  onInstallMod(e.target.files[0]);
                  setInstallSuccess(`Successfully installed "${e.target.files[0].name}"!`);
                  setTimeout(() => setInstallSuccess(null), 4000);
                }
              }}
            />
          </label>

          {onResetDefaults && (
            <button
              onClick={onResetDefaults}
              className="btn btn-secondary"
              style={{ fontSize: '13px', padding: '10px 14px' }}
              title="Reset catalog back to community defaults"
            >
              <RefreshCw size={14} />
            </button>
          )}
        </div>
      </div>

      {installSuccess && (
        <div style={{ padding: '14px 20px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', borderRadius: '10px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px', fontWeight: 700 }}>
          <CheckCircle2 size={18} />
          <span>{installSuccess}</span>
        </div>
      )}

      {/* URL Install Modal */}
      {showUrlModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setShowUrlModal(false)}
        >
          <div
            className="glass-panel"
            style={{ maxWidth: '520px', width: '100%', padding: '28px', background: '#121622', border: '1px solid #273042' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>
              Install Mod from Direct URL
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '20px' }}>
              Enter a direct link to a `.zip` or `.mwmod` file hosted on GitHub, NFSMods, or any web server.
            </p>
            <input
              type="text"
              placeholder="https://example.com/mods/my-car-mod.zip"
              value={modUrl}
              onChange={(e) => setModUrl(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 14px',
                background: '#0a0d14',
                border: '1px solid #273042',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '14px',
                marginBottom: '20px',
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button onClick={() => setShowUrlModal(false)} className="btn btn-secondary" style={{ padding: '8px 18px' }}>
                Cancel
              </button>
              <button
                onClick={handleInstallFromUrl}
                disabled={urlDownloading || !modUrl.trim()}
                className="btn btn-primary"
                style={{ padding: '8px 22px', fontWeight: 800 }}
              >
                {urlDownloading ? 'Downloading...' : 'Download & Install'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Drag & Drop Mod Installer Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        style={{
          border: `2px dashed ${dragOver ? '#f59e0b' : '#273042'}`,
          borderRadius: '16px',
          padding: '28px',
          textAlign: 'center',
          background: dragOver ? 'rgba(245, 158, 11, 0.08)' : 'rgba(15, 20, 28, 0.6)',
          marginBottom: '28px',
          transition: 'all 0.2s ease',
          cursor: 'pointer',
        }}
        onClick={() => {
          const fileInput = document.getElementById('drag-drop-mod-input');
          fileInput?.click();
        }}
      >
        <Upload size={32} color={dragOver ? '#f59e0b' : '#64748b'} style={{ margin: '0 auto 12px' }} />
        <div style={{ fontSize: '15px', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>
          Drag & Drop Community Mods Here
        </div>
        <div style={{ fontSize: '13px', color: '#94a3b8' }}>
          Supports <span style={{ color: '#f59e0b' }}>.mwmod</span>, <span style={{ color: '#06b6d4' }}>.zip</span>, and <span style={{ color: '#10b981' }}>.bin</span> mod archives from NFSMods, NFSAddons, and NexusMods.
        </div>
        <input
          id="drag-drop-mod-input"
          type="file"
          accept=".mwmod,.zip,.bin"
          style={{ display: 'none' }}
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              onInstallMod(e.target.files[0]);
              setInstallSuccess(`Successfully installed "${e.target.files[0].name}"!`);
              setTimeout(() => setInstallSuccess(null), 4000);
            }
          }}
        />
      </div>

      {/* Filter & Search Bar */}
      <div style={{ display: 'flex', gap: '14px', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <Search size={16} color="#64748b" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search mods by name, author, or feature..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px 10px 40px',
              background: '#121622',
              border: '1px solid #273042',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '13.5px',
            }}
          />
        </div>

        {/* Category Pills */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
          {[
            { id: 'all', label: 'All Mods' },
            { id: 'graphics', label: 'Graphics & Textures' },
            { id: 'vehicles', label: 'Vehicles & JDM' },
            { id: 'gameplay', label: 'Gameplay & Scripts' },
            { id: 'handling', label: 'Physics & Drift' },
            { id: 'audio_video', label: 'Audio & Cinematics' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className="btn"
              style={{
                fontSize: '12.5px',
                padding: '8px 14px',
                borderRadius: '8px',
                background: categoryFilter === cat.id ? '#f59e0b' : '#121622',
                color: categoryFilter === cat.id ? '#000' : '#94a3b8',
                fontWeight: 700,
                border: categoryFilter === cat.id ? '1px solid #f59e0b' : '1px solid #232b3c',
                whiteSpace: 'nowrap',
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Mod Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '18px' }}>
        {filteredMods.map((mod) => (
          <div
            key={mod.id}
            className="glass-panel"
            style={{
              padding: '22px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              border: mod.enabled ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid #232b3c',
              background: mod.enabled ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.05) 0%, rgba(18, 22, 32, 0.95) 100%)' : '#10141d',
              borderRadius: '14px',
              transition: 'all 0.2s ease',
            }}
          >
            <div>
              {/* Header: Type Pill & Version */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '11px',
                    fontWeight: 800,
                    padding: '3px 8px',
                    borderRadius: '6px',
                    background: 'rgba(255, 255, 255, 0.06)',
                    color: '#cbd5e1',
                    textTransform: 'uppercase',
                  }}
                >
                  {getTypeIcon(mod.type, mod.id)}
                  {getTypeLabel(mod.type, mod.id)}
                </span>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>v{mod.version}</span>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: '10px',
                      background: mod.enabled ? 'rgba(16, 185, 129, 0.15)' : 'rgba(100, 116, 139, 0.15)',
                      color: mod.enabled ? '#10b981' : '#64748b',
                    }}
                  >
                    {mod.enabled ? 'ACTIVE' : 'OFF'}
                  </span>
                </div>
              </div>

              {/* Title & Author */}
              <h4 style={{ fontSize: '17px', fontWeight: 800, color: '#fff', margin: '0 0 6px 0', lineHeight: 1.3 }}>
                {mod.name}
              </h4>
              <div style={{ fontSize: '12px', color: '#f59e0b', fontWeight: 600, marginBottom: '10px' }}>
                by {mod.author}
              </div>

              {/* Description */}
              <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.5, marginBottom: '18px' }}>
                {mod.description}
              </p>
            </div>

            {/* Bottom Actions: Toggle & Priority */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #1e2533', paddingTop: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '11px', color: '#64748b' }}>Priority:</span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#06b6d4' }}>{mod.priority}</span>
                <button
                  onClick={() => onUpdatePriority(mod.id, mod.priority + 5)}
                  className="btn"
                  style={{ padding: '3px 6px', background: '#1c2333', color: '#cbd5e1', borderRadius: '4px' }}
                  title="Increase priority in VFS layer"
                >
                  <ArrowUp size={12} />
                </button>
                <button
                  onClick={() => onUpdatePriority(mod.id, mod.priority - 5)}
                  className="btn"
                  style={{ padding: '3px 6px', background: '#1c2333', color: '#cbd5e1', borderRadius: '4px' }}
                  title="Decrease priority in VFS layer"
                >
                  <ArrowDown size={12} />
                </button>
              </div>

              {/* 1-Click Install/Toggle Button */}
              <button
                onClick={() => onToggleMod(mod.id)}
                className="btn"
                style={{
                  padding: '8px 18px',
                  fontSize: '12.5px',
                  fontWeight: 800,
                  borderRadius: '8px',
                  background: mod.enabled ? 'rgba(239, 68, 68, 0.15)' : '#f59e0b',
                  color: mod.enabled ? '#f87171' : '#000',
                  border: mod.enabled ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid #f59e0b',
                  boxShadow: !mod.enabled ? '0 0 14px rgba(245, 158, 11, 0.3)' : 'none',
                }}
              >
                {mod.enabled ? (
                  <>
                    <Power size={13} />
                    <span>Disable</span>
                  </>
                ) : (
                  <>
                    <Check size={14} />
                    <span>Install & Enable</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
