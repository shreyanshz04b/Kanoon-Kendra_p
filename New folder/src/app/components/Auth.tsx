import { Link } from "react-router";
import { Scale, Lock, Mail, ArrowRight, ShieldCheck } from "lucide-react";

export function Auth({ type = "login" }: { type?: "login" | "signup" }) {
  const isLogin = type === "login";

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6 bg-[#FAFAFA]">
      <div className="w-full max-w-[440px] bg-white rounded-[24px] shadow-sm border border-gray-100 p-10 relative overflow-hidden">
        {/* Subtle decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full opacity-50 -z-0" />
        
        <div className="flex justify-center mb-8 relative z-10">
          <div className="w-12 h-12 bg-blue-900 rounded-xl flex items-center justify-center text-white shadow-sm">
            <Scale size={24} />
          </div>
        </div>

        <div className="text-center mb-10 relative z-10">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-2">
            {isLogin ? "Welcome back" : "Create an account"}
          </h1>
          <p className="text-gray-500 text-sm font-medium">
            {isLogin ? "Log in to your LegalGPT dashboard" : "Start automating your legal workflow"}
          </p>
        </div>

        <form className="space-y-5 relative z-10" onSubmit={e => e.preventDefault()}>
          {!isLogin && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="name">Full Name</label>
              <input 
                id="name"
                type="text" 
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-900 focus:ring-1 focus:ring-blue-900 outline-none transition-all text-gray-900 placeholder-gray-400"
                placeholder="Advocate Singh"
              />
            </div>
          )}
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="email">Email address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                id="email"
                type="email" 
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-900 focus:ring-1 focus:ring-blue-900 outline-none transition-all text-gray-900 placeholder-gray-400"
                placeholder="advocate@chamber.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="password">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                id="password"
                type="password" 
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-900 focus:ring-1 focus:ring-blue-900 outline-none transition-all text-gray-900 placeholder-gray-400"
                placeholder="••••••••"
              />
            </div>
            {isLogin && (
              <div className="mt-2 text-right">
                <a href="#" className="text-sm font-medium text-blue-900 hover:underline">Forgot password?</a>
              </div>
            )}
          </div>

          <Link to="/dashboard" className="w-full bg-blue-900 text-white rounded-xl py-3.5 font-semibold text-[15px] hover:bg-blue-800 transition-colors shadow-sm shadow-blue-900/10 flex items-center justify-center gap-2 mt-4 group">
            {isLogin ? "Sign In" : "Get Started"}
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          
          <div className="relative py-4 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100"></div>
            </div>
            <div className="relative bg-white px-4 text-sm text-gray-400 font-medium">Or continue with</div>
          </div>

          <button className="w-full bg-white text-gray-700 border border-gray-200 rounded-xl py-3 font-semibold text-[15px] hover:bg-gray-50 transition-colors flex items-center justify-center gap-3">
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.16v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.16C1.43 8.55 1 10.22 1 12s.43 3.45 1.16 4.93l3.68-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.16 7.07l3.68 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Google
          </button>
        </form>

        <div className="mt-8 text-center border-t border-gray-50 pt-6">
          <p className="text-gray-500 text-sm font-medium">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <Link to={isLogin ? "/signup" : "/login"} className="text-blue-900 font-semibold hover:underline ml-2">
              {isLogin ? "Sign up" : "Log in"}
            </Link>
          </p>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-400 font-medium bg-gray-50 p-3 rounded-lg border border-gray-100">
          <ShieldCheck size={14} className="text-amber-600/80" />
          <span>Data securely stored and compliant with Indian privacy laws</span>
        </div>
      </div>
    </div>
  );
}
