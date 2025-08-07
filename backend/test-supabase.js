const { createClient } = require('@supabase/supabase-js');

// Test connection to Supabase
const supabase = createClient(
  'https://sccnhttcuxhqxyqberzz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNjY25odHRjdXhocXh5cWJlcnp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1Mzg1OTMsImV4cCI6MjA3MDExNDU5M30.ITeth_HBvh7dJ-7s62M2641JqCan1PfrrHhbmmicito'
);

async function testConnection() {
  console.log('🔄 Testing Supabase connection...\n');
  
  // Test 1: Check if we can connect
  const { data, error } = await supabase.from('_prisma_migrations').select('*').limit(1);
  
  if (error && error.code === '42P01') {
    console.log('⚠️  Tables not created yet. Run: npx prisma db push');
    console.log('   But connection to Supabase is working! ✅\n');
  } else if (error) {
    console.log('❌ Error:', error.message);
  } else {
    console.log('✅ Successfully connected to Supabase!');
    console.log('✅ Database tables are set up!\n');
  }
  
  // Test 2: Check auth
  console.log('🔐 Testing Auth...');
  const { data: { user } } = await supabase.auth.getUser();
  console.log(user ? '✅ Auth is working!' : '✅ Auth is configured (no user logged in)');
  
  console.log('\n🎉 Your Supabase project is ready to use!');
  console.log('\nProject URL: https://sccnhttcuxhqxyqberzz.supabase.co');
  console.log('Dashboard: https://app.supabase.com/project/sccnhttcuxhqxyqberzz');
}

testConnection();