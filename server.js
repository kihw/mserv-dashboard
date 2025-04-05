import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware de journalisation
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Servir les fichiers statiques
app.use(express.static(path.join(__dirname)));

// Servir les fichiers de configuration
app.use('/config', express.static(path.join(__dirname, 'config')));

// Route principale
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Gestion des routes de configuration
app.get('../../config/services.json', (req, res) => {
  res.sendFile(path.join(__dirname, '..', '..', 'config', 'services.json'));
});

// Gestion des erreurs 404
app.use((req, res, next) => {
  res.status(404).send('Resource not found');
});

// Gestion des erreurs serveur
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
