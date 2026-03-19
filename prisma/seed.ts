import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Pledges are managed manually — add real pledges here when ready.

  console.log('Seeding quizzes...')

  const quizzes = [
    { slug: 'sustainable-101', title: 'Sustainable Living 101', category: 'lifestyle', bgImageUrl: '/images/quizzes/sustainable-101.png' },
    { slug: 'house-sparrow', title: 'Bring Back the Chirp', category: 'environment', bgImageUrl: '/images/quizzes/sparrow-rotary.png' },
  ]

  for (const q of quizzes) {
    const quiz = await prisma.quiz.upsert({
      where: { slug: q.slug },
      update: { bgImageUrl: q.bgImageUrl },
      create: {
        slug: q.slug,
        title: q.title,
        description: `Attend the quiz, explore ${q.title.toLowerCase()}, and earn your certificate!`,
        category: q.category,
        bgImageUrl: q.bgImageUrl,
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
      } else if (quiz.slug === 'sustainable-101') {
        const count = await prisma.question.count({ where: { quizId: quiz.id } });
        if (count > 0) {
            await prisma.question.deleteMany({ where: { quizId: quiz.id } });
        }
        
        const question = await prisma.question.create({
          data: {
            quizId: quiz.id,
            text: `Which of the following aligns best with rapid sustainable living improvements?`,
            order: 1
          }
        });

        const options = [
          { text: "Reducing single-use plastics and waste", isCorrect: true },
          { text: "Leaving electronics plugged in 24/7", isCorrect: false },
          { text: "Using more disposable utensils daily", isCorrect: false },
          { text: "Driving short distances instead of walking", isCorrect: false }
        ];

        for (let j = 0; j < options.length; j++) {
          await prisma.answerOption.create({
            data: {
              questionId: question.id,
              text: options[j].text,
              isCorrect: options[j].isCorrect,
              order: j + 1
            }
          });
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
