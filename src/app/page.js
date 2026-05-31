"use client";

import { useState, useEffect, useRef, Suspense, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import BackgroundCarousel from "../components/BackgroundCarousel";
import PokemonSearch from "../components/PokemonSearch";
import PokemonCard from "../components/PokemonCard";
import PokemonList from "../components/PokemonList";
import ErrorBoundary from "../components/ErrorBoundary";
import ChooseYouOverlay from "../components/ChooseYouOverlay";
import FiltersSidebar from "../components/FiltersSidebar";
import { getPokemon } from "../services/pokemonService";

function Home() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [pokemon, setPokemon] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('search'); // 'search' or 'browse'
  const browseScrollYRef = useRef(0);
  const restoringRef = useRef(false);
  const [chooseText, setChooseText] = useState("");
  const [showChoose, setShowChoose] = useState(false);
  const [filters, setFilters] = useState({ types: [], generation: '', bstMin: undefined, bstMax: undefined, ability: '' });
  const [sort, setSort] = useState('number');
  const [drawerOpen, setDrawerOpen] = useState(false);

  const restoreBrowseScroll = () => {
    try {
      const targetId = typeof window !== 'undefined' ? sessionStorage.getItem('browseScrollTarget') : null;
      const savedYStr = typeof window !== 'undefined' ? sessionStorage.getItem('browseScrollY') : null;
      const savedY = savedYStr ? parseInt(savedYStr, 10) : 0;
      const doScroll = () => {
        if (targetId) {
          const el = document.getElementById(targetId);
          if (el) {
            el.scrollIntoView({ behavior: 'auto', block: 'center' });
            return true;
          }
        }
        if (!Number.isNaN(savedY) && savedY > 0) {
          window.scrollTo({ top: savedY, behavior: 'auto' });
          return true;
        }
        return false;
      };
      // Try multiple frames to ensure layout is ready
      let attempts = 0;
      const tick = () => {
        attempts += 1;
        const ok = doScroll();
        if (!ok && attempts < 5) {
          requestAnimationFrame(tick);
        } else {
          // cleanup
          sessionStorage.removeItem('browseScrollTarget');
          restoringRef.current = false;
        }
      };
      restoringRef.current = true;
      requestAnimationFrame(tick);
    } catch {
      restoringRef.current = false;
    }
  };

  const triggerSearch = useCallback((query) => {
    router.push(`/?pokemon=${encodeURIComponent(query)}`, { scroll: false });
  }, [router]);

  const handleSearch = useCallback(async (query) => {
    try {
      setIsLoading(true);
      setError(null);
      // Hide any previous card to avoid flashes and show quote overlay
      setPokemon(null);
      const rawName = String(query).trim();
      const capitalized = rawName.length > 0 ? rawName[0].toUpperCase() + rawName.slice(1) : rawName;
      setChooseText(`${capitalized}, I choose you!`);
      setShowChoose(true);

      // Start fetch immediately while also waiting a minimum overlay duration
      const fetchPromise = getPokemon(query);
      const delayPromise = new Promise((resolve) => setTimeout(resolve, 600));
      const [data] = await Promise.all([fetchPromise, delayPromise]);

      setPokemon(data);
      setActiveTab('search'); // Switch to search tab when searching
    } catch (err) {
      console.error('Error searching for Pokemon:', err);
      setError('Pokemon not found. Please check the name or ID and try again.');
      setPokemon(null);
    } finally {
      setIsLoading(false);
      // Hide the quote overlay when the card is ready
      setShowChoose(false);
    }
  }, []);

  // Check for pokemon parameter in URL on change
  useEffect(() => {
    if (isLoading) return; // Guard against concurrent updates and state cycles while loading
    const pokemonParam = searchParams.get('pokemon');
    if (pokemonParam) {
      // Only search if it's not already the loaded pokemon
      const isAlreadyLoaded = pokemon && (
        pokemon.name.toLowerCase() === pokemonParam.toLowerCase() ||
        String(pokemon.id) === pokemonParam
      );
      if (!isAlreadyLoaded) {
        handleSearch(pokemonParam);
      }
    } else {
      // No query: clear selection and return to browse
      setPokemon(null);
      setError(null);
      setActiveTab('browse');
      restoreBrowseScroll();
    }
  }, [searchParams, handleSearch, pokemon, isLoading]);

  const handleBack = () => {
    // Clear URL parameters by replacing history, cleanup is handled automatically by the useEffect
    router.replace('/', { scroll: false });
  };

  const handleSelectPokemon = (nameOrId) => {
    try {
      if (typeof window !== 'undefined') {
        browseScrollYRef.current = window.scrollY || 0;
        sessionStorage.setItem('browseScrollY', String(browseScrollYRef.current));
        sessionStorage.setItem('browseScrollTarget', `pokemon-${nameOrId}`);
      }
    } catch { }
    router.push(`/?pokemon=${encodeURIComponent(nameOrId)}`, { scroll: false });
  };

  return (
    <>
      <BackgroundCarousel />
      <div className="min-h-screen pt-20 pb-20">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-center mb-6">Welcome to the Pokédex</h1>
          <p className="text-center text-gray-700 font-medium mb-8">
            Explore the world of Pokémon, learn about your favorites, and discover new ones!
          </p>

          {/* Pokemon Search Component */}
          <ErrorBoundary>
            <PokemonSearch onSearch={triggerSearch} />
          </ErrorBoundary>

          {/* Tab Navigation */}
          <div className="flex justify-center mt-8 mb-6">
            <div className="flex rounded-lg overflow-hidden">
              <button
                className={`px-6 py-2 ${activeTab === 'search' ? 'bg-red-500 text-white font-semibold' : 'bg-gray-200 text-gray-900 font-medium'}`}
                onClick={() => setActiveTab('search')}
              >
                Search Results
              </button>
              <button
                className={`px-6 py-2 ${activeTab === 'browse' ? 'bg-red-500 text-white font-semibold' : 'bg-gray-200 text-gray-900 font-medium'}`}
                onClick={() => setActiveTab('browse')}
              >
                Browse All
              </button>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && activeTab === 'search' && (
            <div className="flex justify-center items-center py-12">
              {/* Inline import to avoid circular: use dynamic import-like pattern via component */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/poke10.png" alt="Loading" className="w-16 h-16 animate-pulse opacity-80" />
            </div>
          )}

          {/* Error Message */}
          {error && !isLoading && activeTab === 'search' && (
            <div className="text-center py-8">
              <p className="text-red-600 font-semibold">{error}</p>
              <p className="mt-2 text-gray-800 font-medium">Try searching for a Pokemon like &quot;pikachu&quot; or by ID number like &quot;25&quot;.</p>
            </div>
          )}

          {/* Search Tab Content (kept mounted) */}
          <div className={activeTab === 'search' ? '' : 'hidden'}>
            {/* Pokemon Card */}
            {pokemon && !isLoading && !showChoose && (
              <div className="py-8 animate-fade-in">
                <div className="flex justify-center items-center mb-4">
                  <button
                    onClick={handleBack}
                    className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-gray-800"
                    aria-label="Go back"
                  >
                    ← Back
                  </button>
                </div>
                <ErrorBoundary>
                  <PokemonCard pokemon={pokemon} />
                </ErrorBoundary>
              </div>
            )}

            {/* Initial State - No Search Yet */}
            {!pokemon && !error && !isLoading && (
              <div className="text-center py-12 backdrop-blur-md bg-white/30 rounded-xl shadow-lg">
                <h2 className="text-2xl font-semibold mb-4 text-shadow">Search for a Pokemon</h2>
                <p className="text-gray-800 font-medium mb-6">
                  Enter a Pokemon name (like &quot;Pikachu&quot;) or ID number (like &quot;25&quot;) in the search box above.
                </p>
                <div className="flex justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/eevee.png" alt="Eevee" className="w-32 h-32 object-contain opacity-70" />
                </div>
              </div>
            )}
          </div>

          {/* Browse Tab Content (kept mounted) */}
          <div className={`py-4 ${activeTab === 'browse' ? '' : 'hidden'}`}>
            <div className="lg:hidden mb-4">
              <button
                onClick={() => setDrawerOpen(true)}
                className="px-4 py-2 bg-red-500 text-white rounded-lg"
              >
                Filters
              </button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 items-start">
              <FiltersSidebar filters={filters} onChange={setFilters} sort={sort} onSortChange={setSort} />
              <div className="lg:ml-72">
                <ErrorBoundary>
                  <PokemonList onSelectPokemon={handleSelectPokemon} filters={filters} sort={sort} />
                </ErrorBoundary>
              </div>
            </div>
            {drawerOpen && (
              <div className="fixed inset-0 z-50">
                <div className="absolute inset-0 bg-black/40" onClick={() => setDrawerOpen(false)} />
                <div className="absolute left-0 top-0 h-full">
                  <FiltersSidebar
                    variant="drawer"
                    filters={filters}
                    onChange={setFilters}
                    sort={sort}
                    onSortChange={setSort}
                    onClose={() => setDrawerOpen(false)}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <ChooseYouOverlay show={showChoose} text={chooseText} />
    </>
  );
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <Home />
    </Suspense>
  );
}
