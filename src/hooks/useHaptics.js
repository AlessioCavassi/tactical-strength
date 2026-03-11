// Lightweight haptic feedback via Vibration API (Android + some iOS)
// Patterns: short=48ms, medium=80ms, long=200ms
const PATTERNS = {
  tap:       [48],
  success:   [48, 60, 80],
  badge:     [60, 50, 60, 50, 120],
  levelUp:   [80, 60, 80, 60, 200],
  complete:  [60, 40, 60, 40, 60, 40, 180],
};

const canVibrate = () =>
  typeof navigator !== 'undefined' && 'vibrate' in navigator;

export function useHaptics() {
  const vibrate = (pattern = 'tap') => {
    if (!canVibrate()) return;
    const p = typeof pattern === 'string' ? (PATTERNS[pattern] || PATTERNS.tap) : pattern;
    try { navigator.vibrate(p); } catch (_) {}
  };

  return { vibrate };
}
