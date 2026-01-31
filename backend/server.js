const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Helper functions for database queries
const dbAll = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

const dbRun = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(query, params, function(err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
};

const dbGet = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

// ===== AUTHENTICATION =====
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password, userType } = req.body;
    
    if (userType === 'super_admin') {
      const superAdmin = await dbGet(
        'SELECT id, username, full_name, email FROM super_admins WHERE username = ? AND password = ?',
        [username, password]
      );
      
      if (!superAdmin) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      res.json({
        user: superAdmin,
        role: 'super_admin',
        token: Buffer.from(`super_admin:${superAdmin.id}`).toString('base64')
      });
    } else if (userType === 'admin') {
      const admin = await dbGet(
        'SELECT a.id, a.username, a.full_name, a.email, a.club_id, c.name as club_name FROM admin_users a JOIN clubs c ON a.club_id = c.id WHERE a.username = ? AND a.password = ?',
        [username, password]
      );
      
      if (!admin) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      res.json({
        user: admin,
        role: 'admin',
        club_id: admin.club_id,
        club_name: admin.club_name,
        token: Buffer.from(`admin:${admin.id}:${admin.club_id}`).toString('base64')
      });
    } else {
      const team = await dbGet(
        'SELECT t.id, t.name, t.username, t.club_id, c.name as club_name FROM teams t JOIN clubs c ON t.club_id = c.id WHERE t.username = ? AND t.password = ?',
        [username, password]
      );
      
      if (!team) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      res.json({
        user: team,
        role: 'team',
        club_id: team.club_id,
        club_name: team.club_name,
        token: Buffer.from(`team:${team.id}:${team.club_id}`).toString('base64')
      });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== SUPER ADMIN ROUTES =====
app.get('/api/super-admin/clubs', async (req, res) => {
  try {
    const role = req.headers['x-user-role'];
    if (role !== 'super_admin') {
      return res.status(403).json({ error: 'Super admin access required' });
    }
    
    const clubs = await dbAll('SELECT * FROM clubs ORDER BY name');
    res.json(clubs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/super-admin/clubs', async (req, res) => {
  try {
    const role = req.headers['x-user-role'];
    if (role !== 'super_admin') {
      return res.status(403).json({ error: 'Super admin access required' });
    }
    
    const { name, slug, geographic_area, contact_name, contact_email } = req.body;
    const result = await dbRun(
      'INSERT INTO clubs (name, slug, geographic_area, contact_name, contact_email) VALUES (?, ?, ?, ?, ?)',
      [name, slug, geographic_area, contact_name, contact_email]
    );
    res.json({ id: result.id, name, slug, geographic_area });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/super-admin/club-admins', async (req, res) => {
  try {
    const role = req.headers['x-user-role'];
    if (role !== 'super_admin') {
      return res.status(403).json({ error: 'Super admin access required' });
    }
    
    const { club_id, username, password, full_name, email } = req.body;
    const result = await dbRun(
      'INSERT INTO admin_users (club_id, username, password, full_name, email) VALUES (?, ?, ?, ?, ?)',
      [club_id, username, password, full_name, email]
    );
    res.json({ id: result.id, club_id, username, full_name });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== CLUB ADMIN ROUTES =====
app.get('/api/teams', async (req, res) => {
  try {
    const club_id = req.headers['x-club-id'];
    if (!club_id) {
      return res.status(400).json({ error: 'Club ID required' });
    }
    
    const teams = await dbAll('SELECT id, name, username FROM teams WHERE club_id = ? ORDER BY name', [club_id]);
    res.json(teams);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/teams', async (req, res) => {
  try {
    const club_id = req.headers['x-club-id'];
    const role = req.headers['x-user-role'];
    
    if (!club_id || role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const { name, username, password } = req.body;
    const result = await dbRun(
      'INSERT INTO teams (club_id, name, username, password) VALUES (?, ?, ?, ?)',
      [club_id, name, username, password]
    );
    res.json({ id: result.id, club_id, name, username });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/teams/:id/members', async (req, res) => {
  try {
    const members = await dbAll('SELECT * FROM team_members WHERE team_id = ?', [req.params.id]);
    res.json(members);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/teams/:teamId/members', async (req, res) => {
  try {
    const { name, phone, email } = req.body;
    const result = await dbRun(
      'INSERT INTO team_members (team_id, name, phone, email) VALUES (?, ?, ?, ?)',
      [req.params.teamId, name, phone, email]
    );
    res.json({ id: result.id, team_id: req.params.teamId, name, phone, email });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== PRODUCT ROUTES (Global products) =====
app.get('/api/products', async (req, res) => {
  try {
    const products = await dbAll('SELECT * FROM products WHERE (club_id IS NULL OR club_id = ?) AND active = 1 ORDER BY name', [req.headers['x-club-id'] || null]);
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== CUSTOMER ROUTES =====
app.get('/api/customers', async (req, res) => {
  try {
    const club_id = req.headers['x-club-id'];
    if (!club_id) {
      return res.status(400).json({ error: 'Club ID required' });
    }
    
    const customers = await dbAll(`
      SELECT c.*, a.name as area_name, t.name as team_name
      FROM customers c
      LEFT JOIN geographical_areas a ON c.area_id = a.id
      LEFT JOIN teams t ON a.team_id = t.id
      WHERE c.club_id = ?
      ORDER BY c.name
    `, [club_id]);
    res.json(customers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/customers', async (req, res) => {
  try {
    const club_id = req.headers['x-club-id'];
    const { customer_number, name, address, postal_address, phone_number, email, area_id } = req.body;
    
    const result = await dbRun(
      'INSERT INTO customers (club_id, customer_number, name, address, postal_address, phone_number, email, area_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [club_id, customer_number, name, address, postal_address, phone_number, email, area_id]
    );
    res.json({ id: result.id, ...req.body });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== ORDER ROUTES =====
app.get('/api/orders', async (req, res) => {
  try {
    const club_id = req.headers['x-club-id'];
    if (!club_id) {
      return res.status(400).json({ error: 'Club ID required' });
    }
    
    const orders = await dbAll(`
      SELECT o.*, c.name as customer_name, c.address, c.customer_number,
             a.name as area_name, t.name as team_name
      FROM orders o
      JOIN customers c ON o.customer_id = c.id
      LEFT JOIN geographical_areas a ON c.area_id = a.id
      LEFT JOIN teams t ON a.team_id = t.id
      WHERE o.club_id = ?
      ORDER BY o.order_date DESC
    `, [club_id]);
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const club_id = req.headers['x-club-id'];
    const { customer_id, quarter, year, items } = req.body;
    
    // Calculate total
    let total = 0;
    for (const item of items) {
      const product = await dbGet('SELECT * FROM products WHERE id = ?', [item.product_id]);
      const price = item.is_subscription ? product.subscription_price : product.price;
      total += price * item.quantity;
    }

    // Create order
    const orderResult = await dbRun(
      'INSERT INTO orders (club_id, customer_id, quarter, year, total_amount) VALUES (?, ?, ?, ?, ?)',
      [club_id, customer_id, quarter, year, total]
    );

    // Create order items
    for (const item of items) {
      const product = await dbGet('SELECT * FROM products WHERE id = ?', [item.product_id]);
      const price = item.is_subscription ? product.subscription_price : product.price;
      
      await dbRun(
        'INSERT INTO order_items (order_id, product_id, quantity, is_subscription, price) VALUES (?, ?, ?, ?, ?)',
        [orderResult.id, item.product_id, item.quantity, item.is_subscription ? 1 : 0, price]
      );
    }

    // Create payment record
    await dbRun(
      'INSERT INTO payments (order_id, amount) VALUES (?, ?)',
      [orderResult.id, total]
    );

    res.json({ id: orderResult.id, customer_id, quarter, year, total_amount: total });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/orders/:id', async (req, res) => {
  try {
    const order = await dbGet(`
      SELECT o.*, c.name as customer_name, c.address, c.customer_number,
             a.name as area_name, t.name as team_name
      FROM orders o
      JOIN customers c ON o.customer_id = c.id
      LEFT JOIN geographical_areas a ON c.area_id = a.id
      LEFT JOIN teams t ON a.team_id = t.id
      WHERE o.id = ?
    `, [req.params.id]);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const items = await dbAll(`
      SELECT oi.*, p.name as product_name, p.type
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
    `, [req.params.id]);

    const payment = await dbGet('SELECT * FROM payments WHERE order_id = ?', [req.params.id]);

    res.json({ ...order, items, payment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== PAYMENT ROUTES (Admin only) =====
app.put('/api/payments/:id/mark-paid', async (req, res) => {
  try {
    const role = req.headers['x-user-role'];
    if (role !== 'admin' && role !== 'super_admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const { payment_reference } = req.body;
    await dbRun(
      'UPDATE payments SET paid = 1, payment_date = CURRENT_TIMESTAMP, payment_reference = ? WHERE id = ?',
      [payment_reference, req.params.id]
    );
    res.json({ message: 'Payment marked as paid' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/payments/:id/mark-unpaid', async (req, res) => {
  try {
    const role = req.headers['x-user-role'];
    if (role !== 'admin' && role !== 'super_admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    await dbRun(
      'UPDATE payments SET paid = 0, payment_date = NULL, payment_reference = NULL WHERE id = ?',
      [req.params.id]
    );
    res.json({ message: 'Payment marked as unpaid' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== ADMIN ANALYTICS =====
app.get('/api/admin/orders-by-team', async (req, res) => {
  try {
    const club_id = req.headers['x-club-id'];
    const { quarter, year } = req.query;
    
    let query = `
      SELECT t.id as team_id, t.name as team_name, 
             COUNT(DISTINCT o.id) as order_count,
             SUM(o.total_amount) as total_revenue,
             SUM(CASE WHEN p.paid = 1 THEN o.total_amount ELSE 0 END) as paid_amount
      FROM teams t
      LEFT JOIN geographical_areas a ON t.id = a.team_id
      LEFT JOIN customers c ON a.id = c.area_id
      LEFT JOIN orders o ON c.id = o.customer_id
      LEFT JOIN payments p ON o.id = p.order_id
      WHERE t.club_id = ?
    `;
    
    const params = [club_id];
    if (quarter && year) {
      query += ' AND o.quarter = ? AND o.year = ?';
      params.push(quarter, year);
    }
    
    query += ' GROUP BY t.id, t.name ORDER BY t.name';
    
    const results = await dbAll(query, params);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/pallet-requirements', async (req, res) => {
  try {
    const club_id = req.headers['x-club-id'];
    const { quarter, year } = req.query;
    
    let query = `
      SELECT p.id as product_id, p.name as product_name, p.sacks_per_pallet,
             COALESCE(SUM(oi.quantity), 0) as total_sacks,
             CAST((COALESCE(SUM(oi.quantity), 0) + p.sacks_per_pallet - 1) / p.sacks_per_pallet AS INTEGER) as pallets_needed
      FROM products p
      LEFT JOIN order_items oi ON p.id = oi.product_id
      LEFT JOIN orders o ON oi.order_id = o.id
      WHERE (p.club_id IS NULL OR p.club_id = ?)
    `;
    
    const params = [club_id];
    if (quarter && year) {
      query += ' AND o.quarter = ? AND o.year = ? AND o.club_id = ?';
      params.push(quarter, year, club_id);
    }
    
    query += ' GROUP BY p.id, p.name, p.sacks_per_pallet ORDER BY p.name';
    
    const results = await dbAll(query, params);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'ForeningsForsaljning Multi-Tenant API is running' });
});

app.listen(PORT, () => {
  console.log(`Multi-tenant server running on port ${PORT}`);
});

module.exports = app;
