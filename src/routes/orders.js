// src/routes/orders.js
const router   = require('express').Router();
const priority = require('../services/priorityService');
const { authMiddleware, requireRole } = require('../middleware/auth');

router.use(authMiddleware);

// GET /api/orders?fromDate=&toDate=&clientId=
router.get('/', async (req, res) => {
  try {
    const orders = await priority.getOrders(req.query);
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'שגיאה בקבלת הזמנות', details: err.message });
  }
});

// GET /api/orders/:id/items
router.get('/:id/items', async (req, res) => {
  try {
    const items = await priority.getOrderItems(req.params.id);
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'שגיאה בקבלת פריטי הזמנה', details: err.message });
  }
});

// POST /api/orders – הזמנה חדשה
router.post('/', async (req, res) => {
  try {
    const order = await priority.createOrder(req.body);
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ error: 'שגיאה ביצירת הזמנה', details: err.message });
  }
});

module.exports = router;
