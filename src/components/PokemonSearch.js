"use client";

import { useEffect, useRef, useState, useMemo } from 'react';
import pokemonDataset from '../data/pokemon-dataset.json';

export default function PokemonSearch({ onSearch }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Load all sorted Pokémon names instantly from the offline dataset
  const allNames = useMemo(() => {
    return (pokemonDataset || []).map((p) => p.name).sort();
  }, []);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return [];
    const starts = allNames.filter((n) => n.startsWith(q));
    const contains = allNames.filter((n) => !n.startsWith(q) && n.includes(q));
    return [...starts, ...contains].slice(0, 10);
  }, [searchTerm, allNames]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    try {
      setIsLoading(true);
      setError(null);
      const query = searchTerm.toLowerCase().trim();
      onSearch(query);
      setOpen(false);
      setHighlight(-1);
    } catch (err) {
      setError('An error occurred while searching');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const onKeyDown = (e) => {
    if (!open || filtered.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlight((h) => (h + 1) % filtered.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlight((h) => (h - 1 + filtered.length) % filtered.length);
    } else if (e.key === 'Enter') {
      if (highlight >= 0 && highlight < filtered.length) {
        e.preventDefault();
        const pick = filtered[highlight];
        setSearchTerm(pick);
        onSearch(pick);
        setOpen(false);
        setHighlight(-1);
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
      setHighlight(-1);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto mb-8" ref={containerRef}>
      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-2">
        <div className="flex-grow relative">
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setOpen(true); }}
            onFocus={() => { setOpen(true); }}
            onKeyDown={onKeyDown}
            placeholder="Search by name or ID (e.g., 'Pikachu' or '25')"
            aria-label="Search Pokémon by name or ID"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent font-medium shadow-sm transition-all duration-200"
            disabled={isLoading}
            autoComplete="off"
          />
          {isLoading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-500"></div>
            </div>
          )}
          {open && filtered.length > 0 && (
            <ul 
              role="listbox" 
              className="absolute z-50 mt-1 w-full max-h-64 overflow-auto bg-white/95 dark:bg-gray-900/95 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl backdrop-blur-md"
            >
              {filtered.map((name, idx) => (
                <li
                  key={name}
                  role="option"
                  aria-selected={highlight === idx}
                  className={`px-4 py-2 cursor-pointer capitalize font-medium ${highlight === idx ? 'bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-200'} border-b border-black/5 dark:border-white/5 last:border-b-0`}
                  onMouseEnter={() => setHighlight(idx)}
                  onMouseDown={(e) => { e.preventDefault(); setSearchTerm(name); setOpen(false); onSearch(name); }}
                >
                  {name}
                </li>
              ))}
            </ul>
          )}
        </div>
        <button
          type="submit"
          className="px-6 py-2.5 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 active:scale-98 transition-all duration-200 shadow-md shadow-red-500/10 hover:shadow-red-500/30 disabled:bg-gray-400 disabled:shadow-none disabled:cursor-not-allowed"
          disabled={isLoading || !searchTerm.trim()}
        >
          Search
        </button>
      </form>
      {error && <p className="text-red-600 font-semibold mt-2">{error}</p>}
    </div>
  );
}