# FöreningsFörsäljning - Multi-Tenant Sales Organization Platform

A comprehensive web application for managing sales teams, customers, orders, and delivery of paper products across defined geographical areas. Built as a multi-tenant SaaS platform supporting multiple clubs with complete data isolation.

## 🚀 FIRST TIME? READ THIS! 

### ⚠️ DOWNLOADED ZIP BUT ONLY GOT ONE README FILE?

**→ Read [DOWNLOAD-INSTRUCTIONS.md](DOWNLOAD-INSTRUCTIONS.md)** - You need to download from the correct branch!

### 📖 You're Looking at This on GitHub.com?

**→ Read [START-HERE.md](START-HERE.md) or [DOWNLOAD-INSTRUCTIONS.md](DOWNLOAD-INSTRUCTIONS.md) FIRST** - They explain how to download this code to your computer!

### 💻 You Already Have the Code on Your Computer?

**Choose your guide based on your situation:**

#### 🍎 Mac Users
- **[FOR-MAC-USERS.md](FOR-MAC-USERS.md)** ← **Ultra-simple 6-step guide**
- **[MAC-SETUP.md](MAC-SETUP.md)** ← Detailed Mac guide with troubleshooting

#### 🪟 Windows/Linux Users  
- **[BEGINNER-GUIDE.md](BEGINNER-GUIDE.md)** ← Complete walkthrough for all platforms
- **[HOW-TO-TEST.md](HOW-TO-TEST.md)** ← How to start server and test

#### 📚 Quick References
- **[QUICK-START.md](QUICK-START.md)** ← Command cheat sheet
- **[BACKEND-TESTING.md](BACKEND-TESTING.md)** ← Complete API testing guide
- **[ISSUE-RESOLVED.md](ISSUE-RESOLVED.md)** ← Common path issues explained

