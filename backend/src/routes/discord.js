const express = require('express');

module.exports = (db) => {
  const router = express.Router();

  router.post('/link', (req, res) => {
    try {
      const { userId, discordUserId, email } = req.body;

      if (!userId || !discordUserId) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      db.prepare('UPDATE users SET discord_user_id = ? WHERE id = ?')
        .run(discordUserId, userId);

      res.json({ success: true, message: 'Discord account linked' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.get('/info/:userId', (req, res) => {
    try {
      const user = db.prepare('SELECT discord_user_id FROM users WHERE id = ?')
        .get(req.params.userId);

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({
        discordLinked: !!user.discord_user_id,
        discordUserId: user.discord_user_id
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
};