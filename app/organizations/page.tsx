"use client";
import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Loader2 } from 'lucide-react';

export default function OrganizationsPage() {
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

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 w-full">
        {/* A — Hero */}
        <section className="bg-gray-900 py-24 px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-montserrat font-extrabold text-white mb-6">Turn Values into Visuals.</h1>
            <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">Bring PledgeMarks to your School, NGO, or Company.</p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
               <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 max-w-sm w-full">
                   <div className="text-red-400 font-bold mb-2">The Old Way</div>
                   <div className="text-gray-300 text-sm">Boring email pledge. No visual proof. No virality.</div>
               </div>
               <div className="text-gray-500 font-bold hidden sm:block">VS</div>
               <div className="bg-teal-900/30 p-6 rounded-xl border border-teal-500/30 max-w-sm w-full">
                   <div className="text-teal-400 font-bold mb-2">The PledgeMarks Way</div>
                   <div className="text-gray-300 text-sm">Instant branded poster. Social sharing. Trackable impact.</div>
               </div>
            </div>
            <a href="#contact-form" className="inline-block bg-teal-400 text-gray-900 rounded-full px-8 py-4 font-bold hover:bg-teal-300 transition-colors">
              Get Your Custom Pledge Program
            </a>
          </div>
        </section>

        {/* B — How It Works */}
        <section className="py-20 px-4 bg-white">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-montserrat font-bold text-center text-gray-900 mb-16">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
               <div>
                  <div className="w-16 h-16 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center font-bold text-2xl mx-auto mb-6">1</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">You Connect</h3>
                  <p className="text-gray-600">Fill the form below, and we create your custom pledge page with your branding.</p>
               </div>
               <div>
                  <div className="w-16 h-16 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center font-bold text-2xl mx-auto mb-6">2</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Your Team Acts</h3>
                  <p className="text-gray-600">Your community pledges, ticks commitments, and downloads their branded poster.</p>
               </div>
               <div>
                  <div className="w-16 h-16 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center font-bold text-2xl mx-auto mb-6">3</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">You Report</h3>
                  <p className="text-gray-600">Receive a monthly impact PDF emailed to you on Day 1 of each month.</p>
               </div>
            </div>
          </div>
        </section>

        {/* C — What Orgs Get */}
        <section className="py-20 px-4 bg-gray-50 border-t border-gray-200">
           <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-montserrat font-bold text-center text-gray-900 mb-16">What You Get</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-4">
                  <div className="text-3xl">🎯</div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Your Brand, Their Commitment</h3>
                    <p className="text-gray-600">Your organization's logo is watermarked on every poster generated by your community.</p>
                  </div>
               </div>
               <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-4">
                  <div className="text-3xl">📊</div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Monthly Impact Reports</h3>
                    <p className="text-gray-600">Detailed PDF reports summarizing the collective impact of your community's pledges.</p>
                  </div>
               </div>
               <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-4">
                  <div className="text-3xl">🏅</div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">The Branded Certificate</h3>
                    <p className="text-gray-600">A co-branded, frame-worthy PNG certificate for every participant.</p>
                  </div>
               </div>
               <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-4 relative overflow-hidden">
                  <div className="absolute top-4 right-4 bg-yellow-100 text-yellow-800 text-xs font-bold px-3 py-1 rounded-full">Premium</div>
                  <div className="text-3xl">✨</div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Custom Pledge Creation</h3>
                    <p className="text-gray-600">Work with us to design a bespoke pledge challenge exclusive to your organization.</p>
                  </div>
               </div>
            </div>
           </div>
        </section>

        {/* F — Contact Form */}
        <section id="contact-form" className="py-24 px-4 bg-white">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-montserrat font-bold text-gray-900 mb-4">Let's Create Impact Together</h2>
              <p className="text-gray-600">Complete the form below and we'll send you a mock-up within 24 hours.</p>
            </div>

            <div className="bg-gray-50 rounded-3xl p-8 md:p-12 border border-gray-100 shadow-sm">
              {status === 'success' ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-teal-100 text-teal-500 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">✓</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Request Received!</h3>
                  <p className="text-gray-600">Thank you. We will send you a mock-up within 24 hours.</p>
                  <button onClick={() => setStatus('idle')} className="mt-8 text-teal-600 font-semibold hover:text-teal-700">Submit another request</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Organization Name*</label>
                      <input required type="text" value={formData.orgName} onChange={e => setFormData({...formData, orgName: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:border-teal-400 focus:outline-none bg-white" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Organization Type*</label>
                      <select required value={formData.orgType} onChange={e => setFormData({...formData, orgType: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:border-teal-400 focus:outline-none bg-white">
                        <option>School</option>
                        <option>NGO</option>
                        <option>Company</option>
                        <option>Other</option>
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
                        <option>Environment</option>
                        <option>Health</option>
                        <option>Social Issues</option>
                        <option>Lifestyle & Wellness</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Message / Requirements</label>
                    <textarea value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} rows={4} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:border-teal-400 focus:outline-none bg-white"></textarea>
                  </div>

                  {status === 'error' && <div className="text-red-500 text-sm">An error occurred. Please try again.</div>}

                  <button type="submit" disabled={status === 'submitting'} className="w-full bg-teal-500 text-white rounded-lg px-8 py-4 font-bold hover:bg-teal-600 transition-colors flex justify-center items-center">
                    {status === 'submitting' ? <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Submitting...</> : "Submit Request"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
