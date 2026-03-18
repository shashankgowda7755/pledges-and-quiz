import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding pledges...')

  const nextMonth = new Date();
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  nextMonth.setDate(5);

  const pledges = [
    { slug: 'reusable-bottle', name: 'Carry a Reusable Bottle', category: 'environment', impactMetric: 'bottles_saved', impactPerUnit: 30 },
    { slug: 'wooden-earbuds', name: 'Switch to Wooden Earbuds', category: 'lifestyle', impactMetric: 'plastic_grams', impactPerUnit: 50 },
    { slug: 'walk-10k-steps', name: 'Walk 10,000 Steps Today', category: 'health', impactMetric: 'calories_burned', impactPerUnit: 400, eventDate: nextMonth },
    { slug: 'no-plastic', name: 'Reduce Single-Use Plastic', category: 'environment', impactMetric: 'plastic_avoided', impactPerUnit: 10 },
    { slug: 'meatless-monday', name: 'Go Meatless on Mondays', category: 'health', impactMetric: 'co2_kg_saved', impactPerUnit: 2.5 },
    { slug: 'plant-one-tree', name: 'Plant One Tree This Month', category: 'environment', impactMetric: 'trees_planted', impactPerUnit: 1 },
    { slug: 'public-transport', name: 'Use Public Transport This Week', category: 'environment', impactMetric: 'co2_kg_saved', impactPerUnit: 5 },
    { slug: 'support-local', name: 'Support a Local Vendor Today', category: 'social', impactMetric: 'local_supported', impactPerUnit: 1 },
    { slug: 'sustainable-pkg', name: 'Use Sustainable Packaging', category: 'environment', impactMetric: 'plastic_avoided', impactPerUnit: 15 },
    { slug: 'read-30-min', name: 'Read for 30 Minutes Daily', category: 'lifestyle', impactMetric: 'reading_hours', impactPerUnit: 0.5 },
  ]

  for (const p of pledges) {
    const pledge = await prisma.pledge.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        slug: p.slug,
        name: p.name,
        description: `Commit to ${p.name.toLowerCase()} and make a tangible difference in the world.`,
        category: p.category,
        bgImageUrl: `/images/pledges/${p.slug}.png`,
        impactMetric: p.impactMetric,
        impactPerUnit: p.impactPerUnit,
        eventDate: p.eventDate || null,
        isFeatured: Math.random() > 0.6,
      }
    })

    const count = await prisma.pledgeCommitment.count({ where: { pledgeId: pledge.id } });
    if (count === 0) {
      for (let i = 1; i <= 10; i++) {
        await prisma.pledgeCommitment.create({
          data: {
            pledgeId: pledge.id,
            text: `I will keep commitment #${i} for the ${pledge.name} pledge.`,
            order: i
          }
        })
      }
    }
  }

  console.log('Seeding quizzes...')

  const quizzes = [
    { slug: 'ocean-basics', title: 'Ocean Conservation Basics', category: 'environment' },
    { slug: 'sustainable-101', title: 'Sustainable Living 101', category: 'lifestyle' },
    { slug: 'mental-wellness', title: 'Mental Wellness Check', category: 'health' },
    { slug: 'house-sparrow', title: 'House Sparrow Challenge', category: 'environment' },
  ]

  for (const q of quizzes) {
    const quiz = await prisma.quiz.upsert({
      where: { slug: q.slug },
      update: {},
      create: {
        slug: q.slug,
        title: q.title,
        description: `Test your knowledge on ${q.title.toLowerCase()} and earn your certificate!`,
        category: q.category,
        bgImageUrl: `/images/quizzes/${q.slug}.png`,
        isFeatured: true
      }
    })

    const count = await prisma.question.count({ where: { quizId: quiz.id } });
    if (count === 0) {
      if (quiz.slug === 'house-sparrow') {
        const sparrowQuestions = [
          {
            text: "What is the primary diet of sparrows?",
            options: ["Seeds & insects", "Fruits & nuts", "Fish", "Leaves"],
            correctIndex: 0
          },
          {
            text: "What sound does a sparrow typically make?",
            options: ["Quack", "Hoot", "Chirp", "Caw"],
            correctIndex: 2
          },
          {
            text: "How long do sparrows typically live in the wild?",
            options: ["1–2 years", "3–5 years", "6–10 years", "11–15 years"],
            correctIndex: 1
          },
          {
            text: "What is a group of sparrows called?",
            options: ["Flock", "School", "Herd", "Swarm"],
            correctIndex: 0
          },
          {
            text: "What is a baby sparrow called?",
            options: ["Kitten", "Pup", "Chick", "Cub"],
            correctIndex: 2
          },
          {
            text: "How do sparrows communicate with each other?",
            options: ["Feather display", "Dances", "Beak taps", "Songs and calls"],
            correctIndex: 3
          },
          {
            text: "How many species of sparrows are there?",
            options: ["About 50", "About 100", "About 200", "About 300"],
            correctIndex: 2
          },
          {
            text: "What is the most common species of sparrow?",
            options: ["House Sparrow", "Song Sparrow", "Tree Sparrow", "Savannah Sparrow"],
            correctIndex: 0
          },
          {
            text: "What's the average weight of a House Sparrow?",
            options: ["10–15 grams", "20–25 grams", "30–35 grams", "40–45 grams"],
            correctIndex: 1
          },
          {
            text: "How far can sparrows travel from their nest to find food?",
            options: ["100 meters", "500 meters", "1 kilometer", "5 kilometers"],
            correctIndex: 1
          },
          {
            text: "What season do sparrows molt their feathers?",
            options: ["Spring", "Summer", "Winter", "Fall"],
            correctIndex: 3
          },
          {
            text: "What colour are the legs of a House Sparrow?",
            options: ["Blue", "Red", "Brown", "Yellow"],
            correctIndex: 2
          },
          {
            text: "What type of sparrow has a black patch on its chest?",
            options: ["Tree Sparrow", "House Sparrow", "Song Sparrow", "Savannah Sparrow"],
            correctIndex: 1
          },
          {
            text: "What is the wingspan of an average House Sparrow?",
            options: ["10–12 cm", "13–15 cm", "16–18 cm", "19–21 cm"],
            correctIndex: 2
          },
          {
            text: "What is the scientific name of the House Sparrow?",
            options: ["Passer domesticus", "Passer montanus", "Melospiza melodia", "None of the above"],
            correctIndex: 0
          },
          {
            text: "What feature distinguishes male and female House Sparrows?",
            options: ["Colour of feathers", "Beak size", "Leg length", "Tail shape"],
            correctIndex: 0
          },
          {
            text: "How long does it take for sparrow eggs to hatch?",
            options: ["3–5 days", "6–8 days", "11–14 days", "15–20 days"],
            correctIndex: 2
          },
          {
            text: "What is the typical clutch size for a sparrow?",
            options: ["1–2 eggs", "3–7 eggs", "8–10 eggs", "11–15 eggs"],
            correctIndex: 1
          },
          {
            text: "Where are sparrows commonly found in India?",
            options: ["Assam", "Kashmir", "South India & Assam", "Mostly South"],
            correctIndex: 2
          },
          {
            text: "How many eggs do sparrows usually lay?",
            options: ["5–6", "4–5", "6–8", "3–4"],
            correctIndex: 1
          }
        ];

        for (let i = 0; i < sparrowQuestions.length; i++) {
          const sq = sparrowQuestions[i];
          const question = await prisma.question.create({
            data: {
              quizId: quiz.id,
              text: sq.text,
              order: i + 1
            }
          });

          for (let j = 0; j < sq.options.length; j++) {
            await prisma.answerOption.create({
              data: {
                questionId: question.id,
                text: sq.options[j],
                isCorrect: j === sq.correctIndex,
                order: j + 1
              }
            });
          }
        }
      } else {
        for (let i = 1; i <= 4; i++) {
          const question = await prisma.question.create({
            data: {
              quizId: quiz.id,
              text: `Sample question ${i} about ${quiz.title}?`,
              order: i
            }
          })

          for (let j = 1; j <= 4; j++) {
            await prisma.answerOption.create({
              data: {
                questionId: question.id,
                text: `Option ${j} for Question ${i}`,
                isCorrect: j === 1,
                order: j
              }
            })
          }
        }
      }
    }
  }

  console.log('Seeding complete!')
}

main()
  .then(async () => { await prisma.$disconnect() })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
