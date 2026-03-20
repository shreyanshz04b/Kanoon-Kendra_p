import { motion } from "motion/react";
import { FileText, MessageSquare, Clock, ArrowRight, TrendingUp } from "lucide-react";
import { Link } from "react-router";

const stats = [
  { label: "Documents Analyzed", value: "24", icon: FileText, trend: "+12% this week" },
  { label: "Drafts Created", value: "8", icon: MessageSquare, trend: "+2 this week" },
  { label: "Hours Saved", value: "14.5", icon: Clock, trend: "+4.5 this week" },
];

const recentActivity = [
  { title: "NDA - TechCorp India.pdf", action: "Analyzed", time: "2 hours ago", type: "document" },
  { title: "Chat regarding IP Dispute", action: "Generated 3 citations", time: "4 hours ago", type: "chat" },
  { title: "Employment Contract", action: "Drafted", time: "Yesterday", type: "draft" },
  { title: "Supreme Court Judgment Analysis", action: "Analyzed", time: "2 days ago", type: "document" },
];

export function DashboardHome() {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Greeting */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Good morning, Advocate Singh</h2>
        <p className="text-gray-500 mt-2 font-medium">Here's an overview of your legal workspace.</p>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-start justify-between group hover:border-blue-100 transition-colors"
          >
            <div>
              <p className="text-sm font-semibold text-gray-500 mb-1">{stat.label}</p>
              <h3 className="text-4xl font-bold text-gray-900 tracking-tight">{stat.value}</h3>
              <div className="flex items-center gap-1.5 mt-4 text-xs font-semibold text-emerald-600 bg-emerald-50 w-fit px-2 py-1 rounded-md">
                <TrendingUp size={12} />
                {stat.trend}
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-900 group-hover:bg-blue-900 group-hover:text-white transition-colors">
              <stat.icon size={20} />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">Recent Activity</h3>
            <button className="text-sm font-semibold text-blue-900 hover:text-blue-800 transition-colors">View all</button>
          </div>
          
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-2 overflow-hidden">
            {recentActivity.map((activity, idx) => (
              <div 
                key={idx}
                className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-2xl transition-colors group cursor-pointer border-b border-gray-50 last:border-0"
              >
                <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-900 group-hover:border-blue-100 transition-colors shrink-0">
                  {activity.type === 'document' ? <FileText size={18} /> : 
                   activity.type === 'chat' ? <MessageSquare size={18} /> : <FileText size={18} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-semibold text-gray-900 truncate">{activity.title}</p>
                  <p className="text-sm text-gray-500 font-medium truncate">{activity.action}</p>
                </div>
                <div className="text-xs font-medium text-gray-400 whitespace-nowrap">
                  {activity.time}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-gray-900">Quick Actions</h3>
          <div className="grid gap-4">
            <Link 
              to="/dashboard/upload"
              className="bg-blue-900 text-white p-6 rounded-3xl shadow-sm hover:bg-blue-800 transition-all hover:-translate-y-1 group relative overflow-hidden"
            >
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-colors" />
              <FileText size={24} className="mb-4 text-blue-200 group-hover:text-white transition-colors" />
              <h4 className="font-semibold text-lg mb-1 relative z-10">Upload Document</h4>
              <p className="text-sm text-blue-200 font-medium relative z-10">Analyze contracts & legal notices</p>
              <ArrowRight size={18} className="absolute bottom-6 right-6 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-white" />
            </Link>

            <Link 
              to="/dashboard/chat"
              className="bg-white border border-gray-100 p-6 rounded-3xl shadow-sm hover:border-gray-300 transition-all hover:-translate-y-1 group"
            >
              <MessageSquare size={24} className="mb-4 text-gray-400 group-hover:text-blue-900 transition-colors" />
              <h4 className="font-semibold text-lg text-gray-900 mb-1">New Legal Query</h4>
              <p className="text-sm text-gray-500 font-medium">Ask questions based on Indian law</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
