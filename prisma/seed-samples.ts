/**
 * Sample content seed — pledges, quizzes, and a certificate that match the
 * COMMUNITREE & EZONE theme (trees, water, sparrows, environment).
 *
 * Idempotent: skips any slug that already exists. Run with:
 *   npx tsx prisma/seed-samples.ts
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const PLEDGES = [
  {
    slug: 'plant-a-tree',
    name: 'Plant a Tree Pledge',
    description: 'Commit to growing the green cover. Every sapling you plant cools the city, cleans the air, and brings the birds back.',
    category: 'environment',
    bgImageUrl: '/images/quizzes/jungle-adventure-2026.jpg',
    impactMetric: 'trees_planted',
    impactPerUnit: 1,
    commitments: [
      'I will plant at least one native tree this season',
      'I will water and care for it through its first year',
      'I will choose species suited to my local soil and climate',
      'I will avoid cutting healthy trees without need',
      'I will compost my green waste to feed the soil',
      'I will encourage my neighbours to plant too',
      'I will protect saplings from grazing and damage',
      'I will report illegal tree felling in my area',
      'I will support local urban-forest drives',
      'I will inspire at least one person to take this pledge',
    ],
  },
  {
    slug: 'plastic-free-living',
    name: 'Plastic-Free Living',
    description: 'Refuse single-use plastic, one habit at a time. Small daily swaps keep tonnes of waste out of our rivers and soil.',
    category: 'lifestyle',
    bgImageUrl: 'https://picsum.photos/seed/plasticfree/1080/1350',
    impactMetric: 'plastic_items_avoided',
    impactPerUnit: 5,
    commitments: [
      'I will carry my own cloth bag when I shop',
      'I will refuse plastic straws and cutlery',
      'I will use a refillable water bottle',
      'I will avoid single-use plastic packaging where I can',
      'I will segregate my waste at home',
      'I will buy in bulk to cut packaging',
      'I will reuse containers instead of discarding them',
      'I will say no to plastic gift wrap',
      'I will pick up litter when I see it',
      'I will inspire at least one person to take this pledge',
    ],
  },
  {
    slug: 'save-energy-home',
    name: 'Save Energy at Home',
    description: 'Cut your carbon footprint from the switchboard. Mindful energy use saves money and the planet at the same time.',
    category: 'environment',
    bgImageUrl: 'https://picsum.photos/seed/saveenergy/1080/1350',
    impactMetric: 'kwh_saved',
    impactPerUnit: 10,
    commitments: [
      'I will switch off lights and fans when not in use',
      'I will unplug devices on standby',
      'I will switch to LED bulbs',
      'I will run the AC at 24°C or higher',
      'I will use natural light during the day',
      'I will dry clothes in the sun, not a dryer',
      'I will maintain appliances for efficiency',
      'I will choose 5-star rated appliances',
      'I will explore rooftop solar for my home',
      'I will inspire at least one person to take this pledge',
    ],
  },
];

// Sparrow Quiz — full 20 questions from Untitled-1.md (correct option marked).
const SPARROW = [
  ['What is the primary diet of sparrows?', ['Seeds & insects', 'Fruits & nuts', 'Fish', 'Leaves'], 0],
  ['What sound does a sparrow typically make?', ['Quack', 'Hoot', 'Chirp', 'Caw'], 2],
  ['How long do sparrows typically live in the wild?', ['1–2 years', '3–5 years', '6–10 years', '11–15 years'], 1],
  ['What is a group of sparrows called?', ['Flock', 'School', 'Herd', 'Swarm'], 0],
  ['What is a baby sparrow called?', ['Kitten', 'Pup', 'Chick', 'Cub'], 2],
  ['How do sparrows communicate with each other?', ['Feather display', 'Dances', 'Beak taps', 'Songs and calls'], 3],
  ['How many species of sparrows are there?', ['About 50', 'About 100', 'About 200', 'About 300'], 2],
  ['What is the most common species of sparrow?', ['House Sparrow', 'Song Sparrow', 'Tree Sparrow', 'Savannah Sparrow'], 0],
  ["What's the average weight of a House Sparrow?", ['10–15 grams', '20–25 grams', '30–35 grams', '40–45 grams'], 1],
  ['How far can sparrows travel from their nest to find food?', ['100 meters', '500 meters', '1 kilometer', '5 kilometers'], 1],
  ['What season do sparrows molt their feathers?', ['Spring', 'Summer', 'Winter', 'Fall'], 3],
  ['What colour are the legs of a House Sparrow?', ['Blue', 'Red', 'Brown', 'Yellow'], 2],
  ['What type of sparrow has a black patch on its chest?', ['Tree Sparrow', 'House Sparrow', 'Song Sparrow', 'Savannah Sparrow'], 1],
  ['What is the wingspan of an average House Sparrow?', ['10–12 cm', '13–15 cm', '16–18 cm', '19–21 cm'], 2],
  ['What is the scientific name of the House Sparrow?', ['Passer domesticus', 'Passer montanus', 'Melospiza melodia', 'None of the above'], 0],
  ['What feature distinguishes male and female House Sparrows?', ['Colour of feathers', 'Beak size', 'Leg length', 'Tail shape'], 0],
  ['How long does it take for sparrow eggs to hatch?', ['3–5 days', '6–8 days', '11–14 days', '15–20 days'], 2],
  ['What is the typical clutch size for a sparrow?', ['1–2 eggs', '3–7 eggs', '8–10 eggs', '11–15 eggs'], 1],
  ['Where are sparrows commonly found in India?', ['Assam', 'Kashmir', 'South India & Assam', 'Mostly South'], 2],
  ['How many eggs do sparrows usually lay?', ['5–6', '4–5', '6–8', '3–4'], 1],
];

const TREES = [
  ['Roughly how much oxygen can one mature tree produce per year?', ['Enough for ~2 people', 'Enough for ~10 people', 'None', 'Enough for ~50 people'], 0],
  ['Which gas do trees absorb from the atmosphere?', ['Oxygen', 'Carbon dioxide', 'Nitrogen', 'Helium'], 1],
  ['What is the process by which plants make food using sunlight?', ['Respiration', 'Photosynthesis', 'Digestion', 'Fermentation'], 1],
  ['Which of these helps prevent soil erosion?', ['Tree roots', 'Plastic bags', 'Concrete', 'Streetlights'], 0],
  ['What is the best time to plant most trees in India?', ['Peak summer', 'Monsoon season', 'Mid-winter night', 'During a drought'], 1],
];

const QUIZZES = [
  {
    slug: 'sparrow-quiz',
    title: 'Sparrow Quiz',
    description: 'How well do you know the humble house sparrow? Test yourself across 20 questions and earn your certificate.',
    category: 'environment',
    bgImageUrl: '/images/quizzes/sparrow-poster.png',
    questions: SPARROW,
  },
  {
    slug: 'trees-and-forests',
    title: 'Trees & Forests Quiz',
    description: 'A quick five-question check on why trees matter. Learn something, earn a certificate.',
    category: 'environment',
    bgImageUrl: '/images/quizzes/jungle-adventure-2026.jpg',
    questions: TREES,
  },
];

const CERTIFICATES = [
  {
    slug: 'world-environment-day-2026',
    name: 'World Environment Day 2026',
    description: 'Celebrate World Environment Day with COMMUNITREE & EZONE. Add your name and download your participation certificate.',
    category: 'environment',
    bgImageUrl: '/images/quizzes/jungle-adventure-2026.jpg',
    eventDate: new Date('2026-06-05T00:00:00.000Z'),
  },
];

async function main() {
  // Hide leftover test junk (can't delete — has submissions)
  const hid = await prisma.pledge.updateMany({ where: { slug: { in: ['test'] } }, data: { isActive: false } });
  if (hid.count) console.log(`Deactivated ${hid.count} junk pledge(s)`);

  for (const p of PLEDGES) {
    const exists = await prisma.pledge.findUnique({ where: { slug: p.slug } });
    if (exists) { console.log(`skip pledge ${p.slug} (exists)`); continue; }
    await prisma.pledge.create({
      data: {
        slug: p.slug, name: p.name, description: p.description, category: p.category,
        bgImageUrl: p.bgImageUrl, impactMetric: p.impactMetric, impactPerUnit: p.impactPerUnit,
        isCertificateOnly: false,
        commitments: { create: p.commitments.map((text, i) => ({ text, order: i + 1 })) },
      },
    });
    console.log(`+ pledge ${p.slug}`);
  }

  for (const c of CERTIFICATES) {
    const exists = await prisma.pledge.findUnique({ where: { slug: c.slug } });
    if (exists) { console.log(`skip certificate ${c.slug} (exists)`); continue; }
    await prisma.pledge.create({
      data: {
        slug: c.slug, name: c.name, description: c.description, category: c.category,
        bgImageUrl: c.bgImageUrl, eventDate: c.eventDate,
        isCertificateOnly: true, impactMetric: 'certificate_issued', impactPerUnit: 1,
      },
    });
    console.log(`+ certificate ${c.slug}`);
  }

  for (const q of QUIZZES) {
    const exists = await prisma.quiz.findUnique({ where: { slug: q.slug } });
    if (exists) { console.log(`skip quiz ${q.slug} (exists)`); continue; }
    await prisma.quiz.create({
      data: {
        slug: q.slug, title: q.title, description: q.description, category: q.category,
        bgImageUrl: q.bgImageUrl,
        questions: {
          create: q.questions.map(([text, opts, correct], i) => ({
            text: text as string, order: i + 1,
            answerOptions: {
              create: (opts as string[]).map((o, j) => ({ text: o, isCorrect: j === (correct as number), order: j + 1 })),
            },
          })),
        },
      },
    });
    console.log(`+ quiz ${q.slug} (${(q.questions as unknown[]).length} Qs)`);
  }

  console.log('Done.');
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
