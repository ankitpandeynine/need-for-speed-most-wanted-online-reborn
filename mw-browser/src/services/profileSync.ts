/**
 * Need for Speed: Most Wanted (2005) — Browser Edition
 * Universal Profile & Settings Sync Service
 * Exports and imports 100% of user data:
 * 1. Display, audio, and simulation settings
 * 2. Custom touch screen button placements (individual X & Y coordinates)
 * 3. Controller mappings & PC keybindings
 * 4. Active mods list and custom mod profiles
 * 5. Full career save files from OPFS /opfs/nfsmw/profile/ (progress, blacklist, cars, cash)
 */

import { FullProfileBackup, GameSettings, MobileControlSettings, KeyBindings, ControllerBindings, ModProfile } from '../types';

export class ProfileSyncService {
  private static instance: ProfileSyncService;

  private constructor() {}

  public static getInstance(): ProfileSyncService {
    if (!ProfileSyncService.instance) {
      ProfileSyncService.instance = new ProfileSyncService();
    }
    return ProfileSyncService.instance;
  }

  /**
   * Recursively read all files from an OPFS directory and encode as base64
   */
  private async readOpfsDirBase64(
    dirHandle: FileSystemDirectoryHandle,
    prefix: string = ''
  ): Promise<Record<string, string>> {
    const files: Record<string, string> = {};

    try {
      // @ts-ignore - AsyncIterable on DirectoryHandle
      for await (const [name, handle] of dirHandle.entries()) {
        const relPath = prefix ? `${prefix}/${name}` : name;
        if (handle.kind === 'file') {
          const file = await (handle as FileSystemFileHandle).getFile();
          const buffer = await file.arrayBuffer();
          const bytes = new Uint8Array(buffer);
          let binary = '';
          const chunkSize = 8192;
          for (let i = 0; i < bytes.length; i += chunkSize) {
            binary += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + chunkSize)));
          }
          files[relPath] = btoa(binary);
        } else if (handle.kind === 'directory') {
          const subFiles = await this.readOpfsDirBase64(handle as FileSystemDirectoryHandle, relPath);
          Object.assign(files, subFiles);
        }
      }
    } catch (e) {
      console.warn('[ProfileSync] Could not read OPFS directory:', e);
    }

    return files;
  }

  /**
   * Write base64 files back into an OPFS directory
   */
  private async writeOpfsDirBase64(
    dirHandle: FileSystemDirectoryHandle,
    files: Record<string, string>
  ): Promise<number> {
    let count = 0;
    for (const [relPath, b64Data] of Object.entries(files)) {
      try {
        const parts = relPath.split('/');
        const fileName = parts.pop()!;
        let currentDir = dirHandle;

        for (const p of parts) {
          currentDir = await currentDir.getDirectoryHandle(p, { create: true });
        }

        const fileHandle = await currentDir.getFileHandle(fileName, { create: true });
        // @ts-ignore
        if (fileHandle.createSyncAccessHandle) {
          // @ts-ignore
          const access = await fileHandle.createSyncAccessHandle();
          const binary = atob(b64Data);
          const bytes = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
          }
          access.truncate(0);
          access.write(bytes, { at: 0 });
          access.flush();
          access.close();
        } else {
          // Fallback to WritableStream
          const writable = await fileHandle.createWritable();
          const binary = atob(b64Data);
          const bytes = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
          }
          await writable.write(bytes);
          await writable.close();
        }
        count++;
      } catch (err) {
        console.warn(`[ProfileSync] Failed writing save file ${relPath}:`, err);
      }
    }
    return count;
  }

  /**
   * Generate and export full profile backup configuration file
   */
  public async exportBackup(): Promise<{ filename: string; blob: Blob; summary: string }> {
    // 1. Gather settings from localStorage
    let settings: GameSettings | null = null;
    try {
      const s = localStorage.getItem('nfsmw_settings');
      if (s) settings = JSON.parse(s);
    } catch {}

    let mobileControls: MobileControlSettings | null = null;
    try {
      const m = localStorage.getItem('nfsmw_mobile_controls');
      if (m) mobileControls = JSON.parse(m);
    } catch {}

    let keyBindings: KeyBindings | null = null;
    try {
      const k = localStorage.getItem('nfsmw_key_bindings');
      if (k) keyBindings = JSON.parse(k);
    } catch {}

    let controllerBindings: ControllerBindings | null = null;
    try {
      const c = localStorage.getItem('nfsmw_controller_bindings');
      if (c) controllerBindings = JSON.parse(c);
    } catch {}

    let activeModIds: string[] = [];
    try {
      const storedMods = localStorage.getItem('nfsmw_real_mods');
      if (storedMods) {
        const parsed = JSON.parse(storedMods);
        activeModIds = parsed.filter((m: any) => m.enabled).map((m: any) => m.id);
      }
    } catch {}

    let customModProfiles: ModProfile[] = [];
    try {
      const profs = localStorage.getItem('nfsmw_mod_profiles');
      if (profs) customModProfiles = JSON.parse(profs);
    } catch {}

    // 2. Gather OPFS save files from /opfs/nfsmw/profile/
    let userProfileFiles: Record<string, string> = {};
    if (navigator.storage && navigator.storage.getDirectory) {
      try {
        const root = await navigator.storage.getDirectory();
        let nfsmwDir: FileSystemDirectoryHandle | null = null;
        try {
          nfsmwDir = await root.getDirectoryHandle('nfsmw');
        } catch {
          // If flat structure
        }
        if (nfsmwDir) {
          try {
            const profileDir = await nfsmwDir.getDirectoryHandle('profile');
            userProfileFiles = await this.readOpfsDirBase64(profileDir);
          } catch {}
        }
      } catch (err) {
        console.warn('[ProfileSync] OPFS read error:', err);
      }
    }

    const backupData: FullProfileBackup = {
      format: 'nfsmw-reborn-profile',
      version: '2.0.0',
      timestamp: Date.now(),
      createdAt: new Date().toISOString(),
      settings: settings as any,
      mobileControls: mobileControls as any,
      keyBindings: keyBindings as any,
      controllerBindings: controllerBindings as any,
      activeModIds,
      customModProfiles,
      userProfileFiles,
    };

    const jsonStr = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const dateStr = new Date().toISOString().slice(0, 10);
    const filename = `NFSMW_Reborn_Backup_${dateStr}.nfsmwcfg`;

    const summary = `Exported ${Object.keys(userProfileFiles).length} career save files, ${activeModIds.length} active mods, and complete touch/controller bindings.`;

    return { filename, blob, summary };
  }

  /**
   * Import and restore full profile backup
   */
  public async importBackup(file: File): Promise<{
    success: boolean;
    restoredSavesCount: number;
    summary: string;
  }> {
    const text = await file.text();
    let data: FullProfileBackup;
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error('Invalid backup file. Must be a valid .nfsmwcfg JSON file.');
    }

    if (data.format !== 'nfsmw-reborn-profile') {
      throw new Error('Unrecognized backup format. Please select an authentic .nfsmwcfg profile backup.');
    }

    // 1. Restore localStorage
    if (data.settings) {
      localStorage.setItem('nfsmw_settings', JSON.stringify(data.settings));
    }
    if (data.mobileControls) {
      localStorage.setItem('nfsmw_mobile_controls', JSON.stringify(data.mobileControls));
    }
    if (data.keyBindings) {
      localStorage.setItem('nfsmw_key_bindings', JSON.stringify(data.keyBindings));
    }
    if (data.controllerBindings) {
      localStorage.setItem('nfsmw_controller_bindings', JSON.stringify(data.controllerBindings));
    }
    if (data.customModProfiles) {
      localStorage.setItem('nfsmw_mod_profiles', JSON.stringify(data.customModProfiles));
    }

    // Restore active mods state
    if (data.activeModIds && Array.isArray(data.activeModIds)) {
      try {
        const stored = localStorage.getItem('nfsmw_real_mods');
        if (stored) {
          const mods = JSON.parse(stored);
          const activeSet = new Set(data.activeModIds);
          for (const m of mods) {
            m.enabled = activeSet.has(m.id);
          }
          localStorage.setItem('nfsmw_real_mods', JSON.stringify(mods));
        }
      } catch {}
    }

    // 2. Restore OPFS save files into /opfs/nfsmw/profile/
    let restoredCount = 0;
    if (data.userProfileFiles && Object.keys(data.userProfileFiles).length > 0 && navigator.storage?.getDirectory) {
      try {
        const root = await navigator.storage.getDirectory();
        const nfsmwDir = await root.getDirectoryHandle('nfsmw', { create: true });
        const profileDir = await nfsmwDir.getDirectoryHandle('profile', { create: true });
        restoredCount = await this.writeOpfsDirBase64(profileDir, data.userProfileFiles);
      } catch (err) {
        console.warn('[ProfileSync] Failed restoring save files to OPFS:', err);
      }
    }

    const summary = `Successfully restored all settings, ${restoredCount} career progress save files, and controls configuration!`;
    return {
      success: true,
      restoredSavesCount: restoredCount,
      summary,
    };
  }

  /**
   * Helper to download exported backup in browser
   */
  public downloadFile(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 1500);
  }
}
