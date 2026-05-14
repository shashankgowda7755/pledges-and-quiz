import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Jungle Adventure Pledge...');

  const org = await prisma.organization.upsert({
    where: { slug: 'hanon' },
    update: {},
    create: {
      slug: 'hanon',
      name: 'Hanon Systems',
      contactEmail: 'info@hanonsystems.com',
      type: 'company',
      isActive: true,
    },
  });
  console.log('✓ Org:', org.name);

  const pledge = await prisma.pledge.upsert({
    where: { slug: 'jungle-adventure-2026' },
    update: {
      name: 'Jungle Adventure Kids Summer Camp 2026',
      description: 'A fun-filled day of jungle exploration and discovery for kids at the Hanon Systems Summer Camp 2026.',
      bgImageUrl: '/images/quizzes/jungle-adventure-2026.jpg',
      eventDate: new Date('2026-05-15T00:00:00.000Z'),
      orgId: org.id,
      category: 'environment',
      isActive: true,
      isFeatured: true,
    },
    create: {
      slug: 'jungle-adventure-2026',
      name: 'Jungle Adventure Kids Summer Camp 2026',
      description: 'A fun-filled day of jungle exploration and discovery for kids at the Hanon Systems Summer Camp 2026.',
      category: 'environment',
      bgImageUrl: '/images/quizzes/jungle-adventure-2026.jpg',
      impactMetric: 'kids_participating',
      impactPerUnit: 0,
      isActive: true,
      isFeatured: true,
      eventDate: new Date('2026-05-15T00:00:00.000Z'),
      orgId: org.id,
    },
  });
  console.log('✓ Pledge:', pledge.name, '| id:', pledge.id);

  // No checkboxes for this pledge — wipe any that may exist
  await prisma.pledgeCommitment.deleteMany({ where: { pledgeId: pledge.id } });
  console.log('✓ Commitments cleared (direct-render flow)');

  console.log('\n✅ Jungle Adventure pledge seeded.');
  console.log('   Visit: /pledges/jungle-adventure-2026');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
