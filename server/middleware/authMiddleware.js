import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

// Általános authentikációs middleware – Bearer token ellenőrzés
export async function requireAuth(req, res, next) {
  try {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token) return res.status(401).json({ success: false, error: 'Hiányzó token' });
    const secret = process.env.JWT_SECRET || 'devsecret';
    let payload;
    try {
      payload = jwt.verify(token, secret);
    } catch (e) {
      return res.status(401).json({ success: false, error: 'Érvénytelen vagy lejárt token' });
    }
    const user = await User.findById(payload.uid).lean();
    if (!user) return res.status(401).json({ success: false, error: 'Felhasználó nem létezik' });
    req.user = { id: user._id.toString(), username: user.username, isAdmin: !!user.isAdmin };
    next();
  } catch (e) {
    console.error('[requireAuth] hiba', e);
    return res.status(500).json({ success: false, error: 'Auth hiba' });
  }
}

export function requireAdmin(req, res, next) {
  if (!req.user?.isAdmin) {
    return res.status(403).json({ success: false, error: 'Admin jogosultság szükséges' });
  }
  next();
}
