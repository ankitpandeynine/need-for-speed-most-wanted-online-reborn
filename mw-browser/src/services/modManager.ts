/**
 * Mod Manager Service: In-browser mod state, popular mod library, and packaging integration
 */

import { ModItem } from '../types';

const STORAGE_KEY = 'nfsmw_mods';

export const POPULAR_MODS_CATALOG: ModItem[] = [
  {
    id: 'core.nfsmw',
    name: 'ThirteenAG Widescreen Fix & FOV Correction',
    version: '1.0.0',
    author: 'ThirteenAG / recomp-kit',
    description: 'Fixed 120 Hz physics simulation rate, dynamic 16:9 / 21:9 Hor+ scaling, FOV correction, and unstretched HUD dials.',
    type: 'options',
    enabled: true,
    priority: 100,
    assetsCount: 1,
  },
  {
    id: 'xbox360-visuals-xenon',
    name: 'Xbox 360 Visuals & Xenon Lighting Overhaul',
    version: '2.4.0',
    author: 'Aksine / NFSMods',
    description: 'Restores the distinct Xbox 360 golden-hour bloom, road specular sheen, motion blur, and wet rain droplets missing on PC.',
    type: 'texture',
    enabled: true,
    priority: 95,
    assetsCount: 12,
  },
  {
    id: 'hd-upscaled-hud',
    name: 'NFSMW 4K Upscaled Vector HUD & Minimap',
    version: '2.1.0',
    author: 'MWCommunity / D4rk',
    description: 'Replaces blurry 4:3 480p gauge textures with crisp high-DPI dials, sharp tachometer needles, and clean vector radar blips.',
    type: 'texture',
    enabled: true,
    priority: 92,
    assetsCount: 18,
  },
  {
    id: 'hd-modern-visuals',
    name: 'NFSMW 4K Redux Texture Remaster',
    version: '3.1.0',
    author: 'Dragozool / NFSCars',
    description: 'High-definition 4K asphalt textures, aggregate tarmac grains, tire burnout marks, roadside guardrails, and tree foliage.',
    type: 'texture',
    enabled: true,
    priority: 90,
    assetsCount: 34,
  },
  {
    id: 'extra-options-browser',
    name: 'NFSMW Extra Options (ExOpts Browser Suite)',
    version: '2.0.1',
    author: 'nlgzrgn / ExOpts Team',
    description: 'Unlocks hidden challenge series cars, debug free-cam, custom pursuit difficulty (Heat 1-10), and custom traffic density.',
    type: 'options',
    enabled: true,
    priority: 85,
    assetsCount: 6,
  },
  {
    id: 'nfs-unlimiter-core',
    name: 'NFS Unlimiter Core & Extra Car Slots',
    version: '4.0.0',
    author: 'nlgzrgn / NFSMods',
    description: 'Bypasses hardcoded car limits in the game binary, enabling custom vehicle slots without replacing original garage cars.',
    type: 'vehicle',
    enabled: true,
    priority: 80,
    assetsCount: 14,
  },
  {
    id: 'jdm-supercars-unlimiter',
    name: 'JDM Legends & Supercars Pack (R34, Supra, Zonda)',
    version: '1.5.0',
    author: 'NFSAddons Community',
    description: 'Adds custom slots for Nissan Skyline GT-R R34, Toyota Supra MK4, Pagani Zonda C12, and Porsche 911 GT3 RS with full audio.',
    type: 'vehicle',
    enabled: false,
    priority: 75,
    assetsCount: 48,
  },
  {
    id: 'police-pursuit-overhaul',
    name: 'Extreme Police Pursuit & Heavy Rhino SUV AI',
    version: '1.2.0',
    author: 'PoliceAI Team',
    description: 'Smarter police interceptors, aggressive Rhino heavy SUV roadblocks, tactical spike strips, and low-altitude pursuit helicopters.',
    type: 'police',
    enabled: false,
    priority: 65,
    assetsCount: 8,
  },
  {
    id: 'ea-trax-lossless-ost',
    name: 'EA Trax 320kbps Uncompressed Studio Audio Remaster',
    version: '1.4.0',
    author: 'EA Trax Community',
    description: 'Restores uncompressed pursuit soundtrack from Styles of Beyond (Nine Thou), Disturbed, Celldweller, and Avenged Sevenfold.',
    type: 'options',
    enabled: false,
    priority: 62,
    assetsCount: 26,
  },
  {
    id: 'xbox360-cutscenes-hd',
    name: 'Xbox 360 Remastered 60 FPS Cutscenes',
    version: '1.0.0',
    author: 'NFSMW Preservation Project',
    description: 'High-bitrate, crystal clear 720p/1080p full motion cutscenes replacing heavily compressed 4:3 PC videos.',
    type: 'composite',
    enabled: false,
    priority: 60,
    assetsCount: 22,
  },
  {
    id: 'pepega-handling-expansion',
    name: 'Pepega Mod & Pro Drift Handling Physics',
    version: '2.0.0',
    author: 'Pepega Team',
    description: 'Alternative vehicle physics engine with realistic drift slip-angles, responsive counter-steering, and custom tire burnout smoke.',
    type: 'handling',
    enabled: false,
    priority: 50,
    assetsCount: 16,
  },
];

export class ModManagerService {
  private static instance: ModManagerService;
  private mods: ModItem[] = [];

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
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: ModItem[] = JSON.parse(stored);
        // Merge with popular mods catalog so new mods show up
        const existingIds = new Set(parsed.map((m) => m.id));
        const merged = [...parsed];
        for (const catMod of POPULAR_MODS_CATALOG) {
          if (!existingIds.has(catMod.id)) {
            merged.push(catMod);
          }
        }
        this.mods = merged.sort((a, b) => b.priority - a.priority);
        return;
      }
    } catch {
      // Fallback
    }

    this.mods = [...POPULAR_MODS_CATALOG].sort((a, b) => b.priority - a.priority);
    this.saveToStorage();
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.mods));
    } catch {
      // Storage unavailable
    }
  }

  public getMods(): ModItem[] {
    return [...this.mods];
  }

  public getActiveMods(): ModItem[] {
    return this.mods.filter((m) => m.enabled).sort((a, b) => b.priority - a.priority);
  }

  public toggleMod(id: string): void {
    const mod = this.mods.find((m) => m.id === id);
    if (mod) {
      mod.enabled = !mod.enabled;
      this.saveToStorage();
    }
  }

  public enableMod(id: string, enable: boolean = true): void {
    const mod = this.mods.find((m) => m.id === id);
    if (mod) {
      mod.enabled = enable;
      this.saveToStorage();
    }
  }

  public enableAllRecommended(): void {
    const recommendedIds = new Set([
      'core.nfsmw',
      'xbox360-visuals-xenon',
      'hd-upscaled-hud',
      'hd-modern-visuals',
      'extra-options-browser',
      'nfs-unlimiter-core',
    ]);
    for (const mod of this.mods) {
      if (recommendedIds.has(mod.id)) {
        mod.enabled = true;
      }
    }
    this.saveToStorage();
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

  public removeMod(id: string): void {
    this.mods = this.mods.filter((m) => m.id !== id);
    this.saveToStorage();
  }

  public resetToPopularDefaults(): void {
    this.mods = [...POPULAR_MODS_CATALOG].sort((a, b) => b.priority - a.priority);
    this.saveToStorage();
  }
}
