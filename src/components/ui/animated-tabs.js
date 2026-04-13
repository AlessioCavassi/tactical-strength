"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";
import { useLanguage } from "../../i18n/LanguageContext";

const getDefaultTabs = (t) => [
  {
    id: "tab1",
    label: t.tabStrength,
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 4v16"/><path d="M18 4v16"/><path d="M6 12h12"/><circle cx="6" cy="4" r="2"/><circle cx="6" cy="20" r="2"/><circle cx="18" cy="4" r="2"/><circle cx="18" cy="20" r="2"/></svg>
    ),
    color: "green",
    days: [1, 4],
    title: t.tabStrengthTitle,
    desc: t.tabStrengthDesc,
  },
  {
    id: "tab2",
    label: t.tabLegs,
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 2a5 5 0 015 5v4a5 5 0 01-10 0V7a5 5 0 015-5z"/><path d="M9 16l-2 6"/><path d="M15 16l2 6"/></svg>
    ),
    color: "blue",
    days: [2],
    title: t.tabLegsTitle,
    desc: t.tabLegsDesc,
  },
  {
    id: "tab3",
    label: t.tabRecovery,
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
    ),
    color: "yellow",
    days: [3, 5],
    title: t.tabRecoveryTitle,
    desc: t.tabRecoveryDesc,
  },
];

const colorMap = {
  green: { bg: "bg-green-500/15", text: "text-green-400", border: "border-green-500/20" },
  blue: { bg: "bg-blue-500/15", text: "text-blue-400", border: "border-blue-500/20" },
  yellow: { bg: "bg-yellow-500/15", text: "text-yellow-400", border: "border-yellow-500/20" },
};

const AnimatedTabs = ({
  tabs,
  defaultTab,
  className,
}) => {
  const { t } = useLanguage();
  const resolvedTabs = tabs || getDefaultTabs(t);
  const [activeTab, setActiveTab] = useState(defaultTab || resolvedTabs[0]?.id);

  if (!resolvedTabs?.length) return null;

  return (
    <div className={cn("w-full flex flex-col gap-y-3", className)}>
      {/* Tab bar */}
      <div className="flex gap-1 glass-light p-1 rounded-2xl">
        {resolvedTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="relative flex-1 px-3 py-2.5 text-xs font-semibold rounded-xl text-white/60 outline-none transition-colors active:scale-[0.97]"
          >
            {activeTab === tab.id && (
              <motion.div
                layoutId="active-tab"
                className="absolute inset-0 bg-white/10 backdrop-blur-sm rounded-xl border border-white/15"
                transition={{ type: "spring", duration: 0.5, bounce: 0.15 }}
              />
            )}
            <span className="relative z-10 flex items-center justify-center gap-1.5">
              <span className={activeTab === tab.id ? 'text-white' : ''}>{tab.icon}</span>
              <span className={activeTab === tab.id ? 'text-white' : ''}>{tab.label}</span>
            </span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="glass-light rounded-2xl p-4 min-h-[140px]">
        {resolvedTabs.map(
          (tab) =>
            activeTab === tab.id && (
              <motion.div
                key={tab.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, type: "spring" }}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl ${colorMap[tab.color].bg} flex items-center justify-center flex-shrink-0 ${colorMap[tab.color].text}`}>
                    {tab.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white text-sm font-bold mb-1">{tab.title}</h3>
                    <p className="text-white/40 text-xs leading-relaxed mb-3">{tab.desc}</p>
                    <div className="flex gap-1.5">
                      {tab.days.map(d => (
                        <span key={d} className={`${colorMap[tab.color].bg} ${colorMap[tab.color].text} text-[10px] font-semibold px-2 py-1 rounded-lg`}>
                          {t.dayLabel} {d}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )
        )}
      </div>
    </div>
  );
};

export { AnimatedTabs };
