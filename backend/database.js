const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, 'foreningsforsaljning.db'), (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase();
  }
});

function initializeDatabase() {
  db.serialize(() => {
    // Teams table
    db.run(`CREATE TABLE IF NOT EXISTS teams (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Team members table (for display purposes, not authentication)
    db.run(`CREATE TABLE IF NOT EXISTS team_members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      team_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      phone TEXT,
      email TEXT,
      FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE
    )`);

    // Admin users table
    db.run(`CREATE TABLE IF NOT EXISTS admin_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      full_name TEXT NOT NULL,
      email TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Insert default admin user (password: admin123)
    db.run(`INSERT OR IGNORE INTO admin_users (username, password, full_name, email) VALUES
      ('admin', 'admin123', 'System Administrator', 'admin@foreningsforsaljning.se')
    `);

    // Geographical areas table
    db.run(`CREATE TABLE IF NOT EXISTS geographical_areas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      team_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      coordinates TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE
    )`);

    // Customers table
    db.run(`CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_number TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      address TEXT NOT NULL,
      postal_address TEXT NOT NULL,
      phone_number TEXT,
      email TEXT,
      area_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (area_id) REFERENCES geographical_areas(id) ON DELETE SET NULL
    )`);

    // Products table
    db.run(`CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      price REAL NOT NULL,
      subscription_price REAL,
      sacks_per_pallet INTEGER NOT NULL,
      active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Initialize default products
    db.run(`INSERT OR IGNORE INTO products (name, type, price, subscription_price, sacks_per_pallet) VALUES
      ('Lambi Toapapper', 'toilet_paper', 100.0, 90.0, 50),
      ('Lambi Hushållspapper', 'household_paper', 80.0, 72.0, 60),
      ('Serla Toapapper', 'toilet_paper', 95.0, 85.0, 50),
      ('Serla Hushållspapper', 'household_paper', 75.0, 67.5, 60)
    `, (err) => {
      if (err && !err.message.includes('UNIQUE constraint')) {
        console.error('Error inserting default products:', err);
      }
    });

    // Orders table
    db.run(`CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id INTEGER NOT NULL,
      order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      quarter TEXT NOT NULL,
      year INTEGER NOT NULL,
      status TEXT DEFAULT 'pending',
      total_amount REAL NOT NULL,
      delivered INTEGER DEFAULT 0,
      delivery_date DATETIME,
      FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
    )`);

    // Order items table
    db.run(`CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      is_subscription INTEGER DEFAULT 0,
      price REAL NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id)
    )`);

    // Payments table
    db.run(`CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      amount REAL NOT NULL,
      payment_method TEXT DEFAULT 'swish',
      payment_reference TEXT,
      paid INTEGER DEFAULT 0,
      payment_date DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
    )`);

    console.log('Database initialized successfully');
  });
}

module.exports = db;
