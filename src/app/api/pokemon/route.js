import { NextResponse } from "next/server";

const API_BASE_URL = "https://pokeapi.co/api/v2";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  let nameOrId = searchParams.get("nameOrId");
  // Normalize minimal for server safety (client also normalizes)
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
  const limit = searchParams.get("limit");
  const offset = searchParams.get("offset");

  try {
    let upstreamUrl;

    if (nameOrId) {
      upstreamUrl = `${API_BASE_URL}/pokemon/${String(nameOrId)
        .toLowerCase()
        .trim()}`;
    } else if (limit || offset) {
      const params = new URLSearchParams();
      if (limit) params.set("limit", limit);
      if (offset) params.set("offset", offset);
      upstreamUrl = `${API_BASE_URL}/pokemon?${params.toString()}`;
    } else {
      return NextResponse.json(
        { error: "Missing query: nameOrId or limit/offset required" },
        { status: 400 }
      );
    }

    const res = await fetch(upstreamUrl, { next: { revalidate: 3600 } });
    let data;
    if (!res.ok) {
      // Fallback to Ditto when a specific pokemon is not found
      if (res.status === 404 && nameOrId) {
        const dittoRes = await fetch(`${API_BASE_URL}/pokemon/ditto`, {
          next: { revalidate: 3600 },
        });
        data = await dittoRes.json();
      } else {
        return NextResponse.json(
          { error: `Upstream error: ${res.status}` },
          { status: res.status }
        );
      }
    } else {
      data = await res.json();
    }
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=60",
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch from PokeAPI" },
      { status: 500 }
    );
  }
}

