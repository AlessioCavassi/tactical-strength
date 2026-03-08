import { useState, useEffect } from 'react';

export const HeroFuturistic = () => {
  const [visibleWords, setVisibleWords] = useState(0);
  const [subtitleVisible, setSubtitleVisible] = useState(false);
  const [btnVisible, setBtnVisible] = useState(false);
  const titleWords = ['TACTICAL', 'STRENGTH'];

  useEffect(() => {
    if (visibleWords < titleWords.length) {
      const timeout = setTimeout(() => setVisibleWords(v => v + 1), 500);
      return () => clearTimeout(timeout);
    } else {
      const t1 = setTimeout(() => setSubtitleVisible(true), 600);
      const t2 = setTimeout(() => setBtnVisible(true), 1200);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }
  }, [visibleWords, titleWords.length]);

  return (
    <div className="h-screen relative overflow-hidden bg-black flex items-center justify-center">
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
        .hero-word {
          animation: fadeUp 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .hero-subtitle {
          animation: fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .hero-btn {
          animation: fadeUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
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
          style={{ background: 'radial-gradient(circle, #00ff88 0%, transparent 70%)', animation: 'orb-move-1 15s ease-in-out infinite' }} />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, #007aff 0%, transparent 70%)', animation: 'orb-move-2 18s ease-in-out infinite' }} />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #ff9500 0%, transparent 70%)', animation: 'orb-move-3 12s ease-in-out infinite', transform: 'translate(-50%, -50%)' }} />
      </div>

      {/* Grain overlay */}
      <div className="absolute inset-0 opacity-5"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'1\'/%3E%3C/svg%3E")' }} />

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-xl mx-auto">
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
            <div
              key={i}
              className={i < visibleWords ? 'hero-word' : ''}
              style={{
                opacity: i < visibleWords ? undefined : 0,
                animationDelay: `${i * 0.15}s`,
                fontSize: 'clamp(2.5rem, 10vw, 5rem)',
                fontWeight: 900,
                lineHeight: 1.05,
                letterSpacing: '-0.03em',
              }}
            >
              <span className="shimmer-text">{word}</span>
            </div>
          ))}
        </div>

        {/* Subtitle */}
        <p
          className={subtitleVisible ? 'hero-subtitle' : ''}
          style={{
            opacity: subtitleVisible ? undefined : 0,
            animationDelay: '0.1s',
            color: 'rgba(255,255,255,0.5)',
            fontSize: 'clamp(0.875rem, 2.5vw, 1.125rem)',
            fontWeight: 400,
            lineHeight: 1.6,
            maxWidth: '28ch',
            margin: '0 auto 2.5rem',
          }}
        >
          La tua scheda di allenamento digitale.
        </p>

        {/* CTA Button */}
        <button
          className={btnVisible ? 'hero-btn' : ''}
          onClick={() => document.getElementById('main-content')?.scrollIntoView({ behavior: 'smooth' })}
          style={{
            opacity: btnVisible ? undefined : 0,
            animationDelay: '0.1s',
            background: 'rgba(255,255,255,0.08)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.15)',
            color: '#fff',
            padding: '14px 32px',
            borderRadius: '50px',
            fontWeight: 500,
            fontSize: '0.9rem',
            cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.transform = 'translateY(0)'; }}
        >
          Inizia l'allenamento
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14" /><path d="m19 12-7 7-7-7" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default HeroFuturistic;
