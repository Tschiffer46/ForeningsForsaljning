# Railway.app Deployment Configuration

## Backend Service Configuration

**Service Name:** foreningsforsaljning-backend

**Build Settings:**
- Builder: Nixpacks (auto-detected)
- Build Command: `npm install`
- Start Command: `npm start`

**Environment Variables:**
```
NODE_ENV=production
PORT=3001
```

**Persistent Volume:**
- Mount Path: `/app/backend`
- Size: 1GB (for SQLite database)

## Frontend Service Configuration

**Service Name:** foreningsforsaljning-frontend

**Build Settings:**
- Root Directory: `/frontend`
- Build Command: `npm install && npm run build`
- Start Command: `npx serve -s build -l $PORT`

**Environment Variables:**
```
REACT_APP_API_URL=https://[your-backend-service].railway.app
```

## Deployment Steps

1. Push code to GitHub
2. Connect Railway to GitHub repo
3. Create backend service (auto-detected from root package.json)
4. Create frontend service (manually specify /frontend directory)
5. Add persistent volume to backend
6. Configure environment variables
7. Deploy!

## Cost Estimate

- Free tier: $5/month credit (good for testing)
- Hobby: ~$10-15/month (5-10 clubs)
- Production: ~$20-50/month (10-50 clubs)

## Support

Railway Discord: https://discord.gg/railway
Documentation: https://docs.railway.app
