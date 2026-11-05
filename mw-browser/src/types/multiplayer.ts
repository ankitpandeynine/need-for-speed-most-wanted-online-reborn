/**
 * Need for Speed: Most Wanted (2005) — Online Reborn
 * Real-Time Multiplayer Protocol & Types
 */

export type GameMode = 'circuit' | 'sprint' | 'drag' | 'speedtrap' | 'pursuit_tag';

export type CarTier = 1 | 2 | 3 | 'open';

export interface VehicleTelemetry {
  playerId: string;
  callsign: string;
  carModel: string;
  paintColor: string;
  position: { x: number; y: number; z: number };
  velocity: { x: number; y: number; z: number };
  heading: number;
  speedMph: number;
  rpm: number;
  gear: number;
  nitroActive: boolean;
  bounty: number;
  lap: number;
  checkpoint: number;
  pingMs: number;
  timestamp: number;
}

export interface MultiplayerPlayer {
  id: string;
  callsign: string;
  avatar: string;
  carModel: string;
  paintColor: string;
  isHost: boolean;
  isReady: boolean;
  pingMs: number;
  modHash: string;
  modVerified: boolean;
  currentLap: number;
  checkpointIndex: number;
  distanceCoveredKm: number;
  speedMph: number;
  nitroActive: boolean;
  finishTimeMs?: number;
  bestSpeedTrapMph?: number;
}

export interface LobbyRoom {
  id: string;
  code: string;
  name: string;
  hostId: string;
  hostName: string;
  trackId: string;
  trackName: string;
  trackDistanceKm: number;
  trackDifficulty: 'Easy' | 'Medium' | 'Hard' | 'Extreme';
  gameMode: GameMode;
  maxPlayers: number;
  players: MultiplayerPlayer[];
  status: 'lobby' | 'countdown' | 'in_race' | 'finished';
  collisionMode: 'ghost' | 'contact';
  catchup: boolean;
  modVerificationRequired: boolean;
  requiredModHash: string;
  carTier: CarTier;
  createdAt: number;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: number;
  avatar?: string;
  carModel?: string;
  roomId?: string;
  isSystem?: boolean;
  isTaunt?: boolean;
}

export interface OnlineLeaderboardEntry {
  rank: number;
  callsign: string;
  carModel: string;
  trackName: string;
  bestTime: string;
  topSpeedMph: number;
  bounty: number;
  platform: string;
  verified: boolean;
}
