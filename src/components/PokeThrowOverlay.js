"use client";

export default function PokeThrowOverlay({ show }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      <div className="absolute inset-0 bg-black/20" />
      <div className="absolute bottom-8 left-8">
        <svg
          width="72"
          height="72"
          viewBox="0 0 64 64"
          xmlns="http://www.w3.org/2000/svg"
          className="animate-pokeball-throw drop-shadow-xl"
          aria-hidden="true"
        >
          <defs>
            <clipPath id="throw-clip">
              <circle cx="32" cy="32" r="30" />
            </clipPath>
          </defs>
          <circle cx="32" cy="32" r="30" fill="#ffffff" stroke="#111111" strokeWidth="4" />
          <g clipPath="url(#throw-clip)">
            <rect x="0" y="0" width="64" height="32" fill="#ef4444" />
            <rect x="-2" y="30" width="68" height="6" fill="#111111" />
          </g>
          <circle cx="32" cy="32" r="10" fill="#ffffff" stroke="#111111" strokeWidth="4" />
          <circle cx="32" cy="32" r="4" fill="#ffffff" stroke="#111111" strokeWidth="2" />
        </svg>
      </div>
    </div>
  );
}

