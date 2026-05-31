"use client";

import React, { useMemo, useRef, useState, useEffect } from "react";
import Image from "next/image";
import ErrorBoundary from "@/components/ErrorBoundary";
import PokeLoader from "@/components/PokeLoader";
import BackgroundCarousel from "@/components/BackgroundCarousel";
import { getPokemon } from "@/services/pokemonService";
import pokemonDataset from "@/data/pokemon-dataset.json";

// Sleek type themes for glassmorphic mini-cards
const TYPE_THEMES = {
  normal: 'from-gray-400/20 to-zinc-500/20 border-zinc-300/40 text-zinc-700 dark:text-zinc-300 shadow-zinc-500/10',
  fire: 'from-orange-500/20 to-red-600/20 border-orange-400/40 text-orange-600 dark:text-orange-400 shadow-orange-500/10',
  water: 'from-blue-500/20 to-indigo-600/20 border-blue-400/40 text-blue-600 dark:text-blue-400 shadow-blue-500/10',
  electric: 'from-yellow-400/20 to-amber-500/20 border-yellow-300/40 text-amber-600 dark:text-amber-400 shadow-yellow-400/10',
  grass: 'from-green-500/20 to-emerald-600/20 border-green-400/40 text-green-600 dark:text-green-400 shadow-green-500/10',
  ice: 'from-cyan-300/20 to-blue-400/20 border-cyan-300/40 text-cyan-600 dark:text-cyan-400 shadow-cyan-400/10',
  fighting: 'from-red-600/20 to-rose-800/20 border-red-500/40 text-red-600 dark:text-red-400 shadow-red-600/10',
  poison: 'from-purple-500/20 to-fuchsia-600/20 border-purple-400/40 text-purple-600 dark:text-purple-400 shadow-purple-500/10',
  ground: 'from-amber-600/20 to-yellow-800/20 border-amber-500/40 text-amber-600 dark:text-amber-400 shadow-amber-600/10',
  flying: 'from-indigo-300/20 to-purple-400/20 border-indigo-300/40 text-indigo-600 dark:text-indigo-400 shadow-indigo-400/10',
  psychic: 'from-pink-500/20 to-rose-600/20 border-pink-400/40 text-pink-600 dark:text-pink-400 shadow-pink-500/10',
  bug: 'from-lime-500/20 to-green-600/20 border-lime-400/40 text-lime-600 dark:text-lime-400 shadow-lime-500/10',
  rock: 'from-yellow-700/20 to-stone-800/20 border-yellow-600/40 text-yellow-700 dark:text-yellow-400 shadow-yellow-700/10',
  ghost: 'from-purple-700/20 to-indigo-900/20 border-purple-600/40 text-purple-600 dark:text-purple-400 shadow-purple-700/10',
  dragon: 'from-indigo-600/20 to-violet-800/20 border-indigo-500/40 text-indigo-600 dark:text-indigo-400 shadow-indigo-600/10',
  dark: 'from-gray-800/30 to-zinc-900/30 border-gray-700/50 text-gray-700 dark:text-gray-300 shadow-gray-900/10',
  steel: 'from-slate-400/20 to-slate-600/20 border-slate-300/40 text-slate-600 dark:text-slate-300 shadow-slate-500/10',
  fairy: 'from-pink-300/20 to-rose-400/20 border-pink-300/40 text-pink-600 dark:text-pink-400 shadow-pink-400/10',
};

function formatStatName(raw) {
  const name = String(raw || "");
  switch (name) {
    case "hp": return "HP";
    case "attack": return "Attack";
    case "defense": return "Defense";
    case "special-attack": return "Sp. Atk";
    case "special-defense": return "Sp. Def";
    case "speed": return "Speed";
    default: return name.replace(/-/g, " ");
  }
}

function PokemonMiniCard({ pokemon }) {
  if (!pokemon) return null;
  const imageUrl =
    pokemon?.sprites?.other?.["official-artwork"]?.front_default ||
    pokemon?.sprites?.front_default ||
    "/eevee.png";
  const types = pokemon?.types?.map((t) => t.type.name) || [];
  const mainType = types[0] || 'normal';
  const glassTheme = TYPE_THEMES[mainType] || TYPE_THEMES.normal;

  return (
    <div className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br ${glassTheme} shadow-xl p-5 backdrop-blur-md transition-all duration-300 animate-fade-in`}>
      <div className="absolute inset-0 bg-linear-[135deg,rgba(255,255,255,0.1)_0%,transparent_60%] pointer-events-none" />
      <div className="flex items-center gap-4 relative z-10">
        <div className="relative w-20 h-20 bg-white/20 dark:bg-black/10 border border-white/30 dark:border-white/10 rounded-full p-1 flex items-center justify-center shadow-inner">
          <Image src={imageUrl} alt={pokemon.name} fill className="object-contain p-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)]" />
        </div>
        <div>
          <div className="text-xs font-bold text-gray-500 dark:text-gray-400 tracking-wider">
            #{String(pokemon.id).padStart(3, "0")}
          </div>
          <div className="text-2xl font-bold capitalize text-gray-900 dark:text-white drop-shadow-sm mt-0.5">
            {pokemon.name}
          </div>
          <div className="flex gap-1.5 mt-2">
            {types.map((t) => (
              <span key={t} className="px-2.5 py-0.5 bg-white/30 dark:bg-black/20 border border-white/25 rounded-full text-xs font-semibold capitalize text-gray-800 dark:text-gray-200">
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
      
      {/* Quick Base Stats Display */}
      <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-black/5 dark:border-white/5 text-center relative z-10">
        {pokemon.stats?.slice(0, 3).map((s) => (
          <div key={s.stat.name}>
            <div className="text-gray-900 dark:text-white text-base font-bold">{s.base_stat}</div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400">
              {formatStatName(s.stat.name)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ComparePage() {
  const [leftQuery, setLeftQuery] = useState("");
  const [rightQuery, setRightQuery] = useState("");
  const [left, setLeft] = useState(null);
  const [right, setRight] = useState(null);
  const [loadingLeft, setLoadingLeft] = useState(false);
  const [loadingRight, setLoadingRight] = useState(false);
  const [errorLeft, setErrorLeft] = useState(null);
  const [errorRight, setErrorRight] = useState(null);
  const [openLeft, setOpenLeft] = useState(false);
  const [openRight, setOpenRight] = useState(false);
  const [hiLeft, setHiLeft] = useState(-1);
  const [hiRight, setHiRight] = useState(-1);
  const leftContainerRef = useRef(null);
  const rightContainerRef = useRef(null);

  // Load all sorted Pokémon names instantly from offline dataset
  const allNames = useMemo(() => {
    return (pokemonDataset || []).map((p) => p.name).sort();
  }, []);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (leftContainerRef.current && !leftContainerRef.current.contains(e.target)) setOpenLeft(false);
      if (rightContainerRef.current && !rightContainerRef.current.contains(e.target)) setOpenRight(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const filteredLeft = useMemo(() => {
    const q = leftQuery.trim().toLowerCase();
    if (!q) return [];
    const starts = allNames.filter((n) => n.startsWith(q));
    const contains = allNames.filter((n) => !n.startsWith(q) && n.includes(q));
    return [...starts, ...contains].slice(0, 10);
  }, [leftQuery, allNames]);

  const filteredRight = useMemo(() => {
    const q = rightQuery.trim().toLowerCase();
    if (!q) return [];
    const starts = allNames.filter((n) => n.startsWith(q));
    const contains = allNames.filter((n) => !n.startsWith(q) && n.includes(q));
    return [...starts, ...contains].slice(0, 10);
  }, [rightQuery, allNames]);

  const searchLeft = async (e) => {
    e?.preventDefault?.();
    if (!leftQuery.trim()) return;
    if (right && right.name.toLowerCase() === leftQuery.trim().toLowerCase()) {
      setErrorLeft("Same Pokémon on both sides is not allowed.");
      return;
    }
    try {
      setLoadingLeft(true);
      setErrorLeft(null);
      const data = await getPokemon(leftQuery);
      if (right && right.name.toLowerCase() === data.name.toLowerCase()) {
        setErrorLeft("Same Pokémon on both sides is not allowed.");
        setLeft(null);
        return;
      }
      setLeft(data);
      setLeftQuery(data.name);
    } catch (e) {
      setErrorLeft("Pokémon not found");
      setLeft(null);
    } finally {
      setLoadingLeft(false);
      setOpenLeft(false);
    }
  };

  const searchRight = async (e) => {
    e?.preventDefault?.();
    if (!rightQuery.trim()) return;
    if (left && left.name.toLowerCase() === rightQuery.trim().toLowerCase()) {
      setErrorRight("Same Pokémon on both sides is not allowed.");
      return;
    }
    try {
      setLoadingRight(true);
      setErrorRight(null);
      const data = await getPokemon(rightQuery);
      if (left && left.name.toLowerCase() === data.name.toLowerCase()) {
        setErrorRight("Same Pokémon on both sides is not allowed.");
        setRight(null);
        return;
      }
      setRight(data);
      setRightQuery(data.name);
    } catch (e) {
      setErrorRight("Pokémon not found");
      setRight(null);
    } finally {
      setLoadingRight(false);
      setOpenRight(false);
    }
  };

  const onKeyDownLeft = (e) => {
    if (!openLeft || filteredLeft.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHiLeft((h) => (h + 1) % filteredLeft.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHiLeft((h) => (h - 1 + filteredLeft.length) % filteredLeft.length);
    } else if (e.key === 'Enter') {
      if (hiLeft >= 0 && hiLeft < filteredLeft.length) {
        e.preventDefault();
        const pick = filteredLeft[hiLeft];
        setLeftQuery(pick);
        setOpenLeft(false);
        setHiLeft(-1);
        // Call search directly with parameter
        setLoadingLeft(true);
        setErrorLeft(null);
        getPokemon(pick).then((data) => {
          setLeft(data);
          setLeftQuery(data.name);
          setLoadingLeft(false);
        }).catch(() => {
          setErrorLeft("Not found");
          setLeft(null);
          setLoadingLeft(false);
        });
      }
    } else if (e.key === 'Escape') {
      setOpenLeft(false);
      setHiLeft(-1);
    }
  };

  const onKeyDownRight = (e) => {
    if (!openRight || filteredRight.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHiRight((h) => (h + 1) % filteredRight.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHiRight((h) => (h - 1 + filteredRight.length) % filteredRight.length);
    } else if (e.key === 'Enter') {
      if (hiRight >= 0 && hiRight < filteredRight.length) {
        e.preventDefault();
        const pick = filteredRight[hiRight];
        setRightQuery(pick);
        setOpenRight(false);
        setHiRight(-1);
        setLoadingRight(true);
        setErrorRight(null);
        getPokemon(pick).then((data) => {
          setRight(data);
          setRightQuery(data.name);
          setLoadingRight(false);
        }).catch(() => {
          setErrorRight("Not found");
          setRight(null);
          setLoadingRight(false);
        });
      }
    } else if (e.key === 'Escape') {
      setOpenRight(false);
      setHiRight(-1);
    }
  };

  // Compare helper to calculate highest value
  const statWinner = (ls, rs) => {
    if (!ls || !rs) return null;
    if (ls.base_stat > rs.base_stat) return "left";
    if (rs.base_stat > ls.base_stat) return "right";
    return "draw";
  };

  const leftBst = left ? left.stats.reduce((sum, s) => sum + s.base_stat, 0) : 0;
  const rightBst = right ? right.stats.reduce((sum, s) => sum + s.base_stat, 0) : 0;

  return (
    <>
      <BackgroundCarousel />
      <div className="container mx-auto px-4 py-8 mt-20 max-w-5xl">
      <h1 className="text-3xl font-extrabold mb-2 text-center text-gray-900 dark:text-white tracking-tight drop-shadow-sm">
        Pokémon Versus Arena
      </h1>
      <p className="text-center text-gray-600 dark:text-gray-400 mb-8 font-medium">
        Enter two Pokémon names to compare their types, stats, and abilities side by side.
      </p>

      {/* Versus Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start relative">
        {/* Absolute VS Badge for larger screens */}
        <div className="hidden md:flex absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-red-500 border-4 border-slate-50 dark:border-gray-950 items-center justify-center z-20 shadow-lg text-white font-extrabold text-lg select-none">
          VS
        </div>

        {/* Left Arena Panel */}
        <div className="flex flex-col gap-3 relative">
          <form onSubmit={searchLeft} className="flex gap-2 relative" ref={leftContainerRef}>
            <input
              value={leftQuery}
              onChange={(e) => { setLeftQuery(e.target.value); setOpenLeft(true); }}
              placeholder="First Pokémon name or ID"
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900 bg-white placeholder-gray-400 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500 font-medium shadow-sm transition-all duration-200"
              onFocus={() => { setOpenLeft(true); }}
              onKeyDown={onKeyDownLeft}
            />
            <button className="px-5 py-2.5 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 shadow-md shadow-red-500/10 active:scale-98 transition-all duration-200">
              Search
            </button>
            {openLeft && filteredLeft.length > 0 && (
              <ul 
                role="listbox" 
                className="absolute z-50 top-12 left-0 w-full max-h-64 overflow-auto bg-white/95 dark:bg-gray-900/95 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl backdrop-blur-md"
              >
                {filteredLeft.map((name, idx) => (
                  <li
                    key={name}
                    role="option"
                    aria-selected={hiLeft === idx}
                    className={`px-4 py-2 cursor-pointer capitalize font-medium ${hiLeft === idx ? 'bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-200'} border-b border-black/5 dark:border-white/5 last:border-b-0`}
                    onMouseEnter={() => setHiLeft(idx)}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setLeftQuery(name);
                      setOpenLeft(false);
                      setLoadingLeft(true);
                      getPokemon(name).then((data) => {
                        setLeft(data);
                        setLeftQuery(data.name);
                        setLoadingLeft(false);
                      }).catch(() => {
                        setErrorLeft("Not found");
                        setLeft(null);
                        setLoadingLeft(false);
                      });
                    }}
                  >
                    {name}
                  </li>
                ))}
              </ul>
            )}
          </form>
          {loadingLeft ? (
            <div className="flex justify-center py-10"><PokeLoader size={48} label="Loading challenger..." /></div>
          ) : errorLeft ? (
            <div className="text-red-500 font-semibold text-center py-4 bg-red-500/10 rounded-xl border border-red-500/20">{errorLeft}</div>
          ) : left ? (
            <ErrorBoundary>
              <PokemonMiniCard pokemon={left} />
            </ErrorBoundary>
          ) : (
            <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-800 rounded-2xl text-gray-500 font-medium">
              Challenger 1 Ready. Enter search name.
            </div>
          )}
        </div>

        {/* Right Arena Panel */}
        <div className="flex flex-col gap-3 relative">
          <form onSubmit={searchRight} className="flex gap-2 relative" ref={rightContainerRef}>
            <input
              value={rightQuery}
              onChange={(e) => { setRightQuery(e.target.value); setOpenRight(true); }}
              placeholder="Second Pokémon name or ID"
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900 bg-white placeholder-gray-400 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500 font-medium shadow-sm transition-all duration-200"
              onFocus={() => { setOpenRight(true); }}
              onKeyDown={onKeyDownRight}
            />
            <button className="px-5 py-2.5 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 shadow-md shadow-red-500/10 active:scale-98 transition-all duration-200">
              Search
            </button>
            {openRight && filteredRight.length > 0 && (
              <ul 
                role="listbox" 
                className="absolute z-50 top-12 left-0 w-full max-h-64 overflow-auto bg-white/95 dark:bg-gray-900/95 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl backdrop-blur-md"
              >
                {filteredRight.map((name, idx) => (
                  <li
                    key={name}
                    role="option"
                    aria-selected={hiRight === idx}
                    className={`px-4 py-2 cursor-pointer capitalize font-medium ${hiRight === idx ? 'bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-200'} border-b border-black/5 dark:border-white/5 last:border-b-0`}
                    onMouseEnter={() => setHiRight(idx)}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setRightQuery(name);
                      setOpenRight(false);
                      setLoadingRight(true);
                      getPokemon(name).then((data) => {
                        setRight(data);
                        setRightQuery(data.name);
                        setLoadingRight(false);
                      }).catch(() => {
                        setErrorRight("Not found");
                        setRight(null);
                        setLoadingRight(false);
                      });
                    }}
                  >
                    {name}
                  </li>
                ))}
              </ul>
            )}
          </form>
          {loadingRight ? (
            <div className="flex justify-center py-10"><PokeLoader size={48} label="Loading challenger..." /></div>
          ) : errorRight ? (
            <div className="text-red-500 font-semibold text-center py-4 bg-red-500/10 rounded-xl border border-red-500/20">{errorRight}</div>
          ) : right ? (
            <ErrorBoundary>
              <PokemonMiniCard pokemon={right} />
            </ErrorBoundary>
          ) : (
            <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-800 rounded-2xl text-gray-500 font-medium">
              Challenger 2 Ready. Enter search name.
            </div>
          )}
        </div>
      </div>

      {/* Stats Comparison Battle Arena */}
      {left && right && (
        <div className="mt-12 backdrop-blur-md bg-white/40 dark:bg-gray-900/40 rounded-3xl p-6 border border-white/50 dark:border-white/5 shadow-xl animate-fade-in">
          <h2 className="text-2xl font-extrabold mb-6 text-center text-gray-900 dark:text-white drop-shadow-sm flex items-center justify-center gap-2">
            📊 Stat Battle Breakdown
          </h2>
          
          <div className="space-y-5 max-w-3xl mx-auto">
            {/* Base Stat Total (BST) comparison */}
            <div>
              <div className="flex justify-between items-center text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5 px-1">
                <span className="capitalize">{left.name} ({leftBst})</span>
                <span className="text-gray-900 dark:text-white uppercase text-xs tracking-wider bg-black/5 dark:bg-white/10 px-2 py-0.5 rounded-full">Base Stat Total</span>
                <span className="capitalize">{right.name} ({rightBst})</span>
              </div>
              <div className="flex h-4 w-full bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden p-0.5 border border-black/5 dark:border-white/5 shadow-inner">
                {/* Left side BST */}
                <div 
                  className={`h-full rounded-l-full transition-all duration-500 ${leftBst > rightBst ? 'bg-gradient-to-r from-emerald-400 to-green-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : leftBst < rightBst ? 'bg-red-400' : 'bg-yellow-400'}`}
                  style={{ width: `${(leftBst / (leftBst + rightBst)) * 100}%` }}
                />
                {/* Right side BST */}
                <div 
                  className={`h-full rounded-r-full transition-all duration-500 ${rightBst > leftBst ? 'bg-gradient-to-l from-emerald-400 to-green-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : rightBst < leftBst ? 'bg-red-400' : 'bg-yellow-400'}`}
                  style={{ width: `${(rightBst / (leftBst + rightBst)) * 100}%` }}
                />
              </div>
            </div>

            {/* Individual Stat Battles */}
            {left.stats.map((ls) => {
              const rs = right.stats.find((s) => s.stat.name === ls.stat.name);
              if (!rs) return null;

              const statName = formatStatName(ls.stat.name);
              const winner = statWinner(ls, rs);

              const leftVal = ls.base_stat;
              const rightVal = rs.base_stat;
              const sum = leftVal + rightVal;
              const leftPercent = sum > 0 ? (leftVal / sum) * 100 : 50;
              const rightPercent = sum > 0 ? (rightVal / sum) * 100 : 50;

              return (
                <div key={ls.stat.name}>
                  <div className="flex justify-between items-center text-xs font-bold text-gray-600 dark:text-gray-400 mb-1 px-1">
                    <span className={`capitalize flex items-center gap-1.5 ${winner === 'left' ? 'text-green-600 dark:text-green-400 font-extrabold text-sm' : 'font-medium'}`}>
                      {leftVal} {winner === 'left' && '👑'}
                    </span>
                    <span className="text-gray-500 font-bold uppercase tracking-wider text-[10px]">
                      {statName}
                    </span>
                    <span className={`capitalize flex items-center gap-1.5 ${winner === 'right' ? 'text-green-600 dark:text-green-400 font-extrabold text-sm' : 'font-medium'}`}>
                      {winner === 'right' && '👑'} {rightVal}
                    </span>
                  </div>
                  <div className="flex h-3 w-full bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden p-0.5 border border-black/5 dark:border-white/5">
                    {/* Left bar */}
                    <div 
                      className={`h-full rounded-l-full transition-all duration-500 ${winner === 'left' ? 'bg-gradient-to-r from-emerald-400 to-green-500' : 'bg-red-400/80 dark:bg-red-500/50'}`}
                      style={{ width: `${leftPercent}%` }}
                    />
                    {/* Right bar */}
                    <div 
                      className={`h-full rounded-r-full transition-all duration-500 ${winner === 'right' ? 'bg-gradient-to-l from-emerald-400 to-green-500' : 'bg-red-400/80 dark:bg-red-500/50'}`}
                      style={{ width: `${rightPercent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Signature Move Arenas */}
      {left && right && (
        <div className="mt-10 animate-fade-in">
          <h2 className="text-2xl font-extrabold mb-6 text-center text-gray-900 dark:text-white drop-shadow-sm">
            ⚔️ Attack Movepool
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="backdrop-blur-md bg-white/30 dark:bg-gray-900/30 rounded-2xl p-4 border border-white/40 dark:border-white/5 shadow-md">
              <h3 className="text-base font-bold text-center capitalize text-gray-800 dark:text-gray-200 mb-3 border-b border-black/5 dark:border-white/5 pb-2">
                {left.name}&apos;s Move List
              </h3>
              <div className="max-h-48 overflow-y-auto pr-1 flex flex-wrap justify-center gap-1.5">
                {(left.moves || []).slice(0, 24).map((m) => (
                  <span key={m.move.name} className="px-2.5 py-1 bg-white/50 dark:bg-black/20 border border-black/5 dark:border-white/10 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-semibold capitalize tracking-wide shadow-sm hover:scale-102 transition-transform cursor-default">
                    {m.move.name.replace("-", " ")}
                  </span>
                ))}
              </div>
            </div>

            <div className="backdrop-blur-md bg-white/30 dark:bg-gray-900/30 rounded-2xl p-4 border border-white/40 dark:border-white/5 shadow-md">
              <h3 className="text-base font-bold text-center capitalize text-gray-800 dark:text-gray-200 mb-3 border-b border-black/5 dark:border-white/5 pb-2">
                {right.name}&apos;s Move List
              </h3>
              <div className="max-h-48 overflow-y-auto pr-1 flex flex-wrap justify-center gap-1.5">
                {(right.moves || []).slice(0, 24).map((m) => (
                  <span key={m.move.name} className="px-2.5 py-1 bg-white/50 dark:bg-black/20 border border-black/5 dark:border-white/10 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-semibold capitalize tracking-wide shadow-sm hover:scale-102 transition-transform cursor-default">
                    {m.move.name.replace("-", " ")}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
}
