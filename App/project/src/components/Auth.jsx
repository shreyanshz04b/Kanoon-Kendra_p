import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';
import { supabase } from '../supabase';

export default function Auth({ type = 'login' }) {
  const isLogin = type === 'login';
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from || '/dashboard';

  const [authMode, setAuthMode] = useState('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setError('');
  }, [authMode, type]);

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) throw authError;
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { error: authError } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: window.location.origin },
      });
      if (authError) throw authError;
      window.localStorage.setItem('emailForSignIn', email);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerification = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const savedEmail = window.localStorage.getItem('emailForSignIn');
      if (!savedEmail) throw new Error('Please enter your email again.');
      const { error: authError } = await supabase.auth.verifyOtp({ email: savedEmail, token: otp, type: 'email' });
      if (authError) throw authError;
      window.localStorage.removeItem('emailForSignIn');
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          },
        },
      });
      if (authError) throw authError;
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-160px)] flex items-center justify-center p-6 bg-[#FAFAFA]">
      <div className="w-full max-w-[460px] bg-white rounded-[24px] shadow-sm border border-gray-100 p-8 md:p-10 relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-r from-blue-50 via-indigo-50 to-sky-50" />

        <div className="relative z-10">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 text-center">
            {isLogin ? 'Welcome Back' : 'Create Your Account'}
          </h1>
          <p className="text-sm text-gray-600 text-center mt-2 font-medium">
            {isLogin ? 'Sign in to continue to your legal workspace.' : 'Get started with AI-powered legal workflows.'}
          </p>

          {error && (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {isLogin ? (
            <>
              <div className="mt-6 inline-flex rounded-xl bg-gray-100 p-1 w-full">
                <button onClick={() => setAuthMode('password')} className={`w-1/2 py-2 text-sm rounded-lg font-semibold transition ${authMode === 'password' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'}`}>
                  Password
                </button>
                <button onClick={() => setAuthMode('otp')} className={`w-1/2 py-2 text-sm rounded-lg font-semibold transition ${authMode === 'otp' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'}`}>
                  One-Time Code
                </button>
              </div>

              {authMode === 'password' ? (
                <form className="mt-6 space-y-4" onSubmit={handlePasswordLogin}>
                  <Field icon={Mail} type="email" value={email} setValue={setEmail} placeholder="name@example.com" label="Email" />
                  <Field icon={Lock} type="password" value={password} setValue={setPassword} placeholder="••••••••" label="Password" />
                  <button disabled={loading} className="w-full py-3.5 rounded-xl bg-blue-900 text-white font-semibold hover:bg-blue-800 transition inline-flex items-center justify-center gap-2 disabled:opacity-70">
                    {loading ? 'Signing In...' : 'Sign In'} <ArrowRight size={16} />
                  </button>
                </form>
              ) : (
                <form className="mt-6 space-y-4" onSubmit={otp ? handleOtpVerification : handleOtpLogin}>
                  <Field icon={Mail} type="email" value={email} setValue={setEmail} placeholder="name@example.com" label="Email" />
                  <Field icon={Lock} type="text" value={otp} setValue={setOtp} placeholder="123456" label="One-Time Code" />
                  <button disabled={loading} className="w-full py-3.5 rounded-xl bg-blue-900 text-white font-semibold hover:bg-blue-800 transition inline-flex items-center justify-center gap-2 disabled:opacity-70">
                    {loading ? 'Please Wait...' : otp ? 'Verify Code' : 'Send Code'} <ArrowRight size={16} />
                  </button>
                </form>
              )}
            </>
          ) : (
            <form className="mt-6 space-y-4" onSubmit={handleSignup}>
              <div className="grid grid-cols-2 gap-3">
                <Field icon={User} type="text" value={firstName} setValue={setFirstName} placeholder="First" label="First Name" />
                <Field icon={User} type="text" value={lastName} setValue={setLastName} placeholder="Last" label="Last Name" />
              </div>
              <Field icon={Mail} type="email" value={email} setValue={setEmail} placeholder="name@example.com" label="Email" />
              <Field icon={Lock} type="password" value={password} setValue={setPassword} placeholder="••••••••" label="Password" />
              <button disabled={loading} className="w-full py-3.5 rounded-xl bg-blue-900 text-white font-semibold hover:bg-blue-800 transition inline-flex items-center justify-center gap-2 disabled:opacity-70">
                {loading ? 'Creating Account...' : 'Create Account'} <ArrowRight size={16} />
              </button>
            </form>
          )}

          {isLogin ? (
            <p className="text-center text-sm text-gray-600 mt-6">
              Need help accessing the platform?
              <Link to="/contact" className="ml-2 text-blue-900 font-semibold hover:underline">
                Contact Support
              </Link>
            </p>
          ) : (
            <p className="text-center text-sm text-gray-600 mt-6">
              Please contact support for onboarding assistance.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ icon: Icon, type, value, setValue, placeholder, label }) {
  return (
    <label className="block">
      <span className="block text-sm text-gray-700 font-semibold mb-2">{label}</span>
      <div className="relative">
        <Icon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type={type}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-full pl-10 pr-3 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
          placeholder={placeholder}
          required={type !== 'text' || label !== 'One-Time Code'}
        />
      </div>
    </label>
  );
}
