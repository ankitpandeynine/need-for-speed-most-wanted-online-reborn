/**
 * Need for Speed: Most Wanted (2005) — Browser Edition
 * Virtual File System (VFS) with Layered Mod Overlays
 */

export interface VFSFileHandle {
  path: string;
  sourceModId?: string; // empty if from original retail game
  size: number;
  data: () => Promise<Uint8Array>;
}

export interface VFSModLayer {
  modId: string;
  name: string;
  priority: number;
  enabled: boolean;
  // Normalized lowercase relative paths mapping to provider
  files: Map<string, { relativePath: string; provider: () => Promise<Uint8Array>; size: number }>;
}

export class VirtualFileSystem {
  private baseFiles: Map<string, { relativePath: string; provider: () => Promise<Uint8Array>; size: number }> = new Map();
  private layers: VFSModLayer[] = [];

  /**
   * Normalizes a guest Windows path into a canonical relative path.
   * e.g. "C:\\Games\\NFSMW\\CARS\\BMWM3\\TEXTURES.BIN" -> "cars/bmwm3/textures.bin"
   */
  public static normalizePath(inputPath: string): string {
    let clean = inputPath.replace(/\\/g, '/').trim();
    // Remove Windows drive letters or absolute roots
    clean = clean.replace(/^[a-zA-Z]:\/?/, '');
    // Remove leading slashes
    clean = clean.replace(/^\/+/, '');

    // Canonicalize segments
    const segments = clean.split('/');
    let resolved: string[] = [];
    for (const seg of segments) {
      if (seg === '.' || seg === '') continue;
      if (seg === '..') {
        if (resolved.length > 0) resolved.pop();
      } else {
        resolved.push(seg.toLowerCase());
      }
    }

    // Anchor to standard NFSMW root directories if part of an absolute installation path
    const GAME_ROOT_DIRECTORIES = new Set([
      'cars',
      'frontend',
      'global',
      'movies',
      'sound',
      'subtitles',
      'tracks',
      'languages',
      'memcard',
      'scripts',
      'textures',
    ]);

    const rootIdx = resolved.findIndex((seg) => GAME_ROOT_DIRECTORIES.has(seg));
    if (rootIdx !== -1) {
      resolved = resolved.slice(rootIdx);
    }

    return resolved.join('/');
  }

  /**
   * Register a file from the original game installation.
   */
  public registerBaseFile(rawPath: string, size: number, provider: () => Promise<Uint8Array>): void {
    const key = VirtualFileSystem.normalizePath(rawPath);
    this.baseFiles.set(key, { relativePath: rawPath, provider, size });
  }

  /**
   * Add or update a mod layer.
   */
  public addModLayer(layer: VFSModLayer): void {
    this.removeModLayer(layer.modId);
    this.layers.push(layer);
    this.sortLayers();
  }

  /**
   * Remove a mod layer by modId.
   */
  public removeModLayer(modId: string): void {
    this.layers = this.layers.filter((l) => l.modId !== modId);
  }

  /**
   * Set mod enabled status.
   */
  public setModEnabled(modId: string, enabled: boolean): void {
    const layer = this.layers.find((l) => l.modId === modId);
    if (layer) {
      layer.enabled = enabled;
    }
  }

  /**
   * Set mod priority.
   */
  public setModPriority(modId: string, priority: number): void {
    const layer = this.layers.find((l) => l.modId === modId);
    if (layer) {
      layer.priority = priority;
      this.sortLayers();
    }
  }

  private sortLayers(): void {
    // Highest priority first
    this.layers.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Resolve a path through the VFS: checks active mod layers in priority order,
   * then falls back to base retail game files.
   */
  public resolve(rawPath: string): VFSFileHandle | null {
    const key = VirtualFileSystem.normalizePath(rawPath);

    // 1. Check enabled mod layers in priority order
    for (const layer of this.layers) {
      if (!layer.enabled) continue;
      const file = layer.files.get(key);
      if (file) {
        return {
          path: file.relativePath,
          sourceModId: layer.modId,
          size: file.size,
          data: file.provider,
        };
      }
    }

    // 2. Fall back to base game file
    const base = this.baseFiles.get(key);
    if (base) {
      return {
        path: base.relativePath,
        sourceModId: undefined,
        size: base.size,
        data: base.provider,
      };
    }

    return null;
  }

  /**
   * Check if a file exists in the VFS.
   */
  public exists(rawPath: string): boolean {
    return this.resolve(rawPath) !== null;
  }

  /**
   * Enumerate all files currently visible (combining base and active overlays).
   */
  public listFiles(): string[] {
    const seen = new Set<string>();
    for (const layer of this.layers) {
      if (!layer.enabled) continue;
      for (const key of layer.files.keys()) {
        seen.add(key);
      }
    }
    for (const key of this.baseFiles.keys()) {
      seen.add(key);
    }
    return Array.from(seen).sort();
  }

  /**
   * Diagnostics: report active overlay resolution trace for a requested path.
   */
  public traceResolution(rawPath: string): {
    normalizedKey: string;
    resolved: boolean;
    winner?: { source: string; modId?: string; priority?: number };
    candidates: Array<{ layer: string; priority: number; hit: boolean }>;
  } {
    const key = VirtualFileSystem.normalizePath(rawPath);
    const candidates: Array<{ layer: string; priority: number; hit: boolean }> = [];

    for (const layer of this.layers) {
      const hit = layer.files.has(key);
      candidates.push({
        layer: layer.modId + (layer.enabled ? ' [active]' : ' [disabled]'),
        priority: layer.priority,
        hit,
      });
    }

    const baseHit = this.baseFiles.has(key);
    candidates.push({ layer: 'retail_base', priority: -1, hit: baseHit });

    const res = this.resolve(rawPath);
    return {
      normalizedKey: key,
      resolved: res !== null,
      winner: res
        ? {
            source: res.sourceModId ? `Mod (${res.sourceModId})` : 'Retail Game',
            modId: res.sourceModId,
          }
        : undefined,
      candidates,
    };
  }
}
