# FöreningsFörsäljning - Multi-Tenant Sales Management Application

## Overview

FöreningsFörsäljning is a comprehensive multi-tenant web application designed for managing sales operations across multiple sports clubs and organizations. The platform enables clubs to coordinate sales activities, manage customer relationships, track orders, and monitor team performance.

## Current Deployment

**Live URL:** https://handsome-gratitude-production-2a6d.up.railway.app  
**Platform:** Railway  
**Status:** Production-ready, fully functional

## Architecture

### Technology Stack

**Backend:**
- Node.js with Express.js
- SQLite database with multi-tenant architecture
- RESTful API design
- Token-based authentication (JWT)

**Frontend:**
- React 18.x
- React Router for navigation
- Modern JavaScript (ES6+)
- Responsive CSS design

**Deployment:**
- Railway.app (PaaS)
- Automated builds and deployments
- Health check monitoring
- HTTPS enabled

### Project Structure

```
ForeningsForsaljning/
├── backend/
│   ├── server.js           # Express server & API routes
│   ├── database.js         # Database initialization & schema
│   └── multi-tenant-sales.db  # SQLite database (production)
├── frontend/
│   ├── src/
│   │   ├── App.js          # Main React component
│   │   ├── index.js        # React entry point
│   │   └── index.css       # Global styles
│   ├── public/             # Static assets
│   └── package.json        # Frontend dependencies
├── package.json            # Backend dependencies & scripts
├── railway.json            # Railway deployment config
├── README.md              # Project overview
└── APPLICATION.md         # This document
```

## Features

### Multi-Tenant Architecture

The application supports multiple independent organizations (clubs) with complete data isolation:

- **Organization Management:** Each club operates independently
- **Data Isolation:** Separate data per organization with `organization_id` foreign keys
- **User Segregation:** Users belong to specific organizations
- **Cross-Tenant Security:** Enforced data boundaries

### User Roles & Authentication

**Three User Types:**

1. **Super Admin**
   - Platform-wide management
   - Create and manage organizations
   - Access all organizational data
   - System configuration

2. **Admin**
   - Organization-level management
   - View reports and analytics
   - Monitor team performance
   - Access all organization data

3. **Team Members**
   - Customer relationship management
   - Order creation and tracking
   - Product catalog access
   - Individual performance tracking

### Core Functionality

#### Customer Management
- Create, read, update, delete customer records
- Track customer contact information
- Customer history and notes
- Search and filtering

#### Order Management
- Create orders with multiple products
- Track order status (pending, delivered, paid)
- Payment tracking
- Delivery status monitoring
- Order history and analytics

#### Product Catalog
- Predefined product offerings
- Pricing and descriptions
- Product categorization
- Inventory awareness

#### Team Performance
- Individual sales tracking
- Team leaderboards
- Quarter-based performance metrics
- Pallet requirement calculations

#### Analytics & Reporting
- Sales statistics by period
- Payment status overview
- Delivery tracking
- Performance metrics

### Customer Self-Service

**Public Order Form:** `/customer-order`
- Customers can place orders directly
- Product selection with shopping cart
- Mock payment integration
- Order confirmation

## Database Schema

### Organizations Table
```sql
CREATE TABLE organizations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

### Users Table
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    organization_id INTEGER NOT NULL,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL,
    name TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(id)
)
```

### Customers Table
```sql
CREATE TABLE customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    organization_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    address TEXT,
    phone TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(id)
)
```

### Orders Table
```sql
CREATE TABLE orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    organization_id INTEGER NOT NULL,
    customer_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    status TEXT DEFAULT 'pending',
    is_paid BOOLEAN DEFAULT 0,
    is_delivered BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(id),
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
)
```

### Order Items Table
```sql
CREATE TABLE order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    price REAL NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
)
```

### Products Table
```sql
CREATE TABLE products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    category TEXT
)
```

## API Documentation

### Base URL
- Production: `https://handsome-gratitude-production-2a6d.up.railway.app`
- Development: `http://localhost:3001`

### Authentication

