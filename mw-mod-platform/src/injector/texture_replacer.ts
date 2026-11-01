/**
 * Need for Speed: Most Wanted (2005) — Browser Edition
 * Browser-Native WebGPU HD Texture Replacement & Injection Engine
 */

import { bStringHash } from '../core/manifest.js';

export interface HDTextureMetadata {
  /** 32-bit EA hash (bStringHash) */
  hash: number;
  /** Human-readable name or identifier if known (e.g. "BMWM3_BODY_D") */
  name?: string;
  /** Replacement image data (RGBA raw, PNG, or DDS) */
  data: Uint8Array;
  /** Width in pixels (can be up to 4x/8x original resolution, e.g. 2048x2048 instead of 512x512) */
  width: number;
  /** Height in pixels */
  height: number;
  /** Mip level count (0 or 1 for auto-generation) */
  mipLevels: number;
  /** Format: 'rgba8unorm' | 'bc1-rgba-unorm' | 'bc3-rgba-unorm' | 'bc7-rgba-unorm' */
  format: 'rgba8unorm' | 'bc1-rgba-unorm' | 'bc3-rgba-unorm' | 'bc7-rgba-unorm';
  /** Mod package ID that contributed this texture */
  sourceModId: string;
}

export interface TextureReplacementStats {
  totalRegistered: number;
  totalInjected: number;
  totalOverridesHit: number;
  memoryUsageBytes: number;
}

export class WebGPUTextureReplacer {
  private replacementMap: Map<number, HDTextureMetadata> = new Map();
  private nameToHashMap: Map<string, number> = new Map();
  private injectionLog: Array<{ hash: number; name?: string; modId: string; timestamp: number }> = [];
  private dumpMode: boolean = false;
  private anisotropicFiltering: number = 8; // 1x to 16x

  /**
   * Register an HD texture replacement by hash or string name.
   */
  public registerTexture(meta: HDTextureMetadata): void {
    this.replacementMap.set(meta.hash, meta);
    if (meta.name) {
      this.nameToHashMap.set(meta.name.toLowerCase(), meta.hash);
    }
  }

  /**
   * Register a texture by human-readable name, computing the bStringHash automatically.
   */
  public registerTextureByName(
    textureName: string,
    data: Uint8Array,
    width: number,
    height: number,
    sourceModId: string,
    format: 'rgba8unorm' | 'bc1-rgba-unorm' | 'bc3-rgba-unorm' | 'bc7-rgba-unorm' = 'rgba8unorm'
  ): void {
    const hash = bStringHash(textureName);
    this.registerTexture({
      hash,
      name: textureName,
      data,
      width,
      height,
      mipLevels: 1,
      format,
      sourceModId,
    });
  }

  /**
   * Look up if an HD replacement texture exists for a given EA texture hash.
   */
  public getReplacement(hash: number): HDTextureMetadata | undefined {
    return this.replacementMap.get(hash);
  }

  /**
   * Intercept texture upload hook (called by WebGPU backend during texture binding/creation).
   * Returns replacement texture description if available.
   */
  public interceptTextureUpload(
    originalHash: number,
    origWidth: number,
    origHeight: number
  ): HDTextureMetadata | null {
    const replacement = this.replacementMap.get(originalHash);
    if (replacement) {
      this.injectionLog.push({
        hash: originalHash,
        name: replacement.name,
        modId: replacement.sourceModId,
        timestamp: Date.now(),
      });
      return replacement;
    }
    return null;
  }

  /**
   * Remove all textures belonging to a specific mod.
   */
  public unloadModTextures(modId: string): void {
    for (const [hash, meta] of this.replacementMap.entries()) {
      if (meta.sourceModId === modId) {
        this.replacementMap.delete(hash);
        if (meta.name) {
          this.nameToHashMap.delete(meta.name.toLowerCase());
        }
      }
    }
  }

  /**
   * Set texture dumping mode (for mod creation).
   */
  public setDumpMode(enabled: boolean): void {
    this.dumpMode = enabled;
  }

  public isDumpMode(): boolean {
    return this.dumpMode;
  }

  public setAnisotropicFiltering(level: number): void {
    this.anisotropicFiltering = Math.max(1, Math.min(16, level));
  }

  public getAnisotropicFiltering(): number {
    return this.anisotropicFiltering;
  }

  /**
   * Get telemetry stats.
   */
  public getStats(): TextureReplacementStats {
    let memoryBytes = 0;
    for (const meta of this.replacementMap.values()) {
      memoryBytes += meta.data.byteLength;
    }

    return {
      totalRegistered: this.replacementMap.size,
      totalInjected: this.injectionLog.length,
      totalOverridesHit: new Set(this.injectionLog.map((x) => x.hash)).size,
      memoryUsageBytes: memoryBytes,
    };
  }

  /**
   * Get injection event history.
   */
  public getRecentInjections(limit = 50) {
    return this.injectionLog.slice(-limit);
  }
}
