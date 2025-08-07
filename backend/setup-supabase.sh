#!/bin/bash

echo "🚀 Championss - Supabase Setup Helper"
echo "======================================"
echo ""
echo "Follow these steps:"
echo ""
echo "1. Go to: https://supabase.com"
echo "2. Create a new project called 'championss'"
echo "3. Once created, go to Settings → API"
echo ""
read -p "Enter your Supabase URL (https://xxx.supabase.co): " SUPABASE_URL
read -p "Enter your Anon/Public Key: " SUPABASE_ANON_KEY
read -p "Enter your Service Role Key: " SUPABASE_SERVICE_KEY
read -p "Enter your Database Password: " DB_PASSWORD

# Extract project ref from URL
PROJECT_REF=$(echo $SUPABASE_URL | sed 's/https:\/\/\(.*\)\.supabase\.co/\1/')

# Create .env file
cat > .env << EOF
# Server Configuration
PORT=5000
NODE_ENV=development

# Supabase Configuration
SUPABASE_URL=$SUPABASE_URL
SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY
SUPABASE_SERVICE_KEY=$SUPABASE_SERVICE_KEY

# Database URL
DATABASE_URL=postgresql://postgres:$DB_PASSWORD@db.$PROJECT_REF.supabase.co:5432/postgres

# Disable mock data
SKIP_DB=false

# JWT Secret
JWT_SECRET=$(openssl rand -base64 32)
JWT_EXPIRE=7d

# Frontend URL
CLIENT_URL=http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Stripe Keys (optional)
STRIPE_PUBLISHABLE_KEY=sb_publishable_NEhyGDDiQJ67sEoteL7sbA_ykK4D0LT
STRIPE_SECRET_KEY=sb_secret_RtcaI2cIZbPu6LPEc7jn6w_0xHoSajD
EOF

echo ""
echo "✅ .env file created!"
echo ""
echo "Running database setup..."
npm run db:generate
npm run db:push

echo ""
echo "🎉 Setup complete! Your backend is ready to use Supabase."
echo ""
echo "Next steps:"
echo "1. Run: npm run dev"
echo "2. Test: curl http://localhost:5000/api/health"
echo "3. Update frontend .env: VITE_USE_MOCK_API=false"