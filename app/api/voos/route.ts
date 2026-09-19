import { NextRequest, NextResponse } from "next/server";

export interface RotaAdsb {
  origem: string;
  origemCode: string;
  origemPais?: string;
  origemAeroporto?: string;
  destino: string;
  destinoCode: string;
  destinoPais?: string;
  destinoAeroporto?: string;
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

const AEROPORTOS_PAISES: Record<string, string> = {
  OPO: "PORTUGAL", LIS: "PORTUGAL", FAO: "PORTUGAL", FNC: "PORTUGAL", PDL: "PORTUGAL",
  TER: "PORTUGAL", PXO: "PORTUGAL", SMA: "PORTUGAL", HOR: "PORTUGAL", FLW: "PORTUGAL",
  GRW: "PORTUGAL", SJZ: "PORTUGAL", CVU: "PORTUGAL", VRL: "PORTUGAL", BGC: "PORTUGAL",
  MAD: "ESPANHA", BCN: "ESPANHA", VLC: "ESPANHA", SVQ: "ESPANHA", AGP: "ESPANHA",
  ALC: "ESPANHA", BIO: "ESPANHA", SCQ: "ESPANHA", VGO: "ESPANHA", LCG: "ESPANHA",
  PMI: "ESPANHA", IBZ: "ESPANHA", MAH: "ESPANHA", TFS: "ESPANHA", TFN: "ESPANHA",
  LPA: "ESPANHA", ACE: "ESPANHA", FUE: "ESPANHA", SPC: "ESPANHA",
  CDG: "FRANÇA", ORY: "FRANÇA", BVA: "FRANÇA", LYS: "FRANÇA", MRS: "FRANÇA",
  NCE: "FRANÇA", TLS: "FRANÇA", BOD: "FRANÇA", NTE: "FRANÇA",
  LHR: "REINO UNIDO", LGW: "REINO UNIDO", STN: "REINO UNIDO", LTN: "REINO UNIDO",
  LCY: "REINO UNIDO", SEN: "REINO UNIDO", MAN: "REINO UNIDO", BHX: "REINO UNIDO",
  EDI: "REINO UNIDO", GLA: "REINO UNIDO", BRS: "REINO UNIDO", LPL: "REINO UNIDO",
  NCL: "REINO UNIDO", EMA: "REINO UNIDO", BFS: "REINO UNIDO", BHD: "REINO UNIDO",
  DUB: "IRLANDA", ORK: "IRLANDA", SNN: "IRLANDA",
  AMS: "PAÍSES BAIXOS", EIN: "PAÍSES BAIXOS", RTM: "PAÍSES BAIXOS",
  BRU: "BÉLGICA", CRL: "BÉLGICA", LUX: "LUXEMBURGO",
  FRA: "ALEMANHA", HHN: "ALEMANHA", MUC: "ALEMANHA", BER: "ALEMANHA", HAM: "ALEMANHA",
  DUS: "ALEMANHA", CGN: "ALEMANHA", STR: "ALEMANHA", NUE: "ALEMANHA", HAJ: "ALEMANHA",
  ZRH: "SUÍÇA", GVA: "SUÍÇA", BSL: "SUÍÇA", VIE: "ÁUSTRIA", SZG: "ÁUSTRIA",
  FCO: "ITÁLIA", CIA: "ITÁLIA", MXP: "ITÁLIA", LIN: "ITÁLIA", BGY: "ITÁLIA",
  VCE: "ITÁLIA", TSF: "ITÁLIA", NAP: "ITÁLIA", BLQ: "ITÁLIA", TRN: "ITÁLIA",
  PSA: "ITÁLIA", FLR: "ITÁLIA", CTA: "ITÁLIA", PMO: "ITÁLIA",
  WAW: "POLÓNIA", WMI: "POLÓNIA", KRK: "POLÓNIA", GDN: "POLÓNIA", WRO: "POLÓNIA",
  POZ: "POLÓNIA", KTW: "POLÓNIA", PRG: "CHÉQUIA", BUD: "HUNGRIA", BTS: "ESLOVÁQUIA",
  OTP: "ROMÉNIA", SOF: "BULGÁRIA", BEG: "SÉRVIA", ZAG: "CROÁCIA", LJU: "ESLOVÉNIA",
  CPH: "DINAMARCA", BLL: "DINAMARCA", OSL: "NORUEGA", BGO: "NORUEGA", SVG: "NORUEGA",
  TRD: "NORUEGA", ARN: "SUÉCIA", BMA: "SUÉCIA", GOT: "SUÉCIA", HEL: "FINLÂNDIA",
  KEF: "ISLÂNDIA", ATH: "GRÉCIA", SKG: "GRÉCIA", HER: "GRÉCIA", CHQ: "GRÉCIA",
  RHO: "GRÉCIA", CFU: "GRÉCIA", JTR: "GRÉCIA", JMK: "GRÉCIA", LCA: "CHIPRE",
  PFO: "CHIPRE", MLA: "MALTA", IST: "TURQUIA", SAW: "TURQUIA", AYT: "TURQUIA",
  ADB: "TURQUIA", DXB: "EAU", DWC: "EAU", DOH: "CATAR", AUH: "EAU",
  RUH: "ARÁBIA SAUDITA", JED: "ARÁBIA SAUDITA", TLV: "ISRAEL", AMM: "JORDÂNIA",
  BEY: "LÍBANO", CAI: "EGITO", HRG: "EGITO", SSH: "EGITO", RAK: "MARROCOS",
  CMN: "MARROCOS", AGA: "MARROCOS", FEZ: "MARROCOS", TNG: "MARROCOS", TUN: "TUNÍSIA",
  NBE: "TUNÍSIA", DJE: "TUNÍSIA", ALG: "ARGÉLIA", DKR: "SENEGAL", DSS: "SENEGAL",
  BKO: "MALI", OXB: "GUINÉ-BISSAU", RAI: "CABO VERDE", SID: "CABO VERDE",
  BVC: "CABO VERDE", VXE: "CABO VERDE", TMS: "SÃO TOMÉ", LAD: "ANGOLA",
  MPM: "MOÇAMBIQUE", JNB: "ÁFRICA DO SUL", CPT: "ÁFRICA DO SUL",
  JFK: "ESTADOS UNIDOS", EWR: "ESTADOS UNIDOS", LGA: "ESTADOS UNIDOS",
  BOS: "ESTADOS UNIDOS", IAD: "ESTADOS UNIDOS", DCA: "ESTADOS UNIDOS",
  BWI: "ESTADOS UNIDOS", ORD: "ESTADOS UNIDOS", MDW: "ESTADOS UNIDOS",
  MIA: "ESTADOS UNIDOS", FLL: "ESTADOS UNIDOS", MCO: "ESTADOS UNIDOS",
  TPA: "ESTADOS UNIDOS", ATL: "ESTADOS UNIDOS", DFW: "ESTADOS UNIDOS",
  IAH: "ESTADOS UNIDOS", LAX: "ESTADOS UNIDOS", SFO: "ESTADOS UNIDOS",
  SEA: "ESTADOS UNIDOS", DEN: "ESTADOS UNIDOS", LAS: "ESTADOS UNIDOS",
  PHX: "ESTADOS UNIDOS", YYZ: "CANADÁ", YUL: "CANADÁ", YVR: "CANADÁ",
  YYC: "CANADÁ", GIG: "BRASIL", SDU: "BRASIL", GRU: "BRASIL", CGH: "BRASIL",
  VCP: "BRASIL", BSB: "BRASIL", SSA: "BRASIL", REC: "BRASIL", FOR: "BRASIL",
  CNF: "BRASIL", POA: "BRASIL", CWB: "BRASIL", FLN: "BRASIL", NAT: "BRASIL",
  MCZ: "BRASIL", BPS: "BRASIL", EZE: "ARGENTINA", AEP: "ARGENTINA",
  SCL: "CHILE", LIM: "PERU", BOG: "COLÔMBIA", MDE: "COLÔMBIA",
  PTY: "PANAMÁ", MEX: "MÉXICO", CUN: "MÉXICO",
};

export function obterPaisDoAeroporto(codigo?: string, paisIsoOuNome?: string): string {
  const cod = (codigo || "").trim().toUpperCase();
  if (AEROPORTOS_PAISES[cod]) return AEROPORTOS_PAISES[cod];

  if (cod.length === 4) {
    if (cod.startsWith("LP")) return "PORTUGAL";
    if (cod.startsWith("LE")) return "ESPANHA";
    if (cod.startsWith("LF")) return "FRANÇA";
    if (cod.startsWith("EG")) return "REINO UNIDO";
    if (cod.startsWith("EI")) return "IRLANDA";
    if (cod.startsWith("ED") || cod.startsWith("ET")) return "ALEMANHA";
    if (cod.startsWith("EH")) return "PAÍSES BAIXOS";
    if (cod.startsWith("EB") || cod.startsWith("EL")) return "BÉLGICA";
    if (cod.startsWith("LS")) return "SUÍÇA";
    if (cod.startsWith("LOW")) return "ÁUSTRIA";
    if (cod.startsWith("LI")) return "ITÁLIA";
    if (cod.startsWith("EP")) return "POLÓNIA";
    if (cod.startsWith("LK")) return "CHÉQUIA";
    if (cod.startsWith("LH")) return "HUNGRIA";
    if (cod.startsWith("LR")) return "ROMÉNIA";
    if (cod.startsWith("LG")) return "GRÉCIA";
    if (cod.startsWith("LT")) return "TURQUIA";
    if (cod.startsWith("EK")) return "DINAMARCA";
    if (cod.startsWith("EN")) return "NORUEGA";
    if (cod.startsWith("ES")) return "SUÉCIA";
    if (cod.startsWith("EF")) return "FINLÂNDIA";
    if (cod.startsWith("BI")) return "ISLÂNDIA";
    if (cod.startsWith("OM")) return "EAU";
    if (cod.startsWith("GM")) return "MARROCOS";
    if (cod.startsWith("GV")) return "CABO VERDE";
    if (cod.startsWith("FN")) return "ANGOLA";
    if (cod.startsWith("SB") || cod.startsWith("SD")) return "BRASIL";
    if (cod.startsWith("K")) return "ESTADOS UNIDOS";
    if (cod.startsWith("C")) return "CANADÁ";
  }

  if (paisIsoOuNome) {
    const p = paisIsoOuNome.trim().toUpperCase();
    const mapa: Record<string, string> = {
      PORTUGAL: "PORTUGAL", PT: "PORTUGAL",
      SPAIN: "ESPANHA", ES: "ESPANHA", ESPANHA: "ESPANHA",
      FRANCE: "FRANÇA", FR: "FRANÇA",
      "UNITED KINGDOM": "REINO UNIDO", GB: "REINO UNIDO", UK: "REINO UNIDO",
      GERMANY: "ALEMANHA", DE: "ALEMANHA",
      NETHERLANDS: "PAÍSES BAIXOS", NL: "PAÍSES BAIXOS",
      BELGIUM: "BÉLGICA", BE: "BÉLGICA",
      SWITZERLAND: "SUÍÇA", CH: "SUÍÇA",
      ITALY: "ITÁLIA", IT: "ITÁLIA",
      IRELAND: "IRLANDA", IE: "IRLANDA",
      POLAND: "POLÓNIA", PL: "POLÓNIA",
      AUSTRIA: "ÁUSTRIA", AT: "ÁUSTRIA",
      GREECE: "GRÉCIA", GR: "GRÉCIA",
      TURKEY: "TURQUIA", TR: "TURQUIA",
      BRAZIL: "BRASIL", BR: "BRASIL",
      "UNITED STATES": "ESTADOS UNIDOS", US: "ESTADOS UNIDOS", USA: "ESTADOS UNIDOS",
      CANADA: "CANADÁ", CA: "CANADÁ",
      MOROCCO: "MARROCOS", MA: "MARROCOS",
      "CAPE VERDE": "CABO VERDE", CV: "CABO VERDE",
      ANGOLA: "ANGOLA", AO: "ANGOLA",
    };
    if (mapa[p]) return mapa[p];
    return p;
  }

  return "";
}

// ─── Dicionário de Nomes Oficiais de Aeroportos ──────────────────────────────
export const AEROPORTOS_NOMES: Record<string, string> = {
  // Portugal
  OPO: "FRANCISCO SÁ CARNEIRO",
  LIS: "HUMBERTO DELGADO",
  FAO: "GAGO COUTINHO",
  FNC: "CRISTIANO RONALDO",
  PDL: "JOÃO PAULO II",
  TER: "LAJES",
  PXO: "PORTO SANTO",
  SMA: "SANTA MARIA",
  HOR: "HORTA",
  FLW: "FLORES",
  GRW: "GRACIOSA",
  SJZ: "SÃO JORGE",
  CVU: "CORVO",
  VRL: "VILA REAL",
  BGC: "BRAGANÇA",
  CAT: "CASCAIS TIRES",
  // Bases Militares FAP
  OVR: "BA8 OVAR",
  MTO: "BA6 MONTIJO",
  MTR: "BA5 MONTE REAL",
  BYJ: "BA11 BEJA",
  OPS: "OPERAÇÕES MILITARES",
  SAR: "BUSCA E SALVAMENTO",
  CAP: "PATRULHA AÉREA",
  // Espanha
  MAD: "ADOLFO SUÁREZ BARAJAS",
  BCN: "JOSEP TARRADELLAS EL PRAT",
  VLC: "MANISES",
  SVQ: "SAN PABLO",
  AGP: "COSTA DEL SOL",
  ALC: "ELCHE MIGUEL HERNÁNDEZ",
  BIO: "LOIU",
  SCQ: "ROSALÍA DE CASTRO",
  VGO: "PEINADOR",
  LCG: "ALVEDRO",
  PMI: "SON SANT JOAN",
  IBZ: "IBIZA",
  MAH: "MENORCA",
  TFS: "TENERIFE SUR (REINA SOFÍA)",
  TFN: "TENERIFE NORTE (LOS RODEOS)",
  LPA: "GRAN CANARIA",
  ACE: "CÉSAR MANRIQUE",
  FUE: "FUERTEVENTURA",
  SPC: "LA PALMA",
  // França
  CDG: "CHARLES DE GAULLE",
  ORY: "ORLY",
  BVA: "BEAUVAIS-TILLÉ",
  LYS: "SAINT-EXUPÉRY",
  MRS: "MARSEILLE PROVENCE",
  NCE: "CÔTE D'AZUR",
  TLS: "BLAGNAC",
  BOD: "MÉRIGNAC",
  NTE: "ATLANTIQUE",
  // Reino Unido e Irlanda
  LHR: "HEATHROW",
  LGW: "GATWICK",
  STN: "STANSTED",
  LTN: "LUTON",
  LCY: "LONDON CITY",
  SEN: "SOUTHEND",
  MAN: "MANCHESTER",
  BHX: "BIRMINGHAM",
  EDI: "EDINBURGH",
  GLA: "GLASGOW",
  BRS: "BRISTOL",
  LPL: "JOHN LENNON",
  NCL: "NEWCASTLE",
  EMA: "EAST MIDLANDS",
  BFS: "ALDERGROVE",
  BHD: "GEORGE BEST",
  DUB: "DUBLIN",
  ORK: "CORK",
  SNN: "SHANNON",
  // Benelux
  AMS: "SCHIPHOL",
  EIN: "EINDHOVEN",
  RTM: "ROTTERDAM THE HAGUE",
  BRU: "ZAVENTEM",
  CRL: "CHARLEROI SOUTH",
  LUX: "FINDEL",
  // Alemanha, Suíça e Áustria
  FRA: "FRANKFURT MAIN",
  HHN: "FRANKFURT-HAHN",
  MUC: "FRANZ JOSEF STRAUSS",
  BER: "WILLY BRANDT",
  HAM: "HELMUT SCHMIDT",
  DUS: "DÜSSELDORF",
  CGN: "KONRAD ADENAUER",
  STR: "STUTTGART",
  NUE: "ALBRECHT DÜRER",
  HAJ: "HANNOVER",
  ZRH: "KLOTEN",
  GVA: "COINTRIN",
  BSL: "EUROAIRPORT",
  VIE: "SCHWECHAT",
  SZG: "W. A. MOZART",
  // Itália
  FCO: "LEONARDO DA VINCI (FIUMICINO)",
  CIA: "CIAMPINO",
  MXP: "MALPENSA",
  LIN: "LINATE",
  BGY: "ORIO AL SERIO",
  VCE: "MARCO POLO",
  TSF: "ANTONIO CANOVA",
  NAP: "CAPODICHINO",
  BLQ: "GUGLIELMO MARCONI",
  TRN: "SANDRO PERTINI",
  PSA: "GALILEO GALILEI",
  FLR: "AMERIGO VESPUCCI",
  CTA: "FONTANAROSSA",
  PMO: "FALCONE BORSELLINO",
  // Europa Central, Norte e Leste
  WAW: "FREDERIC CHOPIN",
  WMI: "MODLIN",
  KRK: "JAN PAWEŁ II",
  GDN: "LECH WAŁĘSA",
  WRO: "NICOLAUS COPERNICUS",
  POZ: "ŁAWICA",
  KTW: "KATOWICE",
  PRG: "VÁCLAV HAVEL",
  BUD: "FERENC LISZT",
  BTS: "M. R. ŠTEFÁNIK",
  OTP: "HENRI COANDĂ",
  SOF: "VASIL LEVSKI",
  BEG: "NIKOLA TESLA",
  ZAG: "FRANJO TUĐMAN",
  LJU: "JOŽE PUČNIK",
  CPH: "KASTRUP",
  BLL: "BILLUND",
  OSL: "GARDERMOEN",
  BGO: "FLESLAND",
  SVG: "SOLA",
  TRD: "VÆRNES",
  ARN: "ARLANDA",
  BMA: "BROMMA",
  GOT: "LANDVETTER",
  HEL: "VANTAA",
  KEF: "KEFLAVÍK",
  ATH: "ELEFTHERIOS VENIZELOS",
  SKG: "MAKEDONIA",
  HER: "NIKOS KAZANTZAKIS",
  CHQ: "IOANNIS DASKALOGIANNIS",
  RHO: "DIAGORAS",
  CFU: "IOANNIS KAPODISTRIAS",
  JTR: "SANTORINI",
  JMK: "MYKONOS",
  LCA: "LARNACA",
  PFO: "PAPHOS",
  MLA: "LUQA",
  IST: "ISTANBUL HAVALIMANI",
  SAW: "SABIHA GÖKÇEN",
  AYT: "ANTALYA",
  ADB: "ADNAN MENDERES",
  // Médio Oriente e África
  DXB: "DUBAI INTL",
  DWC: "AL MAKTOUM",
  DOH: "HAMAD INTL",
  AUH: "ZAYED INTL",
  RUH: "KING KHALID",
  JED: "KING ABDULAZIZ",
  TLV: "BEN GURION",
  AMM: "QUEEN ALIA",
  BEY: "RAFIC HARIRI",
  CAI: "CAIRO INTL",
  HRG: "HURGHADA INTL",
  SSH: "SHARM EL SHEIKH",
  RAK: "MENARA",
  CMN: "MOHAMMED V",
  AGA: "AL MASSIRA",
  FEZ: "SAÏSS",
  TNG: "IBN BATTOUTA",
  TUN: "CARTHAGE",
  NBE: "ENFIDHA-HAMMAMET",
  DJE: "DJERBA-ZARZIS",
  ALG: "HOUARI BOUMEDIENE",
  DKR: "LÉOPOLD SÉDAR SENGHOR",
  DSS: "BLAISE DIAGNE",
  BKO: "MODIBO KEITA",
  OXB: "OSVALDO VIEIRA",
  RAI: "NELSON MANDELA",
  SID: "AMÍLCAR CABRAL",
  BVC: "ARÍSTIDES PEREIRA",
  VXE: "CESÁRIA ÉVORA",
  TMS: "SÃO TOMÉ INTL",
  LAD: "4 DE FEVEREIRO",
  MPM: "MAPUTO INTL",
  JNB: "O. R. TAMBO",
  CPT: "CAPE TOWN INTL",
  // Américas
  JFK: "JOHN F. KENNEDY",
  EWR: "NEWARK LIBERTY",
  LGA: "LA GUARDIA",
  BOS: "LOGAN INTL",
  IAD: "DULLES INTL",
  DCA: "RONALD REAGAN",
  BWI: "BALTIMORE/WASHINGTON",
  ORD: "O'HARE INTL",
  MDW: "MIDWAY",
  MIA: "MIAMI INTL",
  FLL: "FORT LAUDERDALE",
  MCO: "ORLANDO INTL",
  TPA: "TAMPA INTL",
  ATL: "HARTSFIELD-JACKSON",
  DFW: "DALLAS/FORT WORTH",
  IAH: "GEORGE BUSH",
  LAX: "LOS ANGELES INTL",
  SFO: "SAN FRANCISCO INTL",
  SEA: "SEATTLE-TACOMA",
  DEN: "DENVER INTL",
  LAS: "HARRY REID",
  PHX: "SKY HARBOR",
  YYZ: "LESTER B. PEARSON",
  YUL: "PIERRE ELLIOTT TRUDEAU",
  YVR: "VANCOUVER INTL",
  YYC: "CALGARY INTL",
  GIG: "ANTÔNIO CARLOS JOBIM (GALEÃO)",
  SDU: "SANTOS DUMONT",
  GRU: "GUARULHOS",
  CGH: "CONGONHAS",
  VCP: "VIRACOPOS",
  BSB: "JUSCELINO KUBITSCHEK",
  SSA: "LUÍS EDUARDO MAGALHÃES",
  REC: "GILBERTO FREYRE (GUARARAPES)",
  FOR: "PINTO MARTINS",
  CNF: "CONFINS (TANCREDO NEVES)",
  POA: "SALGADO FILHO",
  CWB: "AFONSO PENA",
  FLN: "HERCÍLIO LUZ",
  NAT: "ALUÍZIO ALVES",
  MCZ: "ZUMBI DOS PALMARES",
  BPS: "PORTO SEGURO",
  EZE: "MINISTRO PISTARINI (EZEIZA)",
  AEP: "JORGE NEWBERY",
  SCL: "ARTURO MERINO BENÍTEZ",
  LIM: "JORGE CHÁVEZ",
  BOG: "EL DORADO",
  MDE: "JOSÉ MARÍA CÓRDOVA",
  PTY: "TOCUMEN",
  MEX: "BENITO JUÁREZ",
  CUN: "CANCÚN INTL",
};

export function obterNomeAeroporto(codigo?: string, nomeRecebido?: string): string {
  const cod = (codigo || "").trim().toUpperCase();
  if (AEROPORTOS_NOMES[cod]) return AEROPORTOS_NOMES[cod];

  if (nomeRecebido) {
    const limpo = nomeRecebido
      .replace(/\s+international\s+airport/i, "")
      .replace(/\s+intl\s+airport/i, "")
      .replace(/\s+airport/i, "")
      .replace(/^aeropuerto\s+de\s+/i, "")
      .replace(/^aeropuerto\s+/i, "")
      .replace(/^a[eé]roport\s+de\s+/i, "")
      .replace(/^a[eé]roport\s+/i, "")
      .replace(/\s+flughafen/i, "")
      .replace(/^aeroporto\s+de\s+/i, "")
      .replace(/^aeroporto\s+internacional\s+de\s+/i, "")
      .replace(/^aeroporto\s+/i, "")
      .trim()
      .toUpperCase();
    if (limpo && limpo.length > 2) return limpo;
  }

  return "";
}

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
          // o registo na base de dados é um callsign reutilizado/obsoleto
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
          origemPais: obterPaisDoAeroporto(origIata, r.origin.country_name || r.origin.iso_country),
          origemAeroporto: obterNomeAeroporto(origIata, r.origin.name),
          destino: AEROPORTOS_CIDADES[destIata] || TRADUCOES_CIDADES[rawDestino] || rawDestino,
          destinoCode: destIata,
          destinoPais: obterPaisDoAeroporto(destIata, r.destination.country_name || r.destination.iso_country),
          destinoAeroporto: obterNomeAeroporto(destIata, r.destination.name),
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
                origemPais: obterPaisDoAeroporto(originCode),
                origemAeroporto: obterNomeAeroporto(originCode),
                destino: destCidade,
                destinoCode: destCode,
                destinoPais: obterPaisDoAeroporto(destCode),
                destinoAeroporto: obterNomeAeroporto(destCode),
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

