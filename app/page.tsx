export const dynamic = 'force-dynamic';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import prisma from '@/lib/prisma';
import CountUpClient from '@/components/CountUpClient';

export default async function Home() {
  const pledges = await prisma.pledge.findMany({
    where: { isActive: true },
    orderBy: { eventDate: 'desc' }
  });

  const isSameDay = (a: Date, b: Date) =>
    a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth() &&
    a.getUTCDate() === b.getUTCDate();

  const todayUTC = new Date();
  const todaysEvent = pledges.find(p => p.eventDate && isSameDay(new Date(p.eventDate), todayUTC));
  const livePledge = todaysEvent || pledges.find(p => p.isFeatured) || pledges[0];
    
  const upcomingPledges = pledges.filter(p => p.eventDate && new Date(p.eventDate) > new Date()).slice(0, 10);
  const timelessPledges = pledges.filter(p => !p.eventDate).slice(0, 6);
  
  const quizzes = await prisma.quiz.findMany({
    where: { isActive: true, isFeatured: true },
    take: 3
  });

  const [totalPledges, totalOrgs, totalQuizAttempts] = await Promise.all([
    prisma.submission.count(),
    prisma.organization.count({ where: { isActive: true } }),
    prisma.quizAttempt.count(),
  ]);

  const steps = [
    { n: '01', t: 'Pick a pledge or quiz', d: 'Choose a cause you care about — from planting trees to saving water.' },
    { n: '02', t: 'Add your details & photo', d: 'Snap a photo or upload one. Your name goes right onto the certificate.' },
    { n: '03', t: 'Download & share', d: 'Get a personalised certificate instantly and share your commitment.' },
  ];

  return (
    <>
      <Header />
      <main className="flex-1">

        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#eef6ef] via-cream to-cream" />
          <div className="absolute -top-24 -right-24 -z-10 h-96 w-96 rounded-full bg-leaf/15 blur-3xl" />
          <div className="container-page py-20 md:py-28 text-center">
            <span className="eyebrow mb-5">🌱 COMMUNITREE &amp; EZONE</span>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-montserrat font-extrabold text-ink tracking-tight leading-[1.05] mb-6">
              Turning intentions<br /><span className="text-forest">into action.</span>
            </h1>
            <p className="text-lg md:text-xl text-[color:var(--muted)] max-w-2xl mx-auto mb-10">
              Take a pledge, test what you know, and earn a personalised certificate in under a minute — and help grow real man-made forests.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/pledges" className="btn-primary text-lg">Take a Pledge →</Link>
              <Link href="/quiz" className="btn-ghost text-lg">Try a Quiz</Link>
            </div>
            <p className="text-sm text-[color:var(--muted)] mt-5 font-medium">No login required · Free forever</p>
          </div>
        </section>

        {/* Live / featured card */}
        {livePledge && (
          <section id="live-pledge" className="container-page relative z-10 -mt-6 mb-24">
            <div className="card overflow-hidden flex flex-col md:flex-row">
              <div className="w-full md:w-2/5 aspect-[4/3] md:aspect-auto relative overflow-hidden bg-[#eef6ef] min-h-[260px]">
                {livePledge.bgImageUrl && <img src={livePledge.bgImageUrl} alt={livePledge.name} className="object-cover w-full h-full absolute inset-0" />}
              </div>
              <div className="p-8 md:p-12 w-full md:w-3/5 flex flex-col justify-center">
                <div className="flex items-center gap-2.5 mb-4">
                  <span className="flex h-2.5 w-2.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-sun opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-sun" />
                  </span>
                  <span className="text-amber-sun font-bold tracking-[0.15em] text-xs uppercase">
                    {todaysEvent ? 'Live today' : 'Featured'}
                  </span>
                </div>
                <h2 className="text-3xl font-montserrat font-bold text-ink mb-3">{livePledge.name}</h2>
                <p className="text-[color:var(--muted)] mb-8 max-w-lg leading-relaxed">{livePledge.description}</p>
                <Link href={`/pledges/${livePledge.slug}`} className="link-arrow text-lg group">
                  Join now <span className="group-hover:translate-x-1 transition-transform">→</span>
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* How it works */}
        <section className="container-page pb-24">
          <div className="text-center mb-14">
            <span className="eyebrow mb-3">How it works</span>
            <h2 className="text-3xl md:text-4xl font-montserrat font-bold text-ink">Three steps to your certificate</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.map(s => (
              <div key={s.n} className="card p-8">
                <div className="font-ibm-mono text-2xl font-bold text-leaf mb-4">{s.n}</div>
                <h3 className="text-xl font-bold font-montserrat text-ink mb-2">{s.t}</h3>
                <p className="text-[color:var(--muted)] leading-relaxed">{s.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Impact band */}
        <section id="stats" className="bg-forest text-white">
          <div className="container-page py-16">
            <p className="text-center text-leaf-300 font-semibold uppercase tracking-[0.18em] text-xs mb-10">Our impact so far</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center divide-y md:divide-y-0 md:divide-x divide-white/10">
              <div className="pt-8 md:pt-0">
                <div className="text-5xl font-montserrat font-extrabold mb-2"><CountUpClient end={totalPledges} /></div>
                <div className="text-white/60 font-medium uppercase tracking-widest text-xs">Pledges Taken</div>
              </div>
              <div className="pt-8 md:pt-0">
                <div className="text-5xl font-montserrat font-extrabold mb-2"><CountUpClient end={totalOrgs} /></div>
                <div className="text-white/60 font-medium uppercase tracking-widest text-xs">Partner Organizations</div>
              </div>
              <div className="pt-8 md:pt-0">
                <div className="text-5xl font-montserrat font-extrabold mb-2"><CountUpClient end={totalQuizAttempts} /></div>
                <div className="text-white/60 font-medium uppercase tracking-widest text-xs">Quizzes Completed</div>
              </div>
            </div>
          </div>
        </section>

        {/* Everyday pledges */}
        {timelessPledges.length > 0 && (
          <section id="everyday-pledges" className="container-page py-24">
            <div className="flex justify-between items-end mb-12 flex-col sm:flex-row gap-4">
              <div>
                <span className="eyebrow mb-2">Start today</span>
                <h2 className="text-3xl md:text-4xl font-montserrat font-bold text-ink">Everyday pledges</h2>
                <p className="text-lg text-[color:var(--muted)] mt-1">Small promises that add up. Pick yours.</p>
              </div>
              <Link href="/pledges" className="link-arrow flex-shrink-0">View all pledges →</Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
              {timelessPledges.map(p => (
                <div key={p.id} className="card card-hover overflow-hidden flex flex-col group">
                  <div className="h-48 overflow-hidden relative bg-[#eef6ef]">
                    {p.bgImageUrl && <img src={p.bgImageUrl} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />}
                    <span className="absolute top-4 left-4 chip bg-white/90 backdrop-blur">{p.category}</span>
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="text-xl font-bold font-montserrat text-ink mb-2">{p.name}</h3>
                    <p className="text-[color:var(--muted)] text-sm mb-6 flex-1 leading-relaxed">{p.description}</p>
                    <Link href={`/pledges/${p.slug}`} className="link-arrow group/cta">
                      Take this pledge <span className="group-hover/cta:translate-x-1 transition-transform">→</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Quiz teaser */}
        {quizzes.length > 0 && (
          <section id="quizzes" className="bg-[#eef6ef]">
            <div className="container-page py-24 text-center">
              <span className="eyebrow mb-3">Test yourself</span>
              <h2 className="text-3xl md:text-4xl font-montserrat font-bold text-ink mb-12">Take a quiz. Earn your certificate.</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 text-left">
                {quizzes.map(q => (
                  <Link key={q.id} href={`/quiz/${q.slug}`} className="card card-hover p-8 group">
                    <div className="chip mb-4">{q.category}</div>
                    <h3 className="text-2xl font-bold font-montserrat text-ink mb-4">{q.title}</h3>
                    <span className="link-arrow">Start quiz <span className="group-hover:translate-x-1 transition-transform">→</span></span>
                  </Link>
                ))}
              </div>

              <Link href="/quiz" className="btn-ghost">Browse all quizzes →</Link>
            </div>
          </section>
        )}

        {/* Mission CTA */}
        <section className="container-page py-24">
          <div className="card bg-forest text-white p-10 md:p-16 text-center overflow-hidden relative">
            <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-leaf/20 blur-3xl" />
            <span className="text-leaf-300 font-semibold uppercase tracking-[0.18em] text-xs">Join the movement</span>
            <h2 className="text-3xl md:text-5xl font-montserrat font-extrabold mt-4 mb-5 max-w-3xl mx-auto leading-tight">
              Every pledge plants a seed. Be part of the forest.
            </h2>
            <p className="text-white/70 max-w-xl mx-auto mb-9">
              COMMUNITREE &amp; EZONE bring communities together to grow man-made forests and protect nature — one small act at a time.
            </p>
            <Link href="/pledges" className="inline-flex items-center gap-2 rounded-full bg-white text-forest font-bold px-8 py-3.5 hover:bg-leaf-300 transition-colors">
              Take your pledge →
            </Link>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
