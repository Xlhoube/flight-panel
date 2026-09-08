import { NextRequest, NextResponse } from "next/server";

export interface RotaAdsb {
  origem: string;
  origemCode: string;
  destino: string;
  destinoCode: string;
  airline?: string;
  callsignIata?: string;
  callsignIcao?: string;
  flightNumber?: string;
  airlineIcao?: string;
  model?: string;
}

// ─── Dicionário Global de Aeroportos para Cidades Oficiais ────────────────────
const AEROPORTOS_CIDADES: Record<string, string> = {
  OPO: "PORTO",
  LIS: "LISBOA",
  FAO: "FARO",
  FNC: "FUNCHAL",
  PDL: "PONTA DELGADA",
  TER: "TERCEIRA",
  PXO: "PORTO SANTO",
  SMA: "SANTA MARIA",
  HOR: "HORTA",
  FLW: "FLORES",
  GRW: "GRACIOSA",
  SJZ: "SAO JORGE",
  CVU: "CORVO",
  VRL: "VILA REAL",
  BGC: "BRAGANCA",
  MAD: "MADRID",
  BCN: "BARCELONA",
  VLC: "VALENCIA",
  SVQ: "SEVILHA",
  AGP: "MALAGA",
  ALC: "ALICANTE",
  BIO: "BILBAO",
  SCQ: "SANTIAGO",
  VGO: "VIGO",
  LCG: "CORUNHA",
  PMI: "PALMA MAIORCA",
  IBZ: "IBIZA",
  MAH: "MENORCA",
  TFS: "TENERIFE SUL",
  TFN: "TENERIFE NORTE",
  LPA: "GRAN CANARIA",
  ACE: "LANZAROTE",
  FUE: "FUERTEVENTURA",
  SPC: "LA PALMA",
  CDG: "PARIS",
  ORY: "PARIS",
  BVA: "PARIS",
  LYS: "LYON",
  MRS: "MARSELHA",
  NCE: "NICE",
  TLS: "TOULOUSE",
  BOD: "BORDEUS",
  NTE: "NANTES",
  LHR: "LONDRES",
  LGW: "LONDRES",
  STN: "LONDRES",
  LTN: "LONDRES",
  LCY: "LONDRES",
  SEN: "LONDRES",
  MAN: "MANCHESTER",
  BHX: "BIRMINGHAM",
  EDI: "EDIMBURGO",
  GLA: "GLASGOW",
  BRS: "BRISTOL",
  LPL: "LIVERPOOL",
  NCL: "NEWCASTLE",
  EMA: "EAST MIDLANDS",
  BFS: "BELFAST",
  BHD: "BELFAST",
  DUB: "DUBLIN",
  ORK: "CORK",
  SNN: "SHANNON",
  AMS: "AMSTERDAO",
  EIN: "EINDHOVEN",
  RTM: "ROTERDAO",
  BRU: "BRUXELAS",
  CRL: "CHARLEROI",
  LUX: "LUXEMBURGO",
  FRA: "FRANKFURT",
  HHN: "FRANKFURT HAHN",
  MUC: "MUNIQUE",
  BER: "BERLIM",
  HAM: "HAMBURGO",
  DUS: "DUSSELDORF",
  CGN: "COLONIA",
  STR: "ESTUGARDA",
  NUE: "NUREMBERGA",
  HAJ: "HANNOVER",
  ZRH: "ZURIQUE",
  GVA: "GENEBRA",
  BSL: "BASILEIA",
  VIE: "VIENA",
  SZG: "SALZBURGO",
  FCO: "ROMA",
  CIA: "ROMA",
  MXP: "MILAO",
  LIN: "MILAO",
  BGY: "BERGAMO",
  VCE: "VENEZA",
  TSF: "TREVISO",
  NAP: "NAPOLES",
  BLQ: "BOLONHA",
  TRN: "TURIM",
  PSA: "PISA",
  FLR: "FLORENCA",
  CTA: "CATANIA",
  PMO: "PALERMO",
  WAW: "VARSOVIA",
  WMI: "VARSOVIA",
  KRK: "CRACOVIA",
  GDN: "GDANSK",
  WRO: "WROCLAW",
  POZ: "POZNAN",
  KTW: "KATOWICE",
  PRG: "PRAGA",
  BUD: "BUDAPESTE",
  BTS: "BRATISLAVA",
  OTP: "BUCARESTE",
  SOF: "SOFIA",
  BEG: "BELGRADO",
  ZAG: "ZAGREB",
  LJU: "LJUBLJANA",
  CPH: "COPENHAGA",
  BLL: "BILLUND",
  OSL: "OSLO",
  BGO: "BERGEN",
  SVG: "STAVANGER",
  TRD: "TRONDHEIM",
  ARN: "ESTOCOLMO",
  BMA: "ESTOCOLMO",
  GOT: "GOTEBORGO",
  HEL: "HELSINQUIA",
  KEF: "REIQUIAVIQUE",
  ATH: "ATENAS",
  SKG: "SALONICA",
  HER: "HERAKLION",
  CHQ: "CHANIA",
  RHO: "RODES",
  CFU: "CORFU",
  JTR: "SANTORINI",
  JMK: "MYKONOS",
  LCA: "LARNACA",
  PFO: "PAFOS",
  MLA: "MALTA",
  IST: "ISTAMBUL",
  SAW: "ISTAMBUL",
  AYT: "ANTALYA",
  ADB: "IZMIR",
  DXB: "DUBAI",
  DWC: "DUBAI",
  DOH: "DOHA",
  AUH: "ABU DHABI",
  RUH: "RIADE",
  JED: "JIDAH",
  TLV: "TEL AVIV",
  AMM: "AMA",
  BEY: "BEIRUTE",
  CAI: "CAIRO",
  HRG: "HURGHADA",
  SSH: "SHARM EL SHEIKH",
  RAK: "MARRAQUEXE",
  CMN: "CASABLANCA",
  AGA: "AGADIR",
  FEZ: "FES",
  TNG: "TANGER",
  TUN: "TUNIS",
  NBE: "ENFIDHA",
  DJE: "DJERBA",
  ALG: "ARGEL",
  DKR: "DAKAR",
  DSS: "DAKAR",
  BKO: "BAMAKO",
  OXB: "BISSAU",
  RAI: "PRAIA",
  SID: "ILHA DO SAL",
  BVC: "BOAVISTA",
  VXE: "SAO VICENTE",
  TMS: "SAO TOME",
  LAD: "LUANDA",
  MPM: "MAPUTO",
  JNB: "JOANESBURGO",
  CPT: "CIDADE DO CABO",
  JFK: "NOVA IORQUE",
  EWR: "NOVA IORQUE",
  LGA: "NOVA IORQUE",
  BOS: "BOSTON",
  IAD: "WASHINGTON",
  DCA: "WASHINGTON",
  BWI: "BALTIMORE",
  ORD: "CHICAGO",
  MDW: "CHICAGO",
  MIA: "MIAMI",
  FLL: "FORT LAUDERDALE",
  MCO: "ORLANDO",
  TPA: "TAMPA",
  ATL: "ATLANTA",
  DFW: "DALLAS",
  IAH: "HOUSTON",
  LAX: "LOS ANGELES",
  SFO: "SAO FRANCISCO",
  SEA: "SEATTLE",
  DEN: "DENVER",
  LAS: "LAS VEGAS",
  PHX: "PHOENIX",
  YYZ: "TORONTO",
  YUL: "MONTREAL",
  YVR: "VANCOUVER",
  YYC: "CALGARY",
  GIG: "RIO DE JANEIRO",
  SDU: "RIO DE JANEIRO",
  GRU: "SAO PAULO",
  CGH: "SAO PAULO",
  VCP: "CAMPINAS",
  BSB: "BRASILIA",
  SSA: "SALVADOR",
  REC: "RECIFE",
  FOR: "FORTALEZA",
  CNF: "BELO HORIZONTE",
  POA: "PORTO ALEGRE",
  CWB: "CURITIBA",
  FLN: "FLORIANOPOLIS",
  NAT: "NATAL",
  MCZ: "MACEIO",
  BPS: "PORTO SEGURO",
  EZE: "BUENOS AIRES",
  AEP: "BUENOS AIRES",
  SCL: "SANTIAGO CHILE",
  LIM: "LIMA",
  BOG: "BOGOTA",
  MDE: "MEDELLIN",
  PTY: "CIDADE DO PANAMA",
  MEX: "CIDADE DO MEXICO",
  CUN: "CANCUN",
};

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

