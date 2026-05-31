"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FaTrash } from 'react-icons/fa';
import ErrorBoundary from '@/components/ErrorBoundary';
import PokeLoader from '@/components/PokeLoader';
import BackgroundCarousel from '@/components/BackgroundCarousel';
import pokemonDataset from '@/data/pokemon-dataset.json';

// Sleek type-specific premium gradients and shadows
const TYPE_THEMES = {
  normal: {
    gradient: 'from-gray-400/20 to-zinc-500/20 border-zinc-300/40 dark:border-zinc-700/40 bg-zinc-500/10',
    badge: 'bg-zinc-500 text-white',
    glow: 'shadow-zinc-500/10 hover:shadow-zinc-500/30',
    text: 'text-zinc-600 dark:text-zinc-300'
  },
  fire: {
    gradient: 'from-orange-500/20 to-red-600/20 border-orange-400/40 dark:border-orange-600/40 bg-orange-500/10',
    badge: 'bg-orange-500 text-white',
    glow: 'shadow-orange-500/10 hover:shadow-orange-500/30',
    text: 'text-orange-600 dark:text-orange-400'
  },
  water: {
    gradient: 'from-blue-500/20 to-indigo-600/20 border-blue-400/40 dark:border-blue-600/40 bg-blue-500/10',
    badge: 'bg-blue-500 text-white',
    glow: 'shadow-blue-500/10 hover:shadow-blue-500/30',
    text: 'text-blue-600 dark:text-blue-400'
  },
  electric: {
    gradient: 'from-yellow-400/20 to-amber-500/20 border-yellow-300/40 dark:border-yellow-600/40 bg-amber-400/10',
    badge: 'bg-amber-400 text-gray-900 font-semibold',
    glow: 'shadow-yellow-400/10 hover:shadow-yellow-400/30',
    text: 'text-amber-600 dark:text-amber-400'
  },
  grass: {
    gradient: 'from-green-500/20 to-emerald-600/20 border-green-400/40 dark:border-green-600/40 bg-green-500/10',
    badge: 'bg-green-500 text-white',
    glow: 'shadow-green-500/10 hover:shadow-green-500/30',
    text: 'text-green-600 dark:text-green-400'
  },
  ice: {
    gradient: 'from-cyan-300/20 to-blue-400/20 border-cyan-300/40 dark:border-cyan-600/40 bg-cyan-400/10',
    badge: 'bg-cyan-400 text-gray-900 font-semibold',
    glow: 'shadow-cyan-400/10 hover:shadow-cyan-400/30',
    text: 'text-cyan-600 dark:text-cyan-400'
  },
  fighting: {
    gradient: 'from-red-600/20 to-rose-800/20 border-red-500/40 dark:border-red-700/40 bg-red-600/10',
    badge: 'bg-red-600 text-white',
    glow: 'shadow-red-600/10 hover:shadow-red-600/30',
    text: 'text-red-600 dark:text-red-400'
  },
  poison: {
    gradient: 'from-purple-500/20 to-fuchsia-600/20 border-purple-400/40 dark:border-purple-600/40 bg-purple-500/10',
    badge: 'bg-purple-500 text-white',
    glow: 'shadow-purple-500/10 hover:shadow-purple-500/30',
    text: 'text-purple-600 dark:text-purple-400'
  },
  ground: {
    gradient: 'from-amber-600/20 to-yellow-800/20 border-amber-500/40 dark:border-amber-700/40 bg-amber-600/10',
    badge: 'bg-amber-600 text-white',
    glow: 'shadow-amber-600/10 hover:shadow-amber-600/30',
    text: 'text-amber-600 dark:text-amber-400'
  },
  flying: {
    gradient: 'from-indigo-300/20 to-purple-400/20 border-indigo-300/40 dark:border-indigo-600/40 bg-indigo-400/10',
    badge: 'bg-indigo-400 text-white',
    glow: 'shadow-indigo-400/10 hover:shadow-indigo-400/30',
    text: 'text-indigo-600 dark:text-indigo-400'
  },
  psychic: {
    gradient: 'from-pink-500/20 to-rose-600/20 border-pink-400/40 dark:border-pink-600/40 bg-pink-500/10',
    badge: 'bg-pink-500 text-white',
    glow: 'shadow-pink-500/10 hover:shadow-pink-500/30',
    text: 'text-pink-600 dark:text-pink-400'
  },
  bug: {
    gradient: 'from-lime-500/20 to-green-600/20 border-lime-400/40 dark:border-lime-600/40 bg-lime-500/10',
    badge: 'bg-lime-500 text-white',
    glow: 'shadow-lime-500/10 hover:shadow-lime-500/30',
    text: 'text-lime-600 dark:text-lime-400'
  },
  rock: {
    gradient: 'from-yellow-700/20 to-stone-800/20 border-yellow-600/40 dark:border-yellow-700/40 bg-yellow-700/10',
    badge: 'bg-yellow-700 text-white',
    glow: 'shadow-yellow-700/10 hover:shadow-yellow-700/30',
    text: 'text-yellow-700 dark:text-yellow-400'
  },
  ghost: {
    gradient: 'from-purple-700/20 to-indigo-900/20 border-purple-600/40 dark:border-purple-800/40 bg-purple-700/10',
    badge: 'bg-purple-700 text-white',
    glow: 'shadow-purple-700/10 hover:shadow-purple-700/30',
    text: 'text-purple-600 dark:text-purple-400'
  },
  dragon: {
    gradient: 'from-indigo-600/20 to-violet-800/20 border-indigo-500/40 dark:border-indigo-700/40 bg-indigo-600/10',
    badge: 'bg-indigo-600 text-white',
    glow: 'shadow-indigo-600/10 hover:shadow-indigo-600/30',
    text: 'text-indigo-600 dark:text-indigo-400'
  },
  dark: {
    gradient: 'from-gray-800/30 to-zinc-900/30 border-gray-700/50 dark:border-zinc-800/50 bg-gray-800/10',
    badge: 'bg-gray-800 text-white',
    glow: 'shadow-gray-900/10 hover:shadow-gray-900/30',
    text: 'text-gray-700 dark:text-gray-300'
  },
  steel: {
    gradient: 'from-slate-400/20 to-slate-600/20 border-slate-300/40 dark:border-slate-700/40 bg-slate-500/10',
    badge: 'bg-slate-500 text-white',
    glow: 'shadow-slate-500/10 hover:shadow-slate-500/30',
    text: 'text-slate-600 dark:text-slate-300'
  },
  fairy: {
    gradient: 'from-pink-300/20 to-rose-400/20 border-pink-300/40 dark:border-pink-500/40 bg-pink-400/10',
    badge: 'bg-pink-400 text-white',
    glow: 'shadow-pink-400/10 hover:shadow-pink-400/30',
    text: 'text-pink-500 dark:text-pink-400'
  },
};

