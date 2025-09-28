import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { requireAuth, requireAdmin } from '../middleware/authMiddleware.js';

const router = Router();

function fail(res, code, msg) { return res.status(code).json({ success: false, error: msg }); }

// Minden admin végpontnál előbb auth, majd admin ellenőrzés.
router.use(requireAuth, requireAdmin);

// Lista összes userről (limit + keresés opcionális)
router.get('/users', async (req, res) => {
  try {
    const { q = '', limit = 200 } = req.query;
    let filter = {};
    if (q) {
      // Regex injection elleni minimális escape
      const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, r => `\\${r}`);
      filter.username = { $regex: `^${escaped}`, $options: 'i' }; // prefix keresés
    }
    const users = await User.find(filter, { username: 1, isAdmin: 1, createdAt: 1 }).sort({ createdAt: -1 }).limit(Number(limit)).lean();
    res.json({ success: true, users });
  } catch (e) {
    console.error(e);
    fail(res, 500, 'Lista hiba');
  }
});

// Új user létrehozása (admin felület)
router.post('/users', async (req, res) => {
  try {
    const { username, password, isAdmin = false } = req.body || {};
    if (!username || !password) return fail(res, 400, 'Hiányzó mezők');
    if (password.length < 4) return fail(res, 422, 'Gyenge jelszó');
    const exists = await User.findOne({ username });
    if (exists) return fail(res, 409, 'Felhasználónév foglalt');
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ username, passwordHash, isAdmin: !!isAdmin });
    res.status(201).json({ success: true, user: { id: user._id, username: user.username, isAdmin: user.isAdmin } });
  } catch (e) {
    console.error(e);
    fail(res, 500, 'Létrehozási hiba');
  }
});

// User módosítása (név / jelszó / admin flag)
router.patch('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { username, password, isAdmin } = req.body || {};
    const updates = {};
    if (username) updates.username = username;
    if (typeof isAdmin === 'boolean') updates.isAdmin = isAdmin;
    if (password) {
      if (password.length < 4) return fail(res, 422, 'Gyenge jelszó');
      updates.passwordHash = await bcrypt.hash(password, 10);
    }
    if (Object.keys(updates).length === 0) return fail(res, 400, 'Nincs módosítás');
    const user = await User.findByIdAndUpdate(id, updates, { new: true });
    if (!user) return fail(res, 404, 'Nem található');
    res.json({ success: true, user: { id: user._id, username: user.username, isAdmin: user.isAdmin } });
  } catch (e) {
    console.error(e);
    if (e.code === 11000) return fail(res, 409, 'Felhasználónév foglalt');
    fail(res, 500, 'Módosítási hiba');
  }
});

// Törlés
router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const self = req.user.id === id;
    const result = await User.findByIdAndDelete(id);
    if (!result) return fail(res, 404, 'Nem található');
    res.json({ success: true, deleted: id, self });
  } catch (e) {
    console.error(e);
    fail(res, 500, 'Törlési hiba');
  }
});

// Gyors promote/demote
router.post('/users/:id/toggle-admin', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) return fail(res, 404, 'Nem található');
    user.isAdmin = !user.isAdmin;
    await user.save();
    res.json({ success: true, user: { id: user._id, username: user.username, isAdmin: user.isAdmin } });
  } catch (e) {
    console.error(e);
    fail(res, 500, 'Admin toggle hiba');
  }
});

export default router;
