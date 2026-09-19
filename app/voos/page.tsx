"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

// ─── Tipos ────────────────────────────────────────────────────────────────────

type EstadoVoo = [
  string,        // 0: icao24
  string | null, // 1: callsign
  string,        // 2: origin_country
  number | null, // 3: time_position
  number,        // 4: last_contact
  number | null, // 5: longitude
  number | null, // 6: latitude
  number | null, // 7: baro_altitude (metros)
  boolean,       // 8: on_ground
  number | null, // 9: velocity (m/s)
  number | null, // 10: true_track
  number | null, // 11: vertical_rate
  null,          // 12: sensors
  number | null, // 13: geo_altitude
  string | null, // 14: squawk
  boolean,       // 15: spi
  number         // 16: position_source
];

interface InfoLocalizacao {
  lat: number;
  lon: number;
  nome: string;
  origem: "gps" | "preset" | "manual" | "padrao";
}

const LOCALIZACAO_PADRAO: InfoLocalizacao = {
  lat: 41.15,
  lon: -8.62,
  nome: "VALADARES / PORTO",
  origem: "padrao",
};

// ─── Dicionários Aeronáuticos Auxiliares ───────────────────────────────────────

const COMPANHIAS: Record<string, { nome: string; iata: string }> = {
  TAP: { nome: "TAP AIR PORTUGAL", iata: "TP" },
  RYR: { nome: "RYANAIR", iata: "FR" },
  EJU: { nome: "EASYJET EUROPE", iata: "U2" },
  EZY: { nome: "EASYJET", iata: "U2" },
  VLG: { nome: "VUELING", iata: "VY" },
  IBE: { nome: "IBERIA", iata: "IB" },
  IBS: { nome: "IBERIA EXPRESS", iata: "I2" },
  AEA: { nome: "AIR EUROPA", iata: "UX" },
  AFR: { nome: "AIR FRANCE", iata: "AF" },
  KLM: { nome: "KLM ROYAL DUTCH", iata: "KL" },
  DLH: { nome: "LUFTHANSA", iata: "LH" },
  BAW: { nome: "BRITISH AIRWAYS", iata: "BA" },
  SWR: { nome: "SWISS INT. AIR LINES", iata: "LX" },
  BEL: { nome: "BRUSSELS AIRLINES", iata: "SN" },
  TAP_EXPRESS: { nome: "TAP EXPRESS", iata: "TP" },
  PGA: { nome: "PORTUGÁLIA AIRLINES", iata: "NI" },
  WZZ: { nome: "WIZZ AIR", iata: "W6" },
  WMT: { nome: "WIZZ AIR MALTA", iata: "W4" },
  TRA: { nome: "TRANSAVIA", iata: "HV" },
  TVF: { nome: "TRANSAVIA FRANCE", iata: "TO" },
  EWG: { nome: "EUROWINGS", iata: "EW" },
  EXS: { nome: "JET2.COM", iata: "LS" },
  TOM: { nome: "TUI AIRWAYS", iata: "BY" },
  TUI: { nome: "TUI FLY", iata: "X3" },
  FIN: { nome: "FINNAIR", iata: "AY" },
  SAS: { nome: "SAS SCANDINAVIAN", iata: "SK" },
  AEE: { nome: "AEGEAN AIRLINES", iata: "A3" },
  THY: { nome: "TURKISH AIRLINES", iata: "TK" },
  UAE: { nome: "EMIRATES", iata: "EK" },
  QTR: { nome: "QATAR AIRWAYS", iata: "QR" },
  ETD: { nome: "ETIHAD AIRWAYS", iata: "EY" },
  RAM: { nome: "ROYAL AIR MAROC", iata: "AT" },
  DAH: { nome: "AIR ALGERIE", iata: "AH" },
  LAV: { nome: "ALBASTAR", iata: "AP" },
  VOE: { nome: "VOLOTEA", iata: "V7" },
  NOZ: { nome: "NORWEGIAN AIR", iata: "DY" },
  NSZ: { nome: "NORWEGIAN AIR SWEDEN", iata: "D8" },
  IBB: { nome: "BINTER CANARIAS", iata: "NT" },
  ROT: { nome: "TAROM", iata: "RO" },
  AZA: { nome: "ITA AIRWAYS", iata: "AZ" },
  ITY: { nome: "ITA AIRWAYS", iata: "AZ" },
  UAL: { nome: "UNITED AIRLINES", iata: "UA" },
  DAL: { nome: "DELTA AIR LINES", iata: "DL" },
  AAL: { nome: "AMERICAN AIRLINES", iata: "AA" },
  ACA: { nome: "AIR CANADA", iata: "AC" },
  TSC: { nome: "AIR TRANSAT", iata: "TS" },
  TAM: { nome: "LATAM AIRLINES", iata: "LA" },
  GLO: { nome: "GOL LINHAS AEREAS", iata: "G3" },
  AZU: { nome: "AZUL LINHAS AEREAS", iata: "AD" },
  TAAG: { nome: "TAAG ANGOLA AIRLINES", iata: "DT" },
  DTA: { nome: "TAAG ANGOLA AIRLINES", iata: "DT" },
  RZO: { nome: "SATA AZORES AIRLINES", iata: "S4" },
  SAT: { nome: "SATA AIR ACORES", iata: "SP" },
  FAP: { nome: "FORÇA AÉREA PORTUGUESA", iata: "FAP" },
  AFP: { nome: "FORÇA AÉREA PORTUGUESA", iata: "FAP" },
  NPT: { nome: "NETJETS EUROPE", iata: "1I" },
  EJA: { nome: "NETJETS", iata: "QS" },
  VJT: { nome: "VISTAJET", iata: "VJ" },
  LXJ: { nome: "FLEXJET", iata: "LXJ" },
  FYL: { nome: "FLYING GROUP LUXEMBOURG", iata: "FYL" },
  JME: { nome: "FLYING GROUP", iata: "JME" },
  TAG: { nome: "TAG AVIATION", iata: "FP" },
  GES: { nome: "GESTAIR", iata: "GP" },
  EXU: { nome: "EXECUTIVE AIRLINES", iata: "EXU" },
  WGT: { nome: "WORLD TO GO", iata: "2W" },
  OBS: { nome: "ORBEST", iata: "6O" },
  MMZ: { nome: "EUROATLANTIC AIRWAYS", iata: "YU" },
  HFY: { nome: "HIFLY", iata: "5K" },
  SWT: { nome: "SWIFTAIR", iata: "WT" },
  BCS: { nome: "EUROPEAN AIR TRANSPORT", iata: "QY" },
  FDX: { nome: "FEDEX EXPRESS", iata: "FX" },
  UPS: { nome: "UPS AIRLINES", iata: "5X" },
  DHL: { nome: "DHL AIR", iata: "D0" },
};

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
  YYC: "CANADÁ", GIG: "BRASIL", SDU: "BRASIL", GRU: "BRASIL",
  CGH: "BRASIL", VCP: "BRASIL", BSB: "BRASIL", SSA: "BRASIL",
  REC: "BRASIL", FOR: "BRASIL", CNF: "BRASIL", POA: "BRASIL",
  CWB: "BRASIL", FLN: "BRASIL", NAT: "BRASIL", MCZ: "BRASIL",
  BPS: "BRASIL", EZE: "ARGENTINA", AEP: "ARGENTINA", SCL: "CHILE",
  LIM: "PERU", BOG: "COLÔMBIA", MDE: "COLÔMBIA", PTY: "PANAMÁ",
  MEX: "MÉXICO", CUN: "MÉXICO",
};

