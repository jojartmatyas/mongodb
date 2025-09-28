import jwt from 'jsonwebtoken';

export function generateToken(user) {
  const payload = { uid: user._id.toString(), username: user.username, isAdmin: !!user.isAdmin };
  const secret = process.env.JWT_SECRET || 'devsecret';
  return jwt.sign(payload, secret, { expiresIn: '1h' });
}
