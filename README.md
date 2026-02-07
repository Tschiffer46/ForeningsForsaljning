# FöreningsFörsäljning - Multi-Tenant Sales Management

A modern web application for managing sales operations across multiple sports clubs and organizations. Built with Node.js, Express, React, and SQLite with full multi-tenant architecture.

## 🚀 Live Demo

**Production URL:** https://handsome-gratitude-production-2a6d.up.railway.app

**Demo Credentials:**
- Admin: `admin.stockholm` / `demo123`
- Team: `norrmalm` / `team123`

## 📚 Documentation

**Complete Documentation:**
- **[APPLICATION.md](APPLICATION.md)** - Full application documentation, architecture, and API reference
- **[IDEAL-PLAN.md](IDEAL-PLAN.md)** - Best practices and project planning guide
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Deployment instructions
- **[RAILWAY.md](RAILWAY.md)** - Railway-specific configuration

**Historical Documentation:**
- **[docs-archive/](docs-archive/)** - Troubleshooting guides and development process docs

## Key Features

- **Multi-Tenant Architecture** - Complete data isolation between organizations
- **Role-Based Access** - Super admin, club admin, and team member roles
- **Customer Management** - Full CRUD for customer relationships
- **Order Management** - Track orders with payment and delivery status
- **Product Catalog** - Manage products with pricing
- **Analytics & Reporting** - Sales statistics and performance metrics
- **Customer Self-Service** - Public order form for direct purchases

## Technology Stack

- **Backend:** Node.js, Express.js, SQLite
- **Frontend:** React 18, React Router
- **Deployment:** Railway.app with automatic deploys
- **Authentication:** JWT token-based

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Git (for cloning)

### Installation

```bash
# Clone the repository
git clone https://github.com/Tschiffer46/ForeningsForsaljning.git
cd ForeningsForsaljning

# Install dependencies
npm install

# Start the backend server
node backend/server.js
```

Backend runs on `http://localhost:3001`

**Test it:** Open `http://localhost:3001/api/health`

### Running the Frontend

```bash
cd frontend
npm install
npm start
```

Frontend runs on `http://localhost:3000`

## API Quick Reference

**Authentication:**
- `POST /api/login` - User login

**Customers:**
- `GET /api/customers` - List customers
- `POST /api/customers` - Create customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer

**Orders:**
- `GET /api/orders` - List orders
- `POST /api/orders` - Create order
- `PUT /api/orders/:id/status` - Update order status

**Products:**
- `GET /api/products` - List products

**Analytics:**
- `GET /api/stats/sales` - Sales statistics
- `GET /api/stats/user-performance` - User performance

See [APPLICATION.md](APPLICATION.md) for complete API documentation.

## Project Structure

```
ForeningsForsaljning/
├── backend/
│   ├── server.js           # Express server & routes
│   ├── database.js         # Database schema & init
│   └── multi-tenant-sales.db
├── frontend/
│   ├── src/
│   │   ├── App.js         # Main React component
│   │   └── index.js       # Entry point
│   └── package.json
├── package.json
├── railway.json
├── APPLICATION.md          # Complete documentation
└── README.md              # This file
```

## Deployment

The application is configured for Railway deployment with automated builds.

**Current deployment:** https://handsome-gratitude-production-2a6d.up.railway.app

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

## Demo Data

The application includes demo organizations, users, and products for testing:

- **Organizations:** 3 demo clubs (Stockholm, Gothenburg, Malmö)
- **Users:** Admin and team accounts with demo credentials
- **Products:** 4 paper products with pricing

See [APPLICATION.md](APPLICATION.md) for complete demo credentials list.

## Development Status

**Current Version:** 1.0.0  
**Status:** Production-ready, single-tenant mode functional  

**Implemented:**
- ✅ Multi-tenant backend architecture
- ✅ Authentication and authorization
- ✅ Customer and order management
- ✅ Product catalog
- ✅ Analytics and reporting
- ✅ Railway deployment
- ✅ Health check monitoring

**Planned (Phase 2):**
- Super admin dashboard UI
- Multi-organization switching
- Advanced analytics
- Email notifications

## Contributing

This is a custom application. For questions or issues, please create an issue in the repository.

## License

ISC

## Support

For complete documentation, see [APPLICATION.md](APPLICATION.md).

For development guidance and best practices, see [IDEAL-PLAN.md](IDEAL-PLAN.md).

---

**Last Updated:** February 1, 2026  
**Live Demo:** https://handsome-gratitude-production-2a6d.up.railway.app

