/**
 * Need for Speed: Most Wanted (2005) — Browser Edition
 * Universal Mod Engine & Manifest Definition
 */

import { createHash } from 'node:crypto';

export type ModType = 
  | 'texture'      // HD textures, UI skins, materials
  | 'vehicle'      // Custom cars, body kits, wheels
  | 'police'       // Police AI, roadblock tuning, heat levels
  | 'handling'     // Physics profiles, grip, acceleration, drift
  | 'map'          // Custom circuits, tracks, city expansions
  | 'script'       // Lua / WASM gameplay events and logic
  | 'options'      // Extra Options, FOV, camera, HUD scaling
  | 'composite';   // Multi-type total conversion mod

export interface ModAssetEntry {
  /** Relative path inside the .mwmod package (e.g. "assets/textures/globalb.bin") */
  source: string;
  /** Target virtual path in NFSMW (e.g. "GLOBAL/GLOBALB.BIN" or "CARS/BMWM3/TEXTURES.BIN") */
  target: string;
  /** Asset treatment type */
  type?: 'file_override' | 'texture_injection' | 'script_hook' | 'vlt_patch';
  /** Optional hash for direct texture injection without whole-file replacement */
  textureHash?: number | string;
  /** Optional SHA-256 integrity checksum */
  sha256?: string;
}

export interface ModDependency {
  id: string;
  version: string; // SemVer range (e.g. ">=1.0.0")
  optional?: boolean;
}

export interface ModSettingDefinition {
  type: 'boolean' | 'number' | 'string' | 'select';
  label: string;
  description?: string;
  default: boolean | number | string;
  min?: number;
  max?: number;
  step?: number;
  options?: Array<{ label: string; value: string | number }>;
}

export interface ModManifest {
  /** Unique mod identifier, e.g. "hd-remaster-textures", "bmw-m3-gtr-street" */
  id: string;
  /** Human-readable title */
  name: string;
  /** Mod version string (SemVer) */
  version: string;
  /** Target game identifier - must be "nfsmw-2005" */
  game: 'nfsmw-2005';
  /** Mod category */
  type: ModType;
  /** Author name or handle */
  author: string;
  /** Short description */
  description?: string;
  /** Relative path to preview thumbnail in package (e.g. "preview.png") */
  preview?: string;
  /** Dependencies required for this mod */
  dependencies?: ModDependency[];
  /** Conflicting mod IDs */
  conflicts?: string[];
  /** Minimum required version of mw-recomp / browser runtime */
  minimumRuntimeVersion?: string;
  /** Relative load priority (higher integers override lower integers) */
  priority?: number;
  /** File and texture asset mapping rules */
  assets: ModAssetEntry[];
  /** Configurable runtime settings */
  settings?: Record<string, ModSettingDefinition>;
  /** Optional entry script (Lua or WASM) */
  entryScript?: string;
}

/**
 * Computes the exact 32-bit EA bStringHash used throughout NFSMW (EAGL 3 engine).
 * Algorithm: h = 0xFFFFFFFF; for each char: h = (h * 33) + char
 */
export function bStringHash(str: string): number {
  let hash = 0xffffffff;
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i) & 0xff;
    hash = ((hash * 33) + code) >>> 0;
  }
  return hash;
}

/**
 * Computes SHA-256 hex digest of a buffer or string.
 */
export function computeSha256(data: Buffer | Uint8Array | string): string {
  const hash = createHash('sha256');
  hash.update(data);
  return hash.digest('hex');
}

/**
 * Validates a ModManifest object and returns any errors found.
 */
export function validateManifest(obj: unknown): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!obj || typeof obj !== 'object') {
    return { valid: false, errors: ['Manifest must be a non-null JSON object'] };
  }

  const m = obj as Record<string, unknown>;

  if (typeof m.id !== 'string' || !/^[a-z0-9_-]+$/i.test(m.id)) {
    errors.push('Manifest "id" must be an alphanumeric string with dashes or underscores');
  }

  if (typeof m.name !== 'string' || m.name.trim().length === 0) {
    errors.push('Manifest "name" must be a non-empty string');
  }

  if (typeof m.version !== 'string' || !/^\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?$/.test(m.version)) {
    errors.push('Manifest "version" must follow SemVer format (e.g. "1.0.0")');
  }

  if (m.game !== 'nfsmw-2005') {
    errors.push('Manifest "game" must be "nfsmw-2005"');
  }

  const validTypes: ModType[] = ['texture', 'vehicle', 'police', 'handling', 'map', 'script', 'options', 'composite'];
  if (!validTypes.includes(m.type as ModType)) {
    errors.push(`Manifest "type" must be one of: ${validTypes.join(', ')}`);
  }

  if (typeof m.author !== 'string' || m.author.trim().length === 0) {
    errors.push('Manifest "author" must be specified');
  }

  if (!Array.isArray(m.assets)) {
    errors.push('Manifest "assets" must be an array of asset mapping entries');
  } else {
    m.assets.forEach((asset, idx) => {
      if (!asset || typeof asset !== 'object') {
        errors.push(`Asset[${idx}] must be an object`);
        return;
      }
      const a = asset as Record<string, unknown>;
      if (typeof a.source !== 'string' || a.source.length === 0) {
        errors.push(`Asset[${idx}] missing valid "source" path`);
      }
      if (typeof a.target !== 'string' || a.target.length === 0) {
        errors.push(`Asset[${idx}] missing valid "target" path`);
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
