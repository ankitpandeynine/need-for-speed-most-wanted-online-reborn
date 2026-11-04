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
  CheckCircle2,
  HardDrive,
  Download,
  AlertCircle,
  Loader2,
  Trash2,
} from 'lucide-react';

interface ModManagerViewProps {
  mods: ModItem[];
  onToggleMod: (id: string) => Promise<void> | void;
  onUpdatePriority: (id: string, newPriority: number) => void;
  onInstallMod: (file: File) => Promise<void> | void;
  onEnableAllRecommended?: () => Promise<void> | void;
  onResetDefaults?: () => void;
  onRemoveMod?: (id: string) => Promise<void> | void;
}

export const ModManagerView: React.FC<ModManagerViewProps> = ({
  mods,
  onToggleMod,
  onUpdatePriority,
  onInstallMod,
  onEnableAllRecommended,
  onResetDefaults,
  onRemoveMod,
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [installSuccess, setInstallSuccess] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showUrlModal, setShowUrlModal] = useState(false);
  const [modUrl, setModUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith('.mwmod') || file.name.endsWith('.zip') || file.name.endsWith('.bin')) {
        try {
          setIsProcessing(file.name);
          await onInstallMod(file);
          setInstallSuccess(`Successfully unpacked & applied "${file.name}" to OPFS!`);
          setTimeout(() => setInstallSuccess(null), 4000);
        } catch (err: any) {
          setErrorMessage(`Failed to install archive: ${err.message}`);
          setTimeout(() => setErrorMessage(null), 5000);
        } finally {
          setIsProcessing(null);
        }
      } else {
        alert('Please drop a valid .mwmod or .zip mod archive.');
      }
    }
  };

  const handleInstallFromUrl = async () => {
    if (!modUrl.trim()) return;
    try {
      setIsProcessing('Downloading URL…');
      const res = await fetch(modUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch mod file`);
      const blob = await res.blob();
      const fileName = modUrl.split('/').pop()?.split('?')[0] || 'custom-mod.zip';
      const file = new File([blob], fileName);
      await onInstallMod(file);
      setShowUrlModal(false);
      setModUrl('');
      setInstallSuccess(`Successfully downloaded and applied "${fileName}" to OPFS!`);
      setTimeout(() => setInstallSuccess(null), 4000);
    } catch (err: any) {
      setErrorMessage(`Could not download mod: ${err.message}. Make sure the host supports CORS.`);
      setTimeout(() => setErrorMessage(null), 6000);
    } finally {
      setIsProcessing(null);
    }
  };

  const handleToggle = async (id: string) => {
    try {
      setIsProcessing(id);
      await onToggleMod(id);
    } catch (err: any) {
      setErrorMessage(`Failed to toggle mod: ${err.message}`);
      setTimeout(() => setErrorMessage(null), 5000);
    } finally {
      setIsProcessing(null);
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
    if (categoryFilter === 'options') return mod.type === 'options';
    if (categoryFilter === 'handling') return mod.type === 'handling';
    if (categoryFilter === 'vehicles') return mod.type === 'vehicle';
    return true;
  });

  const activeCount = mods.filter((m) => m.enabled).length;

  const getTypeIcon = (type: string) => {
    if (type === 'texture') return <Sparkles size={14} color="#06b6d4" />;
    if (type === 'vehicle') return <Car size={14} color="#f59e0b" />;
    if (type === 'handling') return <Flame size={14} color="#ef4444" />;
    return <Sliders size={14} color="#a855f7" />;
  };

  const getTypeLabel = (type: string) => {
    if (type === 'texture') return 'Visuals / Shaders';
    if (type === 'vehicle') return 'Vehicle Slot';
    if (type === 'handling') return 'Physics / Drift';
    return 'Core Engine INI';
  };

  return (
    <div className="page-responsive-container">
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
              Real OPFS Mod Engine
            </span>
          </div>
          <h2 style={{ fontSize: 'clamp(24px, 3.5vw, 34px)', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', margin: 0 }}>
            COMMUNITY MOD WORKSHOP
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '14.5px', marginTop: '6px' }}>
            <span style={{ color: '#10b981', fontWeight: 700 }}>{activeCount} of {mods.length} real mods active</span> • Files write directly to OPFS <code style={{ color: '#f59e0b', background: '#171d2b', padding: '2px 6px', borderRadius: '4px' }}>/opfs/nfsmw/game/</code> with automatic backup & restore.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {onEnableAllRecommended && (
            <button
              onClick={() => onEnableAllRecommended()}
              disabled={!!isProcessing}
              className="btn btn-primary"
              style={{ fontSize: '13px', padding: '10px 18px', fontWeight: 800 }}
              title="Enables ThirteenAG Widescreen, Xbox 360 Visuals, 4K Redux, and Extra Options with 1 click"
            >
              <Sparkles size={15} fill="#000" />
              1-Click Recommended Pack
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
              onChange={async (e) => {
                if (e.target.files && e.target.files[0]) {
                  const file = e.target.files[0];
                  try {
                    setIsProcessing(file.name);
                    await onInstallMod(file);
                    setInstallSuccess(`Successfully unpacked & applied "${file.name}" to OPFS!`);
                    setTimeout(() => setInstallSuccess(null), 4000);
                  } catch (err: any) {
                    setErrorMessage(`Failed to install archive: ${err.message}`);
                    setTimeout(() => setErrorMessage(null), 5000);
                  } finally {
                    setIsProcessing(null);
                  }
                }
              }}
            />
          </label>

          {onResetDefaults && (
            <button
              onClick={onResetDefaults}
              className="btn btn-secondary"
              style={{ fontSize: '13px', padding: '10px 14px' }}
              title="Reset catalog back to verified defaults"
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

      {errorMessage && (
        <div style={{ padding: '14px 20px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', borderRadius: '10px', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px', fontWeight: 700 }}>
          <AlertCircle size={18} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* URL Install Modal */}
      {showUrlModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.85)',
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
            style={{ maxWidth: '540px', width: '100%', padding: '28px', background: '#121622', border: '1px solid #273042' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>
              Install Mod from Direct URL
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '20px' }}>
              Enter a direct link to a `.zip` or `.mwmod` archive. Files will be downloaded, verified, and written into OPFS.
            </p>
            <input
              type="text"
              placeholder="https://example.com/mods/my-mod.zip"
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
              <button onClick={() => setShowUrlModal(false)} className="btn btn-secondary" style={{ padding: '8px 16px' }}>
                Cancel
              </button>
              <button
                onClick={handleInstallFromUrl}
                disabled={!modUrl.trim() || !!isProcessing}
                className="btn btn-primary"
                style={{ padding: '8px 20px', fontWeight: 800 }}
              >
                {isProcessing ? <Loader2 size={15} className="spin-anim" /> : <Download size={15} />}
                Download & Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Drag & Drop Target Area */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        style={{
          border: `2px dashed ${dragOver ? '#f59e0b' : '#273042'}`,
          borderRadius: '12px',
          padding: '24px 20px',
          textAlign: 'center',
          background: dragOver ? 'rgba(245, 158, 11, 0.05)' : 'rgba(18, 22, 32, 0.4)',
          marginBottom: '28px',
          transition: 'all 0.2s ease',
        }}
      >
        <Upload size={28} color={dragOver ? '#f59e0b' : '#64748b'} style={{ margin: '0 auto 10px' }} />
        <div style={{ fontSize: '15px', fontWeight: 700, color: '#fff' }}>
          Drop any .mwmod or .zip Mod Package here
        </div>
        <div style={{ fontSize: '12.5px', color: '#94a3b8', marginTop: '4px' }}>
          Native Web Streams extraction writes directly to <code style={{ color: '#06b6d4' }}>/opfs/nfsmw/game/</code> with zero server dependency.
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <Search size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search verified mods by name, author, or feature..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px 10px 38px',
              background: '#121622',
              border: '1px solid #273042',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '13.5px',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: 'All Mods' },
            { id: 'graphics', label: 'Visuals & Redux' },
            { id: 'options', label: 'Options & FOV' },
            { id: 'handling', label: 'Physics & Drift' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                border: '1px solid',
                borderColor: categoryFilter === cat.id ? '#f59e0b' : '#273042',
                background: categoryFilter === cat.id ? 'rgba(245, 158, 11, 0.15)' : '#121622',
                color: categoryFilter === cat.id ? '#f59e0b' : '#94a3b8',
                fontSize: '12.5px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Mods Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
          gap: '18px',
        }}
      >
        {filteredMods.map((mod) => {
          const isBusy = isProcessing === mod.id;
          return (
            <div
              key={mod.id}
              className="glass-panel"
              style={{
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                border: `1px solid ${mod.enabled ? 'rgba(245, 158, 11, 0.4)' : '#273042'}`,
                background: mod.enabled
                  ? 'linear-gradient(145deg, rgba(20, 26, 38, 0.95) 0%, rgba(13, 17, 24, 0.95) 100%)'
                  : 'rgba(15, 19, 28, 0.6)',
                boxShadow: mod.enabled ? '0 4px 20px rgba(245, 158, 11, 0.08)' : 'none',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '11px',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      color: '#cbd5e1',
                    }}
                  >
                    {getTypeIcon(mod.type)}
                    {getTypeLabel(mod.type)}
                  </span>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>v{mod.version}</span>
                    {mod.verified && (
                      <span
                        title="Verified authentic mod for NFS Most Wanted 2005"
                        style={{
                          fontSize: '10px',
                          fontWeight: 800,
                          color: '#10b981',
                          background: 'rgba(16, 185, 129, 0.1)',
                          border: '1px solid rgba(16, 185, 129, 0.3)',
                          padding: '1px 6px',
                          borderRadius: '4px',
                        }}
                      >
                        VERIFIED
                      </span>
                    )}
                  </div>
                </div>

                <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#fff', marginBottom: '6px', letterSpacing: '-0.01em' }}>
                  {mod.name}
                </h3>

                <div style={{ fontSize: '11.5px', color: '#f59e0b', fontWeight: 700, marginBottom: '8px' }}>
                  by {mod.author}
                </div>

                <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.5, marginBottom: '16px' }}>
                  {mod.description}
                </p>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderTop: '1px solid #1f2737', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11.5px', color: '#64748b' }}>
                    <HardDrive size={13} />
                    <span>{mod.assetsCount} OPFS File Overrides</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>Priority</span>
                    <button
                      onClick={() => onUpdatePriority(mod.id, mod.priority + 5)}
                      className="nfsmw-hud-btn"
                      style={{ padding: '2px 6px' }}
                      title="Increase priority order"
                    >
                      <ArrowUp size={11} />
                    </button>
                    <span style={{ fontSize: '12px', fontWeight: 800, color: '#fff', minWidth: '22px', textAlign: 'center' }}>
                      {mod.priority}
                    </span>
                    <button
                      onClick={() => onUpdatePriority(mod.id, Math.max(1, mod.priority - 5))}
                      className="nfsmw-hud-btn"
                      style={{ padding: '2px 6px' }}
                      title="Decrease priority order"
                    >
                      <ArrowDown size={11} />
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => handleToggle(mod.id)}
                    disabled={isBusy}
                    className="btn"
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '8px 14px',
                      fontSize: '12.5px',
                      fontWeight: 800,
                      background: mod.enabled ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                      border: `1px solid ${mod.enabled ? '#ef4444' : '#10b981'}`,
                      color: mod.enabled ? '#ef4444' : '#10b981',
                      borderRadius: '8px',
                      cursor: 'pointer',
                    }}
                  >
                    {isBusy ? (
                      <Loader2 size={14} className="spin-anim" />
                    ) : mod.enabled ? (
                      <>
                        <Power size={14} />
                        <span>Disable Mod (Revert to Clean)</span>
                      </>
                    ) : (
                      <>
                        <Check size={14} />
                        <span>Enable Mod (Apply to OPFS)</span>
                      </>
                    )}
                  </button>

                  {onRemoveMod && !mod.verified && (
                    <button
                      onClick={() => onRemoveMod(mod.id)}
                      className="btn btn-secondary"
                      style={{ padding: '8px 12px', borderColor: '#ef4444', color: '#ef4444' }}
                      title="Remove custom mod"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