function obterPaisDoAeroporto(codigo: string): string {
  if (!codigo) return "";
  const cod = codigo.trim().toUpperCase();
  if (AEROPORTOS_PAISES[cod]) return AEROPORTOS_PAISES[cod];

  if (cod.startsWith("LP")) return "PORTUGAL";
  if (cod.startsWith("LE")) return "ESPANHA";
  if (cod.startsWith("LF")) return "FRANÇA";
  if (cod.startsWith("EG")) return "REINO UNIDO";
  if (cod.startsWith("EI")) return "IRLANDA";
  if (cod.startsWith("ED") || cod.startsWith("ET")) return "ALEMANHA";
  if (cod.startsWith("EH")) return "PAÍSES BAIXOS";
  if (cod.startsWith("EB")) return "BÉLGICA";
  if (cod.startsWith("LS")) return "SUÍÇA";
  if (cod.startsWith("LO")) return "ÁUSTRIA";
  if (cod.startsWith("LI")) return "ITÁLIA";
  if (cod.startsWith("EP")) return "POLÓNIA";
  if (cod.startsWith("LK")) return "CHÉQUIA";
  if (cod.startsWith("LH")) return "HUNGRIA";
  if (cod.startsWith("LG")) return "GRÉCIA";
  if (cod.startsWith("LT")) return "TURQUIA";
  if (cod.startsWith("SB") || cod.startsWith("SD") || cod.startsWith("SN") || cod.startsWith("SS") || cod.startsWith("SW")) return "BRASIL";
  if (cod.startsWith("K") || cod.startsWith("P")) return "ESTADOS UNIDOS";
  if (cod.startsWith("C")) return "CANADÁ";
  if (cod.startsWith("GV")) return "CABO VERDE";
  if (cod.startsWith("FN")) return "ANGOLA";

  return "";
}

// ─── Dicionário de Nomes Oficiais de Aeroportos ──────────────────────────────
const AEROPORTOS_NOMES: Record<string, string> = {
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

function obterNomeAeroporto(codigo?: string, nomeRecebido?: string): string {
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

function resolverVooInfo(voo: EstadoVoo, rotasMap?: Record<string, any>) {
  const cs = (voo[1] || "").trim().toUpperCase();
  const csLimpo = cs.replace(/\s+/g, "");
  const prefixo3 = csLimpo.slice(0, 3);
  const prefixo2 = csLimpo.slice(0, 2);

  let info = COMPANHIAS[prefixo3];
  let icao = /^[A-Z]{3}$/.test(prefixo3) ? prefixo3 : "";
  let iata = info?.iata || null;

  if (!iata) {
    if (prefixo2 === "TP") { iata = "TP"; icao = "TAP"; }
    else if (prefixo2 === "FR") { iata = "FR"; icao = "RYR"; }
    else if (prefixo2 === "U2") { iata = "U2"; icao = "EJU"; }
    else if (prefixo2 === "UX") { iata = "UX"; icao = "AEA"; }
    else if (prefixo2 === "IB") { iata = "IB"; icao = "IBE"; }
    else if (prefixo2 === "VY") { iata = "VY"; icao = "VLG"; }
    else if (prefixo2 === "LH") { iata = "LH"; icao = "DLH"; }
    else if (prefixo2 === "AF") { iata = "AF"; icao = "AFR"; }
    else if (prefixo2 === "BA") { iata = "BA"; icao = "BAW"; }
    else if (prefixo2 === "KL") { iata = "KL"; icao = "KLM"; }
    else if (prefixo2 === "TO") { iata = "TO"; icao = "TVF"; }
    else if (prefixo2 === "HV") { iata = "HV"; icao = "TRA"; }
    else if (prefixo2 === "W6") { iata = "W6"; icao = "WZZ"; }
    else if (prefixo2 === "RO") { iata = "RO"; icao = "ROT"; }
  }

  const isFap =
    csLimpo.startsWith("BLACK") ||
    csLimpo.startsWith("FAP") ||
    csLimpo.startsWith("AFP") ||
    csLimpo.startsWith("MERLIN") ||
    csLimpo.startsWith("JAGUAR") ||
    csLimpo.startsWith("HULK") ||
    csLimpo.startsWith("TURBO") ||
    csLimpo.startsWith("ROMA") ||
    csLimpo.startsWith("ZULU") ||
    csLimpo.startsWith("MILLENNIUM") ||
    csLimpo.startsWith("KOALA") ||
    voo[2] === "29807";

  if (isFap) {
    icao = "FAP";
    iata = "FAP";
    info = COMPANHIAS.FAP;
  }

  const rotaReal = rotasMap ? (rotasMap[csLimpo] || rotasMap[cs]) : null;
  const numeroVoo = csLimpo || voo[0].toUpperCase();
  const callsignIata = rotaReal?.flightNumber || rotaReal?.callsignIata || null;

  let nomeCompanhia = info
    ? info.nome
    : csLimpo.length >= 3
      ? `VOO ${csLimpo}`
      : "AVIAÇÃO GERAL";

  if (isFap) {
    nomeCompanhia = "FORÇA AÉREA PORTUGUESA";
  }

  let origem = "ORIGEM";
  let destino = "DESTINO";
  let origemCode = "---";
  let destinoCode = "---";

  if (isFap) {
    origem = "BASE AÉREA";
    origemCode = "FAP";
    destino = "MISSÃO TÁTICA";
    destinoCode = "OPS";
  } else if (rotaReal) {
    if (rotaReal.originIata) origemCode = rotaReal.originIata;
    else if (rotaReal.originIcao) origemCode = rotaReal.originIcao;
    if (rotaReal.originCity) origem = rotaReal.originCity.toUpperCase();

    if (rotaReal.destinationIata) destinoCode = rotaReal.destinationIata;
    else if (rotaReal.destinationIcao) destinoCode = rotaReal.destinationIcao;
    if (rotaReal.destinationCity) destino = rotaReal.destinationCity.toUpperCase();
  }

  let origemPais = rotaReal?.origemPais || "";
  let destinoPais = rotaReal?.destinoPais || "";
  if (isFap) {
    origemPais = "PORTUGAL";
    destinoPais = "PORTUGAL";
  } else {
    if (!origemPais && origemCode && origemCode !== "---" && origemCode !== "N/D") {
      origemPais = obterPaisDoAeroporto(origemCode);
    }
    if (!destinoPais && destinoCode && destinoCode !== "---" && destinoCode !== "N/D") {
      destinoPais = obterPaisDoAeroporto(destinoCode);
    }
  }

  let origemAeroporto = rotaReal?.origemAeroporto || "";
  let destinoAeroporto = rotaReal?.destinoAeroporto || "";

  if (isFap) {
    if (origemCode === "OVR") origemAeroporto = "BA8 OVAR";
    else if (origemCode === "MTO") origemAeroporto = "BA6 MONTIJO";
    else if (origemCode === "MTR") origemAeroporto = "BA5 MONTE REAL";
    else if (origemCode === "BYJ") origemAeroporto = "BA11 BEJA";
    else origemAeroporto = "BASE AÉREA";

    if (destinoCode === "OPS") destinoAeroporto = "MISSÃO TÁTICA";
    else if (destinoCode === "SAR") destinoAeroporto = "BUSCA E SALVAMENTO";
    else if (destinoCode === "CAP") destinoAeroporto = "PATRULHA AÉREA";
    else destinoAeroporto = "OPERAÇÕES";
  } else {
    if (!origemAeroporto && origemCode && origemCode !== "---" && origemCode !== "N/D") {
      origemAeroporto = obterNomeAeroporto(origemCode);
    }

    if (!destinoAeroporto && destinoCode && destinoCode !== "---" && destinoCode !== "N/D") {
      destinoAeroporto = obterNomeAeroporto(destinoCode);
    }
  }

  const altMetros = voo[7] || voo[13] || 0;
  const altitudeMetros = Math.round(altMetros);
  const altitudePes = Math.round(altMetros * 3.28084);
  const velMs = voo[9] || 0;
  const velocidadeKts = Math.round(velMs * 1.94384);
  const velocidadeKmh = Math.round(velMs * 3.6);
  const rumo = Math.round(voo[10] || 0);

  const aeronave = rotaReal?.aircraftName || rotaReal?.aircraftType || (isFap ? "AERONAVE MILITAR" : "AERONAVE COMERCIAL");

  return {
    icao,
    iata,
    callsign: csLimpo,
    callsignIata,
    numeroVoo,
    nomeCompanhia,
    origem,
    destino,
    origemCode,
    destinoCode,
    origemPais,
    origemAeroporto,
    destinoPais,
    destinoAeroporto,
    altitudePes,
    altitudeMetros,
    velocidadeKts,
    velocidadeKmh,
    rumo,
    aeronave,
    paisOrigem: voo[2] || "Desconhecido",
  };
}

// ─── Emblema Roundel da Força Aérea Portuguesa (Cruz de Cristo) ──────────────

function RoundelFAP() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-0.5 select-none">
      <svg viewBox="0 0 100 100" className="w-6 h-6 sm:w-8 sm:h-8 shrink-0 drop-shadow-md">
        <circle cx="50" cy="50" r="48" fill="#030712" stroke="#dc2626" strokeWidth="2.5" />
        <polygon points="44,45 56,45 66,18 34,18" fill="#cc141d" />
        <polygon points="44,55 56,55 66,82 34,82" fill="#cc141d" />
        <polygon points="45,44 45,56 18,66 18,34" fill="#cc141d" />
        <polygon points="55,44 55,56 82,66 82,34" fill="#cc141d" />
        <rect x="44" y="44" width="12" height="12" fill="#cc141d" />
        <polygon points="34,18 66,18 64,15 36,15" fill="#a00f16" />
        <polygon points="34,82 66,82 64,85 36,85" fill="#a00f16" />
        <polygon points="18,34 18,66 15,64 15,36" fill="#a00f16" />
        <polygon points="82,34 82,66 85,64 85,36" fill="#a00f16" />
        <rect x="47.5" y="21" width="5" height="58" fill="#f8fafc" />
        <rect x="21" y="47.5" width="58" height="5" fill="#f8fafc" />
      </svg>
      <span className="font-mono font-black text-[5px] sm:text-[6px] text-red-400 tracking-widest uppercase leading-none mt-0.5">
        FORÇA AÉREA
      </span>
    </div>
  );
}

// ─── Logótipo da Companhia Aérea ──────────────────────────────────────────────

interface AirlineLogoProps {
  icao?: string;
  iata?: string | null;
  nome: string;
  callsign?: string;
}

function AirlineLogo({ icao, iata, nome, callsign }: AirlineLogoProps) {
  const [urlIndex, setUrlIndex] = useState(0);
  const [hasFailed, setHasFailed] = useState(false);

  const isMilitarFap =
    icao === "FAP" ||
    icao === "AFP" ||
    (nome && nome.includes("FORÇA AÉREA PORTUGUESA")) ||
    (callsign && callsign.startsWith("BLACK"));

  const urls = useMemo(() => {
    if (isMilitarFap) return [];
    const list: string[] = [];
    const icaoUp = (icao || "").trim().toUpperCase();
    const iataUp = (iata || "").trim().toUpperCase();

    if (icaoUp.length === 3 && /^[A-Z]{3}$/.test(icaoUp)) {
      list.push(`https://raw.githubusercontent.com/Jxck-S/airline-logos/main/flightaware_logos/${icaoUp}.png`);
      list.push(`https://raw.githubusercontent.com/Jxck-S/airline-logos/main/custom_logos/${icaoUp}.png`);
    }
    if (iataUp.length === 2 && /^[A-Z0-9]{2}$/.test(iataUp)) {
      list.push(`https://pics.avs.io/200/200/${iataUp}.png`);
    }
    return list;
  }, [icao, iata, isMilitarFap]);

  useEffect(() => {
    setUrlIndex(0);
    setHasFailed(false);
  }, [icao, iata, callsign]);

  if (isMilitarFap) {
    return (
      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg border border-red-500/50 shadow-md flex items-center justify-center shrink-0 overflow-hidden bg-black p-0.5">
        <RoundelFAP />
      </div>
    );
  }

  const handleImgError = () => {
    if (urlIndex + 1 < urls.length) {
      setUrlIndex((prev) => prev + 1);
    } else {
      setHasFailed(true);
    }
  };

  const srcAtual = !hasFailed && urls.length > 0 ? urls[urlIndex] : null;

  const siglaEmblema =
    icao && icao.length === 3 && /^[A-Z]{3}$/.test(icao)
      ? icao
      : callsign
        ? callsign.slice(0, 3)
        : "AIR";

  return (
    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg border border-neutral-700 shadow-md flex items-center justify-center shrink-0 overflow-hidden bg-white p-1 transition-all">
      {srcAtual ? (
        <Image
          key={srcAtual}
          src={srcAtual}
          alt={nome}
          width={48}
          height={48}
          className="object-contain max-h-full max-w-full"
          onError={handleImgError}
          unoptimized
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-neutral-900 via-neutral-950 to-black rounded-md flex flex-col items-center justify-center p-0.5 border border-white/10 shadow-inner">
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-400 opacity-90 drop-shadow mb-0.5" fill="currentColor">
            <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
          </svg>
          <span className="font-mono font-black text-[6px] sm:text-[7px] text-amber-300 tracking-wider leading-none truncate max-w-full text-center">
            {siglaEmblema}
          </span>
        </div>
      )}
    </div>
  );
}

