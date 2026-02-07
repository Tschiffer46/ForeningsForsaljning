# Deployment Guide

## Recommended Platform: Railway.app

Railway.app offers the easiest deployment experience with low cost and good scalability.

### Quick Start with Railway

#### 1. Prepare Your Repository

The application is already configured for deployment. Ensure all files are committed to your GitHub repository.

#### 2. Deploy to Railway

1. **Sign up** at [Railway.app](https://railway.app) (free, no credit card needed)

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Connect your GitHub account
   - Select the `ForeningsForsaljning` repository

3. **Configure Services**
   
   Railway will detect your Node.js application. You need to set up two services:

   **Backend Service:**
   - Railway auto-detects `package.json`
   - Set start command: `npm start`
   - Port: 3001 (auto-detected)

   **Frontend Service:**
   - Create a second service
   - Root directory: `frontend`
   - Build command: `npm run build`
   - Start command: `npx serve -s build -l $PORT`

#### 3. Set Environment Variables

In Railway dashboard, add these variables:

**Backend Service:**
```
NODE_ENV=production
PORT=3001
```

**Frontend Service:**
```
REACT_APP_API_URL=https://your-backend-service.railway.app
```

#### 4. Add Persistent Volume (for SQLite)

**Important:** Railway's filesystem is ephemeral by default.

1. Go to your backend service
2. Click "Variables" → "Volumes"
3. Add volume:
   - Mount path: `/app/backend`
   - This persists your SQLite database

#### 5. Deploy

- Railway auto-deploys on git push
- First deployment may take 2-3 minutes
- You'll get URLs like:
  - Backend: `https://your-app-backend.railway.app`
  - Frontend: `https://your-app-frontend.railway.app`

### Cost Estimation (Railway)

**Free Tier:**
- $5/month credit
- Good for: Development, testing, 1-2 small clubs
- No credit card required

**Hobby Tier (Paid):**
- ~$5-10/month for backend + frontend
- Good for: 5-10 clubs, light usage
- Billed per hour of usage

**Production (Scaled):**
- ~$20-50/month for 20-50 clubs
- Depends on traffic and database size
- Scales automatically

## Alternative: Render.com

If Railway doesn't meet your needs, Render.com is an excellent alternative.

### Deploy to Render

#### 1. Create Render Account

Sign up at [Render.com](https://render.com) (free tier available)

#### 2. Create Web Service (Backend)

1. **New** → **Web Service**
2. Connect GitHub repository
3. Configure:
   - Name: `foreningsforsaljning-api`
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Plan: Free (or Starter $7/month for persistence)

4. Add Disk (for SQLite):
   - Name: `database`
   - Mount Path: `/app/backend`
   - Size: 1GB (sufficient for 100k+ customers)

#### 3. Create Static Site (Frontend)

1. **New** → **Static Site**
2. Connect GitHub repository
3. Configure:
   - Name: `foreningsforsaljning-web`
   - Root Directory: `frontend`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `frontend/build`
   - Plan: Free

4. Add environment variable:
   - `REACT_APP_API_URL`: Your backend URL

### Cost Estimation (Render)

**Free Tier:**
- Backend: Free (sleeps after 15min inactivity)
- Frontend: Free (static site)
- Good for: Testing only

**Starter:**
- Backend: $7/month (always on + persistent disk)
- Frontend: Free
- Good for: 5-10 clubs

## Upgrade Path: PostgreSQL (Recommended for >5 Clubs)

For better performance and scalability beyond 5 clubs:

### Railway PostgreSQL (Recommended)

1. In Railway dashboard:
   - Add "PostgreSQL" service
   - Get connection URL from variables
   - Update backend to use PostgreSQL

2. Install PostgreSQL driver:
```bash
npm install pg
```

3. Update `backend/database.js` to use PostgreSQL instead of SQLite

**Benefits:**
- Better performance for large datasets
- No file-system concerns
- Built-in backups
- Concurrent connections
- Railway includes PostgreSQL in hobby plan

### Render PostgreSQL

- Free tier: 90 days
- Paid: $7/month (same as web service)
- 1GB storage (sufficient for initial scale)

## Environment Variables Reference

### Backend (.env)
```env
NODE_ENV=production
PORT=3001
DATABASE_URL=sqlite://backend/foreningsforsaljning.db
# Or for PostgreSQL:
# DATABASE_URL=postgresql://user:pass@host:5432/dbname
```

### Frontend (.env)
```env
REACT_APP_API_URL=https://your-backend-url.railway.app
```

## Domain Setup (Optional)

### Custom Domain

Both Railway and Render support custom domains:

1. **Railway:**
   - Settings → Domains
   - Add custom domain
   - Update DNS records

2. **Render:**
   - Settings → Custom Domain
   - Add domain
   - Update DNS

### SSL/HTTPS

- Automatic SSL certificates
- HTTPS enabled by default
- No configuration needed

## Monitoring & Logs

### Railway

- **Logs:** Built-in log viewer in dashboard
- **Metrics:** CPU, memory, network usage
- **Alerts:** Configure notifications

### Render

- **Logs:** Real-time logs in dashboard
- **Metrics:** Service metrics dashboard
- **Health checks:** Automatic monitoring

## Backup Strategy

### SQLite (Railway/Render)

**Automatic:**
- Railway persistent volumes have snapshots
- Render persistent disks have daily backups

**Manual:**
1. Download database file from dashboard
2. Schedule periodic exports
3. Store in separate location (S3, Dropbox, etc.)

### PostgreSQL (Recommended)

**Automatic:**
- Daily backups included
- Point-in-time recovery
- Restore from backup easily

## Performance Optimization

### For 10-50 Clubs Scale

1. **Enable compression:**
   - Both platforms support gzip compression
   - Reduces bandwidth costs

2. **Use CDN for frontend:**
   - Railway: Built-in CDN
   - Render: Automatic CDN for static sites

3. **Database indexing:**
   - Already implemented in schema
   - Monitor slow queries

4. **Caching:**
   - Consider Redis for session storage (Railway offers free Redis)
   - Cache frequently accessed data

## Migration from Local to Production

1. **Test locally** with production database
2. **Export local data** (if any)
3. **Deploy to Railway/Render**
4. **Import data** to production database
5. **Test all features**
6. **Point custom domain** (if applicable)
7. **Monitor logs** for first 24 hours

## Cost Comparison

| Platform | Free Tier | Hobby/Starter | Production |
|----------|-----------|---------------|------------|
| **Railway** | $5/mo credit | ~$10-20/mo | ~$30-50/mo |
| **Render** | Limited (sleeps) | $7/mo | ~$20-40/mo |
| **Heroku** | None | $7/mo dyno + $9/mo DB | $50+/mo |
| **DigitalOcean** | None | $12/mo droplet | ~$30-60/mo |
| **AWS/GCP** | Free tier (12mo) | ~$15-30/mo | Varies |

## Recommendation Summary

**For Your Use Case (10s of clubs, ease of use, low cost):**

1. **Start with Railway.app**
   - Easiest deployment
   - Good free tier
   - Scales with you
   - Add PostgreSQL when you hit 5+ clubs

2. **Render.com as backup**
   - If Railway has issues
   - Slightly more complex
   - Very reliable

3. **Move to PostgreSQL early**
   - When you have 3+ paying clubs
   - Better performance
   - Easier to scale

**Expected Monthly Cost:**
- Months 1-3: $0 (free tier)
- Months 4-12: $7-15 (starter tier)
- Year 2+: $20-50 (depends on club count)

## Support & Help

**Railway:**
- Discord community (very responsive)
- Documentation: docs.railway.app
- Email support

**Render:**
- Community forum
- Documentation: render.com/docs
- Email support (paid plans)

## Next Steps

1. Commit all code to GitHub
2. Sign up for Railway.app
3. Connect your GitHub repo
4. Follow deployment steps above
5. Test with demo club
6. Invite first real club
7. Monitor and optimize
