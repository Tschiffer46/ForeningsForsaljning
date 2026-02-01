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
    const showAll = req.query.all === 'true'; // Admin can see all products including inactive
    const activeFilter = showAll ? '' : 'AND active = 1';
    const products = await dbAll(
      `SELECT * FROM products WHERE (club_id IS NULL OR club_id = ?) ${activeFilter} ORDER BY name`, 
      [req.headers['x-club-id'] || null]
    );
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create product
app.post('/api/products', async (req, res) => {
  try {
    const { name, description, price, subscription_price, sacks_per_pallet, club_id } = req.body;
    
    if (!name || !price || !sacks_per_pallet) {
      return res.status(400).json({ error: 'Name, price, and sacks_per_pallet are required' });
    }

    const result = await dbRun(
      `INSERT INTO products (name, description, price, subscription_price, sacks_per_pallet, club_id, active) 
       VALUES (?, ?, ?, ?, ?, ?, 1)`,
      [name, description || '', price, subscription_price || price, sacks_per_pallet, club_id || null]
    );

    const newProduct = await dbGet('SELECT * FROM products WHERE id = ?', [result.id]);
    res.status(201).json(newProduct);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update product
app.put('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, subscription_price, sacks_per_pallet, active } = req.body;

    const product = await dbGet('SELECT * FROM products WHERE id = ?', [id]);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    await dbRun(
      `UPDATE products 
       SET name = ?, description = ?, price = ?, subscription_price = ?, sacks_per_pallet = ?, active = ?
       WHERE id = ?`,
      [
        name !== undefined ? name : product.name,
        description !== undefined ? description : product.description,
        price !== undefined ? price : product.price,
        subscription_price !== undefined ? subscription_price : product.subscription_price,
        sacks_per_pallet !== undefined ? sacks_per_pallet : product.sacks_per_pallet,
        active !== undefined ? active : product.active,
        id
      ]
    );

    const updatedProduct = await dbGet('SELECT * FROM products WHERE id = ?', [id]);
    res.json(updatedProduct);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete product (soft delete - set active = 0)
app.delete('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const product = await dbGet('SELECT * FROM products WHERE id = ?', [id]);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Soft delete - set active to 0
    await dbRun('UPDATE products SET active = 0 WHERE id = ?', [id]);
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== GEOGRAPHIC AREAS ROUTES =====
app.get('/api/areas', async (req, res) => {
  try {
    const club_id = req.headers['x-club-id'];
    if (!club_id) {
      return res.status(400).json({ error: 'Club ID required' });
    }
    
    const areas = await dbAll(`
      SELECT a.*, t.name as team_name
      FROM geographical_areas a
      LEFT JOIN teams t ON a.team_id = t.id
      WHERE a.club_id = ?
      ORDER BY a.name
    `, [club_id]);
    res.json(areas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/areas', async (req, res) => {
  try {
    const club_id = req.headers['x-club-id'];
    if (!club_id) {
      return res.status(400).json({ error: 'Club ID required' });
    }
    
    const { name, description, postal_codes, team_id } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const result = await dbRun(
      `INSERT INTO geographical_areas (club_id, name, description, postal_codes, team_id) 
       VALUES (?, ?, ?, ?, ?)`,
      [club_id, name, description || '', postal_codes || '', team_id || null]
    );

    const newArea = await dbGet('SELECT * FROM geographical_areas WHERE id = ?', [result.id]);
    res.status(201).json(newArea);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/areas/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, postal_codes, team_id } = req.body;

    const area = await dbGet('SELECT * FROM geographical_areas WHERE id = ?', [id]);
    if (!area) {
      return res.status(404).json({ error: 'Area not found' });
    }

    await dbRun(
      `UPDATE geographical_areas 
       SET name = ?, description = ?, postal_codes = ?, team_id = ?
       WHERE id = ?`,
      [
        name !== undefined ? name : area.name,
        description !== undefined ? description : area.description,
        postal_codes !== undefined ? postal_codes : area.postal_codes,
        team_id !== undefined ? team_id : area.team_id,
        id
      ]
    );

    const updatedArea = await dbGet('SELECT * FROM geographical_areas WHERE id = ?', [id]);
    res.json(updatedArea);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/areas/:id/assign-team', async (req, res) => {
  try {
    const { id } = req.params;
    const { team_id } = req.body;

    const area = await dbGet('SELECT * FROM geographical_areas WHERE id = ?', [id]);
    if (!area) {
      return res.status(404).json({ error: 'Area not found' });
    }

    await dbRun(
      'UPDATE geographical_areas SET team_id = ? WHERE id = ?',
      [team_id || null, id]
    );

    const updatedArea = await dbGet('SELECT * FROM geographical_areas WHERE id = ?', [id]);
    res.json(updatedArea);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/areas/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if any customers are assigned to this area
    const customers = await dbAll('SELECT id FROM customers WHERE area_id = ?', [id]);
    if (customers.length > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete area with assigned customers',
        customerCount: customers.length 
      });
    }
    
    await dbRun('DELETE FROM geographical_areas WHERE id = ?', [id]);
    res.json({ message: 'Area deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== PAYMENT ROUTES =====
app.get('/api/payments', async (req, res) => {
  try {
    const club_id = req.headers['x-club-id'];
    if (!club_id) {
      return res.status(400).json({ error: 'Club ID required' });
    }
    
    const { status } = req.query;
    
    let query = `
      SELECT p.*, o.customer_id, o.order_date, o.total_amount, o.status as order_status,
             c.name as customer_name, c.customer_number
      FROM payments p
      INNER JOIN orders o ON p.order_id = o.id
      INNER JOIN customers c ON o.customer_id = c.id
      WHERE o.club_id = ?
    `;
    
    const params = [club_id];
    
    if (status === 'paid') {
      query += ' AND p.paid = 1';
    } else if (status === 'unpaid') {
      query += ' AND p.paid = 0';
    }
    
    query += ' ORDER BY o.order_date DESC';
    
    const payments = await dbAll(query, params);
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/payments/stats', async (req, res) => {
  try {
    const club_id = req.headers['x-club-id'];
    if (!club_id) {
      return res.status(400).json({ error: 'Club ID required' });
    }
    
    const stats = await dbGet(`
      SELECT 
        COUNT(*) as total_orders,
        SUM(CASE WHEN p.paid = 1 THEN 1 ELSE 0 END) as paid_orders,
        SUM(CASE WHEN p.paid = 0 THEN 1 ELSE 0 END) as unpaid_orders,
        SUM(p.amount) as total_amount,
        SUM(CASE WHEN p.paid = 1 THEN p.amount ELSE 0 END) as paid_amount,
        SUM(CASE WHEN p.paid = 0 THEN p.amount ELSE 0 END) as unpaid_amount
      FROM payments p
      INNER JOIN orders o ON p.order_id = o.id
      WHERE o.club_id = ?
    `, [club_id]);
    
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/payments/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { paid, payment_reference, payment_date } = req.body;

    const payment = await dbGet('SELECT * FROM payments WHERE id = ?', [id]);
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    await dbRun(
      `UPDATE payments 
       SET paid = ?, payment_reference = ?, payment_date = ?
       WHERE id = ?`,
      [
        paid !== undefined ? paid : payment.paid,
        payment_reference !== undefined ? payment_reference : payment.payment_reference,
        payment_date || (paid ? new Date().toISOString() : payment.payment_date),
        id
      ]
    );

    const updatedPayment = await dbGet('SELECT * FROM payments WHERE id = ?', [id]);
    res.json(updatedPayment);
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

// ===== TEST & DIAGNOSTIC ENDPOINTS =====
// Simple test endpoint
app.get('/test', (req, res) => {
  console.log('TEST endpoint hit');
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Server Test</title>
      <style>
        body { 
          margin: 0; 
          padding: 40px; 
          font-family: Arial, sans-serif; 
          background: linear-gradient(135deg, #00b894, #00cec9);
          color: white;
          text-align: center;
        }
        h1 { font-size: 48px; margin: 20px 0; }
        p { font-size: 24px; }
      </style>
    </head>
    <body>
      <h1>✅ Server Works!</h1>
      <p>Backend is running correctly</p>
      <p>Time: ${new Date().toISOString()}</p>
    </body>
    </html>
  `);
});

// Diagnostic endpoint
app.get('/diagnostic', (req, res) => {
  console.log('DIAGNOSTIC endpoint hit');
  
  const diagnostic = {
    status: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    nodeVersion: process.version,
    port: PORT,
    routes: {
      '/': 'Landing page (embedded HTML)',
      '/test': 'Simple test page',
      '/diagnostic': 'This diagnostic page',
      '/api/health': 'Health check',
      '/api/products': 'Products list',
      '/api/auth/login': 'Login endpoint',
      '/api/*': 'Other API endpoints'
    },
    requestInfo: {
      method: req.method,
      url: req.url,
      headers: req.headers,
      ip: req.ip
    },
    serverInfo: {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      platform: process.platform
    }
  };
  
  res.json(diagnostic);
});

// ===== SERVE REACT FRONTEND =====
const path = require('path');
const fs = require('fs');

// Serve static React build files
const frontendBuild = path.join(__dirname, '..', 'frontend', 'build');

// Check if build directory exists
if (fs.existsSync(frontendBuild)) {
  console.log('Serving React frontend from:', frontendBuild);
  app.use(express.static(frontendBuild));
  
  // Catch-all for React routing (specific routes for SPA)
  app.get('/login', (req, res) => {
    res.sendFile(path.join(frontendBuild, 'index.html'));
  });
  
  app.get('/customer-order', (req, res) => {
    res.sendFile(path.join(frontendBuild, 'index.html'));
  });
  
  app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(frontendBuild, 'index.html'));
  });
  
  // Catch-all for other non-API routes (must use app.use for wildcard in Express 5+)
  app.use((req, res, next) => {
    // Only serve React app for non-API routes
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(frontendBuild, 'index.html'));
    } else {
      next();
    }
  });
} else {
  console.log('React build not found, serving landing page only');
  
  // Root route - Landing page embedded directly in code (only when no React build)
  app.get('/', (req, res) => {
    console.log('ROOT endpoint hit - serving landing page');
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>FöreningsFörsäljning - Sales Organization System</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
          }
          .container {
            background: white;
            border-radius: 20px;
            padding: 40px;
            max-width: 600px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            text-align: center;
          }
          h1 {
            color: #667eea;
            font-size: 2.5em;
            margin-bottom: 10px;
          }
          .subtitle {
            color: #666;
            font-size: 1.2em;
            margin-bottom: 30px;
          }
          .status {
            background: #10b981;
            color: white;
            padding: 15px 30px;
            border-radius: 10px;
            display: inline-block;
            margin: 20px 0;
            font-weight: bold;
            font-size: 1.1em;
          }
          .buttons {
            display: flex;
            gap: 15px;
            justify-content: center;
            flex-wrap: wrap;
            margin: 30px 0;
          }
          .btn {
            background: #667eea;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 500;
            transition: transform 0.2s, background 0.2s;
            display: inline-block;
          }
          .btn:hover {
            background: #5568d3;
            transform: translateY(-2px);
          }
          .info {
            background: #f3f4f6;
            padding: 20px;
            border-radius: 10px;
            margin-top: 30px;
            text-align: left;
          }
          .info h3 {
            color: #667eea;
            margin-bottom: 15px;
          }
          .credential {
            background: white;
            padding: 10px;
            margin: 5px 0;
            border-radius: 5px;
            font-family: monospace;
          }
          .footer {
            margin-top: 30px;
            color: #999;
            font-size: 0.9em;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🚀 FöreningsFörsäljning</h1>
          <p class="subtitle">Sales Organization Management System</p>
          
          <div class="status">✅ Backend API Running!</div>
          
          <div class="buttons">
            <a href="/api/health" class="btn">Health Check</a>
            <a href="/api/products" class="btn">View Products</a>
          </div>
          
          <div class="info">
            <h3>📊 System Status</h3>
            <p><strong>Environment:</strong> Production</p>
            <p><strong>Database:</strong> Connected</p>
            <p><strong>Demo Data:</strong> Loaded</p>
            <p><strong>Clubs:</strong> 3 (Stockholm, Göteborg, Malmö)</p>
            <p><strong>Teams:</strong> 5 teams</p>
          </div>
          
          <div class="info">
            <h3>👤 Demo Credentials</h3>
            <p><strong>Admin Login:</strong></p>
            <div class="credential">Username: admin.stockholm<br>Password: demo123</div>
            
            <p style="margin-top: 15px;"><strong>Team Login:</strong></p>
            <div class="credential">Username: norrmalm<br>Password: team123</div>
          </div>
          
          <div class="footer">
            Backend API is fully operational. Frontend React app coming soon!
          </div>
        </div>
      </body>
      </html>
    `);
  });
}

// Catch-all for undefined API routes (must be last!)
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not Found',
    message: 'This endpoint does not exist. Try /api/health or visit the home page at /'
  });
});

// Wait for database to be ready before starting server
// This ensures health checks don't fail during Railway deployment
async function startServer() {
  try {
    // Wait for database initialization to complete
    await db.waitForReady();
    console.log('Database initialization complete');
    
    // Now start the server
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Multi-tenant server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`Ready to accept connections`);
      console.log(`Serving embedded landing page at root`);
    });
  } catch (error) {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  }
}

// Start the server
startServer();

module.exports = app;
