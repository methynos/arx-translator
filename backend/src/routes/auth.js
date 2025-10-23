const express = require('express');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authController = require('../controllers/authController');
const { validateEmail } = require('../middleware/validation');

module.exports = (db) => {
  const router = express.Router();


  router.post('/register', validateEmail, async (req, res, next) => {
    try {
      const { email, password, name } = req.body;

      if (!password || password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
      }

      const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
      if (existingUser) {
        return res.status(409).json({ error: 'Email already registered' });
      }

      const userId = uuidv4();
      const hashedPassword = await bcrypt.hash(password, 10);

      db.prepare(`
        INSERT INTO users (id, email, name, password_hash, role)
        VALUES (?, ?, ?, ?, 'free')
      `).run(userId, email, name || email.split('@')[0], hashedPassword);

      const token = jwt.sign({ userId, email }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRY
      });

      res.status(201).json({
        token,
        user: { id: userId, email, name: name || email.split('@')[0], role: 'free' }
      });
    } catch (error) {
      next(error);
    }
  });


  router.post('/login', async (req, res, next) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password required' });
      }

      const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const passwordMatch = await bcrypt.compare(password, user.password_hash);
      if (!passwordMatch) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRY
      });

      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          plan: user.plan
        }
      });
    } catch (error) {
      next(error);
    }
  });


  router.get('/me', require('../middleware/auth'), (req, res) => {
    const user = db.prepare(`
      SELECT id, email, name, role, plan, translations_count, discord_user_id, created_at
      FROM users WHERE id = ?
    `).get(req.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

   
    const subscription = db.prepare(`
      SELECT * FROM subscriptions WHERE user_id = ? ORDER BY created_at DESC LIMIT 1
    `).get(req.userId);

    res.json({
      ...user,
      subscription: subscription || null
    });
  });

  return router;
};