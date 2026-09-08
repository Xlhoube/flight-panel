import { NextRequest, NextResponse } from "next/server";

export interface RotaAdsb {
  origem: string;
  origemCode: string;
  destino: string;
  destinoCode: string;
  airline?: string;
  callsignIata?: string;
  callsignIcao?: string;
}

const TRADUCOES_CIDADES: Record<string, string> = {
  GENEVA: "GENEBRA",
  ZURICH: "ZURIQUE",
  LONDON: "LONDRES",
  AMSTERDAM: "AMSTERDAO",
  BRUSSELS: "BRUXELAS",
  VIENNA: "VIENA",
  WARSAW: "VARSOVIA",
  ROME: "ROMA",
  MILAN: "MILAO",
  MUNICH: "MUNIQUE",
  LISBON: "LISBOA",
  FRANKFURT: "FRANKFURT",
  MADRID: "MADRID",
  PARIS: "PARIS",
  BARCELONA: "BARCELONA",
  DUBLIN: "DUBLIN",
};

const cacheRotasMemoria: Map<string, { rota: RotaAdsb | null; expiraEm: number }> = new Map();

async function obterRotaPorCallsign(callsign: string): Promise<RotaAdsb | null> {
  const cs = callsign.trim().toUpperCase();
  if (!cs || cs.length < 3) return null;

  const agora = Date.now();
  const cached = cacheRotasMemoria.get(cs);
  if (cached && cached.expiraEm > agora) {
    return cached.rota;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(`https://api.adsbdb.com/v0/callsign/${encodeURIComponent(cs)}`, {
      signal: controller.signal,
      headers: { "User-Agent": "FlightPanel/1.2 (Next.js Aviation Display)" },
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      const r = data.response?.flightroute;
      if (r && r.origin && r.destination) {
        const rawOrigem = (r.origin.municipality || r.origin.name || "PORTO").toUpperCase();
        const rawDestino = (r.destination.municipality || r.destination.name || "DESTINO").toUpperCase();

        const rota: RotaAdsb = {
          origem: TRADUCOES_CIDADES[rawOrigem] || rawOrigem,
          origemCode: r.origin.iata_code || "OPO",
          destino: TRADUCOES_CIDADES[rawDestino] || rawDestino,
          destinoCode: r.destination.iata_code || "DES",
          airline: r.airline?.name,
          callsignIata: r.callsign_iata,
          callsignIcao: r.callsign_icao,
        };
        cacheRotasMemoria.set(cs, { rota, expiraEm: agora + 3600_000 });
        return rota;
      }
    }
  } catch {
    // Falha silenciosa
  }

  cacheRotasMemoria.set(cs, { rota: null, expiraEm: agora + 300_000 });
  return null;
}

// Cache de resiliência em memória
let cacheMemoriaVoos: {
  timestamp: number;
  estados: any[];
  rotas: Record<string, RotaAdsb>;
} = {
  timestamp: 0,
  estados: [],
  rotas: {},
};

// Conversão de dados do feed aberto ADS-B (adsb.fi) para o formato padrão EstadoVoo
function converterAdsbParaEstado(ac: any): any[] {
  const callsign = (ac.flight || ac.r || ac.hex || "").trim().toUpperCase();
  const altMetros =
    ac.alt_baro === "ground"
      ? null
      : typeof ac.alt_baro === "number"
      ? Math.round(ac.alt_baro * 0.3048)
      : null;
  const noSolo = ac.alt_baro === "ground";
  const velMs = typeof ac.gs === "number" ? Math.round(ac.gs * 0.514444) : null;
  const rumo = typeof ac.track === "number" ? Math.round(ac.track) : null;
  const vertRate = typeof ac.baro_rate === "number" ? Math.round(ac.baro_rate * 0.00508) : null;

  // Formato compatível com OpenSky:
  // 0: hex, 1: callsign, 2: country/reg, 3: time, 4: contact, 5: lon, 6: lat, 7: alt_m, 8: on_ground, 9: vel_ms, 10: track, 11: vert_rate, 12: desc, 13: geo_alt, 14: squawk, 15: spi, 16: source
  return [
    ac.hex || "000000",
    callsign,
    ac.r || "PORTUGAL",
    null,
    Date.now() / 1000,
    ac.lon,
    ac.lat,
    altMetros,
    noSolo,
    velMs,
    rumo,
    vertRate,
    ac.desc || ac.t || null, // Guardar descrição da aeronave
    null,
    ac.squawk || null,
    false,
    0,
  ];
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const latParam = searchParams.get("lat");
    const lonParam = searchParams.get("lon");
    const radiusParam = searchParams.get("radius");

    const lat = latParam ? parseFloat(latParam) : parseFloat(process.env.NEXT_PUBLIC_DEFAULT_LATITUDE || "41.15");
    const lon = lonParam ? parseFloat(lonParam) : parseFloat(process.env.NEXT_PUBLIC_DEFAULT_LONGITUDE || "-8.62");
    const radiusKm = radiusParam ? Math.max(10, Math.min(120, parseFloat(radiusParam))) : 20;

    let estados: any[] = [];
    let fonte = "";

    // 1. Tentar ADSB.fi (Feed aberto em tempo real de altíssima fidelidade e sem bloqueios)
    try {
      const distNm = Math.round(radiusKm * 0.539957);
      const adsbUrl = `https://opendata.adsb.fi/api/v2/lat/${lat}/lon/${lon}/dist/${distNm}`;
      const resAdsb = await fetch(adsbUrl, {
        headers: { "User-Agent": "FlightPanel/1.2 (Next.js Aviation Display)" },
        cache: "no-store",
      });

      if (resAdsb.ok) {
        const dadosAdsb = await resAdsb.json();
        const listaAc = (dadosAdsb.aircraft || []).filter(
          (a: any) => a.lat != null && a.lon != null
        );

        if (listaAc.length > 0) {
          estados = listaAc.map(converterAdsbParaEstado);
          fonte = "adsb.fi";
        }
      }
    } catch {
      // Falha silenciosa para tentar OpenSky como redundância
    }

    // 2. Se o feed ADSB não encontrou aeronaves, tentar OpenSky Network como fallback
    if (estados.length === 0) {
      try {
        const deltaLat = radiusKm / 111;
        const deltaLon = radiusKm / (111 * Math.cos((lat * Math.PI) / 180));
        const lamin = (lat - deltaLat).toFixed(4);
        const lamax = (lat + deltaLat).toFixed(4);
        const lomin = (lon - deltaLon).toFixed(4);
        const lomax = (lon + deltaLon).toFixed(4);

        const headers: Record<string, string> = {
          "User-Agent": "FlightPanel/1.2 (Next.js Aviation Display)",
          Accept: "application/json",
        };

        const username = process.env.OPENSKY_USERNAME;
        const password = process.env.OPENSKY_PASSWORD;
        if (username && password) {
          const auth = Buffer.from(`${username}:${password}`).toString("base64");
          headers["Authorization"] = `Basic ${auth}`;
        }

        const openSkyUrl = `https://opensky-network.org/api/states/all?lamin=${lamin}&lomin=${lomin}&lamax=${lamax}&lomax=${lomax}`;
        const resOpenSky = await fetch(openSkyUrl, { headers, cache: "no-store" });

        if (resOpenSky.ok) {
          const dadosOpenSky = await resOpenSky.json();
          if (dadosOpenSky.states && dadosOpenSky.states.length > 0) {
            estados = dadosOpenSky.states;
            fonte = "opensky";
          }
        }
      } catch {
        // Ignorar
      }
    }

    // Obter rotas ADS-B reais para aeronaves encontradas
    const rotasMap: Record<string, RotaAdsb> = {};
    if (estados.length > 0) {
      const callsigns = Array.from(
        new Set(
          estados
            .map((e) => (e[1] || "").trim().toUpperCase())
            .filter((cs) => cs.length >= 3)
        )
      );

      if (callsigns.length > 0) {
        const promessas = callsigns.slice(0, 6).map(async (cs) => {
          const rota = await obterRotaPorCallsign(cs);
          if (rota) {
            rotasMap[cs] = rota;
          }
        });
        await Promise.allSettled(promessas);
      }
    }

    // Se obtivemos dados válidos, actualizar a cache de resiliência
    if (estados.length > 0) {
      cacheMemoriaVoos = {
        timestamp: Date.now(),
        estados,
        rotas: rotasMap,
      };
      return NextResponse.json({
        estados,
        rotas: rotasMap,
        fonte,
        total: estados.length,
      });
    }

    // 3. Se ambos devolverem 0 ou erro temporário e tivermos cache recente (até 120s), servir cache
    const agora = Date.now();
    if (cacheMemoriaVoos.estados.length > 0 && agora - cacheMemoriaVoos.timestamp < 120_000) {
      return NextResponse.json({
        estados: cacheMemoriaVoos.estados,
        rotas: cacheMemoriaVoos.rotas,
        fonte: "cache-resiliencia",
        total: cacheMemoriaVoos.estados.length,
      });
    }

    return NextResponse.json({
      estados: [],
      rotas: {},
      fonte: "nenhuma",
      total: 0,
    });
  } catch (err: any) {
    return NextResponse.json({
      estados: cacheMemoriaVoos.estados ?? [],
      rotas: cacheMemoriaVoos.rotas ?? {},
      fonte: "cache-erro",
      total: (cacheMemoriaVoos.estados ?? []).length,
    });
  }
}
