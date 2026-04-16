import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Water Pledge...');

  // 1. Upsert Inchcape org
  const org = await prisma.organization.upsert({
    where: { slug: 'inchcape-shipping' },
    update: {},
    create: {
      slug: 'inchcape-shipping',
      name: 'Inchcape Shipping Services',
      contactEmail: 'events@inchcape.com',
      type: 'company',
      isActive: true,
    },
  });
  console.log('✓ Org:', org.name);

  // 2. Upsert Water Pledge
  const pledge = await prisma.pledge.upsert({
    where: { slug: 'water-pledge' },
    update: {
      name: 'My Water Pledge',
      description: 'Small action, lasting impact. Commit to valuing every drop of water for your community and every life that depends on it.',
      bgImageUrl: '/images/pledges/rain water.png',
      eventDate: new Date('2026-04-17T00:00:00.000Z'),
      orgId: org.id,
    },
    create: {
      slug: 'water-pledge',
      name: 'My Water Pledge',
      description: 'Small action, lasting impact. Commit to valuing every drop of water for your community and every life that depends on it.',
      category: 'environment',
      bgImageUrl: '/images/pledges/rain water.png',
      impactMetric: 'litres_saved',
      impactPerUnit: 50,
      isActive: true,
      isFeatured: true,
      eventDate: new Date('2026-04-17T00:00:00.000Z'),
      orgId: org.id,
    },
  });
  console.log('✓ Pledge:', pledge.name, '| id:', pledge.id);

  // 3. Delete old commitments and recreate fresh
  await prisma.pledgeCommitment.deleteMany({ where: { pledgeId: pledge.id } });

  const commitments = [
    'I will turn off taps when not in use',
    'I will be mindful of my daily water consumption',
    'I will reuse water wherever possible',
    'I will adopt water-efficient habits every day',
    'I will report or fix leaking taps and pipes immediately',
    'I will not ignore water wastage in public or shared spaces',
    'I will support rainwater harvesting in my home or community',
    'I will inspire at least one person to take this pledge',
  ];

  for (let i = 0; i < commitments.length; i++) {
    await prisma.pledgeCommitment.create({
      data: { pledgeId: pledge.id, text: commitments[i], order: i + 1 },
    });
  }
  console.log(`✓ ${commitments.length} commitments created`);

  console.log('\n✅ All done!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
