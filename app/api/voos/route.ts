import { NextRequest, NextResponse } from "next/server";

// Cache de resiliência em memória (preserva dados em caso de micro-falhas ou 429 da OpenSky)
let cacheMemoriaVoos: {
  timestamp: number;
  chave: string;
  estados: any[];
} = {
  timestamp: 0,
  chave: "",
  estados: [],
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const latParam = searchParams.get("lat");
    const lonParam = searchParams.get("lon");
    const radiusParam = searchParams.get("radius");

    // Coordenadas de referência (com suporte a variáveis de ambiente ou coordenadas padrão)
    const lat = latParam ? parseFloat(latParam) : parseFloat(process.env.NEXT_PUBLIC_DEFAULT_LATITUDE || "41.15");
    const lon = lonParam ? parseFloat(lonParam) : parseFloat(process.env.NEXT_PUBLIC_DEFAULT_LONGITUDE || "-8.62");
    const radiusKm = radiusParam ? Math.max(10, Math.min(150, parseFloat(radiusParam))) : 40;

    const chaveConsulta = `${lat.toFixed(2)}_${lon.toFixed(2)}_${radiusKm}`;

    // Cálculo geodésico da Bounding Box em torno do utilizador
    const deltaLat = radiusKm / 111;
    const deltaLon = radiusKm / (111 * Math.cos((lat * Math.PI) / 180));
    const lamin = (lat - deltaLat).toFixed(4);
    const lamax = (lat + deltaLat).toFixed(4);
    const lomin = (lon - deltaLon).toFixed(4);
    const lomax = (lon + deltaLon).toFixed(4);

    const headers: Record<string, string> = {
      "User-Agent": "FlightPanel/1.1 (Aviation Display PWA; contact@antigravity.dev)",
      "Accept": "application/json",
    };

    // Suporte a credenciais OpenSky caso configuradas
    const username = process.env.OPENSKY_USERNAME;
    const password = process.env.OPENSKY_PASSWORD;
    if (username && password) {
      const auth = Buffer.from(`${username}:${password}`).toString("base64");
      headers["Authorization"] = `Basic ${auth}`;
    }

    const openSkyUrl = `https://opensky-network.org/api/states/all?lamin=${lamin}&lomin=${lomin}&lamax=${lamax}&lomax=${lomax}`;

    const res = await fetch(openSkyUrl, {
      headers,
      cache: "no-store",
    });

    if (res.ok) {
      const dados = await res.json();
      let estados = dados.states ?? [];

      // Se a área imediata estiver vazia (espaço aéreo calmo), tentar expansão regional automática (raio x 2)
      if (estados.length === 0 && radiusKm <= 40) {
        const deltaLatExp = (radiusKm * 2) / 111;
        const deltaLonExp = (radiusKm * 2) / (111 * Math.cos((lat * Math.PI) / 180));
        const laminExp = (lat - deltaLatExp).toFixed(4);
        const lamaxExp = (lat + deltaLatExp).toFixed(4);
        const lominExp = (lon - deltaLonExp).toFixed(4);
        const lomaxExp = (lon + deltaLonExp).toFixed(4);

        const expUrl = `https://opensky-network.org/api/states/all?lamin=${laminExp}&lomin=${lominExp}&lamax=${lamaxExp}&lomax=${lomaxExp}`;
        const resExp = await fetch(expUrl, { headers, cache: "no-store" });
        if (resExp.ok) {
          const dadosExp = await resExp.json();
          if (dadosExp.states && dadosExp.states.length > 0) {
            estados = dadosExp.states;
          }
        }
      }

      if (estados.length > 0) {
        cacheMemoriaVoos = {
          timestamp: Date.now(),
          chave: chaveConsulta,
          estados,
        };
      }

      return NextResponse.json({
        estados,
        fonte: "opensky-live",
        total: estados.length,
      });
    }

    // Se o OpenSky devolver 429 ou erro temporário e tivermos cache recente (até 120s), servir cache
    const agora = Date.now();
    if (cacheMemoriaVoos.estados.length > 0 && agora - cacheMemoriaVoos.timestamp < 120_000) {
      return NextResponse.json({
        estados: cacheMemoriaVoos.estados,
        fonte: "cache-resiliencia",
        total: cacheMemoriaVoos.estados.length,
      });
    }

    return NextResponse.json(
      { erro: "Falha na resposta do OpenSky Network.", status: res.status },
      { status: res.status }
    );
  } catch (err: any) {
    const agora = Date.now();
    if (cacheMemoriaVoos.estados.length > 0 && agora - cacheMemoriaVoos.timestamp < 120_000) {
      return NextResponse.json({
        estados: cacheMemoriaVoos.estados,
        fonte: "cache-resiliencia",
        total: cacheMemoriaVoos.estados.length,
      });
    }

    return NextResponse.json(
      { erro: "Erro interno ao obter dados de voos." },
      { status: 500 }
    );
  }
}

