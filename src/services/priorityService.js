// src/services/priorityService.js
// כל הקריאות לפריוריטי ERP

const axios = require('axios');

// יצירת axios instance עם הגדרות פריוריטי
const priorityAPI = axios.create({
  baseURL: process.env.PRIORITY_BASE_URL,
  auth: {
    username: process.env.PRIORITY_USERNAME,
    password: process.env.PRIORITY_PASSWORD,
  },
  headers: {
    'Content-Type': 'application/json',
    'X-Company':    process.env.PRIORITY_COMPANY,
  },
  timeout: 10000,
});

// ── לקוחות ──────────────────────────────────────────
async function getClients() {
  const res = await priorityAPI.get('/CUSTOMERS?$select=CUSTNAME,CUSTDES,PHONE,WTAX,BALDATE');
  return res.data.value.map(c => ({
    id:      c.CUSTNAME,
    name:    c.CUSTDES,
    phone:   c.PHONE,
    debt:    c.BALDATE || 0,
  }));
}

async function getClientById(id) {
  const res = await priorityAPI.get(`/CUSTOMERS('${id}')?$expand=AINVOICES_SUBFORM`);
  return res.data;
}

// ── הזמנות ──────────────────────────────────────────
async function getOrders({ fromDate, toDate, clientId } = {}) {
  let filter = '';
  const filters = [];
  if (fromDate) filters.push(`CURDATE ge ${fromDate}`);
  if (toDate)   filters.push(`CURDATE le ${toDate}`);
  if (clientId) filters.push(`CUSTNAME eq '${clientId}'`);
  if (filters.length) filter = `&$filter=${filters.join(' and ')}`;

  const res = await priorityAPI.get(
    `/ORDERS?$select=ORDNAME,CUSTNAME,CUSTDES,CURDATE,TOTPRICE,DISPRICE&$orderby=CURDATE desc${filter}`
  );
  return res.data.value;
}

async function getOrderItems(orderId) {
  const res = await priorityAPI.get(
    `/ORDERS('${orderId}')/ORDERITEMS_SUBFORM?$select=PARTNAME,PDES,TQUANT,PRICE,COST`
  );
  return res.data.value;
}

async function createOrder(orderData) {
  const res = await priorityAPI.post('/ORDERS', {
    CUSTNAME: orderData.clientId,
    ORDITEMSTEXT: orderData.note || '',
    ORDERITEMS_SUBFORM: orderData.items.map(item => ({
      PARTNAME: item.sku,
      TQUANT:   item.qty,
      PRICE:    item.price,
    })),
  });
  return res.data;
}

// ── מלאי ─────────────────────────────────────────────
async function getWarehouseStock(warehouseId) {
  const res = await priorityAPI.get(
    `/WAREHOUSES('${warehouseId}')/WARHSBAL_SUBFORM?$select=PARTNAME,PDES,TBALANCE,MINQTY,WARHSNAME`
  );
  return res.data.value.map(item => ({
    sku:       item.PARTNAME,
    name:      item.PDES,
    qty:       item.TBALANCE,
    minQty:    item.MINQTY,
    warehouse: item.WARHSNAME,
    isLow:     item.TBALANCE < item.MINQTY,
  }));
}

async function getWarehouses() {
  const res = await priorityAPI.get('/WAREHOUSES?$select=WARHSNAME,WARHSDES,WTAX');
  return res.data.value;
}

// ── חשבוניות ─────────────────────────────────────────
async function getInvoices(clientId) {
  const res = await priorityAPI.get(
    `/AINVOICES?$filter=CUSTNAME eq '${clientId}'&$select=IVNUM,CUSTDES,IVDATE,TOTPRICE,PAID`
  );
  return res.data.value;
}

async function createInvoice(invoiceData) {
  const res = await priorityAPI.post('/AINVOICES', {
    CUSTNAME: invoiceData.clientId,
    AINVOICEITEMS_SUBFORM: invoiceData.items.map(item => ({
      PARTNAME: item.sku,
      TQUANT:   item.qty,
      PRICE:    item.price,
    })),
  });
  return res.data;
}

// ── בדיקת חיבור ──────────────────────────────────────
async function testConnection() {
  try {
    await priorityAPI.get('/CUSTOMERS?$top=1');
    return { ok: true, message: 'חיבור לפריוריטי תקין ✓' };
  } catch (err) {
    return { ok: false, message: err.message };
  }
}

module.exports = {
  getClients,
  getClientById,
  getOrders,
  getOrderItems,
  createOrder,
  getWarehouseStock,
  getWarehouses,
  getInvoices,
  createInvoice,
  testConnection,
};
