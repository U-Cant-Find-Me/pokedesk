"use client";

export default function PokeLoader({ size = 64, label = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3" role="status" aria-live="polite">
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        xmlns="http://www.w3.org/2000/svg"
        className="animate-spin"
        style={{ animationDuration: "1s" }}
        aria-hidden="true"
      >
        <defs>
          <clipPath id="pokeball-clip">
            <circle cx="32" cy="32" r="30" />
          </clipPath>
        </defs>
        {/* Base white ball */}
        <circle cx="32" cy="32" r="30" fill="#ffffff" stroke="#111111" strokeWidth="4" />
        {/* Red top half */}
        <g clipPath="url(#pokeball-clip)">
          <rect x="0" y="0" width="64" height="32" fill="#ef4444" />
          {/* Middle black band */}
          <rect x="-2" y="30" width="68" height="6" fill="#111111" />
        </g>
        {/* Center button */}
        <circle cx="32" cy="32" r="10" fill="#ffffff" stroke="#111111" strokeWidth="4" />
        <circle cx="32" cy="32" r="4" fill="#ffffff" stroke="#111111" strokeWidth="2" />
      </svg>
      {label ? (
        <span className="text-gray-700 dark:text-gray-200 font-medium">{label}</span>
      ) : null}
    </div>
  );
}

