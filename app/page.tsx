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

  const livePledge = 
    pledges.find(p => p.eventDate && new Date(p.eventDate).toDateString() === new Date().toDateString()) || 
    pledges.find(p => p.isFeatured) || 
    pledges[0];
    
  const upcomingPledges = pledges.filter(p => p.eventDate && new Date(p.eventDate) > new Date()).slice(0, 10);
  const timelessPledges = pledges.filter(p => !p.eventDate).slice(0, 6);
  
  const quizzes = await prisma.quiz.findMany({
    where: { isActive: true, isFeatured: true },
    take: 3
  });

  const [totalPledges, totalOrgs, impactResult] = await Promise.all([
    prisma.submission.count(),
    prisma.organization.count({ where: { isActive: true } }),
    prisma.pledge.findMany({ include: { _count: { select: { submissions: true } } } })
  ]);
  
  const totalImpact = impactResult.reduce((acc, p) => acc + (p._count.submissions * p.impactPerUnit), 0);

  return (
    <>
      <Header />
      <main className="flex-1 bg-white">
        
        {/* A — Hero */}
        <section className="bg-gradient-to-b from-white to-[#f0fdfa] py-20 px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-montserrat font-extrabold text-gray-900 mb-6 tracking-tight">Make Your Mark.<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-teal-600">Take the Pledge.</span></h1>
            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto font-inter">Pledge in 30 seconds. Download your poster instantly. Share with the world.</p>
            <div className="flex flex-col items-center">
              <Link href="/pledges" className="bg-teal-400 text-white rounded-full px-8 py-3 text-lg font-bold hover:bg-teal-500 transition-colors shadow-lg shadow-teal-500/30">
                Pledge Now & Get Your Poster
              </Link>
              <p className="text-sm text-gray-500 mt-4 font-medium">No login required. Free forever.</p>
            </div>
          </div>
        </section>

        {/* B — Live Now Card */}
        {livePledge && (
          <section id="live-pledge" className="max-w-5xl mx-auto px-4 -mt-8 relative z-10 mb-20">
            <div className="bg-white rounded-2xl shadow-xl border-l-[6px] border-[#f97316] p-1 flex flex-col md:flex-row border-y border-r border-gray-100 overflow-hidden">
              <div className="w-full md:w-1/3 aspect-[4/3] md:aspect-auto md:h-full relative overflow-hidden bg-gray-100">
                  {livePledge.bgImageUrl && <img src={livePledge.bgImageUrl} alt={livePledge.name} className="object-cover w-full h-full absolute inset-0 min-h-[250px]" />}
              </div>
              <div className="p-8 md:p-12 w-full md:w-2/3">
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex h-3 w-3 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-[#f97316]"></span>
                  </span>
                  <span className="text-[#f97316] font-bold tracking-wider text-sm uppercase">Live Today</span>
                </div>
                <h2 className="text-3xl font-montserrat font-bold text-gray-900 mb-4">{livePledge.name}</h2>
                <p className="text-gray-600 mb-8 max-w-lg">{livePledge.description}</p>
                <Link href={`/pledges/${livePledge.slug}`} className="inline-flex items-center text-teal-600 font-bold hover:text-teal-700 text-lg group">
                  Join Now <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* F — Impact Ticker */}
        <section id="stats" className="bg-gray-900 py-16 px-4">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 text-center divide-y md:divide-y-0 md:divide-x divide-gray-800">
            <div className="pt-8 md:pt-0">
               <div className="text-5xl font-ibm-mono font-bold text-[#00ff88] mb-2"><CountUpClient end={totalPledges} /></div>
               <div className="text-gray-400 font-medium uppercase tracking-widest text-sm">Voices Raised</div>
            </div>
            <div className="pt-8 md:pt-0">
               <div className="text-5xl font-ibm-mono font-bold text-[#00ff88] mb-2"><CountUpClient end={totalOrgs} /></div>
               <div className="text-gray-400 font-medium uppercase tracking-widest text-sm">Organizations</div>
            </div>
            <div className="pt-8 md:pt-0">
               <div className="text-5xl font-ibm-mono font-bold text-[#00d9ff] mb-2"><CountUpClient end={Math.round(totalImpact)} /></div>
               <div className="text-gray-400 font-medium uppercase tracking-widest text-sm">Impact Created</div>
            </div>
          </div>
        </section>

        {/* D — Affirmation Wall */}
        <section id="everyday-pledges" className="py-24 px-4 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-end mb-12 flex-col sm:flex-row gap-4">
              <div>
                <h2 className="text-4xl font-montserrat font-bold text-gray-900 mb-2">Everyday Pledges</h2>
                <p className="text-xl text-gray-500">Small acts, huge impact. Pick your promise.</p>
              </div>
              <Link href="/pledges" className="text-teal-600 font-semibold hover:text-teal-700 flex-shrink-0">View All Pledges →</Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {timelessPledges.map(p => (
                <div key={p.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col group hover:shadow-md hover:border-teal-100 transition-all">
                  <div className="h-48 overflow-hidden relative bg-gray-100">
                    {p.bgImageUrl && <img src={p.bgImageUrl} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />}
                    <div className="absolute top-4 left-4 bg-white/95 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-gray-800 uppercase tracking-wide">
                      {p.category}
                    </div>
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="text-xl font-bold font-montserrat text-gray-900 mb-3">{p.name}</h3>
                    <p className="text-gray-600 text-sm mb-6 flex-1 pt-1 border-t border-gray-100">{p.description}</p>
                    <Link href={`/pledges/${p.slug}`} className="text-teal-600 font-semibold inline-flex items-center group-hover:text-teal-700">
                      Take This Pledge <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* E — Quiz Teaser */}
        <section id="quizzes" className="py-24 px-4 bg-white">
          <div className="max-w-7xl mx-auto text-center">
            <span className="text-teal-600 font-bold tracking-widest uppercase text-sm mb-4 block">Test Yourself</span>
            <h2 className="text-4xl font-montserrat font-bold text-gray-900 mb-12">Take a Quiz. Earn Your Certificate.</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 text-left">
              {quizzes.map(q => (
                <div key={q.id} className="bg-gray-50 rounded-2xl p-8 border border-gray-100 hover:border-teal-100 hover:bg-teal-50/30 transition-colors">
                  <div className="text-xs font-bold text-teal-600 uppercase tracking-wide mb-3">{q.category}</div>
                  <h3 className="text-2xl font-bold font-montserrat text-gray-900 mb-4">{q.title}</h3>
                  <Link href={`/quiz/${q.slug}`} className="inline-flex items-center text-gray-900 font-bold hover:text-teal-600 group">
                    Start Quiz <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                  </Link>
                </div>
              ))}
            </div>
            
            <Link href="/quiz" className="border-2 border-teal-400 text-teal-600 bg-transparent rounded-full px-10 py-4 font-bold hover:bg-teal-50 hover:border-teal-500 transition-colors inline-block">
              Browse All Quizzes →
            </Link>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
