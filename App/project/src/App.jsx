import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useParams } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import { supabase } from './supabase';
import MainLayout from './components/MainLayout';
import DashboardLayout from './components/DashboardLayout';
import Home from './components/Home';
import Auth from './components/Auth';
import DashboardHome from './components/DashboardHome';
import Chat from './components/Chat';
import Upload from './components/Upload';
import Drafting from './components/Drafting';
import Advocates from './components/Advocates';
import ContactUs from './ContactUs';
import AboutUs from './AboutUs';
import Resources from './Resources';

function LegacyServiceChatRedirect() {
  const { serviceTitle } = useParams();
  return <Navigate to={`/dashboard/chat/${serviceTitle || 'consultation'}`} replace />;
}

function AuthGuard({ user, loading, children }) {
  const location = useLocation();

  if (loading) {
    return <div className="min-h-screen bg-[#FAFAFA]" />;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: `${location.pathname}${location.search}` }} />;
  }

  return children;
}

function GuestGuard({ user, loading, children }) {
  if (loading) {
    return <div className="min-h-screen bg-[#FAFAFA]" />;
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const initializeSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (mounted) {
        setUser(session?.user ?? null);
        setAuthLoading(false);
      }
    };

    initializeSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <I18nextProvider i18n={i18n}>
      <Router>
        <Routes>
          <Route path="/" element={<MainLayout user={user} />}>
            <Route index element={<Home />} />
            <Route path="services" element={<Navigate to="/#features" replace />} />
            <Route
              path="login"
              element={(
                <GuestGuard user={user} loading={authLoading}>
                  <Auth type="login" />
                </GuestGuard>
              )}
            />
            <Route
              path="signup"
              element={<Navigate to="/login" replace />}
            />
            <Route path="contact" element={<ContactUs />} />
            <Route
              path="resources"
              element={(
                <AuthGuard user={user} loading={authLoading}>
                  <Resources />
                </AuthGuard>
              )}
            />
            <Route path="about" element={<AboutUs />} />
          </Route>

          <Route
            path="/dashboard"
            element={(
              <AuthGuard user={user} loading={authLoading}>
                <DashboardLayout user={user} />
              </AuthGuard>
            )}
          >
            <Route index element={<DashboardHome />} />
            <Route path="chat" element={<Chat />} />
            <Route path="chat/:serviceTitle" element={<Chat />} />
            <Route path="upload" element={<Upload />} />
            <Route path="drafting" element={<Drafting />} />
            <Route path="advocates" element={<Advocates />} />
            <Route path="settings" element={<div className="rounded-2xl border border-gray-200 bg-white p-6 text-gray-600">Settings view coming soon.</div>} />
          </Route>
          <Route path="/service-chat/:serviceTitle" element={<LegacyServiceChatRedirect />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </I18nextProvider>
  );
}

export default App;
