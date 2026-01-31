# Quick Start Cheat Sheet

## ⚡ Super Quick Start (Copy & Paste These)

### 1️⃣ Open Terminal and Run These 3 Commands:

```bash
cd /home/runner/work/ForeningsForsaljning/ForeningsForsaljning
npm install
node backend/server.js
```

### 2️⃣ Test in Your Browser:

Open your browser and go to:
```
http://localhost:3001/api/health
```

**✅ You should see:** `{"status":"ok", ...}`

---

## 🧪 Quick Tests (Copy & Paste)

Open **a second terminal** and run:

```bash
cd /home/runner/work/ForeningsForsaljning/ForeningsForsaljning
./test-backend.sh
```

Or test individual endpoints:

### Test 1: Health Check
```bash
curl http://localhost:3001/api/health
```

### Test 2: Login as Super Admin
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"superadmin","password":"superadmin123","userType":"super_admin"}'
```

### Test 3: View All Clubs
```bash
curl http://localhost:3001/api/super-admin/clubs \
  -H "x-user-role: super_admin"
```

### Test 4: Login as Club Admin
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin.stockholm","password":"demo123","userType":"admin"}'
```

---

## 🔐 Test Accounts

| Type | Username | Password |
|------|----------|----------|
| Super Admin | `superadmin` | `superadmin123` |
| Stockholm Admin | `admin.stockholm` | `demo123` |
| Göteborg Admin | `admin.goteborg` | `demo123` |
| Malmö Admin | `admin.malmo` | `demo123` |
| Team (any) | `norrmalm`, `centrum`, etc. | `team123` |

---

## 🛑 Stop the Backend

In the terminal running the server, press:
- **Windows/Linux:** `Ctrl + C`
- **Mac:** `Command + C`

---

## 📚 More Help

- **Complete Guide:** See `BEGINNER-GUIDE.md`
- **All Tests:** See `BACKEND-TESTING.md`
- **Demo Data:** See `STATUS-DEMO.md`

---

## ❓ Troubleshooting

### "Cannot find module 'express'"
👉 Run: `npm install`

### "Port 3001 already in use"
👉 Backend already running! Check other terminal windows

### "Connection refused"
👉 Backend not started. Run: `node backend/server.js`

### Terminal shows nothing after running server
👉 That's correct! It's running. Open a NEW terminal to test.

---

## 🎯 What Each File Does

```
ForeningsForsaljning/
├── backend/
│   ├── server.js         ← The backend server (START THIS)
│   └── database.js       ← Database setup (auto-runs)
├── BEGINNER-GUIDE.md     ← Read this if you're new
├── BACKEND-TESTING.md    ← All test scenarios
├── QUICK-START.md        ← You are here!
└── test-backend.sh       ← Automated test script
```

---

## 💡 Understanding the URLs

- `http://` - Protocol (how to talk)
- `localhost` - Your own computer
- `3001` - Port number (the "door")
- `/api/health` - The endpoint (which function to call)

**Full URL:** `http://localhost:3001/api/health`

---

## ✅ Success Checklist

- [ ] Opened terminal
- [ ] Navigated to project folder
- [ ] Ran `npm install`
- [ ] Started server with `node backend/server.js`
- [ ] Saw "server running" message
- [ ] Tested in browser at `http://localhost:3001/api/health`
- [ ] Saw success message

**All checked?** You're ready to test! 🎉
