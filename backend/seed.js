const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clear existing data
  console.log('🧹 Clearing existing data...');
  await prisma.favorite.deleteMany({});
  await prisma.inquiry.deleteMany({});
  await prisma.property.deleteMany({});
  await prisma.user.deleteMany({});
  console.log('✅ Existing data cleared');

  // Create sample users
  const hashedPassword = await bcrypt.hash('password123', 12);
  
  const agent1 = await prisma.user.create({
    data: {
      email: 'agent1@xillix.co.ke',
      firstName: 'John',
      lastName: 'Kamau',
      phone: '+254712345678',
      role: 'AGENT',
      password: hashedPassword,
      emailVerified: true,
      bio: 'Experienced real estate agent specializing in Nairobi properties'
    }
  });

  const agent2 = await prisma.user.create({
    data: {
      email: 'agent2@xillix.co.ke',
      firstName: 'Mary',
      lastName: 'Wanjiku',
      phone: '+254723456789',
      role: 'AGENT',
      password: hashedPassword,
      emailVerified: true,
      bio: 'Coastal properties specialist with 8 years experience'
    }
  });

  const user1 = await prisma.user.create({
    data: {
      email: 'user@example.com',
      firstName: 'David',
      lastName: 'Mwangi',
      phone: '+254734567890',
      role: 'USER',
      password: hashedPassword,
      emailVerified: true
    }
  });

  console.log('✅ Users created');

  // Create sample properties
  const properties = [
    {
      title: '4 Bedroom Villa in Karen',
      description: 'Luxurious 4-bedroom villa with modern amenities, swimming pool, and beautiful garden. Located in the prestigious Karen area with easy access to shopping centers and international schools.',
      slug: '4-bedroom-villa-karen',
      propertyType: 'HOUSE',
      listingType: 'FOR_SALE',
      price: 25000000,
      address: 'Karen Road, Karen',
      city: 'Nairobi',
      county: 'Nairobi',
      latitude: -1.3194,
      longitude: 36.7073,
      bedrooms: 4,
      bathrooms: 3,
      squareFootage: 3500,
      yearBuilt: 2018,
      features: JSON.stringify(['Swimming Pool', 'Garden', 'Garage', 'Security System', 'Modern Kitchen']),
      amenities: JSON.stringify(['24/7 Security', 'Backup Generator', 'Borehole Water', 'Fiber Internet']),
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
        'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
        'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800'
      ]),
      ownerId: agent1.id,
      featured: true
    },
    {
      title: '2 Bedroom Apartment in Westlands',
      description: 'Modern 2-bedroom apartment in the heart of Westlands. Perfect for young professionals with easy access to offices, restaurants, and nightlife.',
      slug: '2-bedroom-apartment-westlands',
      propertyType: 'APARTMENT',
      listingType: 'FOR_RENT',
      price: 80000,
      address: 'Westlands Road, Westlands',
      city: 'Nairobi',
      county: 'Nairobi',
      latitude: -1.2676,
      longitude: 36.8108,
      bedrooms: 2,
      bathrooms: 2,
      squareFootage: 1200,
      yearBuilt: 2020,
      features: JSON.stringify(['Balcony', 'Modern Kitchen', 'Parking', 'Elevator']),
      amenities: JSON.stringify(['Gym', 'Swimming Pool', '24/7 Security', 'Backup Power']),
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'
      ]),
      ownerId: agent1.id
    },
    {
      title: 'Commercial Office Space in CBD',
      description: 'Prime commercial office space in Nairobi CBD. Ideal for businesses looking for a prestigious address with excellent connectivity.',
      slug: 'commercial-office-cbd',
      propertyType: 'COMMERCIAL',
      listingType: 'FOR_RENT',
      price: 150000,
      address: 'Kenyatta Avenue, CBD',
      city: 'Nairobi',
      county: 'Nairobi',
      latitude: -1.2864,
      longitude: 36.8172,
      squareFootage: 2000,
      yearBuilt: 2015,
      features: JSON.stringify(['Air Conditioning', 'Conference Rooms', 'Reception Area', 'Parking']),
      amenities: JSON.stringify(['High Speed Internet', '24/7 Security', 'Elevator', 'Backup Power']),
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
        'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800'
      ]),
      ownerId: agent1.id
    },
    {
      title: 'Beachfront Villa in Diani',
      description: 'Stunning beachfront villa with direct beach access. Perfect for vacation rental or permanent residence. Breathtaking ocean views and tropical gardens.',
      slug: 'beachfront-villa-diani',
      propertyType: 'HOUSE',
      listingType: 'FOR_SALE',
      price: 35000000,
      address: 'Diani Beach Road, Diani',
      city: 'Ukunda',
      county: 'Kwale',
      latitude: -4.3297,
      longitude: 39.5826,
      bedrooms: 5,
      bathrooms: 4,
      squareFootage: 4000,
      yearBuilt: 2019,
      features: JSON.stringify(['Beach Access', 'Swimming Pool', 'Tropical Garden', 'Outdoor Kitchen', 'Staff Quarters']),
      amenities: JSON.stringify(['Private Beach', 'Solar Power', 'Borehole Water', 'Security']),
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800',
        'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800'
      ]),
      ownerId: agent2.id,
      featured: true
    },
    {
      title: '3 Bedroom Townhouse in Kileleshwa',
      description: 'Spacious 3-bedroom townhouse in a gated community. Family-friendly neighborhood with excellent schools and amenities nearby.',
      slug: '3-bedroom-townhouse-kileleshwa',
      propertyType: 'HOUSE',
      listingType: 'FOR_SALE',
      price: 18000000,
      address: 'Kileleshwa Road, Kileleshwa',
      city: 'Nairobi',
      county: 'Nairobi',
      latitude: -1.2833,
      longitude: 36.7833,
      bedrooms: 3,
      bathrooms: 3,
      squareFootage: 2200,
      yearBuilt: 2017,
      features: JSON.stringify(['Garden', 'Garage', 'Modern Kitchen', 'Master En-suite']),
      amenities: JSON.stringify(['Gated Community', '24/7 Security', 'Playground', 'Clubhouse']),
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
        'https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?w=800'
      ]),
      ownerId: agent1.id
    },
    {
      title: '1 Bedroom Studio in Kilimani',
      description: 'Cozy 1-bedroom studio apartment perfect for students or young professionals. Walking distance to universities and shopping centers.',
      slug: '1-bedroom-studio-kilimani',
      propertyType: 'APARTMENT',
      listingType: 'FOR_RENT',
      price: 45000,
      address: 'Argwings Kodhek Road, Kilimani',
      city: 'Nairobi',
      county: 'Nairobi',
      latitude: -1.2921,
      longitude: 36.7833,
      bedrooms: 1,
      bathrooms: 1,
      squareFootage: 600,
      yearBuilt: 2021,
      features: JSON.stringify(['Balcony', 'Modern Kitchen', 'Parking']),
      amenities: JSON.stringify(['Security', 'Backup Power', 'Water Supply']),
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800'
      ]),
      ownerId: agent2.id
    }
  ];

  for (const propertyData of properties) {
    await prisma.property.create({ data: propertyData });
  }

  console.log('✅ Properties created');

  // Create sample inquiries
  await prisma.inquiry.create({
    data: {
      name: 'Peter Ochieng',
      email: 'peter@example.com',
      phone: '+254745678901',
      message: 'I am interested in viewing this property. When would be a good time?',
      propertyId: (await prisma.property.findFirst({ where: { slug: '4-bedroom-villa-karen' } })).id,
      userId: user1.id
    }
  });

  console.log('✅ Inquiries created');

  // Create sample favorites
  const villa = await prisma.property.findFirst({ where: { slug: '4-bedroom-villa-karen' } });
  const apartment = await prisma.property.findFirst({ where: { slug: '2-bedroom-apartment-westlands' } });

  await prisma.favorite.create({
    data: {
      userId: user1.id,
      propertyId: villa.id
    }
  });

  await prisma.favorite.create({
    data: {
      userId: user1.id,
      propertyId: apartment.id
    }
  });

  console.log('✅ Favorites created');

  console.log('🎉 Database seeding completed successfully!');
  console.log(`Created ${await prisma.user.count()} users`);
  console.log(`Created ${await prisma.property.count()} properties`);
  console.log(`Created ${await prisma.inquiry.count()} inquiries`);
  console.log(`Created ${await prisma.favorite.count()} favorites`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });