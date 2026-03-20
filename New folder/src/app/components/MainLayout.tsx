import { Outlet, Link } from "react-router";
import { Scale, Menu, X } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

export function MainLayout() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col font-sans text-gray-900 selection:bg-blue-100">
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-blue-900 rounded-xl flex items-center justify-center text-white shadow-sm group-hover:bg-blue-800 transition-colors">
              <Scale size={20} className="text-white" />
            </div>
            <span className="font-semibold text-xl tracking-tight text-gray-900">
              LegalGPT
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-sm font-medium text-gray-600 hover:text-blue-900 transition-colors">Home</Link>
            <Link to="/" className="text-sm font-medium text-gray-600 hover:text-blue-900 transition-colors">Features</Link>
            <Link to="/" className="text-sm font-medium text-gray-600 hover:text-blue-900 transition-colors">How it Works</Link>
            <Link to="/" className="text-sm font-medium text-gray-600 hover:text-blue-900 transition-colors">Pricing</Link>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Link to="/login" className="text-sm font-semibold text-gray-700 hover:text-blue-900 px-4 py-2 rounded-xl transition-colors">
              Login
            </Link>
            <Link to="/dashboard" className="text-sm font-semibold bg-blue-900 text-white px-6 py-2.5 rounded-xl hover:bg-blue-800 transition-all shadow-sm shadow-blue-900/10 hover:-translate-y-0.5">
              Get Started
            </Link>
          </div>

          {/* Mobile menu button */}
          <button className="md:hidden p-2 text-gray-600" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden fixed top-20 left-0 right-0 bg-white border-b border-gray-100 z-40 p-4 shadow-xl"
          >
            <div className="flex flex-col gap-4">
              <Link to="/" className="p-3 text-gray-600 font-medium rounded-xl hover:bg-gray-50" onClick={() => setMenuOpen(false)}>Home</Link>
              <Link to="/" className="p-3 text-gray-600 font-medium rounded-xl hover:bg-gray-50" onClick={() => setMenuOpen(false)}>Features</Link>
              <Link to="/login" className="p-3 text-gray-600 font-medium rounded-xl hover:bg-gray-50" onClick={() => setMenuOpen(false)}>Login</Link>
              <Link to="/dashboard" className="p-3 bg-blue-900 text-white font-medium rounded-xl text-center" onClick={() => setMenuOpen(false)}>Get Started</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 flex flex-col relative z-10">
        <Outlet />
      </main>

      <footer className="bg-white border-t border-gray-100 mt-24">
        <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Scale size={18} className="text-gray-400" />
            <span className="text-gray-500 font-medium text-sm">LegalGPT © 2026. Built for Indian Laws.</span>
          </div>
          <div className="flex gap-6 text-sm text-gray-500">
            <Link to="#" className="hover:text-gray-900 transition-colors">Privacy Policy</Link>
            <Link to="#" className="hover:text-gray-900 transition-colors">Terms of Service</Link>
            <Link to="#" className="hover:text-gray-900 transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
