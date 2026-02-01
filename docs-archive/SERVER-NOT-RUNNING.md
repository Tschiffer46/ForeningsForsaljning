# 🔧 "Cannot Reach Localhost" - Server Not Running

## What Happened

You tried to visit `http://localhost:3001/api/health` and got:
- "Cannot reach localhost"
- "Connection refused"
- "ERR_CONNECTION_REFUSED"
- Or similar error

## What This Means

**THE SERVER IS NOT RUNNING!**

"Cannot reach localhost" means no server is listening on port 3001. You need to start the backend server first.

---

## The Solution (2 Commands)

### Step 1: Navigate to Your Project

```bash
cd ~/GitHub/ForeningsForsaljning-copilot-create-sales-rep-organization-app-2
```

### Step 2: Start the Backend Server

```bash
node backend/server.js
```

**That's it!** The server will start running.

---

## Expected Output

When you run `node backend/server.js`, you should see:

```
Multi-tenant server running on port 3001
Environment: development
Ready to accept connections
Connected to SQLite database
Demo data inserted successfully
Multi-tenant database initialized successfully
```

**This means SUCCESS!** ✅ The server is now running.

---

## Now Test Localhost

### Important: Keep the Terminal Open

The server runs in that terminal window. **Don't close it!**

### Open Your Browser

Visit: `http://localhost:3001/api/health`

### You Should See

```json
{
  "status": "ok",
  "message": "ForeningsForsaljning Multi-Tenant API is running"
}
```

**SUCCESS!** ✅ Your backend is working!

---

## Important Notes

### The Server Must Stay Running

- The terminal where you ran `node backend/server.js` must stay open
- The server process runs in that terminal
- If you close the terminal, the server stops
- This is normal for local development

### How to Use the Server While It's Running

**Option A: Use Your Browser (Easiest)**
- Just open your browser
- Visit localhost URLs
- No terminal needed for testing

**Option B: Open a Second Terminal**
- Keep server terminal open
- Open a new terminal window
- Use for other commands (curl, etc.)

### How to Stop the Server

In the terminal where the server is running:
- Press **Ctrl+C**
- Server stops
- You can start it again anytime

---

## Troubleshooting

### Error: Port 3001 Already in Use

```
Error: listen EADDRINUSE: address already in use :::3001
```

**This means** another server is already running on port 3001.

**Solution:**

Find and kill the process:
```bash
lsof -ti:3001 | xargs kill -9
```

Then try starting your server again:
```bash
node backend/server.js
```

### Error: Cannot Find Module

```
Error: Cannot find module 'express'
```

**This means** dependencies aren't installed.

**Solution:**

Run npm install first:
```bash
npm install
node backend/server.js
```

### Error: SQLite3 Binding

```
Error: dlopen... node_sqlite3.node
```

**This means** SQLite3 needs to be rebuilt for Mac.

**Solution:**

See MAC-SQLITE-FIX.md:
```bash
rm -rf node_modules
npm install
node backend/server.js
```

---

## Test Other Endpoints

Once your server is running, try these:

### Products API
```
http://localhost:3001/api/products
```

Should show 4 products (Lambi & Serla).

### Diagnostic Info
```
http://localhost:3001/diagnostic
```

Shows complete server diagnostic information.

### Main Page
```
http://localhost:3001
```

Shows the landing page.

---

## Your Complete Setup Flow

1. ✅ **Fixed SQLite3** (MAC-SQLITE-FIX.md)
2. ✅ **Installed dependencies** (npm install)
3. ✅ **Started server** (node backend/server.js) ← **YOU ARE HERE**
4. ⏭️ **Test in browser** (http://localhost:3001/api/health)
5. ✅ **Success!**

---

## Quick Reference Card

### Start Server
```bash
cd ~/GitHub/ForeningsForsaljning-copilot-create-sales-rep-organization-app-2
node backend/server.js
```

### Test Health
```
http://localhost:3001/api/health
```

### Stop Server
Press `Ctrl+C` in server terminal

### Restart Server
```bash
node backend/server.js
```

---

## What You're Running

### Backend Server
- **File:** backend/server.js
- **Port:** 3001 (development)
- **Database:** SQLite (local file)
- **Demo Data:** 3 clubs, 5 teams, 7 customers

### Available Endpoints
- `/api/health` - Health check
- `/api/products` - Product list (4 items)
- `/api/customers` - Customer list
- `/api/orders` - Order list
- `/diagnostic` - Server diagnostic info
- Many more (see backend/server.js)

---

## Bottom Line

### The Problem
"Cannot reach localhost" = Server not running

### The Solution
```bash
node backend/server.js
```

### The Result
✅ Server runs on port 3001  
✅ localhost works  
✅ API endpoints respond  
✅ You can test and develop!  

---

## 🚀 START YOUR SERVER NOW!

**Run these commands:**

```bash
cd ~/GitHub/ForeningsForsaljning-copilot-create-sales-rep-organization-app-2
node backend/server.js
```

**Wait for:** "Ready to accept connections"

**Then visit:** http://localhost:3001/api/health

**You'll see:** JSON response with status "ok"

**SUCCESS!** 🎉

---

**Your backend is ready to run!**
