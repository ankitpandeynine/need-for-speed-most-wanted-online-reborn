/**
 * Need for Speed: Most Wanted (2005) — Browser Edition
 * Platform Type Definitions
 */

export interface TouchButtonPosition {
  x: number; // percentage offset from default or -100 to +100 px
  y: number; // percentage offset from default or -100 to +100 px
}

export interface IndividualButtonPosition {
  x: number; // percentage from left (0 to 100)
  y: number; // percentage from top (0 to 100)
}

export interface IndividualTouchPositions {
  steerLeft?: IndividualButtonPosition;
  steerRight?: IndividualButtonPosition;
  accelerate?: IndividualButtonPosition;
  brake?: IndividualButtonPosition;
  nitrous?: IndividualButtonPosition;
  handbrake?: IndividualButtonPosition;
  speedbreaker?: IndividualButtonPosition;
  reset?: IndividualButtonPosition;
  camera?: IndividualButtonPosition;
  pause?: IndividualButtonPosition;
  enter?: IndividualButtonPosition;
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
  individualPositions?: IndividualTouchPositions;
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

export interface ControllerBindings {
  accelerate: number; // default: 7 (RT)
  brake: number; // default: 6 (LT)
  steerLeft: string; // 'axis0_neg' or button index
  steerRight: string; // 'axis0_pos' or button index
  nitrous: number; // default: 0 (A / Cross)
  handbrake: number; // default: 2 (X / Square)
  speedbreaker: number; // default: 1 (B / Circle)
  camera: number; // default: 3 (Y / Triangle)
  pause: number; // default: 9 (Start / Options)
  reset: number; // default: 8 (Back / Share)
  lookBack: number; // default: 11 (R3 / Right Thumb)
  rumbleEnabled: boolean;
  deadzone: number; // 0.05 to 0.30
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
  controllerBindings: ControllerBindings;
  offlinePreload: boolean;
  backgroundDownloading: boolean;
}

export const DEFAULT_MOBILE_SETTINGS: MobileControlSettings = {
  enabled: true,
  layout: 'split',
  buttonScale: 1.0,
  opacity: 0.85,
  swapHands: false,
  haptics: true,
  gyroEnabled: false,
  gyroSensitivity: 1.5,
  gyroDeadzone: 3,
};

export const DEFAULT_KEY_BINDINGS: KeyBindings = {
  accelerate: 'ArrowUp',
  brake: 'ArrowDown',
  steerLeft: 'ArrowLeft',
  steerRight: 'ArrowRight',
  nitrous: 'ShiftLeft',
  handbrake: 'Space',
  speedbreaker: 'KeyG',
  camera: 'KeyC',
  reset: 'KeyR',
  pause: 'Escape',
};

export const DEFAULT_CONTROLLER_BINDINGS: ControllerBindings = {
  accelerate: 7, // RT
  brake: 6, // LT
  steerLeft: 'axis0_neg',
  steerRight: 'axis0_pos',
  nitrous: 0, // A / Cross
  handbrake: 2, // X / Square
  speedbreaker: 1, // B / Circle
  camera: 3, // Y / Triangle
  pause: 9, // Start / Options
  reset: 8, // Back / Share
  lookBack: 11, // R3 / Right Stick
  rumbleEnabled: true,
  deadzone: 0.15,
};

export const DEFAULT_SETTINGS: GameSettings = {
  resolution: '720p',
  frameRateLimit: 120,
  simulationHz: 120,
  widescreenFix: true,
  fovMode: 'xbox360',
  anisotropicFiltering: 8,
  textureQuality: 'high',
  shadows: 'medium',
  reflections: 'high',
  audioVolume: 80,
  musicVolume: 75,
  controllerLayout: 'xbox',
  mobileControls: DEFAULT_MOBILE_SETTINGS,
  keyBindings: DEFAULT_KEY_BINDINGS,
  controllerBindings: DEFAULT_CONTROLLER_BINDINGS,
  offlinePreload: false,
  backgroundDownloading: true,
};

export interface FullProfileBackup {
  format: 'nfsmw-reborn-profile';
  version: '2.0.0';
  timestamp: number;
  createdAt: string;
  settings: GameSettings;
  mobileControls: MobileControlSettings;
  keyBindings: KeyBindings;
  controllerBindings: ControllerBindings;
  activeModIds: string[];
  customModProfiles: ModProfile[];
  userProfileFiles: Record<string, string>; // relative path -> base64 content
}

export type ModCategory =
  | 'all'
  | 'graphics'
  | 'vehicles'
  | 'audio_cutscenes'
  | 'gameplay'
  | 'hud_ui'
  | 'scripts';

export type ModCompatibilityStatus = 'compatible' | 'partial' | 'incompatible';

export interface ModCompatibilityReport {
  status: ModCompatibilityStatus;
  isRunnable: boolean;
  score: number; // 0 to 100
  reason: string;
  issues: string[];
  supportedAssetsCount: number;
  unsupportedFiles: string[];
  canForceMerge: boolean;
}

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
  compatibility?: ModCompatibilityReport;
  isForceMerged?: boolean;
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
