# 🎯 How to Test the Backend - Visual Guide

## The Simplest Way (Copy These 3 Commands)

Open your terminal and copy-paste these **3 commands** one at a time:

```bash
# Command 1: Go to the project folder
cd /home/runner/work/ForeningsForsaljning/ForeningsForsaljning

# Command 2: Install everything needed (first time only)
npm install

# Command 3: Start the backend server
node backend/server.js
```

**You should see this:**
```
Multi-tenant server running on port 3001
Connected to SQLite database
Database initialized successfully
```

✅ **SUCCESS!** The backend is now running!

---

## Now Test It!

### Option 1: Test in Your Browser (EASIEST!)

1. **Open any web browser** (Chrome, Firefox, Safari, Edge)

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

**✅ If you see this = Backend is working!** 🎉

---

### Option 2: Run the Test Script

**Open a SECOND terminal** (keep the first one running!) and run:

```bash
cd /home/runner/work/ForeningsForsaljning/ForeningsForsaljning
./test-backend.sh
```

**You should see:**
```
✅ Found project files
✅ Node.js is installed
✅ Backend is running
✅ All Tests Passed!
```

---

## What Just Happened?

```
┌─────────────────────────────────────┐
│  Your Computer                      │
│                                     │
│  ┌───────────────────────────┐     │
│  │ Terminal 1                │     │
│  │ Running: node backend...  │     │
│  │ Backend listening on      │     │
│  │ http://localhost:3001     │     │
│  └───────────────────────────┘     │
│                                     │
│  ┌───────────────────────────┐     │
│  │ Browser OR Terminal 2     │     │
│  │ Sends request to          │     │
│  │ http://localhost:3001     │     │
│  │                           │     │
│  │ Gets response back!       │     │
│  └───────────────────────────┘     │
└─────────────────────────────────────┘
```

---

## More Tests You Can Try

### Test 1: Login as Super Admin

**In your browser DevTools (press F12), go to Console tab and paste:**

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
.then(r => r.json())
.then(data => console.log(data))
```

**You should see the super admin user info!**

### Test 2: View All Clubs

**In browser DevTools Console:**

```javascript
fetch('http://localhost:3001/api/super-admin/clubs', {
  headers: { 'x-user-role': 'super_admin' }
})
.then(r => r.json())
.then(data => console.log(data))
```

**You should see 3 clubs (Stockholm, Göteborg, Malmö)!**

---

## Troubleshooting

### ❌ "Cannot find module 'express'"

**Fix:** You didn't install dependencies. Run:
```bash
npm install
```

### ❌ "Port 3001 is already in use"

**Fix:** The backend is already running somewhere! 
- Check for other terminal windows
- Or restart your computer

### ❌ "Connection refused"

**Fix:** The backend isn't running. Make sure you:
1. Ran `node backend/server.js`
2. Saw the "server running" message
3. Kept that terminal window open

### ❌ Terminal closes when I run the command

**Fix:** That means there's an error. Try:
```bash
node backend/server.js 2>&1 | tee server.log
```
Then check `server.log` for errors.

---

## When You're Done Testing

To stop the backend:

1. Go to the terminal running the server
2. Press **Ctrl + C** (or **Command + C** on Mac)
3. The server stops

---

## 📚 Want More Details?

- **[QUICK-START.md](QUICK-START.md)** - Cheat sheet with all commands
- **[BEGINNER-GUIDE.md](BEGINNER-GUIDE.md)** - Complete walkthrough
- **[BACKEND-TESTING.md](BACKEND-TESTING.md)** - 12 different API tests

---

## Summary: You Only Need These 3 Commands!

```bash
cd /home/runner/work/ForeningsForsaljning/ForeningsForsaljning
npm install
node backend/server.js
```

Then open browser: `http://localhost:3001/api/health`

**That's it!** 🚀
