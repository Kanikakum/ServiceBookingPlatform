require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const categories = [
  { name: 'Home Cleaning', slug: 'home-cleaning' },
  { name: 'Plumbing', slug: 'plumbing' },
  { name: 'Electrical', slug: 'electrical' },
  { name: 'Beauty & Wellness', slug: 'beauty-wellness' },
  { name: 'Appliance Repair', slug: 'appliance-repair' },
  { name: 'Tutoring', slug: 'tutoring' },
  { name: 'Fitness', slug: 'fitness' },
  { name: 'Car Wash', slug: 'car-wash' },
];

async function main() {
  console.log('Seeding initial categories...');

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name },
      create: { name: cat.name, slug: cat.slug },
    });
  }

  console.log(`Successfully seeded ${categories.length} categories.`);
}

main()
  .catch((e) => {
    console.error('Category seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
