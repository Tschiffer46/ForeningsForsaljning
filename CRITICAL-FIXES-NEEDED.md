# CRITICAL FIXES NEEDED

## Problems Identified

1. **No mock data visible** (except products)
2. **Team creation doesn't save**
3. **Database initialization issues**

## Root Causes

### Issue 1: Database Demo Data Not Inserting
- Demo data INSERT statements may have SQL errors
- Try-catch blocks might be suppressing errors
- Column name mismatches between schema and INSERT statements

### Issue 2: API Client Missing Headers
- Frontend API calls missing `x-club-id` header
- Backend requires this header for multi-tenant filtering
- Without it, requests fail or return empty results

## Required Fixes

### Fix 1: Database (backend/database.js)
Need to verify demo data INSERT statements match schema exactly:
- Check geographical_areas columns
- Check customers columns (area_id vs geographic_area_id)
- Remove error-suppressing try-catch blocks
- Add proper error logging

### Fix 2: API Client (frontend/src/utils/api.js)
Need to add headers to all requests:
```javascript
const headers = {
  'Content-Type': 'application/json',
  'x-club-id': '1',
  ...(token && { Authorization: token })
};
```

## Testing Checklist

After fixes:
- [ ] Server starts without errors
- [ ] Demo data inserts successfully (check logs)
- [ ] GET /api/teams returns 2 teams
- [ ] GET /api/customers returns 10 customers
- [ ] GET /api/areas returns 4 areas
- [ ] POST /api/teams creates and persists team
- [ ] All CRUD operations work

## Current Status

This document created to track what needs to be fixed.
Next step: Apply actual code fixes to database.js and api.js.
