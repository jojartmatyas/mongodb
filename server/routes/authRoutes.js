import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { generateToken } from '../utils/generateToken.js';

const router = Router();

// Helper egységes error válaszhoz
function fail(res, code, msg) {
  return res.status(code).json({ success: false, error: msg });
}

router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) return fail(res, 400, 'Hiányzó mezők');
    if (username.length < 3) return fail(res, 422, 'Túl rövid felhasználónév');
    if (password.length < 4) return fail(res, 422, 'Gyenge jelszó');
  const exists = await User.findOne({ username });
  if (exists) return fail(res, 409, 'Felhasználónév foglalt');
  // Ha még nincs egy felhasználó sem, az első automatikusan admin lesz.
  const userCount = await User.countDocuments();
  const passwordHash = await bcrypt.hash(password, 10);
  await User.create({ username, passwordHash, isAdmin: userCount === 0 });
    if (process.env.NODE_ENV !== 'production') console.log('[REGISTER] user created:', username);
    return res.status(201).json({ success: true, message: 'Regisztráció sikeres' });
  } catch (err) {
    console.error(err);
    return fail(res, 500, 'Szerver hiba');
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) return fail(res, 400, 'Hiányzó mezők');
    const user = await User.findOne({ username });
    if (!user) return fail(res, 401, 'Hibás adatok');
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return fail(res, 401, 'Hibás adatok');
    const token = generateToken(user);
    return res.json({ success: true, token, user: { username: user.username, isAdmin: !!user.isAdmin } });
  } catch (err) {
    console.error(err);
    return fail(res, 500, 'Szerver hiba');
  }
});

// Opcionális seed endpoint fejlesztéshez – csak nem production környezetben.
if (process.env.NODE_ENV !== 'production') {
  router.post('/dev-seed', async (req, res) => {
    try {
      const { username = 'demo', password = 'demo1234' } = req.body || {};
      const exists = await User.findOne({ username });
      if (exists) return res.json({ success: true, message: 'Már létezik', username });
      const passwordHash = await bcrypt.hash(password, 10);
      await User.create({ username, passwordHash });
      return res.json({ success: true, message: 'Seed létrehozva', username, password });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ success: false, error: 'Seed hiba' });
    }
  });

  router.get('/dev-list', async (_req, res) => {
    try {
      const users = await User.find({}, { username: 1, createdAt: 1, _id: 0 }).lean();
      return res.json({ success: true, users });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ success: false, error: 'List hiba' });
    }
  });
}

export default router;
