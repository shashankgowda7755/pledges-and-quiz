export const dynamic = 'force-dynamic';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import prisma from '@/lib/prisma';
import { CERTIFICATE_ONLY_SLUG_LIST } from '@/lib/pledgeMode';

export const metadata = {
  title: 'Certificates | COMMUNITREE & EZONE',
  description: 'Branded event certificates from COMMUNITREE & EZONE — pick your event and download instantly.',
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
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container-page py-16 w-full">
        <span className="eyebrow mb-3">Branded events</span>
        <h1 className="text-4xl md:text-5xl font-montserrat font-bold text-ink mb-3">Certificates</h1>
        <p className="text-lg text-[color:var(--muted)] mb-12 max-w-2xl">
          Pick your event, add your name and photo, and download a personalised certificate of participation — instantly.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          {events.map(p => (
            <div key={p.id} className="card card-hover overflow-hidden flex flex-col group">
              <div className="h-48 overflow-hidden relative bg-[#eef6ef]">
                {p.bgImageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.bgImageUrl} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                )}
                <span className="absolute top-4 left-4 chip bg-white/90 backdrop-blur">{p.category}</span>
                {p.eventDate && (
                  <div className="absolute bottom-4 right-4 bg-amber-sun text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                    {new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(p.eventDate))}
                  </div>
                )}
              </div>
              <div className="p-6 flex flex-col flex-1">
                <h3 className="text-xl font-bold font-montserrat text-ink mb-2">{p.name}</h3>
                <p className="text-[color:var(--muted)] text-sm mb-6 flex-1 leading-relaxed">{p.description}</p>
                <Link href={`/pledges/${p.slug}`} className="link-arrow group/cta">
                  Get my certificate <span className="group-hover/cta:translate-x-1 transition-transform">→</span>
                </Link>
              </div>
            </div>
          ))}
          {events.length === 0 && (
            <p className="text-[color:var(--muted)] col-span-3 py-12 text-center">No certificates available right now. Check back soon!</p>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
