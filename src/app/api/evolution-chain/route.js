import { NextResponse } from "next/server";

const API_BASE_URL = "https://pokeapi.co/api/v2";

function normalize(input) {
  if (!input) return "";
  return String(input)
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/_/g, '-')
    .replace(/[\.'’]/g, '')
    .replace(/♀/g, '-f')
    .replace(/♂/g, '-m')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function extractIdFromSpeciesUrl(url) {
  try {
    const parts = url.split("/").filter(Boolean);
    const idStr = parts[parts.length - 1];
    const id = Number(idStr);
    return Number.isFinite(id) ? id : null;
  } catch {
    return null;
  }
}

function flattenEvolutionChain(chainNode) {
  const result = [];
  function traverse(node, stage = 1) {
    if (!node) return;
    const species = node.species || {};
    const id = species.url ? extractIdFromSpeciesUrl(species.url) : null;
    result.push({ name: species.name, id, stage });
    const evolvesTo = node.evolves_to || [];
    for (const next of evolvesTo) {
      traverse(next, stage + 1);
    }
  }
  traverse(chainNode);
  return result;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  let nameOrId = normalize(searchParams.get("nameOrId"));
  if (!nameOrId) {
    return NextResponse.json({ error: "nameOrId required" }, { status: 400 });
  }

  try {
    // 1) Get species to find chain URL
    const speciesRes = await fetch(`${API_BASE_URL}/pokemon-species/${nameOrId}`, {
      next: { revalidate: 3600 },
    });
    if (!speciesRes.ok) {
      return NextResponse.json({ error: `Upstream error: ${speciesRes.status}` }, { status: speciesRes.status });
    }
    const species = await speciesRes.json();

    // 2) Get chain data
    const chainRes = await fetch(species.evolution_chain.url, { next: { revalidate: 3600 } });
    if (!chainRes.ok) {
      return NextResponse.json({ error: `Upstream error: ${chainRes.status}` }, { status: chainRes.status });
    }
    const chainData = await chainRes.json();
    const simplified = flattenEvolutionChain(chainData.chain);

    return NextResponse.json({ chain: simplified }, {
      headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=60" },
    });
  } catch (e) {
    return NextResponse.json({ error: "Failed to fetch evolution chain" }, { status: 500 });
  }
}

