import React, { useState, useEffect } from 'react';
import { Sparkles, Brain, Cpu, CheckCircle } from 'lucide-react';

interface LoadingOverlayProps {
  isLoading: boolean;
}

const STAGES = [
  { text: "Rasm skanerlanmoqda va matn tanilmoqda...", icon: Cpu },
  { text: "Fan aniqlanmoqda va savol sharti tahlil qilinmoqda...", icon: Brain },
  { text: "Formulalar va hisob-kitoblar 2 marta tekshirilmoqda...", icon: Sparkles },
  { text: "Tushunarli bosqichma-bosqich yechim tayyorlanmoqda...", icon: CheckCircle },
];

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ isLoading }) => {
  const [currentStage, setCurrentStage] = useState(0);

  useEffect(() => {
    if (!isLoading) {
      setCurrentStage(0);
      return;
    }

    const interval = setInterval(() => {
      setCurrentStage((prev) => (prev < STAGES.length - 1 ? prev + 1 : prev));
    }, 2200);

    return () => clearInterval(interval);
  }, [isLoading]);

  if (!isLoading) return null;

  const ActiveIcon = STAGES[currentStage].icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-md p-4">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-7 shadow-2xl flex flex-col items-center text-center overflow-hidden">
        {/* Glowing background circles */}
        <div className="absolute -top-16 -right-16 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-violet-500/20 rounded-full blur-2xl pointer-events-none" />

        {/* Central Pulse Icon */}
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-xl shadow-indigo-600/30 animate-pulse">
            <ActiveIcon className="w-10 h-10 animate-bounce" />
          </div>
          <div className="absolute -inset-2 rounded-3xl border-2 border-indigo-400/40 animate-ping opacity-30" />
        </div>

        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
          AI Ustoz savolni yechmoqda...
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 h-10 max-w-xs transition-all duration-300">
          {STAGES[currentStage].text}
        </p>

        {/* Progress Dots */}
        <div className="flex items-center gap-2 mt-5">
          {STAGES.map((_, idx) => (
            <div
              key={idx}
              className={`h-2 rounded-full transition-all duration-500 ${
                idx === currentStage
                  ? 'w-8 bg-indigo-600'
                  : idx < currentStage
                  ? 'w-2 bg-emerald-500'
                  : 'w-2 bg-slate-200 dark:bg-slate-700'
              }`}
            />
          ))}
        </div>

        <p className="mt-5 text-[11px] text-slate-400 dark:text-slate-500">
          Gemini 3.8 Flash orqali tahlil qilinmoqda
        </p>
      </div>
    </div>
  );
};
