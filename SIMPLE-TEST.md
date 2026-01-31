# How to Test It - Super Simple Version

## What You Need

1. The project folder on your Mac
2. Terminal app
3. Chrome or Safari browser

---

## Step 1: Start the Backend (Terminal Window #1)

```bash
# Navigate to wherever you put the folder
cd ~/Downloads/ForeningsForsaljning   # Or wherever you extracted it

# Install dependencies (first time only)
npm install

# Start the backend server
node backend/server.js
```

**✅ You should see:**
```
Multi-tenant server running on port 3001
Database initialized with demo data
```

**Leave this terminal window OPEN and RUNNING**

---

## Step 2: Start the Frontend (Terminal Window #2)

Open a NEW terminal window, then:

```bash
# Navigate to the project again
cd ~/Downloads/ForeningsForsaljning   # Same folder

# Go into frontend folder
cd frontend

# Install dependencies (first time only)
npm install

# Start the React app
npm start
```

**✅ You should see:**
```
Compiled successfully!
You can now view the app in the browser.
Local: http://localhost:3000
```

**A browser window should open automatically to http://localhost:3000**

**Leave this terminal window OPEN and RUNNING too**

---

## Step 3: Test in Your Browser

### Test 1: Login as Team Member

1. You should see a login page
2. Click **"Team Login"** (the left button)
3. Username: `norrmalm`
4. Password: `team123`
5. Click **Login**

**✅ You should see:** Team Dashboard with "Welcome Team Norrmalm"

### Test 2: Logout and Try Admin

1. Click **Logout** (top right)
2. Click **"Admin Login"** (the right button)
3. Username: `admin.stockholm`
4. Password: `demo123`
5. Click **Login**

**✅ You should see:** Admin Dashboard with "Welcome Eva Karlsson"

### Test 3: Try Customer Order Form

1. Open a new browser tab
2. Go to: http://localhost:3000/customer-order
3. Fill in some fake customer info
4. Click through the form

**✅ You should see:** A nice 4-step order form

---

## That's It! 🎉

If all 3 tests work, the application is running correctly!

---

## Common Problems

**Problem:** "Connection refused" or "Not Found"
**Solution:** Make sure both terminal windows are still running

**Problem:** "Port 3001 already in use"
**Solution:** Backend is already running - that's fine! Just use it.

**Problem:** "Port 3000 already in use"
**Solution:** Frontend is already running - just open http://localhost:3000

**Problem:** "npm: command not found"
**Solution:** Install Node.js from https://nodejs.org (download the LTS version)

---

## Quick Reference

**Backend:** Terminal 1, runs on port 3001
**Frontend:** Terminal 2, runs on port 3000
**Test URLs:**
- Login: http://localhost:3000
- Customer Form: http://localhost:3000/customer-order
- Backend Health: http://localhost:3001/api/health

**Test Credentials:**
- Team: `norrmalm` / `team123`
- Admin: `admin.stockholm` / `demo123`

---

**Need more details?** See FOR-MAC-USERS.md or TESTING-CURRENT-STATE.md
