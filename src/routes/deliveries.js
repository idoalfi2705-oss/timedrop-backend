// src/routes/deliveries.js
const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { authMiddleware, requireRole } = require('../middleware/auth');

router.use(authMiddleware);

// GET /api/deliveries/today – לו"ז יומי לעובד
router.get('/today', requireRole('WORKER'), async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const deliveries = await prisma.delivery.findMany({
      where: {
        workerId: req.user.id,
        scheduledAt: { gte: today, lt: tomorrow }
      },
      orderBy: { scheduledAt: 'asc' }
    });
    res.json(deliveries);
  } catch (err) {
    res.status(500).json({ error: 'שגיאת שרת' });
  }
});

// PATCH /api/deliveries/:id/status – עדכון סטטוס משלוח
router.patch('/:id/status', requireRole('WORKER'), async (req, res) => {
  const { status, notes } = req.body;
  try {
    const delivery = await prisma.delivery.update({
      where: { id: Number(req.params.id) },
      data: {
        status,
        notes,
        deliveredAt: status === 'DELIVERED' ? new Date() : undefined
      }
    });
    res.json(delivery);
  } catch (err) {
    res.status(500).json({ error: 'שגיאת שרת' });
  }
});

module.exports = router;
