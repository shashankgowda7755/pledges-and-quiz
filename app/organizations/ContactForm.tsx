'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';

export default function ContactForm() {
  const [formData, setFormData] = useState({
    orgName: '', orgType: 'School', contactName: '', email: '', phone: '', cause: 'Environment', message: ''
  });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (!res.ok) throw new Error();
      setStatus('success');
      setFormData({ orgName: '', orgType: 'School', contactName: '', email: '', phone: '', cause: 'Environment', message: '' });
    } catch {
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 bg-teal-100 text-teal-500 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">✓</div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Request Received!</h3>
        <p className="text-gray-600">Thank you. We will send you a mock-up within 24 hours.</p>
        <button onClick={() => setStatus('idle')} className="mt-8 text-teal-600 font-semibold hover:text-teal-700">Submit another request</button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Organization Name*</label>
          <input required type="text" value={formData.orgName} onChange={e => setFormData({...formData, orgName: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:border-teal-400 focus:outline-none bg-white" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Organization Type*</label>
          <select required value={formData.orgType} onChange={e => setFormData({...formData, orgType: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:border-teal-400 focus:outline-none bg-white">
            <option>School</option><option>NGO</option><option>Company</option><option>Other</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Contact Name*</label>
          <input required type="text" value={formData.contactName} onChange={e => setFormData({...formData, contactName: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:border-teal-400 focus:outline-none bg-white" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Work Email*</label>
          <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:border-teal-400 focus:outline-none bg-white" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
          <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:border-teal-400 focus:outline-none bg-white" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Primary Cause*</label>
          <select required value={formData.cause} onChange={e => setFormData({...formData, cause: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:border-teal-400 focus:outline-none bg-white">
            <option>Environment</option><option>Health</option><option>Social Issues</option><option>Lifestyle &amp; Wellness</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Message / Requirements</label>
        <textarea value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} rows={4} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:border-teal-400 focus:outline-none bg-white" />
      </div>
      {status === 'error' && <div className="text-red-500 text-sm">An error occurred. Please try again.</div>}
      <button type="submit" disabled={status === 'submitting'} className="w-full bg-teal-500 text-white rounded-lg px-8 py-4 font-bold hover:bg-teal-600 transition-colors flex justify-center items-center">
        {status === 'submitting' ? <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Submitting...</> : 'Submit Request'}
      </button>
    </form>
  );
}
