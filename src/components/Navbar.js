"use client"

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { FaHome, FaInfoCircle, FaStar, FaBalanceScale } from "react-icons/fa";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (path) => pathname === path;

  const navLinks = [
    { href: "/", label: "Home", icon: <FaHome className="mb-0.5" /> },
    { href: "/compare", label: "Compare", icon: <FaBalanceScale className="mb-0.5" /> },
    { href: "/favorites", label: "Favorites", icon: <FaStar className="mb-0.5" /> },
    { href: "/about", label: "About", icon: <FaInfoCircle className="mb-0.5" /> },
  ];

  return (
    <>
      <nav className="fixed top-3 left-1/2 transform -translate-x-1/2 w-[95%] max-w-5xl z-50 bg-white/70 dark:bg-gray-950/70 border border-white/40 dark:border-white/5 backdrop-blur-xl rounded-2xl px-6 py-3 flex items-center justify-between shadow-lg shadow-black/5 transition-all duration-300">
        <div className="flex items-center">
          <Link href="/" className="flex items-center gap-2 group">
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
          {navLinks.map((link) => {
            const active = isActive(link.href);
            return (
              <Link 
                key={link.href}
                href={link.href} 
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-sm font-bold tracking-wide transition-all duration-200 ${
                  active 
                    ? 'bg-red-500 text-white shadow-md shadow-red-500/20' 
                    : 'text-gray-700 dark:text-gray-200 hover:bg-black/5 dark:hover:bg-white/5 hover:text-red-500 dark:hover:text-red-400'
                }`}
              >
                {link.icon} {link.label}
              </Link>
            );
          })}
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

        {/* Mobile Navigation Drawer */}
        {isOpen && (
          <div
            id="mobile-nav"
            className="absolute top-16 left-0 w-full bg-white/95 dark:bg-gray-950/95 border border-gray-100 dark:border-white/5 flex flex-col items-center p-3 md:hidden z-50 rounded-2xl shadow-xl backdrop-blur-xl transition-all duration-300 ease-in-out animate-slide-down"
          >
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <Link 
                  key={link.href}
                  href={link.href} 
                  className={`flex items-center gap-1.5 py-2.5 w-full text-center font-bold text-sm justify-center rounded-xl transition-all duration-200 my-0.5 ${
                    active 
                      ? 'bg-red-500 text-white shadow-md' 
                      : 'text-gray-700 dark:text-gray-200 hover:bg-black/5 dark:hover:bg-white/5 hover:text-red-500'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {link.icon} {link.label}
                </Link>
              );
            })}
          </div>
        )}
      </nav>
      {/* Spacer to push content below the floating navbar */}
      <div className="h-20" />
    </>
  );
}
