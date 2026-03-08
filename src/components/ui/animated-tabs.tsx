"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
}

interface AnimatedTabsProps {
  tabs?: Tab[];
  defaultTab?: string;
  className?: string;
}

const defaultTabs: Tab[] = [
  {
    id: "tab1",
    label: "Forza",
    content: (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full h-full">
        <img
          src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop&auto=format"
          alt="Forza"
          className="rounded-lg w-full h-48 md:h-60 object-cover shadow-[0_0_20px_rgba(0,0,0,0.2)] border-none"
        />
        <div className="flex flex-col gap-y-2">
          <h2 className="text-xl md:text-2xl font-bold text-white">
            Giorni di Forza
          </h2>
          <p className="text-sm text-gray-300">
            Sviluppa potenza pura con esercizi base come trazioni, rematori e piegamenti. 
            Costruisci una foundation solida per risultati duraturi.
          </p>
          <div className="flex gap-2 mt-2">
            <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">Giorno 1</span>
            <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full">Giorno 4</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "tab2",
    label: "Gambe",
    content: (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full h-full">
        <img
          src="https://images.unsplash.com/photo-1506543730435-e2c1d4553a84?w=400&h=300&fit=crop&auto=format"
          alt="Gambe"
          className="rounded-lg w-full h-48 md:h-60 object-cover shadow-[0_0_20px_rgba(0,0,0,0.2)] border-none"
        />
        <div className="flex flex-col gap-y-2">
          <h2 className="text-xl md:text-2xl font-bold text-white">
            Gambe Tattiche
          </h2>
          <p className="text-sm text-gray-300">
            Rinforza i muscoli chiave con movimenti safe per le ginocchia. 
            Stacchi rumeni, affondi e lavoro cardio a impatto zero.
          </p>
          <div className="flex gap-2 mt-2">
            <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">Giorno 2</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "tab3",
    label: "Recupero",
    content: (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full h-full">
        <img
          src="https://images.unsplash.com/photo-1522428938647-2baa7c899f2f?w=400&h=300&fit=crop&auto=format"
          alt="Recupero"
          className="rounded-lg w-full h-48 md:h-60 object-cover shadow-[0_0_20px_rgba(0,0,0,0.2)] border-none"
        />
        <div className="flex flex-col gap-y-2">
          <h2 className="text-xl md:text-2xl font-bold text-white">
            Recupero Attivo
          </h2>
          <p className="text-sm text-gray-300">
            Pilates Reformer e condizionamento metabolico. 
            Allunga i muscoli e accelera il metabolismo per risultati migliori.
          </p>
          <div className="flex gap-2 mt-2">
            <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">Giorno 3</span>
            <span className="px-2 py-1 bg-orange-500/20 text-orange-400 text-xs rounded-full">Giorno 5</span>
          </div>
        </div>
      </div>
    ),
  },
];

const AnimatedTabs = ({
  tabs = defaultTabs,
  defaultTab,
  className,
}: AnimatedTabsProps) => {
  const [activeTab, setActiveTab] = useState<string>(defaultTab || tabs[0]?.id);

  if (!tabs?.length) return null;

  return (
    <div className={cn("w-full max-w-2xl mx-auto flex flex-col gap-y-4", className)}>
      <div className="flex gap-2 flex-wrap bg-white/5 backdrop-blur-sm p-1 rounded-2xl border border-white/10">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "relative px-4 py-2 text-sm font-medium rounded-xl text-white/80 hover:text-white outline-none transition-colors"
            )}
          >
            {activeTab === tab.id && (
              <motion.div
                layoutId="active-tab"
                className="absolute inset-0 bg-white/10 backdrop-blur-sm shadow-lg rounded-xl border border-white/20"
                transition={{ type: "spring", duration: 0.6, bounce: 0.2 }}
              />
            )}
            <span className="relative z-10">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="p-6 bg-white/5 backdrop-blur-sm shadow-xl rounded-2xl border border-white/10 min-h-64">
        {tabs.map(
          (tab) =>
            activeTab === tab.id && (
              <motion.div
                key={tab.id}
                initial={{
                  opacity: 0,
                  scale: 0.95,
                  y: 20,
                  filter: "blur(4px)",
                }}
                animate={{ 
                  opacity: 1, 
                  scale: 1, 
                  y: 0, 
                  filter: "blur(0px)" 
                }}
                exit={{ 
                  opacity: 0, 
                  scale: 0.95, 
                  y: -20, 
                  filter: "blur(4px)" 
                }}
                transition={{
                  duration: 0.4,
                  ease: "circInOut",
                  type: "spring",
                }}
              >
                {tab.content}
              </motion.div>
            )
        )}
      </div>
    </div>
  );
};

export { AnimatedTabs };
