"use client";

export default function ChooseYouOverlay({ show, text }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="relative px-6 py-4 rounded-xl bg-white/90 dark:bg-gray-900/90 shadow-2xl border border-white/40 backdrop-blur-md pointer-events-none transform transition-all duration-300 scale-100 opacity-100 animate-pulse"
      >
        <p className="text-2xl md:text-3xl font-extrabold text-red-600 drop-shadow-sm text-center">
          {text}
        </p>
      </div>
    </div>
  );
}

