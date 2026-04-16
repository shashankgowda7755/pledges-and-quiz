export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import prisma from '@/lib/prisma';
import ContactForm from './ContactForm';
import CopyLinkButton from './CopyLinkButton';

const TYPE_LABELS: Record<string, string> = {
  school: 'School',
  ngo: 'NGO',
  company: 'Company',
  other: 'Organization',
};

const TYPE_COLORS: Record<string, string> = {
  school: 'bg-blue-50 text-blue-700',
  ngo: 'bg-green-50 text-green-700',
  company: 'bg-purple-50 text-purple-700',
  other: 'bg-gray-100 text-gray-600',
};

export default async function OrganizationsPage() {
  const [orgs, firstQuiz] = await Promise.all([
    prisma.organization.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
      select: { name: true, slug: true, type: true, posterLogoUrl: true },
    }),
    prisma.quiz.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: 'asc' },
      select: { slug: true },
    }),
  ]);

  const quizSlug = firstQuiz?.slug ?? 'house-sparrow';
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://communitreepledges.netlify.app';

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 w-full">

        {/* ── Active Programs ── */}
        {orgs.length > 0 && (
          <section className="py-16 px-4 bg-white border-b border-gray-100">
            <div className="max-w-7xl mx-auto">
              <div className="mb-10">
                <span className="inline-block px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-bold uppercase tracking-widest mb-3">
                  Active Programs
                </span>
                <h2 className="text-3xl font-montserrat font-extrabold text-gray-900">
                  Partner Organizations
                </h2>
                <p className="text-gray-500 mt-2 text-base">
                  Each organization has their own quiz link. Share it with your community.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {orgs.map((org) => {
                  const quizUrl = `${APP_URL}/quiz/${quizSlug}?org=${org.slug}`;
                  const colorClass = TYPE_COLORS[org.type] ?? TYPE_COLORS.other;
                  const typeLabel = TYPE_LABELS[org.type] ?? 'Organization';

                  return (
                    <div
                      key={org.slug}
                      className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col gap-4"
                    >
                      {/* Logo + name row */}
                      <div className="flex items-center gap-3">
                        {org.posterLogoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={org.posterLogoUrl}
                            alt={org.name}
                            className="w-12 h-12 object-contain rounded-xl border border-gray-100 bg-gray-50 p-1 flex-shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center text-teal-500 flex-shrink-0">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                          </div>
                        )}
                        <div className="min-w-0">
                          <h3 className="font-bold text-gray-900 text-base leading-tight truncate">{org.name}</h3>
                          <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${colorClass}`}>
                            {typeLabel}
                          </span>
                        </div>
                      </div>

                      {/* Quiz link */}
                      <div className="mt-auto flex flex-col gap-2">
                        <Link
                          href={`/quiz/${quizSlug}?org=${org.slug}`}
                          className="w-full text-center bg-teal-500 hover:bg-teal-600 text-white font-bold rounded-xl py-3 text-sm transition-colors shadow-sm shadow-teal-500/20"
                        >
                          Take Quiz →
                        </Link>
                        <CopyLinkButton url={quizUrl} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* ── Hero ── */}
        <section className="bg-gray-900 py-24 px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-montserrat font-extrabold text-white mb-6">
              Turn Values into Visuals.
            </h1>
            <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
              Bring COMMUNITREE to your School, NGO, or Company.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
              <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 max-w-sm w-full">
                <div className="text-red-400 font-bold mb-2">The Old Way</div>
                <div className="text-gray-300 text-sm">Boring email pledge. No visual proof. No virality.</div>
              </div>
              <div className="text-gray-500 font-bold hidden sm:block">VS</div>
              <div className="bg-teal-900/30 p-6 rounded-xl border border-teal-500/30 max-w-sm w-full">
                <div className="text-teal-400 font-bold mb-2">The COMMUNITREE Way</div>
                <div className="text-gray-300 text-sm">Instant branded poster. Social sharing. Trackable impact.</div>
              </div>
            </div>
            <a href="#contact-form" className="inline-block bg-teal-400 text-gray-900 rounded-full px-8 py-4 font-bold hover:bg-teal-300 transition-colors">
              Get Your Custom Pledge Program
            </a>
          </div>
        </section>

        {/* ── How It Works ── */}
        <section className="py-20 px-4 bg-white">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-montserrat font-bold text-center text-gray-900 mb-16">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
              {[
                { n: '1', title: 'You Connect', body: 'Fill the form below, and we create your custom pledge page with your branding.' },
                { n: '2', title: 'Your Team Acts', body: 'Your community pledges, ticks commitments, and downloads their branded poster.' },
                { n: '3', title: 'You Report', body: 'Receive a monthly impact PDF emailed to you on Day 1 of each month.' },
              ].map(s => (
                <div key={s.n}>
                  <div className="w-16 h-16 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center font-bold text-2xl mx-auto mb-6">{s.n}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{s.title}</h3>
                  <p className="text-gray-600">{s.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── What Orgs Get ── */}
        <section className="py-20 px-4 bg-gray-50 border-t border-gray-200">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-montserrat font-bold text-center text-gray-900 mb-16">What You Get</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                { icon: '🎯', title: 'Your Brand, Their Commitment', body: "Your organization's logo is watermarked on every poster generated by your community." },
                { icon: '📊', title: 'Monthly Impact Reports', body: "Detailed PDF reports summarizing the collective impact of your community's pledges." },
                { icon: '🏅', title: 'The Branded Certificate', body: 'A co-branded, frame-worthy PNG certificate for every participant.' },
                { icon: '✨', title: 'Custom Pledge Creation', badge: 'Premium', body: 'Work with us to design a bespoke pledge challenge exclusive to your organization.' },
              ].map(item => (
                <div key={item.title} className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-4 relative overflow-hidden">
                  {item.badge && (
                    <div className="absolute top-4 right-4 bg-yellow-100 text-yellow-800 text-xs font-bold px-3 py-1 rounded-full">{item.badge}</div>
                  )}
                  <div className="text-3xl">{item.icon}</div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-gray-600">{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Contact Form ── */}
        <section id="contact-form" className="py-24 px-4 bg-white">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-montserrat font-bold text-gray-900 mb-4">Let&apos;s Create Impact Together</h2>
              <p className="text-gray-600">Complete the form below and we&apos;ll send you a mock-up within 24 hours.</p>
            </div>
            <div className="bg-gray-50 rounded-3xl p-8 md:p-12 border border-gray-100 shadow-sm">
              <ContactForm />
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
