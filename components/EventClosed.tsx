import Link from 'next/link';

// Shown when an event (pledge / certificate / quiz) is deactivated. The event
// stays visible, but entries are closed.
export default function EventClosed({ slug, kind }: { slug: string; kind: 'pledge' | 'quiz' }) {
  const backHref = kind === 'quiz' ? `/quiz/${slug}` : `/pledges/${slug}`;
  return (
    <div className="max-w-md w-full text-center bg-white rounded-3xl border border-gray-100 shadow-sm p-10">
      <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-amber-50 flex items-center justify-center text-3xl">🔒</div>
      <h2 className="text-2xl font-montserrat font-extrabold text-gray-900 mb-2">This event is over</h2>
      <p className="text-gray-500 mb-8">Entries are closed and no longer being accepted. Thanks for your interest — keep an eye out for our next one.</p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link href={backHref} className="rounded-full border border-gray-200 px-6 py-3 font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
          Back
        </Link>
        <Link href="/events" className="rounded-full bg-teal-500 text-white px-6 py-3 font-semibold hover:bg-teal-600 transition-colors">
          See other events
        </Link>
      </div>
    </div>
  );
}
