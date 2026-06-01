import prisma from '@/lib/prisma';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import DeletePledgeButton from '../pledges/DeletePledgeButton';
import { CERTIFICATE_ONLY_SLUG_LIST } from '@/lib/pledgeMode';

export const dynamic = 'force-dynamic';

export default async function AdminCertificatesPage() {
  const certs = await prisma.pledge.findMany({
    where: {
      OR: [
        { isCertificateOnly: true },
        { slug: { in: [...CERTIFICATE_ONLY_SLUG_LIST] } }, // legacy fallback
      ],
    },
    orderBy: [{ eventDate: 'desc' }, { createdAt: 'desc' }],
    include: { _count: { select: { submissions: true } } },
  });

  return (
    <div className="pb-16 animate-in fade-in duration-500">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Certificates</h1>
          <p className="text-gray-500 text-sm mt-2">
            {certs.length} certificate{certs.length !== 1 ? 's' : ''} — branded, certificate-only events shown on the public Certificates page.
          </p>
        </div>
        <Link href="/admin/certificates/new" className="bg-teal-500 hover:bg-teal-600 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-md shadow-teal-500/20">
          + New Certificate
        </Link>
      </div>

      <div className="bg-white rounded-[1.5rem] border border-gray-100 shadow-sm overflow-hidden mb-12">
        {certs.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">🎓</p>
            <p className="font-medium">No certificates yet</p>
            <Link href="/admin/certificates/new" className="text-teal-600 text-sm font-semibold mt-2 inline-block hover:underline">Create your first certificate →</Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100">
                  <th className="text-left px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Certificate</th>
                  <th className="text-left px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="text-left px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Issued</th>
                  <th className="text-left px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-right px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {certs.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-gray-900 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        {c.bgImageUrl && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={c.bgImageUrl} alt="" className="h-10 w-8 object-cover rounded border border-gray-200" />
                        )}
                        {c.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-gray-100 text-gray-600 uppercase tracking-wider">{c.category}</span>
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-teal-600 whitespace-nowrap">{c._count.submissions}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${c.isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-500'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${c.isActive ? 'bg-green-500' : 'bg-red-400'}`} />
                        {c.isActive ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="inline-flex items-center gap-3">
                        <a href={`/pledges/${c.slug}`} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-teal-600" title="View public page">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        <DeletePledgeButton slug={c.slug} isActive={c.isActive} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
