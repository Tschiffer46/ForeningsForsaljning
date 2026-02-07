# 🚀 Start the Backend Server

## Quick Start (3 Steps)

### Step 1: Open Terminal
- **Windows:** Search for "cmd" or "PowerShell"
- **Mac:** Open "Terminal" app
- **Linux:** Open "Terminal"

### Step 2: Run These Commands

Copy and paste **each line** one at a time:

```bash
cd /home/runner/work/ForeningsForsaljning/ForeningsForsaljning
```
Press Enter. Then:

```bash
npm install
```
Press Enter. Wait for it to finish (first time only). Then:

```bash
node backend/server.js
```
Press Enter.

### Step 3: Confirm It's Working

You should see:
```
Multi-tenant server running on port 3001
Connected to SQLite database
Demo data inserted successfully
```

✅ **The server is now running!**

## ⚠️ IMPORTANT: Keep Terminal Open!

**DO NOT CLOSE THE TERMINAL!** The server only runs while the terminal is open.

## Now You Can Test!

Open your browser and go to:
```
http://localhost:3001/api/health
```

You should see:
```json
{
  "status": "ok",
  "message": "ForeningsForsaljning Multi-Tenant API is running"
}
```

## To Stop the Server

When you're done testing:
1. Go to the terminal running the server
2. Press **Ctrl + C** (or **Command + C** on Mac)

## Common Problems

### Problem: "Cannot find module 'express'"
**Solution:** Run `npm install` first

### Problem: Browser shows "Not Found"
**Solution:** The server isn't running. Follow the 3 steps above.

### Problem: "Port 3001 is already in use"
**Solution:** The server is already running. Check for other terminal windows.

## What Next?

Once the server is running, see:
- **[HOW-TO-TEST.md](HOW-TO-TEST.md)** - How to test the API
- **[BACKEND-TESTING.md](BACKEND-TESTING.md)** - Complete test examples
