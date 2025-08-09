"use client";

import Image from 'next/image';
import { useState, useEffect } from 'react';
import FavoriteButton from './FavoriteButton';
import EvolutionChain from './EvolutionChain';
import PokeLoader from './PokeLoader';

export default function PokemonCard({ pokemon }) {
  const [isLoading, setIsLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (pokemon) {
      setIsLoading(false);
    }
  }, [pokemon]);

  if (!pokemon) return null;

  const {
    id,
    name,
    sprites,
    types,
    abilities,
    height,
    weight,
    stats
  } = pokemon;

  // Format the ID with leading zeros (e.g., #001, #025)
  const formattedId = `#${String(id).padStart(3, '0')}`;

  // Get the official artwork if available, fallback to other sprites
  const imageUrl = sprites?.other?.['official-artwork']?.front_default || 
                  sprites?.front_default || 
                  `/eevee.png`; // Fallback to local image

  // Get background color based on pokemon type
  const typeColors = {
    normal: 'bg-gray-400',
    fire: 'bg-orange-500',
    water: 'bg-blue-500',
    electric: 'bg-yellow-400',
    grass: 'bg-green-500',
    ice: 'bg-blue-200',
    fighting: 'bg-red-700',
    poison: 'bg-purple-500',
    ground: 'bg-yellow-600',
    flying: 'bg-indigo-300',
    psychic: 'bg-pink-500',
    bug: 'bg-lime-500',
    rock: 'bg-yellow-800',
    ghost: 'bg-purple-700',
    dragon: 'bg-indigo-600',
    dark: 'bg-gray-800',
    steel: 'bg-gray-500',
    fairy: 'bg-pink-300',
  };

  const mainType = types?.[0]?.type?.name || 'normal';
  const bgColor = typeColors[mainType] || 'bg-gray-400';
  
  // Create a simplified Pokemon object for favorites
  const simplifiedPokemon = {
    id,
    name,
    sprite: imageUrl,
    types: types?.map(t => t.type.name) || [mainType]
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <PokeLoader size={72} label="Loading Pokémon..." />
        </div>
      ) : (
        <div className="md:flex">
          <div className={`${bgColor} md:w-1/3 p-4 flex flex-col justify-center items-center relative`}>
            {/* Add a semi-transparent overlay for better text contrast */}
            <div className="absolute inset-0 bg-black/10 pointer-events-none"></div>
            <div className="relative w-48 h-48">
              {!imageError ? (
                <Image
                  src={imageUrl}
                  alt={name}
                  fill
                  className="object-contain"
                  onError={() => setImageError(true)}
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white">
                  <span>Image not available</span>
                </div>
              )}
            </div>
            <h2 className="text-xl font-bold text-white mt-2 capitalize relative z-10 text-shadow">{name}</h2>
            <p className="text-white opacity-90 relative z-10 text-shadow">{formattedId}</p>
          </div>

          <div className="p-6 md:w-2/3">
            <div className="flex justify-end mb-4">
              <FavoriteButton pokemon={simplifiedPokemon} />
            </div>
            
            <div className="mb-4">
              <h3 className="text-blue-950 text-lg font-semibold mb-2">Types</h3>
              <div className="flex gap-2 relative z-10">
                {types?.map(({ type }) => (
                  <span 
                    key={type.name} 
                    className={`${typeColors[type.name] || 'bg-gray-400'} px-3 py-1 rounded-full text-white text-sm capitalize`}
                  >
                    {type.name}
                  </span>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <h3 className="text-blue-950 text-lg font-semibold mb-2">Abilities</h3>
              <div className="flex flex-wrap gap-2">
                {abilities?.map(({ ability, is_hidden }) => (
                  <span 
                    key={ability.name} 
                    className="bg-gray-200 px-3 py-1 rounded-full text-gray-800 text-sm capitalize"
                  >
                    {ability.name} {is_hidden && '(Hidden)'}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <h3 className="text-blue-950 text-lg font-semibold mb-2">Height</h3>
                <p className='text-gray-700'>{(height / 10).toFixed(1)} m</p>
              </div>
              <div>
                <h3 className="text-blue-950 text-lg font-semibold mb-2">Weight</h3>
                <p className='text-gray-700'>{(weight / 10).toFixed(1)} kg</p>
              </div>
            </div>

            <div>
              <h3 className="text-blue-950 text-lg font-semibold mb-2">Base Stats</h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {stats?.map((stat) => {
                  // Format stat name (e.g., 'special-attack' -> 'Sp. Atk')
                  let statName = stat.stat.name;
                  if (statName === 'hp') statName = 'HP';
                  else if (statName === 'attack') statName = 'Attack';
                  else if (statName === 'defense') statName = 'Defense';
                  else if (statName === 'special-attack') statName = 'Sp. Atk';
                  else if (statName === 'special-defense') statName = 'Sp. Def';
                  else if (statName === 'speed') statName = 'Speed';
                  else statName = statName.replace('-', ' ');

                  // Calculate percentage for progress bar (max stat value is typically 255)
                  const percentage = Math.min(100, (stat.base_stat / 255) * 100);
                  
                  return (
                    <div key={stat.stat.name}>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-800 font-medium">{statName}</span>
                        <span className="text-sm text-gray-600">{stat.base_stat}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className={`${bgColor} h-2.5 rounded-full`} 
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <EvolutionChain name={name} />
          </div>
        </div>
      )}
    </div>
  );
}