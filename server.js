import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import os from 'os';
import checkDiskSpace from 'check-disk-space';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// 🛡 Sécurité et perfs
app.use(helmet());
app.use(compression());
app.use(morgan('combined'));

// 📁 Fichiers statiques (si besoin)
app.use(
  express.static(path.join(__dirname), {
    maxAge: '1d',
    etag: true,
    lastModified: true,
  })
);

// 🧠 API système (RAM + espace disque)
app.get('/api/system-info', async (req, res) => {
  try {
    const ramTotal = os.totalmem();
    const diskPath = process.platform === 'win32' ? 'C:' : '/';
    const { size, free } = await checkDiskSpace(diskPath);
    res.json({ ramTotal, diskTotal: size, diskFree: free });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur récupération infos système' });
  }
});

app.use(
  express.static(path.join(__dirname), {
    maxAge: '1d',
    etag: true,
    lastModified: true,
  })
);
// 🚀 Lancer le serveur
app.listen(PORT, () => {
  console.log(`✅ Serveur mserv lancé sur http://localhost:${PORT}`);
});
