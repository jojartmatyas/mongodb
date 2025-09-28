import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { User } from './models/User.js';
import mongoose from 'mongoose';
import { getConnectionInfo } from './config/db.js';
import { connectDB } from './config/db.js';

const app = express();

const allowedOrigins = new Set([
  'http://localhost:5173',
  'http://localhost:5174'
]);

app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true); // pl. curl / Postman
    if (allowedOrigins.has(origin)) return cb(null, true);
    return cb(new Error('Origin not allowed: ' + origin));
  },
  credentials: true
}));
app.use(express.json());
app.use(morgan('dev'));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

if (process.env.NODE_ENV !== 'production') {
  app.get('/api/dev/user-count', async (_req, res) => {
    try {
      const c = await User.countDocuments();
      res.json({ success: true, count: c });
    } catch (e) {
      res.status(500).json({ success: false, error: 'Count hiba' });
    }
  });
  app.get('/api/dev/db-info', async (_req, res) => {
    try {
      const info = getConnectionInfo();
      const collections = await mongoose.connection.db.listCollections().toArray();
      res.json({ success: true, info, collections: collections.map(c => c.name) });
    } catch (e) {
      res.status(500).json({ success: false, error: 'Info hiba' });
    }
  });
}

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mongodbreact_auth';

connectDB(MONGO_URI).then(() => {
  app.listen(PORT, () => console.log('API szerver fut a porton:', PORT));
}).catch(err => {
  console.error('DB kapcsolódási hiba', err);
  process.exit(1);
});
