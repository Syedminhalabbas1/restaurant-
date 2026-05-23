const express = require('express');
const cors = require('cors');
const { sql, poolPromise } = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

  
// ── GET MENU ──────────────────────────────────
app.get('/api/menu', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM menu WHERE available = 1');
        res.json(result.recordset);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Server Error' });
    }
});

// ── ADD MENU ITEM ─────────────────────────────
app.post('/api/menu', async (req, res) => {
    try {
        const { name, category, price, description } = req.body;
        const pool = await poolPromise;
        await pool.request()
            .input('name', sql.NVarChar, name)
            .input('category', sql.NVarChar, category)
            .input('price', sql.Decimal(10,2), price)
            .input('description', sql.NVarChar, description)
            .query(`INSERT INTO menu(name, category, price, description)
                    VALUES(@name, @category, @price, @description)`);
        res.json({ message: '✅ Item Added!' });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Server Error' });
    }
});

// ── EDIT MENU ITEM ────────────────────────────
app.put('/api/menu/:id', async (req, res) => {
    try {
        const { name, price, description } = req.body;
        const pool = await poolPromise;
        await pool.request()
            .input('id', sql.Int, req.params.id)
            .input('name', sql.NVarChar, name)
            .input('price', sql.Decimal(10,2), price)
            .input('description', sql.NVarChar, description)
            .query(`UPDATE menu SET name=@name, price=@price, description=@description WHERE id=@id`);
        res.json({ message: '✅ Item Updated!' });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Server Error' });
    }
});

// ── DELETE MENU ITEM ──────────────────────────
app.delete('/api/menu/:id', async (req, res) => {
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('id', sql.Int, req.params.id)
            .query('DELETE FROM menu WHERE id = @id');
        res.json({ message: '✅ Item Deleted!' });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Server Error' });
    }
});


// ── GET ORDERS ────────────────────────────────
app.get('/api/orders', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .query('SELECT * FROM orders ORDER BY created_at DESC');
        res.json(result.recordset);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Server Error' });
    }
});

// ── ADD ORDER ─────────────────────────────────
app.post('/api/orders', async (req, res) => {
    try {
        const { customer_name, table_number, total_price, items } = req.body;
        const pool = await poolPromise;

        await pool.request()
            .input('customer_name', sql.NVarChar, customer_name)
            .input('table_number', sql.Int, table_number)
            .input('total_price', sql.Decimal(10,2), total_price)
            .query(`INSERT INTO orders(customer_name, table_number, total_price)
                    VALUES(@customer_name, @table_number, @total_price)`);

        const idResult = await pool.request()
            .query('SELECT MAX(id) AS id FROM orders');
        const order_id = idResult.recordset[0].id;

        for (const item of items) {
            await pool.request()
                .input('order_id', sql.Int, order_id)
                .input('menu_id', sql.Int, item.menu_id)
                .input('quantity', sql.Int, item.quantity)
                .query(`INSERT INTO order_items(order_id, menu_id, quantity)
                        VALUES(@order_id, @menu_id, @quantity)`);
        }

        res.json({ order_id });

    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Server Error' });
    }
});

// ── UPDATE ORDER STATUS ───────────────────────
app.put('/api/orders/:id', async (req, res) => {
    try {
        const { status } = req.body;
        const pool = await poolPromise;
        await pool.request()
            .input('id', sql.Int, req.params.id)
            .input('status', sql.NVarChar, status)
            .query('UPDATE orders SET status = @status WHERE id = @id');
        res.json({ message: '✅ Status Updated!' });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Server Error' });
    }
});


// ── LIVE STATS ────────────────────────────────
app.get('/api/stats', async (req, res) => {
    try {
        const pool = await poolPromise;

        const menuRes = await pool.request().query('SELECT COUNT(*) AS total FROM menu WHERE available=1');
        const ordersRes = await pool.request().query('SELECT COUNT(*) AS total FROM orders');
        const pendingRes = await pool.request().query("SELECT COUNT(*) AS total FROM orders WHERE status='pending'");
        const revenueRes = await pool.request().query('SELECT SUM(total_price) AS total FROM orders');

        res.json({
            totalMenu: menuRes.recordset[0].total,
            totalOrders: ordersRes.recordset[0].total,
            pendingOrders: pendingRes.recordset[0].total,
            totalRevenue: revenueRes.recordset[0].total || 0
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Server Error' });
    }
});


// ── GET ALL REVIEWS ───────────────────────────
app.get('/api/reviews', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT r.*, m.name AS item_name
            FROM reviews r
            JOIN menu m ON r.menu_id = m.id
            ORDER BY r.created_at DESC
        `);
        res.json(result.recordset);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Server Error' });
    }
});

// ── GET REVIEWS FOR ONE ITEM ──────────────────
app.get('/api/reviews/:menu_id', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('menu_id', sql.Int, req.params.menu_id)
            .query('SELECT * FROM reviews WHERE menu_id = @menu_id');
        res.json(result.recordset);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Server Error' });
    }
});

// ── ADD REVIEW ────────────────────────────────
app.post('/api/reviews', async (req, res) => {
    try {
        const { customer_name, menu_id, rating, comment } = req.body;
        const pool = await poolPromise;
        await pool.request()
            .input('customer_name', sql.NVarChar, customer_name)
            .input('menu_id', sql.Int, menu_id)
            .input('rating', sql.Int, rating)
            .input('comment', sql.NVarChar, comment)
            .query(`INSERT INTO reviews(customer_name, menu_id, rating, comment)
                    VALUES(@customer_name, @menu_id, @rating, @comment)`);
        res.json({ message: '✅ Review Added!' });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Server Error' });
    }
});


app.listen(3000, () => {
    console.log('🚀 DineFlow Server Running on Port 3000');
});