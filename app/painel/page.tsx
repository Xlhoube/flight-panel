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
};

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
  const nomeAeronave = NOMES_AERONAVES[codAeronave] || codAeronave;

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
    sm: "w-[clamp(0.75rem,min(2.4vw,5vh),1.5rem)] h-[clamp(1.1rem,min(3.5vw,7vh),2.2rem)] text-[clamp(0.75rem,min(2.2vw,4.5vh),1.3rem)] font-black rounded-[2px]",
    md: "w-[clamp(0.9rem,min(3vw,6vh),1.9rem)] h-[clamp(1.3rem,min(4.4vw,8.5vh),2.7rem)] text-[clamp(0.85rem,min(2.8vw,5.5vh),1.5rem)] font-black rounded-[3px]",
    lg: "w-[clamp(1.1rem,min(3.8vw,7.5vh),2.4rem)] h-[clamp(1.6rem,min(5.5vw,10.5vh),3.4rem)] text-[clamp(1rem,min(3.5vw,6.8vh),2rem)] font-black rounded-[4px]",
    xl: "w-[clamp(1.3rem,min(4.6vw,9vh),2.9rem)] h-[clamp(1.8rem,min(6.5vw,12.5vh),4rem)] text-[clamp(1.15rem,min(4.2vw,8vh),2.4rem)] font-black rounded-[5px]",
    hero: "w-[clamp(1.5rem,min(5.5vw,11vh),3.5rem)] h-[clamp(2.1rem,min(7.8vw,15vh),4.8rem)] text-[clamp(1.35rem,min(5vw,9.5vh),3rem)] font-black rounded-[5px]",
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

