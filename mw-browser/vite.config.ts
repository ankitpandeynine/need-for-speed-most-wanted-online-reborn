import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';

function gameAssetsPlugin(): Plugin {
  const gameDir = '/Users/ankit/Downloads/ga/Need For Speed Most Wanted Black Edition';
  
  const middleware = (req: any, res: any, next: any) => {
    const rawUrl = (req.url || '').split('?')[0];
    const decodedUrl = decodeURIComponent(rawUrl).replace(/^\/+/, '');
    const targetPath = path.join(gameDir, decodedUrl);

    // Prevent directory traversal
    if (!targetPath.startsWith(path.resolve(gameDir))) {
      return next();
    }

    if (!fs.existsSync(targetPath) || !fs.statSync(targetPath).isFile()) {
      return next();
    }

    const stat = fs.statSync(targetPath);
    const range = req.headers.range;

    // Cross-origin isolation and streaming headers
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : stat.size - 1;
      const chunksize = end - start + 1;

      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${stat.size}`,
        'Content-Length': chunksize,
      });

      const stream = fs.createReadStream(targetPath, { start, end });
      stream.pipe(res);
    } else {
      res.writeHead(200, {
        'Content-Length': stat.size,
      });
      const stream = fs.createReadStream(targetPath);
      stream.pipe(res);
    }
  };

  return {
    name: 'game-assets-plugin',
    configureServer(server) {
      server.middlewares.use('/_game-assets/nfsmw', middleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use('/_game-assets/nfsmw', middleware);
    },
  };
}

export default defineConfig({
  plugins: [react(), gameAssetsPlugin()],
  server: {
    port: 3000,
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  },
  preview: {
    port: 3000,
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  },
});
