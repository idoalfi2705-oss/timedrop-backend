// src/routes/warehouses.js
const router   = require('express').Router();
const priority = require('../services/priorityService');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

// GET /api/warehouses
router.get('/', async (req, res) => {
  try {
    const warehouses = await priority.getWarehouses();
    res.json(warehouses);
  } catch (err) {
    res.status(500).json({ error: 'שגיאה בקבלת מחסנים', details: err.message });
  }
});

// GET /api/warehouses/:id/stock
router.get('/:id/stock', async (req, res) => {
  try {
    const stock = await priority.getWarehouseStock(req.params.id);
    res.json(stock);
  } catch (err) {
    res.status(500).json({ error: 'שגיאה בקבלת מלאי', details: err.message });
  }
});

module.exports = router;
