const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Helper function for database queries
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

// Simple auth middleware (in production, use JWT or similar)
const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
};

const requireAdmin = (req, res, next) => {
  const role = req.headers['x-user-role'];
  if (role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// ===== AUTH ROUTES =====
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password, userType } = req.body;
    
    if (userType === 'admin') {
      const admin = await dbGet(
        'SELECT id, username, full_name, email FROM admin_users WHERE username = ? AND password = ?',
        [username, password]
      );
      
      if (!admin) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      res.json({
        user: admin,
        role: 'admin',
        token: Buffer.from(`admin:${admin.id}`).toString('base64')
      });
    } else {
      const team = await dbGet(
        'SELECT id, name, username FROM teams WHERE username = ? AND password = ?',
        [username, password]
      );
      
      if (!team) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      res.json({
        user: team,
        role: 'team',
        token: Buffer.from(`team:${team.id}`).toString('base64')
      });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== TEAM ROUTES =====
app.get('/api/teams', requireAuth, async (req, res) => {
  try {
    const teams = await dbAll('SELECT id, name, username, created_at FROM teams ORDER BY name');
    res.json(teams);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/teams', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { name, username, password } = req.body;
    const result = await dbRun(
      'INSERT INTO teams (name, username, password) VALUES (?, ?, ?)',
      [name, username, password]
    );
    res.json({ id: result.id, name, username });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/teams/:id', requireAuth, async (req, res) => {
  try {
    const team = await dbGet('SELECT id, name, username FROM teams WHERE id = ?', [req.params.id]);
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }
    const members = await dbAll('SELECT * FROM team_members WHERE team_id = ?', [req.params.id]);
    res.json({ ...team, members });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/teams/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { name, username, password } = req.body;
    if (password) {
      await dbRun('UPDATE teams SET name = ?, username = ?, password = ? WHERE id = ?', 
        [name, username, password, req.params.id]);
    } else {
      await dbRun('UPDATE teams SET name = ?, username = ? WHERE id = ?', 
        [name, username, req.params.id]);
    }
    res.json({ id: req.params.id, name, username });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/teams/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    await dbRun('DELETE FROM teams WHERE id = ?', [req.params.id]);
    res.json({ message: 'Team deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== TEAM MEMBERS ROUTES =====
app.post('/api/teams/:teamId/members', requireAuth, async (req, res) => {
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

app.delete('/api/team-members/:id', requireAuth, async (req, res) => {
  try {
    await dbRun('DELETE FROM team_members WHERE id = ?', [req.params.id]);
    res.json({ message: 'Member deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== GEOGRAPHICAL AREAS ROUTES =====
app.get('/api/areas', requireAuth, async (req, res) => {
  try {
    const areas = await dbAll(`
      SELECT a.*, t.name as team_name 
      FROM geographical_areas a 
      LEFT JOIN teams t ON a.team_id = t.id
      ORDER BY t.name, a.name
    `);
    res.json(areas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/areas', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { team_id, name, coordinates } = req.body;
    const result = await dbRun(
      'INSERT INTO geographical_areas (team_id, name, coordinates) VALUES (?, ?, ?)',
      [team_id, name, JSON.stringify(coordinates)]
    );
    res.json({ id: result.id, team_id, name, coordinates });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/areas/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { team_id, name, coordinates } = req.body;
    await dbRun(
      'UPDATE geographical_areas SET team_id = ?, name = ?, coordinates = ? WHERE id = ?',
      [team_id, name, JSON.stringify(coordinates), req.params.id]
    );
    res.json({ id: req.params.id, team_id, name, coordinates });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/areas/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    await dbRun('DELETE FROM geographical_areas WHERE id = ?', [req.params.id]);
    res.json({ message: 'Area deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== CUSTOMER ROUTES =====
app.get('/api/customers', requireAuth, async (req, res) => {
  try {
    const customers = await dbAll(`
      SELECT c.*, a.name as area_name, t.name as team_name
      FROM customers c
      LEFT JOIN geographical_areas a ON c.area_id = a.id
      LEFT JOIN teams t ON a.team_id = t.id
      ORDER BY c.name
    `);
    res.json(customers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/customers', requireAuth, async (req, res) => {
  try {
    const { customer_number, name, address, postal_address, phone_number, email, area_id } = req.body;
    const result = await dbRun(
      'INSERT INTO customers (customer_number, name, address, postal_address, phone_number, email, area_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [customer_number, name, address, postal_address, phone_number, email, area_id]
    );
    res.json({ id: result.id, ...req.body });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/customers/:id', requireAuth, async (req, res) => {
  try {
    const customer = await dbGet(`
      SELECT c.*, a.name as area_name, t.name as team_name
      FROM customers c
      LEFT JOIN geographical_areas a ON c.area_id = a.id
      LEFT JOIN teams t ON a.team_id = t.id
      WHERE c.id = ?
    `, [req.params.id]);
    
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json(customer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/customers/:id', requireAuth, async (req, res) => {
  try {
    const { customer_number, name, address, postal_address, phone_number, email, area_id } = req.body;
    await dbRun(
      'UPDATE customers SET customer_number = ?, name = ?, address = ?, postal_address = ?, phone_number = ?, email = ?, area_id = ? WHERE id = ?',
      [customer_number, name, address, postal_address, phone_number, email, area_id, req.params.id]
    );
    res.json({ id: req.params.id, ...req.body });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/customers/:id', requireAuth, async (req, res) => {
  try {
    await dbRun('DELETE FROM customers WHERE id = ?', [req.params.id]);
    res.json({ message: 'Customer deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== PRODUCT ROUTES =====
app.get('/api/products', requireAuth, async (req, res) => {
  try {
    const products = await dbAll('SELECT * FROM products WHERE active = 1 ORDER BY name');
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/products', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { name, type, price, subscription_price, sacks_per_pallet } = req.body;
    const result = await dbRun(
      'INSERT INTO products (name, type, price, subscription_price, sacks_per_pallet) VALUES (?, ?, ?, ?, ?)',
      [name, type, price, subscription_price, sacks_per_pallet]
    );
    res.json({ id: result.id, ...req.body, active: 1 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/products/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { name, type, price, subscription_price, sacks_per_pallet, active } = req.body;
    await dbRun(
      'UPDATE products SET name = ?, type = ?, price = ?, subscription_price = ?, sacks_per_pallet = ?, active = ? WHERE id = ?',
      [name, type, price, subscription_price, sacks_per_pallet, active !== undefined ? active : 1, req.params.id]
    );
    res.json({ id: req.params.id, ...req.body });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/products/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    await dbRun('UPDATE products SET active = 0 WHERE id = ?', [req.params.id]);
    res.json({ message: 'Product deactivated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== ORDER ROUTES =====
app.get('/api/orders', requireAuth, async (req, res) => {
  try {
    const orders = await dbAll(`
      SELECT o.*, c.name as customer_name, c.address, c.customer_number,
             a.name as area_name, t.name as team_name
      FROM orders o
      JOIN customers c ON o.customer_id = c.id
      LEFT JOIN geographical_areas a ON c.area_id = a.id
      LEFT JOIN teams t ON a.team_id = t.id
      ORDER BY o.order_date DESC
    `);
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/orders', requireAuth, async (req, res) => {
  try {
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
      'INSERT INTO orders (customer_id, quarter, year, total_amount) VALUES (?, ?, ?, ?)',
      [customer_id, quarter, year, total]
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

app.get('/api/orders/:id', requireAuth, async (req, res) => {
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
app.put('/api/payments/:id/mark-paid', requireAuth, requireAdmin, async (req, res) => {
  try {
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

app.put('/api/payments/:id/mark-unpaid', requireAuth, requireAdmin, async (req, res) => {
  try {
    await dbRun(
      'UPDATE payments SET paid = 0, payment_date = NULL, payment_reference = NULL WHERE id = ?',
      [req.params.id]
    );
    res.json({ message: 'Payment marked as unpaid' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== ADMIN ROUTES =====
app.get('/api/admin/orders-by-team', requireAuth, requireAdmin, async (req, res) => {
  try {
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
    `;
    
    const params = [];
    if (quarter && year) {
      query += ' WHERE o.quarter = ? AND o.year = ?';
      params.push(quarter, year);
    }
    
    query += ' GROUP BY t.id, t.name ORDER BY t.name';
    
    const results = await dbAll(query, params);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/orders-by-area', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { quarter, year } = req.query;
    let query = `
      SELECT a.id as area_id, a.name as area_name, t.name as team_name,
             COUNT(DISTINCT o.id) as order_count,
             SUM(o.total_amount) as total_revenue
      FROM geographical_areas a
      LEFT JOIN teams t ON a.team_id = t.id
      LEFT JOIN customers c ON a.id = c.area_id
      LEFT JOIN orders o ON c.id = o.customer_id
    `;
    
    const params = [];
    if (quarter && year) {
      query += ' WHERE o.quarter = ? AND o.year = ?';
      params.push(quarter, year);
    }
    
    query += ' GROUP BY a.id, a.name, t.name ORDER BY t.name, a.name';
    
    const results = await dbAll(query, params);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/pallet-requirements', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { quarter, year } = req.query;
    let query = `
      SELECT p.id as product_id, p.name as product_name, p.sacks_per_pallet,
             COALESCE(SUM(oi.quantity), 0) as total_sacks,
             CAST((COALESCE(SUM(oi.quantity), 0) + p.sacks_per_pallet - 1) / p.sacks_per_pallet AS INTEGER) as pallets_needed
      FROM products p
      LEFT JOIN order_items oi ON p.id = oi.product_id
      LEFT JOIN orders o ON oi.order_id = o.id
    `;
    
    const params = [];
    if (quarter && year) {
      query += ' WHERE o.quarter = ? AND o.year = ?';
      params.push(quarter, year);
    }
    
    query += ' GROUP BY p.id, p.name, p.sacks_per_pallet ORDER BY p.name';
    
    const results = await dbAll(query, params);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all orders with payment status (Admin only)
app.get('/api/admin/orders', requireAuth, requireAdmin, async (req, res) => {
  try {
    const orders = await dbAll(`
      SELECT o.*, c.name as customer_name, c.address, c.customer_number,
             a.name as area_name, t.name as team_name,
             p.paid, p.payment_date, p.payment_reference, p.id as payment_id
      FROM orders o
      JOIN customers c ON o.customer_id = c.id
      LEFT JOIN geographical_areas a ON c.area_id = a.id
      LEFT JOIN teams t ON a.team_id = t.id
      LEFT JOIN payments p ON o.id = p.order_id
      ORDER BY o.order_date DESC
    `);
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== DELIVERY ROUTES =====
app.put('/api/orders/:id/mark-delivered', requireAuth, async (req, res) => {
  try {
    await dbRun(
      'UPDATE orders SET delivered = 1, delivery_date = CURRENT_TIMESTAMP WHERE id = ?',
      [req.params.id]
    );
    res.json({ message: 'Order marked as delivered' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/orders/:id/mark-undelivered', requireAuth, async (req, res) => {
  try {
    await dbRun(
      'UPDATE orders SET delivered = 0, delivery_date = NULL WHERE id = ?',
      [req.params.id]
    );
    res.json({ message: 'Order marked as not delivered' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/delivery/summary', requireAuth, async (req, res) => {
  try {
    const { team_id, quarter, year } = req.query;
    let query = `
      SELECT a.name as area_name, c.address,
             p.name as product_name, SUM(oi.quantity) as total_sacks
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      JOIN customers c ON o.customer_id = c.id
      JOIN products p ON oi.product_id = p.id
      JOIN geographical_areas a ON c.area_id = a.id
      WHERE 1=1
    `;
    
    const params = [];
    if (team_id) {
      query += ' AND a.team_id = ?';
      params.push(team_id);
    }
    if (quarter && year) {
      query += ' AND o.quarter = ? AND o.year = ?';
      params.push(quarter, year);
    }
    
    query += ' GROUP BY a.name, c.address, p.name ORDER BY a.name, c.address, p.name';
    
    const results = await dbAll(query, params);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/delivery/summary-by-team', requireAuth, async (req, res) => {
  try {
    const { quarter, year } = req.query;
    let query = `
      SELECT t.id as team_id, t.name as team_name, 
             a.name as area_name,
             p.name as product_name,
             SUM(oi.quantity) as total_sacks
      FROM teams t
      LEFT JOIN geographical_areas a ON t.id = a.team_id
      LEFT JOIN customers c ON a.id = c.area_id
      LEFT JOIN orders o ON c.id = o.customer_id
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE 1=1
    `;
    
    const params = [];
    if (quarter && year) {
      query += ' AND o.quarter = ? AND o.year = ?';
      params.push(quarter, year);
    }
    
    query += ' GROUP BY t.id, t.name, a.name, p.name ORDER BY t.name, a.name, p.name';
    
    const results = await dbAll(query, params);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'ForeningsForsaljning API is running' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