// ─── Página Principal de Lista de Voos Restantes (/voos) ──────────────────────

export default function ListaVoosRestantes() {
  const router = useRouter();
  const [listaVoos, setListaVoos] = useState<EstadoVoo[]>([]);
  const [rotasMap, setRotasMap] = useState<Record<string, any>>({});
  const [localizacao, setLocalizacao] = useState<InfoLocalizacao>(LOCALIZACAO_PADRAO);
  const [carregando, setCarregando] = useState(true);
  const [horaAtual, setHoraAtual] = useState("12:00:00");
  const [unidadeAltitude, setUnidadeAltitude] = useState<"FT" | "MT">("FT");
  const [unidadeVelocidade, setUnidadeVelocidade] = useState<"KTS" | "KMH">("KTS");

  // Gestos de Swipe lateral (arrastar para a direita volta ao painel)
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const lidarComInicioArrasto = (e: React.TouchEvent | React.MouseEvent) => {
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    touchStartX.current = clientX;
    touchStartY.current = clientY;
  };

  const lidarComFimArrasto = (e: React.TouchEvent | React.MouseEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const clientX = "changedTouches" in e ? e.changedTouches[0].clientX : e.clientX;
    const clientY = "changedTouches" in e ? e.changedTouches[0].clientY : e.clientY;
    const deltaX = clientX - touchStartX.current;
    const deltaY = clientY - touchStartY.current;
    touchStartX.current = null;
    touchStartY.current = null;

    // Arrastar nítido para a direita -> Voltar ao painel principal
    if (deltaX > 45 && Math.abs(deltaX) > Math.abs(deltaY) * 1.2) {
      router.push("/painel");
    }
  };

  // Ler preferências de unidades do utilizador
  useEffect(() => {
    try {
      const configSalva = localStorage.getItem("flight_panel_user_settings");
      if (configSalva) {
        const parsed = JSON.parse(configSalva);
        if (parsed.unidadeAltitude === "FT" || parsed.unidadeAltitude === "MT") {
          setUnidadeAltitude(parsed.unidadeAltitude);
        }
        if (parsed.unidadeVelocidade === "KTS" || parsed.unidadeVelocidade === "KMH") {
          setUnidadeVelocidade(parsed.unidadeVelocidade);
        }
      }
    } catch { }
  }, []);

  // Relógio em tempo real
  useEffect(() => {
    const tick = () => {
      setHoraAtual(new Date().toLocaleTimeString("pt-PT"));
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, []);

  // Activação automática de ecrã inteiro (Fullscreen)
  useEffect(() => {
    const acionarFs = () => {
      if (typeof window !== "undefined" && "wakeLock" in navigator) {
        (navigator as any).wakeLock.request("screen").catch(() => { });
      }

      if (typeof document !== "undefined") {
        const doc = document as Document & {
          webkitFullscreenElement?: Element;
          mozFullScreenElement?: Element;
          msFullscreenElement?: Element;
        };
        const docEl = document.documentElement as HTMLElement & {
          webkitRequestFullscreen?: () => Promise<void>;
          mozRequestFullScreen?: () => Promise<void>;
          msRequestFullscreen?: () => Promise<void>;
        };

        const isFs = !!(doc.fullscreenElement || doc.webkitFullscreenElement || doc.mozFullScreenElement || doc.msFullscreenElement);
        if (!isFs) {
          if (docEl.requestFullscreen) {
            docEl.requestFullscreen().catch(() => { });
          } else if (docEl.webkitRequestFullscreen) {
            docEl.webkitRequestFullscreen().catch(() => { });
          } else if (docEl.mozRequestFullScreen) {
            docEl.mozRequestFullScreen().catch(() => { });
          } else if (docEl.msRequestFullscreen) {
            docEl.msRequestFullscreen().catch(() => { });
          }
        }
      }
    };

    acionarFs();

    const onUserInteraction = () => {
      acionarFs();
    };

    window.addEventListener("pointerdown", onUserInteraction, { passive: true });
    window.addEventListener("click", onUserInteraction, { passive: true });
    window.addEventListener("touchstart", onUserInteraction, { passive: true });
    window.addEventListener("keydown", onUserInteraction, { passive: true });

    return () => {
      window.removeEventListener("pointerdown", onUserInteraction);
      window.removeEventListener("click", onUserInteraction);
      window.removeEventListener("touchstart", onUserInteraction);
      window.removeEventListener("keydown", onUserInteraction);
    };
  }, []);

  // 1. Carregar de imediato os dados em cache do painel
  useEffect(() => {
    try {
      const cached = sessionStorage.getItem("flight_panel_radar_data");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.voos && Array.isArray(parsed.voos)) {
          setListaVoos(parsed.voos);
        }
        if (parsed.rotas) {
          setRotasMap(parsed.rotas);
        }
        if (parsed.localizacao) {
          setLocalizacao((ant) => ({ ...ant, ...parsed.localizacao }));
        }
        setCarregando(false);
      }
    } catch { }

    try {
      const locSalva = localStorage.getItem("flight_panel_user_location");
      if (locSalva) {
        const parsedLoc = JSON.parse(locSalva);
        if (parsedLoc.lat && parsedLoc.lon) {
          setLocalizacao(parsedLoc);
        }
      }
    } catch { }
  }, []);

  // 2. Polling contínuo para manter os voos sincronizados a cada 15 segundos
  const buscarVoos = useCallback(async () => {
    try {
      const refLat = localizacao.lat;
      const refLon = localizacao.lon;
      const params = new URLSearchParams({
        lat: refLat.toString(),
        lon: refLon.toString(),
        radius: "20",
      });

      const res = await fetch(`/api/voos?${params.toString()}`);
      const dados = await res.json();

      if (dados.rotas && Object.keys(dados.rotas).length > 0) {
        setRotasMap((prev) => ({ ...prev, ...dados.rotas }));
      }

      if (dados.estados && Array.isArray(dados.estados)) {
        const voosEmAr = dados.estados.filter((v: EstadoVoo) => {
          if (v[8]) return false;
          if (v[6] == null || v[5] == null) return false;
          const dist = calcularDistanciaHaversineKm(refLat, refLon, v[6], v[5]);
          return dist <= 20;
        });

        voosEmAr.sort((a: EstadoVoo, b: EstadoVoo) => {
          const distA = a[6] != null && a[5] != null ? calcularDistanciaHaversineKm(refLat, refLon, a[6], a[5]) : 9999;
          const distB = b[6] != null && b[5] != null ? calcularDistanciaHaversineKm(refLat, refLon, b[6], b[5]) : 9999;
          return distA - distB;
        });

        setListaVoos(voosEmAr);

        try {
          sessionStorage.setItem(
            "flight_panel_radar_data",
            JSON.stringify({
              voos: voosEmAr,
              rotas: dados.rotas || {},
              localizacao: { lat: refLat, lon: refLon, nome: localizacao.nome },
              atualizadoEm: Date.now(),
            })
          );
        } catch { }
      }
    } catch {
      // Manter estado actual em caso de falha de rede temporária
    } finally {
      setCarregando(false);
    }
  }, [localizacao]);

  useEffect(() => {
    buscarVoos();
    const interval = setInterval(buscarVoos, 15000);
    return () => clearInterval(interval);
  }, [buscarVoos]);

  // Voo 0 é o principal (em exibição no painel)
  const vooPrincipal = listaVoos.length > 0 ? listaVoos[0] : null;
  // Voos restantes (mais distantes)
  const voosRestantes = listaVoos.length > 1 ? listaVoos.slice(1) : [];

  return (
    <main
      onTouchStart={lidarComInicioArrasto}
      onTouchEnd={lidarComFimArrasto}
      onMouseDown={lidarComInicioArrasto}
      onMouseUp={lidarComFimArrasto}
      className="min-h-screen w-full bg-[#050608] text-white p-3 sm:p-6 font-mono select-none overflow-y-auto"
    >
      <div className="max-w-4xl mx-auto flex flex-col gap-4 sm:gap-6 pb-8">

        {/* ── CABEÇALHO COM BOTÃO DE REGRESSO E INFORMAÇÃO DA ESTAÇÃO ── */}
        <header className="bg-[#0c0e14] border border-white/15 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/painel"
              className="flex items-center gap-2 bg-sky-500/20 hover:bg-sky-500/35 active:scale-95 text-sky-300 hover:text-white px-3 py-1.5 rounded-lg border border-sky-400/40 text-xs sm:text-sm font-bold font-mono transition-all cursor-pointer shadow-md"
            >
              <span>←</span>
              <span>VOLTAR AO PAINEL</span>
            </Link>
            <div>
              <h1 className="text-sm sm:text-base font-black tracking-wider text-white uppercase flex items-center gap-2">
                <span>RADAR ADS-B</span>
                <span className="text-[9px] sm:text-[10px] bg-emerald-950/80 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30 font-mono">
                  {horaAtual}
                </span>
              </h1>
              <p className="text-[10px] sm:text-xs text-neutral-400">
                📍 {localizacao.nome} • RAIO CIRCULAR DE 20 KM
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="bg-white/10 px-2.5 py-1 rounded-lg border border-white/15 text-neutral-300 font-bold">
              NO AR: <strong className="text-amber-400">{listaVoos.length}</strong>
            </span>
            <span className="bg-sky-500/15 px-2.5 py-1 rounded-lg border border-sky-500/30 text-sky-300 font-bold">
              RESTANTES: <strong className="text-white">{voosRestantes.length}</strong>
            </span>
          </div>
        </header>

        {/* ── VOO ACTIVO NO PAINEL PRINCIPAL (MAIS PRÓXIMO) ── */}
        {vooPrincipal && (() => {
          const info = resolverVooInfo(vooPrincipal, rotasMap);
          const distKm =
            vooPrincipal[6] != null && vooPrincipal[5] != null
              ? calcularDistanciaHaversineKm(localizacao.lat, localizacao.lon, vooPrincipal[6], vooPrincipal[5]).toFixed(1)
              : "--";

          return (
            <section className="bg-gradient-to-r from-emerald-950/40 via-[#10131d] to-[#0c0e14] border border-emerald-500/30 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-lg flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-emerald-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  VOO PRINCIPAL EM DESTAQUE NO PAINEL
                </span>
                <span className="text-xs sm:text-sm font-bold text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
                  📍 {distKm} KM (MAIS PRÓXIMO)
                </span>
              </div>

              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <AirlineLogo icao={info.icao} iata={info.iata} nome={info.nomeCompanhia} callsign={info.callsign} />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm sm:text-lg font-black text-white tracking-tight">
                        {info.numeroVoo}
                      </span>
                      {info.callsignIata && info.callsignIata !== info.numeroVoo && (
                        <span className="text-[9px] sm:text-xs text-sky-400 bg-sky-400/10 px-1.5 py-0.2 rounded border border-sky-400/20 font-bold">
                          {info.callsignIata}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] sm:text-xs text-neutral-400 truncate">
                      {info.nomeCompanhia} • {info.aeronave}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xs sm:text-sm font-black text-amber-400">
                    {info.origemCode} ➔ {info.destinoCode}
                  </div>
                  <div className="text-[10px] sm:text-xs text-neutral-200 font-bold">
                    <span>{info.origem}</span>
                    {info.origemAeroporto && <span className="text-amber-300/90 font-mono ml-1 font-semibold">({info.origemAeroporto})</span>}
                    {info.origemPais && <span className="text-sky-400 text-[9px] sm:text-[10px] font-mono ml-1">[{info.origemPais}]</span>}
                    <span className="text-amber-400 mx-1.5">➔</span>
                    <span>{info.destino}</span>
                    {info.destinoAeroporto && <span className="text-amber-300/90 font-mono ml-1 font-semibold">({info.destinoAeroporto})</span>}
                    {info.destinoPais && <span className="text-sky-400 text-[9px] sm:text-[10px] font-mono ml-1">[{info.destinoPais}]</span>}
                  </div>
                  <div className="text-[9px] sm:text-[10px] text-neutral-300 font-mono mt-0.5">
                    {unidadeAltitude === "FT" ? info.altitudePes : info.altitudeMetros} {unidadeAltitude} • {unidadeVelocidade === "KTS" ? info.velocidadeKts : info.velocidadeKmh} {unidadeVelocidade === "KTS" ? "KTS" : "KMS"} • {info.rumo}°
                  </div>
                </div>
              </div>
            </section>
          );
        })()}

        {/* ── LISTA DOS VOOS RESTANTES MAIS DISTANTES ── */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs sm:text-sm font-black tracking-widest uppercase text-neutral-300 flex items-center gap-2">
              <span>✈️ VOOS RESTANTES NO ESPAÇO AÉREO</span>
              <span className="text-[10px] text-neutral-400 font-normal">
                (ORDENADOS POR DISTÂNCIA)
              </span>
            </h2>
            <span className="text-[10px] text-neutral-400 font-mono">
              TOTAL: {voosRestantes.length}
            </span>
          </div>

          {carregando && voosRestantes.length === 0 && (
            <div className="bg-[#10121a] p-8 rounded-xl border border-white/10 text-center text-neutral-400 text-xs sm:text-sm font-mono flex flex-col items-center justify-center gap-2">
              <span className="w-5 h-5 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
              <span>A CARREGAR DADOS DO RADAR...</span>
            </div>
          )}

          {!carregando && voosRestantes.length === 0 && (
            <div className="bg-[#10121a] p-8 rounded-xl border border-white/10 text-center text-neutral-400 text-xs sm:text-sm font-mono flex flex-col items-center justify-center gap-2">
              <span className="text-2xl">📡</span>
              <span className="text-neutral-200 font-bold">NÃO HÁ OUTROS VOOS MAIS DISTANTES DETETADOS</span>
              <span className="text-[11px] text-neutral-400 max-w-md">
                {vooPrincipal
                  ? "Apenas o voo principal acima está a sobrevoar a zona circular de 20 km neste momento."
                  : "Não foram detetadas aeronaves comerciais no raio de 20 km."}
              </span>
            </div>
          )}

          <div className="flex flex-col gap-2.5">
            {voosRestantes.map((voo, idx) => {
              const info = resolverVooInfo(voo, rotasMap);
              const distKm =
                voo[6] != null && voo[5] != null
                  ? calcularDistanciaHaversineKm(localizacao.lat, localizacao.lon, voo[6], voo[5]).toFixed(1)
                  : "--";

              return (
                <div
                  key={voo[0] || idx}
                  className="bg-[#10121a] hover:bg-[#141824] border border-white/10 hover:border-white/20 rounded-xl p-3 sm:p-4 shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  {/* Esquerda: Ordem, Logótipo, Voo e Aeronave */}
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs font-bold text-neutral-400 font-mono w-6 text-center shrink-0">
                      #{idx + 2}
                    </span>

                    <AirlineLogo icao={info.icao} iata={info.iata} nome={info.nomeCompanhia} callsign={info.callsign} />

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm sm:text-base font-black text-white tracking-wider">
                          {info.numeroVoo}
                        </span>
                        {info.callsignIata && info.callsignIata !== info.numeroVoo && (
                          <span className="text-[9px] sm:text-[10px] text-sky-400 bg-sky-400/10 px-1.5 py-0.5 rounded border border-sky-400/20 font-bold font-mono">
                            {info.callsignIata}
                          </span>
                        )}
                        <span className="text-[9px] sm:text-[10px] text-neutral-400 font-mono bg-white/5 px-1.5 py-0.5 rounded border border-white/10">
                          {info.paisOrigem}
                        </span>
                      </div>
                      <p className="text-[10px] sm:text-xs text-neutral-400 truncate mt-0.5 font-bold">
                        {info.nomeCompanhia}
                      </p>
                      <p className="text-[9px] sm:text-[10px] text-neutral-300 truncate">
                        {info.aeronave}
                      </p>
                    </div>
                  </div>

                  {/* Direita: Rota, Telemetria e Distância */}
                  <div className="flex items-end sm:items-end justify-between sm:justify-center flex-row sm:flex-col gap-1 shrink-0 border-t sm:border-t-0 border-white/5 pt-2 sm:pt-0">
                    {/* Distância */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs sm:text-sm font-black text-sky-400 bg-sky-950/60 px-2 py-0.5 rounded border border-sky-500/30 tabular-nums">
                        📍 {distKm} KM
                      </span>
                    </div>

                    {/* Rota */}
                    <div className="text-right">
                      <div className="text-xs sm:text-sm font-black text-amber-400">
                        {info.origemCode} ➔ {info.destinoCode}
                      </div>
                      <div className="text-[9px] sm:text-[10px] text-neutral-300 font-bold truncate max-w-[280px]">
                        <span>{info.origem}</span>
                        {info.origemAeroporto && <span className="text-amber-300/90 font-mono ml-0.5">({info.origemAeroporto})</span>}
                        {info.origemPais && <span className="text-sky-400 font-mono ml-0.5">[{info.origemPais}]</span>}
                        <span className="text-amber-400 mx-1">➔</span>
                        <span>{info.destino}</span>
                        {info.destinoAeroporto && <span className="text-amber-300/90 font-mono ml-0.5">({info.destinoAeroporto})</span>}
                        {info.destinoPais && <span className="text-sky-400 font-mono ml-0.5">[{info.destinoPais}]</span>}
                      </div>
                    </div>

                    {/* Telemetria */}
                    <div className="text-[9px] sm:text-[10px] text-neutral-300 font-mono text-right flex items-center gap-1.5">
                      <span>{unidadeAltitude === "FT" ? info.altitudePes : info.altitudeMetros} {unidadeAltitude}</span>
                      <span>•</span>
                      <span>{unidadeVelocidade === "KTS" ? info.velocidadeKts : info.velocidadeKmh} {unidadeVelocidade === "KTS" ? "KTS" : "KMS"}</span>
                      <span>•</span>
                      <span>{info.rumo}°</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

      </div>
    </main>
  );
}

