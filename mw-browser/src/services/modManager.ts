/**
 * Mod Manager Service: In-browser mod state, popular mod library, and packaging integration
 */

import { ModItem } from '../types';

const STORAGE_KEY = 'nfsmw_mods';

export const POPULAR_MODS_CATALOG: ModItem[] = [
  {
    id: 'core.nfsmw',
    name: 'Most Wanted Engine & Widescreen (120 Hz)',
    version: '1.0.0',
    author: 'recomp-kit / ThirteenAG',
    description: 'Fixed 120 Hz physics simulation rate, dynamic resolution scaling, FOV correction and wide HUD placement.',
    type: 'composite',
    enabled: true,
    priority: 10,
    assetsCount: 1,
  },
  {
    id: 'xbox360-visuals-xenon',
    name: 'Xbox 360 Visuals & Xenon Lighting Overhaul',
    version: '2.4.0',
    author: 'Aksine / NFSMods',
    description: 'Restores the distinct Xbox 360 motion blur, teal bloom, high-contrast shaders, and rain droplets.',
    type: 'texture',
    enabled: true,
    priority: 95,
    assetsCount: 12,
  },
  {
    id: 'hd-modern-visuals',
    name: 'NFSMW 4K Redux Texture Remaster',
    version: '3.1.0',
    author: 'Dragozool / NFSCars',
    description: 'High-definition 4K asphalt, road markings, tree foliage, environmental reflections and high-DPI dials.',
    type: 'texture',
    enabled: true,
    priority: 90,
    assetsCount: 34,
  },
  {
    id: 'extra-options-browser',
    name: 'NFSMW Extra Options (Browser Edition)',
    version: '2.0.1',
    author: 'nlgzrgn / Browser Port',
    description: 'Unlock challenge series, debug free-cam, custom pursuit difficulty (Heat 1-10), and HUD toggles.',
    type: 'options',
    enabled: true,
    priority: 85,
    assetsCount: 6,
  },
  {
    id: 'jdm-supercars-unlimiter',
    name: 'JDM Legends & Supercars Pack (Unlimiter)',
    version: '1.5.0',
    author: 'NFSAddons Community',
    description: 'Adds custom slots for Nissan Skyline GT-R R34, Toyota Supra MK4, and Porsche 911 GT3 RS with full audio.',
    type: 'vehicle',
    enabled: false,
    priority: 70,
    assetsCount: 48,
  },
  {
    id: 'police-pursuit-overhaul',
    name: 'Extreme Police Pursuit & Roadblock AI',
    version: '1.2.0',
    author: 'PoliceAI Team',
    description: 'Smarter police interceptors, aggressive Rhino heavy SUV roadblocks, spike strips, and low-altitude helicopters.',
    type: 'police',
    enabled: false,
    priority: 65,
    assetsCount: 8,
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
    name: 'Pepega Mod & Drift Handling Physics',
    version: '2.0.0',
    author: 'Pepega Team',
    description: 'Alternative vehicle physics engine with realistic drift slip-angles, responsive counter-steering, and custom events.',
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
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        this.mods = JSON.parse(raw);
        return;
      } catch (e) {
        console.warn('Failed to parse stored mods:', e);
      }
    }

    this.mods = [...POPULAR_MODS_CATALOG];
    this.saveToStorage();
  }

  private saveToStorage(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.mods));
  }

  public getMods(): ModItem[] {
    return [...this.mods].sort((a, b) => b.priority - a.priority);
  }

  public toggleMod(id: string): void {
    const mod = this.mods.find((m) => m.id === id);
    if (mod) {
      mod.enabled = !mod.enabled;
      this.saveToStorage();
    }
  }

  public updatePriority(id: string, newPriority: number): void {
    const mod = this.mods.find((m) => m.id === id);
    if (mod) {
      mod.priority = newPriority;
      this.saveToStorage();
    }
  }

  public registerMod(item: ModItem): void {
    this.mods = this.mods.filter((m) => m.id !== item.id);
    this.mods.push(item);
    this.saveToStorage();
  }

  public removeMod(id: string): void {
    this.mods = this.mods.filter((m) => m.id !== id);
    this.saveToStorage();
  }

  public resetToPopularDefaults(): void {
    this.mods = [...POPULAR_MODS_CATALOG];
    this.saveToStorage();
  }
}
