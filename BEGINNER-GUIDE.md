# Beginner's Guide: How to Test the Backend

## What is "the backend"?

The **backend** is the server part of the application that:
- Stores data in a database
- Handles login requests
- Processes orders, customers, teams, etc.
- Runs on your computer and listens for requests

Think of it like a restaurant kitchen - it does all the work behind the scenes!

---

## Step 1: Open a Terminal (Command Line)

### On Windows:
1. Press `Windows Key + R`
2. Type `cmd` and press Enter
3. A black window will open - this is your terminal!

### On Mac:
1. Press `Command + Space`
2. Type "Terminal" and press Enter
3. A window will open

### On Linux:
1. Press `Ctrl + Alt + T`
2. Terminal opens

---

## Step 2: Navigate to the Project Folder

**⚠️ IMPORTANT:** The project folder location depends on where YOU downloaded/saved it!

### Find Your Project First

**On Mac:**
1. Open **Finder**
2. Look in: Downloads, Documents, or Desktop
3. Find the folder named **ForeningsForsaljning**

**On Windows:**
1. Open **File Explorer**
2. Look in: Downloads, Documents, or Desktop
3. Find the folder named **ForeningsForsaljning**

### Navigate to the Project

**On Mac, use one of these (depending on where you found it):**

```bash
# If in Downloads:
cd ~/Downloads/ForeningsForsaljning

# If in Documents:
cd ~/Documents/ForeningsForsaljning

# If on Desktop:
cd ~/Desktop/ForeningsForsaljning
```

**On Windows:**

```bash
# If in Downloads:
cd C:\Users\YourUsername\Downloads\ForeningsForsaljning

# If in Documents:
cd C:\Users\YourUsername\Documents\ForeningsForsaljning

# If on Desktop:
cd C:\Users\YourUsername\Desktop\ForeningsForsaljning
```

**💡 Tip:** In Mac Terminal, you can drag the folder from Finder into Terminal to automatically type the path!

**Check you're in the right place:**
```bash
# Mac/Linux:
ls

# Windows:
dir
```

You should see folders like: `backend`, `frontend`, and files like `package.json`, `README.md`

---

## Step 3: Install Dependencies (One-Time Setup)

The backend needs some "helper programs" (called dependencies) to work. Install them:

```bash
npm install
```

**What this does:** Downloads all the tools the backend needs (like installing apps on your phone).

**This will take 1-2 minutes.** You'll see lots of text scrolling - that's normal!

**You'll know it's done when** you see your command prompt again (the `$` or `>` symbol).

---

## Step 4: Start the Backend Server

Now let's start the backend! Run this command:

```bash
node backend/server.js
```

**What this does:** Starts the backend server - it's now running and waiting for requests!

**You should see:**
```
Multi-tenant server running on port 3001
Connected to SQLite database
Database initialized successfully
```

**✅ SUCCESS!** Your backend is now running!

**IMPORTANT:** Keep this terminal window open! If you close it, the backend stops.

---

## Step 5: Test the Backend (3 Easy Methods)

Now the backend is running on your computer at `http://localhost:3001`

### Method 1: Test in Your Web Browser (Easiest!)

1. **Open your web browser** (Chrome, Firefox, Safari, Edge)

2. **Type this in the address bar:**
   ```
   http://localhost:3001/api/health
   ```

3. **Press Enter**

4. **You should see:**
   ```json
   {
     "status": "ok",
     "message": "ForeningsForsaljning Multi-Tenant API is running"
   }
   ```

**✅ If you see this, the backend is working perfectly!**

---

### Method 2: Use Curl in Terminal (More Advanced)

**Open a NEW terminal window** (keep the first one running the server!)

**Navigate to the project again:**
```bash
cd /home/runner/work/ForeningsForsaljning/ForeningsForsaljning
```

**Test the health check:**
```bash
curl http://localhost:3001/api/health
```

**You should see:**
```json
{"status":"ok","message":"ForeningsForsaljning Multi-Tenant API is running"}
```