**Already familiar?** Jump to [Installation](#installation) below.

## Features

### Authentication System
- **Team Login**: Shared credentials per team (sales reps share one login)
- **Admin Login**: Individual admin accounts with personal credentials
- **Role-Based Access**: Different permissions for team vs admin users

### Two Order Flows

#### 1. Sales Rep Orders (In-Person)
- Sales rep visits customer and enters order
- Customer pays before/during delivery
- Payment tracked in admin panel
- Marked as paid when payment received

#### 2. Customer Self-Service (Web)
- Public order page (no login required)
- Customer fills in their information
- Selects products (one-time or subscription)
- Immediate Swish payment during checkout
- Order automatically marked as paid

### Core Functionality

#### Team Management
- Create and manage sales teams
- Add team members (names, contact info - for display only)
- Each team has shared login credentials
- Teams assigned to geographical areas

#### Geographic Area Management
- **Map-Based Territory Definition**: Admins draw polygon areas on map using drawing tools
- **Address Extraction**: Convert drawn areas to street/house address lists
- **Address Management**: Edit lists, mark addresses as visit/do-not-visit
- **Customer Opt-Out**: Individual addresses can be excluded from visits
- **Sweden-focused**: Currently optimized for Swedish addresses, ready for international expansion

#### Customer Management
- Customer registry with:
  - Customer number (auto-generated)
  - Name
  - Address
  - Postal address
  - Phone number
  - Email
- Linked to geographical areas

#### Product Catalog
- Pre-loaded with 4 products:
  - Lambi Toapapper
  - Lambi Hushållspapper
  - Serla Toapapper
  - Serla Hushållspapper
- Regular price and subscription price (discount)
- Sacks per pallet configuration
- **Whole sacks only** - no partial quantities allowed
- Add/remove/update products
- Adjust pricing

#### Order Management
- **Quarterly Orders**: Q1 (Jan-Mar), Q2 (Apr-Jun), Q3 (Jul-Sep), Q4 (Oct-Dec)
- **One-Time Purchases**: Regular pricing
- **Subscriptions**: 
  - Discounted pricing
  - Auto-renewal every quarter
  - After 4 deliveries (1 year), email sent asking to continue
  - Track subscription start date and delivery count
- Order tracking by team and district

#### Payment System
- **Mock Swish Integration**: 
  - Simulated QR code display
  - Mock payment processing
  - Payment reference tracking
  - Ready for real Swish API integration
- **Payment Flows**:
  - Customer web orders: Immediate payment required
  - Sales rep orders: Payment tracked, marked later by admin
- Payment status management (paid/unpaid)
- Payment reference tracking

#### Delivery Management
- **Simple Status**: Orders are either "Delivered" or "Not Delivered"
- **Delivery Personnel**: Mark orders as delivered in the app (using team login)
- Delivery summaries by team
- Sack counts per area and street
- Organized for efficient delivery routing

#### Admin Dashboard
- **Order Analytics**:
  - Orders by team with revenue totals
  - Orders by geographical area
  - Filter by quarter and year
  - Paid vs outstanding amounts
- **Pallet Requirements**:
  - Aggregate total sacks ordered
  - Calculate pallets needed from supplier
  - Based on sacks per pallet ratio
- **Payment Tracking**:
  - Mark orders as paid/unpaid
  - Add payment references
  - Track payment dates

## Technology Stack

### Backend
- **Node.js** with Express
- **SQLite** database (optimized for scale: 10s of clubs, 100k-2M customers)
- **RESTful API** architecture
- **CORS** enabled for frontend integration
- **Performance indexes** on all foreign keys and query filters

### Frontend
- **React** with React Router
- **Axios** for API calls
- **Leaflet** for interactive maps with drawing tools
- **React-Leaflet** for map components
- **Responsive design** for desktop and mobile browsers

### Scalability & Performance

**Current Architecture Supports:**
- 10-50 clubs (tenant organizations)
- 5-20 teams per club (~500-1,000 teams total)
- 200-2,000 customers per team (100,000 - 2,000,000 customers total)
- Quarterly orders (potentially millions of order records)

**Performance Optimizations:**
- Database indexes on all foreign keys and filters
- Club-scoped queries for data isolation and performance
- Pagination support for large datasets
- Query optimization with proper WHERE clauses
- Efficient JOIN operations

**When to Migrate to PostgreSQL/MySQL:**
- Beyond 50 active clubs
- More than 5 million customers
- High concurrent write operations (>100/sec)
- Need for advanced features (replication, clustering)
- Geographic distribution requirements

## Database Schema

### Multi-Tenant Architecture

The application uses a **multi-tenant SaaS architecture** where multiple clubs (organizations) share the same application instance but have completely isolated data.

**Tenant Isolation:**
- Every table includes `club_id` for data scoping
- All queries filtered by club context
- Clubs cannot access each other's data
- Geographic territories assigned per club

**Three-Tier User System:**
1. **Super Admin** - Platform administrators who manage clubs
2. **Club Admin** - Club administrators who manage their organization
3. **Team Users** - Sales teams who enter orders and deliveries

### Core Tables

**Multi-Tenant Tables:**
- `clubs` - Tenant organizations with branding, billing, geographic area
- `super_admins` - Platform administrators
- `club_billing` - Subscription and billing tracking

**Club-Scoped Tables:**
- `admin_users` - Club administrators (linked to club)
- `teams` - Sales teams with shared login credentials (linked to club)
- `team_members` - Individual team member info (display only)
- `geographical_areas` - Territory polygons and address lists (linked to club)
- `customers` - Customer registry (linked to club)
- `products` - Product catalog with pricing (linked to club)
- `orders` - Order records with quarterly tracking and delivery status (linked to club)
- `order_items` - Individual products per order
- `payments` - Payment tracking and status

## Installation

### Prerequisites
- **Node.js 14+** installed ([Download here](https://nodejs.org))
- **npm** package manager (comes with Node.js)
- **Terminal/Command Line** access

### Quick Setup (3 Steps)

**Step 1: Navigate to the project**
```bash
cd /home/runner/work/ForeningsForsaljning/ForeningsForsaljning
```

**Step 2: Install dependencies**
```bash
npm install
```

**Step 3: Start the backend**
```bash
node backend/server.js
```

**That's it!** Backend is running on `http://localhost:3001`

**Test it:** Open browser and go to `http://localhost:3001/api/health`

### Detailed Setup Instructions

For beginners or if you need more help, see **[BEGINNER-GUIDE.md](BEGINNER-GUIDE.md)**

### Running the Frontend

(Frontend implementation in progress - coming soon!)

```bash
cd frontend
npm install
npm start
```

Frontend will run on `http://localhost:3000`

## Running the Application

### Development Mode

**Terminal 1 - Backend Server:**
```bash
node backend/server.js
```
Backend runs on `http://localhost:3001`

**Terminal 2 - Frontend (when ready):**
```bash
cd frontend
npm start
```
Frontend runs on `http://localhost:3000`

### Testing the Backend

See **[BACKEND-TESTING.md](BACKEND-TESTING.md)** for complete testing guide.

**Quick test:**
```bash
# Run automated tests
./test-backend.sh
```

### Demo Login Credentials

**Super Admin (Platform Manager):**
- Username: `superadmin`
- Password: `superadmin123`
- Access: All clubs

**Club Admin Examples:**
- Stockholm: `admin.stockholm` / `demo123`
- Göteborg: `admin.goteborg` / `demo123`
- Malmö: `admin.malmo` / `demo123`

**Team Examples:**
- Any team: password `team123`
- Usernames: `norrmalm`, `sodermalm`, `centrum`, `hisingen`, `vastra`

See **[STATUS-DEMO.md](STATUS-DEMO.md)** for complete demo account list.

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login (super_admin, admin, or team)

### Super Admin Endpoints
- `GET /api/super-admin/clubs` - List all clubs
- `POST /api/super-admin/clubs` - Create new club
- `POST /api/super-admin/club-admins` - Create club administrator

### Club Admin & Team Endpoints (require x-club-id header)
- `GET /api/teams` - List teams for club
- `POST /api/teams` - Create team (admin only)
- `DELETE /api/teams/:id` - Delete team (admin only)

### Geographic Areas
- `GET /api/areas` - List all areas
- `POST /api/areas` - Create area with polygon (admin only)
- `PUT /api/areas/:id` - Update area (admin only)
- `DELETE /api/areas/:id` - Delete area (admin only)

### Customers
- `GET /api/customers` - List all customers
- `POST /api/customers` - Create customer
- `GET /api/customers/:id` - Get customer details
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer

### Products
- `GET /api/products` - List active products
- `POST /api/products` - Create product (admin only)
- `PUT /api/products/:id` - Update product (admin only)
- `DELETE /api/products/:id` - Deactivate product (admin only)

### Orders
- `GET /api/orders` - List all orders
- `POST /api/orders` - Create order
- `GET /api/orders/:id` - Get order details
- `PUT /api/orders/:id/mark-delivered` - Mark order as delivered

### Payments
- `PUT /api/payments/:id/mark-paid` - Mark as paid (admin only)
- `PUT /api/payments/:id/mark-unpaid` - Mark as unpaid (admin only)

### Admin Analytics
- `GET /api/admin/orders-by-team?quarter=Q1&year=2026` - Orders by team
- `GET /api/admin/orders-by-area?quarter=Q1&year=2026` - Orders by area
- `GET /api/admin/pallet-requirements?quarter=Q1&year=2026` - Pallet calculations
- `GET /api/admin/orders` - All orders with payment status

### Delivery
- `GET /api/delivery/summary?team_id=1&quarter=Q1&year=2026` - Delivery summary
- `GET /api/delivery/summary-by-team?quarter=Q1&year=2026` - Team delivery summary

## User Workflows

### Admin Workflow
1. Login with admin credentials
2. Create teams and assign login credentials
3. Draw geographical areas on map for each team
4. System extracts addresses from drawn polygons
5. Edit address lists, mark opt-out addresses
6. Manage products and pricing
7. View order analytics and pallet requirements
8. Mark payments as received
9. Track delivery status

### Sales Rep Workflow (Team Login)
1. Login with team credentials
2. View assigned geographical areas
3. Visit customers and enter orders
4. Mark items as delivered after delivery
5. View delivery summaries

### Customer Workflow (No Login)
1. Visit public order page
2. Enter customer information
3. Select products (whole sacks only)
4. Choose one-time or subscription
5. Pay immediately via Swish (mock)
6. Receive order confirmation

### Delivery Personnel Workflow (Team Login)
1. Login with team credentials
2. View delivery summary for assigned area
3. Deliver goods to customers
4. Mark orders as delivered in app

## Future Enhancements

### Ready for Implementation
1. **Real Swish Integration**: Replace mock payment with actual Swish API
2. **Address Geocoding**: Integrate real geocoding service for address extraction from map polygons
3. **Email Notifications**: 
   - Subscription renewal emails after 4 deliveries
   - Order confirmations
   - Delivery notifications
4. **International Support**: Multi-country address formats and maps
5. **Subscription Auto-Orders**: Automated quarterly order generation for subscribers
6. **Advanced Reporting**: Export data, charts, analytics
7. **Mobile App**: Native iOS/Android versions for better mobile experience

## Architecture Notes

### Swish Payment Integration
The current implementation uses a **mock Swish payment system**. To integrate real Swish:

1. Sign up for Swish merchant account
2. Get API credentials (merchant ID, certificate, etc.)
3. Replace mock functions in `frontend/src/App.js`:
   - `handleSwishPayment()` - Generate real QR code using Swish API
   - Add Swish API calls for payment initiation and confirmation
4. Update backend to handle Swish webhooks for payment confirmation
5. Implement proper error handling and payment status polling

### Address Extraction from Map
Currently uses mock address generation. To implement real extraction:

1. Integrate geocoding service (Google Maps API, OpenStreetMap Nominatim for Sweden)
2. When polygon is drawn, query for all addresses within bounds
3. Parse and store Swedish address format (street, number, postal code)
4. Add address validation and standardization
5. Implement opt-out management per address

### Subscription Management
Database ready for subscription tracking. To implement:

1. Add `subscriptions` table with:
   - customer_id
   - product_id
   - start_date
   - delivery_count (increments each quarter)
   - status (active/paused/cancelled)
2. Create scheduled job (cron) to:
   - Run at start of each quarter
   - Generate orders for active subscriptions
   - Increment delivery_count
   - Check if delivery_count = 4, send renewal email
3. Integrate email service (SendGrid, AWS SES, etc.)

### Geographic Area Address Lists
When polygon is drawn:
1. Store polygon coordinates in `geographical_areas.coordinates`
2. Call geocoding API to get addresses within bounds
3. Store in new `area_addresses` table:
   - area_id
   - street_name
   - house_number
   - postal_code
   - city
   - allow_visits (boolean - for opt-out)
4. Provide UI to edit address list and toggle visit permission

## Security Considerations

⚠️ **Important for Production:**

1. **Authentication**: Current implementation uses simple token-based auth. Replace with:
   - JWT tokens with expiration
   - Password hashing (bcrypt/argon2)
   - Secure session management
   - CSRF protection

2. **Database**: SQLite is suitable for development. For production:
   - Migrate to PostgreSQL or MySQL
   - Add database backups
   - Implement connection pooling
   - Use transactions for multi-step operations

3. **API Security**:
   - Add rate limiting
   - Input validation and sanitization
   - SQL injection prevention (parameterized queries already in place)
   - Add request body size limits

4. **HTTPS**: Enable SSL/TLS for production deployment

5. **Environment Variables**: Move sensitive config to environment variables:
   - Database credentials
   - Swish API keys
   - Email service credentials
   - Secret keys for JWT

6. **Data Privacy**: 
   - GDPR compliance for customer data
   - Data retention policies
   - Right to be forgotten implementation

## Responsive Design

The application is built with mobile-first responsive design:
- Works on desktop browsers (1024px+)
- Tablets (768px - 1024px)
- Mobile phones (320px - 768px)
- Touch-friendly interface
- Optimized for both portrait and landscape orientations

## License

ISC

## Support

For issues or questions, please create an issue in the GitHub repository.
