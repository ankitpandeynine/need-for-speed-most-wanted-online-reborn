import React, { useState, useMemo } from 'react';
import { ModItem, ModConflict, ModProfile } from '../types';
import { ModManagerService } from '../services/modManager';
import {
  Sparkles,
  Upload,
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
  AlertCircle,
  Loader2,
  Trash2,
  Plus,
  Save,
  ShieldAlert,
  Volume2,
  Layers,
} from 'lucide-react';

interface ModManagerViewProps {
  mods: ModItem[];
  onToggleMod: (id: string) => Promise<void> | void;
  onUpdatePriority: (id: string, newPriority: number) => void;
  onInstallMod: (file: File) => Promise<void> | void;
  onEnableAllRecommended?: () => Promise<void> | void;
  onResetDefaults?: () => void;
  onRemoveMod?: (id: string) => Promise<void> | void;
  onApplyProfile?: (profileId: string) => Promise<void> | void;
  onCreateCustomMod?: (options: {
    name: string;
    category: string;
    author: string;
    description: string;
    priority: number;
    targetPath: string;
    file: File | Blob;
  }) => Promise<void> | void;
}

export const ModManagerView: React.FC<ModManagerViewProps> = ({
  mods,
  onToggleMod,
  onUpdatePriority,
  onInstallMod,
  onEnableAllRecommended,
  onResetDefaults,
  onRemoveMod,
  onApplyProfile,
  onCreateCustomMod,
}) => {
  const modService = useMemo(() => ModManagerService.getInstance(), []);

  // UI state
  const [dragOver, setDragOver] = useState(false);
  const [installSuccess, setInstallSuccess] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'enabled' | 'conflicts'>('all');
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  // Modals
  const [showUrlModal, setShowUrlModal] = useState(false);
  const [modUrl, setModUrl] = useState('');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [profileDesc, setProfileDesc] = useState('');
  const [showAddCustomModal, setShowAddCustomModal] = useState(false);

  // Custom mod form state
  const [customModName, setCustomModName] = useState('');
  const [customModCategory, setCustomModCategory] = useState('graphics');
  const [customModAuthor, setCustomModAuthor] = useState('');
  const [customModDesc, setCustomModDesc] = useState('');
  const [customModTargetPath, setCustomModTargetPath] = useState('scripts/CustomMod.ini');
  const [customModPriority, setCustomModPriority] = useState(80);
  const [customModFile, setCustomModFile] = useState<File | null>(null);

  // Profiles & conflicts
  const profiles: ModProfile[] = modService.getProfiles();
  const activeProfileId = modService.getActiveProfileId();
  const conflicts: ModConflict[] = modService.detectConflicts();

  const activeCount = mods.filter((m) => m.enabled).length;

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: mods.length,
      graphics: 0,
      vehicles: 0,
      audio_cutscenes: 0,
      gameplay: 0,
      hud_ui: 0,
      scripts: 0,
    };
    for (const m of mods) {
      const cat = m.category || m.type;
      if (cat in counts) counts[cat]++;
      else if (cat === 'texture') counts.graphics++;
      else if (cat === 'vehicle') counts.vehicles++;
      else if (cat === 'handling') counts.gameplay++;
      else if (cat === 'options') counts.scripts++;
    }
    return counts;
  }, [mods]);

  // Conflict lookup sets
  const conflictLosingModIds = useMemo(() => {
    return new Set(conflicts.map((c) => c.conflictingModId));
  }, [conflicts]);

  const conflictWinningModIds = useMemo(() => {
    return new Set(conflicts.map((c) => c.winningModId));
  }, [conflicts]);

  // Filtered mods list
  const filteredMods = useMemo(() => {
    return mods.filter((mod) => {
      // 1. Search Query
      const q = searchQuery.toLowerCase().trim();
      if (q) {
        const matchesName = mod.name.toLowerCase().includes(q);
        const matchesDesc = mod.description.toLowerCase().includes(q);
        const matchesAuthor = mod.author.toLowerCase().includes(q);
        const matchesPaths = mod.targetPaths?.some((p) => p.toLowerCase().includes(q));
        if (!matchesName && !matchesDesc && !matchesAuthor && !matchesPaths) return false;
      }

      // 2. Category Filter
      if (categoryFilter !== 'all') {
        const cat = mod.category || mod.type;
        const matchesCat =
          cat === categoryFilter ||
          (categoryFilter === 'graphics' && cat === 'texture') ||
          (categoryFilter === 'vehicles' && cat === 'vehicle') ||
          (categoryFilter === 'gameplay' && cat === 'handling') ||
          (categoryFilter === 'scripts' && cat === 'options');
        if (!matchesCat) return false;
      }

      // 3. Status Filter
      if (statusFilter === 'enabled' && !mod.enabled) return false;
      if (statusFilter === 'conflicts' && !conflictLosingModIds.has(mod.id)) return false;

      return true;
    });
  }, [mods, searchQuery, categoryFilter, statusFilter, conflictLosingModIds]);

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

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
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

  const handleSaveProfile = () => {
    if (!profileName.trim()) return;
    modService.saveCustomProfile(profileName, profileDesc);
    setShowProfileModal(false);
    setProfileName('');
    setProfileDesc('');
    setInstallSuccess(`Profile "${profileName}" saved!`);
    setTimeout(() => setInstallSuccess(null), 3500);
  };

  const handleCreateCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customModName.trim() || !customModFile) {
      setErrorMessage('Please provide a mod name and select a file.');
      setTimeout(() => setErrorMessage(null), 4000);
      return;
    }

    try {
      setIsProcessing('Creating mod…');
      if (onCreateCustomMod) {
        await onCreateCustomMod({
          name: customModName.trim(),
          category: customModCategory,
          author: customModAuthor.trim() || 'User Added',
          description: customModDesc.trim() || `Custom mod for ${customModTargetPath}`,
          priority: customModPriority,
          targetPath: customModTargetPath.trim(),
          file: customModFile,
        });
      } else {
        await modService.createCustomMod({
          name: customModName.trim(),
          category: customModCategory,
          author: customModAuthor.trim() || 'User Added',
          description: customModDesc.trim() || `Custom mod for ${customModTargetPath}`,
          priority: customModPriority,
          targetPath: customModTargetPath.trim(),
          file: customModFile,
        });
      }
      setShowAddCustomModal(false);
      setCustomModName('');
      setCustomModAuthor('');
      setCustomModDesc('');
      setCustomModFile(null);
      setInstallSuccess(`Custom mod "${customModName}" installed to OPFS!`);
      setTimeout(() => setInstallSuccess(null), 4000);
    } catch (err: any) {
      setErrorMessage(`Failed to create custom mod: ${err.message}`);
      setTimeout(() => setErrorMessage(null), 5000);
    } finally {
      setIsProcessing(null);
    }
  };

  const getCategoryIcon = (cat: string) => {
    if (cat === 'graphics' || cat === 'texture') return <Sparkles size={14} color="#06b6d4" />;
    if (cat === 'vehicles' || cat === 'vehicle') return <Car size={14} color="#f59e0b" />;
    if (cat === 'audio_cutscenes' || cat === 'audio') return <Volume2 size={14} color="#10b981" />;
    if (cat === 'gameplay' || cat === 'handling') return <Flame size={14} color="#ef4444" />;
    if (cat === 'hud_ui') return <Layers size={14} color="#3b82f6" />;
    return <Sliders size={14} color="#a855f7" />;
  };

  const getCategoryLabel = (cat: string) => {
    if (cat === 'graphics' || cat === 'texture') return 'Graphics & Visuals';
    if (cat === 'vehicles' || cat === 'vehicle') return 'Cars & Vehicles';
    if (cat === 'audio_cutscenes' || cat === 'audio') return 'Audio & Cutscenes';
    if (cat === 'gameplay' || cat === 'handling') return 'Gameplay & Physics';
    if (cat === 'hud_ui') return 'HUD & UI Scaling';
    return 'Scripts & Tools';
  };

  return (
    <div className="page-responsive-container">
      {/* Top Banner */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '4px 12px',
              borderRadius: '16px',
              background: 'rgba(245, 158, 11, 0.12)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              marginBottom: '8px',
            }}
          >
            <Sparkles size={13} color="#f59e0b" />
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Multi-Mod Engine & Conflict Resolver
            </span>
          </div>
          <h2 style={{ fontSize: 'clamp(22px, 3.2vw, 32px)', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', margin: 0 }}>
            COMMUNITY MOD WORKSHOP
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '13.5px', marginTop: '4px', margin: 0 }}>
            <span style={{ color: '#10b981', fontWeight: 700 }}>{activeCount} of {mods.length} real mods active</span> • Real game binaries in OPFS <code style={{ color: '#f59e0b', background: '#171d2b', padding: '2px 6px', borderRadius: '4px' }}>/opfs/nfsmw/game/</code>
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setShowAddCustomModal(true)}
            className="btn btn-primary"
            style={{ fontSize: '12.5px', padding: '9px 15px', fontWeight: 800 }}
            title="Add your own custom car, physics attributes, or script mod"
          >
            <Plus size={15} />
            Add Custom Mod
          </button>

          {onEnableAllRecommended && (
            <button
              onClick={() => onEnableAllRecommended()}
              disabled={!!isProcessing}
              className="btn btn-secondary"
              style={{ fontSize: '12.5px', padding: '9px 14px', fontWeight: 800, borderColor: '#f59e0b', color: '#f59e0b' }}
              title="Enables ThirteenAG Widescreen, Xbox 360 Visuals, NoFilter, and HUD Adapter with 1 click"
            >
              <Sparkles size={14} color="#f59e0b" />
              Recommended Pack
            </button>
          )}

          <button
            onClick={() => setShowUrlModal(true)}
            className="btn btn-secondary"
            style={{ fontSize: '12.5px', padding: '9px 14px', borderColor: '#06b6d4', color: '#06b6d4' }}
            title="Download and install a mod directly from an HTTP URL"
          >
            <Link size={14} />
            From URL
          </button>

          <label className="btn btn-secondary" style={{ cursor: 'pointer', fontSize: '12.5px', padding: '9px 14px' }}>
            <Upload size={14} />
            Import Archive
            <input
              type="file"
              accept=".mwmod,.zip,.bin,.asi,.ini,.nfsms"
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
              style={{ fontSize: '12.5px', padding: '9px 12px' }}
              title="Reset catalog back to verified defaults"
            >
              <RefreshCw size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Profiles Bar */}
      <div
        className="glass-panel"
        style={{
          padding: '12px 18px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          background: 'rgba(15, 20, 30, 0.7)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '12px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Mod Profile:
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            {profiles.map((p) => {
              const isActive = p.id === activeProfileId;
              return (
                <div
                  key={p.id}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 10px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: isActive ? '#f59e0b' : 'rgba(30, 41, 59, 0.7)',
                    color: isActive ? '#000' : '#cbd5e1',
                    border: `1px solid ${isActive ? '#f59e0b' : 'rgba(71, 85, 105, 0.3)'}`,
                    transition: 'all 0.15s ease',
                  }}
                  onClick={async () => {
                    if (onApplyProfile) {
                      await onApplyProfile(p.id);
                    } else {
                      await modService.applyProfile(p.id);
                    }
                  }}
                  title={p.description}
                >
                  <span>{p.icon || '📁'}</span>
                  <span>{p.name}</span>
                  {!p.isPreset && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Delete custom profile "${p.name}"?`)) {
                          modService.deleteCustomProfile(p.id);
                        }
                      }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: isActive ? '#000' : '#ef4444',
                        cursor: 'pointer',
                        padding: '0 2px',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                      title="Delete profile"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <button
          onClick={() => setShowProfileModal(true)}
          className="btn btn-secondary"
          style={{ fontSize: '11.5px', padding: '6px 12px', gap: '5px' }}
          title="Save the currently active mod set as a new custom profile"
        >
          <Save size={13} color="#f59e0b" />
          <span>Save Current as Profile</span>
        </button>
      </div>

      {/* Conflict Warning Alert Banner */}
      {conflicts.length > 0 && (
        <div
          style={{
            padding: '14px 18px',
            background: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.35)',
            borderRadius: '10px',
            marginBottom: '20px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f59e0b', fontWeight: 800, fontSize: '13.5px', marginBottom: '6px' }}>
            <ShieldAlert size={18} color="#f59e0b" />
            <span>File Precedence Notice ({conflicts.length} overlapping files between active mods)</span>
          </div>
          <div style={{ fontSize: '12.5px', color: '#cbd5e1', lineHeight: 1.5 }}>
            {conflicts.slice(0, 3).map((c, i) => (
              <div key={i} style={{ marginTop: '3px' }}>
                • <code style={{ color: '#f59e0b', background: '#1c1f2e', padding: '1px 5px', borderRadius: '4px' }}>{c.filePath}</code>:{' '}
                <strong>{c.winningModName}</strong> takes precedence over <em>{c.conflictingModName}</em>. Adjust priority arrows below to change which mod wins.
              </div>
            ))}
            {conflicts.length > 3 && (
              <div style={{ color: '#94a3b8', fontSize: '11.5px', marginTop: '4px' }}>
                + {conflicts.length - 3} more overlapping paths automatically resolved by priority order.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Notifications */}
      {installSuccess && (
        <div style={{ padding: '12px 18px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', borderRadius: '8px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px', fontWeight: 700, fontSize: '13px' }}>
          <CheckCircle2 size={16} />
          <span>{installSuccess}</span>
        </div>
      )}

      {errorMessage && (
        <div style={{ padding: '12px 18px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', borderRadius: '8px', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px', fontWeight: 700, fontSize: '13px' }}>
          <AlertCircle size={16} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Category Filter Pills on Top */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', overflowX: 'auto', paddingBottom: '4px' }}>
        {[
          { id: 'all', label: 'All Mods', icon: Layers },
          { id: 'graphics', label: 'Graphics & Visuals', icon: Sparkles },
          { id: 'vehicles', label: 'Cars & Vehicles', icon: Car },
          { id: 'audio_cutscenes', label: 'Audio & Cutscenes', icon: Volume2 },
          { id: 'gameplay', label: 'Gameplay & Physics', icon: Flame },
          { id: 'hud_ui', label: 'HUD & UI', icon: Layers },
          { id: 'scripts', label: 'Scripts & Tools', icon: Sliders },
        ].map((tab) => {
          const Icon = tab.icon;
          const isSelected = categoryFilter === tab.id;
          const count = categoryCounts[tab.id] || 0;
          return (
            <button
              key={tab.id}
              onClick={() => setCategoryFilter(tab.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '12.5px',
                fontWeight: 700,
                border: `1px solid ${isSelected ? '#f59e0b' : 'rgba(71, 85, 105, 0.4)'}`,
                background: isSelected ? 'rgba(245, 158, 11, 0.18)' : 'rgba(15, 20, 30, 0.6)',
                color: isSelected ? '#f59e0b' : '#94a3b8',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
              }}
            >
              <Icon size={14} color={isSelected ? '#f59e0b' : 'currentColor'} />
              <span>{tab.label}</span>
              <span
                style={{
                  fontSize: '10.5px',
                  padding: '1px 6px',
                  borderRadius: '10px',
                  background: isSelected ? '#f59e0b' : 'rgba(51, 65, 85, 0.5)',
                  color: isSelected ? '#000' : '#cbd5e1',
                  fontWeight: 800,
                }}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search and Secondary Filter Row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
          <Search size={15} color="#64748b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search mods by name, author, or game file (e.g. attributes.bin, BMWM3)..."
            style={{
              width: '100%',
              padding: '9px 12px 9px 36px',
              borderRadius: '8px',
              border: '1px solid #273042',
              background: 'rgba(15, 20, 30, 0.8)',
              color: '#fff',
              fontSize: '13px',
              outline: 'none',
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {(['all', 'enabled', 'conflicts'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 700,
                border: `1px solid ${statusFilter === s ? '#3b82f6' : 'rgba(51, 65, 85, 0.4)'}`,
                background: statusFilter === s ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                color: statusFilter === s ? '#60a5fa' : '#94a3b8',
                cursor: 'pointer',
              }}
            >
              {s === 'all' ? 'All Status' : s === 'enabled' ? 'Active Only' : 'Collisions Only'}
            </button>
          ))}
        </div>
      </div>

      {/* Drag & Drop Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        style={{
          border: `2px dashed ${dragOver ? '#f59e0b' : '#273042'}`,
          borderRadius: '10px',
          padding: '16px',
          textAlign: 'center',
          background: dragOver ? 'rgba(245, 158, 11, 0.08)' : 'rgba(15, 20, 30, 0.4)',
          marginBottom: '24px',
          transition: 'all 0.2s ease',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', color: '#94a3b8', fontSize: '13px' }}>
          <Upload size={18} color={dragOver ? '#f59e0b' : '#64748b'} />
          <span>Drag & drop any <strong>.mwmod</strong>, <strong>.zip</strong>, or raw game file (<strong>.bin</strong>, <strong>.asi</strong>, <strong>.ini</strong>, <strong>.nfsms</strong>) here to instantly install into OPFS.</span>
        </div>
      </div>

      {/* Mods Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
          gap: '16px',
        }}
      >
        {filteredMods.map((mod) => {
          const hasOverriddenConflict = conflictLosingModIds.has(mod.id);
          const hasWinningConflict = conflictWinningModIds.has(mod.id);
          const isBusy = isProcessing === mod.id;

          const conflictDetails = conflicts.find((c) => c.conflictingModId === mod.id);

          return (
            <div
              key={mod.id}
              className="glass-panel"
              style={{
                padding: '18px',
                borderRadius: '12px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                border: hasOverriddenConflict
                  ? '1px solid rgba(245, 158, 11, 0.5)'
                  : mod.enabled
                  ? '1px solid rgba(16, 185, 129, 0.35)'
                  : '1px solid rgba(51, 65, 85, 0.3)',
                background: mod.enabled ? 'rgba(16, 22, 34, 0.85)' : 'rgba(12, 16, 24, 0.7)',
                position: 'relative',
              }}
            >
              {/* Card Header: Category Badge & Status Switch */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '11px',
                      fontWeight: 800,
                      color: '#94a3b8',
                      background: 'rgba(30, 41, 59, 0.6)',
                      padding: '3px 8px',
                      borderRadius: '12px',
                    }}
                  >
                    {getCategoryIcon(mod.category || mod.type)}
                    <span>{getCategoryLabel(mod.category || mod.type)}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {/* Priority Control Arrows */}
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', background: 'rgba(15, 20, 30, 0.8)', padding: '2px 4px', borderRadius: '6px', border: '1px solid #273042' }}>
                      <button
                        onClick={() => onUpdatePriority(mod.id, mod.priority + 5)}
                        style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center' }}
                        title="Increase priority (wins file conflicts)"
                      >
                        <ArrowUp size={12} />
                      </button>
                      <span style={{ fontSize: '11px', fontWeight: 800, color: '#f59e0b', minWidth: '22px', textAlign: 'center' }}>
                        {mod.priority}
                      </span>
                      <button
                        onClick={() => onUpdatePriority(mod.id, Math.max(1, mod.priority - 5))}
                        style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center' }}
                        title="Decrease priority"
                      >
                        <ArrowDown size={12} />
                      </button>
                    </div>

                    {/* Enable / Disable Toggle Switch */}
                    <button
                      onClick={() => handleToggle(mod.id)}
                      disabled={isBusy}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '4px 10px',
                        borderRadius: '14px',
                        fontSize: '11.5px',
                        fontWeight: 800,
                        border: 'none',
                        cursor: isBusy ? 'wait' : 'pointer',
                        background: mod.enabled ? '#10b981' : '#334155',
                        color: mod.enabled ? '#000' : '#cbd5e1',
                        transition: 'all 0.15s ease',
                      }}
                      title={mod.enabled ? 'Click to disable and restore vanilla game files' : 'Click to enable and apply files into OPFS'}
                    >
                      {isBusy ? <Loader2 size={12} className="spin" /> : <Power size={12} />}
                      <span>{mod.enabled ? 'ACTIVE' : 'OFF'}</span>
                    </button>
                  </div>
                </div>

                {/* Conflict Warnings on Card */}
                {hasOverriddenConflict && conflictDetails && (
                  <div
                    style={{
                      padding: '6px 10px',
                      borderRadius: '6px',
                      background: 'rgba(245, 158, 11, 0.15)',
                      border: '1px solid rgba(245, 158, 11, 0.3)',
                      color: '#fbbf24',
                      fontSize: '11px',
                      fontWeight: 600,
                      marginBottom: '10px',
                    }}
                  >
                    ⚠️ Overridden on <code style={{ color: '#fff' }}>{conflictDetails.filePath}</code> by <strong>"{conflictDetails.winningModName}"</strong>. Tap ▲ to take precedence.
                  </div>
                )}

                {hasWinningConflict && !hasOverriddenConflict && (
                  <div
                    style={{
                      padding: '4px 8px',
                      borderRadius: '6px',
                      background: 'rgba(16, 185, 129, 0.12)',
                      border: '1px solid rgba(16, 185, 129, 0.25)',
                      color: '#10b981',
                      fontSize: '11px',
                      fontWeight: 700,
                      marginBottom: '10px',
                    }}
                  >
                    🛡️ Active Provider (Wins overlapping file collisions)
                  </div>
                )}

                {/* Mod Name & Details */}
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#fff', margin: '0 0 6px 0', lineHeight: 1.3 }}>
                  {mod.name}
                </h3>

                <p style={{ color: '#94a3b8', fontSize: '13px', lineHeight: 1.45, margin: '0 0 12px 0' }}>
                  {mod.description}
                </p>

                {/* Target File Tags */}
                {mod.targetPaths && mod.targetPaths.length > 0 && (
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '12px' }}>
                    {mod.targetPaths.map((p, idx) => (
                      <span
                        key={idx}
                        style={{
                          fontSize: '10px',
                          color: '#67e8f9',
                          background: 'rgba(6, 182, 212, 0.1)',
                          border: '1px solid rgba(6, 182, 212, 0.2)',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontFamily: 'monospace',
                        }}
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Card Footer: Metadata & Actions */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '10px',
                  borderTop: '1px solid rgba(51, 65, 85, 0.3)',
                  fontSize: '11.5px',
                  color: '#64748b',
                }}
              >
                <div>
                  By <strong style={{ color: '#cbd5e1' }}>{mod.author}</strong> • v{mod.version}
                  {mod.fileSize ? ` • ${(mod.fileSize / 1024 ** (mod.fileSize > 1024 * 1024 ? 2 : 1)).toFixed(1)} ${mod.fileSize > 1024 * 1024 ? 'MB' : 'KB'}` : ''}
                </div>

                {onRemoveMod && !mod.verified && (
                  <button
                    onClick={() => {
                      if (confirm(`Remove custom mod "${mod.name}"?`)) {
                        onRemoveMod(mod.id);
                      }
                    }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#ef4444',
                      cursor: 'pointer',
                      fontSize: '11px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                    title="Delete mod from storage"
                  >
                    <Trash2 size={12} /> Remove
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Save Profile */}
      {showProfileModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '16px',
          }}
          onClick={() => setShowProfileModal(false)}
        >
          <div
            className="glass-panel"
            style={{ width: 'min(480px, 100%)', padding: '24px', borderRadius: '12px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', margin: '0 0 8px 0' }}>
              Save Custom Mod Profile
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '18px' }}>
              Snapshot your currently active {activeCount} mods so you can switch back to this configuration anytime.
            </p>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>
                Profile Name
              </label>
              <input
                type="text"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                placeholder="e.g. My 4K Drift Setup"
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '6px',
                  border: '1px solid #334155',
                  background: '#0f141e',
                  color: '#fff',
                  fontSize: '13px',
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>
                Description (Optional)
              </label>
              <input
                type="text"
                value={profileDesc}
                onChange={(e) => setProfileDesc(e.target.value)}
                placeholder="e.g. Best settings for drifting with BMW M3 GTR"
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '6px',
                  border: '1px solid #334155',
                  background: '#0f141e',
                  color: '#fff',
                  fontSize: '13px',
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => setShowProfileModal(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button onClick={handleSaveProfile} className="btn btn-primary">
                Save Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add Custom Mod */}
      {showAddCustomModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '16px',
          }}
          onClick={() => setShowAddCustomModal(false)}
        >
          <form
            className="glass-panel"
            style={{ width: 'min(520px, 100%)', padding: '24px', borderRadius: '12px' }}
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleCreateCustomSubmit}
          >
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', margin: '0 0 6px 0' }}>
              Add Your Own Custom Mod
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '18px' }}>
              Inject any custom car model, texture, handling binary, or script directly into the game's browser filesystem.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#cbd5e1', marginBottom: '4px' }}>
                  Mod Name *
                </label>
                <input
                  type="text"
                  required
                  value={customModName}
                  onChange={(e) => setCustomModName(e.target.value)}
                  placeholder="e.g. Nissan Skyline R34"
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    border: '1px solid #334155',
                    background: '#0f141e',
                    color: '#fff',
                    fontSize: '13px',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#cbd5e1', marginBottom: '4px' }}>
                  Category *
                </label>
                <select
                  value={customModCategory}
                  onChange={(e) => setCustomModCategory(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    border: '1px solid #334155',
                    background: '#0f141e',
                    color: '#fff',
                    fontSize: '13px',
                  }}
                >
                  <option value="graphics">Graphics & Visuals</option>
                  <option value="vehicles">Cars & Vehicles</option>
                  <option value="audio_cutscenes">Audio & Cutscenes</option>
                  <option value="gameplay">Gameplay & Physics</option>
                  <option value="hud_ui">HUD & UI</option>
                  <option value="scripts">Scripts & Tools</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#cbd5e1', marginBottom: '4px' }}>
                  Author
                </label>
                <input
                  type="text"
                  value={customModAuthor}
                  onChange={(e) => setCustomModAuthor(e.target.value)}
                  placeholder="e.g. Your Name"
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    border: '1px solid #334155',
                    background: '#0f141e',
                    color: '#fff',
                    fontSize: '13px',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#cbd5e1', marginBottom: '4px' }}>
                  Priority ({customModPriority})
                </label>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={customModPriority}
                  onChange={(e) => setCustomModPriority(parseInt(e.target.value, 10))}
                  style={{ width: '100%', marginTop: '6px' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#cbd5e1', marginBottom: '4px' }}>
                Target Game Path inside OPFS *
              </label>
              <input
                type="text"
                required
                value={customModTargetPath}
                onChange={(e) => setCustomModTargetPath(e.target.value)}
                placeholder="e.g. GLOBAL/attributes.bin or CARS/BMWM3/GEOMETRY.BIN"
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  border: '1px solid #334155',
                  background: '#0f141e',
                  color: '#fff',
                  fontSize: '13px',
                  fontFamily: 'monospace',
                }}
              />
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
                <span style={{ fontSize: '11px', color: '#64748b' }}>Quick suggestions:</span>
                {[
                  'GLOBAL/attributes.bin',
                  'CARS/BMWM3/GEOMETRY.BIN',
                  'scripts/NFSMWHUDAdapter.ini',
                  'scripts/NoFilter.ini',
                  'GLOBAL/gameplay.bin',
                ].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setCustomModTargetPath(s)}
                    style={{
                      background: 'rgba(51, 65, 85, 0.4)',
                      border: 'none',
                      borderRadius: '4px',
                      color: '#94a3b8',
                      fontSize: '10.5px',
                      padding: '2px 6px',
                      cursor: 'pointer',
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#cbd5e1', marginBottom: '4px' }}>
                Mod File (.bin, .asi, .ini, .nfsms, .zip, .mwmod) *
              </label>
              <input
                type="file"
                required
                onChange={(e) => setCustomModFile(e.target.files?.[0] || null)}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '6px',
                  border: '1px solid #334155',
                  background: '#0f141e',
                  color: '#fff',
                  fontSize: '12.5px',
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setShowAddCustomModal(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Install & Apply Mod
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal: URL Install */}
      {showUrlModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '16px',
          }}
          onClick={() => setShowUrlModal(false)}
        >
          <div
            className="glass-panel"
            style={{ width: 'min(480px, 100%)', padding: '24px', borderRadius: '12px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', margin: '0 0 8px 0' }}>
              Download Mod from URL
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '18px' }}>
              Enter the direct HTTP/HTTPS download link of any .mwmod or .zip archive.
            </p>

            <input
              type="url"
              value={modUrl}
              onChange={(e) => setModUrl(e.target.value)}
              placeholder="https://example.com/mods/my-car-mod.mwmod"
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '6px',
                border: '1px solid #334155',
                background: '#0f141e',
                color: '#fff',
                fontSize: '13px',
                marginBottom: '20px',
              }}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => setShowUrlModal(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button onClick={handleInstallFromUrl} className="btn btn-primary">
                Download & Install
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
