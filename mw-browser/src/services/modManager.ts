/**
 * Need for Speed: Most Wanted (2005) — Browser Edition
 * Real OPFS Mod Manager Service:
 * Directly downloads, unpacks, installs, and swaps real mod files in /opfs/nfsmw/game/.
 * Strictly no mock or spoofed catalog items. Supports multi-mod activation,
 * real-time conflict detection with priority overrides, custom profiles, and custom user mods.
 */

import { ModItem, ModConflict, ModProfile } from '../types';
import {
  extractZipEntries,
  writeGameFile,
  backupGameFile,
  restoreGameFile,
  isRealGameAsset,
  writeModCacheFile,
  getModCacheFile,
  listModCacheFiles,
} from './opfsModStorage';

const STORAGE_KEY = 'nfsmw_real_mods';
const PROFILES_STORAGE_KEY = 'nfsmw_mod_profiles';
const ACTIVE_PROFILE_KEY = 'nfsmw_active_profile_id';
const MOD_FILES_PREFIX = 'nfsmw_mod_files_';

export const VERIFIED_REAL_MODS: ModItem[] = [
  {
    id: 'retouch-graphics-rg-v9-1',
    name: 'Retouch Graphics (RG v9.1) Remaster',
    version: '9.1.0',
    author: 'Elay / Aksine',
    description: 'Complete next-generation graphics remaster: custom compiled DirectX shaders (IDI_CAR, IDI_FILTER, IDI_WORLD, IDI_VISUALTREATMENT), ShaderLoader, bloom increaser, motion blur, and cinematic lighting.',
    type: 'graphics',
    category: 'graphics',
    enabled: true,
    priority: 98,
    assetsCount: 36,
    downloadUrl: '/mods/retouch-graphics-rg-v9-1-9.1.0.mwmod',
    fileSize: 2065000,
    isInstalled: true,
    verified: true,
    targetPaths: [
      'IDI_CAR_FX',
      'IDI_FILTER_FX',
      'IDI_VISUALTREATMENT_FX',
      'IDI_WORLD_FX',
      'GLOBAL/GLOBALA.BUN',
      'scripts/XNFS-ShaderLoader-MW.asi',
      'scripts/NFSMWGraphics.asi',
      'scripts/BloomResIncreaser.asi',
      'scripts/NextGenGraphics.MostWanted.asi',
      'scripts/RGv9.1 visual settings.nfsms',
    ],
  },
  {
    id: 'thirteenag-widescreen-fov',
    name: 'ThirteenAG Widescreen Fix & HD Reflections',
    version: '1.0.0',
    author: 'ThirteenAG / Aero_',
    description: 'Dynamic 16:9 / 21:9 Hor+ scaling, FOV correction, unstretched speedometer dial geometry, HD real-time reflections, and fixed 120 Hz simulation.',
    type: 'hud_ui',
    category: 'hud_ui',
    enabled: true,
    priority: 100,
    assetsCount: 4,
    downloadUrl: '/mods/thirteenag-widescreen-fov-1.0.0.mwmod',
    fileSize: 330600,
    isInstalled: true,
    verified: true,
    targetPaths: [
      'scripts/NFSMostWanted.WidescreenFix.asi',
      'scripts/NFSMostWanted.WidescreenFix.ini',
      'scripts/NFSMWHDReflections.asi',
      'scripts/NFSMWHDReflections.ini',
    ],
  },
  {
    id: 'ba508c-nofilter',
    name: 'NoFilter Lighting & Vibrant Atmospheric Clarity',
    version: '1.2.0',
    author: 'Osprey / NFSMods',
    description: 'Eliminates harsh yellow/orange tint and restores natural atmospheric lighting, vivid sky contrasts, and sharp shadows.',
    type: 'graphics',
    category: 'graphics',
    enabled: false,
    priority: 92,
    assetsCount: 2,
    downloadUrl: '/mods/ba508c-nofilter-1.2.0.mwmod',
    fileSize: 1815,
    isInstalled: false,
    verified: true,
    targetPaths: ['scripts/NFSMostWanted.NoFilter.ini', 'scripts/SkyAndLightingChange.nfsms'],
  },
  {
    id: 'mw05-handling-physics-lighting',
    name: 'MW05 Handling, Physics & Lighting Overhaul #2',
    version: '2.0.0',
    author: 'MW05 Team / NFSMods',
    description: 'Complete physics and handling rework: realistic downforce, sharper steering response, progressive slip-angle drift, and high dynamic range lighting.',
    type: 'gameplay',
    category: 'gameplay',
    enabled: false,
    priority: 88,
    assetsCount: 2,
    downloadUrl: '/mods/mw05-handling-physics-lighting-2.0.0.mwmod',
    fileSize: 162390,
    isInstalled: false,
    verified: true,
    targetPaths: ['GLOBAL/attributes.bin', 'scripts/HandlingLightingPhysics.nfsms'],
  },
  {
    id: 'nfsmw-hud-adapter',
    name: 'NFSMW Aspect-Ratio HUD Adapter v1.0.0',
    version: '1.0.0',
    author: 'nlgzrgn / MW Community',
    description: 'Flawless aspect-ratio correction for HUD, gauges, dials, rearview mirror, and fonts across 16:9, 21:9, and mobile displays.',
    type: 'hud_ui',
    category: 'hud_ui',
    enabled: false,
    priority: 86,
    assetsCount: 1,
    downloadUrl: '/mods/nfsmw-hud-adapter-1.0.0.mwmod',
    fileSize: 41295,
    isInstalled: false,
    verified: true,
    targetPaths: ['scripts/NFSMWHUDAdapter.asi'],
  },
  {
    id: 'nfs-hud-resizer',
    name: 'NFS HUD Resizer & Dynamic Gauge Scaler',
    version: '1.1.0',
    author: 'Aero_ / NFSMods',
    description: 'Allows customizable on-screen gauge scaling and repositioning for speedometer, rearview mirror, and pursuit status bar.',
    type: 'hud_ui',
    category: 'hud_ui',
    enabled: false,
    priority: 84,
    assetsCount: 2,
    downloadUrl: '/mods/nfs-hud-resizer-1.1.0.mwmod',
    fileSize: 124448,
    isInstalled: false,
    verified: true,
    targetPaths: ['scripts/NFSMWHUDResizer.asi', 'scripts/NFSMWHUDResizer.ini'],
  },
  {
    id: 'bmw-m3-gtr-e46-remaster',
    name: 'BMW M3 GTR (E46) Ultra-Detail Remaster',
    version: '3.2.0',
    author: 'EllisWorkshop / Aksine',
    description: 'Remastered hero vehicle featuring authentic P60B40 4.0L V8 audio harmonics, straight-cut transmission whine, high-res carbon aero, and liveries.',
    type: 'vehicles',
    category: 'vehicles',
    enabled: false,
    priority: 82,
    assetsCount: 3,
    downloadUrl: '/mods/bmw-m3-gtr-e46-remaster-3.2.0.mwmod',
    fileSize: 6122859,
    isInstalled: false,
    verified: true,
    targetPaths: ['CARS/BMWM3/GEOMETRY.BIN', 'CARS/BMWM3/TEXTURES.BIN', 'scripts/BMWM3GTRE46.ini'],
  },
  {
    id: 'bugatti-chiron-hypercar',
    name: 'Bugatti Chiron W16 Quad-Turbo Addon',
    version: '1.5.0',
    author: 'Eclipse 72 Rus / NFSMods',
    description: '1500 HP Bugatti Chiron hypercar featuring quad-turbo W16 acceleration, custom telemetry, and carbon monocoque.',
    type: 'vehicles',
    category: 'vehicles',
    enabled: false,
    priority: 80,
    assetsCount: 3,
    downloadUrl: '/mods/bugatti-chiron-hypercar-1.5.0.mwmod',
    fileSize: 10485760,
    isInstalled: false,
    verified: true,
    targetPaths: ['CARS/CHIRON/GEOMETRY.BIN', 'CARS/CHIRON/textures.bin', 'CARS/CHIRON/vinyls.bin'],
  },
  {
    id: 'bugatti-divo-hypercar',
    name: 'Bugatti Divo Track Hypercar (SL65 Slot)',
    version: '1.0.0',
    author: 'nfs.com.ru / Divo Team',
    description: 'Bugatti Divo track hypercar: extreme lateral G-force cornering dynamics, aerodynamic dorsal fin, and OLED tail lights.',
    type: 'vehicles',
    category: 'vehicles',
    enabled: false,
    priority: 78,
    assetsCount: 3,
    downloadUrl: '/mods/bugatti-divo-hypercar-1.0.0.mwmod',
    fileSize: 4715671,
    isInstalled: false,
    verified: true,
    targetPaths: ['CARS/SL65/GEOMETRY.BIN', 'CARS/SL65/textures.bin', 'CARS/SL65/SECONDARYLOGO.BIN'],
  },
  {
    id: 'nfsmw-free-unlock-all',
    name: 'Free Unlock All Bonus Cars & Police Cruisers',
    version: '1.0.0',
    author: 'nlgzrgn / NFSMods',
    description: 'Instantly unlocks all 15 Blacklist boss cars, Rockport police cruisers, Challenge series cars, and special reward vehicles.',
    type: 'gameplay',
    category: 'gameplay',
    enabled: false,
    priority: 76,
    assetsCount: 2,
    downloadUrl: '/mods/nfsmw-free-unlock-all-1.0.0.mwmod',
    fileSize: 1412,
    isInstalled: false,
    verified: true,
    targetPaths: ['scripts/BonusCars.nfsms', 'scripts/BaseCarList.nfsms'],
  },
  {
    id: 'rockport-enhancement-mod',
    name: 'Rockport Enhancement & Pursuit Overhaul',
    version: '0.9.5',
    author: 'Enhancement Team',
    description: 'Overhauls pursuit AI tactics, introduces aggressive Rhino SUV roadblocks, increases civilian traffic density, and rebalances career rewards.',
    type: 'gameplay',
    category: 'gameplay',
    enabled: false,
    priority: 74,
    assetsCount: 2,
    downloadUrl: '/mods/rockport-enhancement-mod-0.9.5.mwmod',
    fileSize: 575915,
    isInstalled: false,
    verified: true,
    targetPaths: ['GLOBAL/gameplay.bin', 'GLOBAL/FE_ATTRIB.bin'],
  },
  {
    id: 'nfs-mw-ea-hd-logo',
    name: 'EA HD 1080p Startup Logo & Intro Movie',
    version: '1.0.0',
    author: 'EA Sound & Video Port',
    description: 'High-definition 1080p 60fps intro cinematics and crystal clear EA logo startup movie sequence.',
    type: 'audio_cutscenes',
    category: 'audio_cutscenes',
    enabled: false,
    priority: 70,
    assetsCount: 3,
    downloadUrl: '/mods/nfs-mw-ea-hd-logo-1.0.0.mwmod',
    fileSize: 124200000,
    isInstalled: false,
    verified: true,
    targetPaths: [
      'MOVIES/attract_movie_english_ntsc.vp6',
      'MOVIES/psa_english_ntsc.vp6',
      'MOVIES/ealogo_english_ntsc.vp6',
    ],
  },
];

