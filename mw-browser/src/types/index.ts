/**
 * Need for Speed: Most Wanted (2005) — Browser Edition
 * Platform Type Definitions
 */

export interface TouchButtonPosition {
  x: number; // percentage offset from default or -100 to +100 px
  y: number; // percentage offset from default or -100 to +100 px
}

export interface TouchCustomPositions {
  steerCluster?: TouchButtonPosition;
  pedalsCluster?: TouchButtonPosition;
  actionsCluster?: TouchButtonPosition;
  nitroHandbrakeCluster?: TouchButtonPosition;
}

export interface MobileControlSettings {
  enabled: boolean;
  layout: 'split' | 'dpad' | 'gyro_pedals';
  buttonScale: number; // 0.8 to 1.5
  opacity: number; // 0.2 to 1.0
  swapHands: boolean; // left-handed mode
  haptics: boolean;
  gyroEnabled: boolean;
  gyroSensitivity: number; // 0.5 to 3.0
  gyroDeadzone: number; // 1 to 10 degrees
  customPositions?: TouchCustomPositions;
}

export interface KeyBindings {
  accelerate: string; // default: 'ArrowUp'
  brake: string; // default: 'ArrowDown'
  steerLeft: string; // default: 'ArrowLeft'
  steerRight: string; // default: 'ArrowRight'
  nitrous: string; // default: 'ShiftLeft'
  handbrake: string; // default: 'Space'
  speedbreaker: string; // default: 'KeyG'
  camera: string; // default: 'KeyC'
  reset: string; // default: 'KeyR'
  pause: string; // default: 'Escape'
}

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
  mobileControls: MobileControlSettings;
  keyBindings: KeyBindings;
  offlinePreload: boolean;
  backgroundDownloading: boolean;
}

export type ModCategory =
  | 'all'
  | 'graphics'
  | 'vehicles'
  | 'audio_cutscenes'
  | 'gameplay'
  | 'hud_ui'
  | 'scripts';

export interface ModItem {
  id: string;
  name: string;
  version: string;
  author: string;
  description: string;
  type: string;
  category?: string;
  enabled: boolean;
  priority: number;
  assetsCount: number;
  downloadUrl?: string;
  fileSize?: number;
  isInstalled?: boolean;
  verified?: boolean;
  previewUrl?: string;
  sourceFile?: string;
  targetPaths?: string[];
}

export interface ModConflict {
  filePath: string;
  winningModId: string;
  winningModName: string;
  conflictingModId: string;
  conflictingModName: string;
}

export interface ModProfile {
  id: string;
  name: string;
  description: string;
  enabledModIds: string[];
  createdAt: number;
  isPreset?: boolean;
  icon?: string;
}

export interface StorageStatus {
  hasSpeedExe: boolean;
  speedExeValid: boolean;
  totalGameFiles: number;
  storageQuotaBytes: number;
  storageUsedBytes: number;
  isPersistent: boolean;
}

export type ViewTab =
  | 'dashboard'
  | 'mods'
  | 'multiplayer'
  | 'controls'
  | 'settings'
  | 'storage'
  | 'game';

export interface BlacklistRaceEvent {
  id: string;
  title: string;
  type: 'Circuit' | 'Sprint' | 'Speedtrap' | 'Tollbooth' | 'Lap Knockout';
  trackName: string;
  distanceKm: number;
  laps?: number;
  rewardCash: number;
  completed: boolean;
}

export interface BlacklistMilestone {
  id: string;
  title: string;
  description: string;
  targetCount: number;
  bountyReward: number;
  completed: boolean;
}

export interface BlacklistRival {
  rank: number; // 1 to 15
  name: string;
  alias: string;
  car: string;
  carId: string;
  bio: string;
  quote: string;
  heatLevel: number;
  requiredRaces: number;
  requiredMilestones: number;
  requiredBounty: number;
  races: BlacklistRaceEvent[];
  milestones: BlacklistMilestone[];
  isDefeated: boolean;
  isUnlocked: boolean;
}

export interface MapLocation {
  id: string;
  title: string;
  type: 'safehouse' | 'race' | 'pursuit_breaker' | 'hiding_spot' | 'car_lot' | 'tollbooth';
  district: 'Rosewood' | 'Camden Beach' | 'Downtown Rockport' | 'Rockport Freeway';
  posX: number; // 0 - 100% on map canvas
  posY: number; // 0 - 100% on map canvas
  description: string;
  rewardCash?: number;
  rewardBounty?: number;
}

export interface EATraxSong {
  id: string;
  title: string;
  artist: string;
  album: string;
  year: number;
  durationSec: number;
  genre: 'Metal' | 'Rock' | 'Electronic' | 'Hip-Hop' | 'Score';
  interactivePursuitScore?: boolean;
}

export * from './multiplayer';
