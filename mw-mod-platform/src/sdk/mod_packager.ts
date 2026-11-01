/**
 * Need for Speed: Most Wanted (2005) — Browser Edition
 * Universal Mod Packager & Bundle Archive (.mwmod)
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import * as zlib from 'node:zlib';
import { ModManifest, validateManifest, computeSha256 } from '../core/manifest.js';

export interface PackedFile {
  relativePath: string;
  data: Uint8Array;
  sha256: string;
}

export class ModPackager {
  /**
   * Reads a folder containing manifest.json and packs it into a .mwmod archive.
   */
  public static async packDirectory(srcDir: string, destFile: string): Promise<{ manifest: ModManifest; fileCount: number; bytes: number }> {
    const manifestPath = path.join(srcDir, 'manifest.json');
    if (!fs.existsSync(manifestPath)) {
      throw new Error(`Directory does not contain manifest.json: ${srcDir}`);
    }

    const manifestContent = fs.readFileSync(manifestPath, 'utf-8');
    const manifest = JSON.parse(manifestContent) as ModManifest;
    const val = validateManifest(manifest);
    if (!val.valid) {
      throw new Error(`Invalid manifest in ${srcDir}:\n` + val.errors.join('\n'));
    }

    // Collect all files in directory
    const files: PackedFile[] = [];
    const scan = (currentDir: string, relPrefix = '') => {
      const entries = fs.readdirSync(currentDir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.name.startsWith('.') || entry.name === 'Thumbs.db') continue;
        const fullPath = path.join(currentDir, entry.name);
        const relPath = relPrefix ? `${relPrefix}/${entry.name}` : entry.name;

        if (entry.isDirectory()) {
          scan(fullPath, relPath);
        } else if (entry.isFile()) {
          const raw = fs.readFileSync(fullPath);
          files.push({
            relativePath: relPath.replace(/\\/g, '/'),
            data: new Uint8Array(raw),
            sha256: computeSha256(raw),
          });
        }
      }
    };

    scan(srcDir);

    // Build standard ZIP archive buffer
    const zipBuffer = this.createZipArchive(files);
    fs.mkdirSync(path.dirname(destFile), { recursive: true });
    fs.writeFileSync(destFile, zipBuffer);

    return {
      manifest,
      fileCount: files.length,
      bytes: zipBuffer.byteLength,
    };
  }

  /**
   * Minimal, robust standard ZIP generator using node:zlib.
   */
  private static createZipArchive(files: PackedFile[]): Uint8Array {
    const localRecords: Uint8Array[] = [];
    const cdRecords: Uint8Array[] = [];
    let offset = 0;

    for (const f of files) {
      const nameBytes = Buffer.from(f.relativePath, 'utf8');
      const uncompressed = Buffer.from(f.data);
      const crc = crc32(uncompressed);
      const compressed = zlib.deflateRawSync(uncompressed);

      // Local file header (30 bytes + name)
      const lfh = Buffer.alloc(30 + nameBytes.length);
      lfh.writeUInt32LE(0x04034b50, 0); // Signature
      lfh.writeUInt16LE(20, 4);         // Version needed: 2.0
      lfh.writeUInt16LE(0, 6);          // Flags
      lfh.writeUInt16LE(8, 8);          // Compression: Deflate
      lfh.writeUInt16LE(0, 10);         // Mod time
      lfh.writeUInt16LE(0, 12);         // Mod date
      lfh.writeUInt32LE(crc, 14);       // CRC-32
      lfh.writeUInt32LE(compressed.length, 18);   // Compressed size
      lfh.writeUInt32LE(uncompressed.length, 22); // Uncompressed size
      lfh.writeUInt16LE(nameBytes.length, 26);    // Filename length
      lfh.writeUInt16LE(0, 28);         // Extra field length
      nameBytes.copy(lfh, 30);

      // Central directory header (46 bytes + name)
      const cdh = Buffer.alloc(46 + nameBytes.length);
      cdh.writeUInt32LE(0x02014b50, 0); // Signature
      cdh.writeUInt16LE(20, 4);         // Version made by
      cdh.writeUInt16LE(20, 6);         // Version needed
      cdh.writeUInt16LE(0, 8);          // Flags
      cdh.writeUInt16LE(8, 10);         // Compression: Deflate
      cdh.writeUInt16LE(0, 12);         // Mod time
      cdh.writeUInt16LE(0, 14);         // Mod date
      cdh.writeUInt32LE(crc, 16);       // CRC-32
      cdh.writeUInt32LE(compressed.length, 20);   // Compressed size
      cdh.writeUInt32LE(uncompressed.length, 24); // Uncompressed size
      cdh.writeUInt16LE(nameBytes.length, 28);    // Filename length
      cdh.writeUInt16LE(0, 30);         // Extra length
      cdh.writeUInt16LE(0, 32);         // Comment length
      cdh.writeUInt16LE(0, 34);         // Disk start
      cdh.writeUInt16LE(0, 36);         // Internal attributes
      cdh.writeUInt32LE(0, 38);         // External attributes
      cdh.writeUInt32LE(offset, 42);    // Local header offset
      nameBytes.copy(cdh, 46);

      localRecords.push(lfh, compressed);
      cdRecords.push(cdh);
      offset += lfh.length + compressed.length;
    }

    const cdOffset = offset;
    let cdSize = 0;
    for (const c of cdRecords) cdSize += c.length;

    // End of Central Directory (22 bytes)
    const eocd = Buffer.alloc(22);
    eocd.writeUInt32LE(0x06054b50, 0); // Signature
    eocd.writeUInt16LE(0, 4);          // Disk number
    eocd.writeUInt16LE(0, 6);          // Start disk
    eocd.writeUInt16LE(files.length, 8);  // Total entries on disk
    eocd.writeUInt16LE(files.length, 10); // Total entries
    eocd.writeUInt32LE(cdSize, 12);       // Central dir size
    eocd.writeUInt32LE(cdOffset, 16);     // Central dir offset
    eocd.writeUInt16LE(0, 20);            // Comment length

    return Buffer.concat([...localRecords, ...cdRecords, eocd]);
  }
}

/** Standard CRC-32 computation */
function crc32(buf: Buffer): number {
  let crc = ~0;
  for (let i = 0; i < buf.length; i++) {
    const byte = buf[i];
    crc ^= byte;
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (-(crc & 1) & 0xedb88320);
    }
  }
  return ~crc >>> 0;
}
