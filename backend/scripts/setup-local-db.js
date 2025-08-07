// Script to set up local development without Supabase
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');
  
  // Create test user
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const user = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: {
      email: 'demo@example.com',
      password: hashedPassword,
      fullName: 'Demo User',
      company: 'Demo Company',
      onboardingCompleted: true,
      emailVerified: true
    }
  });
  
  console.log('✅ Created user:', user.email);
  
  // Create sample champions
  const champions = [
    {
      name: 'Sarah Johnson',
      linkedinUrl: 'https://linkedin.com/in/sarahjohnson',
      currentCompany: 'TechCorp',
      currentTitle: 'VP of Sales',
      previousCompany: 'StartupXYZ',
      previousTitle: 'Director of Sales',
      jobChangeStatus: 'NEW_CHANGE_DETECTED',
      changeDetectedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    },
    {
      name: 'Michael Chen',
      linkedinUrl: 'https://linkedin.com/in/michaelchen',
      currentCompany: 'CloudBase Inc',
      currentTitle: 'Engineering Manager',
      previousCompany: 'DataFlow Systems',
      previousTitle: 'Senior Engineer',
      jobChangeStatus: 'CHANGED',
      changeDetectedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    },
    {
      name: 'Emily Rodriguez',
      linkedinUrl: 'https://linkedin.com/in/emilyrodriguez',
      currentCompany: 'MarketPro',
      currentTitle: 'CMO',
      jobChangeStatus: 'MONITORING'
    }
  ];
  
  for (const championData of champions) {
    const champion = await prisma.champion.upsert({
      where: {
        userId_linkedinUrl: {
          userId: user.id,
          linkedinUrl: championData.linkedinUrl
        }
      },
      update: {},
      create: {
        ...championData,
        userId: user.id,
        email: `${championData.name.toLowerCase().replace(' ', '.')}@example.com`
      }
    });
    
    console.log('✅ Created champion:', champion.name);
    
    // Add change history for champions with job changes
    if (championData.jobChangeStatus !== 'MONITORING') {
      await prisma.changeHistory.create({
        data: {
          championId: champion.id,
          previousCompany: championData.previousCompany,
          previousTitle: championData.previousTitle,
          newCompany: championData.currentCompany,
          newTitle: championData.currentTitle,
          confidence: 0.85,
          detectedAt: championData.changeDetectedAt || new Date()
        }
      });
    }
  }
  
  console.log('✨ Database seeded successfully!');
  console.log('\n📝 Test credentials:');
  console.log('Email: demo@example.com');
  console.log('Password: password123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });