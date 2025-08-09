"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { getPokemonList } from '../services/pokemonService';
import FavoriteButton from './FavoriteButton';
import PokeLoader from './PokeLoader';

export default function PokemonList({ onSelectPokemon, filters = {}, sort = 'number' }) {
  const [pokemonList, setPokemonList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef(null);
  const sentinelRef = useRef(null);
  const loadingMoreRef = useRef(false);
  const limit = 12; // Number of Pokemon to load per batch

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

  // Special category name sets (lowercase)
  const PSEUDO_SET = useRef(new Set([
    'dragonite','tyranitar','salamence','metagross','garchomp','hydreigon','goodra'
  ])).current;
  const FOSSIL_SET = useRef(new Set([
    'omanyte','omastar','kabuto','kabutops','aerodactyl','anorith','armaldo','lileep','cradily',
    'cranidos','rampardos','shieldon','bastiodon','tirtouga','carracosta',
    'arctozolt','arctovish','dracozolt','dracovish'
  ])).current;
  const LEGENDARY_SET = useRef(new Set([
    'mewtwo','lugia','ho-oh','groudon','kyogre','rayquaza','dialga','palkia','giratina','reshiram','zekrom','kyurem','xerneas','yveltal','zygarde','cosmog','cosmoem','solgaleo','lunala','necrozma','zacian','zamazenta','eternatus','koraidon','miraidon'
  ])).current;
  const MYTHICAL_SET = useRef(new Set([
    'mew','celebi','jirachi','deoxys','phione','manaphy','darkrai','shaymin','arceus','victini','keldeo','meloetta','genesect','diancie','hoopa','volcanion','magearna','marshadow','zeraora','meltan','melmetal','zarude'
  ])).current;

  // Setup a single sentinel observer for infinite scrolling
  const setupObserver = useCallback(() => {
    if (!sentinelRef.current) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (
          entry.isIntersecting &&
          hasMore &&
          !isLoading &&
          !loadingMoreRef.current
        ) {
          loadingMoreRef.current = true;
          setOffset((prev) => prev + limit);
        }
      },
      {
        root: null,
        rootMargin: '1000px 0px', // start loading earlier for smoothness
        threshold: 0,
      }
    );
    observer.current.observe(sentinelRef.current);
  }, [hasMore, isLoading]);

  // Load Pokemon list on component mount or when offset changes
  useEffect(() => {
    loadPokemonList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offset]);

  // Initialize sentinel observer once
  useEffect(() => {
    setupObserver();
    return () => {
      if (observer.current) observer.current.disconnect();
    };
  }, [setupObserver]);

  // Re-attach observer when list grows so the sentinel is present
  useEffect(() => {
    if (!hasMore) return;
    if (!sentinelRef.current) return;
    if (!observer.current) {
      setupObserver();
      return;
    }
    observer.current.disconnect();
    observer.current.observe(sentinelRef.current);
  }, [pokemonList.length, hasMore, setupObserver]);
  
  // Function to load Pokemon list with details
  const loadPokemonList = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Get basic Pokemon list
      const data = await getPokemonList(limit, offset);
      
      // If no results at all, stop
      if (!data.results || data.results.length === 0) {
        setHasMore(false);
        return;
      }
      
      // Fetch details for each Pokemon
      const detailedList = await Promise.all(
        data.results.map(async (pokemon) => {
          try {
            const response = await fetch(pokemon.url);
            if (!response.ok) throw new Error(`Failed to fetch ${pokemon.name}`);
            const detail = await response.json();
            // Fetch species for legendary/mythical flags
            let isLegendary = false;
            let isMythical = false;
            try {
              const speciesRes = await fetch(detail.species?.url || `https://pokeapi.co/api/v2/pokemon-species/${detail.id}`);
              if (speciesRes.ok) {
                const species = await speciesRes.json();
                isLegendary = Boolean(species.is_legendary) || LEGENDARY_SET.has(detail.name);
                isMythical = Boolean(species.is_mythical) || MYTHICAL_SET.has(detail.name);
              }
            } catch {}
            const tags = [];
            if (FOSSIL_SET.has(detail.name)) tags.push('fossil');
            if (PSEUDO_SET.has(detail.name)) tags.push('pseudo-legendary');
            return { ...detail, is_legendary: isLegendary, is_mythical: isMythical, tags };
          } catch (e) {
            return null;
          }
        })
      ).then(list => list.filter(Boolean));
      
      // Append new Pokemon to the existing list
      setPokemonList(prevList => offset === 0 ? detailedList : [...prevList, ...detailedList]);
      // Determine if there are more pages
      setHasMore(Boolean(data.next));
    } catch (err) {
      console.error('Error loading Pokemon list:', err);
      setError('Failed to load Pokemon list. Please try again.');
    } finally {
      setIsLoading(false);
      loadingMoreRef.current = false;
    }
  };

  // Function to reset the list and load from the beginning
  const resetList = () => {
    setPokemonList([]);
    setOffset(0);
    setHasMore(true);
  };

  // Derived filtered/sorted list
  const computeTotal = (p) => (p.stats || []).reduce((sum, s) => sum + (s.base_stat || 0), 0);
  const passesType = (p) => {
    const selected = new Set(filters.types || []);
    if (selected.size === 0) return true;
    const types = (p.types || []).map((t) => t.type.name);
    for (const t of selected) {
      if (!types.includes(t)) return false;
    }
    return true;
  };
  const passesGen = (p) => {
    if (!filters.generation) return true;
    const id = p.id || 0;
    const g = Number(filters.generation);
    // rough id ranges per generation (main dex)
    const ranges = {
      1: [1, 151], 2: [152, 251], 3: [252, 386], 4: [387, 493],
      5: [494, 649], 6: [650, 721], 7: [722, 809], 8: [810, 905], 9: [906, 1025]
    };
    const r = ranges[g];
    if (!r) return true;
    return id >= r[0] && id <= r[1];
  };
  const passesBST = (p) => {
    const total = computeTotal(p);
    if (filters.bstMin != null && total < filters.bstMin) return false;
    if (filters.bstMax != null && total > filters.bstMax) return false;
    return true;
  };
  const passesAbility = (p) => {
    const q = (filters.ability || '').trim().toLowerCase();
    if (!q) return true;
    const abilities = (p.abilities || []).map((a) => a.ability?.name?.toLowerCase?.() || '');
    return abilities.some((a) => a.includes(q));
  };
  // Special categories helpers
  const isLegendary = (p) => Boolean(p.is_legendary);
  const isMythical = (p) => Boolean(p.is_mythical);
  const isUltraBeast = (p) => (p.tags || []).includes('ultra-beast');
  const isFossil = (p) => (p.tags || []).includes('fossil');
  const isParadox = (p) => (p.tags || []).includes('paradox');
  const isPseudo = (p) => (p.tags || []).includes('pseudo-legendary');

  const passesSpecial = (p) => {
    const sel = new Set(filters.special || []);
    if (sel.size === 0) return true;
    for (const key of sel) {
      if (key === 'legendary' && !isLegendary(p)) return false;
      if (key === 'mythical' && !isMythical(p)) return false;
      if (key === 'ultra' && !isUltraBeast(p)) return false;
      if (key === 'fossil' && !isFossil(p)) return false;
      if (key === 'paradox' && !isParadox(p)) return false;
      if (key === 'pseudo' && !isPseudo(p)) return false;
    }
    return true;
  };

  const filtered = pokemonList.filter((p) => passesType(p) && passesGen(p) && passesBST(p) && passesAbility(p) && passesSpecial(p));
  const sorted = [...filtered].sort((a, b) => {
    switch (sort) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'total':
        return computeTotal(b) - computeTotal(a);
      case 'attack': {
        const av = (a.stats || []).find((s) => s.stat.name === 'attack')?.base_stat || 0;
        const bv = (b.stats || []).find((s) => s.stat.name === 'attack')?.base_stat || 0;
        return bv - av;
      }
      case 'speed': {
        const av = (a.stats || []).find((s) => s.stat.name === 'speed')?.base_stat || 0;
        const bv = (b.stats || []).find((s) => s.stat.name === 'speed')?.base_stat || 0;
        return bv - av;
      }
      case 'number':
      default:
        return (a.id || 0) - (b.id || 0);
    }
  });

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold mb-6 text-center">Browse Pokémon</h2>
      
      {pokemonList.length === 0 && isLoading ? (
        <div className="flex justify-center items-center py-12">
          <PokeLoader size={80} label="Loading Pokémon..." />
        </div>
      ) : (
        <>
          {error && (
            <div className="text-center py-4">
              <p className="text-red-500">{error}</p>
              <button
                onClick={loadPokemonList}
                className="mt-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Try Again
              </button>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {sorted.map((pokemon) => {
              // Get main type for background color
              const mainType = pokemon.types[0]?.type?.name || 'normal';
              const bgColor = typeColors[mainType] || 'bg-gray-400';
              
              // Format ID with leading zeros
              const formattedId = `#${String(pokemon.id).padStart(3, '0')}`;
              
              // Get sprite URL
              const spriteUrl = pokemon.sprites?.other?.['official-artwork']?.front_default || 
                              pokemon.sprites?.front_default || 
                              '/eevee.png';
              
              // Create simplified Pokemon object for favorites
              const simplifiedPokemon = {
                id: pokemon.id,
                name: pokemon.name,
                sprite: spriteUrl,
                types: pokemon.types.map(t => t.type.name)
              };
              
              return (
                <div 
                  key={pokemon.id} 
                  id={`pokemon-${pokemon.name}`}
                  className={`${bgColor} rounded-lg shadow-md overflow-hidden relative`}
                >
                  {/* Add a semi-transparent overlay for better text contrast */}
                  <div className="absolute inset-0 bg-black/10 rounded-lg pointer-events-none"></div>
                  <div className="absolute top-2 right-2 z-10">
                    <FavoriteButton pokemon={simplifiedPokemon} />
                  </div>
                  
                  <div 
                    className="p-4 text-center cursor-pointer transform transition-transform hover:scale-105"
                    onClick={() => onSelectPokemon(pokemon.name)}
                  >
                    <div className="relative w-full h-32 mx-auto">
                      <Image 
                        src={spriteUrl} 
                        alt={pokemon.name}
                        fill
                        className="object-contain"
                      />
                    </div>
                    <h3 className="text-xl font-semibold mt-2 text-white capitalize relative z-10 text-shadow">{pokemon.name}</h3>
                    <p className="text-white opacity-90 relative z-10 text-shadow">{formattedId}</p>
                    <div className="flex justify-center gap-2 mt-2">
                      {pokemon.types.map(({ type }) => (
                        <span 
                          key={type.name} 
                          className="px-2 py-1 bg-white/20 rounded-full text-white text-xs capitalize"
                        >
                          {type.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {/* Sentinel for infinite scroll */}
          <div ref={sentinelRef} className="h-10" />
          
          {/* Loading indicator at the bottom */}
          {isLoading && pokemonList.length > 0 && (
            <div className="flex justify-center items-center py-8">
              <PokeLoader size={56} label="Fetching more..." />
            </div>
          )}
          
          {/* No more Pokemon message */}
          {!hasMore && pokemonList.length > 0 && (
            <div className="text-center py-8 text-gray-600">
              <p>You&apos;ve reached the end of the Pokédex!</p>
              <button 
                onClick={resetList} 
                className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
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