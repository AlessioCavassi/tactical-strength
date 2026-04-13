import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../i18n/LanguageContext';

// PT phone number — set REACT_APP_PT_WHATSAPP in .env / Vercel
const PT_PHONE = process.env.REACT_APP_PT_WHATSAPP || '39345513xxxx';

// PT is "online" between 7:00–22:00 local time on weekdays, 9:00–18:00 weekends
function isPTOnline() {
  const now = new Date();
  const h = now.getHours();
  const day = now.getDay(); // 0=Sun, 6=Sat
  const isWeekend = day === 0 || day === 6;
  return isWeekend ? h >= 9 && h < 18 : h >= 7 && h < 22;
}

function buildWhatsAppText(userName, dayTitle, completedExercises, t) {
  const lines = [`✅ *${t.waSessionCompleted}* — ${dayTitle}`, `👤 ${userName || t.athlete}`, ``];
  Object.entries(completedExercises).forEach(([id, data]) => {
    if (data.weight || data.reps) {
      lines.push(`• ${id}: ${data.weight ? data.weight + ' kg' : ''}${data.reps ? ' × ' + data.reps + ' reps' : ''}`);
    }
  });
  lines.push(``, `_${t.waSentFrom}_`);
  return encodeURIComponent(lines.join('\n'));
}

export function PTStatusBadge() {
  const { t } = useLanguage();
  const [online, setOnline] = useState(isPTOnline());

  useEffect(() => {
    const interval = setInterval(() => setOnline(isPTOnline()), 60_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}>
      <motion.div
        className="w-1.5 h-1.5 rounded-full"
        style={{ background: online ? '#30d158' : '#636366' }}
        animate={online ? { scale: [1, 1.4, 1], opacity: [1, 0.6, 1] } : {}}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      />
      <span className="text-[9px] font-semibold"
        style={{ color: online ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.2)' }}>
        PT {online ? t.ptOnline : t.ptOffline}
      </span>
    </div>
  );
}

export function SendToPTButton({ userName, dayTitle, completedExercises, exerciseCount }) {
  const { t } = useLanguage();
  const [sent, setSent] = useState(false);
  const hasData = Object.keys(completedExercises).length > 0;

  const handleSend = () => {
    const text = buildWhatsAppText(userName, dayTitle, completedExercises, t);
    window.open(`https://wa.me/${PT_PHONE}?text=${text}`, '_blank');
    setSent(true);
    setTimeout(() => setSent(false), 5000);
  };

  if (!hasData) return null;

  return (
    <motion.button
      onClick={handleSend}
      whileTap={{ scale: 0.96 }}
      className="w-full py-3 flex items-center justify-center gap-2.5 font-semibold text-sm transition-all"
      style={{
        background: sent
          ? 'rgba(48,209,88,0.15)'
          : 'rgba(37,211,102,0.12)',
        border: `1px solid ${sent ? 'rgba(48,209,88,0.4)' : 'rgba(37,211,102,0.2)'}`,
        borderRadius: 'var(--btn-radius, 16px)',
        color: sent ? '#30d158' : 'rgba(255,255,255,0.7)',
      }}
    >
      {sent ? (
        <>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#30d158" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
          {t.sentToPT}
        </>
      ) : (
        <>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          {t.sendToPT}
          <span className="text-[10px] opacity-50 font-normal">({exerciseCount} {t.exercises})</span>
        </>
      )}
    </motion.button>
  );
}
