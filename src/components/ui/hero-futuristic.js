import { useState, useEffect } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';

export const HeroFuturistic = ({ onLogin, loginLoading, isLanding = false }) => {
  const { t, lang, toggleLang } = useLanguage();
  const [visibleWords, setVisibleWords] = useState(0);
  const [subtitleVisible, setSubtitleVisible] = useState(false);
  const [btnVisible, setBtnVisible] = useState(false);
  const [featuresVisible, setFeaturesVisible] = useState(false);
  const titleWords = ['TACTICAL', 'STRENGTH'];

  useEffect(() => {
    if (visibleWords < titleWords.length) {
      const timeout = setTimeout(() => setVisibleWords(v => v + 1), 500);
      return () => clearTimeout(timeout);
    } else {
      const t1 = setTimeout(() => setSubtitleVisible(true), 600);
      const t2 = setTimeout(() => setBtnVisible(true), 1200);
      const t3 = setTimeout(() => setFeaturesVisible(true), 1600);
      return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    }
  }, [visibleWords, titleWords.length]);

  const features = [
    { emoji: '🤖', label: t.featureAI },
    { emoji: '🏆', label: t.featureGamification },
    { emoji: '📊', label: t.featureProgress },
    { emoji: '📱', label: t.featureReels },
  ];

  return (
    <div className={`${isLanding ? 'min-h-screen' : 'h-[85vh] sm:h-screen'} relative overflow-hidden flex flex-col items-center justify-center`}
      style={{ background: 'var(--app-bg, #000)' }}>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(30px) scale(0.96); filter: blur(8px); }
          to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
        @keyframes pulse-ring {
          0% { transform: scale(0.8); opacity: 0.6; }
          50% { transform: scale(1.2); opacity: 0; }
          100% { transform: scale(0.8); opacity: 0; }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes orb-move-1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(60px, -40px) scale(1.1); }
          50% { transform: translate(-30px, -80px) scale(0.9); }
          75% { transform: translate(-60px, 20px) scale(1.05); }
        }
        @keyframes orb-move-2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(-50px, 50px) scale(0.95); }
          50% { transform: translate(40px, 70px) scale(1.15); }
          75% { transform: translate(70px, -30px) scale(1); }
        }
        @keyframes orb-move-3 {
          0%, 100% { transform: translate(0, 0) scale(1.05); }
          33% { transform: translate(-80px, -50px) scale(0.9); }
          66% { transform: translate(50px, 40px) scale(1.1); }
        }
        .hero-word { animation: fadeUp 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .hero-subtitle { animation: fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .hero-btn { animation: fadeUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .hero-features { animation: fadeUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .shimmer-text {
          background: linear-gradient(90deg, #fff 0%, #a1a1aa 40%, #fff 60%, #a1a1aa 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 4s linear infinite;
        }
      `}</style>

      {/* Animated gradient orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, rgba(var(--orb1),1) 0%, transparent 70%)', animation: 'orb-move-1 15s ease-in-out infinite' }} />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, rgba(var(--orb2),1) 0%, transparent 70%)', animation: 'orb-move-2 18s ease-in-out infinite' }} />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, rgba(var(--orb3),1) 0%, transparent 70%)', animation: 'orb-move-3 12s ease-in-out infinite', transform: 'translate(-50%, -50%)' }} />
      </div>

      {/* Grain overlay */}
      <div className="absolute inset-0 opacity-5"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'1\'/%3E%3C/svg%3E")' }} />

      {/* Language toggle — top right */}
      <div className="absolute top-5 right-5 z-20">
        <button
          onClick={toggleLang}
          className="flex items-center gap-0 rounded-full active:scale-95 transition-all"
          style={{
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.12)',
            padding: '3px',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
          }}
        >
          <span className="flex items-center justify-center rounded-full transition-all"
            style={{
              width: 30, height: 30,
              fontSize: '13px',
              background: lang === 'it' ? 'rgba(255,255,255,0.18)' : 'transparent',
              boxShadow: lang === 'it' ? '0 0 10px rgba(255,255,255,0.12)' : 'none',
            }}>🇮🇹</span>
          <span className="flex items-center justify-center rounded-full transition-all"
            style={{
              width: 30, height: 30,
              fontSize: '13px',
              background: lang === 'en' ? 'rgba(255,255,255,0.18)' : 'transparent',
              boxShadow: lang === 'en' ? '0 0 10px rgba(255,255,255,0.12)' : 'none',
            }}>🇬🇧</span>
        </button>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-sm mx-auto w-full">
        {/* Icon ring */}
        <div className="mx-auto mb-8 relative w-20 h-20 flex items-center justify-center" style={{ animation: 'float 4s ease-in-out infinite' }}>
          <div className="absolute inset-0 rounded-full border border-white/20" />
          <div className="absolute inset-0 rounded-full border border-white/10" style={{ animation: 'pulse-ring 3s ease-out infinite' }} />
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6.5 6.5h11v11h-11z" />
            <path d="M6.5 6.5L12 2l5.5 4.5" />
            <path d="M6.5 17.5L12 22l5.5-4.5" />
            <path d="M12 2v20" />
            <path d="M2 12h20" />
          </svg>
        </div>

        {/* Title */}
        <div className="mb-4">
          {titleWords.map((word, i) => (
            <div key={i} className={i < visibleWords ? 'hero-word' : ''} style={{
              opacity: i < visibleWords ? undefined : 0,
              animationDelay: `${i * 0.15}s`,
              fontSize: 'clamp(2.5rem, 10vw, 5rem)',
              fontWeight: 900, lineHeight: 1.05, letterSpacing: '-0.03em',
            }}>
              <span className="shimmer-text">{word}</span>
            </div>
          ))}
        </div>

        {/* Subtitle */}
        <p className={subtitleVisible ? 'hero-subtitle' : ''} style={{
          opacity: subtitleVisible ? undefined : 0, animationDelay: '0.1s',
          color: 'rgba(255,255,255,0.5)',
          fontSize: 'clamp(0.875rem, 2.5vw, 1rem)',
          fontWeight: 400, lineHeight: 1.6,
          margin: '0 auto 2rem',
        }}>
          {isLanding
            ? t.loginSubtitleLanding
            : t.loginSubtitle}
        </p>

        {/* Features grid (landing only) */}
        {isLanding && (
          <div className={`grid grid-cols-2 gap-2 mb-8 ${featuresVisible ? 'hero-features' : ''}`}
            style={{ opacity: featuresVisible ? undefined : 0, animationDelay: '0.1s' }}>
            {features.map((f, i) => (
              <div key={i} className="flex items-center gap-2 p-2.5 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <span className="text-base">{f.emoji}</span>
                <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.72rem', fontWeight: 500 }}>{f.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* CTA: landing → Google login, normal → scroll */}
        {isLanding ? (
          <div className={btnVisible ? 'hero-btn' : ''} style={{ opacity: btnVisible ? undefined : 0, animationDelay: '0.1s' }}>
            <button
              onClick={onLogin}
              disabled={loginLoading}
              style={{
                width: '100%',
                background: loginLoading ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.08)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: '#fff',
                padding: '16px 24px',
                borderRadius: '18px',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: loginLoading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                opacity: loginLoading ? 0.5 : 1,
              }}
            >
              {loginLoading ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <svg width="20" height="20" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                </svg>
              )}
              <span>{loginLoading ? t.loginLoading : t.loginWithGoogle}</span>
            </button>
            <p style={{ color: 'rgba(255,255,255,0.18)', fontSize: '0.65rem', marginTop: '12px' }}>
              {t.loginSecure}
            </p>
          </div>
        ) : (
          <button
            className={btnVisible ? 'hero-btn' : ''}
            onClick={() => document.getElementById('main-content')?.scrollIntoView({ behavior: 'smooth' })}
            style={{
              opacity: btnVisible ? undefined : 0, animationDelay: '0.1s',
              background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.15)',
              color: '#fff', padding: '14px 32px', borderRadius: '50px',
              fontWeight: 500, fontSize: '0.9rem', cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              display: 'inline-flex', alignItems: 'center', gap: '10px',
            }}
          >
            {t.startWorkout}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14" /><path d="m19 12-7 7-7-7" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default HeroFuturistic;
