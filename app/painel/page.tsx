"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import Image from "next/image";

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

interface DadosMeteo {
  weather: Array<{ description: string; main: string }>;
  main: { temp: number; humidity: number; feels_like?: number };
  wind: { speed: number };
  name: string;
}

interface InfoCompanhia {
  nome: string;
  iata: string;
  origem: string;
  destino: string;
  origemCode: string;
  destinoCode: string;
  aeronave: string;
}

const INTERVALO_MS = 10_000;

// ─── Mapeamento de Países para Cidades / Aeroportos de Ligação ────────────────

const CIDADES_PAISES: Record<string, { cidade: string; code: string }> = {
  SPAIN: { cidade: "MADRID", code: "MAD" },
  FRANCE: { cidade: "PARIS", code: "CDG" },
  "UNITED KINGDOM": { cidade: "LONDRES", code: "LHR" },
  GERMANY: { cidade: "FRANKFURT", code: "FRA" },
  SWITZERLAND: { cidade: "ZURIQUE", code: "ZRH" },
  NETHERLANDS: { cidade: "AMSTERDAO", code: "AMS" },
  ITALY: { cidade: "ROMA", code: "FCO" },
  BELGIUM: { cidade: "BRUXELAS", code: "BRU" },
  IRELAND: { cidade: "DUBLIN", code: "DUB" },
  AUSTRIA: { cidade: "VIENA", code: "VIE" },
  POLAND: { cidade: "VARSOVIA", code: "WAW" },
  LUXEMBOURG: { cidade: "LUXEMBURGO", code: "LUX" },
  NORWAY: { cidade: "OSLO", code: "OSL" },
  SWEDEN: { cidade: "ESTOCOLMO", code: "ARN" },
  DENMARK: { cidade: "COPENHAGA", code: "CPH" },
  TURKEY: { cidade: "ISTAMBUL", code: "IST" },
  "UNITED ARAB EMIRATES": { cidade: "DUBAI", code: "DXB" },
  "UNITED STATES": { cidade: "NOVA IORQUE", code: "JFK" },
  BRAZIL: { cidade: "SAO PAULO", code: "GRU" },
  PORTUGAL: { cidade: "LISBOA", code: "LIS" },
};

// ─── Dicionário Expandido de Companhias Aéreas ────────────────────────────────

const COMPANHIAS: Record<string, InfoCompanhia> = {
  // Principais em Portugal
  TAP: { nome: "TAP AIR PORTUGAL", iata: "TP", origem: "PORTO", destino: "LISBOA", origemCode: "OPO", destinoCode: "LIS", aeronave: "A320-251N" },
  RYR: { nome: "RYANAIR", iata: "FR", origem: "PORTO", destino: "MADRID", origemCode: "OPO", destinoCode: "MAD", aeronave: "B737-800" },
  RUK: { nome: "RYANAIR UK", iata: "RK", origem: "LONDRES", destino: "PORTO", origemCode: "STN", destinoCode: "OPO", aeronave: "B737-800" },
  EJU: { nome: "EASYJET EUROPE", iata: "U2", origem: "PORTO", destino: "PARIS", origemCode: "OPO", destinoCode: "CDG", aeronave: "A320-214" },
  EZY: { nome: "EASYJET UK", iata: "U2", origem: "LONDRES", destino: "PORTO", origemCode: "LGW", destinoCode: "OPO", aeronave: "A320-214" },
  EZS: { nome: "EASYJET SWISS", iata: "DS", origem: "ZURIQUE", destino: "PORTO", origemCode: "ZRH", destinoCode: "OPO", aeronave: "A320-214" },
  
  // Charter e Companhias UK / Europa
  AWC: { nome: "TITAN AIRWAYS", iata: "ZT", origem: "LONDRES", destino: "PORTO", origemCode: "STN", destinoCode: "OPO", aeronave: "A321NEO" },
  EXS: { nome: "JET2.COM", iata: "LS", origem: "MANCHESTER", destino: "PORTO", origemCode: "MAN", destinoCode: "OPO", aeronave: "B737-800" },
  BAW: { nome: "BRITISH AIRWAYS", iata: "BA", origem: "LONDRES", destino: "PORTO", origemCode: "LHR", destinoCode: "OPO", aeronave: "A320-232" },
  TOM: { nome: "TUI AIRWAYS", iata: "BY", origem: "LONDRES", destino: "PORTO", origemCode: "LGW", destinoCode: "OPO", aeronave: "B737-800" },
  TUI: { nome: "TUI FLY", iata: "TB", origem: "BRUXELAS", destino: "PORTO", origemCode: "BRU", destinoCode: "OPO", aeronave: "B737-800" },

  // Espanha
  AEA: { nome: "AIR EUROPA", iata: "UX", origem: "MADRID", destino: "PORTO", origemCode: "MAD", destinoCode: "OPO", aeronave: "B737-800" },
  IBE: { nome: "IBERIA", iata: "IB", origem: "MADRID", destino: "PORTO", origemCode: "MAD", destinoCode: "OPO", aeronave: "A320-200" },
  IBS: { nome: "IBERIA EXPRESS", iata: "I2", origem: "MADRID", destino: "PORTO", origemCode: "MAD", destinoCode: "OPO", aeronave: "A320-200" },
  VLG: { nome: "VUELING", iata: "VY", origem: "BARCELONA", destino: "PORTO", origemCode: "BCN", destinoCode: "OPO", aeronave: "A320-232" },
  VOE: { nome: "VOLOTEA", iata: "V7", origem: "NANTES", destino: "PORTO", origemCode: "NTE", destinoCode: "OPO", aeronave: "A319-100" },
  OBS: { nome: "ORBEST", iata: "6O", origem: "LISBOA", destino: "PORTO", origemCode: "LIS", destinoCode: "OPO", aeronave: "A330-900" },

  // França e Benelux
  AFR: { nome: "AIR FRANCE", iata: "AF", origem: "PARIS", destino: "PORTO", origemCode: "CDG", destinoCode: "OPO", aeronave: "A320-200" },
  TVF: { nome: "TRANSAVIA FRANCE", iata: "TO", origem: "PARIS", destino: "PORTO", origemCode: "ORY", destinoCode: "OPO", aeronave: "B737-800" },
  TRA: { nome: "TRANSAVIA", iata: "HV", origem: "AMSTERDAO", destino: "PORTO", origemCode: "AMS", destinoCode: "OPO", aeronave: "B737-800" },
  KLM: { nome: "KLM ROYAL DUTCH", iata: "KL", origem: "AMSTERDAO", destino: "PORTO", origemCode: "AMS", destinoCode: "OPO", aeronave: "B737-800" },
  BEL: { nome: "BRUSSELS AIRLINES", iata: "SN", origem: "BRUXELAS", destino: "PORTO", origemCode: "BRU", destinoCode: "OPO", aeronave: "A319-100" },
  LGL: { nome: "LUXAIR", iata: "LG", origem: "LUXEMBURGO", destino: "PORTO", origemCode: "LUX", destinoCode: "OPO", aeronave: "DASH 8-400" },

  // Centro e Leste Europeu
  DLH: { nome: "LUFTHANSA", iata: "LH", origem: "FRANKFURT", destino: "PORTO", origemCode: "FRA", destinoCode: "OPO", aeronave: "A321-271NX" },
  SWR: { nome: "SWISS AIR LINES", iata: "LX", origem: "ZURIQUE", destino: "PORTO", origemCode: "ZRH", destinoCode: "OPO", aeronave: "A220-300" },
  AUA: { nome: "AUSTRIAN AIRLINES", iata: "OS", origem: "VIENA", destino: "PORTO", origemCode: "VIE", destinoCode: "OPO", aeronave: "A320-200" },
  WZZ: { nome: "WIZZ AIR", iata: "W6", origem: "BUDAPESTE", destino: "PORTO", origemCode: "BUD", destinoCode: "OPO", aeronave: "A321NEO" },
  WUK: { nome: "WIZZ AIR UK", iata: "W9", origem: "LONDRES", destino: "PORTO", origemCode: "LTN", destinoCode: "OPO", aeronave: "A321NEO" },
  LOT: { nome: "LOT POLISH", iata: "LO", origem: "VARSOVIA", destino: "PORTO", origemCode: "WAW", destinoCode: "OPO", aeronave: "B737-800" },
  NOZ: { nome: "NORWEGIAN", iata: "DY", origem: "OSLO", destino: "PORTO", origemCode: "OSL", destinoCode: "OPO", aeronave: "B737 MAX 8" },
  FIN: { nome: "FINNAIR", iata: "AY", origem: "HELSINQUIA", destino: "PORTO", origemCode: "HEL", destinoCode: "OPO", aeronave: "A321-200" },
  SAS: { nome: "SCANDINAVIAN AIRLINES", iata: "SK", origem: "ESTOCOLMO", destino: "PORTO", origemCode: "ARN", destinoCode: "OPO", aeronave: "A320NEO" },

  // Roménia
  ROT: { nome: "TAROM", iata: "RO", origem: "BUCARESTE", destino: "PORTO", origemCode: "OTP", destinoCode: "OPO", aeronave: "B737-800" },
  BMS: { nome: "BLUE AIR", iata: "0B", origem: "BUCARESTE", destino: "PORTO", origemCode: "OTP", destinoCode: "OPO", aeronave: "B737-800" },
  JOC: { nome: "DAN AIR", iata: "DN", origem: "BRASOV", destino: "PORTO", origemCode: "GHV", destinoCode: "OPO", aeronave: "A320-200" },
  KRP: { nome: "CARPATAIR", iata: "V3", origem: "TIMISOARA", destino: "PORTO", origemCode: "TSR", destinoCode: "OPO", aeronave: "A319-100" },
  LIL: { nome: "FLY LILI", iata: "LIL", origem: "BRASOV", destino: "PORTO", origemCode: "GHV", destinoCode: "OPO", aeronave: "A320-200" },
  ANX: { nome: "ANIMAWINGS", iata: "A2", origem: "BUCARESTE", destino: "PORTO", origemCode: "OTP", destinoCode: "OPO", aeronave: "A220-300" },

  // Aviação Executiva e Charter Internacional
  NJE: { nome: "NETJETS EUROPE", iata: "1I", origem: "LONDRES", destino: "PORTO", origemCode: "EGGW", destinoCode: "OPO", aeronave: "CITATION LATITUDE" },
  EJA: { nome: "NETJETS US", iata: "QS", origem: "NOVA IORQUE", destino: "PORTO", origemCode: "TEB", destinoCode: "OPO", aeronave: "CHALLENGER 350" },
  VJT: { nome: "VISTAJET", iata: "VJ", origem: "GENEBRA", destino: "PORTO", origemCode: "GVA", destinoCode: "OPO", aeronave: "GLOBAL 6000" },
  GES: { nome: "GESTAIR", iata: "GP", origem: "MADRID", destino: "PORTO", origemCode: "MAD", destinoCode: "OPO", aeronave: "CITATION XLS" },
  TAG: { nome: "TAG AVIATION", iata: "FP", origem: "FARNBOROUGH", destino: "PORTO", origemCode: "FAB", destinoCode: "OPO", aeronave: "FALCON 2000" },

  // Mediterrâneo e Médio Oriente
  THY: { nome: "TURKISH AIRLINES", iata: "TK", origem: "ISTAMBUL", destino: "PORTO", origemCode: "IST", destinoCode: "OPO", aeronave: "A321NEO" },
  AEE: { nome: "AEGEAN AIRLINES", iata: "A3", origem: "ATENAS", destino: "PORTO", origemCode: "ATH", destinoCode: "OPO", aeronave: "A320NEO" },
  UAE: { nome: "EMIRATES", iata: "EK", origem: "DUBAI", destino: "PORTO", origemCode: "DXB", destinoCode: "OPO", aeronave: "B777-300ER" },
  QTR: { nome: "QATAR AIRWAYS", iata: "QR", origem: "DOHA", destino: "LISBOA", origemCode: "DOH", destinoCode: "LIS", aeronave: "B787-9" },
  AZA: { nome: "ITA AIRWAYS", iata: "AZ", origem: "ROMA", destino: "PORTO", origemCode: "FCO", destinoCode: "OPO", aeronave: "A320NEO" },
  ITY: { nome: "ITA AIRWAYS", iata: "AZ", origem: "ROMA", destino: "PORTO", origemCode: "FCO", destinoCode: "OPO", aeronave: "A320NEO" },
};

// ─── Prefixos Internacionais de Matrícula Aeronáutica ──────────────────────────

const PREFIXOS_REGISTO: Record<string, { pais: string; cidade: string; code: string }> = {
  YR: { pais: "ROMÉNIA", cidade: "BUCARESTE", code: "OTP" },
  CS: { pais: "PORTUGAL", cidade: "LISBOA", code: "LIS" },
  CR: { pais: "PORTUGAL", cidade: "LISBOA", code: "LIS" },
  EC: { pais: "ESPANHA", cidade: "MADRID", code: "MAD" },
  OE: { pais: "ÁUSTRIA", cidade: "VIENA", code: "VIE" },
  HB: { pais: "SUÍÇA", cidade: "ZURIQUE", code: "ZRH" },
  OO: { pais: "BÉLGICA", cidade: "BRUXELAS", code: "BRU" },
  PH: { pais: "PAÍSES BAIXOS", cidade: "AMSTERDÃO", code: "AMS" },
  SE: { pais: "SUÉCIA", cidade: "ESTOCOLMO", code: "ARN" },
  LN: { pais: "NORUEGA", cidade: "OSLO", code: "OSL" },
  TF: { pais: "ISLÂNDIA", cidade: "REIQUIAVIQUE", code: "KEF" },
  SX: { pais: "GRÉCIA", cidade: "ATENAS", code: "ATH" },
  TC: { pais: "TURQUIA", cidade: "ISTAMBUL", code: "IST" },
  "9H": { pais: "MALTA", cidade: "VALLETA", code: "MLA" },
  EI: { pais: "IRLANDA", cidade: "DUBLIN", code: "DUB" },
  SP: { pais: "POLÓNIA", cidade: "VARSÓVIA", code: "WAW" },
  LX: { pais: "LUXEMBURGO", cidade: "LUXEMBURGO", code: "LUX" },
  OM: { pais: "ESLOVÁQUIA", cidade: "BRATISLAVA", code: "BTS" },
  OK: { pais: "CHÉQUIA", cidade: "PRAGA", code: "PRG" },
  HA: { pais: "HUNGRIA", cidade: "BUDAPESTE", code: "BUD" },
  LZ: { pais: "BULGÁRIA", cidade: "SÓFIA", code: "SOF" },
};

const NOMES_AERONAVES: Record<string, string> = {
  B738: "BOEING 737-800",
  B737: "BOEING 737-700",
  B739: "BOEING 737-900",
  B38M: "B737 MAX 8",
  B39M: "B737 MAX 9",
  A320: "AIRBUS A320",
  A20N: "AIRBUS A320NEO",
  A321: "AIRBUS A321",
  A21N: "AIRBUS A321NEO",
  A319: "AIRBUS A319",
  A318: "AIRBUS A318",
  A332: "AIRBUS A330-200",
  A333: "AIRBUS A330-300",
  A339: "AIRBUS A330-900",
  A359: "AIRBUS A350-900",
  A35K: "AIRBUS A350-1000",
  B772: "BOEING 777-200",
  B77W: "BOEING 777-300ER",
  B788: "BOEING 787-8",
  B789: "BOEING 787-9",
  B78X: "BOEING 787-10",
  E190: "EMBRAER 190",
  E195: "EMBRAER 195",
  E295: "EMBRAER E195-E2",
  AT76: "ATR 72-600",
  DH8D: "DASH 8-400",
  CRJ9: "CRJ-900",
  C55B: "CITATION BRAVO",
  C56X: "CITATION XLS",
  C680: "CITATION SOV",
  C25A: "CITATION CJ2",
  C25B: "CITATION CJ3",
  C25C: "CITATION CJ4",
  C510: "CITATION MUST",
  C525: "CITATION M2",
  C550: "CITATION II",
  C560: "CITATION V",
  CL30: "CHALLENGER 300",
  CL35: "CHALLENGER 350",
  CL60: "CHALLENGER 600",
  CL65: "CHALLENGER 605",
  FA7X: "FALCON 7X",
  FA8X: "FALCON 8X",
  F2TH: "FALCON 2000",
  F900: "FALCON 900",
  GL5T: "GLOBAL 5000",
  GL6T: "GLOBAL 6000",
  GL7T: "GLOBAL 7500",
  GLEX: "GLOBAL EXP",
  GLF4: "GULFSTREAM IV",
  GLF5: "GULFSTREAM V",
  GLF6: "GULFSTREAM 650",
  PC12: "PILATUS PC-12",
  PC24: "PILATUS PC-24",
  BE20: "SUPER KING AIR",
  B350: "KING AIR 350",
  BE9L: "KING AIR 90",
  SR20: "CIRRUS SR20",
  SR22: "CIRRUS SR22",
  C152: "CESSNA 152",
  C172: "CESSNA 172",
  R22:  "ROBINSON R22",
  R44:  "ROBINSON R44",
};

function formatarNomeAeronave(raw: string): string {
  if (!raw) return "A320";
  let s = raw.trim().toUpperCase();

  // 1. Mapeamento directo por código exacto ICAO
  if (NOMES_AERONAVES[s]) {
    return NOMES_AERONAVES[s];
  }

  // 2. Se for curto (<= 14 caracteres), mantemos intacto (ex: "CESSNA 172", "BOEING 737")
  if (s.length <= 14) {
    return s;
  }

  // 3. Limpeza de prefixos extensos se ultrapassar 14 caracteres
  s = s
    .replace(/^CESSNA\s+\d+[A-Z]*\s+/i, "")
    .replace(/^CESSNA\s+/i, "")
    .replace(/^BEECHCRAFT\s+(SUPER\s+)?/i, "")
    .replace(/^DASSAULT\s+/i, "")
    .replace(/^BOMBARDIER\s+/i, "")
    .replace(/^GULFSTREAM\s+AEROSPACE\s+/i, "GULFSTREAM ")
    .replace(/^EMBRAER\s+/i, "EMBRAER ")
    .replace(/^AIRBUS\s+/i, "A")
    .replace(/^BOEING\s+/i, "B")
    .trim();

  // 4. Compactação se ainda assim ultrapassar 14 caracteres
  if (s.length > 14) {
    if (s.includes("CITATION")) return "CITATION";
    if (s.includes("CHALLENGER")) return "CHALLENGER";
    if (s.includes("FALCON")) return "FALCON";
    if (s.includes("KING AIR")) return "KING AIR";
    if (s.includes("GLOBAL")) return "GLOBAL EXP";
    s = s.slice(0, 14).trim();
  }

  return s;
}

function resolverVooInfo(voo: EstadoVoo, rotasMap?: Record<string, any>) {
  const cs = (voo[1] || "").trim().toUpperCase();
  const csLimpo = cs.replace(/\s+/g, "");
  const prefixo3 = csLimpo.slice(0, 3);
  const prefixo2 = csLimpo.slice(0, 2);
  
  let info = COMPANHIAS[prefixo3];
  let icao = /^[A-Z]{3}$/.test(prefixo3) ? prefixo3 : "";
  let iata = info?.iata || null;
  const regPais = PREFIXOS_REGISTO[prefixo2];

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

  // Tentar rota ADS-B real (da base de dados internacional adsbdb)
  const rotaReal = rotasMap ? (rotasMap[csLimpo] || rotasMap[cs]) : null;

  // Determinar o identificador de voo para o display:
  // Exibir SEMPRE o callsign completo e integral (ex: EJU34XV, AFR442, SWR1ZD, TAP1972)
  // para coincidir com o FlightRadar24 sem omitir qualquer letra.
  let numeroVoo = csLimpo || voo[0].toUpperCase();
  let callsignIata: string | null = rotaReal?.flightNumber || rotaReal?.callsignIata || null;

  if (!callsignIata && info && csLimpo.length > 3) {
    const sufixo = csLimpo.slice(3);
    callsignIata = `${info.iata}${sufixo}`;
  }

  const paisUpper = (voo[2] || "").toUpperCase();
  const dadosPais = CIDADES_PAISES[paisUpper];

  let origem = info?.origem || (regPais ? regPais.cidade : (dadosPais?.cidade || "MADRID"));
  let destino = info?.destino || "PORTO";
  let origemCode = info?.origemCode || (regPais ? regPais.code : (dadosPais?.code || "MAD"));
  let destinoCode = info?.destinoCode || "OPO";

  if (rotaReal) {
    origem = rotaReal.origem;
    origemCode = rotaReal.origemCode;
    destino = rotaReal.destino;
    destinoCode = rotaReal.destinoCode;
  } else {
    // Estimativa por perfil de subida / descida (vertical_rate)
    const vRate = voo[11];
    if (vRate != null) {
      if (vRate < -0.5) {
        // A descer / aproximação ao Porto: destino é Porto
        destino = "PORTO";
        destinoCode = "OPO";
        origem = info?.origem || (regPais ? regPais.cidade : (dadosPais?.cidade || "MADRID"));
        origemCode = info?.origemCode || (regPais ? regPais.code : (dadosPais?.code || "MAD"));
      } else if (vRate > 0.5) {
        // A subir / descolagem do Porto: origem é Porto, destino é o hub da companhia
        origem = "PORTO";
        origemCode = "OPO";
        destino = info?.origem || (regPais ? regPais.cidade : (dadosPais?.cidade || "MADRID"));
        destinoCode = info?.origemCode || (regPais ? regPais.code : (dadosPais?.code || "MAD"));
      }
    }
  }

  // Prevenção absoluta de rota fechada em si mesma (origem e destino NUNCA podem ser iguais)
  if (origemCode === destinoCode) {
    if (origemCode === "OPO") {
      destino = info?.origem && info.origemCode !== "OPO" ? info.origem : (dadosPais?.cidade && dadosPais.cidade !== "PORTO" ? dadosPais.cidade : "LISBOA");
      destinoCode = info?.origemCode && info.origemCode !== "OPO" ? info.origemCode : (dadosPais?.code && dadosPais.code !== "OPO" ? dadosPais.code : "LIS");
    } else {
      destino = "PORTO";
      destinoCode = "OPO";
    }
  }

  const altitudeMetros = voo[7] != null ? Math.round(voo[7]) : 0;
  const altitudePes = Math.round(altitudeMetros * 3.28084);
  const velocidadeKts = voo[9] != null ? Math.round(voo[9] * 1.94384) : 0;
  const rumo = voo[10] != null ? Math.round(voo[10]) : 0;

  // Determinar nome legível e elegante para a companhia ou tipo de operação
  let nomeFinalCompanhia = "AVIAÇÃO COMERCIAL";
  if (rotaReal?.airline) {
    nomeFinalCompanhia = rotaReal.airline.toUpperCase();
  } else if (info?.nome) {
    nomeFinalCompanhia = info.nome;
  } else if (regPais) {
    nomeFinalCompanhia = `AVIAÇÃO PRIVADA (${regPais.pais})`;
  } else if (voo[2]) {
    nomeFinalCompanhia = `OPERADOR (${voo[2].toUpperCase()})`;
  }

  const codAeronave = (voo[12] ? String(voo[12]).toUpperCase() : (rotaReal?.model || info?.aeronave || (regPais ? "AERONAVE PRIVADA" : "A320")));
  const nomeAeronave = formatarNomeAeronave(codAeronave);

  return {
    callsign: cs,
    icao,
    iata,
    numeroVoo,
    callsignIata,
    nomeCompanhia: nomeFinalCompanhia,
    aeronave: nomeAeronave,
    origem,
    origemCode,
    destino,
    destinoCode,
    altitudePes,
    velocidadeKts,
    rumo,
    noSolo: voo[8],
  };
}

// ─── Sintetizador de Som Mecânico ─────────────────────────────────────────────

let globalAudioCtx: AudioContext | null = null;

function tocarSomFlapClack() {
  if (typeof window === "undefined") return;
  try {
    if (!globalAudioCtx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      globalAudioCtx = new AudioCtxClass();
    }
    if (globalAudioCtx.state === "suspended") {
      globalAudioCtx.resume();
    }
    const now = globalAudioCtx.currentTime;

    const bufferSize = globalAudioCtx.sampleRate * 0.03;
    const buffer = globalAudioCtx.createBuffer(1, bufferSize, globalAudioCtx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.2));
    }

    const noise = globalAudioCtx.createBufferSource();
    noise.buffer = buffer;

    const filter = globalAudioCtx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(1200, now);
    filter.Q.setValueAtTime(3.0, now);

    const gain = globalAudioCtx.createGain();
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(globalAudioCtx.destination);

    noise.start(now);
  } catch {
    // Ignorar
  }
}

// ─── Componente de Logótipo Universal de Companhias Aéreas ────────────────────

interface AirlineLogoProps {
  icao?: string;
  iata?: string | null;
  nome: string;
  callsign?: string;
}

function AirlineLogo({ icao, iata, nome, callsign }: AirlineLogoProps) {
  const [urlIndex, setUrlIndex] = useState(0);
  const [hasFailed, setHasFailed] = useState(false);

  // Lista de URLs prioritárias em CDN globais
  const urls = useMemo(() => {
    const list: string[] = [];
    const icaoUp = (icao || "").trim().toUpperCase();
    const iataUp = (iata || "").trim().toUpperCase();

    // Apenas se tiver formato ICAO válido de 3 letras
    if (icaoUp.length === 3 && /^[A-Z]{3}$/.test(icaoUp)) {
      list.push(`https://raw.githubusercontent.com/Jxck-S/airline-logos/main/flightaware_logos/${icaoUp}.png`);
      list.push(`https://raw.githubusercontent.com/Jxck-S/airline-logos/main/custom_logos/${icaoUp}.png`);
    }
    // Apenas se tiver formato IATA válido de 2 caracteres
    if (iataUp.length === 2 && /^[A-Z0-9]{2}$/.test(iataUp)) {
      list.push(`https://pics.avs.io/200/200/${iataUp}.png`);
    }
    return list;
  }, [icao, iata]);

  // Sempre que mudar a aeronave ou o voo, reiniciar tentativas
  useEffect(() => {
    setUrlIndex(0);
    setHasFailed(false);
  }, [icao, iata, callsign]);

  const handleImgError = () => {
    if (urlIndex + 1 < urls.length) {
      setUrlIndex((prev) => prev + 1);
    } else {
      setHasFailed(true);
    }
  };

  const srcAtual = !hasFailed && urls.length > 0 ? urls[urlIndex] : null;

  // Sigla aeronáutica para o emblema elegante caso não exista logótipo
  const siglaEmblema =
    (icao && icao.length === 3 && /^[A-Z]{3}$/.test(icao))
      ? icao
      : (callsign ? callsign.slice(0, 3) : "AIR");

  return (
    <div className="w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-lg sm:rounded-xl border border-neutral-700 shadow-md flex items-center justify-center shrink-0 overflow-hidden bg-white p-1 transition-all">
      {srcAtual ? (
        <Image
          key={srcAtual}
          src={srcAtual}
          alt={nome}
          width={64}
          height={64}
          className="object-contain max-h-full max-w-full"
          onError={handleImgError}
          unoptimized
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-neutral-900 via-neutral-950 to-black rounded-md sm:rounded-lg flex flex-col items-center justify-center p-0.5 border border-white/10 shadow-inner">
          {/* Silhueta aeronáutica estilizada */}
          <svg
            className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 fill-current drop-shadow"
            viewBox="0 0 24 24"
          >
            <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
          </svg>
          <span className="font-mono font-black text-[7px] sm:text-[9px] text-white tracking-widest uppercase leading-none mt-0.5">
            {siglaEmblema}
          </span>
        </div>
      )}
    </div>
  );
}

// ─── Componente de Palheta com Escala Universal Auto-Fit ──────────────────────

interface FlapCellProps {
  char: string;
  size?: "sm" | "md" | "lg" | "xl" | "hero";
}

function FlapCell({ char, size = "lg" }: FlapCellProps) {
  const [prevChar, setPrevChar] = useState(char);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (char !== prevChar) {
      setAnimating(true);
      tocarSomFlapClack();
      const timer = setTimeout(() => {
        setPrevChar(char);
        setAnimating(false);
      }, 220);
      return () => clearTimeout(timer);
    }
  }, [char, prevChar]);

  const dimensões = {
    sm: "w-[clamp(0.75rem,min(2.4vw,4.5vh),1.5rem)] h-[clamp(1.05rem,min(3.4vw,6vh),2.1rem)] text-[clamp(0.75rem,min(2.2vw,4vh),1.25rem)] font-black rounded-[2px]",
    md: "w-[clamp(0.9rem,min(3vw,5.5vh),1.9rem)] h-[clamp(1.25rem,min(4.2vw,7.5vh),2.5rem)] text-[clamp(0.85rem,min(2.8vw,5vh),1.45rem)] font-black rounded-[3px]",
    lg: "w-[clamp(1.05rem,min(3.6vw,6.5vh),2.3rem)] h-[clamp(1.45rem,min(5vw,9vh),3.1rem)] text-[clamp(0.95rem,min(3.3vw,6vh),1.9rem)] font-black rounded-[4px]",
    xl: "w-[clamp(1.25rem,min(4.4vw,7.8vh),2.7rem)] h-[clamp(1.65rem,min(5.8vw,10.5vh),3.5rem)] text-[clamp(1.1rem,min(3.8vw,6.8vh),2.1rem)] font-black rounded-[5px]",
    hero: "w-[clamp(1.35rem,min(4.8vw,8.5vh),3.1rem)] h-[clamp(1.8rem,min(6.5vw,11.5vh),3.9rem)] text-[clamp(1.2rem,min(4.4vw,7.8vh),2.5rem)] font-black rounded-[5px]",
  }[size];

  const coresTexto = "text-white bg-[#111319] border-[#252834] shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]";
  const charExibir = char === " " ? "\u00A0" : char.toUpperCase();

  return (
    <div className={`flap-cell shrink-0 ${dimensões} ${coresTexto} ${animating ? "animate-flap" : ""}`}>
      <span className="flap-pin-left" />
      <span className="flap-pin-right" />
      <span className="flap-split-line" />
      <span className="leading-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)] tracking-tighter select-none">
        {charExibir}
      </span>
    </div>
  );
}

// ─── Componente de Palavra Contínua ───────────────────────────────────────────

interface FlapWordProps {
  text: string;
  size?: "sm" | "md" | "lg" | "xl" | "hero";
}

function FlapWord({ text, size = "lg" }: FlapWordProps) {
  const chars = (text || "").split("");

  return (
    <div className="flex items-center gap-[2px] sm:gap-1 flex-nowrap shrink-0 max-w-full">
      {chars.map((c, i) => (
        <FlapCell key={i} char={c} size={size} />
      ))}
    </div>
  );
}

// ─── Componente Principal Painel Analógico Borderless ─────────────────────────

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

export interface InfoLocalizacao {
  lat: number;
  lon: number;
  nome: string;
  origem: "gps" | "preset" | "manual" | "padrao";
}

export const LOCALIZACAO_PADRAO: InfoLocalizacao = {
  lat: 41.15,
  lon: -8.62,
  nome: "VALADARES / PORTO",
  origem: "padrao",
};

export const LOCAIS_PREDEFINIDOS = [
  { nome: "VALADARES / GAIA", regiao: "Vila Nova de Gaia (Porto)", lat: 41.091, lon: -8.642 },
  { nome: "PORTO / CENTRO", regiao: "Porto Centro / Boavista", lat: 41.158, lon: -8.629 },
  { nome: "AEROPORTO DO PORTO", regiao: "Francisco Sá Carneiro (OPO)", lat: 41.242, lon: -8.681 },
  { nome: "LISBOA / AEROPORTO", regiao: "Humberto Delgado (LIS)", lat: 38.776, lon: -9.135 },
  { nome: "CASCAIS / OEIRAS", regiao: "Linha de Cascais / Tires", lat: 38.726, lon: -9.355 },
  { nome: "FARO / ALGARVE", regiao: "Aeroporto de Faro (FAO)", lat: 37.018, lon: -7.97 },
  { nome: "COIMBRA", regiao: "Centro de Portugal", lat: 40.206, lon: -8.42 },
  { nome: "BRAGA", regiao: "Minho / Palmeira", lat: 41.587, lon: -8.445 },
  { nome: "FUNCHAL / MADEIRA", regiao: "Cristiano Ronaldo (FNC)", lat: 32.7, lon: -16.774 },
  { nome: "PONTA DELGADA", regiao: "João Paulo II (PDL) - Açores", lat: 37.741, lon: -25.698 },
  { nome: "MADRID / ESPANHA", regiao: "Adolfo Suárez (MAD)", lat: 40.484, lon: -3.568 },
];

const TEMPO_ESPERA_SUAVE_MS = 40_000; // 40 segundos de retenção de cortesia do último voo

