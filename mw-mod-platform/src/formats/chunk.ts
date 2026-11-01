/**
 * Need for Speed: Most Wanted (2005)
 * EA Chunk File Format and TPK Texture Pack Parser
 */

export interface EAChunkHeader {
  id: number;
  idHex: string;
  size: number;
  offset: number;
  dataOffset: number;
}

export interface TPKTextureMeta {
  hash: number;
  hashHex: string;
  name?: string;
  width: number;
  height: number;
  mipLevels: number;
  d3dFormat: number;
  d3dFormatName: string;
  dataOffset: number;
  dataSize: number;
}

export const KNOWN_CHUNKS = {
  TPK_INFO: 0x00030201,
  TPK_DATA: 0x00030202,
  TPK_ANIM: 0x00030203,
  GEOMETRY_PARTS: 0x80134000,
  GEOMETRY_MATERIALS: 0x00134001,
  GEOMETRY_VERTICES: 0x00134011,
  GEOMETRY_INDICES: 0x00134012,
  CARP_ROAD_NETWORK: 0x0003410F,
  COLLISION_CONTAINER: 0x00034110,
  VLT_ROOT: 0x00033000,
} as const;

export const D3D_FORMAT_NAMES: Record<number, string> = {
  0x31545844: 'DXT1', // "DXT1" in ASCII little-endian
  0x33545844: 'DXT3', // "DXT3"
  0x35545844: 'DXT5', // "DXT5"
  21: 'D3DFMT_A8R8G8B8',
  22: 'D3DFMT_X8R8G8B8',
  23: 'D3DFMT_R5G6B5',
  26: 'D3DFMT_A8',
  28: 'D3DFMT_A4R4G4B4',
  50: 'D3DFMT_L8',
};

/**
 * Scan binary stream for top-level EA chunks.
 */
export function scanEAChunks(buffer: Uint8Array): EAChunkHeader[] {
  const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
  const chunks: EAChunkHeader[] = [];
  let cursor = 0;

  while (cursor + 8 <= buffer.byteLength) {
    const id = view.getUint32(cursor, true);
    const size = view.getUint32(cursor + 4, true);

    chunks.push({
      id,
      idHex: '0x' + id.toString(16).padStart(8, '0'),
      size,
      offset: cursor,
      dataOffset: cursor + 8,
    });

    const nextOffset = cursor + 8 + size;
    // Align to 4 bytes if necessary
    cursor = (nextOffset + 3) & ~3;
    if (size === 0 || nextOffset > buffer.byteLength) {
      break;
    }
  }

  return chunks;
}

/**
 * Parse TPK header chunk (0x00030201) to locate texture entries.
 */
export function parseTPKInfo(buffer: Uint8Array, chunk: EAChunkHeader): TPKTextureMeta[] {
  if (chunk.id !== KNOWN_CHUNKS.TPK_INFO) {
    throw new Error(`Expected chunk 0x00030201, got ${chunk.idHex}`);
  }

  const view = new DataView(buffer.buffer, buffer.byteOffset + chunk.dataOffset, chunk.size);
  const textures: TPKTextureMeta[] = [];

  // TPK info block contains subchunks or structured texture descriptors
  // Typically: 0x30201 has internal subchunks or a header with count at +0x24 / +0x28
  if (chunk.size < 0x30) return textures;

  // Search for texture descriptor structures inside TPK Info
  let pos = 0;
  while (pos + 0x40 <= chunk.size) {
    const hash = view.getUint32(pos, true);
    // Sanity check valid D3D format or DXT FourCC at pos + 0x24
    if (pos + 0x30 <= chunk.size) {
      const fourcc = view.getUint32(pos + 0x24, true);
      const w = view.getUint16(pos + 0x28, true);
      const h = view.getUint16(pos + 0x2a, true);
      const mips = view.getUint8(pos + 0x2c);

      if ((fourcc in D3D_FORMAT_NAMES || fourcc > 0) && w >= 4 && w <= 8192 && h >= 4 && h <= 8192 && mips <= 16) {
        textures.push({
          hash,
          hashHex: '0x' + hash.toString(16).padStart(8, '0'),
          width: w,
          height: h,
          mipLevels: mips,
          d3dFormat: fourcc,
          d3dFormatName: D3D_FORMAT_NAMES[fourcc] || `FORMAT_${fourcc}`,
          dataOffset: 0,
          dataSize: 0,
        });
        pos += 0x3c;
        continue;
      }
    }
    pos += 4;
  }

  return textures;
}
