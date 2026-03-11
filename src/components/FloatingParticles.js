import React, { useMemo } from 'react';

// High-quality emoji characters — crisp at any size, no custom SVG needed
const GLYPHS = {
  lotus:    ['🪷', '🌺', '🌸', '🌼'],
  petals:   ['🌸', '🌺', '🌷', '🌸'],
  weights:  ['🏋️', '💪', '🥊', '⚡'],
  diamonds: ['💎', '✦', '◆', '💠'],
  stars:    ['✦', '★', '✧', '✶'],
};

// Deterministic seeded value
const seededVal = (seed, i, range, offset = 0) =>
  offset + ((seed * (i + 1) * 31 + seed * 17) % range);

export default function FloatingParticles({ type }) {
  const particles = useMemo(() => {
    if (!type || type === 'none') return [];
    const seed = type.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    const glyphs = GLYPHS[type] || GLYPHS.stars;
    return Array.from({ length: 10 }, (_, i) => ({
      id: i,
      glyph: glyphs[i % glyphs.length],
      x: seededVal(seed, i, 86, 4),              // left %: 4–90
      delay: seededVal(seed, i, 140, 0) / 10,    // 0–14s stagger
      duration: seededVal(seed, i, 130, 160) / 10, // 16–29s (slow, graceful)
      size: seededVal(seed, i, 20, 16),           // 16–36px
      opacity: (3 + (i % 4) * 2) / 100,          // 0.03–0.09 (very subtle)
      rotateStart: seededVal(seed, i, 60, -30),   // -30 to 30deg initial tilt
      rotateEnd: seededVal(seed, i, 180, 90),     // 90–270deg total rotation
      drift: seededVal(seed, i, 60, -30),         // -30 to 30px horizontal drift
    }));
  }, [type]);

  if (!particles.length) return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 1 }}
    >
      <style>{`
        @keyframes pfloat {
          0%   { transform: translateY(0px)    translateX(0px)              rotate(var(--ps,0deg))  scale(0.6); opacity: 0; }
          8%   { opacity: 1; }
          50%  { transform: translateY(-55vh)  translateX(var(--pd,20px))   rotate(calc(var(--ps,0deg) + var(--pr,180deg) * 0.5)) scale(1); }
          92%  { opacity: 1; }
          100% { transform: translateY(-112vh) translateX(0px)              rotate(calc(var(--ps,0deg) + var(--pr,180deg))) scale(0.5); opacity: 0; }
        }
      `}</style>

      {particles.map(p => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.x}%`,
            bottom: '-60px',
            fontSize: p.size,
            lineHeight: 1,
            userSelect: 'none',
            '--ps': `${p.rotateStart}deg`,
            '--pr': `${p.rotateEnd}deg`,
            '--pd': `${p.drift}px`,
            opacity: 0,
            animation: `pfloat ${p.duration}s ${p.delay}s ease-in-out infinite`,
            willChange: 'transform, opacity',
            filter: `opacity(${p.opacity * 100}%)`,
          }}
        >
          {p.glyph}
        </div>
      ))}
    </div>
  );
}
