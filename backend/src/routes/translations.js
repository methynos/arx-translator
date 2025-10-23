const express = require('express');
const { v4: uuidv4 } = require('uuid');
const auth = require('../middleware/auth');
const translationController = require('../controllers/translationController');

module.exports = (db) => {
  const router = express.Router();

  // Translate code
  router.post('/translate', auth, async (req, res, next) => {
    try {
      const { sourceCode, sourceLang, targetLang } = req.body;

      if (!sourceCode || !sourceLang || !targetLang) {
        return res.status(400).json({ error: 'Missing required fields' });
      }


      const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.userId);

      if (user.role === 'free') {
        const lineCount = sourceCode.split('\n').length;
        if (lineCount > 100) {
          return res.status(403).json({
            error: 'Free plan limited to 100 lines. Upgrade to premium.',
            lineCount,
            limit: 100
          });
        }
      }


      const { translateCode } = require('../services/aiservice');
      const outputCode = await translateCode(sourceCode, sourceLang, targetLang);

      const translationId = uuidv4();
      db.prepare(`
        INSERT INTO translations (id, user_id, source_lang, target_lang, source_code, output_code)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(translationId, req.userId, sourceLang, targetLang, sourceCode, outputCode);


      db.prepare('UPDATE users SET translations_count = translations_count + 1 WHERE id = ?')
        .run(req.userId);

      res.json({
        id: translationId,
        sourceCode,
        outputCode,
        sourceLang,
        targetLang
      });
    } catch (error) {
      next(error);
    }
  });


  router.get('/history', auth, (req, res) => {
    const translations = db.prepare(`
      SELECT * FROM translations WHERE user_id = ? ORDER BY created_at DESC LIMIT 50
    `).all(req.userId);

    res.json(translations);
  });

  return router;
};