"use client";

import { useEffect, useRef, useState } from 'react';

export default function PokemonSearch({ onSearch }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [allNames, setAllNames] = useState([]);
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const ensureNamesLoaded = async () => {
    if (allNames.length > 0) return;
    try {
      const cached = typeof window !== 'undefined' ? sessionStorage.getItem('pokemonNameListV1') : null;
      if (cached) {
        setAllNames(JSON.parse(cached));
        return;
      }
      const res = await fetch(`/api/pokemon?limit=2000&offset=0`);
      if (!res.ok) throw new Error('Failed to load names');
      const data = await res.json();
      const names = (data.results || []).map((r) => r.name).sort();
      setAllNames(names);
      try { sessionStorage.setItem('pokemonNameListV1', JSON.stringify(names)); } catch {}
    } catch (e) {
      // non-fatal; just skip suggestions
    }
  };

  const filtered = (() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return [];
    const starts = allNames.filter((n) => n.startsWith(q));
    const contains = allNames.filter((n) => !n.startsWith(q) && n.includes(q));
    return [...starts, ...contains].slice(0, 10);
  })();

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
            onFocus={() => { ensureNamesLoaded(); setOpen(true); }}
            onKeyDown={onKeyDown}
            placeholder="Search by name or ID (e.g., 'Pikachu' or '25')"
            aria-label="Search Pokémon by name or ID"
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-white placeholder-gray-500 font-medium"
            disabled={isLoading}
            autoComplete="off"
          />
          {isLoading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-500"></div>
            </div>
          )}
          {open && filtered.length > 0 && (
            <ul role="listbox" className="absolute z-50 mt-1 w-full max-h-64 overflow-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow">
              {filtered.map((name, idx) => (
                <li
                  key={name}
                  role="option"
                  aria-selected={highlight === idx}
                  className={`px-3 py-2 cursor-pointer capitalize ${highlight === idx ? 'bg-red-100 dark:bg-gray-700' : 'hover:bg-gray-100 dark:hover:bg-gray-800'} text-gray-900 dark:text-gray-100 border-b border-white/30 last:border-b-0`}
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
          className="px-6 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
          disabled={isLoading || !searchTerm.trim()}
        >
          Search
        </button>
      </form>
      {error && <p className="text-red-600 font-semibold mt-2">{error}</p>}
    </div>
  );
}