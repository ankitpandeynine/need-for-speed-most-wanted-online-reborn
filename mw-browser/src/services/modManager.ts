/**
 * Mod Manager Service: In-browser mod state and packaging integration
 */

import { ModItem } from '../types';

const STORAGE_KEY = 'nfsmw_mods';

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

    // Default starter mods
    this.mods = [
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
        id: 'hd-modern-visuals',
        name: 'NFSMW HD Modern Visuals & Textures',
        version: '1.0.0',
        author: 'NFSMW Browser Team',
        description: 'High-definition UI, tachometer dials, environmental reflections and asphalt texture enhancement for WebGPU.',
        type: 'texture',
        enabled: true,
        priority: 100,
        assetsCount: 3,
      },
      {
        id: 'extra-options-browser',
        name: 'NFSMW Extra Options (Browser Edition)',
        version: '1.0.0',
        author: 'nlgzrgn / Browser Port',
        description: 'Unlock challenge series, debug camera views, telemetry overlay and customizable pursuit difficulty.',
        type: 'options',
        enabled: false,
        priority: 50,
        assetsCount: 2,
      },
    ];
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
}
