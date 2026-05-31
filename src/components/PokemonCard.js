"use client";

import Image from 'next/image';
import { useState, useEffect } from 'react';
import FavoriteButton from './FavoriteButton';
import EvolutionChain from './EvolutionChain';
import PokeLoader from './PokeLoader';
import ErrorBoundary from './ErrorBoundary';
import { getPokemonSpecies } from '../services/pokemonService';
import { FaHeart, FaShieldAlt, FaFistRaised, FaBolt, FaHourglassHalf, FaCircle, FaInfoCircle, FaEgg, FaBookOpen } from 'react-icons/fa';

// Dynamic type themes for premium visual styling
const TYPE_THEMES = {
  normal: {
    gradient: 'from-gray-400/20 to-zinc-500/20 border-zinc-300/40 dark:border-zinc-700/40 bg-zinc-500/10',
    badge: 'bg-zinc-500 text-white',
    glow: 'shadow-zinc-500/10 hover:shadow-zinc-500/30',
    barColor: 'bg-zinc-500',
    textColor: 'text-zinc-600 dark:text-zinc-400'
  },
  fire: {
    gradient: 'from-orange-500/20 to-red-600/20 border-orange-400/40 dark:border-orange-600/40 bg-orange-500/10',
    badge: 'bg-orange-500 text-white',
    glow: 'shadow-orange-500/10 hover:shadow-orange-500/30',
    barColor: 'bg-orange-500',
    textColor: 'text-orange-600 dark:text-orange-400'
  },
  water: {
    gradient: 'from-blue-500/20 to-indigo-600/20 border-blue-400/40 dark:border-blue-600/40 bg-blue-500/10',
    badge: 'bg-blue-500 text-white',
    glow: 'shadow-blue-500/10 hover:shadow-blue-500/30',
    barColor: 'bg-blue-500',
    textColor: 'text-blue-600 dark:text-blue-400'
  },
  electric: {
    gradient: 'from-yellow-400/20 to-amber-500/20 border-yellow-300/40 dark:border-yellow-600/40 bg-amber-400/10',
    badge: 'bg-amber-400 text-gray-900 font-semibold',
    glow: 'shadow-yellow-400/10 hover:shadow-yellow-400/30',
    barColor: 'bg-amber-400',
    textColor: 'text-amber-600 dark:text-amber-400'
  },
  grass: {
    gradient: 'from-green-500/20 to-emerald-600/20 border-green-400/40 dark:border-green-600/40 bg-green-500/10',
    badge: 'bg-green-500 text-white',
    glow: 'shadow-green-500/10 hover:shadow-green-500/30',
    barColor: 'bg-green-500',
    textColor: 'text-green-600 dark:text-green-400'
  },
  ice: {
    gradient: 'from-cyan-300/20 to-blue-400/20 border-cyan-300/40 dark:border-cyan-600/40 bg-cyan-400/10',
    badge: 'bg-cyan-400 text-gray-900 font-semibold',
    glow: 'shadow-cyan-400/10 hover:shadow-cyan-400/30',
    barColor: 'bg-cyan-400',
    textColor: 'text-cyan-600 dark:text-cyan-400'
  },
  fighting: {
    gradient: 'from-red-600/20 to-rose-800/20 border-red-500/40 dark:border-red-700/40 bg-red-600/10',
    badge: 'bg-red-600 text-white',
    glow: 'shadow-red-600/10 hover:shadow-red-600/30',
    barColor: 'bg-red-600',
    textColor: 'text-red-600 dark:text-red-400'
  },
  poison: {
    gradient: 'from-purple-500/20 to-fuchsia-600/20 border-purple-400/40 dark:border-purple-600/40 bg-purple-500/10',
    badge: 'bg-purple-500 text-white',
    glow: 'shadow-purple-500/10 hover:shadow-purple-500/30',
    barColor: 'bg-purple-500',
    textColor: 'text-purple-600 dark:text-purple-400'
  },
  ground: {
    gradient: 'from-amber-600/20 to-yellow-800/20 border-amber-500/40 dark:border-amber-700/40 bg-amber-600/10',
    badge: 'bg-amber-600 text-white',
    glow: 'shadow-amber-600/10 hover:shadow-amber-600/30',
    barColor: 'bg-amber-600',
    textColor: 'text-amber-600 dark:text-amber-400'
  },
  flying: {
    gradient: 'from-indigo-300/20 to-purple-400/20 border-indigo-300/40 dark:border-indigo-600/40 bg-indigo-400/10',
    badge: 'bg-indigo-400 text-white',
    glow: 'shadow-indigo-400/10 hover:shadow-indigo-400/30',
    barColor: 'bg-indigo-400',
    textColor: 'text-indigo-600 dark:text-indigo-400'
  },
  psychic: {
    gradient: 'from-pink-500/20 to-rose-600/20 border-pink-400/40 dark:border-pink-600/40 bg-pink-500/10',
    badge: 'bg-pink-500 text-white',
    glow: 'shadow-pink-500/10 hover:shadow-pink-500/30',
    barColor: 'bg-pink-500',
    textColor: 'text-pink-600 dark:text-pink-400'
  },
  bug: {
    gradient: 'from-lime-500/20 to-green-600/20 border-lime-400/40 dark:border-lime-600/40 bg-lime-500/10',
    badge: 'bg-lime-500 text-white',
    glow: 'shadow-lime-500/10 hover:shadow-lime-500/30',
    barColor: 'bg-lime-500',
    textColor: 'text-lime-600 dark:text-lime-400'
  },
  rock: {
    gradient: 'from-yellow-700/20 to-stone-800/20 border-yellow-600/40 dark:border-yellow-700/40 bg-yellow-700/10',
    badge: 'bg-yellow-700 text-white',
    glow: 'shadow-yellow-700/10 hover:shadow-yellow-700/30',
    barColor: 'bg-yellow-700',
    textColor: 'text-yellow-700 dark:text-yellow-400'
  },
  ghost: {
    gradient: 'from-purple-700/20 to-indigo-900/20 border-purple-600/40 dark:border-purple-800/40 bg-purple-700/10',
    badge: 'bg-purple-700 text-white',
    glow: 'shadow-purple-700/10 hover:shadow-purple-700/30',
    barColor: 'bg-purple-700',
    textColor: 'text-purple-600 dark:text-purple-400'
  },
  dragon: {
    gradient: 'from-indigo-600/20 to-violet-800/20 border-indigo-500/40 dark:border-indigo-700/40 bg-indigo-600/10',
    badge: 'bg-indigo-600 text-white',
    glow: 'shadow-indigo-600/10 hover:shadow-indigo-600/30',
    barColor: 'bg-indigo-600',
    textColor: 'text-indigo-600 dark:text-indigo-400'
  },
  dark: {
    gradient: 'from-gray-800/30 to-zinc-900/30 border-gray-700/50 dark:border-zinc-800/50 bg-gray-800/10',
    badge: 'bg-gray-800 text-white',
    glow: 'shadow-gray-900/10 hover:shadow-gray-900/30',
    barColor: 'bg-gray-800',
    textColor: 'text-gray-700 dark:text-gray-300'
  },
  steel: {
    gradient: 'from-slate-400/20 to-slate-600/20 border-slate-300/40 dark:border-slate-700/40 bg-slate-500/10',
    badge: 'bg-slate-500 text-white',
    glow: 'shadow-slate-500/10 hover:shadow-slate-500/30',
    barColor: 'bg-slate-500',
    textColor: 'text-slate-600 dark:text-slate-300'
  },
  fairy: {
    gradient: 'from-pink-300/20 to-rose-400/20 border-pink-300/40 dark:border-pink-500/40 bg-pink-400/10',
    badge: 'bg-pink-400 text-white',
    glow: 'shadow-pink-400/10 hover:shadow-pink-400/30',
    barColor: 'bg-pink-400',
    textColor: 'text-pink-500 dark:text-pink-400'
  },
};

