"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import ErrorBoundary from "@/components/ErrorBoundary";
import PokeLoader from "@/components/PokeLoader";
import { getPokemon } from "@/services/pokemonService";

function normalizeName(input) {
  if (input == null) return "";
  const raw = String(input).trim();
  if (/^\d+$/.test(raw)) return raw;
  return raw
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/_/g, "-")
    .replace(/[\.'’]/g, "")
    .replace(/♀/g, "-f")
    .replace(/♂/g, "-m")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function formatStatName(raw) {
  const name = String(raw || "");
  switch (name) {
    case "hp":
      return "HP";
    case "attack":
      return "Attack";
    case "defense":
      return "Defense";
    case "special-attack":
      return "Sp. Atk";
    case "special-defense":
      return "Sp. Def";
    case "speed":
      return "Speed";
    default:
      return name.replace(/-/g, " ");
  }
}

function PokemonMiniCard({ pokemon }) {
  if (!pokemon) return null;
  const imageUrl =
    pokemon?.sprites?.other?.["official-artwork"]?.front_default ||
    pokemon?.sprites?.front_default ||
    "/eevee.png";
  const types = pokemon?.types?.map((t) => t.type.name) || [];
  return (
    <div className="bg-white rounded-lg shadow p-4 dark:bg-gray-900">
      <div className="flex items-center gap-3">
        <div className="relative w-16 h-16">
          <Image src={imageUrl} alt={pokemon.name} fill className="object-contain" />
        </div>
        <div>
          <div className="font-semibold capitalize text-gray-900 dark:text-gray-100">{pokemon.name}</div>
          <div className="text-sm text-gray-700 dark:text-gray-300">#{String(pokemon.id).padStart(3, "0")}</div>
          <div className="flex gap-2 mt-1">
            {types.map((t) => (
              <span key={t} className="px-2 py-0.5 bg-gray-200 text-gray-800 rounded-full text-xs capitalize dark:bg-gray-700 dark:text-gray-100">
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 mt-3">
        {pokemon.stats?.map((s) => (
          <div key={s.stat.name} className="text-sm flex justify-between">
            <span className="capitalize text-gray-700 dark:text-gray-300">{formatStatName(s.stat.name)}</span>
            <span className="text-gray-900 dark:text-gray-100 font-medium">{s.base_stat}</span>
          </div>
        ))}
      </div>
      <div className="mt-3">
        <div className="text-sm font-semibold text-blue-950 dark:text-blue-200 mb-1">Abilities</div>
        <div className="flex flex-wrap gap-2">
          {pokemon.abilities?.map(({ ability }) => (
            <span key={ability.name} className="px-2 py-0.5 bg-gray-100 text-gray-800 rounded text-xs capitalize dark:bg-gray-700 dark:text-gray-100">
              {ability.name}
            </span>
          ))}
        </div>
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
  const [allNames, setAllNames] = useState([]);
  const [openLeft, setOpenLeft] = useState(false);
  const [openRight, setOpenRight] = useState(false);
  const [hiLeft, setHiLeft] = useState(-1);
  const [hiRight, setHiRight] = useState(-1);
  const leftContainerRef = useRef(null);
  const rightContainerRef = useRef(null);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (leftContainerRef.current && !leftContainerRef.current.contains(e.target)) setOpenLeft(false);
      if (rightContainerRef.current && !rightContainerRef.current.contains(e.target)) setOpenRight(false);
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
    } catch {}
  };

  const filteredLeft = (() => {
    const q = leftQuery.trim().toLowerCase();
    if (!q) return [];
    const starts = allNames.filter((n) => n.startsWith(q));
    const contains = allNames.filter((n) => !n.startsWith(q) && n.includes(q));
    return [...starts, ...contains].slice(0, 10);
  })();
  const filteredRight = (() => {
    const q = rightQuery.trim().toLowerCase();
    if (!q) return [];
    const starts = allNames.filter((n) => n.startsWith(q));
    const contains = allNames.filter((n) => !n.startsWith(q) && n.includes(q));
    return [...starts, ...contains].slice(0, 10);
  })();

  const searchLeft = async (e) => {
    e?.preventDefault?.();
    if (!leftQuery.trim()) return;
    // disallow same pokemon
    if (right && normalizeName(right.name) === normalizeName(leftQuery)) {
      setErrorLeft("Same Pokémon on both sides is not allowed.");
      return;
    }
    try {
      setLoadingLeft(true);
      setErrorLeft(null);
      const data = await getPokemon(leftQuery);
      if (right && normalizeName(right.name) === normalizeName(data.name)) {
        setErrorLeft("Same Pokémon on both sides is not allowed.");
        setLeft(null);
        return;
      }
      setLeft(data);
    } catch (e) {
      setErrorLeft("Not found");
      setLeft(null);
    } finally {
      setLoadingLeft(false);
    }
  };

  const searchRight = async (e) => {
    e?.preventDefault?.();
    if (!rightQuery.trim()) return;
    if (left && normalizeName(left.name) === normalizeName(rightQuery)) {
      setErrorRight("Same Pokémon on both sides is not allowed.");
      return;
    }
    try {
      setLoadingRight(true);
      setErrorRight(null);
      const data = await getPokemon(rightQuery);
      if (left && normalizeName(left.name) === normalizeName(data.name)) {
        setErrorRight("Same Pokémon on both sides is not allowed.");
        setRight(null);
        return;
      }
      setRight(data);
    } catch (e) {
      setErrorRight("Not found");
      setRight(null);
    } finally {
      setLoadingRight(false);
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
        searchLeft();
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
        searchRight();
      }
    } else if (e.key === 'Escape') {
      setOpenRight(false);
      setHiRight(-1);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 mt-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Compare Pokémon</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left */}
        <div>
          <form onSubmit={searchLeft} className="flex gap-2 mb-3" ref={leftContainerRef}>
            <input
              value={leftQuery}
              onChange={(e) => { setLeftQuery(e.target.value); setOpenLeft(true); ensureNamesLoaded(); }}
              placeholder="Enter first Pokémon name or ID"
              className="flex-1 px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900 bg-white placeholder-gray-500 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400"
              onFocus={() => { setOpenLeft(true); ensureNamesLoaded(); }}
              onKeyDown={onKeyDownLeft}
            />
            <button className="px-4 py-2 bg-red-500 text-white rounded">Search</button>
          </form>
          {openLeft && filteredLeft.length > 0 && (
            <ul role="listbox" className="mt-1 w-full max-h-64 overflow-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow">
              {filteredLeft.map((name, idx) => (
                <li
                  key={name}
                  role="option"
                  aria-selected={hiLeft === idx}
                  className={`px-3 py-2 cursor-pointer capitalize ${hiLeft === idx ? 'bg-red-100 dark:bg-gray-700' : 'hover:bg-gray-100 dark:hover:bg-gray-800'} text-gray-900 dark:text-gray-100 border-b border-white/30 last:border-b-0`}
                  onMouseEnter={() => setHiLeft(idx)}
                  onMouseDown={(e) => { e.preventDefault(); setLeftQuery(name); setOpenLeft(false); searchLeft(); }}
                >
                  {name}
                </li>
              ))}
            </ul>
          )}
          {loadingLeft ? (
            <div className="flex justify-center py-6"><PokeLoader label="Loading..." /></div>
          ) : errorLeft ? (
            <div className="text-red-600">{errorLeft}</div>
          ) : (
            <ErrorBoundary>
              <PokemonMiniCard pokemon={left} />
            </ErrorBoundary>
          )}
        </div>

        {/* Right */}
        <div>
          <form onSubmit={searchRight} className="flex gap-2 mb-3" ref={rightContainerRef}>
            <input
              value={rightQuery}
              onChange={(e) => { setRightQuery(e.target.value); setOpenRight(true); ensureNamesLoaded(); }}
              placeholder="Enter second Pokémon name or ID"
              className="flex-1 px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900 bg-white placeholder-gray-500 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400"
              onFocus={() => { setOpenRight(true); ensureNamesLoaded(); }}
              onKeyDown={onKeyDownRight}
            />
            <button className="px-4 py-2 bg-red-500 text-white rounded">Search</button>
          </form>
          {openRight && filteredRight.length > 0 && (
            <ul role="listbox" className="mt-1 w-full max-h-64 overflow-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow">
              {filteredRight.map((name, idx) => (
                <li
                  key={name}
                  role="option"
                  aria-selected={hiRight === idx}
                  className={`px-3 py-2 cursor-pointer capitalize ${hiRight === idx ? 'bg-red-100 dark:bg-gray-700' : 'hover:bg-gray-100 dark:hover:bg-gray-800'} text-gray-900 dark:text-gray-100 border-b border-white/30 last:border-b-0`}
                  onMouseEnter={() => setHiRight(idx)}
                  onMouseDown={(e) => { e.preventDefault(); setRightQuery(name); setOpenRight(false); searchRight(); }}
                >
                  {name}
                </li>
              ))}
            </ul>
          )}
          {loadingRight ? (
            <div className="flex justify-center py-6"><PokeLoader label="Loading..." /></div>
          ) : errorRight ? (
            <div className="text-red-600">{errorRight}</div>
          ) : (
            <ErrorBoundary>
              <PokemonMiniCard pokemon={right} />
            </ErrorBoundary>
          )}
        </div>
      </div>

      {/* Stats comparison table (if both exist) */}
      {left && right && (
        <div className="mt-8 overflow-x-auto">
          <h2 className="text-2xl font-bold mb-4 text-center">Stats Comparison</h2>
          <div className="min-w-[320px] max-w-3xl mx-auto">
            <div className="grid grid-cols-3 gap-2 text-sm md:text-base">
              <div className="font-semibold">Stat</div>
              <div className="font-semibold capitalize text-center">{left.name}</div>
              <div className="font-semibold capitalize text-center">{right.name}</div>
              {left.stats.map((ls) => {
                const rs = right.stats.find((s) => s.stat.name === ls.stat.name);
                const statName = formatStatName(ls.stat.name);
                const key = ls.stat.name;
                return (
                  <React.Fragment key={key}>
                    <div className="capitalize text-gray-700 dark:text-gray-300">{statName}</div>
                    <div className="text-center text-gray-900 dark:text-gray-100">{ls.base_stat}</div>
                    <div className="text-center text-gray-900 dark:text-gray-100">{rs?.base_stat ?? '-'}</div>
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Moves comparison (basic list of move names) */}
      {left && right && (
        <div className="mt-10">
          <h2 className="text-2xl font-bold mb-4 text-center">Moves</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="bg-white dark:bg-gray-900 rounded-md p-3 max-h-64 overflow-auto">
                <div className="flex flex-wrap justify-center gap-2 text-center">
                  {(left.moves || []).slice(0, 20).map((m) => (
                    <span key={m.move.name} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 dark:text-gray-100 rounded text-xs capitalize">
                      {m.move.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <div className="bg-white dark:bg-gray-900 rounded-md p-3 max-h-64 overflow-auto">
                <div className="flex flex-wrap justify-center gap-2 text-center">
                  {(right.moves || []).slice(0, 20).map((m) => (
                    <span key={m.move.name} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 dark:text-gray-100 rounded text-xs capitalize">
                      {m.move.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

