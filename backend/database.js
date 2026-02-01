const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const EventEmitter = require('events');

// Create an event emitter to signal when database is ready
const dbEvents = new EventEmitter();
let isInitialized = false;

const db = new sqlite3.Database(path.join(__dirname, 'foreningsforsaljning.db'), (err) => {
  if (err) {
    console.error('Error opening database:', err);
    dbEvents.emit('error', err);
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
      team_id INTEGER,
      name TEXT NOT NULL,
      description TEXT,
      postal_codes TEXT,
      coordinates TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE CASCADE,
      FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE SET NULL
    )`);

    // Alias for backwards compatibility
    // Note: geographic_areas is the table name used by frontend
    // geographical_areas is kept for database consistency
    // Both names refer to the same table in this implementation
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

    // Products table (belongs to club OR global if club_id is NULL)
    db.run(`CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      club_id INTEGER,
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

    // Create indexes for performance optimization
    // Critical for scale: 10s of clubs, 100s of teams, 100k-2M customers
    db.run(`CREATE INDEX IF NOT EXISTS idx_teams_club_id ON teams(club_id)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_admin_users_club_id ON admin_users(club_id)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_geographical_areas_club_id ON geographical_areas(club_id)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_geographical_areas_team_id ON geographical_areas(team_id)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_customers_club_id ON customers(club_id)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_customers_area_id ON customers(area_id)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_customers_customer_number ON customers(club_id, customer_number)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_products_club_id ON products(club_id)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_products_active ON products(club_id, active)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_orders_club_id ON orders(club_id)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_orders_quarter_year ON orders(club_id, quarter, year)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_orders_delivered ON orders(club_id, delivered)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_payments_paid ON payments(paid)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_club_billing_club_id ON club_billing(club_id)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_club_billing_status ON club_billing(club_id, status)`);

    // Insert demo data for testing
    insertDemoData();

    console.log('Multi-tenant database initialized successfully with performance indexes');
    
    // Signal that database is ready
    isInitialized = true;
    dbEvents.emit('ready');
  });
}