export default function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load favorites from localStorage and enrich them with full stats from offline dataset
    const loadFavorites = () => {
      try {
        const storedFavorites = JSON.parse(localStorage.getItem('pokemonFavorites') || '[]');

        // Enrich stored favorites with stats and other details from pokemonDataset
        const enriched = storedFavorites.map((fav) => {
          const datasetMatch = (pokemonDataset || []).find((p) => p.id === fav.id);
          return datasetMatch ? { ...fav, stats: datasetMatch.stats } : fav;
        });

        setFavorites(enriched);
      } catch (error) {
        console.error('Error loading favorites:', error);
        setFavorites([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadFavorites();
  }, []);

  const removeFavorite = (id) => {
    const updatedFavorites = favorites.filter(pokemon => pokemon.id !== id);
    setFavorites(updatedFavorites);
    localStorage.setItem('pokemonFavorites', JSON.stringify(updatedFavorites));
    // Dispatch storage event so navbar gets updated count immediately
    window.dispatchEvent(new Event('storage'));
  };

  const clearAllFavorites = () => {
    setFavorites([]);
    localStorage.removeItem('pokemonFavorites');
    window.dispatchEvent(new Event('storage'));
  };

  return (
    <>
      <BackgroundCarousel />
      <div className="container mx-auto px-4 py-8 mt-20 max-w-6xl min-h-screen">
        <h1 className="text-3xl font-extrabold text-center text-white dark:text-white tracking-tight drop-shadow-sm mb-2">
          Your Favorite Pokémon
        </h1>
        <p className="text-center text-white dark:text-white font-medium mb-8">
          A premium holographic gallery showcasing all the Pokémon you have favorited.
        </p>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <PokeLoader size={72} label="Retrieving your collection logs..." />
          </div>
        ) : favorites.length === 0 ? (
          <div className="text-center py-16 backdrop-blur-md bg-white/40 dark:bg-gray-950/40 rounded-3xl border border-white/50 dark:border-white/5 shadow-2xl p-8 max-w-xl mx-auto animate-fade-in">
            <p className="text-white dark:text-white font-semibold text-lg mb-6 leading-relaxed">
              Your favorite collection logs are empty. Start exploring the Pokédex to select your champions!
            </p>
            <Link href="/" className="inline-block px-6 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 hover:-translate-y-0.5 active:scale-98 transition-all duration-300 shadow-md shadow-red-500/20 hover:shadow-red-500/40">
              Explore Pokémon
            </Link>
          </div>
        ) : (
          <ErrorBoundary>
            <div className="flex justify-end mb-6">
              <button
                onClick={clearAllFavorites}
                className="px-5 py-2.5 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 hover:-translate-y-0.5 active:scale-98 transition-all duration-300 shadow-md shadow-red-500/20 hover:shadow-red-500/40"
              >
                Clear All Favorites
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-fade-in">
              {favorites.map((pokemon) => {
                const mainType = pokemon.types?.[0] || 'normal';
                const theme = TYPE_THEMES[mainType] || TYPE_THEMES.normal;
                const formattedId = `#${String(pokemon.id).padStart(3, '0')}`;

                return (
                  <div
                    key={pokemon.id}
                    className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border bg-gradient-to-br ${theme.gradient} ${theme.glow} shadow-lg transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl backdrop-blur-md`}
                  >
                    {/* Subtle holographic diagonal glare */}
                    <div className="absolute inset-0 bg-linear-[135deg,rgba(255,255,255,0.15)_0%,transparent_50%,rgba(0,0,0,0.05)_100%] pointer-events-none z-0" />

                    {/* Trash Button */}
                    <button
                      onClick={() => removeFavorite(pokemon.id)}
                      className="absolute top-3 right-3 p-2 bg-red-500/20 hover:bg-red-500/40 dark:bg-black/20 dark:hover:bg-red-500/30 border border-white/20 dark:border-white/5 rounded-full transition-colors duration-200 z-10"
                      aria-label="Remove from favorites"
                    >
                      <FaTrash className="text-red-500 dark:text-red-400 text-xs" />
                    </button>

                    <Link href={`/?pokemon=${pokemon.name}`} className="p-5 text-center grow flex flex-col justify-between">
                      {/* Sprite Image Container */}
                      <div className="relative w-32 h-32 mx-auto mb-4 bg-white/20 dark:bg-black/10 rounded-full p-2 border border-white/30 dark:border-white/10 flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
                        {pokemon.sprite ? (
                          <Image
                            src={pokemon.sprite}
                            alt={pokemon.name}
                            fill
                            sizes="(max-width: 128px) 100vw, 128px"
                            className="object-contain p-1 drop-shadow-[0_4px_8px_rgba(0,0,0,0.15)]"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-500">
                            <span className="text-xs">No Image</span>
                          </div>
                        )}
                      </div>

                      {/* ID & Name */}
                      <div className="relative z-10">
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 tracking-wider">
                          {formattedId}
                        </p>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white capitalize truncate drop-shadow-sm mt-0.5">
                          {pokemon.name}
                        </h3>
                      </div>

                      {/* Types Badges */}
                      <div className="flex justify-center gap-2 mt-3 relative z-10">
                        {pokemon.types?.map((type) => {
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
                      {pokemon.stats && (
                        <div className="grid grid-cols-3 gap-1 border-t border-black/5 dark:border-white/5 mt-4 pt-3 text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                          <div>
                            <div className="text-gray-900 dark:text-white text-xs">{pokemon.stats.hp}</div>
                            HP
                          </div>
                          <div>
                            <div className="text-gray-900 dark:text-white text-xs">{pokemon.stats.attack}</div>
                            ATK
                          </div>
                          <div>
                            <div className="text-gray-900 dark:text-white text-xs">{pokemon.stats.speed}</div>
                            SPD
                          </div>
                        </div>
                      )}
                    </Link>
                  </div>
                );
              })}
            </div>
          </ErrorBoundary>
        )}
      </div>
    </>
  );
}
