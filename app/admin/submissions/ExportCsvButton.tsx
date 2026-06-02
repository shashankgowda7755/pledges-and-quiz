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

    // Rows
    data.forEach(row => {
      const sanitizedName = `"${row.name.replace(/"/g, '""')}"`;
      const sanitizedActivity = `"${row.activityName.replace(/"/g, '""')}"`;
      const sanitizedOrg = `"${row.orgName.replace(/"/g, '""')}"`;
      
      const rowString = `${row.type},${sanitizedName},${row.email || "N/A"},${row.whatsapp || "N/A"},${sanitizedActivity},${sanitizedOrg},${new Date(row.date).toLocaleDateString()},${row.metadata}`;
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