**Login:**
```
POST /api/login
Content-Type: application/json

{
  "username": "string",
  "password": "string"
}

Response: {
  "token": "jwt-token",
  "user": { ... }
}
```

**Logout:**
```
POST /api/logout
Authorization: Bearer <token>
```

### Customer Endpoints

```
GET    /api/customers              # List all customers (org-scoped)
POST   /api/customers              # Create customer
GET    /api/customers/:id          # Get customer details
PUT    /api/customers/:id          # Update customer
DELETE /api/customers/:id          # Delete customer
```

### Order Endpoints

```
GET    /api/orders                 # List all orders (org-scoped)
POST   /api/orders                 # Create order
GET    /api/orders/:id             # Get order details
PUT    /api/orders/:id             # Update order
PUT    /api/orders/:id/status      # Update order status
```

### Product Endpoints

```
GET    /api/products               # List all products
GET    /api/products/:id           # Get product details
```

### Statistics Endpoints

```
GET    /api/stats/sales            # Sales statistics
GET    /api/stats/user-performance # User performance metrics
```

### Health Check

```
GET    /api/health                 # Server health status
```

## Demo Data

### Organizations
1. **Stockholm Sports Club** (ID: 1)
2. **Gothenburg Athletes** (ID: 2)
3. **Malmö Sports Association** (ID: 3)

### Demo Users

**Super Admin:**
- Username: `superadmin`
- Password: `super123`

**Stockholm Admins:**
- Username: `admin.stockholm`
- Password: `demo123`

**Stockholm Teams:**
- Username: `norrmalm` | Password: `team123`
- Username: `sodermalm` | Password: `team123`
- Username: `ostermalm` | Password: `team123`

**Gothenburg Teams:**
- Username: `hisingen` | Password: `team123`
- Username: `majorna` | Password: `team123`

### Demo Products

1. **Lambi Toapapper** - 6-pack toilet paper (69 SEK)
2. **Lambi Hushållspapper** - 3-pack paper towels (79 SEK)
3. **Serla Toapapper** - 6-pack toilet paper (65 SEK)
4. **Serla Hushållspapper** - 3-pack paper towels (75 SEK)

## Deployment

### Current Setup

The application is deployed on Railway.app with:
- Automatic deployments from GitHub
- Health check monitoring at `/api/health`
- Environment: Production
- Node.js 22.x runtime
- Automatic HTTPS

### Deployment Configuration

