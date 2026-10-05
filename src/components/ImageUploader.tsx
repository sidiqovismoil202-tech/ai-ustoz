import React, { useRef, useState } from 'react';
import {
  UploadCloud,
  Camera,
  Image as ImageIcon,
  RotateCw,
  Trash2,
  Sparkles,
  BookOpen,
  ZoomIn,
  CheckCircle2,
  FileQuestion
} from 'lucide-react';
import { SAMPLE_PROBLEMS, SampleProblem } from '../data/samples';

interface ImageUploaderProps {
  image: string | null;
  onImageSelected: (dataUrl: string, fileInfo?: { name: string; size: string }) => void;
  onClear: () => void;
  onOpenCamera: () => void;
  onSolve: () => void;
  isLoading: boolean;
  userPrompt: string;
  setUserPrompt: (val: string) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  image,
  onImageSelected,
  onClear,
  onOpenCamera,
  onSolve,
  isLoading,
  userPrompt,
  setUserPrompt,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [showSamples, setShowSamples] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    // Validate format
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      alert("Iltimos, JPG, PNG yoki WEBP formatidagi rasm faylini tanlang.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const sizeKb = (file.size / 1024).toFixed(0);
        onImageSelected(reader.result, {
          name: file.name,
          size: `${sizeKb} KB`,
        });
        setRotation(0);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  // Rotate image by 90 degrees using an offscreen canvas
  const handleRotate = () => {
    if (!image) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.height;
      canvas.height = img.width;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((90 * Math.PI) / 180);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);
      const rotatedDataUrl = canvas.toDataURL('image/jpeg', 0.92);
      onImageSelected(rotatedDataUrl);
      setRotation((prev) => (prev + 90) % 360);
    };
    img.src = image;
  };

  const handleSelectSample = async (sample: SampleProblem) => {
    try {
      // Rasterize SVG sample into standard PNG for universal vision model compatibility
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 480;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, 800, 480);
          ctx.drawImage(img, 0, 0, 800, 480);
          const pngUrl = canvas.toDataURL('image/png', 0.95);
          onImageSelected(pngUrl, {
            name: `${sample.subject} - ${sample.title}.png`,
            size: 'Namunaviy rasm',
          });
        } else {
          onImageSelected(sample.imageUrl, {
            name: `${sample.subject} - ${sample.title}`,
            size: 'Namunaviy rasm',
          });
        }
      };
      img.src = sample.imageUrl;
    } catch {
      onImageSelected(sample.imageUrl, {
        name: `${sample.subject} - ${sample.title}`,
        size: 'Namunaviy rasm',
      });
    }
    setRotation(0);
    setShowSamples(false);
  };

  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-xl shadow-slate-200/40 dark:shadow-none overflow-hidden transition-colors">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/jpg"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Main Upload / Preview Area */}
      <div className="p-5 sm:p-7">
        {!image ? (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative flex flex-col items-center justify-center p-8 sm:p-12 border-2 border-dashed rounded-2xl transition-all duration-200 ${
              isDragging
                ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20 scale-[0.99]'
                : 'border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 hover:border-indigo-400 dark:hover:border-indigo-600'
            }`}
          >
            {/* Animated Icon */}
            <div className="relative mb-5">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-indigo-500 via-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-xl shadow-indigo-500/25">
                <UploadCloud className="w-10 h-10 sm:w-12 sm:h-12" />
              </div>
              <div className="absolute -bottom-2 -right-2 w-9 h-9 rounded-2xl bg-amber-400 text-amber-950 flex items-center justify-center font-bold shadow-md">
                <Sparkles className="w-5 h-5" />
              </div>
            </div>

            <h3 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100 text-center mb-1.5">
              Vazifa rasmini bu yerga tashlang yoki tanlang
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 text-center max-w-md mb-6">
              Daftar yoki kitobdagi savolni rasmga oling. JPG, PNG va WEBP formatlari qo'llab-quvvatlanadi.
            </p>

            {/* Main Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 w-full max-w-md">
              {/* Large Image Upload Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 min-w-[150px] inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-base shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/35 transition transform active:scale-98 cursor-pointer"
              >
                <ImageIcon className="w-5 h-5" />
                <span>🖼️ Rasm yuklash</span>
              </button>

              {/* Large Camera Button */}
              <button
                type="button"
                onClick={onOpenCamera}
                className="flex-1 min-w-[150px] inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-semibold text-base shadow-lg shadow-slate-900/15 transition transform active:scale-98 cursor-pointer"
              >
                <Camera className="w-5 h-5 text-indigo-400" />
                <span>📷 Kamera</span>
              </button>
            </div>

            {/* Quick Sample Trigger */}
            <div className="mt-7 pt-5 border-t border-slate-200 dark:border-slate-800 w-full flex items-center justify-center">
              <button
                type="button"
                onClick={() => setShowSamples(!showSamples)}
                className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition px-3 py-1.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/40"
              >
                <BookOpen className="w-4 h-4" />
                <span>Tayyor namunaviy savollar bilan sinab ko'rish</span>
              </button>
            </div>
          </div>
        ) : (
          /* Image Preview State */
          <div className="flex flex-col gap-4">
            <div className="relative group bg-slate-950 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 max-h-[460px] flex items-center justify-center">
              <img
                src={image}
                alt="Yuklangan rasm"
                className="w-full h-auto max-h-[460px] object-contain transition duration-200"
              />

              {/* Top Controls Overlay */}
              <div className="absolute top-3 right-3 flex items-center gap-2 bg-slate-900/80 backdrop-blur-md p-1.5 rounded-xl border border-slate-700/60 shadow-lg">
                <button
                  type="button"
                  onClick={handleRotate}
                  className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition"
                  title="90° aylantirish"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition"
                  title="Boshqa rasm tanlash"
                >
                  <ImageIcon className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={onClear}
                  className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-950/50 rounded-lg transition"
                  title="O'chirish"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Bottom Badge */}
              <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/60 text-xs font-medium text-slate-200 shadow-md">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Rasm tayyor</span>
              </div>
            </div>

            {/* Optional Student Prompt / Note */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <FileQuestion className="w-3.5 h-3.5 text-indigo-500" />
                Qo'shimcha iltimos yoki savol (ixtiyoriy):
              </label>
              <input
                type="text"
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                placeholder="Masalan: 'Faqat 2-masalani yeching' yoki 'Qisqaroq usulda tushuntiring'..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClear}
                  disabled={isLoading}
                  className="inline-flex items-center gap-2 px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-sm transition"
                >
                  <Trash2 className="w-4 h-4 text-slate-400" />
                  <span>🗑️ Tozalash</span>
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading}
                  className="inline-flex items-center gap-2 px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-sm transition"
                >
                  <ImageIcon className="w-4 h-4 text-slate-400" />
                  <span>Boshqa rasm</span>
                </button>
              </div>

              {/* Big Solve Button */}
              <button
                type="button"
                onClick={onSolve}
                disabled={isLoading}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-base shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/40 transition transform active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
                <span>✨ Savolni yechish</span>
              </button>
            </div>
          </div>
        )}

        {/* Sample Problems Accordion / Grid */}
        {showSamples && !image && (
          <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-3.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Namunaviy vazifalardan birini tanlang:
              </h4>
              <button
                onClick={() => setShowSamples(false)}
                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                Yopish
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {SAMPLE_PROBLEMS.map((sample) => (
                <div
                  key={sample.id}
                  onClick={() => handleSelectSample(sample)}
                  className="group p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 hover:border-indigo-500 dark:hover:border-indigo-500 hover:shadow-md transition cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                        {sample.subject}
                      </span>
                      <span className="text-[11px] text-slate-400">{sample.badge}</span>
                    </div>
                    <h5 className="text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition mb-1">
                      {sample.title}
                    </h5>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                      {sample.description}
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-700/50 flex items-center justify-between text-[11px] font-medium text-indigo-600 dark:text-indigo-400">
                    <span>Sinab ko'rish</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
