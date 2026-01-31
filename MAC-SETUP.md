# 🍎 Mac Setup Guide - Start Backend Server

## For Mac Users - Complete Beginner's Guide

### Step 1: Find Where You Downloaded the Project

The project folder is probably in one of these places:
- **Downloads folder**: `~/Downloads/ForeningsForsaljning`
- **Documents folder**: `~/Documents/ForeningsForsaljning`
- **Desktop**: `~/Desktop/ForeningsForsaljning`

**How to check:**
1. Open **Finder**
2. Look in Downloads, Documents, or Desktop
3. Find the folder named **ForeningsForsaljning**
4. Remember where it is!

### Step 2: Open Terminal

1. Press **Command (⌘) + Space** to open Spotlight
2. Type **Terminal**
3. Press **Enter**

You should see a window with a command prompt.

### Step 3: Navigate to the Project

Type `cd` (with a space after it), then drag the **ForeningsForsaljning** folder from Finder into the Terminal window. This will automatically fill in the correct path!

**Example:**
```bash
cd /Users/yourname/Downloads/ForeningsForsaljning
```

Press **Enter**.

**Alternative method - type the path manually:**

If you found the folder in Downloads:
```bash
cd ~/Downloads/ForeningsForsaljning
```

If it's in Documents:
```bash
cd ~/Documents/ForeningsForsaljning
```

If it's on Desktop:
```bash
cd ~/Desktop/ForeningsForsaljning
```

**Verify you're in the right place:**
```bash
ls
```

You should see files like: `backend`, `frontend`, `package.json`, `README.md`

### Step 4: Install Dependencies (First Time Only)

```bash
npm install
```

Press **Enter** and wait. You'll see lots of text. This is normal!

**If you get "command not found: npm":**

You need to install Node.js first:
1. Go to https://nodejs.org/
2. Download the **LTS version** (recommended)
3. Run the installer
4. Restart Terminal
5. Try `npm install` again

### Step 5: Start the Backend Server

```bash
node backend/server.js
```

Press **Enter**.

**Success looks like this:**
```
Multi-tenant server running on port 3001
Connected to SQLite database
Demo data inserted successfully
```

✅ **The server is running!** Keep this Terminal window open!

### Step 6: Test in Browser

1. Open **Safari**, **Chrome**, or **Firefox**
2. Type this in the address bar:
   ```
   http://localhost:3001/api/health
   ```
3. Press **Enter**

**You should see:**
```json
{
  "status": "ok",
  "message": "ForeningsForsaljning Multi-Tenant API is running"
}
```

🎉 **Success!** Your backend is working!

## Mac-Specific Tips

### Using Two Terminal Windows

You might need two terminals - one for the server, one for testing:

1. **Terminal 1:** Running the server (`node backend/server.js`)
2. **Terminal 2:** Running test commands

**To open a second terminal:**
- Press **Command (⌘) + N** in Terminal
- Or go to **Shell → New Window**

### Stopping the Server

When you're done:
1. Go to the Terminal running the server
2. Press **Control + C** (note: Control, not Command!)
3. The server will stop

### Finding Your Username

If you need to know your Mac username:
```bash
whoami
```

This shows your username. Your home folder is `/Users/yourusername`

## Troubleshooting for Mac

### ❌ "No such file or directory"

You're not in the right folder. Try:

```bash
# See where you are
pwd

# Go to your home folder first
cd ~

# Look for the project
ls Downloads/
ls Documents/
ls Desktop/

# Navigate to wherever you found it
cd Downloads/ForeningsForsaljning
```

### ❌ "Permission denied"

Run with sudo (it will ask for your Mac password):
```bash
sudo npm install
```

Or fix permissions:
```bash
sudo chown -R $(whoami) ~/.npm
```

### ❌ "command not found: node"

Install Node.js:
1. Go to https://nodejs.org/
2. Download macOS installer
3. Install it
4. Restart Terminal
5. Try again

### ❌ "Port 3001 already in use"

The server is already running somewhere! 

**Option 1:** Find and use it (the server is working!)

**Option 2:** Stop it and restart:
```bash
# Find what's using port 3001
lsof -ti:3001

# Stop it (replace XXXX with the number from above)
kill -9 XXXX

# Start your server again
node backend/server.js
```

## Quick Reference

**Every time you want to start the server:**

```bash
# Navigate to project (adjust path to YOUR location)
cd ~/Downloads/ForeningsForsaljning

# Start server
node backend/server.js

# Test in browser
open http://localhost:3001/api/health
```

The `open` command will automatically open your default browser!

## Need More Help?

- **[HOW-TO-TEST.md](HOW-TO-TEST.md)** - Testing instructions
- **[BACKEND-TESTING.md](BACKEND-TESTING.md)** - All API endpoints
- **[QUICK-START.md](QUICK-START.md)** - Command reference

## Common Mac Keyboard Shortcuts

- **⌘ + Space** - Spotlight (search)
- **⌘ + N** - New Terminal window
- **⌘ + T** - New Terminal tab
- **Control + C** - Stop running command
- **⌘ + Q** - Quit application
- **⌘ + ,** - Preferences
