'use client';

import { Download } from 'lucide-react';

interface ActivityRecord {
  id: string;
  type: 'Pledge' | 'Quiz';
  name: string;
  email: string | null;
  whatsapp: string | null;
  activityName: string;
  orgName: string;
  date: Date;
  metadata: string;
}

export default function ExportCsvButton({ data }: { data: ActivityRecord[] }) {
  const downloadCsv = () => {
    // CSV Header
    let csvContent = "Type,Participant Name,Email,WhatsApp,Activity Name,Organization,Date,Extra Data\n";

    const q = (v: string) => `"${v.replace(/"/g, '""')}"`;

    data.forEach(row => {
      const rowString = [
        row.type,
        q(row.name),
        q(row.email || 'N/A'),
        q(row.whatsapp || 'N/A'),
        q(row.activityName),
        q(row.orgName),
        new Date(row.date).toLocaleDateString(),
        q(row.metadata),
      ].join(',');
      csvContent += rowString + "\n";
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `communitree_submissions_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button 
      onClick={downloadCsv}
      className="bg-gray-900 hover:bg-black text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-md flex items-center gap-2"
    >
      <Download className="w-4 h-4" /> Export CSV
    </button>
  );
}
