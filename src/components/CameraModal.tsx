import React, { useRef, useState, useEffect } from 'react';
import { Camera, RefreshCw, X, Check, AlertCircle, SwitchCamera } from 'lucide-react';

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (base64Image: string) => void;
}

export const CameraModal: React.FC<CameraModalProps> = ({
  isOpen,
  onClose,
  onCapture,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileFallbackRef = useRef<HTMLInputElement>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isFlashActive, setIsFlashActive] = useState(false);

  // Start camera stream when modal opens
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setCapturedImage(null);
      setCameraError(null);
      return;
    }

    startCamera();

    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode]);

  const startCamera = async () => {
    stopCamera();
    setCameraError(null);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Kamera ushbu qurilma yoki brauzerda qo'llab-quvvatlanmaydi.");
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      console.warn("Camera access failed:", err);
      let message = "Kamerani yoqishda xatolik yuz berdi.";
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        message = "Kameraga ruxsat berilmadi. Iltimos, brauzer sozlamalarida kameraga ruxsat bering.";
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        message = "Qurilmada kamera topilmadi.";
      }
      setCameraError(message);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const takePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    // Visual shutter flash effect
    setIsFlashActive(true);
    setTimeout(() => setIsFlashActive(false), 200);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // If front camera, un-mirror if needed or draw as is
    ctx.drawImage(video, 0, 0, width, height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    setCapturedImage(dataUrl);
    stopCamera();
  };

  const confirmPhoto = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      onClose();
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    startCamera();
  };

  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  const handleNativeCameraFallback = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          onCapture(reader.result);
          onClose();
        }
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4">
      {/* Hidden canvas for snapshotting */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Hidden file input for native camera fallback */}
      <input
        ref={fileFallbackRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleNativeCameraFallback}
        className="hidden"
      />

      <div className="relative flex flex-col w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900/90 z-10">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">📷 Kamera orqali olish</h3>
              <p className="text-xs text-slate-400">Savol yoki masalani kadrga aniq joylashtiring</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            aria-label="Yopish"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewfinder / Preview Area */}
        <div className="relative aspect-[4/3] sm:aspect-[16/10] bg-black flex items-center justify-center overflow-hidden">
          {isFlashActive && (
            <div className="absolute inset-0 bg-white z-30 transition-opacity duration-200" />
          )}

          {capturedImage ? (
            <img
              src={capturedImage}
              alt="Olingan rasm"
              className="w-full h-full object-contain"
            />
          ) : cameraError ? (
            <div className="flex flex-col items-center justify-center p-6 text-center text-slate-300 max-w-md">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-3">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h4 className="text-base font-semibold text-white mb-1">Kameraga ulanib bo'lmadi</h4>
              <p className="text-xs text-slate-400 mb-4">{cameraError}</p>
              <button
                onClick={() => fileFallbackRef.current?.click()}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition shadow-lg shadow-indigo-600/30"
              >
                <Camera className="w-4 h-4" />
                Qurilma kamerasidan olish
              </button>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              {/* Target Aim Guides */}
              <div className="absolute inset-8 sm:inset-12 pointer-events-none border-2 border-dashed border-indigo-400/60 rounded-2xl">
                <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-indigo-400 rounded-tl-lg" />
                <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-indigo-400 rounded-tr-lg" />
                <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-indigo-400 rounded-bl-lg" />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-indigo-400 rounded-br-lg" />
                <div className="absolute top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-[11px] font-medium text-indigo-200">
                  Savolni ushbu ramka ichiga oling
                </div>
              </div>
            </>
          )}
        </div>

        {/* Modal Controls Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 border-t border-slate-800">
          {capturedImage ? (
            <>
              <button
                onClick={retakePhoto}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium transition"
              >
                <RefreshCw className="w-4 h-4" />
                Qayta olish
              </button>
              <button
                onClick={confirmPhoto}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white text-sm font-semibold shadow-lg shadow-indigo-600/30 transition transform active:scale-95"
              >
                <Check className="w-4 h-4" />
                Rasmni tanlash
              </button>
            </>
          ) : (
            <>
              <button
                onClick={toggleFacingMode}
                className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                title="Kamerani almashtirish (old/orqa)"
              >
                <SwitchCamera className="w-5 h-5" />
              </button>

              {/* Big Shutter Button */}
              <button
                onClick={takePhoto}
                disabled={!!cameraError}
                className="group relative flex items-center justify-center w-16 h-16 rounded-full bg-white p-1 transition transform active:scale-90 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-indigo-500/20"
                aria-label="Suratga olish"
              >
                <div className="w-full h-full rounded-full border-4 border-slate-900 group-hover:bg-indigo-50 transition flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-indigo-600 group-hover:scale-95 transition" />
                </div>
              </button>

              <button
                onClick={() => fileFallbackRef.current?.click()}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium px-3 py-2 rounded-lg hover:bg-slate-800/80 transition"
              >
                Fayldan ochish
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
