import { Link } from 'react-router-dom';
import { FileText, MessageSquare, Upload, Search, ArrowRight, Activity } from 'lucide-react';

const cards = [
  { title: 'Start Legal Chat', desc: 'Ask a legal question with context-aware AI.', icon: MessageSquare, to: '/dashboard/chat/consultation', cta: 'Open Chat' },
  { title: 'Upload Documents', desc: 'Prepare and analyze legal files quickly.', icon: Upload, to: '/dashboard/upload', cta: 'Upload Now' },
  { title: 'Generate Drafts', desc: 'Create first-pass legal drafting templates.', icon: FileText, to: '/dashboard/drafting', cta: 'Start Drafting' },
  { title: 'Find Advocates', desc: 'Search by city and specialization.', icon: Search, to: '/dashboard/advocates', cta: 'Browse Advocates' },
];

export default function DashboardHome() {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Welcome to your LexCounsel Dashboard</h2>
        <p className="text-gray-600 mt-2 font-medium">Run your legal workflows from one place with your existing integrations intact.</p>
      </div>

      <div className="rounded-3xl bg-gradient-to-r from-blue-900 to-indigo-700 text-white p-7 md:p-9 shadow-lg">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h3 className="text-2xl font-bold">Consultation Assistant Ready</h3>
            <p className="mt-2 text-blue-100">Jump back into your legal conversations and document-driven analysis.</p>
          </div>
          <Link to="/dashboard/chat/consultation" className="px-5 py-3 rounded-xl bg-white text-blue-900 font-semibold inline-flex items-center gap-2 hover:bg-blue-50 transition-colors">
            Continue <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {cards.map(({ title, desc, icon: Icon, to, cta }) => (
          <Link key={title} to={to} className="rounded-3xl border border-gray-200 bg-white p-6 hover:border-blue-200 hover:shadow-md transition-all">
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-900 flex items-center justify-center mb-4">
              <Icon size={20} />
            </div>
            <h4 className="text-xl font-bold text-gray-900">{title}</h4>
            <p className="text-gray-600 mt-2 text-sm">{desc}</p>
            <span className="mt-5 inline-flex items-center gap-2 text-sm text-blue-900 font-semibold">
              {cta} <ArrowRight size={15} />
            </span>
          </Link>
        ))}
      </div>

      <div className="rounded-3xl border border-gray-200 bg-white p-6">
        <div className="flex items-center gap-2 text-gray-900 font-semibold mb-3">
          <Activity size={16} />
          Recent Activity
        </div>
        <p className="text-sm text-gray-600">Your latest chats and uploads will appear here as soon as you continue using the assistant.</p>
      </div>
    </div>
  );
}
