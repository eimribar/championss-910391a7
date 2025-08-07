# Supabase Setup Guide for Championss

## Quick Setup (5 minutes)

### 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign in with GitHub
4. Click "New Project"
5. Fill in:
   - Project name: `championss`
   - Database Password: (save this!)
   - Region: Choose closest to you
6. Click "Create Project" (takes ~2 minutes)

### 2. Get Your API Keys

Once your project is ready:

1. Go to Settings → API
2. Copy these values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **Anon/Public Key**: `eyJhbGc...` (long string)
   - **Service Role Key**: `eyJhbGc...` (different long string)

### 3. Update Your .env File

Edit `/backend/.env`:

```env
# Database (Supabase)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_KEY=your-service-role-key-here

# Get this from Settings → Database
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT].supabase.co:5432/postgres

# Set to false to use real database
SKIP_DB=false
```

### 4. Run Database Migrations

```bash
cd backend

# Generate Prisma client
npx prisma generate

# Push schema to Supabase
npx prisma db push

# (Optional) Seed with sample data
npx prisma db seed
```

### 5. Enable Row Level Security (RLS)

Go to Supabase Dashboard → Authentication → Policies

Create these policies for the `Champion` table:

**Users can view their own champions:**
```sql
CREATE POLICY "Users can view own champions" ON public."Champion"
FOR SELECT USING (auth.uid() = "userId");
```

**Users can insert their own champions:**
```sql
CREATE POLICY "Users can insert own champions" ON public."Champion"
FOR INSERT WITH CHECK (auth.uid() = "userId");
```

**Users can update their own champions:**
```sql
CREATE POLICY "Users can update own champions" ON public."Champion"
FOR UPDATE USING (auth.uid() = "userId");
```

**Users can delete their own champions:**
```sql
CREATE POLICY "Users can delete own champions" ON public."Champion"
FOR DELETE USING (auth.uid() = "userId");
```

### 6. (Optional) Enable Realtime

For live updates when champions change jobs:

1. Go to Database → Replication
2. Enable replication for:
   - `Champion` table
   - `ChangeHistory` table

### 7. Test Your Setup

```bash
# Start backend
npm run dev

# In another terminal, test the health endpoint
curl http://localhost:5000/api/health

# Should return:
# {"status":"OK","timestamp":"...","environment":"development","uptime":...}
```

## Frontend Configuration

Update `/src/.env`:

```env
# Use real backend
VITE_USE_MOCK_API=false
VITE_API_URL=http://localhost:5000/api

# For production, add Supabase client
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## Features You Get with Supabase

1. **Authentication**: Built-in auth with social logins
2. **Real-time**: Live updates when data changes
3. **Storage**: File uploads for champion photos/CSVs
4. **Edge Functions**: Serverless functions for LinkedIn scraping
5. **Vector Search**: AI-powered champion matching (future)

## Production Deployment

1. **Backend**: Deploy to Railway/Render with env vars
2. **Frontend**: Deploy to Vercel/Netlify
3. **Database**: Already hosted on Supabase
4. **Enable**: Email confirmations in Supabase Auth settings

## Troubleshooting

- **"relation does not exist"**: Run `npx prisma db push`
- **"Invalid API key"**: Check your .env file
- **"User not found"**: Make sure to create user in both Auth and Database
- **Connection issues**: Check if your IP is allowed in Supabase settings

## Next Steps

1. ✅ Database connected
2. ✅ Authentication working
3. 🔄 Add LinkedIn scraping with Supabase Edge Functions
4. 🔄 Set up email notifications with Supabase
5. 🔄 Add real-time champion updates