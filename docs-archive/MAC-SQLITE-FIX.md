# 🔧 Fix SQLite3 Error on Mac

## The Problem

You're seeing this error:
```
Error: dlopen(/Users/.../node_modules/sqlite3/build/Release/node_sqlite3.node, 0x0001): 
slice is not valid mach-o file
ERR_DLOPEN_FAILED
```

## What This Means

**Native Module Incompatibility**

The `sqlite3` module includes native (compiled) code that must be built specifically for:
- Your operating system (macOS)
- Your CPU architecture (Intel or Apple Silicon)
- Your Node.js version

The error occurs because the sqlite3 binary was built for Linux (from Railway or GitHub Actions) but you're trying to run it on macOS.

---

## The Solution: Rebuild Node Modules

### Step 1: Navigate to Your Project

```bash
cd ~/GitHub/ForeningsForsaljning-copilot-create-sales-rep-organization-app-2
```

Or wherever you cloned the repository.

### Step 2: Delete Existing node_modules

```bash
rm -rf node_modules
rm -rf frontend/node_modules
```

This removes all the Linux-compiled binaries.

### Step 3: Reinstall Everything

```bash
npm install
```

This will:
- Download all packages
- **Rebuild sqlite3 for your Mac**
- Compile native modules for macOS

### Step 4: Install Frontend Dependencies

```bash
cd frontend
npm install
cd ..
```

### Step 5: Try Starting the Server

```bash
node backend/server.js
```

**Expected Output:**
```
Multi-tenant server running on port 3001
Environment: development
Ready to accept connections
Connected to SQLite database
Demo data inserted successfully
Multi-tenant database initialized successfully with performance indexes
```

---

## Alternative Fix (If Above Doesn't Work)

### Explicitly Rebuild sqlite3

```bash
npm rebuild sqlite3
```

This specifically rebuilds just the sqlite3 module.

---

## If You're Using Apple Silicon (M1/M2/M3)

### Check Your Architecture

```bash
uname -m
```

**If it says `arm64`** (Apple Silicon):

Make sure you're using an arm64 version of Node.js:

```bash
node --version  # Should work
arch            # Should say arm64
```

**If you installed Node.js via Rosetta** (x86_64 emulation), you might need to reinstall Node.js natively:

1. Download Node.js from: https://nodejs.org
2. Choose the macOS Installer (Apple Silicon)
3. Install it
4. Then run the fix steps above

---

## Complete Fix Commands (Copy-Paste)

```bash
# Navigate to project
cd ~/GitHub/ForeningsForsaljning-copilot-create-sales-rep-organization-app-2

# Remove old modules
rm -rf node_modules
rm -rf frontend/node_modules

# Reinstall everything
npm install

# Install frontend
cd frontend
npm install
cd ..

# Start server
node backend/server.js
```

---

## Expected Results

### After Running `npm install`

You should see:
```
npm install
...
Building sqlite3 for macOS...
...
added 183 packages
```

### After Running `node backend/server.js`

You should see:
```
Multi-tenant server running on port 3001
Environment: development
Ready to accept connections
Connected to SQLite database
Demo data inserted successfully
Multi-tenant database initialized successfully
```

Then visit: **http://localhost:3001/api/health**

Should show:
```json
{
  "status": "ok",
  "message": "ForeningsForsaljning Multi-Tenant API is running"
}
```

---

## Why This Happens

### Native Modules

Some npm packages (like `sqlite3`) include **native code** written in C/C++ that must be compiled for each platform:

- **Linux** (Railway, GitHub Actions): Compiles to `.so` files
- **macOS**: Compiles to `.dylib` or `.node` files  
- **Windows**: Compiles to `.dll` files

These are **NOT interchangeable**.

### When You Clone from GitHub

If you:
1. Clone the repo (gets the code ✅)
2. But `node_modules` was built on Linux ❌
3. Try to run on Mac ❌

You get: "slice is not valid mach-o file"

### The Fix

**Always rebuild node_modules on the platform where you'll run the code!**

```bash
rm -rf node_modules
npm install
```

This ensures native modules are compiled for YOUR system.

---

## Troubleshooting

### Error: "permission denied"

```bash
sudo rm -rf node_modules
sudo npm install
```

### Error: "npm not found"

Install Node.js first:
1. Go to https://nodejs.org
2. Download macOS installer
3. Install Node.js
4. Try again

### Error: Different error about sqlite3

Try the explicit rebuild:
```bash
npm rebuild sqlite3
```

### Still Not Working?

Try clean install with cache clear:
```bash
rm -rf node_modules
rm -rf frontend/node_modules
npm cache clean --force
npm install
cd frontend && npm install && cd ..
node backend/server.js
```

---

## Quick Reference

### One-Line Fix

```bash
rm -rf node_modules frontend/node_modules && npm install && cd frontend && npm install && cd .. && node backend/server.js
```

---

## After It Works

Once you see:
```
Multi-tenant server running on port 3001
Ready to accept connections
```

**Test it:**

1. Open browser
2. Visit: http://localhost:3001/api/health
3. Should see: `{"status":"ok",...}`

**Success!** ✅

---

## Summary

**Problem:** Native sqlite3 module built for Linux, not macOS

**Solution:** Delete `node_modules` and run `npm install` on your Mac

**Time:** 2-3 minutes

**Result:** Working backend on your Mac!

---

**Run the commands above and your app will work!** 🚀
