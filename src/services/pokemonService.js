/**
 * Service for fetching Pokemon data from the PokeAPI
 */

// Base URL for local Next.js API routes (server-side cached)
const LOCAL_API_BASE = '/api';

function normalizeNameOrId(input) {
  if (input == null) return '';
  const raw = String(input).trim();
  // If purely numeric ID, return as-is
  if (/^\d+$/.test(raw)) return raw;
  return raw
    .toLowerCase()
    // Replace whitespace with hyphens
    .replace(/\s+/g, '-')
    // Replace underscores with hyphens
    .replace(/_/g, '-')
    // Remove apostrophes and periods
    .replace(/[\.'’]/g, '')
    // Map gender symbols
    .replace(/♀/g, '-f')
    .replace(/♂/g, '-m')
    // Collapse multiple hyphens
    .replace(/-+/g, '-')
    // Trim leading/trailing hyphens
    .replace(/^-+|-+$/g, '');
}

/**
 * Fetch a Pokemon by name or ID
 * @param {string|number} nameOrId - The name or ID of the Pokemon to fetch
 * @returns {Promise<Object>} - The Pokemon data
 */
export async function getPokemon(nameOrId) {
  if (!nameOrId) return null;
  
  try {
    const query = normalizeNameOrId(nameOrId);
    const response = await fetch(`${LOCAL_API_BASE}/pokemon?nameOrId=${encodeURIComponent(query)}`);
    
    if (!response.ok) {
      // If somehow the local route failed with non-OK, try Ditto as a client-side fallback
      if (response.status === 404) {
        const ditto = await fetch(`${LOCAL_API_BASE}/pokemon?nameOrId=ditto`);
        if (ditto.ok) return await ditto.json();
      }
      throw new Error(`Failed to fetch Pokemon: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching Pokemon:', error);
    throw error;
  }
}

/**
 * Fetch a list of Pokemon with pagination
 * @param {number} limit - The number of Pokemon to fetch
 * @param {number} offset - The offset for pagination
 * @returns {Promise<Object>} - The Pokemon list data
 */
export async function getPokemonList(limit = 20, offset = 0) {
  try {
    const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
    const response = await fetch(`${LOCAL_API_BASE}/pokemon?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch Pokemon list: ${response.status}`);
    }
    
    const list = await response.json();
    // Enrich results with species flags for special filters
    if (Array.isArray(list.results)) {
      const enrichedResults = await Promise.all(
        list.results.map(async (item) => {
          try {
            const res = await fetch(item.url);
            const p = await res.json();
            // fetch species to get legendary/mythical
            const speciesRes = await fetch(`${LOCAL_API_BASE}/pokemon-species?nameOrId=${encodeURIComponent(p.id)}`);
            const species = speciesRes.ok ? await speciesRes.json() : {};
            const tags = [];
            // Ultra beasts list (static minimal tag fallback)
            // For robustness, keep tags array extendable later
            return {
              ...item,
              details: p,
              is_legendary: Boolean(species.is_legendary),
              is_mythical: Boolean(species.is_mythical),
              tags,
            };
          } catch {
            return item;
          }
        })
      );
      return { ...list, results: enrichedResults };
    }
    return list;
  } catch (error) {
    console.error('Error fetching Pokemon list:', error);
    throw error;
  }
}

/**
 * Fetch detailed Pokemon species information
 * @param {string|number} nameOrId - The name or ID of the Pokemon species to fetch
 * @returns {Promise<Object>} - The Pokemon species data
 */
export async function getPokemonSpecies(nameOrId) {
  if (!nameOrId) return null;
  
  try {
    const query = normalizeNameOrId(nameOrId);
    const response = await fetch(`${LOCAL_API_BASE}/pokemon-species?nameOrId=${encodeURIComponent(query)}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch Pokemon species: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching Pokemon species:', error);
    throw error;
  }
}

/**
 * Fetch evolution chain for a given Pokemon species/name
 */
export async function getEvolutionChain(nameOrId) {
  const query = normalizeNameOrId(nameOrId);
  const res = await fetch(`${LOCAL_API_BASE}/evolution-chain?nameOrId=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error(`Failed to fetch evolution chain: ${res.status}`);
  return res.json();
}