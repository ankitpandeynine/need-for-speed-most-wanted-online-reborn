#!/usr/bin/env node
/**
 * mwmod CLI tool for Need for Speed: Most Wanted (2005) Browser Edition
 */

import * as path from 'node:path';
import * as fs from 'node:fs';
import { ModPackager } from '../dist/sdk/mod_packager.js';
import { validateManifest } from '../dist/core/manifest.js';

const argv = process.argv.slice(2);
const command = argv[0];

function printHelp() {
  console.log(`
mwmod - Mod Management & Packaging CLI for NFSMW Browser Edition

Commands:
  pack <dir> [out.mwmod]     Package a mod directory into a .mwmod archive
  validate <dir_or_file>     Validate manifest.json syntax and rules
  hash <string>              Calculate EA bStringHash for a given symbol or texture name
  help                       Show this help message
`);
}

async function main() {
  if (!command || command === 'help' || command === '--help' || command === '-h') {
    printHelp();
    return;
  }

  if (command === 'pack') {
    const srcDir = argv[1];
    if (!srcDir) {
      console.error('Error: specify directory to pack. Example: mwmod pack ./my-mod');
      process.exit(1);
    }
    const manifestPath = path.join(srcDir, 'manifest.json');
    if (!fs.existsSync(manifestPath)) {
      console.error(`Error: manifest.json not found in ${srcDir}`);
      process.exit(1);
    }
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    const outFile = argv[2] || `${manifest.id || 'mod'}-${manifest.version || '1.0.0'}.mwmod`;

    console.log(`Packing "${manifest.name}" (${manifest.id} v${manifest.version})...`);
    const result = await ModPackager.packDirectory(srcDir, outFile);
    console.log(`Successfully created ${outFile} (${result.fileCount} files, ${result.bytes} bytes).`);
  } else if (command === 'validate') {
    const target = argv[1];
    if (!target) {
      console.error('Error: specify path to manifest.json or directory');
      process.exit(1);
    }
    const manifestPath = fs.statSync(target).isDirectory() ? path.join(target, 'manifest.json') : target;
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    const res = validateManifest(manifest);
    if (res.valid) {
      console.log(`✓ Manifest "${manifest.name}" is valid!`);
    } else {
      console.error(`✗ Manifest validation failed:\n - ${res.errors.join('\n - ')}`);
      process.exit(1);
    }
  } else if (command === 'hash') {
    const str = argv[1];
    if (!str) {
      console.error('Error: specify string to hash. Example: mwmod hash BMWM3_TEXTURES');
      process.exit(1);
    }
    // Calculate bStringHash
    let hash = 0xffffffff;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash * 33) + (str.charCodeAt(i) & 0xff)) >>> 0;
    }
    console.log(`String: "${str}"`);
    console.log(`bStringHash: 0x${hash.toString(16).padStart(8, '0')} (${hash})`);
  } else {
    console.error(`Unknown command: ${command}`);
    printHelp();
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