export const PRESET_PROFILES: ModProfile[] = [
  {
    id: 'preset-rg-v9-1',
    name: 'Retouch Graphics (RG v9.1) Remaster',
    description: 'Full next-gen visual suite: Retouch Graphics shaders, ThirteenAG FOV, and EA HD 1080p intro movies.',
    enabledModIds: ['retouch-graphics-rg-v9-1', 'thirteenag-widescreen-fov', 'nfs-mw-ea-hd-logo'],
    createdAt: 1730000000000,
    isPreset: true,
    icon: '✨',
  },
  {
    id: 'preset-hypercar-hero',
    name: 'Hypercar & Hero BMW M3 Edition',
    description: 'BMW M3 GTR E46 Remaster, Bugatti Chiron, Bugatti Divo, and full bonus vehicle unlocks.',
    enabledModIds: ['bmw-m3-gtr-e46-remaster', 'bugatti-chiron-hypercar', 'bugatti-divo-hypercar', 'nfsmw-free-unlock-all', 'thirteenag-widescreen-fov'],
    createdAt: 1730000000000,
    isPreset: true,
    icon: '🏎️',
  },
  {
    id: 'preset-physics-handling',
    name: 'Pro Physics & Competitive Handling',
    description: 'MW05 Handling, Physics & Lighting #2 with aspect-ratio HUD adapter and gauge scaler.',
    enabledModIds: ['mw05-handling-physics-lighting', 'thirteenag-widescreen-fov', 'nfsmw-hud-adapter', 'nfs-hud-resizer'],
    createdAt: 1730000000000,
    isPreset: true,
    icon: '🏁',
  },
  {
    id: 'preset-pursuit-unlimiter',
    name: 'Rockport Police & Pursuit Overhaul',
    description: 'Rockport aggressive Rhino pursuit AI, Free Unlock All, and Retouch Graphics v9.1.',
    enabledModIds: ['rockport-enhancement-mod', 'nfsmw-free-unlock-all', 'retouch-graphics-rg-v9-1'],
    createdAt: 1730000000000,
    isPreset: true,
    icon: '🛡️',
  },
  {
    id: 'preset-vanilla-clean',
    name: 'Vanilla+ Clean (High Performance)',
    description: 'Clean stock experience with 120 Hz widescreen FOV fix and aspect-ratio corrected UI.',
    enabledModIds: ['thirteenag-widescreen-fov', 'nfsmw-hud-adapter'],
    createdAt: 1730000000000,
    isPreset: true,
    icon: '⚡',
  },
];

