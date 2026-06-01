export const dynamic = 'force-dynamic';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import prisma from '@/lib/prisma';

const CATEGORIES = ['Environment', 'Health', 'Social', 'Lifestyle'];

export default async function PledgesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const activeCategory = CATEGORIES.find(c => c.toLowerCase() === category?.toLowerCase());

  const pledges = await prisma.pledge.findMany({
    where: {
      isActive: true,
      ...(activeCategory ? { category: activeCategory.toLowerCase() } : {}),
    },
    orderBy: [{ eventDate: 'asc' }, { createdAt: 'desc' }],
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container-page py-16 w-full">
        <span className="eyebrow mb-3">Choose your promise</span>
        <h1 className="text-4xl md:text-5xl font-montserrat font-bold text-ink mb-3">Pledges</h1>
        <p className="text-lg text-[color:var(--muted)] max-w-2xl mb-10">
          Pick a cause, make your commitment, and download a certificate you can be proud to share.
        </p>

        <div className="flex gap-3 mb-12 overflow-x-auto pb-2">
          <Link
            href="/pledges"
            className={`px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${!activeCategory ? 'bg-forest text-white' : 'bg-white border border-[color:var(--line)] text-[color:var(--muted)] hover:border-forest/30'}`}
          >
            All
          </Link>
          {CATEGORIES.map(cat => (
            <Link
              key={cat}
              href={`/pledges?category=${cat.toLowerCase()}`}
              className={`px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${activeCategory === cat ? 'bg-forest text-white' : 'bg-white border border-[color:var(--line)] text-[color:var(--muted)] hover:border-forest/30'}`}
            >
              {cat}
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          {pledges.map(p => (
            <div key={p.id} className="card card-hover overflow-hidden flex flex-col group">
              <div className="h-48 overflow-hidden relative bg-[#eef6ef]">
                {p.bgImageUrl && <img src={p.bgImageUrl} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />}
                <span className="absolute top-4 left-4 chip bg-white/90 backdrop-blur">{p.category}</span>
                {p.eventDate && (
                  <div className="absolute bottom-4 right-4 bg-amber-sun text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                    {new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(p.eventDate))}
                  </div>
                )}
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
          {pledges.length === 0 && (
            <p className="text-[color:var(--muted)] col-span-3 py-12 text-center">No pledges in this category yet. Check back soon!</p>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
