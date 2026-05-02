// src/routes/clients.js
const router   = require('express').Router();
const priority = require('../services/priorityService');
const { authMiddleware, requireRole } = require('../middleware/auth');

// כל הנתיבים דורשים התחברות
router.use(authMiddleware);

// GET /api/clients – רשימת לקוחות מפריוריטי
router.get('/', requireRole('EMPLOYER'), async (req, res) => {
  try {
    const clients = await priority.getClients();
    res.json(clients);
  } catch (err) {
    res.status(500).json({ error: 'שגיאה בקבלת לקוחות מפריוריטי', details: err.message });
  }
});

// GET /api/clients/:id – לקוח ספציפי + חשבוניות
router.get('/:id', requireRole('EMPLOYER'), async (req, res) => {
  try {
    const [client, invoices] = await Promise.all([
      priority.getClientById(req.params.id),
      priority.getInvoices(req.params.id),
    ]);
    res.json({ ...client, invoices });
  } catch (err) {
    res.status(500).json({ error: 'שגיאה בקבלת פרטי לקוח', details: err.message });
  }
});

module.exports = router;
