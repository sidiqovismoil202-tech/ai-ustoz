import React, { useState } from 'react';
import {
  CheckCircle2,
  Copy,
  Check,
  RotateCw,
  Trash2,
  BookOpen,
  HelpCircle,
  Lightbulb,
  Sparkles,
  Volume2,
  VolumeX,
  MessageSquare,
  Send,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Award,
  Layers
} from 'lucide-react';
import { SolveResult, SolvedQuestion } from '../types';

interface SolutionCardProps {
  result: SolveResult;
  onReSolve: () => void;
  onClear: () => void;
  onCopyAll: () => void;
  isCopied: boolean;
}

export const SolutionCard: React.FC<SolutionCardProps> = ({
  result,
  onReSolve,
  onClear,
  onCopyAll,
  isCopied,
}) => {
  const [activeQuestionTab, setActiveQuestionTab] = useState<number>(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showPractice, setShowPractice] = useState(false);
  const [selectedPracticeOption, setSelectedPracticeOption] = useState<string | null>(null);
  const [practiceRevealed, setPracticeRevealed] = useState(false);

  // Follow-up chat state
  const [followUpQuery, setFollowUpQuery] = useState('');
  const [isFollowUpLoading, setIsFollowUpLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([]);

  const questions = result.questions || [];
  const currentQuestion: SolvedQuestion | undefined = questions[activeQuestionTab] || questions[0];

  // Handle SpeechSynthesis
  const handleToggleSpeech = () => {
    if (!('speechSynthesis' in window)) {
      alert("Kechirasiz, brauzeringiz ovozli o'qishni qo'llab-quvvatlamaydi.");
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    if (!currentQuestion) return;

    const textToSpeak = `Javob: ${currentQuestion.finalAnswer}. Tushuntirish: ${currentQuestion.explanation}`;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = 'uz-UZ';
    utterance.rate = 0.95;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  // Handle follow up chat submit
  const handleSendFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!followUpQuery.trim() || isFollowUpLoading) return;

    const userText = followUpQuery.trim();
    setChatMessages((prev) => [...prev, { role: 'user', text: userText }]);
    setFollowUpQuery('');
    setIsFollowUpLoading(true);

    try {
      const response = await fetch('/api/follow-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionContext: currentQuestion?.questionText || result.summary,
          previousAnswer: `${currentQuestion?.finalAnswer || ''} - ${currentQuestion?.explanation || ''}`,
          userQuestion: userText,
        }),
      });

      const data = await response.json();
      if (data.success && data.reply) {
        setChatMessages((prev) => [...prev, { role: 'assistant', text: data.reply }]);
      } else {
        setChatMessages((prev) => [
          ...prev,
          { role: 'assistant', text: "Kechirasiz, javob olishda muammo bo'ldi. Iltimos, qayta so'rang." },
        ]);
      }
    } catch (err) {
      setChatMessages((prev) => [
        ...prev,
        { role: 'assistant', text: "Serverga ulanishda xatolik yuz berdi." },
      ]);
    } finally {
      setIsFollowUpLoading(false);
    }
  };

  // If image is unreadable
  if (!result.isReadable) {
    return (
      <div className="w-full bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/50 rounded-3xl p-6 sm:p-8 shadow-xl shadow-amber-500/5">
        <div className="flex items-start gap-4">
          <div className="p-3.5 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 shrink-0">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <div className="flex-1">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Rasm aniq emas
            </span>
            <h3 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100 mt-1 mb-2">
              Savol matnini to'liq o'qib bo'lmadi
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
              {result.unclearReason ||
                "Rasm xira, qorong'i yoki savolning bir qismi kadrga sig'magan. Iltimos, quyidagi maslahatlarga amal qilib, qayta rasmga oling:"}
            </p>

            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 rounded-2xl p-4 mb-6">
              <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200 uppercase mb-2">
                📌 Yaxshiroq natija uchun maslahatlar:
              </h4>
              <ul className="text-xs text-amber-800 dark:text-amber-300 space-y-1.5 list-disc list-inside">
                <li>Kamerani savolga yaqinroq tuting va diqqatni (fokusni) to'g'rilang</li>
                <li>Yoritish yetarli ekanligiga ishonch hosil qiling (chiroq yoki deraza yorug'i)</li>
                <li>Rasm qiyshiq bo'lsa, uni 90° ga aylantirish tugmasidan foydalaning</li>
                <li>Faqat bitta yoki ikkita savolni kadrga olsangiz, javob yanada aniq bo'ladi</li>
              </ul>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={onReSolve}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition shadow-lg shadow-indigo-600/20"
              >
                <RotateCw className="w-4 h-4" />
                <span>Qayta urinish</span>
              </button>
              <button
                onClick={onClear}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-sm transition"
              >
                <Trash2 className="w-4 h-4" />
                <span>Tozalash</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Top Header Card: Subject & Meta */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-violet-900 text-white rounded-3xl p-5 sm:p-6 shadow-xl shadow-indigo-900/20 relative overflow-hidden">
        {/* Decorative circle glow */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-violet-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-wrap items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-2.5">
            <span className="px-3 py-1 rounded-xl bg-white/15 backdrop-blur-md text-xs font-bold uppercase tracking-wider text-indigo-200 border border-white/10 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-indigo-300" />
              {result.detectedSubject || "Umumiy fan"}
            </span>
            <span className="px-3 py-1 rounded-xl bg-white/10 text-xs text-indigo-200">
              Til: {result.detectedLanguage || "O'zbekcha"}
            </span>
            {questions.length > 1 && (
              <span className="px-3 py-1 rounded-xl bg-amber-400/20 text-amber-200 border border-amber-400/30 text-xs font-semibold flex items-center gap-1">
                <Layers className="w-3.5 h-3.5" />
                {questions.length} ta savol aniqlandi
              </span>
            )}
          </div>

          {/* Action Buttons Toolbar */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleSpeech}
              className={`p-2.5 rounded-xl border border-white/15 text-xs font-medium transition flex items-center gap-1.5 ${
                isSpeaking
                  ? 'bg-rose-500/80 text-white animate-pulse'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
              title={isSpeaking ? "O'qishni to'xtatish" : "Ovozli eshitish"}
            >
              {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              <span className="hidden sm:inline">{isSpeaking ? "To'xtatish" : "Ovozli eshitish"}</span>
            </button>

            {/* "Javobni nusxalash" */}
            <button
              onClick={onCopyAll}
              className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-white text-xs sm:text-sm font-semibold transition flex items-center gap-1.5 backdrop-blur-md active:scale-95"
            >
              {isCopied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              <span>{isCopied ? "Nusxalandi!" : "📋 Javobni nusxalash"}</span>
            </button>

            {/* "Qayta yechish" */}
            <button
              onClick={onReSolve}
              className="p-2.5 sm:px-3 sm:py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs font-medium transition flex items-center gap-1.5 active:scale-95"
              title="Qayta yechish"
            >
              <RotateCw className="w-4 h-4" />
              <span className="hidden md:inline">🔄 Qayta yechish</span>
            </button>

            {/* "Tozalash" */}
            <button
              onClick={onClear}
              className="p-2.5 sm:px-3 sm:py-2.5 rounded-xl bg-white/10 hover:bg-rose-500/30 hover:border-rose-400/40 border border-white/15 text-white text-xs font-medium transition flex items-center gap-1.5 active:scale-95"
              title="Tozalash"
            >
              <Trash2 className="w-4 h-4 text-rose-300" />
              <span className="hidden md:inline">🗑️ Tozalash</span>
            </button>
          </div>
        </div>

        {/* Short summary */}
        {result.summary && (
          <p className="mt-3 text-xs sm:text-sm text-indigo-100/90 leading-relaxed font-normal">
            {result.summary}
          </p>
        )}

        {/* Multiple questions tabs */}
        {questions.length > 1 && (
          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/10 overflow-x-auto pb-1">
            <span className="text-xs font-semibold text-indigo-200 shrink-0">Savollar:</span>
            {questions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => setActiveQuestionTab(idx)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                  activeQuestionTab === idx
                    ? 'bg-white text-indigo-900 shadow-md'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                #{q.questionNumber || idx + 1}-savol
              </button>
            ))}
          </div>
        )}
      </div>

      {currentQuestion && (
        <div className="flex flex-col gap-6">
          {/* Question Text Box (if detected) */}
          {currentQuestion.questionText && (
            <div className="bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                <HelpCircle className="w-4 h-4 text-indigo-500" />
                <span>Aniqlangan savol matni:</span>
              </div>
              <p className="text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-100 leading-relaxed">
                {currentQuestion.questionText}
              </p>
            </div>
          )}

          {/* 1. "JAVOB" CARD (High-impact result) */}
          <div className="relative bg-white dark:bg-slate-900 border-2 border-indigo-500/40 dark:border-indigo-500/40 rounded-3xl p-6 sm:p-7 shadow-xl shadow-indigo-500/5">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-7 h-7 rounded-xl bg-indigo-600 text-white">
                  <CheckCircle2 className="w-4 h-4" />
                </span>
                <h3 className="text-base sm:text-lg font-extrabold uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
                  Javob
                </h3>
              </div>

              {currentQuestion.isMultipleChoice && currentQuestion.correctOption && (
                <div className="px-4 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-bold text-xs sm:text-sm flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-emerald-500" />
                  <span>To'g'ri variant: {currentQuestion.correctOption}</span>
                </div>
              )}
            </div>

            {/* The Final Answer Display */}
            <div className="bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 rounded-2xl p-4 sm:p-5 my-2">
              <div className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white break-words">
                {currentQuestion.finalAnswer}
              </div>
            </div>

            {/* Key concept / Formula badge if available */}
            {currentQuestion.keyConceptOrFormula && (
              <div className="mt-3 flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 px-3.5 py-2 rounded-xl border border-slate-200/60 dark:border-slate-800">
                <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
                <span>
                  <strong>Asosiy qoida / formula:</strong> {currentQuestion.keyConceptOrFormula}
                </span>
              </div>
            )}
          </div>

          {/* 2. "TUSHUNTIRISH" CARD */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-lg shadow-slate-200/30 dark:shadow-none">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-7 h-7 rounded-xl bg-violet-600 text-white flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                Tushuntirish
              </h3>
            </div>

            <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed font-normal whitespace-pre-line">
              {currentQuestion.explanation}
            </p>
          </div>

          {/* 3. STEP-BY-STEP SOLUTION (for math/physics/calculations) */}
          {currentQuestion.steps && currentQuestion.steps.length > 0 && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-lg shadow-slate-200/30 dark:shadow-none">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-cyan-600 text-white flex items-center justify-center font-bold text-xs">
                    123
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                    Bosqichma-bosqich yechim
                  </h3>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800/40">
                  {currentQuestion.steps.length} ta qadam
                </span>
              </div>

              <div className="space-y-4">
                {currentQuestion.steps.map((step, idx) => (
                  <div
                    key={idx}
                    className="relative pl-6 sm:pl-8 before:absolute before:left-2.5 before:top-8 before:bottom-0 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800 last:before:hidden"
                  >
                    {/* Step Number Dot */}
                    <div className="absolute left-0 top-0.5 w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 text-white text-xs font-bold flex items-center justify-center shadow-md">
                      {step.stepNumber || idx + 1}
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800 rounded-2xl p-4 transition hover:border-indigo-400 dark:hover:border-indigo-600">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">
                        {step.title}
                      </h4>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-2">
                        {step.explanation}
                      </p>

                      {step.formulaOrEquation && (
                        <div className="bg-white dark:bg-slate-900 border border-indigo-200/60 dark:border-indigo-900/60 rounded-xl px-3.5 py-2 font-mono text-xs sm:text-sm font-semibold text-indigo-700 dark:text-indigo-300 overflow-x-auto">
                          {step.formulaOrEquation}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Helpful tips / notes */}
          {result.tipsOrNotes && (
            <div className="bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 rounded-2xl p-4 sm:p-5 flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 mb-1">
                  Ustozdan maslahat:
                </h4>
                <p className="text-xs sm:text-sm text-emerald-900 dark:text-emerald-200 leading-relaxed">
                  {result.tipsOrNotes}
                </p>
              </div>
            </div>
          )}

          {/* Interactive Practice Question (Mavzuni mustahkamlash) */}
          {result.practiceQuestion && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-md">
              <div
                onClick={() => setShowPractice(!showPractice)}
                className="flex items-center justify-between cursor-pointer select-none"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100">
                      Mavzuni mustahkamlash uchun o'xshash mashq
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Bilimingizni sinab ko'ring va natijani tekshiring
                    </p>
                  </div>
                </div>
                <div className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                  {showPractice ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              </div>

              {showPractice && (
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-3">
                    {result.practiceQuestion.question}
                  </p>

                  {/* Options if available */}
                  {result.practiceQuestion.options && result.practiceQuestion.options.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                      {result.practiceQuestion.options.map((opt, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSelectedPracticeOption(opt)}
                          className={`text-left p-3 rounded-xl border text-xs sm:text-sm font-medium transition ${
                            selectedPracticeOption === opt
                              ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-900 dark:text-indigo-200'
                              : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setPracticeRevealed(true)}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition"
                    >
                      Javobni ko'rish
                    </button>
                    {practiceRevealed && (
                      <button
                        type="button"
                        onClick={() => {
                          setPracticeRevealed(false);
                          setSelectedPracticeOption(null);
                        }}
                        className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                      >
                        Qayta urinish
                      </button>
                    )}
                  </div>

                  {practiceRevealed && (
                    <div className="mt-3 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-xs text-emerald-900 dark:text-emerald-200">
                      <p className="font-bold mb-1">
                        To'g'ri javob: {result.practiceQuestion.correctAnswer}
                      </p>
                      <p>{result.practiceQuestion.explanation}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Interactive Follow-up Question Chat */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-md">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100">
                  Tushunmagan joyingiz qoldimi?
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  AI Ustozdan qo'shimcha tushuntirish so'rashingiz mumkin
                </p>
              </div>
            </div>

            {/* Chat history */}
            {chatMessages.length > 0 && (
              <div className="space-y-3 mb-4 max-h-72 overflow-y-auto pr-1">
                {chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col ${
                      msg.role === 'user' ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-indigo-600 text-white rounded-tr-none'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isFollowUpLoading && (
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 italic">
                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
                    AI Ustoz javob yozmoqda...
                  </div>
                )}
              </div>
            )}

            {/* Input Form */}
            <form onSubmit={handleSendFollowUp} className="flex items-center gap-2">
              <input
                type="text"
                value={followUpQuery}
                onChange={(e) => setFollowUpQuery(e.target.value)}
                placeholder="Masalan: '2-qadamda nima uchun manfiy ishora bo'ldi?'"
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
              <button
                type="submit"
                disabled={!followUpQuery.trim() || isFollowUpLoading}
                className="p-2.5 sm:px-4 sm:py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs sm:text-sm font-semibold transition flex items-center gap-1.5"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">So'rash</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
