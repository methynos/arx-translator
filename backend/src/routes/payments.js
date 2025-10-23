const express = require('express');
const { v4: uuidv4 } = require('uuid');
const auth = require('../middleware/auth');

const PLANS = {
  monthly: { price: 1.99, name: 'Monthly Premium' },
  permanent: { price: 14.99, name: 'Permanent Premium' },
  yearly: { price: 7.99, name: 'Yearly Premium' }
};

module.exports = (db) => {
  const router = express.Router();


  router.get('/plans', (req, res) => {
    res.json(PLANS);
  });


  router.post('/create-order', auth, (req, res) => {
    try {
      const { plan_type } = req.body;

      if (!PLANS[plan_type]) {
        return res.status(400).json({ error: 'Invalid plan type' });
      }

      const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.userId);
      const paymentId = uuidv4();
      const amount = PLANS[plan_type].price;


      db.prepare(`
        INSERT INTO payments (id, user_id, plan_type, amount, status)
        VALUES (?, ?, ?, ?, 'pending')
      `).run(paymentId, req.userId, plan_type, amount);


      const discordLink = `https://discord.com/users/${process.env.DISCORD_OWNER_ID}`;

      res.json({
        paymentId,
        amount,
        plan: PLANS[plan_type].name,
        plan_type,
        currency: 'EUR',
        discordLink,
        message: `Send €${amount} to Discord @${process.env.DISCORD_OWNER_ID || 'owner'} for ${PLANS[plan_type].name} and include payment ID: ${paymentId}`
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });


  router.post('/verify', (req, res) => {
    try {
      const { paymentId, userId } = req.body;
      const adminKey = req.headers['x-admin-key'];

      if (adminKey !== process.env.ADMIN_KEY) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const payment = db.prepare('SELECT * FROM payments WHERE id = ?').get(paymentId);
      if (!payment) {
        return res.status(404).json({ error: 'Payment not found' });
      }

   
      db.prepare('UPDATE payments SET status = ? WHERE id = ?').run('completed', paymentId);

  
      const user = db.prepare('SELECT * FROM users WHERE id = ?').get(payment.user_id);

 
      let newRole = 'premium';
      let renewalDate = null;

      if (payment.plan_type === 'monthly') {
        renewalDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      } else if (payment.plan_type === 'yearly') {
        renewalDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
      }

   
      db.prepare('UPDATE users SET role = ?, plan = ? WHERE id = ?')
        .run(newRole, payment.plan_type, payment.user_id);

  
      const existingSub = db.prepare('SELECT * FROM subscriptions WHERE user_id = ?')
        .get(payment.user_id);

      if (existingSub) {
        db.prepare(`
          UPDATE subscriptions 
          SET plan_type = ?, status = ?, renewal_date = ?, cancelled_at = NULL
          WHERE user_id = ?
        `).run(payment.plan_type, 'active', renewalDate, payment.user_id);
      } else {
        db.prepare(`
          INSERT INTO subscriptions (id, user_id, plan_type, status, renewal_date)
          VALUES (?, ?, ?, 'active', ?)
        `).run(uuidv4(), payment.user_id, payment.plan_type, renewalDate);
      }

      res.json({
        success: true,
        message: 'Payment verified and plan activated',
        user: {
          id: payment.user_id,
          role: newRole,
          plan: payment.plan_type
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.get('/history', auth, (req, res) => {
    const payments = db.prepare(`
      SELECT * FROM payments WHERE user_id = ? ORDER BY created_at DESC
    `).all(req.userId);

    res.json(payments);
  });

  return router;
};