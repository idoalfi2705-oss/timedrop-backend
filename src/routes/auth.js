// src/routes/auth.js
const router  = require('express').Router();
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma  = new PrismaClient();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { orgCode, username, password } = req.body;

  if (!orgCode || !username || !password)
    return res.status(400).json({ error: 'יש למלא את כל השדות' });

  try {
    const user = await prisma.user.findFirst({
      where: { username, orgCode, isActive: true }
    });

    if (!user)
      return res.status(401).json({ error: 'פרטי התחברות שגויים' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid)
      return res.status(401).json({ error: 'פרטי התחברות שגויים' });

    const token = jwt.sign(
      { id: user.id, role: user.role, orgCode: user.orgCode, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      token,
      user: {
        id:      user.id,
        name:    user.name,
        role:    user.role.toLowerCase(),
        orgCode: user.orgCode,
        avatar:  user.name[0],
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'שגיאת שרת' });
  }
});

// POST /api/auth/register (ליצירת משתמשים ראשונית)
router.post('/register', async (req, res) => {
  const { orgCode, username, password, name, role, email, phone } = req.body;
  try {
    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { orgCode, username, password: hashed, name, role, email, phone }
    });
    res.status(201).json({ id: user.id, name: user.name, role: user.role });
  } catch (err) {
    if (err.code === 'P2002')
      return res.status(400).json({ error: 'שם משתמש כבר קיים' });
    res.status(500).json({ error: 'שגיאת שרת' });
  }
});

module.exports = router;
