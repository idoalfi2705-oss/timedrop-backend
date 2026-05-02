// src/routes/workers.js
const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { authMiddleware, requireRole } = require('../middleware/auth');

router.use(authMiddleware);

// GET /api/workers – כל העובדים
router.get('/', requireRole('EMPLOYER'), async (req, res) => {
  try {
    const workers = await prisma.user.findMany({
      where: { role: 'WORKER', orgCode: req.user.orgCode },
      select: { id: true, name: true, phone: true, area: true, isActive: true }
    });
    res.json(workers);
  } catch (err) {
    res.status(500).json({ error: 'שגיאת שרת' });
  }
});

// GET /api/workers/leave-requests – בקשות חופשה ממתינות
router.get('/leave-requests', requireRole('EMPLOYER'), async (req, res) => {
  try {
    const requests = await prisma.leaveRequest.findMany({
      where: { status: 'PENDING' },
      include: { user: { select: { name: true, area: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: 'שגיאת שרת' });
  }
});

// POST /api/workers/leave – הגשת בקשת חופשה (עובד)
router.post('/leave', requireRole('WORKER'), async (req, res) => {
  const { type, date } = req.body;
  try {
    const request = await prisma.leaveRequest.create({
      data: { userId: req.user.id, type, date: new Date(date) }
    });
    res.status(201).json(request);
  } catch (err) {
    res.status(500).json({ error: 'שגיאת שרת' });
  }
});

// PATCH /api/workers/leave/:id – אישור/דחיית בקשה (מעסיק)
router.patch('/leave/:id', requireRole('EMPLOYER'), async (req, res) => {
  const { status, note } = req.body;
  try {
    const updated = await prisma.leaveRequest.update({
      where: { id: Number(req.params.id) },
      data: { status, note }
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'שגיאת שרת' });
  }
});

module.exports = router;
