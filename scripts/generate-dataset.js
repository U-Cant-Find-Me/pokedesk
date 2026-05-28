/**
 * Script to pre-compile the entire Pokédex dataset (1 to 1025)
 * into a single compact JSON file for sub-millisecond client-side filtering.
 */

const fs = require('fs');
const path = require('path');

const POKEAPI_BASE = 'https://pokeapi.co/api/v2';
const TOTAL_POKEMON = 1025; // Gen 1 to Gen 9

// Pre-defined sets for special categories based on official lists
const PSEUDO_SET = new Set([
  'dragonite', 'tyranitar', 'salamence', 'metagross', 'garchomp', 'hydreigon', 'goodra', 'dragapult', 'baxcalibur'
]);

const FOSSIL_SET = new Set([
  'omanyte', 'omastar', 'kabuto', 'kabutops', 'aerodactyl', 'anorith', 'armaldo', 'lileep', 'cradily',
  'cranidos', 'rampardos', 'shieldon', 'bastiodon', 'tirtouga', 'carracosta', 'archen', 'archeops',
  'tyrunt', 'tyrantrum', 'amaura', 'aurorus', 'dracozolt', 'arctozolt', 'dracovish', 'arctovish'
]);

const MYTHICAL_SET = new Set([
  'mew', 'celebi', 'jirachi', 'deoxys', 'phione', 'manaphy', 'darkrai', 'shaymin', 'arceus', 'victini',
  'keldeo', 'meloetta', 'genesect', 'diancie', 'hoopa', 'volcanion', 'magearna', 'marshadow', 'zeraora',
  'meltan', 'melmetal', 'zarude', 'pecharunt'
]);

const ULTRA_BEAST_SET = new Set([
  'nihilego', 'buzzwole', 'pheromosa', 'xurkitree', 'celesteela', 'kartana', 'guzzlord', 'poipole',
  'naganadel', 'stakataka', 'blacephalon'
]);

const PARADOX_SET = new Set([
  'great-tusk', 'scream-tail', 'brute-bonnet', 'flutter-mane', 'slither-wing', 'sandy-shocks', 'iron-treads',
  'iron-bundle', 'iron-hands', 'iron-jugulis', 'iron-moth', 'iron-thorns', 'roaring-moon', 'iron-valiant',
  'walking-wake', 'iron-leaves', 'gouging-fire', 'raging-bolt', 'iron-boulder', 'iron-crown', 'pecharunt'
]);

const LEGENDARY_SET = new Set([
  'mewtwo', 'lugia', 'ho-oh', 'regirock', 'regice', 'registeel', 'latias', 'latios', 'kyogre', 'groudon',
  'rayquaza', 'uxie', 'mesprit', 'azelf', 'dialga', 'palkia', 'heatran', 'regigigas', 'giratina', 'cresselia',
  'cobalion', 'terrakion', 'virizion', 'tornadus', 'thundurus', 'reshiram', 'zekrom', 'landorus', 'kyurem',
  'xerneas', 'yveltal', 'zygarde', 'type-null', 'silvally', 'tapu-koko', 'tapu-lele', 'tapu-bulu', 'tapu-fini',
  'cosmog', 'cosmoem', 'solgaleo', 'lunala', 'necrozma', 'zacian', 'zamazenta', 'eternatus', 'kubfu', 'urshifu',
  'regieleki', 'regidrago', 'glastrier', 'spectrier', 'calyrex', 'enamorus', 'ting-lu', 'chien-pao', 'wo-chien',
  'chi-yu', 'koraidon', 'miraidon', 'okidogi', 'munkidori', 'fezandipiti', 'ogerpon', 'terapagos'
]);

function getGeneration(id) {
  if (id >= 1 && id <= 151) return 1;
  if (id >= 152 && id <= 251) return 2;
  if (id >= 252 && id <= 386) return 3;
  if (id >= 387 && id <= 493) return 4;
  if (id >= 494 && id <= 649) return 5;
  if (id >= 650 && id <= 721) return 6;
  if (id >= 722 && id <= 809) return 7;
  if (id >= 810 && id <= 905) return 8;
  if (id >= 906 && id <= 1025) return 9;
  return 9;
}

async function fetchPokemonBatch(startIndex, endIndex) {
  const promises = [];
  for (let i = startIndex; i <= endIndex; i++) {
    const url = `${POKEAPI_BASE}/pokemon/${i}`;
    promises.push(
      fetch(url)
        .then(async (res) => {
          if (!res.ok) throw new Error(`Failed to fetch ID ${i}`);
          const p = await res.json();
          
          // Extract stats helper
          const statsMap = {};
          p.stats.forEach((s) => {
            const name = s.stat.name;
            let key = name;
            if (name === 'special-attack') key = 'spAtk';
            else if (name === 'special-defense') key = 'spDef';
            statsMap[key] = s.base_stat;
          });
          
          const bst = p.stats.reduce((sum, s) => sum + s.base_stat, 0);

          const name = p.name.toLowerCase();

          return {
            id: p.id,
            name: p.name,
            types: p.types.map((t) => t.type.name),
            sprite: p.sprites?.other?.['official-artwork']?.front_default || p.sprites?.front_default || '',
            abilities: p.abilities.map((a) => a.ability.name),
            stats: {
              hp: statsMap.hp || 0,
              attack: statsMap.attack || 0,
              defense: statsMap.defense || 0,
              spAtk: statsMap.spAtk || 0,
              spDef: statsMap.spDef || 0,
              speed: statsMap.speed || 0,
              bst
            },
            generation: getGeneration(p.id),
            is_legendary: LEGENDARY_SET.has(name),
            is_mythical: MYTHICAL_SET.has(name),
            is_fossil: FOSSIL_SET.has(name),
            is_pseudo: PSEUDO_SET.has(name),
            is_ultra: ULTRA_BEAST_SET.has(name),
            is_paradox: PARADOX_SET.has(name)
          };
        })
        .catch((err) => {
          console.error(`Error on ID ${i}:`, err.message);
          return null;
        })
    );
  }
  return Promise.all(promises);
}

async function run() {
  console.log(`Starting Pokédex Offline Dataset generation (1 to ${TOTAL_POKEMON})...`);
  const results = [];
  const BATCH_SIZE = 50;

  for (let i = 1; i <= TOTAL_POKEMON; i += BATCH_SIZE) {
    const end = Math.min(i + BATCH_SIZE - 1, TOTAL_POKEMON);
    console.log(`Fetching batch ${i} to ${end}...`);
    const batchResults = await fetchPokemonBatch(i, end);
    results.push(...batchResults.filter(Boolean));
    // Brief sleep to avoid hitting server rate limits too aggressively
    await new Promise((resolve) => setTimeout(resolve, 300));
  }

  // Ensure sorting by ID
  results.sort((a, b) => a.id - b.id);

  console.log(`Successfully compiled ${results.length} Pokémon!`);

  const dir = path.join(__dirname, '../src/data');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const outputPath = path.join(dir, 'pokemon-dataset.json');
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2), 'utf-8');
  console.log(`Saved dataset to: ${outputPath} (${(fs.statSync(outputPath).size / 1024).toFixed(1)} KB)`);
}

run();
