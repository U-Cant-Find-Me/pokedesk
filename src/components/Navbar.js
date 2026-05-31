"use client"

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { FaHome, FaInfoCircle, FaStar, FaBalanceScale, FaGamepad } from "react-icons/fa";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false); // Mobile drawer
  const [isGamesDropdownOpen, setIsGamesDropdownOpen] = useState(false); // Desktop games dropdown
  const [isMobileGamesOpen, setIsMobileGamesOpen] = useState(false); // Mobile games submenu
  const pathname = usePathname();

  const isActive = (path) => pathname === path;
  const isGamesActive = () => pathname === "/pokedoku" || pathname === "/quiz";

  return (
    <>
      <nav className="fixed top-0 left-0 w-full z-50 bg-white/70 dark:bg-gray-950/70 border-b border-black/5 dark:border-white/5 backdrop-blur-xl px-6 py-4 shadow-sm transition-all duration-300">
        <div className="w-full max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2 group cursor-pointer">
              <div className="relative w-9 h-9 transition-transform duration-300 group-hover:rotate-12">
                <Image src="/logo.png" alt="Pokédex Logo" width={36} height={36} className="object-contain" priority />
              </div>
              <span className="text-xl font-black tracking-tight text-red-500 group-hover:text-red-600 transition-colors">
                Pokédex
              </span>
            </Link>
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex space-x-1.5 items-center">
            <Link
              href="/"
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-sm font-bold tracking-wide transition-all duration-200 cursor-pointer ${isActive("/")
                  ? 'bg-red-500 text-white shadow-md shadow-red-500/20 font-black'
                  : 'text-gray-700 dark:text-gray-200 hover:bg-black/5 dark:hover:bg-white/5 hover:text-red-500 dark:hover:text-red-400'
                }`}
            >
              <FaHome className="mb-0.5" /> Home
            </Link>

            {/* Desktop PokeGames Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setIsGamesDropdownOpen(true)}
              onMouseLeave={() => setIsGamesDropdownOpen(false)}
            >
              <button
                onClick={() => setIsGamesDropdownOpen(!isGamesDropdownOpen)}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-sm font-bold tracking-wide transition-all duration-200 cursor-pointer focus:outline-none ${isGamesActive()
                    ? 'bg-red-500 text-white shadow-md shadow-red-500/20 font-black'
                    : 'text-gray-700 dark:text-gray-200 hover:bg-black/5 dark:hover:bg-white/5 hover:text-red-500 dark:hover:text-red-400'
                  }`}
              >
                <FaGamepad className="mb-0.5" /> PokeGames
                <span className={`text-[9px] ml-0.5 transition-transform duration-200 ${isGamesDropdownOpen ? 'rotate-180' : ''}`}>▼</span>
              </button>

              {/* Dropdown Menu Card */}
              {isGamesDropdownOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 z-50">
                  <div className="w-72 bg-white/95 dark:bg-gray-900/95 border border-black/5 dark:border-white/10 rounded-2xl p-3 shadow-2xl backdrop-blur-xl animate-fade-in divide-y divide-black/5 dark:divide-white/5">
                    <Link
                      href="/pokedoku"
                      onClick={() => setIsGamesDropdownOpen(false)}
                      className={`flex items-start gap-3 p-3 rounded-xl transition-all duration-200 group cursor-pointer hover:bg-red-500/10 dark:hover:bg-red-500/20 ${isActive("/pokedoku") ? 'bg-red-500/5' : ''
                        }`}
                    >
                      <div className="text-xl mt-1 w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center group-hover:scale-110 transition-transform select-none">
                        🧩
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-gray-900 dark:text-white group-hover:text-red-500 transition-colors">
                          PokéGrid Arena
                        </h4>
                        <p className="text-[9px] font-bold text-gray-400 dark:text-gray-500 mt-0.5 leading-relaxed">
                          Solve 3x3 category grid puzzles using daily or unlimited modes.
                        </p>
                      </div>
                    </Link>

                    <Link
                      href="/quiz"
                      onClick={() => setIsGamesDropdownOpen(false)}
                      className={`flex items-start gap-3 p-3 rounded-xl transition-all duration-200 group cursor-pointer hover:bg-red-500/10 dark:hover:bg-red-500/20 ${
                        isActive("/quiz") ? 'bg-red-500/5' : ''
                      }`}
                    >
                      <div className="text-xl mt-1 w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center group-hover:scale-110 transition-transform select-none">
                        ⚡
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-gray-900 dark:text-white group-hover:text-red-500 transition-colors">
                          Fastest Finger Blitz
                        </h4>
                        <p className="text-[9px] font-bold text-gray-400 dark:text-gray-500 mt-0.5 leading-relaxed">
                          Rapid-fire silhouette identification trivia game.
                        </p>
                      </div>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <Link
              href="/compare"
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-sm font-bold tracking-wide transition-all duration-200 cursor-pointer ${isActive("/compare")
                  ? 'bg-red-500 text-white shadow-md shadow-red-500/20 font-black'
                  : 'text-gray-700 dark:text-gray-200 hover:bg-black/5 dark:hover:bg-white/5 hover:text-red-500 dark:hover:text-red-400'
                }`}
            >
              <FaBalanceScale className="mb-0.5" /> Compare
            </Link>

            <Link
              href="/favorites"
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-sm font-bold tracking-wide transition-all duration-200 cursor-pointer ${isActive("/favorites")
                  ? 'bg-red-500 text-white shadow-md shadow-red-500/20 font-black'
                  : 'text-gray-700 dark:text-gray-200 hover:bg-black/5 dark:hover:bg-white/5 hover:text-red-500 dark:hover:text-red-400'
                }`}
            >
              <FaStar className="mb-0.5" /> Favorites
            </Link>

            <Link
              href="/about"
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-sm font-bold tracking-wide transition-all duration-200 cursor-pointer ${isActive("/about")
                  ? 'bg-red-500 text-white shadow-md shadow-red-500/20 font-black'
                  : 'text-gray-700 dark:text-gray-200 hover:bg-black/5 dark:hover:bg-white/5 hover:text-red-500 dark:hover:text-red-400'
                }`}
            >
              <FaInfoCircle className="mb-0.5" /> About
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 dark:text-gray-200 focus:outline-none relative w-8 h-8 flex items-center justify-center rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-all"
              aria-label="Toggle navigation menu"
              aria-expanded={isOpen}
              aria-controls="mobile-nav"
            >
              <span className={`block absolute w-5 h-0.5 bg-current transition-all duration-300 ease-in-out transform ${isOpen ? 'rotate-45' : '-translate-y-1.5'}`}></span>
              <span className={`block absolute w-5 h-0.5 bg-current transition-all duration-300 ease-in-out ${isOpen ? 'opacity-0' : ''}`}></span>
              <span className={`block absolute w-5 h-0.5 bg-current transition-all duration-300 ease-in-out transform ${isOpen ? '-rotate-45' : 'translate-y-1.5'}`}></span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isOpen && (
          <div
            id="mobile-nav"
            className="absolute top-full left-0 w-full bg-white/95 dark:bg-gray-950/95 border-b border-gray-100 dark:border-white/5 flex flex-col items-center p-3 md:hidden z-50 shadow-xl backdrop-blur-xl transition-all duration-300 ease-in-out animate-slide-down"
          >
            <Link
              href="/"
              className={`flex items-center gap-1.5 py-2.5 w-full text-center font-bold text-sm justify-center rounded-xl transition-all duration-200 my-0.5 ${isActive("/")
                  ? 'bg-red-500 text-white shadow-md'
                  : 'text-gray-700 dark:text-gray-200 hover:bg-black/5 dark:hover:bg-white/5 hover:text-red-500'
                }`}
              onClick={() => setIsOpen(false)}
            >
              <FaHome className="mb-0.5" /> Home
            </Link>

            {/* Mobile PokeGames Expandable */}
            <div className="w-full flex flex-col items-center">
              <button
                onClick={() => setIsMobileGamesOpen(!isMobileGamesOpen)}
                className={`flex items-center gap-1.5 py-2.5 w-full text-center font-bold text-sm justify-center rounded-xl transition-all duration-200 my-0.5 cursor-pointer focus:outline-none ${isGamesActive()
                    ? 'bg-red-500 text-white shadow-md'
                    : 'text-gray-700 dark:text-gray-200 hover:bg-black/5 dark:hover:bg-white/5 hover:text-red-500'
                  }`}
              >
                <FaGamepad className="mb-0.5" /> PokeGames
                <span className={`text-[9px] ml-0.5 transition-transform duration-200 ${isMobileGamesOpen ? 'rotate-180' : ''}`}>▼</span>
              </button>

              {/* Mobile Games Sub-Items */}
              {isMobileGamesOpen && (
                <div className="w-full pl-4 py-1 flex flex-col gap-1 border-l-2 border-black/5 dark:border-white/5 animate-slide-down">
                  <Link
                    href="/pokedoku"
                    className={`flex items-center gap-2 py-2 px-4 rounded-xl font-bold text-xs justify-start transition-all duration-200 cursor-pointer ${isActive("/pokedoku")
                        ? 'bg-red-500/10 text-red-500 dark:bg-red-500/20'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5 hover:text-red-500'
                      }`}
                    onClick={() => {
                      setIsOpen(false);
                      setIsMobileGamesOpen(false);
                    }}
                  >
                    🧩 PokéGrid Arena
                  </Link>
                  <Link
                    href="/quiz"
                    className={`flex items-center gap-2 py-2 px-4 rounded-xl font-bold text-xs justify-start transition-all duration-200 cursor-pointer ${isActive("/quiz")
                        ? 'bg-red-500/10 text-red-500 dark:bg-red-500/20'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5 hover:text-red-500'
                      }`}
                    onClick={() => {
                      setIsOpen(false);
                      setIsMobileGamesOpen(false);
                    }}
                  >
                    ⚡ Fastest Finger Blitz
                  </Link>
                </div>
              )}
            </div>

            <Link
              href="/compare"
              className={`flex items-center gap-1.5 py-2.5 w-full text-center font-bold text-sm justify-center rounded-xl transition-all duration-200 my-0.5 ${isActive("/compare")
                  ? 'bg-red-500 text-white shadow-md'
                  : 'text-gray-700 dark:text-gray-200 hover:bg-black/5 dark:hover:bg-white/5 hover:text-red-500'
                }`}
              onClick={() => setIsOpen(false)}
            >
              <FaBalanceScale className="mb-0.5" /> Compare
            </Link>

            <Link
              href="/favorites"
              className={`flex items-center gap-1.5 py-2.5 w-full text-center font-bold text-sm justify-center rounded-xl transition-all duration-200 my-0.5 ${isActive("/favorites")
                  ? 'bg-red-500 text-white shadow-md'
                  : 'text-gray-700 dark:text-gray-200 hover:bg-black/5 dark:hover:bg-white/5 hover:text-red-500'
                }`}
              onClick={() => setIsOpen(false)}
            >
              <FaStar className="mb-0.5" /> Favorites
            </Link>

            <Link
              href="/about"
              className={`flex items-center gap-1.5 py-2.5 w-full text-center font-bold text-sm justify-center rounded-xl transition-all duration-200 my-0.5 ${isActive("/about")
                  ? 'bg-red-500 text-white shadow-md'
                  : 'text-gray-700 dark:text-gray-200 hover:bg-black/5 dark:hover:bg-white/5 hover:text-red-500'
                }`}
              onClick={() => setIsOpen(false)}
            >
              <FaInfoCircle className="mb-0.5" /> About
            </Link>
          </div>
        )}
      </nav>
      {/* Spacer to push content below the navbar */}
      <div className="h-20" />
    </>
  );
}
