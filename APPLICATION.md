# FöreningsFörsäljning - Multi-Tenant Sales Management Application

## Overview

FöreningsFörsäljning is a comprehensive multi-tenant web application designed for managing sales operations across multiple sports clubs and organizations. The platform enables clubs to coordinate sales activities, manage customer relationships, track orders, and monitor team performance.

**Current Status:** ✅ Fully functional with complete admin and team interfaces

## Live Deployment

**URL:** https://handsome-gratitude-production-2a6d.up.railway.app  
**Platform:** Railway (PaaS)  
**Status:** Production-ready and operational  
**Health Check:** `/api/health` - Returns service status

## Technology Stack

### Backend
- **Runtime:** Node.js 22.x
- **Framework:** Express.js
- **Database:** SQLite with multi-tenant architecture
- **Authentication:** Token-based (Base64 encoded)
- **API:** RESTful design with JSON responses

### Frontend
- **Library:** React 18.x
- **Routing:** React Router v6
- **HTTP Client:** Axios
- **Styling:** CSS3 with inline styles
- **Build Tool:** Create React App

### Deployment
- **Platform:** Railway.app
- **CI/CD:** Automatic deployment from Git
- **Build:** `npm install && npm run railway-build`
- **Start:** `npm start`
- **Port:** Dynamic (Railway assigned)

## Features

### 1. Admin Dashboard

Complete administrative interface with full CRUD operations:

#### Product Management ✅
- Create, edit, delete products
- Set pricing (regular & subscription)
- Configure sacks per pallet
- Toggle active/inactive status
- Add product descriptions
- Search and filter products

#### Geographic Areas Management ✅
- Create sales territories
- Define postal codes
- Assign areas to teams
- View unassigned areas
- Reassign areas between teams

#### Team Management ✅
- Create teams with credentials
- Edit team details
- View assigned geographic areas
- See team statistics

#### Customer Management ✅
- Add customers manually
- Edit customer details
- Assign to geographic areas
- Search and filter
- View order history

#### Payment Tracking ✅
- View all orders/payments
- Filter by payment status
- Mark payments as paid/unpaid
- View payment statistics

### 2. Team Member Dashboard

Full-featured interface for sales team members:

#### Customer Management ✅
- View all customers
- Add new customers
- Complete customer information form

#### Order Creation ✅
- Create orders for customers
- Select from active products
- Add multiple products per order
- Track quarter and year

#### Product Catalog ✅
- View all active products
- Product cards with descriptions
- Pricing information

#### Delivery Tracking ✅
- View all orders
- Track delivery status
- Status indicators

### 3. Public Features

#### Customer Self-Service Order Form ✅
- Public-facing order form
- Product selection with pricing
- Shopping cart functionality
- Mock payment integration

## Demo Credentials

**Admin:**
- Username: `admin.stockholm`
- Password: `demo123`

**Team (Norrmalm):**
- Username: `norrmalm`
- Password: `team123`

**Team (Södermalm):**
- Username: `sodermalm`
- Password: `team123`

## API Endpoints

### Authentication
- `POST /api/auth/login` - User authentication

### Products
- `GET /api/products` - List all products
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Geographic Areas
- `GET /api/areas` - List all areas
- `POST /api/areas` - Create area
- `PUT /api/areas/:id` - Update area
- `PUT /api/areas/:id/assign-team` - Assign to team
- `DELETE /api/areas/:id` - Delete area

### Teams
- `GET /api/teams` - List all teams
- `POST /api/teams` - Create team
- `PUT /api/teams/:id` - Update team
- `DELETE /api/teams/:id` - Delete team

### Customers
- `GET /api/customers` - List customers
- `POST /api/customers` - Create customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer

### Orders
- `GET /api/orders` - List orders
- `POST /api/orders` - Create order

### Payments
- `GET /api/payments` - List payments
- `GET /api/payments/stats` - Payment statistics
- `PUT /api/payments/:id/status` - Update payment status

## Development

### Local Setup

```bash
# Install dependencies
npm install
cd frontend && npm install --legacy-peer-deps

# Start backend
npm start

# Start frontend (separate terminal)
cd frontend && npm start
```

### Build Frontend

```bash
cd frontend
npm run build
```

## Deployment

Railway automatically deploys on git push:
1. Build: `npm install && npm run railway-build`
2. Start: `npm start`
3. Health check: `/api/health`

**Build time:** ~5-7 minutes

## Troubleshooting

**Health checks failing:**
- Server waits for database ready before listening
- Check `/api/health` endpoint

**Frontend not building:**
- Use `npm install --legacy-peer-deps`

**Cannot add products/teams:**
- Verify API endpoints are accessible
- Check authentication headers

---

**Last Updated:** February 1, 2026  
**Version:** 1.0.0  
**Status:** ✅ Production Ready
