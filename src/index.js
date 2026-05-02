// src/index.js – שרת TimeDrop Backend
require('dotenv').config();
const express  = require('express');
const cors     = require('cors');
const morgan   = require('morgan');
const priority = require('./services/priorityService');

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ────────────────────────────────────────
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(morgan('dev'));

// ── Routes ────────────────────────────────────────────
app.use('/api/auth',        require('./routes/auth'));
app.use('/api/clients',     require('./routes/clients'));
app.use('/api/orders',      require('./routes/orders'));
app.use('/api/warehouses',  require('./routes/warehouses'));
app.use('/api/workers',     require('./routes/workers'));
app.use('/api/deliveries',  require('./routes/deliveries'));

// ── Health check ──────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// ── Priority connection test ──────────────────────────
app.get('/api/priority-test', async (req, res) => {
  const result = await priority.testConnection();
  res.json(result);
});

// ── 404 ───────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'נתיב לא נמצא' });
});

// ── Error handler ─────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'שגיאת שרת פנימית' });
});

// ── Start ─────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════╗
  ║   TimeDrop Backend מופעל!   ║
  ║   http://localhost:${PORT}      ║
  ╚══════════════════════════════╝
  `);
});
