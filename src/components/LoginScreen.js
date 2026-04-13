import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../i18n/LanguageContext';

export default function LoginScreen() {
  const { loginWithGoogle, loading } = useAuth();
  const { t } = useLanguage();

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6">
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); filter: blur(6px); }
          to { opacity: 1; transform: translateY(0); filter: blur(0); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .login-fade { animation: fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .login-shimmer {
          background: linear-gradient(90deg, #fff 0%, #a1a1aa 40%, #fff 60%, #a1a1aa 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 4s linear infinite;
        }
      `}</style>

      <div className="text-center max-w-sm w-full">
        {/* Logo */}
        <div className="login-fade mb-6" style={{ animationDelay: '0s' }}>
          <div className="w-16 h-16 rounded-2xl glass mx-auto flex items-center justify-center mb-6">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round">
              <path d="M6.5 6.5h11v11h-11z" />
              <path d="M6.5 6.5L12 2l5.5 4.5" />
              <path d="M6.5 17.5L12 22l5.5-4.5" />
              <path d="M12 2v20" />
              <path d="M2 12h20" />
            </svg>
          </div>
          <h1 className="text-3xl font-black tracking-tight mb-1">
            <span className="login-shimmer">TACTICAL</span>
          </h1>
          <h1 className="text-3xl font-black tracking-tight mb-3">
            <span className="login-shimmer">STRENGTH</span>
          </h1>
          <p className="text-white/40 text-sm">{t.loginScreenSubtitle}</p>
        </div>

        {/* Login button */}
        <div className="login-fade" style={{ animationDelay: '0.3s', opacity: 0 }}>
          <button
            onClick={loginWithGoogle}
            className="w-full glass rounded-2xl py-4 px-6 flex items-center justify-center gap-3 active:scale-[0.97] transition-all-smooth hover:bg-white/10"
          >
            <svg width="20" height="20" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            <span className="text-white font-semibold text-sm">{t.signInWithGoogle}</span>
          </button>
        </div>

        <div className="login-fade mt-6" style={{ animationDelay: '0.5s', opacity: 0 }}>
          <p className="text-white/20 text-[10px]">{t.loginScreenSecure}</p>
        </div>
      </div>
    </div>
  );
}
