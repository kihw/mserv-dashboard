import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import helmet from 'helmet'; // Recommandé pour la sécurité

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Sécurité et performances
app.use(helmet());
app.use(compression()); // Compression des réponses

// Logging amélioré
app.use(morgan('combined'));

// Routes statiques optimisées
app.use(
  express.static(path.join(__dirname), {
    maxAge: '1d', // Cache navigateur
    etag: true,
    lastModified: true,
  })
);
