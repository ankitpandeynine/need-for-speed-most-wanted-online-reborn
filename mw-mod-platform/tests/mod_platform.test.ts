/**
 * Unit tests for @nfsmw/mod-platform
 */

import { test, describe } from 'node:test';
import * as assert from 'node:assert';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import {
  bStringHash,
  validateManifest,
  VirtualFileSystem,
  WebGPUTextureReplacer,
  ModPackager,
  ModManifest,
} from '../src/index.js';

describe('Mod Platform Core & Hashing', () => {
  test('bStringHash produces correct 32-bit EA hashes', () => {
    // Known resolution hash check from docs/analysis.md & nfsmw.c
    const autoHash = bStringHash('OPT_VO_PC_RES_AUTO');
    assert.strictEqual(typeof autoHash, 'number');
    assert.ok(autoHash > 0);

    // Verify consistency
    const m3Hash1 = bStringHash('BMWM3_TEXTURES');
    const m3Hash2 = bStringHash('BMWM3_TEXTURES');
    assert.strictEqual(m3Hash1, m3Hash2);

    // Verify case sensitivity (EA bStringHash is case-sensitive on input)
    assert.notStrictEqual(bStringHash('car'), bStringHash('CAR'));
  });

  test('validateManifest rejects invalid manifests and accepts valid ones', () => {
    const invalidRes = validateManifest({});
    assert.strictEqual(invalidRes.valid, false);
    assert.ok(invalidRes.errors.length > 0);

    const validManifest: ModManifest = {
      id: 'hd-textures-palmont',
      name: 'Palmont HD Textures',
      version: '1.0.0',
      game: 'nfsmw-2005',
      type: 'texture',
      author: 'SpeedDemon',
      priority: 10,
      assets: [
        {
          source: 'textures/globalb.bin',
          target: 'GLOBAL/GLOBALB.BIN',
        },
      ],
    };

    const validRes = validateManifest(validManifest);
    assert.strictEqual(validRes.valid, true);
    assert.strictEqual(validRes.errors.length, 0);
  });
});

describe('Virtual File System (VFS)', () => {
  test('VFS normalizes Windows and Unix paths identically', () => {
    const p1 = VirtualFileSystem.normalizePath('C:\\Games\\NFSMW\\CARS\\BMWM3\\TEXTURES.BIN');
    const p2 = VirtualFileSystem.normalizePath('/cars/bmwm3/textures.bin');
    const p3 = VirtualFileSystem.normalizePath('cars\\bmwm3\\textures.bin');
    assert.strictEqual(p1, 'cars/bmwm3/textures.bin');
    assert.strictEqual(p2, 'cars/bmwm3/textures.bin');
    assert.strictEqual(p3, 'cars/bmwm3/textures.bin');
  });

  test('VFS layers mods over base files by priority', () => {
    const vfs = new VirtualFileSystem();

    // Register base game file
    vfs.registerBaseFile('GLOBAL/GLOBALB.BIN', 100, async () => new Uint8Array([1, 2, 3]));

    // Check base file resolves
    const initial = vfs.resolve('GLOBAL\\GLOBALB.BIN');
    assert.ok(initial);
    assert.strictEqual(initial.sourceModId, undefined);

    // Add lower priority mod
    const modA = {
      modId: 'mod-a',
      name: 'Mod A',
      priority: 5,
      enabled: true,
      files: new Map([
        [
          'global/globalb.bin',
          {
            relativePath: 'textures/global_a.bin',
            size: 200,
            provider: async () => new Uint8Array([4, 5, 6]),
          },
        ],
      ]),
    };
    vfs.addModLayer(modA);

    // Should resolve from mod-a now
    const afterA = vfs.resolve('global/globalb.bin');
    assert.ok(afterA);
    assert.strictEqual(afterA.sourceModId, 'mod-a');

    // Add higher priority mod
    const modB = {
      modId: 'mod-b',
      name: 'Mod B',
      priority: 10,
      enabled: true,
      files: new Map([
        [
          'global/globalb.bin',
          {
            relativePath: 'textures/global_b.bin',
            size: 300,
            provider: async () => new Uint8Array([7, 8, 9]),
          },
        ],
      ]),
    };
    vfs.addModLayer(modB);

    // Should resolve from mod-b because priority 10 > 5
    const afterB = vfs.resolve('GLOBAL/GLOBALB.BIN');
    assert.ok(afterB);
    assert.strictEqual(afterB.sourceModId, 'mod-b');

    // Disable mod-b -> should fall back to mod-a
    vfs.setModEnabled('mod-b', false);
    const afterDisableB = vfs.resolve('GLOBAL/GLOBALB.BIN');
    assert.ok(afterDisableB);
    assert.strictEqual(afterDisableB.sourceModId, 'mod-a');

    // Disable mod-a -> should fall back to base
    vfs.setModEnabled('mod-a', false);
    const afterDisableA = vfs.resolve('GLOBAL/GLOBALB.BIN');
    assert.ok(afterDisableA);
    assert.strictEqual(afterDisableA.sourceModId, undefined);
  });
});

describe('WebGPU HD Texture Replacement', () => {
  test('registers and intercepts HD texture replacements', () => {
    const replacer = new WebGPUTextureReplacer();
    const fakeData = new Uint8Array([255, 0, 0, 255]);

    replacer.registerTextureByName('SPEEDO_NEEDLE', fakeData, 1024, 1024, 'hd-hud-mod');

    const needleHash = bStringHash('SPEEDO_NEEDLE');
    const intercepted = replacer.interceptTextureUpload(needleHash, 256, 256);

    assert.ok(intercepted);
    assert.strictEqual(intercepted.width, 1024);
    assert.strictEqual(intercepted.height, 1024);
    assert.strictEqual(intercepted.sourceModId, 'hd-hud-mod');

    const stats = replacer.getStats();
    assert.strictEqual(stats.totalRegistered, 1);
    assert.strictEqual(stats.totalInjected, 1);
    assert.strictEqual(stats.totalOverridesHit, 1);
  });
});

describe('Mod Packager (.mwmod)', () => {
  test('packs a directory into a valid .mwmod zip bundle', async () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mwmod-test-'));
    const manifest: ModManifest = {
      id: 'test-starter-pack',
      name: 'Starter Mod Pack',
      version: '1.0.0',
      game: 'nfsmw-2005',
      type: 'texture',
      author: 'AntigravityPair',
      priority: 1,
      assets: [
        {
          source: 'assets/test.bin',
          target: 'GLOBAL/TEST.BIN',
        },
      ],
    };

    fs.writeFileSync(path.join(tmpDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
    fs.mkdirSync(path.join(tmpDir, 'assets'), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, 'assets/test.bin'), 'NFSMW_HD_TEXTURE_BYTES');

    const outZip = path.join(tmpDir, 'test-starter-pack-1.0.0.mwmod');
    const packRes = await ModPackager.packDirectory(tmpDir, outZip);

    assert.strictEqual(packRes.manifest.id, 'test-starter-pack');
    assert.ok(fs.existsSync(outZip));
    assert.ok(fs.statSync(outZip).size > 100);

    // Clean up
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });
});
