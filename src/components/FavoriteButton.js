"use client";

import { useState, useEffect } from 'react';
import { FaStar, FaRegStar } from 'react-icons/fa';

const FavoriteButton = ({ pokemon }) => {
  const [isFavorite, setIsFavorite] = useState(false);

  // Check if this Pokemon is in favorites when component mounts or pokemon changes
  useEffect(() => {
    if (!pokemon) return;
    
    // Get favorites from localStorage
    const favorites = JSON.parse(localStorage.getItem('pokemonFavorites') || '[]');
    setIsFavorite(favorites.some(fav => fav.id === pokemon.id));
  }, [pokemon]);

  const toggleFavorite = () => {
    if (!pokemon) return;
    
    // Get current favorites
    const favorites = JSON.parse(localStorage.getItem('pokemonFavorites') || '[]');
    
    if (isFavorite) {
      // Remove from favorites
      const updatedFavorites = favorites.filter(fav => fav.id !== pokemon.id);
      localStorage.setItem('pokemonFavorites', JSON.stringify(updatedFavorites));
      setIsFavorite(false);
    } else {
      // Add to favorites - store minimal data to save space
      const pokemonData = {
        id: pokemon.id,
        name: pokemon.name,
        sprite: pokemon.sprite || pokemon.sprites?.other?.['official-artwork']?.front_default || 
                pokemon.sprites?.front_default,
        types: pokemon.types || (pokemon.types?.map ? pokemon.types.map(t => t.type.name) : [])
      };
      
      const updatedFavorites = [...favorites, pokemonData];
      localStorage.setItem('pokemonFavorites', JSON.stringify(updatedFavorites));
      setIsFavorite(true);
    }
  };

  if (!pokemon) return null;

  return (
    <button 
      onClick={toggleFavorite}
      className={`p-2 rounded-full transition-colors duration-200 ${isFavorite ? 'bg-yellow-400 text-white' : 'bg-white/20 text-white hover:bg-white/40'}`}
      aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
    >
      {isFavorite ? <FaStar className="text-lg text-white" /> : <FaRegStar className="text-lg text-white" />}
    </button>
  );
};

export default FavoriteButton;