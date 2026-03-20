import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiMenu, FiX } from "react-icons/fi";
import { supabase } from './supabase';

export const Header = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (err) {
      console.error('Error signing out:', err);
    }
  };

  return (
    <header className={`fixed w-full z-50 top-0 transition-all duration-300 ${
      scrolled ? 'backdrop-blur-md bg-black/40 shadow-lg' : 'backdrop-blur-sm bg-black/20'
    }`}>
      <nav className="container mx-auto px-6">
        <div className="flex items-center justify-between py-4">
          <Link to="/" className="relative z-10">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center mr-2">
                <span className="text-white font-bold text-lg">LP</span>
              </div>
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-500">LawPal</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <Link to="/" className="px-4 py-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-all duration-300">Home</Link>
            <Link to="/about" className="px-4 py-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-all duration-300">About</Link>
            {user && <Link to="/resources" className="px-4 py-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-all duration-300">Resources</Link>}
            <Link to="/contact" className="px-4 py-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-all duration-300">Contact</Link>
            
            <div className="ml-4 flex space-x-2">
              {user ? (
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-lg font-medium bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300"
                >
                  Logout
                </button>
              ) : (
                <></>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-white p-2 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20"
          >
            {isOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden backdrop-blur-xl bg-black/80 border-t border-white/10 py-2">
            <div className="flex flex-col space-y-2 px-2">
              <Link to="/" 
                onClick={() => setIsOpen(false)}
                className="px-4 py-3 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-all duration-300 block">
                Home
              </Link>
              <Link to="/about" 
                onClick={() => setIsOpen(false)}
                className="px-4 py-3 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-all duration-300 block">
                About
              </Link>
              {user && (
                <Link to="/resources" 
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-3 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-all duration-300 block">
                  Resources
                </Link>
              )}
              <Link to="/contact" 
                onClick={() => setIsOpen(false)}
                className="px-4 py-3 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-all duration-300 block">
                Contact
              </Link>
              
              {user ? (
                <button
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                  className="w-full py-3 rounded-lg font-medium bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                >
                  Logout
                </button>
              ) : (
                <></>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};