// Consulta com validação geográfica de plausibilidade para bases estáticas (adsbdb)
async function obterRotaPorCallsign(callsign: string, curLat?: number, curLon?: number): Promise<RotaAdsb | null> {
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
        // Validação geográfica: se o avião está em Portugal, a rota NÃO pode ter origem e destino no outro lado da Europa
        if (curLat != null && curLon != null && r.origin.latitude != null && r.destination.latitude != null) {
          const origLat = r.origin.latitude;
          const origLon = r.origin.longitude;
          const destLat = r.destination.latitude;
          const destLon = r.destination.longitude;

          const distOrig = Math.hypot(origLat - curLat, origLon - curLon);
          const distDest = Math.hypot(destLat - curLat, destLon - curLon);

          // Se ambos os aeroportos estiverem a mais de 12 graus (~1.300 km) da posição actual,
          // o registo na base de dados é um callsign reutilizado/obsoleto (ex: Veneza -> Helsínquia sobrevoando o Porto)
          if (distOrig > 12 && distDest > 12) {
            cacheRotasMemoria.set(cs, { rota: null, expiraEm: agora + 3600_000 });
            return null;
          }
        }

        const rawOrigem = (r.origin.municipality || r.origin.name || "PORTO").toUpperCase();
        const rawDestino = (r.destination.municipality || r.destination.name || "DESTINO").toUpperCase();
        const origIata = r.origin.iata_code || "OPO";
        const destIata = r.destination.iata_code || "DES";

        const rota: RotaAdsb = {
          origem: AEROPORTOS_CIDADES[origIata] || TRADUCOES_CIDADES[rawOrigem] || rawOrigem,
          origemCode: origIata,
          destino: AEROPORTOS_CIDADES[destIata] || TRADUCOES_CIDADES[rawDestino] || rawDestino,
          destinoCode: destIata,
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
    ac.t || ac.desc || null,
    null,
    ac.squawk || null,
    false,
    0,
  ];
}

function calcularDistanciaHaversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const latParam = searchParams.get("lat");
    const lonParam = searchParams.get("lon");
    const radiusParam = searchParams.get("radius");

    const lat = latParam ? parseFloat(latParam) : parseFloat(process.env.NEXT_PUBLIC_DEFAULT_LATITUDE || "41.15");
    const lon = lonParam ? parseFloat(lonParam) : parseFloat(process.env.NEXT_PUBLIC_DEFAULT_LONGITUDE || "-8.62");
    const radiusKm = radiusParam ? Math.max(5, Math.min(120, parseFloat(radiusParam))) : 20;

    const deltaLat = radiusKm / 111;
    const deltaLon = radiusKm / (111 * Math.cos((lat * Math.PI) / 180));
    const lamin = (lat - deltaLat).toFixed(4);
    const lamax = (lat + deltaLat).toFixed(4);
    const lomin = (lon - deltaLon).toFixed(4);
    const lomax = (lon + deltaLon).toFixed(4);

    let estados: any[] = [];
    let fonte = "";
    let redeComSucesso = false;
    const rotasMap: Record<string, RotaAdsb> = {};

    // ── 1. FONTE PRIMÁRIA: Feed Directo Oficial FlightRadar24 ──────────────────
    // Obtém em tempo real exacto os mesmos dados, rotas, códigos de voo comercial e callsigns do FR24
    try {
      const fr24Url = `https://data-cloud.flightradar24.com/zones/fcgi/feed.js?bounds=${lamax},${lamin},${lomin},${lomax}`;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 2500);

      const resFr24 = await fetch(fr24Url, {
        signal: controller.signal,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
          Accept: "application/json",
          Referer: "https://www.flightradar24.com/",
        },
        cache: "no-store",
      });
      clearTimeout(timeout);

      if (resFr24.ok) {
        redeComSucesso = true;
        const dadosFr24 = await resFr24.json();
        for (const [key, v] of Object.entries(dadosFr24)) {
          if (Array.isArray(v)) {
            const hex = v[0];
            const acLat = v[1];
            const acLon = v[2];

            // 🛑 FILTRO CIRCULAR ESTRITO: eliminar aeronaves nos cantos da bounding box que ultrapassam o raio
            if (acLat != null && acLon != null) {
              const distKm = calcularDistanciaHaversineKm(lat, lon, acLat, acLon);
              if (distKm > radiusKm) {
                continue;
              }
            }
            const track = v[3];
            const altFeet = v[4];
            const speedKts = v[5];
            const model = v[8];
            const reg = v[9];
            const originCode = v[11];
            const destCode = v[12];
            const flightNumber = v[13];
            const vertRate = v[15];
            const callsign = (v[16] || flightNumber || hex || "").trim().toUpperCase();
            const airlineIcao = v[18];

            const altMetros = typeof altFeet === "number" ? Math.round(altFeet * 0.3048) : null;
            const velMs = typeof speedKts === "number" ? Math.round(speedKts * 0.514444) : null;
            const onGround = altFeet === 0 || altFeet === null;

            estados.push([
              hex,
              callsign,
              reg || "PORTUGAL",
              null,
              Date.now() / 1000,
              acLon,
              acLat,
              altMetros,
              onGround,
              velMs,
              track,
              vertRate,
              model,
              null,
              null,
              false,
              0,
            ]);

            if (originCode && destCode && callsign) {
              const origCidade = AEROPORTOS_CIDADES[originCode] || originCode;
              const destCidade = AEROPORTOS_CIDADES[destCode] || destCode;
              rotasMap[callsign] = {
                origem: origCidade,
                origemCode: originCode,
                destino: destCidade,
                destinoCode: destCode,
                flightNumber: flightNumber || callsign,
                airlineIcao: airlineIcao,
                model: model,
              };
            }
          }
        }

        if (estados.length > 0) {
          fonte = "flightradar24";
        }
      }
    } catch {
      // Falha silenciosa para avançar para a fonte de contingência
    }

    // ── 2. FONTE SECUNDÁRIA: ADSB.fi (Feed aberto Comunitário sem bloqueios) ───
    if (estados.length === 0) {
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
            (a: any) =>
              a.lat != null &&
              a.lon != null &&
              calcularDistanciaHaversineKm(lat, lon, a.lat, a.lon) <= radiusKm
          );

          if (listaAc.length > 0) {
            estados = listaAc.map(converterAdsbParaEstado);
            fonte = "adsb.fi";
          }
        }
      } catch {
        // Ignorar
      }
    }

    // ── 3. FONTE TERCIÁRIA: OpenSky Network como redundância ──────────────────
    if (estados.length === 0) {
      try {
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
            estados = dadosOpenSky.states.filter(
              (e: any) =>
                e[6] != null &&
                e[5] != null &&
                calcularDistanciaHaversineKm(lat, lon, e[6], e[5]) <= radiusKm
            );
            fonte = "opensky";
          }
        }
      } catch {
        // Ignorar
      }
    }

    // Para voos obtidos via ADSB.fi ou OpenSky que não tenham rota, enriquecer com consulta validada geograficamente
    if (estados.length > 0) {
      const callsignsSemRota = Array.from(
        new Set(
          estados
            .map((e) => (e[1] || "").trim().toUpperCase())
            .filter((cs) => cs.length >= 3 && !rotasMap[cs])
        )
      );

      if (callsignsSemRota.length > 0) {
        const promessas = callsignsSemRota.slice(0, 6).map(async (cs) => {
          const rota = await obterRotaPorCallsign(cs, lat, lon);
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

    const agora = Date.now();

    // 4. Se a consulta ao FlightRadar24 respondeu com sucesso e o céu está limpo (0 aviões no raio de 20 km),
    // libertar imediatamente para a meteorologia sem reter cache antiga de 2 minutos!
    if (redeComSucesso) {
      cacheMemoriaVoos = {
        timestamp: agora,
        estados: [],
        rotas: {},
      };
      return NextResponse.json({
        estados: [],
        rotas: {},
        fonte: "ceu-limpo",
        total: 0,
      });
    }

    // 5. Apenas se todas as fontes falharam por queda de rede/timeout e tivermos cache recente (até 60s), servir cache
    if (cacheMemoriaVoos.estados.length > 0 && agora - cacheMemoriaVoos.timestamp < 60_000) {
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

