const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    const properties = await prisma.property.findMany();
    console.log('Properties found:', properties.length);
    properties.forEach(p => {
      console.log(`- ${p.title} (${p.listingType}) - $${p.price}`);
    });
    
    const users = await prisma.user.findMany();
    console.log('\nUsers found:', users.length);
    users.forEach(u => {
      console.log(`- ${u.firstName} ${u.lastName} (${u.role})`);
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();