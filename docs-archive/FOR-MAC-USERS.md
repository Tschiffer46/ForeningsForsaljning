# 🎯 FOR YOU: Quick Mac Instructions

## The 3 Steps to Get Backend Running on Your Mac

### Step 1: Find the Project Folder

Open **Finder** and look for a folder called **ForeningsForsaljning**

Check these places:
- Downloads
- Documents  
- Desktop

**Found it?** Great! Remember where it is.

### Step 2: Open Terminal

1. Press **Command (⌘) + Space**
2. Type: **Terminal**
3. Press **Enter**

### Step 3: Navigate and Start

**METHOD A: The Easy Way (Drag & Drop)**

1. In Terminal, type: `cd ` (that's c-d-space, don't press Enter yet!)
2. Drag the **ForeningsForsaljning** folder from Finder into the Terminal window
3. The full path will appear automatically!
4. NOW press **Enter**

**METHOD B: Type the Path**

Type one of these (depending on where you found the folder):

```bash
# If in Downloads:
cd ~/Downloads/ForeningsForsaljning
```
OR
```bash
# If in Documents:
cd ~/Documents/ForeningsForsaljning
```
OR
```bash
# If on Desktop:
cd ~/Desktop/ForeningsForsaljning
```

Then press **Enter**.

### Step 4: Install (First Time Only)

```bash
npm install
```

Press **Enter** and wait. Ignore all the text scrolling by.

**If it says "command not found: npm":**
- Go to https://nodejs.org/
- Download the installer
- Install Node.js
- Come back and try again

### Step 5: Start the Server

```bash
node backend/server.js
```

Press **Enter**.

**You should see:**
```
Multi-tenant server running on port 3001
Connected to SQLite database
Demo data inserted successfully
```

✅ **SUCCESS!** The backend is running!

**⚠️ KEEP THIS TERMINAL WINDOW OPEN!** Don't close it!

### Step 6: Test It

Open **Safari** (or Chrome/Firefox) and type this in the address bar:

```
http://localhost:3001/api/health
```

**You should see:**
```json
{
  "status": "ok",
  "message": "ForeningsForsaljning Multi-Tenant API is running"
}
```

🎉 **IT WORKS!**

## When You're Done

1. Go back to the Terminal
2. Press **Control + C** (not Command!)
3. The server stops

## Troubleshooting

### ❌ "No such file or directory"

You're not in the right place. Try this:

```bash
# See where you are now
pwd

# See what's in your current location
ls

# Start over - go to your home folder
cd ~

# Look in Downloads
ls Downloads/

# If you see ForeningsForsaljning, do this:
cd Downloads/ForeningsForsaljning
```

### ❌ Browser says "Not Found" or "Can't connect"

The server isn't running! Go back to Terminal and make sure:
1. You ran `node backend/server.js`
2. You saw the success message
3. The Terminal is still open
4. You didn't press Control+C

### ❌ "Port 3001 already in use"

Good news - the server is already running somewhere!

**Option 1:** Just use it - open the browser and test

**Option 2:** Stop it and restart:
```bash
# Find what's using the port
lsof -ti:3001

# You'll see a number like "12345"
# Stop it (replace 12345 with your number)
kill -9 12345

# Now start your server
node backend/server.js
```

## Quick Summary

```bash
# 1. Navigate (adjust YOUR path!)
cd ~/Downloads/ForeningsForsaljning

# 2. Install (first time only)
npm install

# 3. Start server
node backend/server.js

# 4. Test in browser
# Open: http://localhost:3001/api/health
```

**That's it!** 

For more details, see: **[MAC-SETUP.md](MAC-SETUP.md)**
