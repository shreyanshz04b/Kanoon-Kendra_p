import { Outlet, Link, useLocation } from "react-router";
import { 
  Home, FileText, MessageSquare, Search, Settings, User, 
  Menu, X, Bell, LayoutDashboard, Briefcase, FileSignature, Upload
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import clsx from "clsx";

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: FileText, label: "My Documents", href: "/dashboard/documents" },
  { icon: MessageSquare, label: "AI Chat", href: "/dashboard/chat" },
  { icon: Upload, label: "Upload & Analyze", href: "/dashboard/upload" },
  { icon: FileSignature, label: "Drafting", href: "/dashboard/drafting" },
  { icon: Search, label: "Advocate Search", href: "/dashboard/advocates" },
  { icon: Settings, label: "Settings", href: "/dashboard/settings" },
];

export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="flex h-screen overflow-hidden bg-[#F5F5F5] font-sans text-gray-900 selection:bg-blue-100 selection:text-blue-900">
      {/* Mobile Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ x: sidebarOpen ? 0 : "-100%" }}
        className={clsx(
          "fixed lg:static inset-y-0 left-0 z-50 w-[280px] bg-white border-r border-gray-100 flex flex-col transition-transform duration-300 lg:translate-x-0 shadow-2xl lg:shadow-none"
        )}
      >
        <div className="h-20 flex items-center gap-3 px-8 border-b border-gray-100 bg-white sticky top-0">
          <div className="w-10 h-10 bg-blue-900 rounded-xl flex items-center justify-center text-white shadow-sm shrink-0">
            <Briefcase size={20} />
          </div>
          <span className="font-semibold text-xl tracking-tight text-gray-900">
            LegalGPT
          </span>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden ml-auto p-2 text-gray-500 hover:bg-gray-50 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-8 space-y-2">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={clsx(
                  "flex items-center gap-4 px-4 py-3.5 rounded-2xl text-[15px] font-medium transition-all group",
                  isActive 
                    ? "bg-blue-50/50 text-blue-900 shadow-sm shadow-blue-900/5 ring-1 ring-blue-900/10" 
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon 
                  size={20} 
                  className={clsx(
                    "transition-transform group-hover:scale-110",
                    isActive ? "text-blue-900" : "text-gray-400"
                  )} 
                />
                {item.label}
              </Link>
            )
          })}
        </div>

        <div className="p-6 border-t border-gray-100 mt-auto bg-gray-50/50">
          <Link to="/login" className="flex items-center gap-4 px-2 py-2 rounded-2xl transition-colors hover:bg-white text-gray-700">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center shrink-0 border-2 border-white shadow-sm overflow-hidden">
              <img src="https://images.unsplash.com/photo-1649433658557-54cf58577c68?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBtYWxlJTIwcHJvZmVzc2lvbmFsJTIwaGVhZHNob3R8ZW58MXx8fHwxNzczNTk2NjE4fDA&ixlib=rb-4.1.0&q=80&w=1080" alt="User" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate text-gray-900">Arjun Singh</p>
              <p className="text-[13px] text-gray-500 truncate font-medium">arjun@example.com</p>
            </div>
          </Link>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0 bg-[#FAFAFA]">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-6 lg:px-10 shrink-0 z-10 sticky top-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-xl"
            >
              <Menu size={24} />
            </button>
            <div className="hidden sm:block">
              <h1 className="text-xl font-semibold text-gray-900 tracking-tight">
                {NAV_ITEMS.find(i => i.href === location.pathname)?.label || "Workspace"}
              </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl relative transition-colors">
              <Bell size={20} />
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-amber-600 rounded-full border-2 border-white ring-2 ring-white"></span>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-4 py-8 lg:px-10 lg:py-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