export default function PokemonCard({ pokemon }) {
  const [isSpeciesLoading, setIsSpeciesLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [species, setSpecies] = useState(null);

  useEffect(() => {
    if (!pokemon?.id) return;
    setIsSpeciesLoading(true);
    setImageError(false);
    setSpecies(null);

    // Fetch species details to get flavor text, habitat, catch rate, egg groups, etc.
    getPokemonSpecies(pokemon.id)
      .then((data) => {
        setSpecies(data);
        setIsSpeciesLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching species details:', err);
        setIsSpeciesLoading(false);
      });
  }, [pokemon?.id]);

  if (!pokemon) return null;

  const {
    id,
    name,
    sprites,
    types,
    abilities,
    height,
    weight,
    stats,
    base_experience
  } = pokemon;

  const formattedId = `#${String(id).padStart(3, '0')}`;
  const imageUrl = sprites?.other?.['official-artwork']?.front_default ||
    sprites?.front_default ||
    `/eevee.png`;

  const mainType = types?.[0]?.type?.name || 'normal';
  const theme = TYPE_THEMES[mainType] || TYPE_THEMES.normal;

  const simplifiedPokemon = {
    id,
    name,
    sprite: imageUrl,
    types: types?.map(t => t.type.name) || [mainType]
  };

  // Extract a clean English Pokedex entry description
  const pokedexDescription = (() => {
    if (!species || !species.flavor_text_entries) return "No data log available for this Pokémon.";
    const englishEntries = species.flavor_text_entries.filter(e => e.language.name === 'en');
    if (englishEntries.length === 0) return "No data log available in English.";

    // Clean weird page feed and newline control characters
    return englishEntries[0].flavor_text
      .replace(/\f/g, " ")
      .replace(/\n/g, " ")
      .replace(/\u00ad/g, "")
      .trim();
  })();

  const breedingInfo = (() => {
    if (!species) return null;
    return {
      captureRate: species.capture_rate,
      eggGroups: species.egg_groups?.map(g => g.name).join(", "),
      growthRate: species.growth_rate?.name?.replace("-", " "),
      habitat: species.habitat?.name || "unknown",
      baseExperience: base_experience || "unknown"
    };
  })();

  return (
    <div className="w-full max-w-4xl mx-auto backdrop-blur-md bg-white/40 dark:bg-gray-950/40 rounded-3xl border border-white/50 dark:border-white/5 shadow-2xl overflow-hidden animate-fade-in">
      <div className="md:flex">
        {/* Left Column (Artwork Showcase - larger on desktop now) */}
        <div className={`md:w-5/12 p-8 flex flex-col justify-center items-center relative border-b md:border-b-0 md:border-r border-black/5 dark:border-white/5 bg-linear-to-b ${theme.gradient}`}>
          {/* Holographic overlay */}
          <div className="absolute inset-0 bg-linear-[135deg,rgba(255,255,255,0.1)_0%,transparent_60%] pointer-events-none" />

          {/* Favorite Button */}
          <div className="absolute top-4 left-4 z-10">
            <FavoriteButton pokemon={simplifiedPokemon} />
          </div>

          {/* Artwork Wrapper */}
          <div className="relative w-52 h-52 bg-white/20 dark:bg-black/10 border border-white/30 dark:border-white/10 rounded-full p-4 flex items-center justify-center shadow-lg transition-transform duration-500 hover:scale-105">
            {!imageError ? (
              <Image
                src={imageUrl}
                alt={name}
                fill
                sizes="(max-width: 208px) 100vw, 208px"
                className="object-contain p-2 drop-shadow-[0_10px_20px_rgba(0,0,0,0.25)]"
                onError={() => setImageError(true)}
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500">
                <span>Artwork unavailable</span>
              </div>
            )}
          </div>

          <div className="text-center mt-6">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 tracking-wider">
              {formattedId}
            </span>
            <h2 className="text-3xl font-black text-gray-900 dark:text-white capitalize drop-shadow-sm mt-0.5 tracking-tight">
              {name}
            </h2>
          </div>
        </div>

        {/* Right Column (Detailed stats) */}
        <div className="p-8 md:w-7/12 flex flex-col justify-between">
          <div>
            {/* Type Badges */}
            <div className="mb-5">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2 flex items-center gap-1">
                <FaInfoCircle /> Type Category
              </h3>
              <div className="flex gap-2">
                {types?.map(({ type }) => {
                  const typeTheme = TYPE_THEMES[type.name] || TYPE_THEMES.normal;
                  return (
                    <span
                      key={type.name}
                      className={`px-3.5 py-1 rounded-full text-xs font-bold capitalize tracking-wide shadow-sm border border-white/25 ${typeTheme.badge}`}
                    >
                      {type.name}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Pokedex Flavor text (retro glass text box) */}
            <div className="mb-5 bg-red-500/5 dark:bg-red-500/10 border-l-4 border-red-500 p-4 rounded-r-2xl backdrop-blur-sm relative">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-red-500 mb-1 flex items-center gap-1">
                <FaBookOpen /> Pokédex Entry Log
              </h3>
              {isSpeciesLoading ? (
                <div className="animate-pulse flex flex-col gap-2 mt-1.5">
                  <div className="h-4 bg-red-500/10 dark:bg-red-500/20 rounded w-11/12"></div>
                  <div className="h-4 bg-red-500/10 dark:bg-red-500/20 rounded w-8/12"></div>
                </div>
              ) : (
                <p className="text-gray-800 dark:text-gray-200 text-sm font-medium italic leading-relaxed">
                  &ldquo;{pokedexDescription}&rdquo;
                </p>
              )}
            </div>

            {/* Breeding, Training & Species info grid (fills empty space beautifully) */}
            <div className="mb-5">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2 flex items-center gap-1">
                🧬 Breeding & Training
              </h3>
              {isSpeciesLoading ? (
                <div className="grid grid-cols-2 gap-4 bg-white/25 dark:bg-black/10 border border-black/5 dark:border-white/5 p-4 rounded-2xl animate-pulse">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] uppercase font-bold text-gray-400/50">Habitat</span>
                    <div className="h-4 bg-black/5 dark:bg-white/5 rounded w-16"></div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] uppercase font-bold text-gray-400/50">Base Experience</span>
                    <div className="h-4 bg-black/5 dark:bg-white/5 rounded w-12"></div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] uppercase font-bold text-gray-400/50">Capture Rate</span>
                    <div className="h-4 bg-black/5 dark:bg-white/5 rounded w-20"></div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] uppercase font-bold text-gray-400/50">Egg Groups</span>
                    <div className="h-4 bg-black/5 dark:bg-white/5 rounded w-24"></div>
                  </div>
                </div>
              ) : breedingInfo ? (
                <div className="grid grid-cols-2 gap-3 bg-white/25 dark:bg-black/10 border border-black/5 dark:border-white/5 p-4 rounded-2xl text-xs font-semibold text-gray-700 dark:text-gray-300">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] uppercase font-bold text-gray-400">Habitat</span>
                    <span className="capitalize text-gray-900 dark:text-white">{breedingInfo.habitat}</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] uppercase font-bold text-gray-400">Base Experience</span>
                    <span className="text-gray-900 dark:text-white">{breedingInfo.baseExperience}</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] uppercase font-bold text-gray-400">Capture Rate</span>
                    <span className="text-gray-900 dark:text-white">{breedingInfo.captureRate} <span className="text-[10px] font-medium text-gray-400">({((breedingInfo.captureRate / 255) * 100).toFixed(0)}%)</span></span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] uppercase font-bold text-gray-400">Egg Groups</span>
                    <span className="capitalize text-gray-900 dark:text-white truncate">{breedingInfo.eggGroups}</span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 bg-white/25 dark:bg-black/10 border border-black/5 dark:border-white/5 rounded-2xl text-xs font-semibold text-gray-400">
                  Breeding data unavailable.
                </div>
              )}
            </div>

            {/* Physical details grid */}
            <div className="grid grid-cols-2 gap-4 mb-5 bg-white/25 dark:bg-black/10 p-3 rounded-2xl border border-black/5 dark:border-white/5 text-xs font-semibold text-gray-700 dark:text-gray-300">
              <div>
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-0.5">Height</h3>
                <p className="text-gray-900 dark:text-white font-extrabold text-base">{(height / 10).toFixed(1)} <span className="text-xs font-medium text-gray-500">m</span></p>
              </div>
              <div>
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-0.5">Weight</h3>
                <p className="text-gray-900 dark:text-white font-extrabold text-base">{(weight / 10).toFixed(1)} <span className="text-xs font-medium text-gray-500">kg</span></p>
              </div>
            </div>

            {/* Abilities */}
            <div className="mb-5">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2 flex items-center gap-1">
                ⚔️ Abilities
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {abilities?.map(({ ability, is_hidden }) => (
                  <span
                    key={ability.name}
                    className="bg-white/50 dark:bg-black/20 border border-black/5 dark:border-white/10 px-3 py-1 rounded-xl text-gray-800 dark:text-gray-200 text-xs font-semibold capitalize tracking-wide shadow-sm"
                  >
                    {ability.name.replace("-", " ")} {is_hidden && <span className="text-[10px] font-bold text-red-500 dark:text-red-400 font-mono ml-0.5">(Hidden)</span>}
                  </span>
                ))}
              </div>
            </div>

            {/* Base Stats Progress bars */}
            <div className="mb-6">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3 flex items-center gap-1">
                📊 Combat Base Stats
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2.5">
                {stats?.map((stat) => {
                  let statName = stat.stat.name;
                  if (statName === 'hp') statName = 'HP';
                  else if (statName === 'attack') statName = 'Attack';
                  else if (statName === 'defense') statName = 'Defense';
                  else if (statName === 'special-attack') statName = 'Sp. Atk';
                  else if (statName === 'special-defense') statName = 'Sp. Def';
                  else if (statName === 'speed') statName = 'Speed';
                  else statName = statName.replace('-', ' ');

                  const percentage = Math.min(100, (stat.base_stat / 255) * 100);

                  return (
                    <div key={stat.stat.name} className="flex flex-col gap-0.5">
                      <div className="flex justify-between items-center text-xs font-bold px-0.5">
                        <span className="text-white dark:text-gray-300">{statName}</span>
                        <span className="text-white dark:text-white font-black">{stat.base_stat}</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2 p-0.5">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${theme.barColor}`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Evolution Chain Component */}
          <div className="border-t border-black/5 dark:border-white/5 pt-5">
            <ErrorBoundary>
              <EvolutionChain name={name} />
            </ErrorBoundary>
          </div>
        </div>
      </div>
    </div>
  );
}