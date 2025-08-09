"use client"

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import ProfileCard from "./ProfileCard";
import { FaHome, FaInfoCircle, FaStar, FaBalanceScale } from "react-icons/fa";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  // Example props, replace with dynamic data as needed
  const profileProps = {
    name: "Bonnie Green",
    role: "Visual Designer",
    image: "/docs/images/people/profile-picture-3.jpg",
    onEdit: () => alert("Edit clicked"),
    onExport: () => alert("Export Data clicked"),
    onDelete: () => alert("Delete clicked"),
    onAddFriend: () => alert("Add friend clicked"),
    onMessage: () => alert("Message clicked"),
  };

  return (
    <>
      <nav className="bg-white/90 backdrop-blur border-b border-gray-200 px-4 py-3 flex items-center justify-between dark:bg-gray-900/90 dark:border-gray-700 sticky top-0 z-50">
        <div className="flex items-center">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="Pokédex Logo" width={40} height={40} className="h-10 w-10 object-contain" priority />
            <span className="text-2xl font-bold text-red-500">Pokédex</span>
          </Link>
        </div>
        <div className="hidden md:flex space-x-6 items-center">
          <Link href="/" className="flex items-center gap-1 text-gray-800 hover:text-red-500 font-semibold dark:text-gray-100 dark:hover:text-red-400">
            <FaHome className="inline-block mb-0.5" /> Home
          </Link>
          <Link href="/compare" className="flex items-center gap-1 text-gray-800 hover:text-red-500 font-semibold dark:text-gray-100 dark:hover:text-red-400">
            <FaBalanceScale className="inline-block mb-0.5" /> Compare
          </Link>
          <Link href="/favorites" className="flex items-center gap-1 text-gray-800 hover:text-red-500 font-semibold dark:text-gray-100 dark:hover:text-red-400">
            <FaStar className="inline-block mb-0.5" /> Favorites
          </Link>
          <Link href="/about" className="flex items-center gap-1 text-gray-800 hover:text-red-500 font-semibold dark:text-gray-100 dark:hover:text-red-400">
            <FaInfoCircle className="inline-block mb-0.5" /> About
          </Link>
          
        </div>
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-gray-700 dark:text-gray-200 focus:outline-none relative w-6 h-6"
            aria-label="Toggle navigation menu"
            aria-expanded={isOpen}
            aria-controls="mobile-nav"
          >
            <span className={`block absolute left-1/2 top-1/2 w-5 h-0.5 bg-current transition-all duration-300 ease-in-out transform -translate-x-1/2 ${isOpen ? '-rotate-45' : '-translate-y-1.5'}`}></span>
            <span className={`block absolute left-1/2 top-1/2 w-5 h-0.5 bg-current transition-all duration-300 ease-in-out transform -translate-x-1/2 ${isOpen ? 'opacity-0' : ''}`}></span>
            <span className={`block absolute left-1/2 top-1/2 w-5 h-0.5 bg-current transition-all duration-300 ease-in-out transform -translate-x-1/2 ${isOpen ? 'rotate-45' : 'translate-y-1.5'}`}></span>
          </button>
        </div>
        {isOpen && (
          <div
            id="mobile-nav"
            className="absolute top-16 left-0 w-full bg-white border-t border-gray-200 flex flex-col items-center md:hidden z-50 transition-all duration-300 ease-in-out animate-slide-down dark:bg-gray-900 dark:border-gray-700"
          >
            <Link href="/" className="flex items-center gap-1 py-2 w-full text-center text-gray-800 hover:text-red-500 font-semibold dark:text-gray-100 dark:hover:text-red-400 justify-center" onClick={() => setIsOpen(false)}>
              <FaHome className="inline-block mb-0.5" /> Home
            </Link>
            <Link href="/compare" className="flex items-center gap-1 py-2 w-full text-center text-gray-800 hover:text-red-500 font-semibold dark:text-gray-100 dark:hover:text-red-400 justify-center" onClick={() => setIsOpen(false)}>
              <FaBalanceScale className="inline-block mb-0.5" /> Compare
            </Link>
            <Link href="/favorites" className="flex items-center gap-1 py-2 w-full text-center text-gray-800 hover:text-red-500 font-semibold dark:text-gray-100 dark:hover:text-red-400 justify-center" onClick={() => setIsOpen(false)}>
              <FaStar className="inline-block mb-0.5" /> Favorites
            </Link>
            <Link href="/about" className="flex items-center gap-1 py-2 w-full text-center text-gray-800 hover:text-red-500 font-semibold dark:text-gray-100 dark:hover:text-red-400 justify-center" onClick={() => setIsOpen(false)}>
              <FaInfoCircle className="inline-block mb-0.5" /> About
            </Link>
            
          </div>
        )}
      </nav>
      {/* <div className="flex justify-center mt-4">
        <ProfileCard {...profileProps} />
      </div> */}
    </>
  );
}

/* Add Tailwind custom animation in globals.css:
@layer utilities {
  .animate-slide-down {
    @apply opacity-0 -translate-y-4;
    animation: slideDown 0.3s ease-in-out forwards;
  }
}
@keyframes slideDown {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
*/