export default function PainelAnalogicoMobileFullscreen() {
  const [listaVoos, setListaVoos] = useState<EstadoVoo[]>([]);
  const listaVoosRef = useRef<EstadoVoo[]>([]);
  const [indiceVoo, setIndiceVoo] = useState(0);
  const [meteorologia, setMeteorologia] = useState<DadosMeteo | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [promptInstalacao, setPromptInstalacao] = useState<any>(null);
  const [localizacao, setLocalizacao] = useState<InfoLocalizacao>(LOCALIZACAO_PADRAO);
  const [statusGps, setStatusGps] = useState<"iniciando" | "ativo" | "bloqueado" | "erro" | "fixo">("iniciando");
  const [detalheErroGps, setDetalheErroGps] = useState<string>("");
  const [precisaoMetros, setPrecisaoMetros] = useState<number | null>(null);
  const [linkCopiado, setLinkCopiado] = useState<boolean>(false);
  const [modalLocalizacaoAberto, setModalLocalizacaoAberto] = useState(false);
  const [latManual, setLatManual] = useState<string>("41.15");
  const [lonManual, setLonManual] = useState<string>("-8.62");
  const [estaEmFullScreen, setEstaEmFullScreen] = useState<boolean>(false);

  // Escuta de alteração de modo ecrã inteiro nativo
  useEffect(() => {
    const handleFsChange = () => {
      const doc = document as Document & { webkitFullscreenElement?: Element };
      setEstaEmFullScreen(!!(doc.fullscreenElement || doc.webkitFullscreenElement));
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    document.addEventListener("webkitfullscreenchange", handleFsChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFsChange);
      document.removeEventListener("webkitfullscreenchange", handleFsChange);
    };
  }, []);

  // Espera suave do último voo (30-45s)
  const timestampSemVoosRef = useRef<number | null>(null);
  const [emEsperaSuave, setEmEsperaSuave] = useState<boolean>(false);
  const [segundosRestantesEspera, setSegundosRestantesEspera] = useState<number>(0);

  const [totalNoRadar, setTotalNoRadar] = useState(0);
  const [horaAtual, setHoraAtual] = useState("12:00");
  const [dataAtual, setDataAtual] = useState("08 SET");
  const [rotasMap, setRotasMap] = useState<Record<string, any>>({});
  const rotasMapRef = useRef<Record<string, any>>({});

  // Relógio de estação analógica em tempo real para o cabeçalho meteorológico
  useEffect(() => {
    const atualizarTempo = () => {
      const agora = new Date();
      const h = agora.toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" });
      const dia = agora.getDate().toString().padStart(2, "0");
      const meses = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];
      const mes = meses[agora.getMonth()];
      setHoraAtual(h);
      setDataAtual(`${dia} ${mes}`);
    };
    atualizarTempo();
    const interval = setInterval(atualizarTempo, 1000);
    return () => clearInterval(interval);
  }, []);

  // Sincronização direta de coordenadas via URL (?lat=X&lon=Y) para partilha imediata PC -> Telemóvel
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const sp = new URLSearchParams(window.location.search);
      const urlLat = sp.get("lat");
      const urlLon = sp.get("lon");
      if (urlLat && urlLon) {
        const pLat = parseFloat(urlLat);
        const pLon = parseFloat(urlLon);
        if (!isNaN(pLat) && !isNaN(pLon)) {
          const coordUrl: InfoLocalizacao = {
            lat: Number(pLat.toFixed(4)),
            lon: Number(pLon.toFixed(4)),
            nome: sp.get("nome") || "COORDENADAS DO PC",
            origem: "manual",
          };
          setLocalizacao(coordUrl);
          setStatusGps("fixo");
          setLatManual(coordUrl.lat.toString());
          setLonManual(coordUrl.lon.toString());
          localStorage.setItem("flight_panel_user_location", JSON.stringify(coordUrl));
          return;
        }
      }
    } catch {}
  }, []);

  // Motor de Geolocalização com detecção de HTTPS e fallback de precisão
  const obterGpsDoDispositivo = useCallback((altaPrecisao = true) => {
    if (typeof window === "undefined") return;

    if (!("geolocation" in navigator)) {
      setStatusGps("erro");
      setDetalheErroGps("O teu navegador não tem suporte a GPS.");
      return;
    }

    if (window.isSecureContext === false) {
      setStatusGps("bloqueado");
      setDetalheErroGps("Contexto inseguro (HTTP). Os navegadores bloqueiam o GPS do telemóvel fora de HTTPS. Podes selecionar a tua localidade na lista ou sincronizar com o link do PC.");
      return;
    }

    setStatusGps("iniciando");
    setDetalheErroGps("A solicitar coordenadas ao satélite...");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const acc = pos.coords.accuracy ? Math.round(pos.coords.accuracy) : null;
        setPrecisaoMetros(acc);
        const novo: InfoLocalizacao = {
          lat: Number(pos.coords.latitude.toFixed(4)),
          lon: Number(pos.coords.longitude.toFixed(4)),
          nome: acc && acc <= 30 ? `GPS SATÉLITE (±${acc}M)` : `GPS DO DISPOSITIVO (±${acc ?? "?"}M)`,
          origem: "gps",
        };
        setLocalizacao(novo);
        setStatusGps("ativo");
        setDetalheErroGps(`Sinal GPS fixado (${acc ? acc + "m de precisão" : "Excelente"}).`);
        setLatManual(novo.lat.toString());
        setLonManual(novo.lon.toString());
        try {
          localStorage.setItem("flight_panel_user_location", JSON.stringify(novo));
        } catch {}
      },
      (err) => {
        if (altaPrecisao && err.code === err.TIMEOUT) {
          obterGpsDoDispositivo(false);
        } else {
          if (err.code === err.PERMISSION_DENIED) {
            setStatusGps("bloqueado");
            setDetalheErroGps("Permissão de GPS negada no browser do telemóvel. Escolhe a tua localidade abaixo.");
          } else {
            setStatusGps("erro");
            setDetalheErroGps(`Falha de GPS (${err.message}). Escolhe a tua localidade abaixo.`);
          }
        }
      },
      { timeout: 15000, enableHighAccuracy: altaPrecisao, maximumAge: 10000 }
    );
  }, []);

  // Refinamento Contínuo via watchPosition (activa o chip de satélite em telemóveis e melhora a precisão)
  useEffect(() => {
    if (typeof window === "undefined" || !("geolocation" in navigator) || window.isSecureContext === false) return;

    let watchId: number | null = null;
    try {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const acc = pos.coords.accuracy ? Math.round(pos.coords.accuracy) : null;
          setPrecisaoMetros(acc);
          // Apenas actualiza automaticamente se estivermos em modo GPS
          setLocalizacao((atual) => {
            if (atual.origem === "preset" || atual.origem === "manual") return atual;
            return {
              lat: Number(pos.coords.latitude.toFixed(4)),
              lon: Number(pos.coords.longitude.toFixed(4)),
              nome: acc && acc <= 25 ? `GPS SATÉLITE (±${acc}M)` : `GPS (±${acc ?? "?"}M)`,
              origem: "gps",
            };
          });
          setStatusGps("ativo");
          setDetalheErroGps(`Sinal de GPS em refinamento contínuo (precisão atual: ±${acc ?? "?"}m).`);
        },
        () => {},
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 20000 }
      );
    } catch {}

    return () => {
      if (watchId !== null && typeof navigator !== "undefined" && "geolocation" in navigator) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, []);

  // Recuperar localização guardada no dispositivo (localStorage) ou obter GPS inicial
  useEffect(() => {
    try {
      const salvo = localStorage.getItem("flight_panel_user_location");
      if (salvo) {
        const parsed = JSON.parse(salvo);
        if (parsed.lat && parsed.lon) {
          setLocalizacao(parsed);
          setStatusGps(parsed.origem === "gps" ? "ativo" : "fixo");
          setLatManual(parsed.lat.toString());
          setLonManual(parsed.lon.toString());
          return;
        }
      }
    } catch {}

    obterGpsDoDispositivo(true);
  }, [obterGpsDoDispositivo]);

  const selecionarLocalPredefinido = (local: typeof LOCAIS_PREDEFINIDOS[0]) => {
    tocarSomFlapClack();
    const novo: InfoLocalizacao = {
      lat: local.lat,
      lon: local.lon,
      nome: local.nome,
      origem: "preset",
    };
    setLocalizacao(novo);
    setStatusGps("fixo");
    setDetalheErroGps("");
    setLatManual(local.lat.toString());
    setLonManual(local.lon.toString());
    try {
      localStorage.setItem("flight_panel_user_location", JSON.stringify(novo));
    } catch {}
    setModalLocalizacaoAberto(false);
  };

  const guardarCoordenadasManuais = () => {
    const lat = parseFloat(latManual);
    const lon = parseFloat(lonManual);
    if (isNaN(lat) || isNaN(lon)) return;
    tocarSomFlapClack();
    const novo: InfoLocalizacao = {
      lat: Number(lat.toFixed(4)),
      lon: Number(lon.toFixed(4)),
      nome: `MANUAL (${lat.toFixed(2)}°, ${lon.toFixed(2)}°)`,
      origem: "manual",
    };
    setLocalizacao(novo);
    setStatusGps("fixo");
    setDetalheErroGps("");
    try {
      localStorage.setItem("flight_panel_user_location", JSON.stringify(novo));
    } catch {}
    setModalLocalizacaoAberto(false);
  };

  const copiarLinkCoordenadas = () => {
    if (typeof window === "undefined") return;
    const url = `${window.location.origin}/painel?lat=${localizacao.lat}&lon=${localizacao.lon}&nome=${encodeURIComponent(localizacao.nome)}`;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(() => {
        setLinkCopiado(true);
        setTimeout(() => setLinkCopiado(false), 3500);
      });
    }
  };

  // Manter o ecrã sempre ligado enquanto a aplicação estiver aberta (Screen Wake Lock API)
  useEffect(() => {
    let wakeLockInstance: any = null;

    const solicitarWakeLock = async () => {
      if (typeof window !== "undefined" && "wakeLock" in navigator && document.visibilityState === "visible") {
        try {
          wakeLockInstance = await (navigator as any).wakeLock.request("screen");
        } catch {
          // Ignorar silenciosamente caso a bateria fraca ou o sistema rejeitem
        }
      }
    };

    solicitarWakeLock();

    const lidarComMudancaVisibilidade = () => {
      if (document.visibilityState === "visible") {
        solicitarWakeLock();
      }
    };

    document.addEventListener("visibilitychange", lidarComMudancaVisibilidade);

    return () => {
      document.removeEventListener("visibilitychange", lidarComMudancaVisibilidade);
      if (wakeLockInstance) {
        wakeLockInstance.release().catch(() => {});
      }
    };
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setPromptInstalacao(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const instalarApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (promptInstalacao) {
      promptInstalacao.prompt();
      promptInstalacao.userChoice.then(() => {
        setPromptInstalacao(null);
      });
    }
  };

  // Modo Ecrã Inteiro controlado exclusivamente por botão dedicado
  const alternarFullScreen = () => {
    // Garantir que o ecrã se mantém ligado após interacção
    if (typeof window !== "undefined" && "wakeLock" in navigator) {
      (navigator as any).wakeLock.request("screen").catch(() => {});
    }

    if (!globalAudioCtx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      globalAudioCtx = new AudioCtxClass();
    }
    if (globalAudioCtx.state === "suspended") {
      globalAudioCtx.resume();
    }
    tocarSomFlapClack();

    if (typeof document !== "undefined") {
      const doc = document as Document & {
        webkitFullscreenElement?: Element;
        webkitExitFullscreen?: () => Promise<void>;
      };
      const docEl = document.documentElement as HTMLElement & {
        webkitRequestFullscreen?: () => Promise<void>;
      };

      const isFs = doc.fullscreenElement || doc.webkitFullscreenElement;
      if (!isFs) {
        if (docEl.requestFullscreen) {
          docEl.requestFullscreen().catch(() => {});
        } else if (docEl.webkitRequestFullscreen) {
          docEl.webkitRequestFullscreen().catch(() => {});
        }
      } else {
        if (doc.exitFullscreen) {
          doc.exitFullscreen().catch(() => {});
        } else if (doc.webkitExitFullscreen) {
          doc.webkitExitFullscreen().catch(() => {});
        }
      }
    }
  };

  // Navegação entre múltiplos voos em sobrevoo (exclusivamente por arrasto lateral)
  const avancarVoo = useCallback(() => {
    setListaVoos((lista) => {
      if (lista.length <= 1) return lista;
      tocarSomFlapClack();
      setIndiceVoo((prev) => (prev + 1) % lista.length);
      return lista;
    });
  }, []);

  const recuarVoo = useCallback(() => {
    setListaVoos((lista) => {
      if (lista.length <= 1) return lista;
      tocarSomFlapClack();
      setIndiceVoo((prev) => (prev - 1 + lista.length) % lista.length);
      return lista;
    });
  }, []);

  // Gestos de Swipe & Arrastar (Ecrã táctil móvel + Rato desktop)
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const touchStartTime = useRef<number>(0);

  const lidarComInicioArrasto = (e: React.TouchEvent | React.MouseEvent) => {
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    touchStartX.current = clientX;
    touchStartY.current = clientY;
    touchStartTime.current = Date.now();
  };

  const lidarComFimArrasto = (e: React.TouchEvent | React.MouseEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;

    const clientX = "changedTouches" in e ? e.changedTouches[0].clientX : e.clientX;
    const clientY = "changedTouches" in e ? e.changedTouches[0].clientY : e.clientY;

    const deltaX = clientX - touchStartX.current;
    const deltaY = clientY - touchStartY.current;

    touchStartX.current = null;
    touchStartY.current = null;

    // Se foi um arrasto horizontal nítido (> 40px e predominantemente horizontal)
    if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY) * 1.2) {
      if (deltaX < 0) {
        // Arrastar para a esquerda -> Próximo voo
        avancarVoo();
      } else {
        // Arrastar para a direita -> Voo anterior
        recuarVoo();
      }
    }
    // Toque simples já não ativa fullscreen, garantindo total estabilidade do ecrã
  };

  const carregarMeteorologia = useCallback(async (localCoords?: { lat: number; lon: number } | null) => {
    try {
      const q = localCoords ? `?lat=${localCoords.lat}&lon=${localCoords.lon}` : "";
      const resMeteo = await fetch(`/api/meteorologia${q}`);
      const dadosMeteo = await resMeteo.json();
      if (!dadosMeteo.erro) {
        setMeteorologia(dadosMeteo);
      }
    } catch {
      // Ignorar erros
    }
  }, []);

  const tratarZeroVoos = useCallback(async (refLat: number, refLon: number) => {
    // Se havia voos a ser exibidos no ecrã, reter durante 40 segundos de Espera Suave
    if (listaVoosRef.current.length > 0) {
      const agora = Date.now();
      if (timestampSemVoosRef.current === null) {
        timestampSemVoosRef.current = agora;
      }
      const decorrido = agora - timestampSemVoosRef.current;
      if (decorrido < TEMPO_ESPERA_SUAVE_MS) {
        // Dentro do período de cortesia: manter voo no ecrã!
        setEmEsperaSuave(true);
        const restantes = Math.max(1, Math.round((TEMPO_ESPERA_SUAVE_MS - decorrido) / 1000));
        setSegundosRestantesEspera(restantes);
        setTotalNoRadar(0);
        return;
      }
    }

    // Passaram os 40 segundos ou já estávamos na meteorologia: transição suave
    timestampSemVoosRef.current = null;
    setEmEsperaSuave(false);
    setSegundosRestantesEspera(0);
    listaVoosRef.current = [];
    setListaVoos([]);
    setTotalNoRadar(0);
    setIndiceVoo(0);
    await carregarMeteorologia({ lat: refLat, lon: refLon });
  }, [carregarMeteorologia]);

  const buscarDados = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      params.set("lat", localizacao.lat.toString());
      params.set("lon", localizacao.lon.toString());
      params.set("radius", "20");

      const resVoos = await fetch(`/api/voos?${params.toString()}`);
      const dadosVoos = await resVoos.json();

      if (dadosVoos.rotas && Object.keys(dadosVoos.rotas).length > 0) {
        rotasMapRef.current = { ...rotasMapRef.current, ...dadosVoos.rotas };
        setRotasMap((prev) => ({ ...prev, ...dadosVoos.rotas }));
      }

      const refLat = localizacao.lat;
      const refLon = localizacao.lon;

      if (dadosVoos.estados && dadosVoos.estados.length > 0) {
        // Filtrar aeronaves no ar (não no solo) e estritamente dentro do raio circular de 20 km (elimina cantos da caixa)
        const voosEmAr = dadosVoos.estados.filter((v: EstadoVoo) => {
          if (v[8]) return false;
          if (v[6] == null || v[5] == null) return false;
          const dist = calcularDistanciaHaversineKm(refLat, refLon, v[6], v[5]);
          return dist <= 20;
        });

        if (voosEmAr.length > 0) {
          voosEmAr.sort((a: EstadoVoo, b: EstadoVoo) => {
            const distA =
              a[6] != null && a[5] != null
                ? calcularDistanciaHaversineKm(refLat, refLon, a[6], a[5])
                : 9999;
            const distB =
              b[6] != null && b[5] != null
                ? calcularDistanciaHaversineKm(refLat, refLon, b[6], b[5])
                : 9999;
            return distA - distB;
          });

          // Novo voo ativo: cancelar espera suave e apresentar imediatamente
          timestampSemVoosRef.current = null;
          setEmEsperaSuave(false);
          setSegundosRestantesEspera(0);
          listaVoosRef.current = voosEmAr;
          setListaVoos(voosEmAr);
          setTotalNoRadar(voosEmAr.length);
          setIndiceVoo((prev) => (prev >= voosEmAr.length ? 0 : prev));
          setMeteorologia(null);
        } else {
          await tratarZeroVoos(refLat, refLon);
        }
      } else {
        await tratarZeroVoos(refLat, refLon);
      }
    } catch {
      await tratarZeroVoos(localizacao.lat, localizacao.lon);
    } finally {
      setCarregando(false);
    }
  }, [localizacao, carregarMeteorologia, tratarZeroVoos]);

  // Contador de segundos da Espera Suave com transição automática ao expirar
  useEffect(() => {
    if (!emEsperaSuave || !timestampSemVoosRef.current) return;
    const interval = setInterval(() => {
      if (timestampSemVoosRef.current) {
        const decorrido = Date.now() - timestampSemVoosRef.current;
        const restantes = Math.max(0, Math.round((TEMPO_ESPERA_SUAVE_MS - decorrido) / 1000));
        setSegundosRestantesEspera(restantes);
        if (restantes <= 0) {
          timestampSemVoosRef.current = null;
          setEmEsperaSuave(false);
          listaVoosRef.current = [];
          setListaVoos([]);
          setTotalNoRadar(0);
          carregarMeteorologia({ lat: localizacao.lat, lon: localizacao.lon });
        }
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [emEsperaSuave, localizacao, carregarMeteorologia]);

  useEffect(() => {
    buscarDados();
    const int = setInterval(buscarDados, INTERVALO_MS);
    return () => clearInterval(int);
  }, [buscarDados]);

  const vooAtual = listaVoos.length > 0 ? listaVoos[Math.min(indiceVoo, listaVoos.length - 1)] : null;

  const refLatAtual = localizacao.lat;
  const refLonAtual = localizacao.lon;
  const distVooAtual = (vooAtual && vooAtual[6] != null && vooAtual[5] != null)
    ? calcularDistanciaHaversineKm(refLatAtual, refLonAtual, vooAtual[6], vooAtual[5])
    : null;

  const infoVoo = vooAtual ? resolverVooInfo(vooAtual, rotasMapRef.current) : null;

  return (
    <main
      onTouchStart={lidarComInicioArrasto}
      onTouchEnd={lidarComFimArrasto}
      onMouseDown={lidarComInicioArrasto}
      onMouseUp={lidarComFimArrasto}
      className="h-[100dvh] w-[100dvw] max-h-[100dvh] max-w-[100dvw] bg-[#050608] text-white flex flex-col items-center justify-between p-1.5 sm:p-3 select-none font-mono cursor-default relative overflow-hidden board-texture pb-[max(0.375rem,env(safe-area-inset-bottom))]"
    >

      {/* ── PAINEL INTEGRADO SEM MOLDURA EXTERNA (EDGE-TO-EDGE) ─────────────── */}
      <div className="w-full max-w-5xl h-full max-h-full flex flex-col justify-between gap-1.5 sm:gap-2.5 overflow-hidden">
        
        {/* ── ESTADO A CARREGAR ───────────────────────────────────────────── */}
        {carregando && (
          <div className="h-full flex flex-col items-center justify-center gap-3 text-center">
            <FlapWord text="A CARREGAR" size="lg" />
          </div>
        )}

        {/* ── MODO 1: VOO ACTIVO DETECTADO NO RADAR ────────────────────────── */}
        {!carregando && vooAtual && infoVoo && (
          <div className="flex-1 min-h-0 flex flex-col justify-between gap-1.5 sm:gap-2.5 overflow-hidden">
            
            {/* LINHA 1: VOO & LOGÓTIPO & COMPANHIA */}
            <div className="w-full bg-[#10121a] p-1.5 sm:p-3 rounded-lg sm:rounded-xl border border-white/10 flex flex-row items-center justify-between gap-2 shadow-lg shrink-0">
              
              {/* Logótipo Oficial Garantido + Voo */}
              <div className="flex items-center gap-2.5 sm:gap-4 min-w-0 shrink-0">
                <AirlineLogo icao={infoVoo.icao} iata={infoVoo.iata} nome={infoVoo.nomeCompanhia} callsign={infoVoo.callsign} />

                <div className="flex flex-col items-start gap-0.5 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[9px] sm:text-xs uppercase tracking-widest text-neutral-400 font-bold">
                      VOO / FLIGHT
                    </span>
                    {infoVoo.callsignIata && infoVoo.callsignIata !== infoVoo.numeroVoo && (
                      <span className="text-[8px] sm:text-[10px] text-sky-400 font-mono tracking-wider font-bold bg-sky-400/10 px-1.5 py-0.5 rounded border border-sky-400/20">
                        {infoVoo.callsignIata}
                      </span>
                    )}
                    {emEsperaSuave && (
                      <span className="text-[8px] sm:text-[10px] text-amber-400 font-mono tracking-wider font-bold bg-amber-400/15 px-1.5 py-0.5 rounded border border-amber-400/30 animate-pulse">
                        ÚLTIMO CONTACTO ({segundosRestantesEspera}S)
                      </span>
                    )}
                  </div>
                  <FlapWord
                    text={infoVoo.numeroVoo}
                    size={infoVoo.numeroVoo.length >= 7 ? "md" : infoVoo.numeroVoo.length >= 5 ? "lg" : "xl"}
                  />
                </div>
              </div>

              {/* Aeronave, Nome da Companhia e Botão de Instalação PWA */}
              <div className="flex flex-col items-end gap-0.5 text-right min-w-0 max-w-[55%] sm:max-w-[60%] overflow-hidden">
                <div className="flex items-center gap-2">
                  {promptInstalacao && (
                    <button
                      onClick={instalarApp}
                      className="bg-white/10 hover:bg-white/20 text-white text-[9px] sm:text-[11px] font-bold px-2 py-0.5 rounded border border-white/20 transition-all flex items-center gap-1 shadow-md animate-pulse"
                    >
                      📲 INSTALAR
                    </button>
                  )}
                  <span className="text-[9px] sm:text-xs uppercase tracking-widest text-neutral-400 font-bold">
                    AIRCRAFT
                  </span>
                </div>
                <FlapWord
                  text={infoVoo.aeronave}
                  size={infoVoo.aeronave.length >= 12 ? "sm" : infoVoo.aeronave.length >= 9 ? "md" : "lg"}
                />
                <span className="text-[10px] sm:text-xs font-bold text-neutral-300 tracking-wider truncate max-w-[140px] sm:max-w-none">
                  {infoVoo.nomeCompanhia}
                </span>
              </div>

            </div>

            {/* LINHA 2: SECÇÃO PRINCIPAL DE ROTA (EXPANDIDA NO CENTRO) ───────── */}
            <div className="w-full flex-1 min-h-0 bg-[#10121a] px-2.5 sm:px-4 py-1.5 sm:py-2.5 rounded-xl border border-white/10 flex flex-col justify-between shadow-lg overflow-hidden">
              
              {/* CABEÇALHO DEDICADO DE ROTA: ORIGEM | ESTADO DE VOO | DESTINO (NUNCA CORTA) */}
              <div className="w-full flex items-center justify-between text-[8px] sm:text-[10px] uppercase tracking-widest text-neutral-400 font-bold shrink-0 pt-0.5">
                <span className="text-left">ORIGEM / DEPARTURE</span>
                <div className="flex items-center gap-1.5 sm:gap-2 text-neutral-300">
                  <div className="w-4 sm:w-8 h-px bg-white/30" />
                  <span className="text-[8px] sm:text-[9px] text-amber-400 font-bold tracking-wider">
                    {infoVoo.noSolo ? "NO SOLO" : "EM VOO"}
                  </span>
                  <span className="text-white text-xs sm:text-base">✈</span>
                  <div className="w-4 sm:w-8 h-px bg-white/30" />
                </div>
                <span className="text-right">DESTINO / DESTINATION</span>
              </div>

              {/* CORPO DE FLAPS: CÓDIGOS IATA + CIDADES COM AUTO-FIT */}
              <div className="w-full flex-1 flex items-center justify-between gap-2 sm:gap-6 min-h-0 pt-1">
                {/* ORIGEM */}
                <div className="flex items-center gap-1.5 sm:gap-3 flex-wrap min-w-0">
                  <FlapWord text={infoVoo.origemCode} size="hero" />
                  <FlapWord text={infoVoo.origem} size={infoVoo.origem.length >= 9 ? "sm" : "md"} />
                </div>

                {/* DESTINO */}
                <div className="flex items-center gap-1.5 sm:gap-3 flex-wrap justify-end min-w-0 text-right">
                  <FlapWord text={infoVoo.destinoCode} size="hero" />
                  <FlapWord text={infoVoo.destino} size={infoVoo.destino.length >= 9 ? "sm" : "md"} />
                </div>
              </div>

            </div>

            {/* LINHA 3: TELEMETRIA EM 3 MÓDULOS ───────────────────────────────── */}
            <div className="w-full grid grid-cols-3 gap-1.5 sm:gap-2.5 shrink-0">
              
              {/* ALTITUDE */}
              <div className="bg-[#10121a] p-1.5 sm:p-3 rounded-xl border border-white/10 flex flex-col items-center justify-center text-center shadow-md">
                <span className="text-[8px] sm:text-xs uppercase tracking-wider text-neutral-400 font-bold mb-1">
                  ALTITUDE
                </span>
                <div className="flex items-center gap-1">
                  <FlapWord text={`${infoVoo.altitudePes}`} size="lg" />
                  <span className="text-[10px] sm:text-xs text-neutral-400 font-bold">FT</span>
                </div>
              </div>

              {/* VELOCIDADE */}
              <div className="bg-[#10121a] p-1.5 sm:p-3 rounded-xl border border-white/10 flex flex-col items-center justify-center text-center shadow-md">
                <span className="text-[8px] sm:text-xs uppercase tracking-wider text-neutral-400 font-bold mb-1">
                  VELOCIDADE
                </span>
                <div className="flex items-center gap-1">
                  <FlapWord text={`${infoVoo.velocidadeKts}`} size="lg" />
                  <span className="text-[10px] sm:text-xs text-neutral-400 font-bold">KTS</span>
                </div>
              </div>

              {/* RUMO */}
              <div className="bg-[#10121a] p-1.5 sm:p-3 rounded-xl border border-white/10 flex flex-col items-center justify-center text-center shadow-md">
                <span className="text-[8px] sm:text-xs uppercase tracking-wider text-neutral-400 font-bold mb-1">
                  RUMO / HEADING
                </span>
                <div className="flex items-center gap-1">
                  <FlapWord text={`${infoVoo.rumo}`} size="lg" />
                  <span className="text-[10px] sm:text-xs text-neutral-400 font-bold">°</span>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ── MODO 2: SEM VOOS -> MODO METEOROLOGIA AUTOMÁTICO ────────────── */}
        {!carregando && !vooAtual && (
          <div className="flex-1 min-h-0 flex flex-col justify-between gap-1.5 sm:gap-2.5 overflow-hidden">
            
            {/* Cabeçalho Meteorológico: Data, Hora e Localização */}
            <div className="w-full bg-[#10121a] p-1.5 sm:p-3 rounded-lg sm:rounded-xl border border-white/10 flex flex-row items-center justify-between gap-2 shadow-lg shrink-0">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="w-10 h-10 sm:w-14 sm:h-14 bg-white p-1 rounded-lg border border-neutral-700 shadow-md flex items-center justify-center text-xl sm:text-2xl shrink-0">
                  ⏱️
                </div>
                <div className="flex flex-col items-start gap-0.5">
                  <span className="text-[9px] sm:text-xs uppercase tracking-widest text-neutral-400 font-bold">
                    HORA • DATA
                  </span>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <FlapWord text={horaAtual} size="xl" />
                    <FlapWord text={dataAtual} size="lg" />
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-0.5 text-right">
                <span className="text-[9px] sm:text-xs uppercase tracking-widest text-neutral-400 font-bold">
                  LOCALIZAÇÃO
                </span>
                <FlapWord text={localizacao.nome.length > 12 ? localizacao.nome.slice(0, 12) : localizacao.nome} size="md" />
              </div>
            </div>

            {/* Linha Principal Meteorológica */}
            <div className="w-full flex-1 min-h-0 bg-[#10121a] px-2.5 sm:px-4 py-1.5 sm:py-2.5 rounded-xl border border-white/10 flex flex-col justify-between shadow-lg overflow-hidden">
              <div className="w-full flex items-center justify-between text-[8px] sm:text-[10px] uppercase tracking-widest text-neutral-400 font-bold shrink-0 pt-0.5">
                <span>CONDIÇÃO DO TEMPO</span>
                <span>TEMPERATURA</span>
              </div>

              <div className="w-full flex-1 flex items-center justify-between gap-4 min-h-0 pt-1">
                <FlapWord text={meteorologia?.weather?.[0]?.description || "CEU LIMPO"} size="hero" />

                <div className="flex items-center gap-1">
                  <FlapWord text={`${Math.round(meteorologia?.main?.temp ?? 18)}`} size="hero" />
                  <span className="text-xl sm:text-3xl font-black text-white">°C</span>
                </div>
              </div>
            </div>

            {/* Telemetria Meteorológica */}
            <div className="w-full grid grid-cols-3 gap-1.5 sm:gap-2.5 shrink-0">
              <div className="bg-[#10121a] p-1.5 sm:p-3 rounded-xl border border-white/10 flex flex-col items-center justify-center text-center shadow-md">
                <span className="text-[8px] sm:text-xs uppercase tracking-wider text-neutral-400 font-bold mb-1">
                  VENTO
                </span>
                <div className="flex items-center gap-1">
                  <FlapWord text={`${Math.round((meteorologia?.wind?.speed ?? 3.5) * 3.6)}`} size="md" />
                  <span className="text-[10px] sm:text-xs text-neutral-400 font-bold">KM/H</span>
                </div>
              </div>

              <div className="bg-[#10121a] p-1.5 sm:p-3 rounded-xl border border-white/10 flex flex-col items-center justify-center text-center shadow-md">
                <span className="text-[8px] sm:text-xs uppercase tracking-wider text-neutral-400 font-bold mb-1">
                  HUMIDADE
                </span>
                <div className="flex items-center gap-1">
                  <FlapWord text={`${meteorologia?.main?.humidity ?? 70}`} size="md" />
                  <span className="text-[10px] sm:text-xs text-neutral-400 font-bold">%</span>
                </div>
              </div>

              <div className="bg-[#10121a] p-1.5 sm:p-3 rounded-xl border border-white/10 flex flex-col items-center justify-center text-center shadow-md">
                <span className="text-[8px] sm:text-xs uppercase tracking-wider text-neutral-400 font-bold mb-1">
                  SENSAÇÃO
                </span>
                <div className="flex items-center gap-1">
                  <FlapWord text={`${Math.round(meteorologia?.main?.feels_like ?? meteorologia?.main?.temp ?? 18)}`} size="md" />
                  <span className="text-[10px] sm:text-xs text-neutral-400 font-bold">°C</span>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ── BARRA DE STATUS DO RADAR ADS-B NO FUNDO DO CHASSIS ─────────── */}
        <div 
          className="w-full flex items-center justify-between px-2.5 py-1 text-[8px] sm:text-[10px] text-neutral-400 font-mono tracking-widest uppercase border border-white/10 shrink-0 bg-[#0c0e14] rounded-lg shadow-sm hover:border-white/30 transition-colors"
        >
          {/* Informação de Localização / GPS */}
          <div className="flex items-center gap-1.5 py-0.5 px-1">
            <span className={`w-2 h-2 rounded-full ${statusGps === "ativo" ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" : statusGps === "bloqueado" ? "bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.8)]" : "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]"} animate-pulse`} />
            <span className="font-bold text-neutral-200">
              RADAR v1.3.3 • 📍 {localizacao.nome} {precisaoMetros ? `(±${precisaoMetros}M)` : ""} (20 KM)
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {listaVoos.length > 1 && (
              <span className="bg-white/10 px-2 py-0.5 rounded border border-white/20 text-sky-400 font-bold font-mono text-[8px] sm:text-[10px] tracking-wider">
                VOO {indiceVoo + 1}/{listaVoos.length}
              </span>
            )}
            {emEsperaSuave && (
              <span className="text-amber-400 bg-amber-400/15 border border-amber-400/30 px-1.5 py-0.5 rounded font-bold animate-pulse">
                ESPERA: {segundosRestantesEspera}S
              </span>
            )}
            {distVooAtual != null && (
              <span className="text-sky-400 font-mono font-bold bg-sky-400/10 px-1.5 py-0.5 rounded border border-sky-400/20">
                📍 {distVooAtual.toFixed(1)} KM
              </span>
            )}
            <span>NO AR: <strong className="text-amber-400 font-bold">{totalNoRadar}</strong></span>

            {/* BOTÃO 1: AJUSTAR */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setModalLocalizacaoAberto(true);
              }}
              title="Ajustar localização e raio do radar"
              className="flex items-center gap-1 bg-sky-500/20 hover:bg-sky-500/35 active:scale-95 text-sky-300 hover:text-white px-2 py-0.5 rounded border border-sky-400/40 text-[8px] sm:text-[10px] font-bold font-mono transition-all cursor-pointer shadow-sm ml-1"
            >
              <span>⚙️</span>
              <span>AJUSTAR</span>
            </button>

            {/* BOTÃO 2: FULL SCREEN */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                alternarFullScreen();
              }}
              title={estaEmFullScreen ? "Sair do modo ecrã inteiro" : "Activar modo ecrã inteiro"}
              className="flex items-center gap-1 bg-amber-500/20 hover:bg-amber-500/35 active:scale-95 text-amber-300 hover:text-white px-2 py-0.5 rounded border border-amber-400/40 text-[8px] sm:text-[10px] font-bold font-mono transition-all cursor-pointer shadow-sm"
            >
              <span>{estaEmFullScreen ? "🗗" : "⛶"}</span>
              <span>{estaEmFullScreen ? "JANELA" : "ECRÃ INTEIRO"}</span>
            </button>
          </div>
        </div>

      </div>

      {/* ── MODAL ANALÓGICO DE CONFIGURAÇÃO DE LOCALIZAÇÃO DO RADAR ──── */}
      {modalLocalizacaoAberto && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6"
          onClick={(e) => { e.stopPropagation(); setModalLocalizacaoAberto(false); }}
        >
          <div 
            className="w-full max-w-lg bg-[#0c0e14] border border-white/20 rounded-2xl p-4 sm:p-6 shadow-2xl flex flex-col gap-4 text-white font-mono max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Título e Fechar */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">📍</span>
                <div>
                  <h2 className="text-sm sm:text-base font-black tracking-wider text-amber-400 uppercase">
                    Localização do Radar
                  </h2>
                  <p className="text-[10px] text-neutral-400">
                    Define o centro do raio circular de 20 km
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalLocalizacaoAberto(false)}
                className="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-white/10 text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Localização Atual Ativa */}
            <div className="bg-[#151922] p-3 rounded-xl border border-white/10 flex items-center justify-between">
              <div>
                <span className="text-[9px] uppercase tracking-widest text-neutral-400 font-bold block">
                  PONTO ACTUAL ACTIVO
                </span>
                <span className="text-xs sm:text-sm font-bold text-sky-400">
                  {localizacao.nome} {precisaoMetros ? `(±${precisaoMetros}m)` : ""}
                </span>
                <span className="text-[10px] text-neutral-300 block font-mono">
                  {localizacao.lat.toFixed(4)}°N, {localizacao.lon.toFixed(4)}°W • Raio 20 KM
                </span>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${statusGps === "ativo" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-neutral-700/50 text-neutral-300"}`}>
                {localizacao.origem.toUpperCase()}
              </span>
            </div>

            {/* Partilhar / Sincronizar com Telemóvel com 100% de Precisão */}
            <div className="flex flex-col gap-1">
              <button
                onClick={copiarLinkCoordenadas}
                className="w-full bg-sky-950/60 hover:bg-sky-900/80 active:scale-[0.99] text-sky-300 hover:text-white py-2 px-3 rounded-xl border border-sky-500/30 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
              >
                <span>🔗</span>
                <span>{linkCopiado ? "✅ LINK COPIADO! ABRE NO TELEMÓVEL" : "COPIAR LINK DE COORDENADAS PARA O TELEMÓVEL"}</span>
              </button>
              <p className="text-[9px] text-neutral-400 text-center leading-tight">
                Garante precisão milimétrica: copia este link no PC e abre-o no telemóvel para clonar as coordenadas exatas.
              </p>
            </div>

            {/* Botão GPS */}
            <div className="flex flex-col gap-1.5">
              <button
                onClick={() => obterGpsDoDispositivo(true)}
                className="w-full bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer border border-emerald-400/30"
              >
                <span>📡</span>
                <span>OBTER COORDENADAS POR GPS (TELEMÓVEL / PC)</span>
              </button>
              {detalheErroGps && (
                <p className="text-[10px] sm:text-xs text-amber-300 bg-amber-950/40 p-2 rounded border border-amber-500/30 leading-relaxed">
                  {detalheErroGps}
                </p>
              )}
            </div>

            {/* Predefinições Rápidas (1 Toque) */}
            <div className="flex flex-col gap-2">
              <span className="text-[9px] uppercase tracking-widest text-neutral-400 font-bold">
                OU SELECCIONA A TUA LOCALIDADE (1 TOQUE):
              </span>
              <div className="grid grid-cols-2 gap-2">
                {LOCAIS_PREDEFINIDOS.map((loc) => {
                  const estaAtivo = Math.abs(loc.lat - localizacao.lat) < 0.005 && Math.abs(loc.lon - localizacao.lon) < 0.005;
                  return (
                    <button
                      key={loc.nome}
                      onClick={() => selecionarLocalPredefinido(loc)}
                      className={`p-2.5 rounded-xl text-left border transition-all flex flex-col justify-between cursor-pointer ${estaAtivo ? "bg-sky-500/20 border-sky-400 text-white shadow-md shadow-sky-500/10" : "bg-[#141720] hover:bg-[#1a1f2c] border-white/10 text-neutral-300 hover:text-white"}`}
                    >
                      <span className="text-[11px] sm:text-xs font-bold font-mono tracking-wider">
                        {loc.nome}
                      </span>
                      <span className="text-[9px] text-neutral-400 truncate mt-0.5">
                        {loc.regiao}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Entrada Manual de Coordenadas */}
            <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
              <span className="text-[9px] uppercase tracking-widest text-neutral-400 font-bold">
                COORDENADAS PERSONALIZADAS (LATITUDE / LONGITUDE):
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.0001"
                  value={latManual}
                  onChange={(e) => setLatManual(e.target.value)}
                  placeholder="Latitude (ex: 41.15)"
                  className="w-1/2 bg-[#141720] border border-white/20 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-amber-400 outline-none"
                />
                <input
                  type="number"
                  step="0.0001"
                  value={lonManual}
                  onChange={(e) => setLonManual(e.target.value)}
                  placeholder="Longitude (ex: -8.62)"
                  className="w-1/2 bg-[#141720] border border-white/20 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-amber-400 outline-none"
                />
                <button
                  onClick={guardarCoordenadasManuais}
                  className="bg-amber-500 hover:bg-amber-400 text-black px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer"
                >
                  GRAVAR
                </button>
              </div>
            </div>

            {/* Rodapé do Modal */}
            <div className="flex justify-end pt-2 border-t border-white/10">
              <button
                onClick={() => setModalLocalizacaoAberto(false)}
                className="bg-white/10 hover:bg-white/20 px-4 py-1.5 rounded-lg text-xs font-bold text-neutral-300 hover:text-white transition-all cursor-pointer"
              >
                CONCLUÍDO
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
