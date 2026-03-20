import { FileSignature, Sparkles, Copy } from 'lucide-react';
import { useState } from 'react';

export default function Drafting() {
  const [topic, setTopic] = useState('');
  const [draft, setDraft] = useState('');

  const handleGenerate = () => {
    if (!topic.trim()) return;
    setDraft(`Subject: Draft regarding ${topic}\n\nThis is a structured legal draft template generated for your workflow. Please review and adapt with case-specific facts before use.`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Smart Drafting</h2>
        <p className="text-gray-600 mt-2 font-medium">Create clean first-draft legal content and refine it for final use.</p>
      </div>

      <div className="rounded-3xl border border-gray-200 bg-white shadow-sm p-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">Draft Topic</label>
        <input
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g., Legal notice for payment default"
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
        />
        <button onClick={handleGenerate} className="mt-4 px-5 py-3 rounded-xl bg-blue-900 text-white font-semibold hover:bg-blue-800 transition inline-flex items-center gap-2">
          <Sparkles size={16} /> Generate Draft
        </button>
      </div>

      <div className="rounded-3xl border border-gray-200 bg-white shadow-sm p-6 min-h-[220px]">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900 inline-flex items-center gap-2"><FileSignature size={16} /> Output</h3>
          {draft && (
            <button onClick={() => navigator.clipboard.writeText(draft)} className="text-sm text-blue-900 font-semibold inline-flex items-center gap-1 hover:text-blue-700">
              <Copy size={14} /> Copy
            </button>
          )}
        </div>
        <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans">{draft || 'Generated draft will appear here.'}</pre>
      </div>
    </div>
  );
}