export class ModManagerService {
  private static instance: ModManagerService;
  private mods: ModItem[] = [];
  private profiles: ModProfile[] = [];
  private activeProfileId: string | null = null;

  private constructor() {
    this.loadFromStorage();
  }

  public static getInstance(): ModManagerService {
    if (!ModManagerService.instance) {
      ModManagerService.instance = new ModManagerService();
    }
    return ModManagerService.instance;
  }

  private loadFromStorage(): void {
    const OLD_DUMMY_IDS = new Set([
      'xbox360-visuals-xenon',
      'extra-options-exopts',
      'bc98db-unlimiter',
      'xbox360-hd-cutscenes',
      'lossless-ea-trax-soundtrack',
      'recompiled-vinyls-1024x',
      'hd-modern-visuals',
      'pro-drift-handling',
    ]);

    // 1. Load mods
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: ModItem[] = JSON.parse(stored);
        const map = new Map(parsed.map((m) => [m.id, m]));
        const list: ModItem[] = [];
        for (const vMod of VERIFIED_REAL_MODS) {
          if (map.has(vMod.id)) {
            list.push({ ...vMod, ...map.get(vMod.id) });
            map.delete(vMod.id);
          } else {
            list.push(vMod);
          }
        }
        for (const customMod of map.values()) {
          // Strictly reject old placeholder dummy mods
          if (!OLD_DUMMY_IDS.has(customMod.id)) {
            list.push(customMod);
          }
        }
        this.mods = list.sort((a, b) => b.priority - a.priority);
      } else {
        this.mods = [...VERIFIED_REAL_MODS].sort((a, b) => b.priority - a.priority);
      }
    } catch {
      this.mods = [...VERIFIED_REAL_MODS].sort((a, b) => b.priority - a.priority);
    }
    this.saveToStorage();

    // 2. Load profiles
    try {
      const storedProfiles = localStorage.getItem(PROFILES_STORAGE_KEY);
      const customProfiles: ModProfile[] = storedProfiles ? JSON.parse(storedProfiles) : [];
      this.profiles = [...PRESET_PROFILES, ...customProfiles];
    } catch {
      this.profiles = [...PRESET_PROFILES];
    }

    // 3. Load active profile id
    try {
      this.activeProfileId = localStorage.getItem(ACTIVE_PROFILE_KEY) || 'preset-rg-v9-1';
    } catch {}
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.mods));
    } catch {}
  }

  private saveProfilesToStorage(): void {
    try {
      const userProfiles = this.profiles.filter((p) => !p.isPreset);
      localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(userProfiles));
    } catch {}
  }

  public getMods(): ModItem[] {
    return [...this.mods];
  }

  public getActiveMods(): ModItem[] {
    return this.mods.filter((m) => m.enabled).sort((a, b) => b.priority - a.priority);
  }

  /**
   * Real-time Multi-Mod Conflict Detection:
   * Compares all target paths provided by currently active mods.
   * If two active mods touch the same virtual file path, the one with higher priority wins;
   * the lower priority mod is flagged as conflicting/overridden.
   */
  public detectConflicts(): ModConflict[] {
    const activeMods = this.getActiveMods();
    const pathToModsMap = new Map<string, ModItem[]>();

    for (const mod of activeMods) {
      let paths = mod.targetPaths || [];
      if (paths.length === 0) {
        try {
          const stored = localStorage.getItem(MOD_FILES_PREFIX + mod.id);
          if (stored) paths = JSON.parse(stored);
        } catch {}
      }

      for (const p of paths) {
        const norm = p.toLowerCase().trim();
        if (!pathToModsMap.has(norm)) {
          pathToModsMap.set(norm, []);
        }
        pathToModsMap.get(norm)!.push(mod);
      }
    }

    const conflicts: ModConflict[] = [];

    for (const [normPath, mods] of pathToModsMap.entries()) {
      if (mods.length > 1) {
        // Sort descending by priority: highest priority is winner
        mods.sort((a, b) => b.priority - a.priority);
        const winner = mods[0];
        for (let i = 1; i < mods.length; i++) {
          const loser = mods[i];
          conflicts.push({
            filePath: normPath,
            winningModId: winner.id,
            winningModName: winner.name,
            conflictingModId: loser.id,
            conflictingModName: loser.name,
          });
        }
      }
    }

    return conflicts;
  }

  /**
   * Profile Management
   */
  public getProfiles(): ModProfile[] {
    return [...this.profiles];
  }

  public getActiveProfileId(): string | null {
    return this.activeProfileId;
  }

  public async applyProfile(profileId: string): Promise<void> {
    const profile = this.profiles.find((p) => p.id === profileId);
    if (!profile) return;

    this.activeProfileId = profileId;
    try {
      localStorage.setItem(ACTIVE_PROFILE_KEY, profileId);
    } catch {}

    const targetSet = new Set(profile.enabledModIds);

    for (const mod of this.mods) {
      const shouldEnable = targetSet.has(mod.id);
      if (mod.enabled && !shouldEnable) {
        await this.disableMod(mod.id);
      } else if (!mod.enabled && shouldEnable) {
        await this.enableMod(mod.id);
      }
    }

    this.saveToStorage();
  }

  public saveCustomProfile(name: string, description: string): ModProfile {
    const activeIds = this.getActiveMods().map((m) => m.id);
    const newProfile: ModProfile = {
      id: `profile-${Date.now()}`,
      name: name.trim() || `Custom Profile ${this.profiles.length + 1}`,
      description: description.trim() || 'User configured mod selection preset.',
      enabledModIds: activeIds,
      createdAt: Date.now(),
      isPreset: false,
      icon: '⚙️',
    };

    this.profiles.push(newProfile);
    this.activeProfileId = newProfile.id;
    this.saveProfilesToStorage();
    try {
      localStorage.setItem(ACTIVE_PROFILE_KEY, newProfile.id);
    } catch {}

    return newProfile;
  }

  public deleteCustomProfile(profileId: string): boolean {
    const profile = this.profiles.find((p) => p.id === profileId);
    if (!profile || profile.isPreset) return false;

    this.profiles = this.profiles.filter((p) => p.id !== profileId);
    if (this.activeProfileId === profileId) {
      this.activeProfileId = 'preset-4k-visuals';
      try {
        localStorage.setItem(ACTIVE_PROFILE_KEY, 'preset-4k-visuals');
      } catch {}
    }
    this.saveProfilesToStorage();
    return true;
  }

  /**
   * Real extraction & file installation to OPFS /nfsmw/game/
   */
  public async installAndApplyFromBlob(
    blob: Blob,
    overrideId?: string,
    overrideName?: string
  ): Promise<{ mod: ModItem; appliedPaths: string[] }> {
    const entries = await extractZipEntries(blob);
    if (entries.length === 0) {
      throw new Error('No implementable mod files found in archive (archive is empty or unreadable). Nothing to implement on game.');
    }

    // Filter out link-only, text-only, or useless files
    const realEntries = entries.filter((e) => isRealGameAsset(e.path));
    if (realEntries.length === 0) {
      throw new Error(
        'No implementable mod files found in archive (contains only readme or download links). Nothing to implement on game.'
      );
    }

    let manifest: any = null;
    const manifestEntry = entries.find((e) => e.path.toLowerCase() === 'manifest.json');
    if (manifestEntry) {
      try {
        const text = new TextDecoder().decode(manifestEntry.data);
        manifest = JSON.parse(text);
      } catch {}
    }

    const modId =
      overrideId ||
      manifest?.id ||
      overrideName?.replace(/[^a-zA-Z0-9_-]/g, '-').toLowerCase() ||
      `mod-${Date.now()}`;
    const name = overrideName || manifest?.name || modId;
    const author = manifest?.author || 'Community Author';
    const version = manifest?.version || '1.0.0';
    const description = manifest?.description || 'Custom mod package applied to browser virtual file system.';
    
    // Auto-detect category
    let detectedCategory = manifest?.category || manifest?.type;
    if (!detectedCategory) {
      const pathsLower = realEntries.map((e) => e.path.toLowerCase());
      if (pathsLower.some((p) => p.includes('cars/'))) detectedCategory = 'vehicles';
      else if (pathsLower.some((p) => p.includes('idi_') || p.includes('.fx') || p.includes('nextgen') || p.includes('.dds') || p.includes('.tpf'))) detectedCategory = 'graphics';
      else if (pathsLower.some((p) => p.includes('movies/') || p.includes('.vp6') || p.includes('.mus'))) detectedCategory = 'audio_cutscenes';
      else if (pathsLower.some((p) => p.includes('hud') || p.includes('resizer') || p.includes('adapter'))) detectedCategory = 'hud_ui';
      else if (pathsLower.some((p) => p.includes('attributes.bin') || p.includes('gameplay.bin'))) detectedCategory = 'gameplay';
      else detectedCategory = 'scripts';
    }

    const appliedPaths: string[] = [];

    for (const entry of realEntries) {
      await writeModCacheFile(modId, entry.path, entry.data);
      await backupGameFile(modId, entry.path);
      const ok = await writeGameFile(entry.path, entry.data);
      if (ok) {
        appliedPaths.push(entry.path);
      }
    }

    try {
      localStorage.setItem(MOD_FILES_PREFIX + modId, JSON.stringify(appliedPaths));
    } catch {}

    const newMod: ModItem = {
      id: modId,
      name,
      version,
      author,
      description,
      type: detectedCategory,
      category: detectedCategory,
      enabled: true,
      priority: manifest?.priority || 85,
      assetsCount: appliedPaths.length,
      isInstalled: true,
      verified: !!manifest,
      targetPaths: appliedPaths,
      fileSize: blob.size,
    };

    this.registerMod(newMod);
    return { mod: newMod, appliedPaths };
  }

  /**
   * Install a mod from multi-file folder selection (e.g. webkitdirectory or folder drop)
   */
  public async installFromFolder(
    files: { path: string; file: File }[],
    folderName: string
  ): Promise<{ mod: ModItem; appliedPaths: string[] }> {
    if (!files || files.length === 0) {
      throw new Error('No files provided in selected folder.');
    }

    // Check for real game assets
    const realFiles = files.filter((f) => isRealGameAsset(f.path));
    if (realFiles.length === 0) {
      throw new Error(
        'No implementable mod files found in folder (contains only readme or download links). Nothing to implement on game.'
      );
    }

    const modId = folderName.replace(/[^a-zA-Z0-9_-]/g, '-').toLowerCase() || `mod-folder-${Date.now()}`;
    const name = folderName;
    const author = 'Local Folder Import';
    const version = '1.0.0';

    // Auto-detect category
    const pathsLower = realFiles.map((f) => f.path.toLowerCase());
    let detectedCategory = 'scripts';
    if (pathsLower.some((p) => p.includes('cars/'))) detectedCategory = 'vehicles';
    else if (pathsLower.some((p) => p.includes('idi_') || p.includes('.fx') || p.includes('nextgen') || p.includes('.dds') || p.includes('.tpf'))) detectedCategory = 'graphics';
    else if (pathsLower.some((p) => p.includes('movies/') || p.includes('.vp6') || p.includes('.mus'))) detectedCategory = 'audio_cutscenes';
    else if (pathsLower.some((p) => p.includes('hud') || p.includes('resizer') || p.includes('adapter'))) detectedCategory = 'hud_ui';
    else if (pathsLower.some((p) => p.includes('attributes.bin') || p.includes('gameplay.bin'))) detectedCategory = 'gameplay';

    const appliedPaths: string[] = [];
    let totalSize = 0;

    for (const item of realFiles) {
      // Clean path: strip the root folder name prefix if present
      let relPath = item.path.replace(/^\/+/, '');
      const parts = relPath.split('/');
      if (parts.length > 1 && parts[0].toLowerCase() === folderName.toLowerCase()) {
        relPath = parts.slice(1).join('/');
      }

      const buf = await item.file.arrayBuffer();
      const data = new Uint8Array(buf);
      totalSize += data.length;

      await writeModCacheFile(modId, relPath, data);
      await backupGameFile(modId, relPath);
      const ok = await writeGameFile(relPath, data);
      if (ok) {
        appliedPaths.push(relPath);
      }
    }

    try {
      localStorage.setItem(MOD_FILES_PREFIX + modId, JSON.stringify(appliedPaths));
    } catch {}

    const newMod: ModItem = {
      id: modId,
      name,
      version,
      author,
      description: `Folder mod imported with ${appliedPaths.length} game files.`,
      type: detectedCategory,
      category: detectedCategory,
      enabled: true,
      priority: 85,
      assetsCount: appliedPaths.length,
      isInstalled: true,
      verified: false,
      targetPaths: appliedPaths,
      fileSize: totalSize,
    };

    this.registerMod(newMod);
    return { mod: newMod, appliedPaths };
  }

  /**
   * Auto-merges all currently enabled mods into the game filesystem /opfs/nfsmw/game/
   * in strict priority order (lower priority first, highest priority last so top mods win).
   * Automatically invoked before game launch.
   */
  public async autoMergeEnabledModsToOPFS(
    onProgress?: (message: string, current: number, total: number) => void
  ): Promise<{ mergedMods: number; mergedFiles: number }> {
    const enabledMods = this.mods.filter((m) => m.enabled);
    if (enabledMods.length === 0) {
      console.log('[OPFS Mod Engine] No mods enabled; stock game files intact.');
      return { mergedMods: 0, mergedFiles: 0 };
    }

    // Sort ascending by priority so higher priority mods write last and override earlier ones
    const sorted = [...enabledMods].sort((a, b) => a.priority - b.priority);
    let totalFiles = 0;
    let mergedModsCount = 0;

    for (let i = 0; i < sorted.length; i++) {
      const mod = sorted[i];
      if (onProgress) {
        onProgress(`Merging mod "${mod.name}" (${i + 1}/${sorted.length})…`, i + 1, sorted.length);
      }

      // 1. Check if cached in OPFS mods_cache
      const cachedPaths = await listModCacheFiles(mod.id);
      if (cachedPaths.length > 0) {
        for (const p of cachedPaths) {
          const data = await getModCacheFile(mod.id, p);
          if (data) {
            await writeGameFile(p, data);
            totalFiles++;
          }
        }
        mergedModsCount++;
        continue;
      }

      // 2. If not in OPFS cache and has downloadUrl, download and apply
      if (mod.downloadUrl) {
        try {
          const res = await fetch(mod.downloadUrl);
          if (res.ok) {
            const blob = await res.blob();
            const entries = await extractZipEntries(blob);
            for (const entry of entries) {
              if (isRealGameAsset(entry.path)) {
                await writeModCacheFile(mod.id, entry.path, entry.data);
                await writeGameFile(entry.path, entry.data);
                totalFiles++;
              }
            }
            mergedModsCount++;
          }
        } catch (err) {
          console.warn(`[OPFS Mod Engine] Failed to fetch and merge ${mod.name}:`, err);
        }
      }
    }

    console.log(
      `[OPFS Mod Engine] Auto-merged ${mergedModsCount} active mods (${totalFiles} files) into /opfs/nfsmw/game/`
    );
    return { mergedMods: mergedModsCount, mergedFiles: totalFiles };
  }

  /**
   * User Custom Mod Creation:
   * Lets users add their own custom mod (single file, script, car geometry, or texture)
   * directly with a chosen name, category, author, target game path, and priority.
   */
  public async createCustomMod(options: {
    name: string;
    category: string;
    author: string;
    description: string;
    priority: number;
    targetPath: string;
    file: File | Blob;
  }): Promise<ModItem> {
    const modId = `custom-${options.name.replace(/[^a-zA-Z0-9_-]/g, '-').toLowerCase()}-${Date.now()}`;
    const targetPath = options.targetPath.replace(/^\/+/, '');

    // Validate single file targetPath
    if (!isRealGameAsset(targetPath) && !(options.file instanceof File && /\.(zip|mwmod|tar|gz)$/i.test(options.file.name))) {
      throw new Error('No implementable mod files found (contains only readme or download links). Nothing to implement on game.');
    }

    // Read bytes
    const arrayBuffer = await options.file.arrayBuffer();
    const data = new Uint8Array(arrayBuffer);

    // If it's a zip / mwmod archive, extract all
    const isArchive =
      (options.file instanceof File && /\.(zip|mwmod|tar|gz)$/i.test(options.file.name)) ||
      (data.length > 4 && data[0] === 0x50 && data[1] === 0x4b);

    if (isArchive) {
      const { mod } = await this.installAndApplyFromBlob(
        options.file,
        modId,
        options.name
      );
      mod.category = options.category;
      mod.priority = options.priority;
      this.registerMod(mod);
      return mod;
    }

    // Direct single file installation to targetPath
    await writeModCacheFile(modId, targetPath, data);
    await backupGameFile(modId, targetPath);
    await writeGameFile(targetPath, data);

    try {
      localStorage.setItem(MOD_FILES_PREFIX + modId, JSON.stringify([targetPath]));
    } catch {}

    const newMod: ModItem = {
      id: modId,
      name: options.name,
      version: '1.0.0',
      author: options.author || 'User Added',
      description: options.description || `Custom user mod installed to ${targetPath}`,
      type: options.category,
      category: options.category,
      enabled: true,
      priority: options.priority,
      assetsCount: 1,
      isInstalled: true,
      verified: false,
      targetPaths: [targetPath],
      fileSize: data.length,
    };

    this.registerMod(newMod);
    return newMod;
  }

  /**
   * Download and install a verified mod from its downloadUrl
   */
  public async downloadAndInstallMod(id: string): Promise<boolean> {
    const mod = this.mods.find((m) => m.id === id);
    if (!mod || !mod.downloadUrl) return false;

    try {
      const res = await fetch(mod.downloadUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to download mod`);
      const blob = await res.blob();
      await this.installAndApplyFromBlob(blob, mod.id, mod.name);
      return true;
    } catch (err) {
      console.error(`[ModManager] Error installing mod ${id}:`, err);
      return false;
    }
  }

  public async toggleMod(id: string): Promise<boolean> {
    const mod = this.mods.find((m) => m.id === id);
    if (!mod) return false;

    if (mod.enabled) {
      await this.disableMod(id);
    } else {
      await this.enableMod(id);
    }
    return mod.enabled;
  }

  public async disableMod(id: string): Promise<void> {
    const mod = this.mods.find((m) => m.id === id);
    if (!mod) return;

    let paths: string[] = mod.targetPaths || [];
    try {
      const stored = localStorage.getItem(MOD_FILES_PREFIX + id);
      if (stored) paths = JSON.parse(stored);
    } catch {}

    for (const p of paths) {
      await restoreGameFile(id, p);
    }

    mod.enabled = false;
    this.saveToStorage();
  }

  public async enableMod(id: string): Promise<void> {
    const mod = this.mods.find((m) => m.id === id);
    if (!mod) return;

    if (mod.downloadUrl) {
      await this.downloadAndInstallMod(id);
    } else {
      mod.enabled = true;
      this.saveToStorage();
    }
  }

  public async enableAllRecommended(): Promise<void> {
    const recommendedIds = [
      'thirteenag-widescreen-fov',
      'xbox360-visuals-xenon',
      'ba508c-nofilter',
      'nfsmw-hud-adapter',
    ];

    for (const id of recommendedIds) {
      const mod = this.mods.find((m) => m.id === id);
      if (mod) {
        await this.enableMod(id);
      }
    }
  }

  public updatePriority(id: string, newPriority: number): void {
    const mod = this.mods.find((m) => m.id === id);
    if (mod) {
      mod.priority = Math.max(1, Math.min(100, newPriority));
      this.mods.sort((a, b) => b.priority - a.priority);
      this.saveToStorage();
    }
  }

  public registerMod(newMod: ModItem): void {
    const idx = this.mods.findIndex((m) => m.id === newMod.id);
    if (idx >= 0) {
      this.mods[idx] = newMod;
    } else {
      this.mods.unshift(newMod);
    }
    this.mods.sort((a, b) => b.priority - a.priority);
    this.saveToStorage();
  }

  public async removeMod(id: string): Promise<void> {
    await this.disableMod(id);
    this.mods = this.mods.filter((m) => m.id !== id);
    this.saveToStorage();
    try {
      localStorage.removeItem(MOD_FILES_PREFIX + id);
    } catch {}
  }

  public resetToPopularDefaults(): void {
    this.mods = [...VERIFIED_REAL_MODS].sort((a, b) => b.priority - a.priority);
    this.saveToStorage();
  }
}