**railway.json:**
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm install && npm run railway-build"
  },
  "deploy": {
    "startCommand": "npm start",
    "healthcheckPath": "/api/health",
    "healthcheckTimeout": 300,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

**package.json scripts:**
```json
{
  "scripts": {
    "start": "node backend/server.js",
    "railway-build": "cd frontend && npm install --legacy-peer-deps && npm run build",
    "install-frontend": "cd frontend && npm install --legacy-peer-deps",
    "build-frontend": "cd frontend && npm run build"
  }
}
```

### Frontend Deployment

The React frontend is built during Railway deployment and served as static files by the Express backend:

**Build Process:**
1. `npm run railway-build` installs frontend dependencies
2. `react-scripts build` creates production bundle in `frontend/build/`
3. Express server detects build and serves it at root URL

**Route Handling:**
- Static files served from `frontend/build/` directory
- React Router handles client-side routing
- API routes preserved at `/api/*` paths
- Fallback to `index.html` for non-API, non-file routes

**Critical Implementation Details:**
- Route precedence: React static serving must come before root route
- Wildcard catch-all: Use `app.use(...)` instead of `app.get('*', ...)` for Express 5+
- Conditional logic: Landing page only serves when build directory doesn't exist

### Environment Variables

**Required:**
- `PORT` - Server port (Railway provides automatically)
- `NODE_ENV` - Set to "production" for production

**Optional:**
- `JWT_SECRET` - Custom JWT secret (defaults to generated value)

## Development

### Local Setup

**Prerequisites:**
- Node.js 18.x or higher
- npm 8.x or higher

**Installation:**

1. Clone the repository
```bash
git clone https://github.com/Tschiffer46/ForeningsForsaljning.git
cd ForeningsForsaljning
```

2. Install backend dependencies
```bash
npm install
```

3. Install frontend dependencies
```bash
cd frontend
npm install
cd ..
```

4. Start the backend server
```bash
node backend/server.js
```

5. In a separate terminal, start the frontend
```bash
cd frontend
npm start
```

6. Access the application
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

### Database Initialization

The database is automatically initialized on server startup with:
- Schema creation
- Performance indexes
- Demo data (in development mode)

Database file location: `backend/multi-tenant-sales.db`

### Testing

**Health Check:**
```bash
curl http://localhost:3001/api/health
```

**API Testing:**
```bash
# Login
curl -X POST http://localhost:3001/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin.stockholm","password":"demo123"}'

# Get customers (with token)
curl http://localhost:3001/api/customers \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Frontend Testing:**
1. Open http://localhost:3000
2. Click "Team Login" or "Admin Login"
3. Use demo credentials
4. Test all features

## Security Considerations

### Current Implementation

- **Authentication:** JWT token-based
- **Password Storage:** Plain text (⚠️ NOT for production use)
- **Data Isolation:** Organization-scoped queries
- **HTTPS:** Enabled via Railway
- **CORS:** Configured for production domain

### Production Recommendations

For production use, implement:
1. **Password Hashing:** Use bcrypt or argon2
2. **Environment Variables:** Store secrets securely
3. **Rate Limiting:** Prevent API abuse
4. **Input Validation:** Sanitize all user input
5. **SQL Injection Protection:** Use parameterized queries (already implemented)
6. **XSS Protection:** Content Security Policy headers
7. **Session Management:** Secure cookie configuration
8. **Audit Logging:** Track sensitive operations

## Troubleshooting

### Common Issues

**Port Already in Use:**
```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9
```

**Database Locked:**
```bash
# Remove database and restart (development only)
rm backend/multi-tenant-sales.db
node backend/server.js
```

**Build Failures:**
- Check Node.js version (need 18+)
- Clear node_modules and reinstall
- Use `--legacy-peer-deps` flag for frontend

**Health Check Failures:**
- Database must initialize before server accepts connections
- Check server logs for initialization messages
- Verify `/api/health` endpoint responds

## Performance

### Optimizations Implemented

- Database indexes on foreign keys
- Composite indexes for common queries
- Connection pooling (SQLite default)
- Static file serving with Express
- Production React build optimization

### Scaling Considerations

For high traffic:
1. **Database:** Migrate to PostgreSQL or MySQL
2. **Caching:** Implement Redis for session storage
3. **Load Balancing:** Use Railway's horizontal scaling
4. **CDN:** Serve static assets via CDN
5. **API Gateway:** Rate limiting and request queuing

## Future Enhancements

### Phase 2: Multi-Tenant UI
- Super admin dashboard
- Organization management interface
- Club branding and customization
- Multi-organization switching

### Phase 3: Advanced Features
- Email notifications
- SMS integration
- Payment gateway integration
- Advanced analytics and reporting
- Mobile app (React Native)
- Offline support

### Phase 4: Enterprise
- Role-based permissions
- Audit trails
- Data export/import
- API webhooks
- Third-party integrations

## Support & Documentation

**Main Documentation:**
- `APPLICATION.md` - This document (current state)
- `IDEAL-PLAN.md` - Project planning guide
- `DEPLOYMENT.md` - Detailed deployment guide
- `RAILWAY.md` - Railway-specific configuration

**Archived Documentation:**
- `docs-archive/` - Historical troubleshooting guides and process documentation

**Repository:**
- GitHub: https://github.com/Tschiffer46/ForeningsForsaljning

## License & Credits

**Project:** FöreningsFörsäljning (Sales Organization Management)  
**Version:** 1.0.0  
**Status:** Production-ready, single-tenant mode functional  
**Multi-tenant:** Backend complete, frontend Phase 2

---

**Last Updated:** February 1, 2026  
**Deployed:** Railway.app  
**URL:** https://handsome-gratitude-production-2a6d.up.railway.app
