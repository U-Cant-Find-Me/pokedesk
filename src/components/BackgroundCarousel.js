"use client";

import React from "react";

export default function BackgroundCarousel() {
  return (
    <div className="fixed inset-0 -z-10 w-full h-full overflow-hidden bg-slate-50 dark:bg-gray-950 transition-colors duration-500">
      {/* Animated glowing mesh gradient blobs */}
      <div className="absolute inset-0 overflow-hidden opacity-40 dark:opacity-20 pointer-events-none">
        {/* Blob 1 - Red (Pokeball theme) */}
        <div 
          className="absolute w-[500px] h-[500px] rounded-full bg-red-400 dark:bg-red-600/50 blur-[120px] animate-blob"
          style={{
            top: '-10%',
            left: '10%',
            animationDuration: '25s',
          }}
        />
        {/* Blob 2 - Blue */}
        <div 
          className="absolute w-[600px] h-[600px] rounded-full bg-blue-400 dark:bg-blue-600/40 blur-[150px] animate-blob"
          style={{
            bottom: '10%',
            right: '10%',
            animationDuration: '30s',
            animationDelay: '2s',
          }}
        />
        {/* Blob 3 - Yellow */}
        <div 
          className="absolute w-[400px] h-[400px] rounded-full bg-yellow-300 dark:bg-yellow-500/30 blur-[100px] animate-blob"
          style={{
            top: '40%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            animationDuration: '20s',
            animationDelay: '5s',
          }}
        />
        {/* Blob 4 - Purple */}
        <div 
          className="absolute w-[500px] h-[500px] rounded-full bg-purple-400 dark:bg-purple-600/30 blur-[130px] animate-blob"
          style={{
            bottom: '-10%',
            left: '-10%',
            animationDuration: '28s',
            animationDelay: '1s',
          }}
        />
      </div>

      {/* Subtle overlay grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none" />

      {/* Radial soft vignetting vignette overlay */}
      <div className="absolute inset-0 bg-radial-[circle_at_center,transparent_20%,rgba(255,255,255,0.2)_100%] dark:bg-radial-[circle_at_center,transparent_20%,rgba(3,7,18,0.4)_100%] pointer-events-none" />
      
      {/* Blurred glass container overlay */}
      <div className="absolute inset-0 bg-white/40 dark:bg-gray-950/40 backdrop-blur-[1px] pointer-events-none" />
    </div>
  );
}
