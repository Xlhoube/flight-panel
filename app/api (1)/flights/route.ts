import { NextRequest, NextResponse } from "next/server";

export interface FlightData {
  icao24: string;
  callsign: string;
  country: string;
  latitude: number | null;
  longitude: number | null;
  altitudeMeters: number | null;
  altitudeFeet: number | null;
  velocityKnots: number | null;
  velocityKmh: number | null;
  heading: number | null;
  distanceKm: number;
  verticalRate: number | null;
  onGround: boolean;
}

// Cache simples em memória para respeitar limites da OpenSky Network (anónimo)
interface CacheEntry {
  timestamp: number;
  data: FlightData[];
}

const memoryCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 12000; // 12 segundos

// Fórmula de Haversine para calcular a distância geodésica em km
function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Raio da Terra em km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const latStr = searchParams.get("lat");
  const lonStr = searchParams.get("lon");
  const radiusKm = parseFloat(searchParams.get("radius") || "20");

  // Fallback para coordenadas padrão (Aeroporto Humberto Delgado, Lisboa) se não fornecidas
  const userLat = latStr ? parseFloat(latStr) : 38.7742;
  const userLon = lonStr ? parseFloat(lonStr) : -9.1342;

  const cacheKey = `${userLat.toFixed(2)}_${userLon.toFixed(2)}_${radiusKm}`;
  const now = Date.now();

  const cached = memoryCache.get(cacheKey);
  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    return NextResponse.json({
      source: "cache",
      userCoordinates: { latitude: userLat, longitude: userLon },
      radiusKm,
      flights: cached.data,
      count: cached.data.length,
      updatedAt: new Date(cached.timestamp).toISOString(),
    });
  }

  // 1 grau de latitude ~= 111 km
  const deltaLat = radiusKm / 111;
  // 1 grau de longitude ~= 111 * cos(latitude)
  const deltaLon = radiusKm / (111 * Math.cos((userLat * Math.PI) / 180));

  const lamin = (userLat - deltaLat).toFixed(4);
  const lamax = (userLat + deltaLat).toFixed(4);
  const lomin = (userLon - deltaLon).toFixed(4);
  const lomax = (userLon + deltaLon).toFixed(4);

  const openSkyUrl = `https://opensky-network.org/api/states/all?lamin=${lamin}&lomin=${lomin}&lamax=${lamax}&lomax=${lomax}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6500);

    const response = await fetch(openSkyUrl, {
      headers: {
        Accept: "application/json",
        "User-Agent": "FlightPanel-AirportSolari/1.0",
      },
      signal: controller.signal,
      next: { revalidate: 10 },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      // Se a OpenSky devolver 429 (Rate Limit) ou outro erro, devolver cache anterior ou lista vazia sem rebentar a aplicação
      if (cached) {
        return NextResponse.json({
          source: "stale_cache",
          userCoordinates: { latitude: userLat, longitude: userLon },
          radiusKm,
          flights: cached.data,
          count: cached.data.length,
          updatedAt: new Date(cached.timestamp).toISOString(),
        });
      }
      return NextResponse.json({
        source: "api_fallback",
        userCoordinates: { latitude: userLat, longitude: userLon },
        radiusKm,
        flights: [],
        count: 0,
        warning: `OpenSky API status: ${response.status}`,
        updatedAt: new Date().toISOString(),
      });
    }

    const payload = await response.json();
    const states: unknown[][] = payload.states || [];

    const flights: FlightData[] = states
      .map((state) => {
        const icao24 = (state[0] as string) || "";
        const rawCallsign = (state[1] as string) || "";
        const callsign = rawCallsign.trim() || icao24.toUpperCase();
        const country = (state[2] as string) || "UNKNOWN";
        const lon = typeof state[5] === "number" ? state[5] : null;
        const lat = typeof state[6] === "number" ? state[6] : null;
        const altitudeMeters = typeof state[7] === "number" ? Math.round(state[7]) : null;
        const altitudeFeet = altitudeMeters !== null ? Math.round(altitudeMeters * 3.28084) : null;
        const onGround = Boolean(state[8]);
        const velocityMs = typeof state[9] === "number" ? state[9] : null;
        const velocityKnots = velocityMs !== null ? Math.round(velocityMs * 1.94384) : null;
        const velocityKmh = velocityMs !== null ? Math.round(velocityMs * 3.6) : null;
        const heading = typeof state[10] === "number" ? Math.round(state[10]) : null;
        const verticalRate = typeof state[11] === "number" ? Math.round(state[11] * 10) / 10 : null;

        const distance =
          lat !== null && lon !== null
            ? calculateDistanceKm(userLat, userLon, lat, lon)
            : 999;

        return {
          icao24,
          callsign,
          country,
          latitude: lat,
          longitude: lon,
          altitudeMeters,
          altitudeFeet,
          velocityKnots,
          velocityKmh,
          heading,
          distanceKm: distance,
          verticalRate,
          onGround,
        };
      })
      .filter((f) => f.distanceKm <= radiusKm)
      .sort((a, b) => a.distanceKm - b.distanceKm);

    memoryCache.set(cacheKey, {
      timestamp: now,
      data: flights,
    });

    return NextResponse.json({
      source: "live",
      userCoordinates: { latitude: userLat, longitude: userLon },
      radiusKm,
      flights,
      count: flights.length,
      updatedAt: new Date(now).toISOString(),
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Erro desconhecido";
    if (cached) {
      return NextResponse.json({
        source: "stale_cache_error",
        userCoordinates: { latitude: userLat, longitude: userLon },
        radiusKm,
        flights: cached.data,
        count: cached.data.length,
        updatedAt: new Date(cached.timestamp).toISOString(),
      });
    }

    return NextResponse.json({
      source: "error",
      userCoordinates: { latitude: userLat, longitude: userLon },
      radiusKm,
      flights: [],
      count: 0,
      error: errorMsg,
      updatedAt: new Date().toISOString(),
    });
  }
}
