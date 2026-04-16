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
      bgImageUrl: '/images/pledges/waterp.png',
      eventDate: new Date('2026-04-17T00:00:00.000Z'),
      orgId: org.id,
    },
    create: {
      slug: 'water-pledge',
      name: 'My Water Pledge',
      description: 'Small action, lasting impact. Commit to valuing every drop of water for your community and every life that depends on it.',
      category: 'environment',
      bgImageUrl: '/images/pledges/waterp.png',
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

  // 4. Upsert Sparrow Quiz (from existing Untitled-1.md data)
  const quiz = await prisma.quiz.upsert({
    where: { slug: 'house-sparrow' },
    update: {},
    create: {
      slug: 'house-sparrow',
      title: 'House Sparrow Quiz',
      description: 'Test your knowledge about the House Sparrow — one of the most common birds in India.',
      category: 'wildlife',
      bgImageUrl: '/images/quizzes/sparrow-poster.png',
      isActive: true,
      isFeatured: true,
    },
  });
  console.log('✓ Quiz:', quiz.title, '| id:', quiz.id);

  // Only seed questions if none exist
  const existingQ = await prisma.question.count({ where: { quizId: quiz.id } });
  if (existingQ === 0) {
    const questions = [
      { text: 'What is the primary diet of sparrows?', options: ['Seeds & insects', 'Fruits & nuts', 'Fish', 'Leaves'], correct: 0 },
      { text: 'What sound does a sparrow typically make?', options: ['Quack', 'Hoot', 'Chirp', 'Caw'], correct: 2 },
      { text: 'How long do sparrows typically live in the wild?', options: ['1–2 years', '3–5 years', '6–10 years', '11–15 years'], correct: 1 },
      { text: 'What is a group of sparrows called?', options: ['Flock', 'School', 'Herd', 'Swarm'], correct: 0 },
      { text: 'What is a baby sparrow called?', options: ['Kitten', 'Pup', 'Chick', 'Cub'], correct: 2 },
      { text: 'How do sparrows communicate with each other?', options: ['Feather display', 'Dances', 'Beak taps', 'Songs and calls'], correct: 3 },
      { text: 'How many species of sparrows are there?', options: ['About 50', 'About 100', 'About 200', 'About 300'], correct: 2 },
      { text: 'What is the most common species of sparrow?', options: ['House Sparrow', 'Song Sparrow', 'Tree Sparrow', 'Savannah Sparrow'], correct: 0 },
      { text: "What's the average weight of a House Sparrow?", options: ['10–15 grams', '20–25 grams', '30–35 grams', '40–45 grams'], correct: 1 },
      { text: 'How far can sparrows travel from their nest to find food?', options: ['100 meters', '500 meters', '1 kilometer', '5 kilometers'], correct: 1 },
      { text: 'What season do sparrows molt their feathers?', options: ['Spring', 'Summer', 'Winter', 'Fall'], correct: 3 },
      { text: 'What colour are the legs of a House Sparrow?', options: ['Blue', 'Red', 'Brown', 'Yellow'], correct: 2 },
      { text: 'What type of sparrow has a black patch on its chest?', options: ['Tree Sparrow', 'House Sparrow', 'Song Sparrow', 'Savannah Sparrow'], correct: 1 },
      { text: 'What is the wingspan of an average House Sparrow?', options: ['10–12 cm', '13–15 cm', '16–18 cm', '19–21 cm'], correct: 2 },
      { text: 'What is the scientific name of the House Sparrow?', options: ['Passer domesticus', 'Passer montanus', 'Melospiza melodia', 'None of the above'], correct: 0 },
      { text: 'What feature distinguishes male and female House Sparrows?', options: ['Colour of feathers', 'Beak size', 'Leg length', 'Tail shape'], correct: 0 },
      { text: 'How long does it take for sparrow eggs to hatch?', options: ['3–5 days', '6–8 days', '11–14 days', '15–20 days'], correct: 2 },
      { text: 'What is the typical clutch size for a sparrow?', options: ['1–2 eggs', '3–7 eggs', '8–10 eggs', '11–15 eggs'], correct: 1 },
      { text: 'Where are sparrows commonly found in India?', options: ['Assam', 'Kashmir', 'South India & Assam', 'Mostly South'], correct: 2 },
      { text: 'How many eggs do sparrows usually lay?', options: ['5–6', '4–5', '6–8', '3–4'], correct: 1 },
    ];

    for (let i = 0; i < questions.length; i++) {
      const q = await prisma.question.create({
        data: {
          quizId: quiz.id,
          text: questions[i].text,
          order: i + 1,
        },
      });
      for (let j = 0; j < questions[i].options.length; j++) {
        await prisma.answerOption.create({
          data: {
            questionId: q.id,
            text: questions[i].options[j],
            isCorrect: j === questions[i].correct,
            order: j + 1,
          },
        });
      }
    }
    console.log(`✓ ${questions.length} quiz questions seeded`);
  } else {
    console.log(`✓ Quiz questions already exist (${existingQ}), skipping`);
  }

  console.log('\n✅ All done!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
