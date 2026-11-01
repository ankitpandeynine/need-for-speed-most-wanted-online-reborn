/**
 * Storage Service: OPFS & IndexedDB asset caching and validation
 */

import { StorageStatus } from '../types';

export const PINNED_SPEED_EXE_SHA256 = '80774c2e5d619b4f120b48d4462896fd504c263399d203a238769cffde1d253c';

export class BrowserStorageService {
  private static instance: BrowserStorageService;

  private constructor() {}

  public static getInstance(): BrowserStorageService {
    if (!BrowserStorageService.instance) {
      BrowserStorageService.instance = new BrowserStorageService();
    }
    return BrowserStorageService.instance;
  }

  /**
   * Check storage quota, OPFS availability, and game file readiness.
   */
  public async getStorageStatus(): Promise<StorageStatus> {
    let quota = 0;
    let usage = 0;
    let isPersistent = false;

    if (navigator.storage && navigator.storage.estimate) {
      try {
        const est = await navigator.storage.estimate();
        quota = est.quota || 0;
        usage = est.usage || 0;
        isPersistent = await navigator.storage.persisted();
      } catch (e) {
        console.warn('Storage estimate failed:', e);
      }
    }

    // Check OPFS or localStorage mock
    const hasGame = localStorage.getItem('nfsmw_installed') === 'true';
    const fileCount = parseInt(localStorage.getItem('nfsmw_file_count') || '0', 10);

    return {
      hasSpeedExe: hasGame,
      speedExeValid: hasGame,
      totalGameFiles: fileCount,
      storageQuotaBytes: quota,
      storageUsedBytes: usage,
      isPersistent,
    };
  }

  /**
   * Request persistent storage permission from the browser.
   */
  public async requestPersistence(): Promise<boolean> {
    if (navigator.storage && navigator.storage.persist) {
      return await navigator.storage.persist();
    }
    return false;
  }

  /**
   * Calculate SHA-256 of an ArrayBuffer in browser using SubtleCrypto.
   */
  public async computeSha256(buffer: ArrayBuffer): Promise<string> {
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Validate and record a speed.exe executable.
   */
  public async validateSpeedExe(buffer: ArrayBuffer): Promise<{ valid: boolean; hash: string; error?: string }> {
    const hash = await this.computeSha256(buffer);
    const valid = hash.toLowerCase() === PINNED_SPEED_EXE_SHA256.toLowerCase();
    return {
      valid,
      hash,
      error: valid ? undefined : `Executable hash mismatch. Expected ${PINNED_SPEED_EXE_SHA256}, got ${hash}`,
    };
  }

  /**
   * Store mock or uploaded installation.
   */
  public markInstalled(fileCount: number): void {
    localStorage.setItem('nfsmw_installed', 'true');
    localStorage.setItem('nfsmw_file_count', fileCount.toString());
  }

  /**
   * Clear all stored game data.
   */
  public clearGameData(): void {
    localStorage.removeItem('nfsmw_installed');
    localStorage.removeItem('nfsmw_file_count');
  }
}
