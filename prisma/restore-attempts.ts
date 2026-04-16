/**
 * Restore quiz attempts from a Neon branch (point-in-time recovery).
 *
 * Usage:
 *   BRANCH_URL="postgresql://...@ep-xxx.neon.tech/neondb?sslmode=require" npx tsx prisma/restore-attempts.ts
 *
 * BRANCH_URL  = connection string of the Neon branch (restored to before deletion)
 * DATABASE_URL (from .env) = current main database
 */

import { PrismaClient } from '@prisma/client';

const branchUrl = process.env.BRANCH_URL;
if (!branchUrl) {
  console.error('ERROR: Set BRANCH_URL to the Neon branch connection string.');
  console.error('Example: BRANCH_URL="postgresql://...@ep-xxx.neon.tech/neondb?sslmode=require" npx tsx prisma/restore-attempts.ts');
  process.exit(1);
}

const mainUrl = process.env.DATABASE_URL;
if (!mainUrl) {
  console.error('ERROR: DATABASE_URL not set. Make sure .env or .env.local has it.');
  process.exit(1);
}

const branch = new PrismaClient({ datasources: { db: { url: branchUrl } } });
const main   = new PrismaClient({ datasources: { db: { url: mainUrl } } });

async function run() {
  console.log('Connecting to branch DB...');

  // 1. Find the old house-sparrow quiz on the branch
  const oldQuiz = await branch.quiz.findUnique({ where: { slug: 'house-sparrow' } });
  if (!oldQuiz) {
    console.error('house-sparrow quiz not found on branch. Check the restore timestamp.');
    process.exit(1);
  }
  console.log(`✓ Old quiz found: ${oldQuiz.id} (${oldQuiz.title})`);

  // 2. Read all attempts from the branch
  const oldAttempts = await branch.quizAttempt.findMany({ where: { quizId: oldQuiz.id } });
  console.log(`✓ Found ${oldAttempts.length} quiz attempts to restore`);

  if (oldAttempts.length === 0) {
    console.log('No attempts to restore. Done.');
    return;
  }

  // 3. Find the new quiz on main
  const newQuiz = await main.quiz.findUnique({ where: { slug: 'house-sparrow' } });
  if (!newQuiz) {
    console.error('house-sparrow quiz not found on main DB. Run seed-water.ts first.');
    process.exit(1);
  }
  console.log(`✓ New quiz on main: ${newQuiz.id}`);

  // 4. Insert attempts into main with the new quizId
  let restored = 0;
  let skipped = 0;
  for (const attempt of oldAttempts) {
    // Check if this email already has an attempt for the new quiz (unique constraint)
    const existing = await main.quizAttempt.findUnique({
      where: { userEmail_quizId: { userEmail: attempt.userEmail, quizId: newQuiz.id } },
    });
    if (existing) {
      skipped++;
      continue;
    }

    await main.quizAttempt.create({
      data: {
        quizId:         newQuiz.id,
        orgId:          attempt.orgId,
        userName:       attempt.userName,
        userEmail:      attempt.userEmail,
        whatsapp:       attempt.whatsapp,
        agreed:         attempt.agreed,
        score:          attempt.score,
        totalQuestions:  attempt.totalQuestions,
        createdAt:      attempt.createdAt,
      },
    });
    restored++;
  }

  console.log(`\n✅ Restored ${restored} quiz attempts (${skipped} duplicates skipped)`);
}

run()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => {
    await branch.$disconnect();
    await main.$disconnect();
  });
