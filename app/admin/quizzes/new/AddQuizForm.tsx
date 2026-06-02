'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2 } from 'lucide-react';
import PosterImagePicker from '@/components/PosterImagePicker';
import CertificateDesigner from '@/components/CertificateDesigner';
import type { CertConfig } from '@/components/PledgePosterCanvas';

function slugify(str: string) {
  return str.toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

type EventOption = { id: string; title: string };
type QuizQuestion = { text: string; options: { text: string; isCorrect: boolean }[] };

export type QuizInitial = {
  slug: string;
  title: string;
  description: string;
  category: string;
  bgImageUrl: string;
  eventId: string | null;
  certConfig: string | null;
  questions: QuizQuestion[];
  collectEmail?: boolean;
  collectPhone?: boolean;
};

export default function AddQuizForm({ events = [], initialData }: { events?: EventOption[]; initialData?: QuizInitial }) {
  const router = useRouter();
  const isEdit = Boolean(initialData);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    title: initialData?.title ?? '',
    slug: initialData?.slug ?? '',
    description: initialData?.description ?? '',
    category: initialData?.category ?? 'environment',
    bgImageUrl: initialData?.bgImageUrl ?? '',
    eventId: initialData?.eventId ?? '',
    collectEmail: initialData?.collectEmail ?? true,
    collectPhone: initialData?.collectPhone ?? true,
  });

  const parsedCert = (() => {
    if (!initialData?.certConfig) return { name: null, photo: null, images: [] } as CertConfig;
    try { return JSON.parse(initialData.certConfig) as CertConfig; } catch { return { name: null, photo: null, images: [] } as CertConfig; }
  })();
  const [cert, setCert] = useState<CertConfig>(parsedCert);
  const certEnabled = !!(cert.name || cert.photo || (cert.images && cert.images.length));

  const [questions, setQuestions] = useState<QuizQuestion[]>(
    initialData?.questions?.length
      ? initialData.questions
      : [
          {
            text: '',
            options: [
              { text: '', isCorrect: true },
              { text: '', isCorrect: false },
              { text: '', isCorrect: false },
              { text: '', isCorrect: false },
            ],
          },
        ]
  );

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        text: '',
        options: [
          { text: '', isCorrect: true },
          { text: '', isCorrect: false },
          { text: '', isCorrect: false },
          { text: '', isCorrect: false },
        ]
      }
    ]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length === 1) return;
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const updateQuestionText = (index: number, text: string) => {
    const newQ = [...questions];
    newQ[index].text = text;
    setQuestions(newQ);
  };

  const updateOptionText = (qIndex: number, optIndex: number, text: string) => {
    const newQ = [...questions];
    newQ[qIndex].options[optIndex].text = text;
    setQuestions(newQ);
  };

  const setCorrectOption = (qIndex: number, optIndex: number) => {
    const newQ = [...questions];
    newQ[qIndex].options.forEach((opt, i) => {
      opt.isCorrect = i === optIndex;
    });
    setQuestions(newQ);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Pre-flight validation
    const emptyOption = questions.some(q => q.options.some(o => o.text.trim() === ''));
    if (emptyOption) {
      setError('Please fill out all answer options for every question.');
      return;
    }

    setLoading(true);
    try {
      const url = isEdit ? `/api/admin/quizzes/${initialData!.slug}` : '/api/admin/quizzes';
      const res = await fetch(url, {
        method: isEdit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          certConfig: certEnabled ? JSON.stringify(cert) : null,
          questions
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `Failed to ${isEdit ? 'update' : 'create'} quiz`);

      router.push('/admin/quizzes');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Setup */}
      <div className="space-y-6">
        <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Quiz Details</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Quiz Title *</label>
            <input type="text" required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value, slug: isEdit ? f.slug : slugify(e.target.value) }))} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm focus:border-teal-400 focus:ring-4 focus:ring-teal-50 outline-none font-medium text-gray-900" placeholder="Birds of Bengaluru" />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Slug *</label>
            <input type="text" required readOnly={isEdit} value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} className={`w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm focus:border-teal-400 font-mono text-gray-900 ${isEdit ? 'opacity-60 cursor-not-allowed' : ''}`} placeholder="birds-of-bengaluru" />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Description *</label>
          <textarea required value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm focus:border-teal-400 font-medium min-h-[100px]" placeholder="Test your knowledge of local avian species..." />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Category *</label>
            <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm focus:border-teal-400 font-medium">
              <option value="environment">Environment</option>
              <option value="health">Health</option>
              <option value="social">Social</option>
              <option value="lifestyle">Lifestyle</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Attach to Event <span className="font-normal text-gray-400 normal-case">(optional)</span></label>
            <select value={form.eventId} onChange={e => setForm(f => ({ ...f, eventId: e.target.value }))} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm focus:border-teal-400 font-medium">
              <option value="">— No event —</option>
              {events.map(ev => <option key={ev.id} value={ev.id}>{ev.title}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Data Capture <span className="font-normal text-gray-400 normal-case">— what the participant form asks for</span></label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className={`flex items-center gap-3 rounded-xl border px-4 py-3.5 cursor-pointer transition-colors ${form.collectEmail ? 'border-teal-400 bg-teal-50/50' : 'border-gray-200 bg-gray-50'}`}>
              <input type="checkbox" checked={form.collectEmail} onChange={e => setForm(f => ({ ...f, collectEmail: e.target.checked }))} className="w-4 h-4 accent-teal-500" />
              <span className="text-sm font-semibold text-gray-800">Collect Email</span>
            </label>
            <label className={`flex items-center gap-3 rounded-xl border px-4 py-3.5 cursor-pointer transition-colors ${form.collectPhone ? 'border-teal-400 bg-teal-50/50' : 'border-gray-200 bg-gray-50'}`}>
              <input type="checkbox" checked={form.collectPhone} onChange={e => setForm(f => ({ ...f, collectPhone: e.target.checked }))} className="w-4 h-4 accent-teal-500" />
              <span className="text-sm font-semibold text-gray-800">Collect Phone / WhatsApp</span>
            </label>
          </div>
          <p className="text-xs text-gray-400 mt-2">Turn off for corporate events that don&apos;t allow capturing contact details. Name is always required for the certificate.</p>
        </div>
      </div>

      <div className="space-y-6 pt-4 border-t border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Poster Background <span className="text-xs font-normal text-gray-400">(any size — original kept)</span></h3>
        <PosterImagePicker
          required
          value={form.bgImageUrl}
          onChange={(url) => setForm(f => ({ ...f, bgImageUrl: url }))}
        />
      </div>

      <div className="space-y-4 pt-4 border-t border-gray-100">
        <div>
          <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Certificate Layout <span className="text-xs font-normal text-gray-400">(optional)</span></h3>
          <p className="text-xs text-gray-500 mt-2">Place the participant&apos;s name, photo, and logos on the poster. Leave all off to use the default layout.</p>
        </div>
        <CertificateDesigner bgImageUrl={form.bgImageUrl} value={cert} onChange={setCert} />
      </div>

      {/* Questions Section */}
      <div className="space-y-6 pt-6 border-t border-gray-100">
        <div className="flex items-center justify-between border-b pb-2 mb-4">
          <h3 className="text-lg font-bold text-gray-900">Quiz Questions</h3>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{questions.length} total</span>
        </div>

        <div className="space-y-8">
          {questions.map((q, qIndex) => (
            <div key={qIndex} className="bg-gray-50 border border-gray-200 rounded-2xl p-6 relative">
              <div className="flex justify-between items-start mb-4">
                <label className="block text-xs font-extrabold text-teal-600 uppercase tracking-wider">
                  Question {qIndex + 1}
                </label>
                {questions.length > 1 && (
                  <button type="button" onClick={() => removeQuestion(qIndex)} className="text-gray-400 hover:text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <input
                type="text"
                required
                value={q.text}
                onChange={e => updateQuestionText(qIndex, e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-teal-400 outline-none font-bold text-gray-900 mb-4"
                placeholder="What is the scientifically recognised lifespan of..."
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-4 md:pl-0 border-l-2 md:border-l-0 border-teal-100">
                {q.options.map((opt, oIndex) => (
                  <div key={oIndex} className="flex items-center gap-3">
                    <input
                      type="radio"
                      name={`correct-answer-${qIndex}`}
                      checked={opt.isCorrect}
                      onChange={() => setCorrectOption(qIndex, oIndex)}
                      className="w-4 h-4 text-teal-500 bg-gray-100 border-gray-300 focus:ring-teal-500 cursor-pointer"
                    />
                    <input
                      type="text"
                      required
                      value={opt.text}
                      onChange={e => updateOptionText(qIndex, oIndex, e.target.value)}
                      className={`flex-1 bg-white border rounded-xl px-3 py-2 text-sm focus:border-teal-400 outline-none transition-colors ${opt.isCorrect ? 'border-teal-500 font-bold bg-teal-50/10' : 'border-gray-200'}`}
                      placeholder={`Option ${String.fromCharCode(65 + oIndex)}`}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addQuestion}
          className="w-full py-4 border-2 border-dashed border-gray-300 rounded-2xl text-gray-500 font-bold hover:bg-gray-50 hover:border-gray-400 transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" /> Add Another Question
        </button>
      </div>

      {error && <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-bold">{error}</div>}

      <div className="pt-6 flex justify-end shrink-0 mb-8">
        <button
          type="submit"
          disabled={loading}
          className="px-8 py-3.5 rounded-xl bg-teal-500 text-white font-bold hover:bg-teal-600 disabled:opacity-50 transition-all shadow-md shadow-teal-500/20 text-[15px]"
        >
          {loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Publish Quiz'}
        </button>
      </div>
    </form>
  );
}
