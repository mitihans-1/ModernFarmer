import http from 'http';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { apiRouter } from './server/routes.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getInitialPort(): number {
  const portIndex = process.argv.findIndex((arg) => arg === '--port' || arg === '-p');
  if (portIndex !== -1 && process.argv[portIndex + 1]) {
    const parsed = parseInt(process.argv[portIndex + 1], 10);
    if (!isNaN(parsed) && parsed > 0) return parsed;
  }
  const portArg = process.argv.find((arg) => arg.startsWith('--port='));
  if (portArg) {
    const parsed = parseInt(portArg.split('=')[1], 10);
    if (!isNaN(parsed) && parsed > 0) return parsed;
  }
  return Number(process.env.PORT) || 3000;
}

async function startServer() {
  const app = express();
  const httpServer = http.createServer(app);
  let currentPort = getInitialPort();
  const maxRetries = 10;
  let attempts = 0;

  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));

  // Mount API router
  app.use('/api', apiRouter);

  // In development, hook into Vite dev server middlewares
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: { server: httpServer },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  function attemptListen(port: number) {
    httpServer.listen(port, '0.0.0.0');
  }

  httpServer.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      attempts++;
      if (attempts <= maxRetries) {
        console.warn(`[Port ${currentPort} is in use] Automatically trying port ${currentPort + 1}...`);
        currentPort++;
        setTimeout(() => attemptListen(currentPort), 150);
      } else {
        console.error(`Error: Could not bind after ${maxRetries} attempts.`);
        process.exit(1);
      }
    } else {
      console.error('Server error:', err);
      process.exit(1);
    }
  });

  httpServer.on('listening', () => {
    console.log(`\n==============================================`);
    console.log(`  🌾 FarmLink Ethiopia server running on:`);
    console.log(`  > Local:   http://localhost:${currentPort}`);
    console.log(`  > Network: http://127.0.0.1:${currentPort}`);
    console.log(`==============================================\n`);
  });

  attemptListen(currentPort);
}

startServer();
