"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FaTrash } from 'react-icons/fa';
import ErrorBoundary from '@/components/ErrorBoundary';
import PokeLoader from '@/components/PokeLoader';

export default function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Type colors for Pokemon cards
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

  useEffect(() => {
    // Load favorites from localStorage
    const loadFavorites = () => {
      try {
        const storedFavorites = JSON.parse(localStorage.getItem('pokemonFavorites') || '[]');
        setFavorites(storedFavorites);
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
  };

  const clearAllFavorites = () => {
    setFavorites([]);
    localStorage.removeItem('pokemonFavorites');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Your Favorite Pokémon</h1>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <PokeLoader size={72} label="Loading favorites..." />
        </div>
      ) : favorites.length === 0 ? (
        <div className="text-center py-12 backdrop-blur-md bg-white/20 rounded-xl shadow-lg">
          <p className="text-white mb-4">You haven&apos;t added any favorites yet. Start exploring and add some Pokémon to your favorites list!</p>
          <Link href="/" className="inline-block px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200">
            Explore Pokémon
          </Link>
        </div>
      ) : (
        <ErrorBoundary>
          <div className="flex justify-end mb-6">
            <button 
              onClick={clearAllFavorites}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200"
            >
              Clear All Favorites
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {favorites.map((pokemon) => {
              // Get main type for background color
              const mainType = pokemon.types?.[0] || 'normal';
              const bgColor = typeColors[mainType] || 'bg-gray-400';
              
              // Format ID with leading zeros
              const formattedId = `#${String(pokemon.id).padStart(3, '0')}`;
              
              return (
                <div 
                  key={pokemon.id} 
                  className={`${bgColor} rounded-lg shadow-md overflow-hidden relative`}
                >
                  {/* Add a semi-transparent overlay for better text contrast */}
                  <div className="absolute inset-0 bg-black/10 rounded-lg pointer-events-none"></div>
                  <button 
                    onClick={() => removeFavorite(pokemon.id)}
                    className="absolute top-2 right-2 p-2 bg-white/20 rounded-full hover:bg-white/40 transition-colors duration-200"
                    aria-label="Remove from favorites"
                  >
                    <FaTrash className="text-white" />
                  </button>
                  
                  <Link href={`/?pokemon=${pokemon.name}`} className="block p-4 text-center">
                    <div className="relative w-full h-32 mx-auto">
                      {pokemon.sprite ? (
                        <Image 
                          src={pokemon.sprite} 
                          alt={pokemon.name}
                          fill
                          className="object-contain"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white">
                          <span>Image not available</span>
                        </div>
                      )}
                    </div>
                    <h3 className="text-xl font-semibold mt-2 text-white capitalize relative z-10 text-shadow">{pokemon.name}</h3>
                    <p className="text-white opacity-90 relative z-10 text-shadow">{formattedId}</p>
                    <div className="flex justify-center gap-2 mt-2">
                      {pokemon.types?.map((type) => (
                        <span 
                          key={type} 
                          className="px-2 py-1 bg-white/20 rounded-full text-white text-xs capitalize"
                        >
                          {type}
                        </span>
                      ))}
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        </ErrorBoundary>
      )}
    </div>
  );
}
