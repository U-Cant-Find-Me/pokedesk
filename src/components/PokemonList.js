"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Image from 'next/image';
import FavoriteButton from './FavoriteButton';
import PokeLoader from './PokeLoader';
import pokemonDataset from '../data/pokemon-dataset.json';

// Sleek type-specific premium gradients and shadows
const TYPE_THEMES = {
  normal: {
    gradient: 'from-gray-400/20 to-zinc-500/20 border-zinc-300/40 dark:border-zinc-700/40',
    badge: 'bg-zinc-500 text-white',
    glow: 'shadow-zinc-500/10 hover:shadow-zinc-500/30',
    text: 'text-zinc-600 dark:text-zinc-300'
  },
  fire: {
    gradient: 'from-orange-500/20 to-red-600/20 border-orange-400/40 dark:border-orange-600/40',
    badge: 'bg-orange-500 text-white',
    glow: 'shadow-orange-500/10 hover:shadow-orange-500/30',
    text: 'text-orange-600 dark:text-orange-400'
  },
  water: {
    gradient: 'from-blue-500/20 to-indigo-600/20 border-blue-400/40 dark:border-blue-600/40',
    badge: 'bg-blue-500 text-white',
    glow: 'shadow-blue-500/10 hover:shadow-blue-500/30',
    text: 'text-blue-600 dark:text-blue-400'
  },
  electric: {
    gradient: 'from-yellow-400/20 to-amber-500/20 border-yellow-300/40 dark:border-yellow-600/40',
    badge: 'bg-amber-400 text-gray-900 font-semibold',
    glow: 'shadow-yellow-400/10 hover:shadow-yellow-400/30',
    text: 'text-amber-600 dark:text-amber-400'
  },
  grass: {
    gradient: 'from-green-500/20 to-emerald-600/20 border-green-400/40 dark:border-green-600/40',
    badge: 'bg-green-500 text-white',
    glow: 'shadow-green-500/10 hover:shadow-green-500/30',
    text: 'text-green-600 dark:text-green-400'
  },
  ice: {
    gradient: 'from-cyan-300/20 to-blue-400/20 border-cyan-300/40 dark:border-cyan-600/40',
    badge: 'bg-cyan-400 text-gray-900 font-semibold',
    glow: 'shadow-cyan-400/10 hover:shadow-cyan-400/30',
    text: 'text-cyan-600 dark:text-cyan-400'
  },
  fighting: {
    gradient: 'from-red-600/20 to-rose-800/20 border-red-500/40 dark:border-red-700/40',
    badge: 'bg-red-600 text-white',
    glow: 'shadow-red-600/10 hover:shadow-red-600/30',
    text: 'text-red-600 dark:text-red-400'
  },
  poison: {
    gradient: 'from-purple-500/20 to-fuchsia-600/20 border-purple-400/40 dark:border-purple-600/40',
    badge: 'bg-purple-500 text-white',
    glow: 'shadow-purple-500/10 hover:shadow-purple-500/30',
    text: 'text-purple-600 dark:text-purple-400'
  },
  ground: {
    gradient: 'from-amber-600/20 to-yellow-800/20 border-amber-500/40 dark:border-amber-700/40',
    badge: 'bg-amber-600 text-white',
    glow: 'shadow-amber-600/10 hover:shadow-amber-600/30',
    text: 'text-amber-600 dark:text-amber-400'
  },
  flying: {
    gradient: 'from-indigo-300/20 to-purple-400/20 border-indigo-300/40 dark:border-indigo-600/40',
    badge: 'bg-indigo-400 text-white',
    glow: 'shadow-indigo-400/10 hover:shadow-indigo-400/30',
    text: 'text-indigo-600 dark:text-indigo-400'
  },
  psychic: {
    gradient: 'from-pink-500/20 to-rose-600/20 border-pink-400/40 dark:border-pink-600/40',
    badge: 'bg-pink-500 text-white',
    glow: 'shadow-pink-500/10 hover:shadow-pink-500/30',
    text: 'text-pink-600 dark:text-pink-400'
  },
  bug: {
    gradient: 'from-lime-500/20 to-green-600/20 border-lime-400/40 dark:border-lime-600/40',
    badge: 'bg-lime-500 text-white',
    glow: 'shadow-lime-500/10 hover:shadow-lime-500/30',
    text: 'text-lime-600 dark:text-lime-400'
  },
  rock: {
    gradient: 'from-yellow-700/20 to-stone-800/20 border-yellow-600/40 dark:border-yellow-700/40',
    badge: 'bg-yellow-700 text-white',
    glow: 'shadow-yellow-700/10 hover:shadow-yellow-700/30',
    text: 'text-yellow-700 dark:text-yellow-400'
  },
  ghost: {
    gradient: 'from-purple-700/20 to-indigo-900/20 border-purple-600/40 dark:border-purple-800/40',
    badge: 'bg-purple-700 text-white',
    glow: 'shadow-purple-700/10 hover:shadow-purple-700/30',
    text: 'text-purple-600 dark:text-purple-400'
  },
  dragon: {
    gradient: 'from-indigo-600/20 to-violet-800/20 border-indigo-500/40 dark:border-indigo-700/40',
    badge: 'bg-indigo-600 text-white',
    glow: 'shadow-indigo-600/10 hover:shadow-indigo-600/30',
    text: 'text-indigo-600 dark:text-indigo-400'
  },
  dark: {
    gradient: 'from-gray-800/30 to-zinc-900/30 border-gray-700/50 dark:border-zinc-800/50',
    badge: 'bg-gray-800 text-white',
    glow: 'shadow-gray-900/10 hover:shadow-gray-900/30',
    text: 'text-gray-700 dark:text-gray-300'
  },
  steel: {
    gradient: 'from-slate-400/20 to-slate-600/20 border-slate-300/40 dark:border-slate-700/40',
    badge: 'bg-slate-500 text-white',
    glow: 'shadow-slate-500/10 hover:shadow-slate-500/30',
    text: 'text-slate-600 dark:text-slate-300'
  },
  fairy: {
    gradient: 'from-pink-300/20 to-rose-400/20 border-pink-300/40 dark:border-pink-500/40',
    badge: 'bg-pink-400 text-white',
    glow: 'shadow-pink-400/10 hover:shadow-pink-400/30',
    text: 'text-pink-500 dark:text-pink-400'
  },
};

