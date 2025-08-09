import { NextResponse } from "next/server";

const API_BASE_URL = "https://pokeapi.co/api/v2";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  let nameOrId = searchParams.get("nameOrId");
  if (nameOrId) {
    nameOrId = nameOrId
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

  if (!nameOrId) {
    return NextResponse.json(
      { error: "Missing query: nameOrId required" },
      { status: 400 }
    );
  }

  try {
    const upstreamUrl = `${API_BASE_URL}/pokemon-species/${String(nameOrId)
      .toLowerCase()
      .trim()}`;
    const res = await fetch(upstreamUrl, { next: { revalidate: 3600 } });
    if (!res.ok) {
      return NextResponse.json(
        { error: `Upstream error: ${res.status}` },
        { status: res.status }
      );
    }
    const data = await res.json();
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=60",
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch species from PokeAPI" },
      { status: 500 }
    );
  }
}

