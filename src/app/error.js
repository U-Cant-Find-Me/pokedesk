"use client";

import { useEffect } from "react";

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    console.error("Global app error:", error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="max-w-md w-full text-center bg-white/70 backdrop-blur-md rounded-xl shadow p-6">
            <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
            <p className="text-gray-700 mb-4">An unexpected error occurred. You can try again.</p>
            <button
              onClick={() => reset()}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}

