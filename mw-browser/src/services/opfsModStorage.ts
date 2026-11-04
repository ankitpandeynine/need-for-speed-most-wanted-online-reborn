/**
 * OPFS Mod Storage Service:
 * Handles real in-browser file overrides, ZIP extraction, backups, and restores
 * directly into the guest game filesystem at /opfs/nfsmw/game/.
 */

export interface ExtractedZipEntry {
  path: string;
  data: Uint8Array;
}

/**
 * Validates whether a file is a genuine implementable game asset.
 * Rejects link-only files (.url, .txt, .md, .html, .lnk) and non-game files.
 */
export function isRealGameAsset(filePath: string): boolean {
  const norm = filePath.replace(/\\/g, '/');
  const baseName = norm.split('/').pop() || '';
  if (!baseName || baseName.startsWith('.') || baseName === 'manifest.json') return false;

  // Compiled DirectX shader bytecode files (e.g. IDI_CAR_FX, IDI_FILTER_FX, IDI_WORLD_FX)
  if (baseName.startsWith('IDI_')) return true;

  const dotIdx = baseName.lastIndexOf('.');
  if (dotIdx === -1) return false;
  const ext = baseName.slice(dotIdx).toLowerCase();

  const REAL_EXTENSIONS = new Set([
    '.bin', '.ini', '.asi', '.dll', '.fx', '.bun', '.nfsms',
    '.end', '.lzc', '.tpf', '.vp6', '.dds', '.cfg', '.exe',
    '.tpk', '.raw', '.fe', '.mad', '.fed', '.mus'
  ]);

  return REAL_EXTENSIONS.has(ext);
}

/**
 * Pure TypeScript ZIP extractor using Web Streams DecompressionStream.
 * Unpacks any standard ZIP / .mwmod file in the browser without 3rd-party dependencies.
 */
