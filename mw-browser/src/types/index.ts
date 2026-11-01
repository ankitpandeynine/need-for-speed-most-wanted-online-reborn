/**
 * Need for Speed: Most Wanted (2005) — Browser Edition
 * Platform Type Definitions
 */

export interface GameSettings {
  resolution: '720p' | '1080p' | '1440p' | 'auto';
  frameRateLimit: 30 | 60 | 120;
  simulationHz: 120;
  widescreenFix: boolean;
  fovMode: 'original' | 'xbox360' | 'exact';
  anisotropicFiltering: 1 | 2 | 4 | 8 | 16;
  textureQuality: 'low' | 'medium' | 'high' | 'ultra';
  shadows: 'off' | 'low' | 'medium' | 'high';
  reflections: 'low' | 'high';
  audioVolume: number; // 0 - 100
  musicVolume: number; // 0 - 100
  controllerLayout: 'xbox' | 'playstation' | 'keyboard_arrows' | 'keyboard_wasd';
}

export interface ModItem {
  id: string;
  name: string;
  version: string;
  author: string;
  description: string;
  type: string;
  enabled: boolean;
  priority: number;
  assetsCount: number;
  previewUrl?: string;
  sourceFile?: string;
}

export interface StorageStatus {
  hasSpeedExe: boolean;
  speedExeValid: boolean;
  totalGameFiles: number;
  storageQuotaBytes: number;
  storageUsedBytes: number;
  isPersistent: boolean;
}

export type ViewTab = 'dashboard' | 'mods' | 'storage' | 'settings' | 'game';
