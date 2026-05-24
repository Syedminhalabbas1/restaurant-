 
const express = require('express');
const cors = require('cors');
const pool = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

// GET MENU
app.get('/api/menu', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM menu WHERE available = true');
    res.json(result.rows);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Server Error' });
  }
});

// ADD MENU ITEM
app.post('/api/menu', async (req, res) => {
  try {
    const { name, category, price, description } = req.body;
    await pool.query('INSERT INTO menu(name, category, price, description) VALUES($1,$2,$3,$4)', [name, category, price, description]);
    res.json({ message: '✅ Item Added!' });
  } catch (err) { res.status(500).json({ error: 'Server Error' }); }
});

// EDIT MENU ITEM
app.put('/api/menu/:id', async (req, res) => {
  try {
    const { name, price, description } = req.body;
    await pool.query('UPDATE menu SET name=$1, price=$2, description=$3 WHERE id=$4', [name, price, description, req.params.id]);
    res.json({ message: '✅ Updated!' });
  } catch (err) { res.status(500).json({ error: 'Server Error' }); }
});

// DELETE MENU ITEM
app.delete('/api/menu/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM menu WHERE id=$1', [req.params.id]);
    res.json({ message: '✅ Deleted!' });
  } catch (err) { res.status(500).json({ error: 'Server Error' }); }
});

// GET ORDERS
app.get('/api/orders', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: 'Server Error' }); }
});

// ADD ORDER
app.post('/api/orders', async (req, res) => {
  try {
    const { customer_name, table_number, total_price, items } = req.body;
    const order = await pool.query(
      'INSERT INTO orders(customer_name, table_number, total_price) VALUES($1,$2,$3) RETURNING id',
      [customer_name, table_number, total_price]
    );
    const order_id = order.rows[0].id;
    for (const item of items) {
      await pool.query('INSERT INTO order_items(order_id, menu_id, quantity) VALUES($1,$2,$3)', [order_id, item.menu_id, item.quantity]);
    }
    res.json({ order_id });
  } catch (err) { res.status(500).json({ error: 'Server Error' }); }
});

// UPDATE ORDER STATUS
app.put('/api/orders/:id', async (req, res) => {
  try {
    const { status } = req.body;
    await pool.query('UPDATE orders SET status=$1 WHERE id=$2', [status, req.params.id]);
    res.json({ message: '✅ Status Updated!' });
  } catch (err) { res.status(500).json({ error: 'Server Error' }); }
});

// STATS
app.get('/api/stats', async (req, res) => {
  try {
    const menu = await pool.query('SELECT COUNT(*) FROM menu WHERE available=true');
    const orders = await pool.query('SELECT COUNT(*) FROM orders');
    const pending = await pool.query("SELECT COUNT(*) FROM orders WHERE status='pending'");
    const revenue = await pool.query('SELECT SUM(total_price) FROM orders');
    res.json({
      totalMenu: menu.rows[0].count,
      totalOrders: orders.rows[0].count,
      pendingOrders: pending.rows[0].count,
      totalRevenue: revenue.rows[0].sum || 0
    });
  } catch (err) { res.status(500).json({ error: 'Server Error' }); }
});

// GET ALL REVIEWS
app.get('/api/reviews', async (req, res) => {
  try {
    const result = await pool.query('SELECT r.*, m.name AS item_name FROM reviews r JOIN menu m ON r.menu_id = m.id ORDER BY r.created_at DESC');
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: 'Server Error' }); }
});

// GET REVIEWS FOR ONE ITEM
app.get('/api/reviews/:menu_id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM reviews WHERE menu_id=$1', [req.params.menu_id]);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: 'Server Error' }); }
});

// ADD REVIEW
app.post('/api/reviews', async (req, res) => {
  try {
    const { customer_name, menu_id, rating, comment } = req.body;
    await pool.query('INSERT INTO reviews(customer_name, menu_id, rating, comment) VALUES($1,$2,$3,$4)', [customer_name, menu_id, rating, comment]);
    res.json({ message: '✅ Review Added!' });
  } catch (err) { res.status(500).json({ error: 'Server Error' }); }
});

module.exports = app;   