export default function PainelAnalogicoMobileFullscreen() {
  const [vooAtual, setVooAtual] = useState<EstadoVoo | null>(null);
  const [meteorologia, setMeteorologia] = useState<DadosMeteo | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [promptInstalacao, setPromptInstalacao] = useState<any>(null);
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
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

  // Detecção de GPS do telemóvel / computador para telemetria local real
  useEffect(() => {
    if (typeof window !== "undefined" && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({
            lat: pos.coords.latitude,
            lon: pos.coords.longitude,
          });
        },
        () => {
          // Manter coordenadas padrão caso o utilizador não conceda permissão de GPS
        },
        { timeout: 7000, enableHighAccuracy: false }
      );
    }
  }, []);

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

  // Fullscreen com 1 toque no ecrã & activação de som e Wake Lock
  const manipularToqueEcra = () => {
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

  const buscarDados = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (coords) {
        params.set("lat", coords.lat.toString());
        params.set("lon", coords.lon.toString());
      }
      params.set("radius", "20");

      const resVoos = await fetch(`/api/voos?${params.toString()}`);
      const dadosVoos = await resVoos.json();

      if (dadosVoos.rotas && Object.keys(dadosVoos.rotas).length > 0) {
        rotasMapRef.current = { ...rotasMapRef.current, ...dadosVoos.rotas };
        setRotasMap((prev) => ({ ...prev, ...dadosVoos.rotas }));
      }

      if (dadosVoos.estados && dadosVoos.estados.length > 0) {
        // Filtrar aeronaves no ar (não estacionadas no solo)
        const voosEmAr = dadosVoos.estados.filter((v: EstadoVoo) => !v[8]);

        if (voosEmAr.length > 0) {
          // Ordenar pelo voo com menor distância em relação à localização do utilizador
          const refLat = coords?.lat ?? 41.15;
          const refLon = coords?.lon ?? -8.62;

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

          setTotalNoRadar(voosEmAr.length);
          setVooAtual(voosEmAr[0]);
          setMeteorologia(null);
        } else {
          setTotalNoRadar(0);
          setVooAtual(null);
          await carregarMeteorologia(coords);
        }
      } else {
        setTotalNoRadar(0);
        setVooAtual(null);
        await carregarMeteorologia(coords);
      }
    } catch {
      setTotalNoRadar(0);
      setVooAtual(null);
      await carregarMeteorologia(coords);
    } finally {
      setCarregando(false);
    }
  }, [coords, carregarMeteorologia]);

  useEffect(() => {
    buscarDados();
    const int = setInterval(buscarDados, INTERVALO_MS);
    return () => clearInterval(int);
  }, [buscarDados]);

  const infoVoo = vooAtual ? resolverVooInfo(vooAtual, rotasMapRef.current) : null;

  return (
    <main
      onClick={manipularToqueEcra}
      className="h-[100dvh] w-[100dvw] max-h-[100dvh] max-w-[100dvw] bg-[#050608] text-white flex flex-col items-center justify-between p-1.5 sm:p-3 select-none font-mono cursor-pointer relative overflow-hidden board-texture pb-[max(0.375rem,env(safe-area-inset-bottom))]"
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
              <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
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
                  </div>
                  <FlapWord
                    text={infoVoo.numeroVoo}
                    size={infoVoo.numeroVoo.length >= 7 ? "md" : infoVoo.numeroVoo.length >= 5 ? "lg" : "xl"}
                  />
                </div>
              </div>

              {/* Aeronave, Nome da Companhia e Botão de Instalação PWA */}
              <div className="flex flex-col items-end gap-0.5 text-right">
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
                <FlapWord text={infoVoo.aeronave} size="md" />
                <span className="text-[10px] sm:text-xs font-bold text-neutral-300 tracking-wider truncate max-w-[140px] sm:max-w-none">
                  {infoVoo.nomeCompanhia}
                </span>
              </div>

            </div>

            {/* LINHA 2: SECÇÃO PRINCIPAL DE ROTA (EXPANDIDA NO CENTRO) ───────── */}
            <div className="w-full flex-1 min-h-[60px] sm:min-h-[90px] bg-[#10121a] p-2.5 sm:p-4 rounded-xl border border-white/10 flex flex-row items-center justify-between gap-2 sm:gap-6 shadow-lg overflow-hidden">
              
              {/* ORIGEM (CÓDIGO IATA + CIDADE / AEROPORTO) */}
              <div className="flex flex-col items-start gap-1">
                <span className="text-[9px] sm:text-xs uppercase tracking-widest text-neutral-400 font-bold">
                  ORIGEM / DEPARTURE
                </span>
                <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                  <FlapWord text={infoVoo.origemCode} size="hero" />
                  <FlapWord text={infoVoo.origem} size="lg" />
                </div>
              </div>

              {/* TRACK CENTRAL DE VOO */}
              <div className="flex flex-col items-center justify-center px-2 shrink-0">
                <span className="text-[8px] sm:text-[10px] uppercase tracking-widest text-neutral-300 font-bold mb-1">
                  {infoVoo.noSolo ? "NO SOLO" : "EM VOO"}
                </span>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <div className="w-6 sm:w-12 h-0.5 bg-white/40" />
                  <span className="text-white text-xl sm:text-3xl">✈</span>
                  <div className="w-6 sm:w-12 h-0.5 bg-white/40" />
                </div>
              </div>

              {/* DESTINO (CÓDIGO IATA + CIDADE / AEROPORTO) */}
              <div className="flex flex-col items-end gap-1 text-right">
                <span className="text-[9px] sm:text-xs uppercase tracking-widest text-neutral-400 font-bold">
                  DESTINO / DESTINATION
                </span>
                <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-end">
                  <FlapWord text={infoVoo.destinoCode} size="hero" />
                  <FlapWord text={infoVoo.destino} size="lg" />
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
                <FlapWord text={coords ? "GPS LOCAL" : (meteorologia?.name && meteorologia.name !== "LOCAL" ? meteorologia.name : "VALADARES")} size="lg" />
              </div>
            </div>

            {/* Linha Principal Meteorológica */}
            <div className="w-full flex-1 min-h-[60px] sm:min-h-[90px] bg-[#10121a] p-2.5 sm:p-4 rounded-xl border border-white/10 flex flex-row items-center justify-between gap-4 shadow-lg overflow-hidden">
              <div className="flex flex-col items-start gap-1">
                <span className="text-[9px] sm:text-xs uppercase tracking-widest text-neutral-400 font-bold">
                  CONDIÇÃO DO TEMPO
                </span>
                <FlapWord text={meteorologia?.weather?.[0]?.description || "CEU LIMPO"} size="hero" />
              </div>

              <div className="flex flex-col items-end gap-1 text-right">
                <span className="text-[9px] sm:text-xs uppercase tracking-widest text-neutral-400 font-bold">
                  TEMPERATURA
                </span>
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
          onClick={(e) => {
            e.stopPropagation();
            if (typeof window !== "undefined" && "caches" in window) {
              caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k)))).then(() => {
                window.location.reload();
              });
            }
          }}
          title="Toca para forçar actualização e limpar cache"
          className="w-full flex items-center justify-between px-2.5 py-1 text-[8px] sm:text-[10px] text-neutral-400 font-mono tracking-widest uppercase border border-white/10 shrink-0 bg-[#0c0e14] rounded-lg shadow-sm hover:border-white/30 cursor-pointer transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse" />
            <span>RADAR ADS-B v1.1.3 • {coords ? "GPS ACTIVO" : "VALADARES / PORTO"} (RAIO 20 KM)</span>
          </div>
          <div className="flex items-center gap-2">
            <span>NO AR: <strong className="text-amber-400 font-bold">{totalNoRadar}</strong></span>
          </div>
        </div>

      </div>
    </main>
  );
}
