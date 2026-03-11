import React, { useMemo } from 'react';

// SVG path data for each particle type (24×24 viewBox)
const PATHS = {
  // Elegant upright petal / lotus petal shape
  lotus: 'M12 3C10 6 7 9 7 13C7 17 9 20 12 20C15 20 17 17 17 13C17 9 14 6 12 3Z M8 18C9 20 10 22 12 23C14 22 15 20 16 18C14 19 10 19 8 18Z',
  // Rounded cherry-blossom petal, slightly asymmetric
  petals: 'M12 4C15 4 19 8 19 13C19 17 16 20 12 20C8 20 5 17 5 13C5 8 9 4 12 4Z M10 4C9 5 8 7 8 9C10 7 12 6 14 7C13 5 12 4 10 4Z',
  // Simplified dumbbell
  weights: 'M3 9H6V7H9V17H6V15H3V9Z M15 7H18V9H21V15H18V17H15V7Z M9 10H15V14H9V10Z',
  // Classic diamond
  diamonds: 'M12 2L22 10 12 22 2 10Z M12 2L2 10H22Z',
  // 5-point star
  stars: 'M12 2L14.4 9.2H22L16.2 13.7L18.6 21L12 16.5L5.4 21L7.8 13.7L2 9.2H9.6Z',
};

// Deterministic seeded pseudo-random from particle type + index
const seededVal = (seed, i, range, offset = 0) =>
  offset + ((seed * (i + 1) * 31 + seed * 17) % range);

export default function FloatingParticles({ type, color }) {
  const particles = useMemo(() => {
    if (!type || type === 'none') return [];
    const seed = type.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    return Array.from({ length: 10 }, (_, i) => ({
      id: i,
      x: seededVal(seed, i, 88, 4),          // left %: 4–92
      delay: seededVal(seed, i, 140, 0) / 10, // delay: 0–14s
      duration: seededVal(seed, i, 120, 150) / 10, // 15–27s
      size: seededVal(seed, i, 18, 14),       // 14–32px
      opacity: (4 + (i % 4) * 2) / 100,      // 0.04–0.10
      rotateEnd: 180 + seededVal(seed, i, 360, 0), // 180–540deg
    }));
  }, [type]);

  if (!particles.length) return null;
  const path = PATHS[type] || PATHS.stars;
  const fillColor = color || '#ffffff';

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 1 }}
    >
      <style>{`
        @keyframes pfloat {
          0%   { transform: translateY(0px) rotate(0deg) scale(0.7); }
          8%   { opacity: 1; }
          92%  { opacity: 1; }
          100% { transform: translateY(-110vh) rotate(var(--pr, 360deg)) scale(0.5); opacity: 0; }
        }
        @keyframes pfloat-init {
          0%  { opacity: 0; }
          8%  { opacity: 1; }
          92% { opacity: 1; }
          100%{ opacity: 0; }
        }
      `}</style>

      {particles.map(p => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.x}%`,
            bottom: '-60px',
            width: p.size,
            height: p.size,
            opacity: 0,
            '--pr': `${p.rotateEnd}deg`,
            animation: [
              `pfloat ${p.duration}s ${p.delay}s linear infinite`,
              `pfloat-init ${p.duration}s ${p.delay}s linear infinite`,
            ].join(', '),
            willChange: 'transform, opacity',
          }}
        >
          <svg
            viewBox="0 0 24 24"
            width="100%"
            height="100%"
            fill={fillColor}
            style={{ opacity: p.opacity * 10 }}
          >
            <path d={path} />
          </svg>
        </div>
      ))}
    </div>
  );
}