---

### Method 3: Test Login (Try it in Browser or Curl)

Let's test logging in as a super admin!

#### Using Browser with a Tool:

1. Open your browser
2. Press `F12` to open Developer Tools
3. Click the "Console" tab
4. Copy and paste this code and press Enter:

```javascript
fetch('http://localhost:3001/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'superadmin',
    password: 'superadmin123',
    userType: 'super_admin'
  })
})
.then(response => response.json())
.then(data => console.log(data))
```

**You should see a response with user information!**

#### Using Curl:

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"superadmin","password":"superadmin123","userType":"super_admin"}'
```

**You should see:**
```json
{
  "user": {
    "id": 1,
    "username": "superadmin",
    "full_name": "Platform Administrator"
  },
  "role": "super_admin",
  "token": "c3VwZXJfYWRtaW46MQ=="
}
```

---

## Understanding "localhost" and "port 3001"

- **localhost** = Your own computer (like calling yourself on the phone)
- **3001** = The "door number" where the backend is listening
- **http://localhost:3001** = "Talk to the backend running on my computer"

---

## Common Problems and Solutions

### Problem: "Cannot find module 'express'"

**Solution:** You didn't install dependencies. Run:
```bash
npm install
```

### Problem: "Port 3001 is already in use"

**Solution:** The backend is already running! Either:
- Find the other terminal window where it's running, OR
- Stop it by running: `pkill -f "node backend/server.js"`, then start again

### Problem: "Connection refused" when testing

**Solution:** The backend isn't running. Make sure you:
1. Started it with `node backend/server.js`
2. See the "server running" message
3. Keep that terminal window open

### Problem: "curl: command not found"

**Solution:** You're on Windows and don't have curl. Use:
- Method 1 (Browser) instead, OR
- Install Git Bash which includes curl

---

## Quick Reference: All Test Accounts

Once the backend is running, you can test with these accounts:

### Super Admin (Platform Manager)
- Username: `superadmin`
- Password: `superadmin123`
- Can see: All 3 clubs

### Stockholm Club Admin
- Username: `admin.stockholm`
- Password: `demo123`
- Can see: Only Stockholm data

### Göteborg Club Admin
- Username: `admin.goteborg`
- Password: `demo123`
- Can see: Only Göteborg data

### Team Login (Sales Rep)
- Username: `norrmalm` (or `sodermalm`, `centrum`, `hisingen`, `vastra`)
- Password: `team123`
- Can see: Only their club's data

---

## More Tests You Can Try

See the file **BACKEND-TESTING.md** for 12 different tests you can run!

Quick example - View all clubs (Super Admin only):

```bash
curl http://localhost:3001/api/super-admin/clubs \
  -H "x-user-role: super_admin"
```

---

## How to Stop the Backend

When you're done testing:

1. Go to the terminal window running the backend
2. Press `Ctrl + C` (Windows/Linux) or `Command + C` (Mac)
3. You'll see the prompt return - the backend is now stopped

---

## Visual Diagram

```
Your Computer
├── Terminal 1: Backend Server Running
│   └── node backend/server.js
│       └── Listening on http://localhost:3001
│
├── Terminal 2 OR Browser: Testing
│   └── Send requests to http://localhost:3001
│       └── Backend responds with data
```

---

## Next Steps

1. ✅ Start the backend (`node backend/server.js`)
2. ✅ Test health check in browser (`http://localhost:3001/api/health`)
3. ✅ Try logging in with test accounts
4. ✅ Explore BACKEND-TESTING.md for more tests

**Need help?** Check the "Common Problems" section above!

---

## Summary: The 3 Essential Commands

```bash
# 1. Go to project folder
cd /home/runner/work/ForeningsForsaljning/ForeningsForsaljning

# 2. Install dependencies (first time only)
npm install

# 3. Start the backend
node backend/server.js
```

Then test in your browser: `http://localhost:3001/api/health`

**That's it! You're testing the backend!** 🎉
