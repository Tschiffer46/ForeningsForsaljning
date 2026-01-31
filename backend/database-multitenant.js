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
    // Clubs table (Multi-tenant organizations)
    db.run(`CREATE TABLE IF NOT EXISTS clubs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      slug TEXT UNIQUE NOT NULL,
      geographic_area TEXT NOT NULL,
      primary_color TEXT DEFAULT '#667eea',
      secondary_color TEXT DEFAULT '#764ba2',
      logo_url TEXT,
      subscription_status TEXT DEFAULT 'trial',
      subscription_start_date DATETIME,
      subscription_end_date DATETIME,
      monthly_fee REAL DEFAULT 299.0,
      contact_name TEXT,
      contact_email TEXT,
      contact_phone TEXT,
      active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Super admin users table (Platform administrators)
    db.run(`CREATE TABLE IF NOT EXISTS super_admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      full_name TEXT NOT NULL,
      email TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Insert default super admin (password: superadmin123)
    db.run(`INSERT OR IGNORE INTO super_admins (username, password, full_name, email) VALUES
      ('superadmin', 'superadmin123', 'Platform Administrator', 'platform@foreningsforsaljning.se')
    `);

    // Admin users table (Club administrators)
    db.run(`CREATE TABLE IF NOT EXISTS admin_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      club_id INTEGER NOT NULL,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      full_name TEXT NOT NULL,
      email TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE CASCADE
    )`);

    // Teams table (belongs to club)
    db.run(`CREATE TABLE IF NOT EXISTS teams (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      club_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE CASCADE,
      UNIQUE(club_id, name)
    )`);

    // Team members table
    db.run(`CREATE TABLE IF NOT EXISTS team_members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      team_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      phone TEXT,
      email TEXT,
      FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE
    )`);

    // Geographical areas table (belongs to club)
    db.run(`CREATE TABLE IF NOT EXISTS geographical_areas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      club_id INTEGER NOT NULL,
      team_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      coordinates TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE CASCADE,
      FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE
    )`);

    // Customers table (belongs to club)
    db.run(`CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      club_id INTEGER NOT NULL,
      customer_number TEXT NOT NULL,
      name TEXT NOT NULL,
      address TEXT NOT NULL,
      postal_address TEXT NOT NULL,
      phone_number TEXT,
      email TEXT,
      area_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE CASCADE,
      FOREIGN KEY (area_id) REFERENCES geographical_areas(id) ON DELETE SET NULL,
      UNIQUE(club_id, customer_number)
    )`);

    // Products table (belongs to club)
    db.run(`CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      club_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      price REAL NOT NULL,
      subscription_price REAL,
      sacks_per_pallet INTEGER NOT NULL,
      active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE CASCADE
    )`);

    // Orders table (belongs to club)
    db.run(`CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      club_id INTEGER NOT NULL,
      customer_id INTEGER NOT NULL,
      order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      quarter TEXT NOT NULL,
      year INTEGER NOT NULL,
      status TEXT DEFAULT 'pending',
      total_amount REAL NOT NULL,
      delivered INTEGER DEFAULT 0,
      delivery_date DATETIME,
      FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE CASCADE,
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

    // Club subscriptions/billing tracking
    db.run(`CREATE TABLE IF NOT EXISTS club_billing (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      club_id INTEGER NOT NULL,
      billing_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      amount REAL NOT NULL,
      period_start DATE NOT NULL,
      period_end DATE NOT NULL,
      status TEXT DEFAULT 'pending',
      payment_reference TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE CASCADE
    )`);

    console.log('Multi-tenant database initialized successfully');
  });
}

module.exports = db;
