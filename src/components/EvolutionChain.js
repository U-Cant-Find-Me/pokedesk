"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { getEvolutionChain } from "@/services/pokemonService";

export default function EvolutionChain({ name }) {
  const [chain, setChain] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const data = await getEvolutionChain(name);
        if (active) setChain(data.chain || []);
      } catch (e) {
        if (active) setError("Failed to load evolution chain");
      } finally {
        if (active) setLoading(false);
      }
    }
    if (name) load();
    return () => {
      active = false;
    };
  }, [name]);

  if (!name) return null;
  if (loading) return <div className="text-center text-gray-600">Loading evolution chain…</div>;
  if (error) return <div className="text-center text-red-600">{error}</div>;

  return (
    <div className="mt-6">
      <h3 className="text-white text-lg font-semibold mb-3">Evolution Chain</h3>
      <div className="flex flex-wrap items-center gap-3">
        {chain.map((node, idx) => {
          const sprite = node.id
            ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${node.id}.png`
            : null;
          return (
            <div key={`${node.name}-${idx}`} className="flex items-center gap-2">
              <Link href={`/?pokemon=${node.name}`} className="flex items-center gap-2">
                <div className="relative w-10 h-10">
                  {sprite ? (
                    <Image src={sprite} alt={node.name} fill className="object-contain" />
                  ) : (
                    <div className="w-10 h-10 bg-gray-200 rounded" />
                  )}
                </div>
                <span className="capitalize text-white">{node.name}</span>
              </Link>
              {idx < chain.length - 1 && <span className="text-white">→</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

