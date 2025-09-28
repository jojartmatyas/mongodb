import mongoose from 'mongoose';

// Egyszerű, egységes users gyűjtemény.
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, trim: true, minlength: 3, maxlength: 40, unique: true },
  passwordHash: { type: String, required: true },
  // Egyszerű jogosultság: admin vagy sem.
  isAdmin: { type: Boolean, default: false }
}, { timestamps: true, versionKey: false });

userSchema.index({ username: 1 }, { unique: true });

export const User = mongoose.model('User', userSchema, 'users');

