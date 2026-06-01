export const dynamic = 'force-dynamic';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import prisma from '@/lib/prisma';
import { CERTIFICATE_ONLY_SLUG_LIST } from '@/lib/pledgeMode';

export const metadata = {
  title: 'Certificates | Communitree & EZONE',
  description: 'Branded event certificates from Communitree & EZONE — pick your event and download instantly.',
};

export default async function CertificatesPage() {
  const events = await prisma.pledge.findMany({
    where: {
      isActive: true,
      OR: [
        { isCertificateOnly: true },
        { slug: { in: [...CERTIFICATE_ONLY_SLUG_LIST] } }, // legacy fallback
      ],
    },
    orderBy: [{ eventDate: 'desc' }, { createdAt: 'desc' }],
  });

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 max-w-7xl mx-auto px-4 py-16 w-full">
        <h1 className="text-4xl md:text-5xl font-montserrat font-bold text-gray-900 mb-3">Certificates</h1>
        <p className="text-lg text-gray-500 mb-12 max-w-2xl">
          Branded event certificates. Pick your event, enter your details, and download your certificate instantly.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map(p => (
            <div key={p.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col group hover:shadow-md transition-shadow">
              <div className="h-48 overflow-hidden relative bg-gray-100">
                {p.bgImageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.bgImageUrl} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                )}
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-gray-800 uppercase tracking-wide">
                  {p.category}
                </div>
                {p.eventDate && (
                  <div className="absolute bottom-4 right-4 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                    {new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(p.eventDate))}
                  </div>
                )}
              </div>
              <div className="p-6 flex flex-col flex-1">
                <h3 className="text-xl font-bold font-montserrat text-gray-900 mb-2">{p.name}</h3>
                <p className="text-gray-600 text-sm mb-6 flex-1">{p.description}</p>
                <Link href={`/pledges/${p.slug}`} className="text-teal-600 font-semibold inline-flex items-center group-hover:text-teal-700">
                  Get My Certificate <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
                </Link>
              </div>
            </div>
          ))}
          {events.length === 0 && (
            <p className="text-gray-500 col-span-3 py-12 text-center">No certificates available right now. Check back soon!</p>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
