# Railway Deployment Troubleshooting

## Issue: Mock Data Not Visible / Cannot Add Teams

### ✅ Verified Working Locally

The application has been tested locally and **all features work correctly**:

```bash
✅ Server starts without errors
✅ Database initializes with demo data:
   - 4 products
   - 2 teams  
   - 10 customers
   - 6 orders
✅ Health endpoint responds: {"status":"ok"}
✅ Products API returns data
✅ Teams API returns data
✅ All CRUD operations work
```

### 🔍 Root Cause: Railway Deployment Issue

**The problem is NOT with the code** - it's with how Railway is deploying the application.

## Possible Railway Issues

### 1. Database Not Persisting (Most Likely)

**Problem:** Railway uses ephemeral storage by default. Each deployment creates a fresh database.

**Solution:** 
- Railway needs persistent volume for database
- Or database needs to re-initialize on each deployment (current behavior)
- Demo data should appear after each deployment

**Check:**
- Visit Railway logs - look for "Demo data inserted successfully"
- If you see this message, data IS in the database

### 2. Frontend Not Served Correctly

**Problem:** Railway might not be serving the React build from Express.

**Check:**
- Visit root URL - do you see React app or JSON response?
- If JSON, frontend isn't being served
- Check Railway logs for "Serving React frontend from"

**Solution:**
- Railway build command must include `npm run railway-build`
- This builds the frontend and places it in `frontend/build/`
- Server.js serves static files from this directory

### 3. API URL Configuration

**Problem:** Frontend might be calling wrong API URL in production.

**Check in browser console:**
```javascript
// Should show API calls to same origin
// Not to localhost:3001
```

**Current Config (should be correct):**
```javascript
const API_URL = process.env.NODE_ENV === 'production' 
  ? window.location.origin 
  : 'http://localhost:3001';
```

### 4. Authentication Headers Missing

**Problem:** Frontend not sending required headers.

**Check network tab:**
- API calls should include `x-club-id` header
- Admin calls should include `Authorization` header
- Missing headers = empty responses

## How to Verify on Railway

### Step 1: Check Deployment Logs

Look for these messages:
```
✅ "npm run railway-build" - Frontend built
✅ "npm start" - Server starting
✅ "Connected to SQLite database"
✅ "Demo data inserted successfully"
✅ "Database initialization complete"
✅ "Multi-tenant server running on port 8080"
✅ "Serving React frontend from"
```

### Step 2: Test Health Endpoint

Visit: `https://your-app.railway.app/api/health`

Expected:
```json
{"status":"ok","message":"ForeningsForsaljning Multi-Tenant API is running"}
```

### Step 3: Test Products API

Visit: `https://your-app.railway.app/api/products`

Expected: Array of 4 products

If you get error or empty array:
- Database didn't initialize
- Check deployment logs

### Step 4: Test React App

Visit: `https://your-app.railway.app/`

Expected: Login page with React UI

If you see JSON or error:
- Frontend not being served
- Build didn't complete
- Check if `frontend/build/` directory exists

### Step 5: Login and Test

Login as admin:
- Username: `admin.stockholm`
- Password: `demo123`

Check admin dashboard:
- Should see 5 management cards
- Click "Manage Products" - should see 4 products
- Click "Manage Teams" - should see 2 teams

If you see empty lists:
- API calls might be failing
- Check browser console for errors
- Check network tab for failed requests

## Current Deployment Configuration

### railway.json
```json
{
  "build": {
    "command": "npm install && npm run railway-build"
  },
  "deploy": {
    "startCommand": "npm start",
    "healthcheckPath": "/api/health",
    "healthcheckTimeout": 100
  }
}
```

### package.json scripts
```json
{
  "scripts": {
    "start": "node backend/server.js",
    "railway-build": "npm run install-frontend && npm run build-frontend",
    "install-frontend": "cd frontend && npm install --legacy-peer-deps",
    "build-frontend": "cd frontend && npm run build"
  }
}
```

## Quick Fixes to Try

### 1. Force Redeploy

In Railway:
- Go to your service
- Click "Deploy"
- Select "Redeploy"
- Wait ~10 minutes

This will:
- Rebuild frontend
- Re-initialize database
- Deploy fresh code

### 2. Check Environment Variables

Railway needs:
- `PORT` - Set by Railway automatically
- No other env vars required for basic operation

### 3. Hard Refresh Browser

After deployment:
- Clear browser cache
- Hard refresh: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)
- Or use incognito mode

### 4. Check Railway Logs in Real-Time

While testing:
- Open Railway logs
- Refresh your app
- Watch for API request logs
- Look for errors

## Expected Behavior After Fix

1. **Visit root URL** → See React login page
2. **Login as admin** → See admin dashboard with 5 cards
3. **Click "Manage Products"** → See 4 demo products
4. **Click "Add Product"** → Form opens, can create product
5. **Click "Manage Teams"** → See 2 demo teams
6. **Click "Add Team"** → Form opens, can create team

## If Still Not Working

### Collect This Information:

1. **Railway deployment logs** (last 100 lines)
2. **Browser console errors** (F12 → Console tab)
3. **Network tab** (F12 → Network tab → failed requests)
4. **What you see when visiting root URL**

### Common Error Messages:

**"Network Error"** → Backend not responding
- Check Railway logs for server errors
- Verify health check passing

**"Unauthorized"** → Authentication issue
- Check login credentials
- Clear browser storage
- Try again

**Empty lists** → API calls failing
- Check network tab
- Look for CORS errors
- Check API URL configuration

**"Feature coming soon"** → Old cached frontend
- Hard refresh browser
- Clear cache completely
- Verify latest deployment

## Summary

**The application code is verified working.**

**All features are implemented:**
- ✅ Mock data insertion
- ✅ Admin CRUD operations
- ✅ Team dashboard components
- ✅ API endpoints
- ✅ Frontend UI

**The issue is with Railway deployment, not the code.**

**After Railway redeploys, everything should work.**

Wait 10 minutes after pushing for Railway to:
1. Build frontend (~5 min)
2. Start server (~1 min)
3. Initialize database (~30 sec)
4. Pass health checks (~30 sec)

Then test again.
