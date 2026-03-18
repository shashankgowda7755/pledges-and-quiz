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
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 max-w-7xl mx-auto px-4 py-16 w-full">
        <h1 className="text-4xl md:text-5xl font-montserrat font-bold text-gray-900 mb-8">Active Pledges</h1>

        <div className="flex gap-3 mb-12 overflow-x-auto pb-2 scrollbar-hide">
          <Link
            href="/pledges"
            className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${!activeCategory ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
          >
            All
          </Link>
          {CATEGORIES.map(cat => (
            <Link
              key={cat}
              href={`/pledges?category=${cat.toLowerCase()}`}
              className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${activeCategory === cat ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >
              {cat}
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {pledges.map(p => (
            <div key={p.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col group hover:shadow-md transition-shadow">
              <div className="h-48 overflow-hidden relative bg-gray-100">
                {p.bgImageUrl && <img src={p.bgImageUrl} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />}
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-gray-800 uppercase tracking-wide">
                  {p.category}
                </div>
                {p.eventDate && (
                  <div className="absolute bottom-4 right-4 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                    {new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(p.eventDate))}
                  </div>
                )}
              </div>
              <div className="p-6 flex flex-col flex-1">
                <h3 className="text-xl font-bold font-montserrat text-gray-900 mb-2">{p.name}</h3>
                <p className="text-gray-600 text-sm mb-6 flex-1">{p.description}</p>
                <Link href={`/pledges/${p.slug}`} className="text-teal-600 font-semibold inline-flex items-center group-hover:text-teal-700">
                  Take This Pledge <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
                </Link>
              </div>
            </div>
          ))}
          {pledges.length === 0 && (
            <p className="text-gray-500 col-span-3 py-12 text-center">No pledges found in this category.</p>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
