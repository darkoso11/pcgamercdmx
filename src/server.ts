import { APP_BASE_HREF } from '@angular/common';
import express, { Request, Response, NextFunction } from 'express';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import bootstrap from './main.server';
import compression from 'compression';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import { readFile } from 'node:fs/promises';

// Interfaces
interface RenderOptions {
  documentFilePath: string;
  url: string;
  publicPath: string;
  providers: Array<{ provide: any; useValue: any }>;
}

// Get directory name
const __dirname = dirname(fileURLToPath(import.meta.url));

// Express server
const app = express();
const distFolder = join(__dirname, '../dist/pcgamercdmx/browser');

// Middleware de seguridad y optimización
app.use(compression());
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        connectSrc: ["'self'", "ws://localhost:*"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "blob:"],
        fontSrc: ["'self'", "data:"],
        frameSrc: ["'self'"],
      },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
app.use(cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);

// Configuración básica
app.set('view engine', 'html');
app.set('views', distFolder);

// Middleware para logging
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Archivos estáticos
app.get(/(.*)/, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { originalUrl, baseUrl } = req;
    const app = await bootstrap();
    
    const html = await readFile(join(distFolder, 'index.html'), 'utf-8');
    const renderedApp = await app.toString();
    
    // Usar originalUrl y baseUrl
    const finalHtml = html
      .replace('<app-root></app-root>', renderedApp)
      .replace('<base href="/">', `<base href="${baseUrl}">`);
    
    res.send(finalHtml);
  } catch (err) {
    console.error('Error en SSR:', err);
    next(err);
  }
});

// Manejo de errores
const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  res.status(500).send('Error interno del servidor');
};

app.use(errorHandler);

export default app;