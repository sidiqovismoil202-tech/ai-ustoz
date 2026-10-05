/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ImageUploader } from './components/ImageUploader';
import { SolutionCard } from './components/SolutionCard';
import { CameraModal } from './components/CameraModal';
import { LoadingOverlay } from './components/LoadingOverlay';
import { HistoryDrawer } from './components/HistoryDrawer';
import { SolveResult, HistoryItem } from './types';
import {
  AlertCircle,
  Sparkles,
  BookOpen,
  CheckCircle,
  HelpCircle,
  Brain,
  ShieldCheck,
  Zap
} from 'lucide-react';

export default function App() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageInfo, setImageInfo] = useState<{ name: string; size: string } | null>(null);
  const [userPrompt, setUserPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<SolveResult | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // Modals & Drawers
  const [isCameraOpen, setIsCameraOpen] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);

  // History state
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('ai_ustoz_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Dark mode state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('ai_ustoz_theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  // Toast notification
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  // Sync dark mode class on HTML root
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('ai_ustoz_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('ai_ustoz_theme', 'light');
    }
  }, [isDarkMode]);

  // Persist history
  useEffect(() => {
    try {
      localStorage.setItem('ai_ustoz_history', JSON.stringify(history));
    } catch (e) {
      console.warn("Could not save history to localStorage", e);
    }
  }, [history]);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  const handleImageSelected = (dataUrl: string, info?: { name: string; size: string }) => {
    setSelectedImage(dataUrl);
    setImageInfo(info || { name: 'Kamera surati', size: 'Surat' });
    setErrorMessage(null);
    // If there was an old result, keep it or allow re-solve
  };

  const handleClear = () => {
    setSelectedImage(null);
    setImageInfo(null);
    setResult(null);
    setErrorMessage(null);
    setUserPrompt('');
    showToast("Vazifa tozalab tashlandi");
  };

  // Main Solve Handler
  const handleSolve = async () => {
    if (!selectedImage) {
      setErrorMessage("Iltimos, avval savol rasmini yuklang yoki kameradan suratga oling!");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/solve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageBase64: selectedImage,
          userPrompt: userPrompt.trim(),
        }),
      });

      const resData = await response.json();

      if (!response.ok || !resData.success) {
        throw new Error(resData.error || "Savolni yechishda serverda xatolik yuz berdi.");
      }

      const solveResult: SolveResult = resData.data;
      setResult(solveResult);

      // Save to history if valid
      if (solveResult.isReadable) {
        const newItem: HistoryItem = {
          id: Date.now().toString(),
          timestamp: Date.now(),
          imageThumbnail: selectedImage,
          subject: solveResult.detectedSubject || "Umumiy",
          summary: solveResult.summary || "Yechilgan topshiriq",
          result: solveResult,
        };
        setHistory((prev) => [newItem, ...prev.slice(0, 24)]);
      }

      showToast("Savol muvaffaqiyatli yechildi!");
    } catch (err: any) {
      console.error("Solve request error:", err);
      setErrorMessage(
        err.message || "Kutilmagan xatolik yuz berdi. Internet aloqasini tekshirib, qayta urinib ko'ring."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Copy full solution
  const handleCopyAll = () => {
    if (!result || !result.questions) return;

    let textToCopy = `📘 AI Ustoz - Yechim (${result.detectedSubject})\n`;
    textToCopy += `------------------------------------\n\n`;

    result.questions.forEach((q, idx) => {
      textToCopy += `${idx + 1}-SAVOL: ${q.questionText || ""}\n`;
      if (q.isMultipleChoice && q.correctOption) {
        textToCopy += `To'g'ri variant: ${q.correctOption}\n`;
      }
      textToCopy += `\nJAVOB: ${q.finalAnswer}\n\n`;
      textToCopy += `TUSHUNTIRISH:\n${q.explanation}\n\n`;

      if (q.steps && q.steps.length > 0) {
        textToCopy += `BOSQICHMA-BOSQICH YECHIM:\n`;
        q.steps.forEach((s) => {
          textToCopy += `${s.stepNumber}) ${s.title}: ${s.explanation}\n`;
          if (s.formulaOrEquation) {
            textToCopy += `   Formula: ${s.formulaOrEquation}\n`;
          }
        });
        textToCopy += `\n`;
      }
      textToCopy += `====================================\n\n`;
    });

    navigator.clipboard.writeText(textToCopy);
    setIsCopied(true);
    showToast("Javob va tushuntirish nusxalandi!");
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handleSelectHistoryItem = (item: HistoryItem) => {
    setSelectedImage(item.imageThumbnail);
    setImageInfo({ name: `${item.subject} vazifasi`, size: 'Tarixdan' });
    setResult(item.result);
    setErrorMessage(null);
    showToast("Tarixdan tiklandi");
  };

  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem('ai_ustoz_history');
    showToast("Tarix tozalandi");
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
        onOpenHistory={() => setIsHistoryOpen(true)}
        historyCount={history.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10 flex flex-col gap-8">
        {/* Hero Banner */}
        <section className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-xs font-bold tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-spin" style={{ animationDuration: '4s' }} />
            <span>AI Yordamida Uy Vazifalarini Yechish</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Rasmni yuklang — savolni{' '}
            <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 dark:from-indigo-400 dark:via-violet-400 dark:to-purple-300 bg-clip-text text-transparent">
              AI yordamida
            </span>{' '}
            yeching
          </h2>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-lg mx-auto leading-relaxed">
            Matematika, fizika, kimyo, biologiya, ingliz tili va boshqa fanlar. Har bir savol uchun bosqichma-bosqich aniq va tushunarli yechim.
          </p>
        </section>

        {/* Error Banner (e.g. no image selected or server error) */}
        {errorMessage && (
          <div className="w-full p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-200 flex items-start gap-3 shadow-md animate-in fade-in duration-200">
            <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1 text-xs sm:text-sm">
              <strong className="font-semibold block mb-0.5">Xatolik:</strong>
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-rose-500 hover:text-rose-700 dark:hover:text-rose-300 text-xs font-semibold px-2 py-1"
            >
              Yopish
            </button>
          </div>
        )}

        {/* Section 1: Image Upload & Camera */}
        <section>
          <ImageUploader
            image={selectedImage}
            onImageSelected={handleImageSelected}
            onClear={handleClear}
            onOpenCamera={() => setIsCameraOpen(true)}
            onSolve={handleSolve}
            isLoading={isLoading}
            userPrompt={userPrompt}
            setUserPrompt={setUserPrompt}
          />
        </section>

        {/* Section 2: Solution Card (Rendered if result is ready) */}
        {result && (
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <SolutionCard
              result={result}
              onReSolve={handleSolve}
              onClear={handleClear}
              onCopyAll={handleCopyAll}
              isCopied={isCopied}
            />
          </section>
        )}

        {/* Feature Highlights Grid (for first time / when idle) */}
        {!result && (
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Brain className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Barcha maktab fanlari
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Algebra, geometriya, fizika, kimyo, biologiya, ona tili va ingliz tili qoidalarini chuqur tushunadi.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center">
                <Zap className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Bosqichma-bosqich formulalar
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Shunchaki tayyor javob emas, balki qaysi formula qanday qo'llanganini qadam-baqadam o'rgatadi.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Aniq va tekshirilgan hisob
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Rasm xira bo'lsa taxmin qilmaydi, aksincha qayta suratga olishni maslahat beradi.
              </p>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800/80 bg-white/50 dark:bg-slate-900/50 py-6 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-700 dark:text-slate-300">AI Ustoz</span>
            <span>— o'quvchilar va talabalar uchun virtual ta'lim yordamchisi.</span>
          </p>
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">
              Google Gemini 3.8 Flash bilan quvvatlangan
            </span>
          </div>
        </div>
      </footer>

      {/* Camera Capture Modal */}
      <CameraModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={(dataUrl) => handleImageSelected(dataUrl, { name: 'Kamera surati', size: 'Kamera' })}
      />

      {/* History Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelect={handleSelectHistoryItem}
        onClearHistory={handleClearHistory}
      />

      {/* Loading Reasoning Overlay */}
      <LoadingOverlay isLoading={isLoading} />

      {/* Floating Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs sm:text-sm font-semibold shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <CheckCircle className="w-4 h-4 text-emerald-400 dark:text-emerald-600 shrink-0" />
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}
