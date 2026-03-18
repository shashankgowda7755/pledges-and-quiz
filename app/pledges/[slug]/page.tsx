import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import prisma from '@/lib/prisma';
import { SharePledgeLink } from '@/components/SharePledgeLink';

export async function generateMetadata(context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  const pledge = await prisma.pledge.findUnique({ where: { slug } });
  if (!pledge) return {};
  
  return {
    title: `${pledge.name} | PledgeMarks`,
    description: pledge.description.slice(0, 155),
    openGraph: { images: [pledge.bgImageUrl] }
  };
}

export default async function PledgeLandingPage(context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  const pledge = await prisma.pledge.findUnique({
    where: { slug },
    include: { _count: { select: { submissions: true } } }
  });

  if (!pledge) notFound();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 w-full flex flex-col">
        {/* A — Hero */}
        <section className="w-full min-h-[400px] relative flex flex-col items-center justify-center">
            {pledge.bgImageUrl && <img src={pledge.bgImageUrl} alt={pledge.name} className="absolute inset-0 w-full h-full object-cover" />}
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/80"></div>
            <div className="relative z-10 text-center px-4 max-w-4xl mx-auto py-16 mt-auto">
               <span className="inline-block px-4 py-1 rounded-full bg-white/20 backdrop-blur-md text-white font-bold text-xs uppercase tracking-widest mb-6">
                 {pledge.category}
               </span>
               <h1 className="text-4xl md:text-6xl font-montserrat font-extrabold text-white mb-4 leading-tight shadow-sm">
                 {pledge.name}
               </h1>
               {pledge.eventDate && (
                 <p className="text-teal-300 font-bold text-lg">
                    Event Date: {new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(pledge.eventDate))}
                 </p>
               )}
            </div>
        </section>

        {/* B, C, D — Content & CTA */}
        <section className="max-w-3xl mx-auto px-4 py-16 text-center w-full">
          <p className="text-2xl text-gray-700 font-medium mb-10 leading-relaxed">
            {pledge.description}
          </p>
          
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-12">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Our impact, together.</h3>
            <p className="text-gray-600 mb-6 font-medium">Each pledge equals <strong className="text-teal-600 font-bold text-lg">{pledge.impactPerUnit} {pledge.impactMetric.replace(/_/g, ' ')}</strong>.</p>
            
            <div className="flex items-center justify-center gap-3 text-gray-800 font-bold text-lg bg-gray-50 py-5 rounded-xl border border-gray-100">
              <span className="text-teal-500 text-3xl">👥</span>
              <span>{pledge._count.submissions.toLocaleString()} people have already pledged</span>
            </div>
          </div>
          
          <Link href={`/pledges/${pledge.slug}/take`} className="inline-block bg-teal-500 text-white rounded-full px-12 py-5 text-xl font-bold hover:bg-teal-600 shadow-xl shadow-teal-500/20 transition-all hover:-translate-y-1">
            Take This Pledge
          </Link>
          
          <SharePledgeLink title={pledge.name} />
        </section>
      </main>
      <Footer />
    </div>
  );
}