export async function extractZipEntries(blob: Blob): Promise<ExtractedZipEntry[]> {
  const buf = await blob.arrayBuffer();
  const dv = new DataView(buf);
  const u8 = new Uint8Array(buf);

  // Find End of Central Directory (EOCD) signature (0x06054b50)
  let eocdOffset = -1;
  const searchLimit = Math.max(0, buf.byteLength - 65557);
  for (let i = buf.byteLength - 22; i >= searchLimit; i--) {
    if (dv.getUint32(i, true) === 0x06054b50) {
      eocdOffset = i;
      break;
    }
  }

  if (eocdOffset === -1) {
    throw new Error('Invalid archive: End of Central Directory not found');
  }

  const totalEntries = dv.getUint16(eocdOffset + 10, true);
  const cdOffset = dv.getUint32(eocdOffset + 16, true);

  const entries: ExtractedZipEntry[] = [];
  let p = cdOffset;
  const textDecoder = new TextDecoder();

  for (let i = 0; i < totalEntries && p < buf.byteLength; i++) {
    if (dv.getUint32(p, true) !== 0x02014b50) break; // Central directory header

    const method = dv.getUint16(p + 10, true);
    const compressedSize = dv.getUint32(p + 20, true);
    const fileNameLen = dv.getUint16(p + 28, true);
    const extraLen = dv.getUint16(p + 30, true);
    const commentLen = dv.getUint16(p + 32, true);
    const localHeaderOffset = dv.getUint32(p + 42, true);

    const fileNameBytes = u8.subarray(p + 46, p + 46 + fileNameLen);
    const fileName = textDecoder.decode(fileNameBytes).replace(/\\/g, '/');
    p += 46 + fileNameLen + extraLen + commentLen;

    // Skip directories
    if (fileName.endsWith('/')) continue;

    // Read local header to reach compressed payload
    if (dv.getUint32(localHeaderOffset, true) !== 0x04034b50) continue;
    const localFileNameLen = dv.getUint16(localHeaderOffset + 26, true);
    const localExtraLen = dv.getUint16(localHeaderOffset + 28, true);
    const dataStart = localHeaderOffset + 30 + localFileNameLen + localExtraLen;
    const rawData = u8.subarray(dataStart, dataStart + compressedSize);

    if (method === 0) {
      // Stored (no compression)
      entries.push({ path: fileName, data: rawData });
    } else if (method === 8) {
      // Deflate
      try {
        const stream = new Blob([rawData]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
        const decompressed = await new Response(stream).arrayBuffer();
        entries.push({ path: fileName, data: new Uint8Array(decompressed) });
      } catch (err) {
        console.warn(`[ModStorage] Could not decompress ${fileName}:`, err);
      }
    }
  }

  return entries;
}

/**
 * Access OPFS /nfsmw/game/ directory.
 */
export async function getGameDirectory(): Promise<FileSystemDirectoryHandle | null> {
  if (typeof navigator === 'undefined' || !navigator.storage?.getDirectory) return null;
  try {
    const root = await navigator.storage.getDirectory();
    const nfsmw = await root.getDirectoryHandle('nfsmw', { create: true });
    return await nfsmw.getDirectoryHandle('game', { create: true });
  } catch (e) {
    console.warn('[ModStorage] OPFS game directory unavailable:', e);
    return null;
  }
}

/**
 * Access OPFS /nfsmw/mods_backup/<modId>/ directory.
 */
export async function getBackupDirectory(modId: string): Promise<FileSystemDirectoryHandle | null> {
  if (typeof navigator === 'undefined' || !navigator.storage?.getDirectory) return null;
  try {
    const root = await navigator.storage.getDirectory();
    const nfsmw = await root.getDirectoryHandle('nfsmw', { create: true });
    const modsBackup = await nfsmw.getDirectoryHandle('mods_backup', { create: true });
    return await modsBackup.getDirectoryHandle(modId, { create: true });
  } catch (e) {
    console.warn('[ModStorage] OPFS mods_backup directory unavailable:', e);
    return null;
  }
}

/**
 * Navigate or create a nested file path inside an OPFS directory handle.
 */
async function getFileHandleForPath(
  dir: FileSystemDirectoryHandle,
  path: string,
  create: boolean
): Promise<FileSystemFileHandle> {
  const parts = path.split('/').filter(Boolean);
  const fileName = parts.pop()!;
  let current = dir;
  for (const part of parts) {
    current = await current.getDirectoryHandle(part, { create });
  }
  return await current.getFileHandle(fileName, { create });
}

/**
 * Write bytes to a path in OPFS game directory.
 */
export async function writeGameFile(path: string, data: Uint8Array): Promise<boolean> {
  const gameDir = await getGameDirectory();
  if (!gameDir) return false;
  try {
    const handle = await getFileHandleForPath(gameDir, path, true);
    if ((handle as any).createSyncAccessHandle) {
      const access = await (handle as any).createSyncAccessHandle();
      access.truncate(0);
      access.write(data, { at: 0 });
      access.flush();
      access.close();
    } else {
      const writable = await (handle as any).createWritable();
      await writable.write(data);
      await writable.close();
    }
    return true;
  } catch (err) {
    console.error(`[ModStorage] Failed writing ${path}:`, err);
    return false;
  }
}

/**
 * Remove a file from OPFS game directory.
 */
export async function removeGameFile(path: string): Promise<boolean> {
  const gameDir = await getGameDirectory();
  if (!gameDir) return false;
  try {
    const parts = path.split('/').filter(Boolean);
    const fileName = parts.pop()!;
    let current = gameDir;
    for (const part of parts) {
      current = await current.getDirectoryHandle(part, { create: false });
    }
    await current.removeEntry(fileName);
    return true;
  } catch {
    return false;
  }
}

/**
 * Backup an existing game file prior to applying mod override.
 */
export async function backupGameFile(modId: string, path: string): Promise<void> {
  const gameDir = await getGameDirectory();
  const backupDir = await getBackupDirectory(modId);
  if (!gameDir || !backupDir) return;
  try {
    const srcHandle = await getFileHandleForPath(gameDir, path, false);
    const file = await srcHandle.getFile();
    const data = new Uint8Array(await file.arrayBuffer());

    const dstHandle = await getFileHandleForPath(backupDir, path, true);
    if ((dstHandle as any).createSyncAccessHandle) {
      const access = await (dstHandle as any).createSyncAccessHandle();
      access.truncate(0);
      access.write(data, { at: 0 });
      access.flush();
      access.close();
    } else {
      const writable = await (dstHandle as any).createWritable();
      await writable.write(data);
      await writable.close();
    }
  } catch {
    // If file didn't exist before, no backup needed
  }
}

/**
 * Restore an original file from backup when disabling a mod.
 */
export async function restoreGameFile(modId: string, path: string): Promise<boolean> {
  const backupDir = await getBackupDirectory(modId);
  if (!backupDir) return false;
  try {
    const bkpHandle = await getFileHandleForPath(backupDir, path, false);
    const file = await bkpHandle.getFile();
    const data = new Uint8Array(await file.arrayBuffer());
    await writeGameFile(path, data);
    return true;
  } catch {
    // If no backup existed, it was an added file (e.g. extra INI), delete it
    await removeGameFile(path);
    return false;
  }
}

/**
 * Access OPFS /nfsmw/mods_cache/<modId>/ directory.
 */
export async function getModCacheDirectory(modId: string): Promise<FileSystemDirectoryHandle | null> {
  if (typeof navigator === 'undefined' || !navigator.storage?.getDirectory) return null;
  try {
    const root = await navigator.storage.getDirectory();
    const nfsmw = await root.getDirectoryHandle('nfsmw', { create: true });
    const modsCache = await nfsmw.getDirectoryHandle('mods_cache', { create: true });
    return await modsCache.getDirectoryHandle(modId, { create: true });
  } catch (e) {
    console.warn('[ModStorage] OPFS mods_cache directory unavailable:', e);
    return null;
  }
}

/**
 * Write bytes to mod cache in OPFS.
 */
export async function writeModCacheFile(modId: string, path: string, data: Uint8Array): Promise<boolean> {
  const cacheDir = await getModCacheDirectory(modId);
  if (!cacheDir) return false;
  try {
    const handle = await getFileHandleForPath(cacheDir, path, true);
    if ((handle as any).createSyncAccessHandle) {
      const access = await (handle as any).createSyncAccessHandle();
      access.truncate(0);
      access.write(data, { at: 0 });
      access.flush();
      access.close();
    } else {
      const writable = await (handle as any).createWritable();
      await writable.write(data);
      await writable.close();
    }
    return true;
  } catch (err) {
    console.error(`[ModStorage] Failed writing cache ${modId}/${path}:`, err);
    return false;
  }
}

/**
 * Read bytes from mod cache in OPFS.
 */
export async function getModCacheFile(modId: string, path: string): Promise<Uint8Array | null> {
  const cacheDir = await getModCacheDirectory(modId);
  if (!cacheDir) return null;
  try {
    const handle = await getFileHandleForPath(cacheDir, path, false);
    const file = await handle.getFile();
    return new Uint8Array(await file.arrayBuffer());
  } catch {
    return null;
  }
}

/**
 * List all relative file paths cached for a mod in OPFS.
 */
export async function listModCacheFiles(modId: string): Promise<string[]> {
  const cacheDir = await getModCacheDirectory(modId);
  if (!cacheDir) return [];
  const results: string[] = [];

  async function walk(dir: FileSystemDirectoryHandle, prefix: string) {
    for await (const [name, handle] of (dir as any).entries()) {
      const rel = prefix ? `${prefix}/${name}` : name;
      if (handle.kind === 'directory') {
        await walk(handle as FileSystemDirectoryHandle, rel);
      } else {
        results.push(rel);
      }
    }
  }

  try {
    await walk(cacheDir, '');
  } catch {}
  return results;
}
