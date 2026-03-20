import { Outlet, Link, useLocation } from 'react-router-dom';
import { Scale, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../supabase';

export default function MainLayout({ user }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [quickMenuOpen, setQuickMenuOpen] = useState(false);
  const location = useLocation();
  const showBackToDashboard = user && ['/services', '/about', '/resources', '/contact'].includes(location.pathname);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Error signing out:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col font-sans text-gray-900 selection:bg-blue-100">
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-blue-900 rounded-xl flex items-center justify-center text-white shadow-sm group-hover:bg-blue-800 transition-colors">
              <Scale size={20} className="text-white" />
            </div>
            <span className="font-semibold text-xl tracking-tight text-gray-900">LexCounsel</span>
          </Link>

          <div className="hidden md:flex items-center gap-4">
            {user && <Link to="/resources" className="text-sm font-medium text-gray-600 hover:text-blue-900 transition-colors">Resources</Link>}
            {user ? (
              <>
                <Link to="/dashboard" className="text-sm font-semibold text-gray-700 hover:text-blue-900 px-4 py-2 rounded-xl transition-colors">{showBackToDashboard ? 'Back to Dashboard' : 'Dashboard'}</Link>
                <button onClick={handleLogout} className="text-sm font-semibold bg-blue-900 text-white px-6 py-2.5 rounded-xl hover:bg-blue-800 transition-all shadow-sm shadow-blue-900/10 hover:-translate-y-0.5">Logout</button>
              </>
            ) : (
              <></>
            )}
            <div className="relative">
              <button
                onClick={() => setQuickMenuOpen((prev) => !prev)}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-xl"
                aria-label="Open quick navigation menu"
              >
                <Menu size={20} />
              </button>
              {quickMenuOpen && (
                <div className="absolute right-0 mt-2 w-52 rounded-xl border border-gray-200 bg-white shadow-lg p-2">
                  <Link to="/about" className="block px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50" onClick={() => setQuickMenuOpen(false)}>About Us</Link>
                  <Link to="/contact" className="block px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50" onClick={() => setQuickMenuOpen(false)}>Contact Us</Link>
                </div>
              )}
            </div>
          </div>

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
              <Link to="/about" className="p-3 text-gray-600 font-medium rounded-xl hover:bg-gray-50" onClick={() => setMenuOpen(false)}>About</Link>
              {user && <Link to="/resources" className="p-3 text-gray-600 font-medium rounded-xl hover:bg-gray-50" onClick={() => setMenuOpen(false)}>Resources</Link>}
              <Link to="/contact" className="p-3 text-gray-600 font-medium rounded-xl hover:bg-gray-50" onClick={() => setMenuOpen(false)}>Contact</Link>
              {user ? (
                <>
                  <Link to="/dashboard" className="p-3 text-gray-600 font-medium rounded-xl hover:bg-gray-50" onClick={() => setMenuOpen(false)}>{showBackToDashboard ? 'Back to Dashboard' : 'Dashboard'}</Link>
                  <button onClick={() => { handleLogout(); setMenuOpen(false); }} className="p-3 bg-blue-900 text-white font-medium rounded-xl text-center">Logout</button>
                </>
              ) : (
                <></>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 flex flex-col relative z-10">
        <Outlet context={{ user }} />
      </main>

      <footer className="bg-white border-t border-gray-100 mt-24">
        <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Scale size={18} className="text-gray-400" />
            <span className="text-gray-500 font-medium text-sm">LexCounsel © 2026. Empowering Legal Access in India.</span>
          </div>
          <div className="flex gap-6 text-sm text-gray-500">
            <Link to="#" className="hover:text-gray-900 transition-colors">Privacy Policy</Link>
            <Link to="#" className="hover:text-gray-900 transition-colors">Terms of Service</Link>
            <Link to="/contact" className="hover:text-gray-900 transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