export default function PokemonList({ onSelectPokemon, filters = {}, sort = 'number' }) {
  const [visibleCount, setVisibleCount] = useState(24);
  const [isLoading, setIsLoading] = useState(false);
  const observer = useRef(null);
  const sentinelRef = useRef(null);
  const loadingMoreRef = useRef(false);

  // Compute filtered and sorted Pokemon list instantly client-side using useMemo
  const filteredAndSortedList = useMemo(() => {
    const list = pokemonDataset || [];

    // 1) Apply Filters
    const filtered = list.filter((p) => {
      // Type filter
      if (filters.types && filters.types.length > 0) {
        const selected = new Set(filters.types);
        for (const t of selected) {
          if (!p.types.includes(t)) return false;
        }
      }

      // Generation filter
      if (filters.generation) {
        if (p.generation !== Number(filters.generation)) return false;
      }

      // BST filter
      if (filters.bstMin != null && p.stats.bst < filters.bstMin) return false;
      if (filters.bstMax != null && p.stats.bst > filters.bstMax) return false;

      // Ability filter
      if (filters.ability && filters.ability.trim()) {
        const query = filters.ability.trim().toLowerCase();
        const hasAbility = p.abilities.some((a) => a.toLowerCase().includes(query));
        if (!hasAbility) return false;
      }

      // Special tags filter
      if (filters.special && filters.special.length > 0) {
        const sel = new Set(filters.special);
        for (const key of sel) {
          if (key === 'legendary' && !p.is_legendary) return false;
          if (key === 'mythical' && !p.is_mythical) return false;
          if (key === 'fossil' && !p.is_fossil) return false;
          if (key === 'pseudo' && !p.is_pseudo) return false;
          if (key === 'ultra' && !p.is_ultra) return false;
          if (key === 'paradox' && !p.is_paradox) return false;
        }
      }

      return true;
    });

    // 2) Apply Sorting
    return [...filtered].sort((a, b) => {
      switch (sort) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'total':
          return b.stats.bst - a.stats.bst;
        case 'attack':
          return b.stats.attack - a.stats.attack;
        case 'speed':
          return b.stats.speed - a.stats.speed;
        case 'number':
        default:
          return a.id - b.id;
      }
    });
  }, [filters, sort]);

  // Reset pagination count when filters/sorting changes
  useEffect(() => {
    setVisibleCount(24);
  }, [filters, sort]);

  const displayedList = useMemo(() => {
    return filteredAndSortedList.slice(0, visibleCount);
  }, [filteredAndSortedList, visibleCount]);

  const hasMore = displayedList.length < filteredAndSortedList.length;

  // Infinite scroll sentinel observer setup
  const setupObserver = useCallback(() => {
    if (!sentinelRef.current) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && hasMore && !loadingMoreRef.current) {
          loadingMoreRef.current = true;
          setIsLoading(true);
          // Small dynamic mock loading timeout for smooth UX transition
          setTimeout(() => {
            setVisibleCount((prev) => prev + 12);
            loadingMoreRef.current = false;
            setIsLoading(false);
          }, 300);
        }
      },
      {
        root: null,
        rootMargin: '200px', // trigger before hitting the absolute bottom
        threshold: 0,
      }
    );
    observer.current.observe(sentinelRef.current);
  }, [hasMore]);

  // Attach observer on mount / list size change
  useEffect(() => {
    setupObserver();
    return () => {
      if (observer.current) observer.current.disconnect();
    };
  }, [setupObserver, displayedList.length]);

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white drop-shadow-sm">
          Browse Pokémon
        </h2>
        <span className="text-sm font-medium text-pink-500 dark:text-gray-400 bg-white/50 dark:bg-gray-900/50 backdrop-blur px-3 py-1 rounded-full border border-black/5 dark:border-white/5 mt-2 md:mt-0">
          Showing {filteredAndSortedList.length} of {pokemonDataset.length} results
        </span>
      </div>

      {displayedList.length === 0 ? (
        <div className="text-center py-16 backdrop-blur-md bg-white/20 dark:bg-black/20 rounded-xl shadow-lg border border-white/20 dark:border-white/5">
          <p className="text-gray-800 dark:text-gray-200 text-lg font-medium mb-4">
            No Pokémon matches your active filters.
          </p>
          <div className="w-full flex justify-center">
            <Image src="/eevee.png" alt="Eevee sad" width={100} height={100} className="w-full h-1/4 opacity-40 animate-bounce" />
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayedList.map((pokemon) => {
              const mainType = pokemon.types[0] || 'normal';
              const theme = TYPE_THEMES[mainType] || TYPE_THEMES.normal;
              const formattedId = `#${String(pokemon.id).padStart(3, '0')}`;

              // Simplified Pokemon object for favorites
              const simplifiedPokemon = {
                id: pokemon.id,
                name: pokemon.name,
                sprite: pokemon.sprite || '/eevee.png',
                types: pokemon.types
              };

              return (
                <div
                  key={pokemon.id}
                  id={`pokemon-${pokemon.name}`}
                  className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border bg-gradient-to-br ${theme.gradient} ${theme.glow} shadow-lg transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl backdrop-blur-md`}
                >
                  {/* Subtle holographic diagonal glare */}
                  <div className="absolute inset-0 bg-linear-[135deg,rgba(255,255,255,0.15)_0%,transparent_50%,rgba(0,0,0,0.05)_100%] pointer-events-none z-0" />

                  {/* Favorite Button */}
                  <div className="absolute top-3 right-3 z-10">
                    <FavoriteButton pokemon={simplifiedPokemon} />
                  </div>

                  <div
                    className="p-5 text-center cursor-pointer grow flex flex-col justify-between"
                    onClick={() => onSelectPokemon(pokemon.name)}
                  >
                    {/* Sprite Image Container */}
                    <div className="relative w-36 h-36 mx-auto mb-4 bg-white/20 dark:bg-black/10 rounded-full p-2 border border-white/30 dark:border-white/10 flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
                      {pokemon.sprite ? (
                        <Image
                          src={pokemon.sprite}
                          alt={pokemon.name}
                          fill
                          sizes="(max-width: 144px) 100vw, 144px"
                          className="object-contain p-2 drop-shadow-[0_4px_8px_rgba(0,0,0,0.15)]"
                          priority={pokemon.id <= 12}
                        />
                      ) : (
                        <span className="text-xs text-gray-500">No Image</span>
                      )}
                    </div>

                    {/* ID & Name */}
                    <div className="relative z-10">
                      <p className="text-xs font-semibold text-white dark:text-white tracking-wider">
                        {formattedId}
                      </p>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white capitalize truncate drop-shadow-sm mt-0.5">
                        {pokemon.name}
                      </h3>
                    </div>

                    {/* Types Badges */}
                    <div className="flex justify-center gap-2 mt-3 relative z-10">
                      {pokemon.types.map((type) => {
                        const typeTheme = TYPE_THEMES[type] || TYPE_THEMES.normal;
                        return (
                          <span
                            key={type}
                            className={`px-3 py-1 rounded-full text-xs font-bold capitalize tracking-wide shadow-sm border border-white/25 ${typeTheme.badge}`}
                          >
                            {type}
                          </span>
                        );
                      })}
                    </div>

                    {/* Quick Stats Summary Footer */}
                    <div className="grid grid-cols-3 gap-1 border-t border-black/5 dark:border-white/5 mt-4 pt-3 text-[10px] font-bold uppercase tracking-wider text-white dark:text-gray-400">
                      <div>
                        <div className="text-white dark:text-white text-xs">{pokemon.stats.hp}</div>
                        HP
                      </div>
                      <div>
                        <div className="text-white dark:text-white text-xs">{pokemon.stats.attack}</div>
                        ATK
                      </div>
                      <div>
                        <div className="text-white dark:text-white text-xs">{pokemon.stats.speed}</div>
                        SPD
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Sentinel for infinite scroll */}
          <div ref={sentinelRef} className="h-10 mt-6" />

          {/* Loading more indicator */}
          {isLoading && (
            <div className="flex justify-center items-center py-6">
              <PokeLoader size={48} label="Summoning more Pokémon..." />
            </div>
          )}

          {/* End of list banner */}
          {!hasMore && (
            <div className="text-center py-10 mt-6">
              <p className="text-gray-600 dark:text-gray-400 font-medium">
                ✨ You&apos;ve completely explored the entire Pokédex! ✨
              </p>
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="mt-4 px-6 py-2 bg-red-500 text-white font-semibold rounded-full hover:bg-red-600 transition-all duration-300 shadow-md shadow-red-500/20 hover:shadow-red-500/40 hover:-translate-y-0.5"
              >
                Back to Top
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}