"use client";

import { useState } from "react";

const POKEMON_TYPES = [
  "normal","fire","water","electric","grass","ice","fighting","poison","ground","flying","psychic","bug","rock","ghost","dragon","dark","steel","fairy"
];

const TYPE_TEXT_COLOR = {
  normal: 'text-gray-500',
  fire: 'text-orange-500',
  water: 'text-blue-500',
  electric: 'text-yellow-500',
  grass: 'text-green-600',
  ice: 'text-cyan-500',
  fighting: 'text-red-700',
  poison: 'text-purple-500',
  ground: 'text-amber-700',
  flying: 'text-indigo-400',
  psychic: 'text-pink-500',
  bug: 'text-lime-600',
  rock: 'text-yellow-800',
  ghost: 'text-purple-700',
  dragon: 'text-indigo-600',
  dark: 'text-gray-800',
  steel: 'text-gray-500',
  fairy: 'text-pink-400',
};

function StatRangeInput({ label, min, max, valueMin, valueMax, onChange }) {
  return (
    <div>
      <div className="text-sm font-medium text-gray-800 dark:text-gray-100 mb-1">{label}</div>
      <div className="flex gap-2 items-center">
        <input type="number" className="w-24 px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
          min={min} max={max} value={valueMin ?? ''} placeholder="min" onChange={(e)=>onChange({ min: e.target.value ? Number(e.target.value) : undefined, max: valueMax })} />
        <span className="text-gray-600 dark:text-gray-300">to</span>
        <input type="number" className="w-24 px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
          min={min} max={max} value={valueMax ?? ''} placeholder="max" onChange={(e)=>onChange({ min: valueMin, max: e.target.value ? Number(e.target.value) : undefined })} />
      </div>
    </div>
  );
}

export default function FiltersSidebar({
  filters,
  onChange,
  sort,
  onSortChange,
  variant = 'panel', // 'panel' | 'drawer'
  onClose,
}) {
  const [open, setOpen] = useState(true);

  const toggleType = (type) => {
    const next = new Set(filters.types || []);
    if (next.has(type)) next.delete(type); else next.add(type);
    onChange({ ...filters, types: Array.from(next) });
  };

  const handleGenChange = (e) => onChange({ ...filters, generation: e.target.value });
  const handleAbilityChange = (e) => onChange({ ...filters, ability: e.target.value });
  const handleBstChange = ({ min, max }) => onChange({ ...filters, bstMin: min, bstMax: max });
  const toggleSpecial = (key) => {
    const next = new Set(filters.special || []);
    if (next.has(key)) next.delete(key); else next.add(key);
    onChange({ ...filters, special: Array.from(next) });
  };

  const isDrawer = variant === 'drawer';
  const containerClasses = isDrawer
    ? 'w-80 max-w-[85vw] h-screen overflow-y-auto bg-white dark:bg-gray-900 p-4'
    : 'hidden lg:block lg:fixed lg:left-0 lg:top-[56px] lg:z-40 lg:w-64 lg:h-[calc(100vh-56px)] lg:max-h-[calc(100vh-56px)] lg:overflow-y-auto bg-white/70 dark:bg-gray-900/70 backdrop-blur rounded-lg border border-gray-200 dark:border-gray-700 p-4';

  return (
    <aside className={containerClasses}>
      {isDrawer && (
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Filters</h3>
          <button onClick={onClose} className="px-2 py-1 rounded bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100">Close</button>
        </div>
      )}
      <div>
        <div className="mb-4">
          <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">Sort</div>
          <select className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            value={sort}
            onChange={(e)=>onSortChange(e.target.value)}
          >
            <option value="number">Number (asc)</option>
            <option value="name">Name (A-Z)</option>
            <option value="total">Total Stats (desc)</option>
            <option value="attack">Attack (desc)</option>
            <option value="speed">Speed (desc)</option>
          </select>
        </div>

        <div className="mb-4">
          <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">Type</div>
          <div className="grid grid-cols-2 gap-2">
            {POKEMON_TYPES.map((t)=> {
              const selected = (filters.types||[]).includes(t);
              const colorClass = selected ? (TYPE_TEXT_COLOR[t] || 'text-gray-800') : 'text-gray-800 dark:text-gray-100';
              return (
                <label key={t} className="flex items-center gap-2 text-sm capitalize cursor-pointer select-none">
                  <input type="checkbox" className="accent-red-500" checked={selected} onChange={()=>toggleType(t)} />
                  <span className={`${colorClass}`}>{t}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="mb-4">
          <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">Special</div>
          <div className="grid grid-cols-1 gap-2">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={(filters.special||[]).includes('legendary')} onChange={()=>toggleSpecial('legendary')} />
              <span className="text-gray-800 dark:text-gray-100">Legendary</span>
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={(filters.special||[]).includes('mythical')} onChange={()=>toggleSpecial('mythical')} />
              <span className="text-gray-800 dark:text-gray-100">Mythical</span>
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={(filters.special||[]).includes('fossil')} onChange={()=>toggleSpecial('fossil')} />
              <span className="text-gray-800 dark:text-gray-100">Fossils</span>
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={(filters.special||[]).includes('pseudo')} onChange={()=>toggleSpecial('pseudo')} />
              <span className="text-gray-800 dark:text-gray-100">Pseudo-Legendary</span>
            </label>
          </div>
        </div>

        <div className="mb-4">
          <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">Generation</div>
          <select className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            value={filters.generation || ''}
            onChange={handleGenChange}
          >
            <option value="">All</option>
            <option value="1">Gen 1 (Kanto)</option>
            <option value="2">Gen 2 (Johto)</option>
            <option value="3">Gen 3 (Hoenn)</option>
            <option value="4">Gen 4 (Sinnoh)</option>
            <option value="5">Gen 5 (Unova)</option>
            <option value="6">Gen 6 (Kalos)</option>
            <option value="7">Gen 7 (Alola)</option>
            <option value="8">Gen 8 (Galar)</option>
            <option value="9">Gen 9 (Paldea)</option>
          </select>
        </div>

        <div className="mb-4">
          <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">Base Stat Total</div>
          <StatRangeInput label="BST" min={100} max={800} valueMin={filters.bstMin} valueMax={filters.bstMax} onChange={handleBstChange} />
        </div>

        <div className="mb-1">
          <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">Ability contains</div>
          <input
            value={filters.ability || ''}
            onChange={handleAbilityChange}
            placeholder="e.g., blaze"
            className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
        </div>
      </div>
    </aside>
  );
}

