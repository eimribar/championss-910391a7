# CLAUDE.md - Project Context for Championss

## Last Updated: January 7, 2025

### Current Session Summary
We successfully implemented SSO authentication, removed all password-based auth, redesigned the auth page with a minimalist design, and fixed navigation bar positioning. The project is committed to GitHub and partially deployed to Vercel (frontend only).

### ⚠️ CURRENT ISSUE TO RESOLVE
**Problem**: Getting 404 error on SSO login because backend is not deployed.
**Solution**: Need to deploy backend to Railway/Render and update Vercel environment variables.

## Project Overview

### What We're Building
Championss - A SaaS platform for tracking job changes of key contacts ("champions") with instant LinkedIn-based alerts.

### Tech Stack
- **Frontend**: React + Vite, TailwindCSS, shadcn/ui
- **Backend**: Node.js, Express, Passport.js
- **Database**: Supabase (PostgreSQL) with Prisma ORM
- **Auth**: Google OAuth, Microsoft OAuth (SSO only, no passwords)
- **Deployment**: Vercel (frontend), Railway/Render (backend needed)

### Database Credentials (Supabase)
```
Project ref: sccnhttcuxhqxyqberzz
Database password: Supabase!@37102277
DATABASE_URL: postgresql://postgres:Supabase!@37102277@db.sccnhttcuxhqxyqberzz.supabase.co:5432/postgres
```

## What's Been Done

### ✅ Completed Features
1. **Base44 Removal** - Removed all prototype dependencies
2. **Database Migration** - Moved from MongoDB to Supabase/PostgreSQL
3. **SSO Authentication** - Google & Microsoft OAuth implemented
4. **Work Email Validation** - Blocks 25+ personal email domains
5. **Auth Page Redesign** - Minimalist design with centered container
6. **Navigation Fix** - Nav bar now flush with viewport top
7. **JWT Authentication** - Token-based session management
8. **Prisma Schema** - Complete database models for all entities

### 📁 Key Files Modified/Created
- `/backend/routes/auth.sso.js` - SSO authentication routes
- `/backend/config/passport.js` - OAuth strategies
- `/src/pages/Auth.jsx` - Redesigned auth page
- `/backend/prisma/schema.prisma` - Database schema
- `/backend/server-supabase.js` - Main server file

## What Needs to Be Done

### 🚨 Immediate (To Fix Current Issue)
1. **Deploy Backend**
   - Option A: Deploy to Railway.app (recommended)
   - Option B: Deploy to Render.com
   - Set root directory to `/backend`
   
2. **Configure Backend Environment Variables**
   ```env
   CLIENT_URL=https://championss-910391a7.vercel.app
   DATABASE_URL=[already have this above]
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   SESSION_SECRET=your-session-secret-change-this-in-production
   GOOGLE_CLIENT_ID=[need to create in Google Cloud Console]
   GOOGLE_CLIENT_SECRET=[need to create in Google Cloud Console]
   MICROSOFT_CLIENT_ID=[need to create in Azure Portal]
   MICROSOFT_CLIENT_SECRET=[need to create in Azure Portal]
   ```

3. **Update Vercel Frontend**
   - Add environment variable: `VITE_API_URL=https://[your-backend-url]`
   - Redeploy

4. **Create OAuth Apps**
   - Google Cloud Console: Create OAuth 2.0 credentials
   - Azure Portal: Register application
   - Add redirect URIs pointing to your backend URL

### 📋 Pending Features (Priority Order)
1. **LinkedIn Scraping** - Core feature for job change detection
2. **Real-time Notifications** - WebSocket alerts for job changes
3. **CSV Bulk Upload** - Import champions in bulk
4. **Email Notifications** - SendGrid/Resend integration
5. **Chrome Extension** - One-click LinkedIn profile import
6. **Analytics Dashboard** - Track engagement metrics
7. **Team Features** - Multi-user support
8. **Billing System** - Stripe integration

## Commands to Remember

### Local Development
```bash
# Start backend (from project root)
cd backend && npm start

# Start frontend (from project root)
npm run dev

# Database commands
npx prisma db push          # Update database schema
npx prisma generate          # Generate Prisma client
npx prisma studio           # Open database GUI
```

### Git Commands
```bash
git add -A
git commit -m "Your message"
git push origin main
```

## Project Structure
```
/championss-910391a7
  /backend
    /routes         # API routes (auth.sso.js)
    /config         # Passport config
    /prisma         # Database schema
    .env            # Backend environment variables
    server-supabase.js
  /src
    /pages          # React pages (Auth.jsx, Dashboard.jsx)
    /api            # API client
    /components     # UI components
  .env              # Frontend environment variables
  vite.config.js    # Vite configuration
```

## How to Continue Next Session

When you return, tell Claude:
"I want to continue working on the Championss project. We left off with needing to deploy the backend to fix the 404 SSO error. Check CLAUDE.md for full context."

## Notes for Next Session
- Backend needs deployment (Railway recommended)
- OAuth credentials need to be created
- Environment variables need configuration
- After deployment, implement LinkedIn scraping as next priority

## GitHub Repository
https://github.com/eimribar/championss-910391a7

---
*This file helps Claude Code understand the project context when you return.*