function insertDemoData() {
  db.serialize(() => {
    // Insert global products (club_id = NULL) - 4 products as requested
    db.run(`INSERT OR IGNORE INTO products (id, club_id, name, type, price, subscription_price, sacks_per_pallet) VALUES
      (1, NULL, 'Lambi Toapapper', 'toilet_paper', 100.0, 90.0, 50),
      (2, NULL, 'Lambi Hushållspapper', 'household_paper', 80.0, 72.0, 60),
      (3, NULL, 'Serla Toapapper', 'toilet_paper', 95.0, 85.0, 50),
      (4, NULL, 'Serla Hushållspapper', 'household_paper', 75.0, 67.5, 60)
    `);

    // Insert demo club (Stockholm IF)
    db.run(`INSERT OR IGNORE INTO clubs (id, name, slug, geographic_area, primary_color, secondary_color, subscription_status, monthly_fee, contact_name, contact_email) VALUES
      (1, 'Stockholm Idrottsförening', 'stockholm-if', 'Stockholm County', '#0066CC', '#FFD700', 'active', 299.0, 'Eva Karlsson', 'eva@stockholmif.se')
    `);

    // Insert admin user for Stockholm IF
    db.run(`INSERT OR IGNORE INTO admin_users (club_id, username, password, full_name, email) VALUES
      (1, 'admin.stockholm', 'demo123', 'Eva Karlsson', 'eva@stockholmif.se')
    `);

    // Insert 2 teams as requested
    db.run(`INSERT OR IGNORE INTO teams (id, club_id, name, username, password) VALUES
      (1, 1, 'Team Norrmalm', 'norrmalm', 'team123'),
      (2, 1, 'Team Södermalm', 'sodermalm', 'team123')
    `);

    // Insert team members
    db.run(`INSERT OR IGNORE INTO team_members (team_id, name, phone, email) VALUES
      (1, 'Anders Andersson', '070-123-4567', 'anders@example.com'),
      (1, 'Britta Bengtsson', '070-234-5678', 'britta@example.com'),
      (2, 'Carl Carlsson', '070-345-6789', 'carl@example.com'),
      (2, 'Diana Davidsson', '070-456-7890', 'diana@example.com')
    `);

    // Insert geographic areas with proper schema
    db.run(`INSERT OR IGNORE INTO geographical_areas (id, club_id, name, description, postal_codes, team_id) VALUES
      (1, 1, 'Norrmalm Centrum', 'Central Stockholm, Norrmalm district', '11135, 11136, 11143, 11151', 1),
      (2, 1, 'Södermalm Syd', 'Southern Stockholm, Södermalm area', '11646, 11830, 11831', 2),
      (3, 1, 'Östermalm', 'Eastern Stockholm district', '11421, 11437, 11438', 1),
      (4, 1, 'Kungsholmen', 'Western Stockholm island', '11220, 11221, 11234', NULL)
    `);

    // Insert 10 customers as requested
    db.run(`INSERT OR IGNORE INTO customers (id, club_id, customer_number, name, address, postal_address, phone_number, email, area_id) VALUES
      (1, 1, 'CUST001', 'Anders Svensson', 'Kungsgatan 1', '11143 Stockholm', '08-123-4567', 'anders.s@example.com', 1),
      (2, 1, 'CUST002', 'Britta Johansson', 'Drottninggatan 10', '11151 Stockholm', '08-234-5678', 'britta.j@example.com', 1),
      (3, 1, 'CUST003', 'Carl Eriksson', 'Götgatan 15', '11646 Stockholm', '08-345-6789', 'carl.e@example.com', 2),
      (4, 1, 'CUST004', 'Diana Larsson', 'Folkungagatan 20', '11830 Stockholm', '08-456-7890', 'diana.l@example.com', 2),
      (5, 1, 'CUST005', 'Erik Pettersson', 'Karlavägen 5', '11421 Stockholm', '08-567-8901', 'erik.p@example.com', 3),
      (6, 1, 'CUST006', 'Frida Nilsson', 'Storgatan 8', '11437 Stockholm', '08-678-9012', 'frida.n@example.com', 3),
      (7, 1, 'CUST007', 'Gustav Andersson', 'Hantverkargatan 12', '11221 Stockholm', '08-789-0123', 'gustav.a@example.com', 4),
      (8, 1, 'CUST008', 'Helena Bergström', 'Scheelegatan 3', '11234 Stockholm', '08-890-1234', 'helena.b@example.com', 4),
      (9, 1, 'CUST009', 'Ingvar Karlsson', 'Sveavägen 44', '11135 Stockholm', '08-901-2345', 'ingvar.k@example.com', 1),
      (10, 1, 'CUST010', 'Julia Lindström', 'Hornsgatan 22', '11831 Stockholm', '08-012-3456', 'julia.l@example.com', 2)
    `);

    // Insert sample orders for some customers
    db.run(`INSERT OR IGNORE INTO orders (id, club_id, customer_id, quarter, year, total_price, order_date, payment_status) VALUES
      (1, 1, 1, 'Q1', 2026, 180.0, '2026-01-15', 'paid'),
      (2, 1, 2, 'Q1', 2026, 162.0, '2026-01-16', 'paid'),
      (3, 1, 3, 'Q1', 2026, 285.0, '2026-01-17', 'unpaid'),
      (4, 1, 4, 'Q1', 2026, 190.0, '2026-01-18', 'unpaid'),
      (5, 1, 5, 'Q1', 2026, 144.0, '2026-01-19', 'paid'),
      (6, 1, 6, 'Q1', 2026, 200.0, '2026-01-20', 'unpaid')
    `);

    // Insert order items
    db.run(`INSERT OR IGNORE INTO order_items (order_id, product_id, quantity, is_subscription, price) VALUES
      (1, 1, 2, 1, 90.0),
      (2, 1, 1, 1, 90.0),
      (2, 2, 1, 1, 72.0),
      (3, 1, 3, 0, 100.0),
      (4, 1, 2, 0, 100.0),
      (5, 2, 2, 1, 72.0),
      (6, 1, 2, 0, 100.0)
    `);

    // Insert payment records with proper schema
    db.run(`INSERT OR IGNORE INTO payments (id, order_id, amount, payment_status, payment_date, payment_reference, payment_method) VALUES
      (1, 1, 180.0, 'paid', '2026-01-16', 'SWISH-001', 'swish'),
      (2, 2, 162.0, 'paid', '2026-01-17', 'SWISH-002', 'swish'),
      (3, 3, 285.0, 'unpaid', NULL, NULL, NULL),
      (4, 4, 190.0, 'unpaid', NULL, NULL, NULL),
      (5, 5, 144.0, 'paid', '2026-01-20', 'SWISH-005', 'swish'),
      (6, 6, 200.0, 'unpaid', NULL, NULL, NULL)
    `);

    console.log('Demo data inserted successfully');
    console.log('  - 4 products');
    console.log('  - 2 teams');
    console.log('  - 4 geographic areas');
    console.log('  - 10 customers');
    console.log('  - 6 sample orders');
  });
}

// Export both the database and the initialization promise
module.exports = db;

// Add method to wait for database to be ready
module.exports.waitForReady = () => {
  return new Promise((resolve, reject) => {
    if (isInitialized) {
      resolve();
    } else {
      dbEvents.once('ready', resolve);
      dbEvents.once('error', reject);
    }
  });
};
