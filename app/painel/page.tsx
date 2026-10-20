"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Idioma, IDIOMAS_DISPONIVEIS, TRADUCOES, traduzirPais, traduzirCondicaoMeteo, obterMesAbreviado } from "@/lib/i18n";
import { obterDadosAeroporto } from "@/lib/aeroportos";
import { resolverLocalidadePorCoordenadas, formatarNomeEstacaoDisplay } from "@/lib/localidades";
import { resolverInfoAeronave } from "@/lib/aeronaves-db";
import { EmblemaFabricante } from "@/lib/fabricantes-logos";
import { IconeBandeira } from "@/components/IconesBandeiras";
import { INFO_VERSAO } from "@/lib/versao";
import {
  tocarSomFlapClack,
  tocarRajadaFlaps,
  tocarSomNovoVoo,
  tocarChimeCabine,
  definirVolumeGlobal,
  definirSomHabilitado,
  inicializarAudioContext,
  desbloquearAudioGlobal,
} from "@/lib/sound";

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
  weather: Array<{ description: string; main: string; code?: number }>;
  main: {
    temp: number;
    humidity: number;
    feels_like?: number;
    temp_min?: number;
    temp_max?: number;
    pressure?: number;
  };
  wind: {
    speed: number;
    speed_kmh?: number;
    speed_kts?: number;
    direction_deg?: number;
    direction_cardinal?: string;
    gusts_kmh?: number;
  };
  aviation?: {
    qnh: number;
    condition: string;
    flight_category: string;
  };
  environment?: {
    is_day?: boolean;
    precipitation_mm?: number;
    uv_index?: number;
    sunrise?: string;
    sunset?: string;
  };
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
  // Força Aérea Portuguesa / Militar
  FAP: { nome: "FORÇA AÉREA PORTUGUESA", iata: "FAP", origem: "BA8 OVAR", destino: "MISSÃO TÁTICA", origemCode: "OVR", destinoCode: "OPS", aeronave: "UH-60 BLACK HAWK" },
  AFP: { nome: "FORÇA AÉREA PORTUGUESA", iata: "FAP", origem: "BASE AÉREA", destino: "MISSÃO TÁTICA", origemCode: "FAP", destinoCode: "OPS", aeronave: "F-16M FALCON" },

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

  // Aviação Executiva e Charter Internacional (Aviapages & ICAO Doc 8585)
  NJE: { nome: "NETJETS EUROPE", iata: "1I", origem: "LONDRES", destino: "PORTO", origemCode: "EGGW", destinoCode: "OPO", aeronave: "CITATION LATITUDE" },
  EJA: { nome: "NETJETS US", iata: "QS", origem: "NOVA IORQUE", destino: "PORTO", origemCode: "TEB", destinoCode: "OPO", aeronave: "CHALLENGER 350" },
  VJT: { nome: "VISTAJET", iata: "VJ", origem: "GENEBRA", destino: "PORTO", origemCode: "GVA", destinoCode: "OPO", aeronave: "GLOBAL 6000" },
  LXJ: { nome: "FLEXJET", iata: "LXJ", origem: "FARNBOROUGH", destino: "PORTO", origemCode: "EGLF", destinoCode: "OPO", aeronave: "PRAETOR 600" },
  FLJ: { nome: "FLEXJET EUROPE", iata: "FLJ", origem: "MILAO", destino: "PORTO", origemCode: "LIN", destinoCode: "OPO", aeronave: "PHENOM 300" },
  GAC: { nome: "GLOBEAIR", iata: "GAC", origem: "LINZ", destino: "PORTO", origemCode: "LNZ", destinoCode: "OPO", aeronave: "CITATION MUSTANG" },
  AHO: { nome: "AIR HAMBURG", iata: "AHO", origem: "HAMBURGO", destino: "PORTO", origemCode: "HAM", destinoCode: "OPO", aeronave: "LEGACY 650" },
  LXA: { nome: "LUXAVIATION", iata: "LXA", origem: "LUXEMBURGO", destino: "PORTO", origemCode: "LUX", destinoCode: "OPO", aeronave: "FALCON 2000" },
  WHT: { nome: "WHITE AIRWAYS", iata: "WI", origem: "LISBOA", destino: "PORTO", origemCode: "LIS", destinoCode: "OPO", aeronave: "AIRBUS A319 VIP" },
  VVV: { nome: "VALAIR", iata: "VVV", origem: "CASCAIS", destino: "PORTO", origemCode: "CAT", destinoCode: "OPO", aeronave: "PILATUS PC-12" },
  OCN: { nome: "OMNI AVIATION", iata: "OCN", origem: "CASCAIS", destino: "PORTO", origemCode: "CAT", destinoCode: "OPO", aeronave: "LEARJET 45" },
  VCN: { nome: "EXECUJET", iata: "VCN", origem: "ZURIQUE", destino: "PORTO", origemCode: "ZRH", destinoCode: "OPO", aeronave: "GLOBAL 5000" },
  AXY: { nome: "AIR X CHARTER", iata: "AXY", origem: "MALTA", destino: "PORTO", origemCode: "MLA", destinoCode: "OPO", aeronave: "CHALLENGER 850" },
  LWG: { nome: "LUXWING", iata: "LWG", origem: "MALTA", destino: "PORTO", origemCode: "MLA", destinoCode: "OPO", aeronave: "CITATION XLS" },
  TYW: { nome: "TYROL AIR AMBULANCE", iata: "TYW", origem: "INNSBRUCK", destino: "PORTO", origemCode: "INN", destinoCode: "OPO", aeronave: "GULFSTREAM G100" },
  SAZ: { nome: "SWISS AIR-AMBULANCE", iata: "SAZ", origem: "ZURIQUE", destino: "PORTO", origemCode: "ZRH", destinoCode: "OPO", aeronave: "CHALLENGER 650" },
  XGO: { nome: "AIRGO FLUGSERVICE", iata: "XGO", origem: "MAINZ", destino: "PORTO", origemCode: "EDFZ", destinoCode: "OPO", aeronave: "AVANTI P180" },
  FYL: { nome: "FLYING GROUP", iata: "FYL", origem: "ANTUERPIA", destino: "PORTO", origemCode: "ANR", destinoCode: "OPO", aeronave: "FALCON 900" },
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

function formatarNomeAeronave(raw: string): string {
  return resolverInfoAeronave(raw).modelo;
}

function obterFabricanteAeronave(codAeronave: string, nomeAeronave?: string): string {
  return resolverInfoAeronave(codAeronave, nomeAeronave).fabricante;
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
  YYC: "CANADÁ", GIG: "BRASIL", SDU: "BRASIL", GRU: "BRASIL", CGH: "BRASIL",
  VCP: "BRASIL", BSB: "BRASIL", SSA: "BRASIL", REC: "BRASIL", FOR: "BRASIL",
  CNF: "BRASIL", POA: "BRASIL", CWB: "BRASIL", FLN: "BRASIL", NAT: "BRASIL",
  MCZ: "BRASIL", BPS: "BRASIL", EZE: "ARGENTINA", AEP: "ARGENTINA",
  SCL: "CHILE", LIM: "PERU", BOG: "COLÔMBIA", MDE: "COLÔMBIA",
  PTY: "PANAMÁ", MEX: "MÉXICO", CUN: "MÉXICO",
};

function obterPaisDoAeroporto(codigo?: string, paisIsoOuNome?: string): string {
  const cod = (codigo || "").trim().toUpperCase();
  if (AEROPORTOS_PAISES[cod]) return AEROPORTOS_PAISES[cod];

  const infoGlobal = obterDadosAeroporto(cod, { pais: paisIsoOuNome });
  if (infoGlobal.pais) return infoGlobal.pais;

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

  const infoGlobal = obterDadosAeroporto(cod, { nome: nomeRecebido });
  if (infoGlobal.aeroporto && infoGlobal.aeroporto !== cod) return infoGlobal.aeroporto;

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
  const numeroVoo = csLimpo || voo[0].toUpperCase();
  let callsignIata: string | null = rotaReal?.flightNumber || rotaReal?.callsignIata || null;

  if (!callsignIata && info && csLimpo.length > 3) {
    const sufixo = csLimpo.slice(3);
    callsignIata = `${info.iata}${sufixo}`;
  }

  const paisUpper = (voo[2] || "").toUpperCase();
  const dadosPais = CIDADES_PAISES[paisUpper];

  // ── DETEÇÃO INTELIGENTE DE AVIAÇÃO MILITAR PORTUGUESA (FAP) ───────────────
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
    voo[2] === "29807" ||
    (voo[12] && String(voo[12]).toUpperCase().includes("H60")) ||
    (rotaReal?.airline && /air\s*force|for[cç]a\s*[aá]erea/i.test(rotaReal.airline) && /portug/i.test(rotaReal.airline + " " + paisUpper));

  if (isFap) {
    icao = "FAP";
    iata = "FAP";
    info = COMPANHIAS.FAP;
  }

  let origem = "DESCONHECIDO";
  let destino = "EM ROTA";
  let origemCode = "N/D";
  let destinoCode = "---";

  if (isFap) {
    if (csLimpo.startsWith("BLACK") || rotaReal?.model === "H60" || (voo[12] && String(voo[12]).toUpperCase().includes("H60"))) {
      origem = "BA8 OVAR";
      origemCode = "OVR";
      destino = "MISSÃO TÁTICA";
      destinoCode = "OPS";
    } else if (csLimpo.startsWith("MERLIN")) {
      origem = "BA6 MONTIJO";
      origemCode = "MTO";
      destino = "SAR SALVAMENTO";
      destinoCode = "SAR";
    } else if (csLimpo.startsWith("JAGUAR")) {
      origem = "BA5 MONTE REAL";
      origemCode = "MTR";
      destino = "PATRULHA AÉREA";
      destinoCode = "CAP";
    } else if (csLimpo.startsWith("HULK") || csLimpo.startsWith("TURBO")) {
      origem = "BA11 BEJA";
      origemCode = "BYJ";
      destino = "TRANSP TÁTICO";
      destinoCode = "OPS";
    } else if (csLimpo.startsWith("ROMA")) {
      origem = "BA6 MONTIJO";
      origemCode = "MTO";
      destino = "VIGIL MARÍTIMA";
      destinoCode = "OPS";
    } else if (csLimpo.startsWith("ZULU") || csLimpo.startsWith("MILLENNIUM")) {
      origem = "BA11 BEJA";
      origemCode = "BYJ";
      destino = "TRANSP TÁTICO";
      destinoCode = "OPS";
    } else {
      origem = "BASE AÉREA";
      origemCode = "FAP";
      destino = "MISSÃO TÁTICA";
      destinoCode = "OPS";
    }
  } else if (rotaReal && rotaReal.origem && rotaReal.destino) {
    origem = rotaReal.origem;
    origemCode = rotaReal.origemCode;
    destino = rotaReal.destino;
    destinoCode = rotaReal.destinoCode;
  } else if (info) {
    // Linha aérea comercial reconhecida com hub mapeado
    origem = info.origem;
    origemCode = info.origemCode;
    destino = info.destino;
    destinoCode = info.destinoCode;

    // Estimativa por perfil de subida / descida (apenas para voos comerciais reconhecidos)
    const vRate = voo[11];
    if (vRate != null) {
      if (vRate < -0.5) {
        destino = "PORTO";
        destinoCode = "OPO";
        origem = info.origem;
        origemCode = info.origemCode;
      } else if (vRate > 0.5) {
        origem = "PORTO";
        origemCode = "OPO";
        destino = info.origem;
        destinoCode = info.origemCode;
      }
    }
  } else {
    // Aeronaves privadas ou sem rota registada: NUNCA inventar OPO -> MAD fictício
    origem = regPais ? `LOCAL (${regPais.cidade})` : "SOBREVOO LOCAL";
    origemCode = regPais ? regPais.code : "N/D";
    destino = "EM ROTA";
    destinoCode = "---";
  }

  // Prevenção de rota idêntica caso ocorra
  if (origemCode === destinoCode && !isFap && origemCode !== "N/D" && origemCode !== "---") {
    if (origemCode === "OPO") {
      destino = info?.origem && info.origemCode !== "OPO" ? info.origem : "LISBOA";
      destinoCode = info?.origemCode && info.origemCode !== "OPO" ? info.origemCode : "LIS";
    } else {
      destino = "PORTO";
      destinoCode = "OPO";
    }
  }

  const altitudeMetros = voo[7] != null ? Math.round(voo[7]) : 0;
  const altitudePes = Math.round(altitudeMetros * 3.28084);
  const velocidadeMs = voo[9] != null ? voo[9] : 0;
  const velocidadeKts = Math.round(velocidadeMs * 1.94384);
  const velocidadeKmh = Math.round(velocidadeMs * 3.6);
  const velocidadeMph = Math.round(velocidadeMs * 2.23694);
  const rumo = voo[10] != null ? Math.round(voo[10]) : 0;

  // Determinar nome legível e elegante para a companhia ou tipo de operação
  let nomeFinalCompanhia = "AVIAÇÃO COMERCIAL";
  if (isFap) {
    nomeFinalCompanhia = "FORÇA AÉREA PORTUGUESA";
  } else if (rotaReal?.airline) {
    nomeFinalCompanhia = rotaReal.airline.toUpperCase();
  } else if (info?.nome) {
    nomeFinalCompanhia = info.nome;
  } else if (regPais) {
    nomeFinalCompanhia = `AVIAÇÃO PRIVADA (${regPais.pais})`;
  } else if (voo[2]) {
    nomeFinalCompanhia = `OPERADOR (${voo[2].toUpperCase()})`;
  }

  let codAeronave = (voo[12] ? String(voo[12]).toUpperCase() : (rotaReal?.model || info?.aeronave || (regPais ? "AERONAVE PRIVADA" : "A320")));
  if (csLimpo.startsWith("BLACK") || codAeronave === "H60" || (voo[12] && String(voo[12]).toUpperCase().includes("H60"))) {
    codAeronave = "UH-60 BLACK HAWK";
  }
  const nomeAeronave = formatarNomeAeronave(codAeronave);
  const fabricante = obterFabricanteAeronave(codAeronave, nomeAeronave);

  let origemPais = rotaReal?.origemPais || "";
  let destinoPais = rotaReal?.destinoPais || "";
  if (isFap) {
    origemPais = "PORTUGAL";
    destinoPais = "PORTUGAL";
  } else {
    if (!origemPais && origemCode && origemCode !== "---" && origemCode !== "N/D") {
      origemPais = obterPaisDoAeroporto(origemCode);
    }
    if (!origemPais && info?.origemCode) {
      origemPais = obterPaisDoAeroporto(info.origemCode);
    }
    if (!origemPais && regPais?.pais) {
      origemPais = regPais.pais.toUpperCase();
    }

    if (!destinoPais && destinoCode && destinoCode !== "---" && destinoCode !== "N/D") {
      destinoPais = obterPaisDoAeroporto(destinoCode);
    }
    if (!destinoPais && info?.destinoCode) {
      destinoPais = obterPaisDoAeroporto(info.destinoCode);
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
    if (!origemAeroporto && info?.origemCode) {
      origemAeroporto = obterNomeAeroporto(info.origemCode);
    }

    if (!destinoAeroporto && destinoCode && destinoCode !== "---" && destinoCode !== "N/D") {
      destinoAeroporto = obterNomeAeroporto(destinoCode);
    }
    if (!destinoAeroporto && info?.destinoCode) {
      destinoAeroporto = obterNomeAeroporto(info.destinoCode);
    }
  }

  // Enriquecimento e validação com base global para garantir que origem e destino nunca fiquem sem cidade, aeroporto ou país
  if (origemCode && origemCode !== "---" && origemCode !== "N/D") {
    const dadosOrig = obterDadosAeroporto(origemCode);
    if (!origem || origem === origemCode) {
      origem = dadosOrig.cidade;
    }
    if (!origemAeroporto) {
      origemAeroporto = dadosOrig.aeroporto;
    }
    if (!origemPais) {
      origemPais = dadosOrig.pais;
    }
  }

  if (destinoCode && destinoCode !== "---" && destinoCode !== "N/D") {
    const dadosDest = obterDadosAeroporto(destinoCode);
    if (!destino || destino === destinoCode) {
      destino = dadosDest.cidade;
    }
    if (!destinoAeroporto) {
      destinoAeroporto = dadosDest.aeroporto;
    }
    if (!destinoPais) {
      destinoPais = dadosDest.pais;
    }
  }

  return {
    callsign: cs,
    icao,
    iata,
    numeroVoo,
    callsignIata,
    nomeCompanhia: nomeFinalCompanhia,
    aeronave: nomeAeronave,
    fabricante,
    origem,
    origemCode,
    origemPais,
    origemAeroporto,
    destino,
    destinoCode,
    destinoPais,
    destinoAeroporto,
    altitudePes,
    altitudeMetros,
    velocidadeKts,
    velocidadeKmh,
    velocidadeMph,
    rumo,
    noSolo: voo[8],
  };
}

// ─── Motor de Áudio Unificado (Importado de @/lib/sound) ──────────────────────
// tocarSomFlapClack, tocarRajadaFlaps, tocarSomNovoVoo, definirVolumeGlobal, definirSomHabilitado

// ─── Componente de Ícones Meteorológicos Dinâmicos (SVG Cockpit Style) ────────

function WeatherIconSVG({ code, isDay = true, className = "w-10 h-10" }: { code?: number; isDay?: boolean; className?: string }) {
  const c = code ?? 0;
  // Céu limpo / Bom tempo
  if (c === 0 || c === 1) {
    if (isDay) {
      return (
        <svg className={`${className} text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="4" fill="currentColor" fillOpacity="0.8" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
        </svg>
      );
    }
    return (
      <svg className={`${className} text-sky-300 drop-shadow-[0_0_8px_rgba(147,197,253,0.5)]`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" fill="currentColor" fillOpacity="0.8" />
      </svg>
    );
  }
  // Pouco nublado / Nuvens dispersas
  if (c === 2) {
    return (
      <svg className={`${className} text-sky-200 drop-shadow`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="10" cy="9" r="3" fill="#fbbf24" stroke="#f59e0b" />
        <path d="M7 16a4 4 0 0 1-.7-7.94 5.5 5.5 0 0 1 10.4 1.44A3.5 3.5 0 0 1 18 16H7Z" fill="#38bdf8" fillOpacity="0.3" />
      </svg>
    );
  }
  // Encoberto / Nevoeiro
  if (c === 3 || c === 45 || c === 48) {
    return (
      <svg className={`${className} text-slate-300 drop-shadow`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" fill="#64748b" fillOpacity="0.4" />
        {c >= 45 && <path d="M4 21h16M7 17h10" strokeWidth="2" stroke="#94a3b8" />}
      </svg>
    );
  }
  // Chuva / Chuviscos / Aguaceiros
  if ((c >= 51 && c <= 65) || (c >= 80 && c <= 82)) {
    return (
      <svg className={`${className} text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.5)]`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 13a4.5 4.5 0 0 0-4-2.5 5.5 5.5 0 0 0-10.4-1.44A4 4 0 0 0 6 13" fill="#38bdf8" fillOpacity="0.2" />
        <path d="M8 15l-1 4M12 15l-1 4M16 15l-1 4" stroke="#60a5fa" strokeWidth="2.5" />
      </svg>
    );
  }
  // Trovoada
  if (c >= 95) {
    return (
      <svg className={`${className} text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.8)]`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 13a4.5 4.5 0 0 0-3-2.5 5.5 5.5 0 0 0-10.4-1.44A4 4 0 0 0 6 13" fill="#334155" fillOpacity="0.5" />
        <path d="M13 10l-3 5h3l-1 5 5-7h-3l2-3Z" fill="#fbbf24" stroke="#f59e0b" strokeWidth="1" />
      </svg>
    );
  }
  // Neve ou outro
  return (
    <svg className={`${className} text-sky-100 drop-shadow`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 13a4.5 4.5 0 0 0-4-2.5 5.5 5.5 0 0 0-10.4-1.44A4 4 0 0 0 6 13" fill="#cbd5e1" fillOpacity="0.3" />
      <path d="M8 17h.01M12 19h.01M16 17h.01M10 15h.01M14 15h.01" strokeWidth="3" />
    </svg>
  );
}

// ─── Componente de Logótipo Universal de Companhias Aéreas ────────────────────

function RoundelFAP() {
  return (
    <div className="w-full h-full bg-[#0a0c10] rounded-md sm:rounded-lg flex flex-col items-center justify-center p-0.5 border border-red-500/40 shadow-inner overflow-hidden">
      <svg className="w-full h-full max-w-[48px] max-h-[48px] drop-shadow-md" viewBox="0 0 100 100">
        {/* Aro Exterior Tático Cinza / Carbono */}
        <circle cx="50" cy="50" r="48" fill="#181a20" stroke="#374151" strokeWidth="2.5" />
        {/* Aro Vermelho Oficial FAP */}
        <circle cx="50" cy="50" r="44" fill="#cc141d" />
        {/* Disco Branco / Alumínio */}
        <circle cx="50" cy="50" r="40" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1" />

        {/* Cruz da Ordem de Cristo (Braços Vermelhos Pátios com Alargamento) */}
        {/* Braço Superior */}
        <polygon points="44,45 56,45 66,18 34,18" fill="#cc141d" />
        {/* Braço Inferior */}
        <polygon points="44,55 56,55 66,82 34,82" fill="#cc141d" />
        {/* Braço Esquerdo */}
        <polygon points="45,44 45,56 18,66 18,34" fill="#cc141d" />
        {/* Braço Direito */}
        <polygon points="55,44 55,56 82,66 82,34" fill="#cc141d" />
        {/* Centro da Cruz */}
        <rect x="44" y="44" width="12" height="12" fill="#cc141d" />

        {/* Bordo das Extremidades da Cruz de Cristo */}
        <polygon points="34,18 66,18 64,15 36,15" fill="#a00f16" />
        <polygon points="34,82 66,82 64,85 36,85" fill="#a00f16" />
        <polygon points="18,34 18,66 15,64 15,36" fill="#a00f16" />
        <polygon points="82,34 82,66 85,64 85,36" fill="#a00f16" />

        {/* Cruz Interior Branca Vazada da Ordem de Cristo */}
        <rect x="47.5" y="21" width="5" height="58" fill="#f8fafc" />
        <rect x="21" y="47.5" width="58" height="5" fill="#f8fafc" />
      </svg>
      <span className="font-mono font-black text-[5px] sm:text-[6px] text-red-400 tracking-widest uppercase leading-none mt-0.5">
        FORÇA AÉREA
      </span>
    </div>
  );
}

interface AirlineLogoProps {
  icao?: string;
  iata?: string | null;
  nome: string;
  callsign?: string;
  fabricante?: string;
  modeloAeronave?: string;
}

function AirlineLogo({ icao, iata, nome, callsign, fabricante, modeloAeronave }: AirlineLogoProps) {
  const [urlIndex, setUrlIndex] = useState(0);
  const [hasFailed, setHasFailed] = useState(false);

  // Verificação de Aviação Militar da Força Aérea Portuguesa
  const isMilitarFap =
    icao === "FAP" ||
    icao === "AFP" ||
    (nome && nome.includes("FORÇA AÉREA PORTUGUESA")) ||
    (callsign && callsign.startsWith("BLACK"));

  // Lista de URLs prioritárias em CDN globais
  const urls = useMemo(() => {
    if (isMilitarFap) return [];
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
  }, [icao, iata, isMilitarFap]);

  // Sempre que mudar a aeronave ou o voo, reiniciar tentativas
  useEffect(() => {
    setUrlIndex(0);
    setHasFailed(false);
  }, [icao, iata, callsign]);

  if (isMilitarFap) {
    return (
      <div className="w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-lg sm:rounded-xl border border-red-500/50 shadow-md flex items-center justify-center shrink-0 overflow-hidden bg-black p-0.5 transition-all">
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

  if (srcAtual) {
    return (
      <div className="w-11 h-11 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-lg sm:rounded-xl border border-neutral-700 shadow-md flex items-center justify-center shrink-0 overflow-hidden bg-white p-1 transition-all">
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
      </div>
    );
  }

  // Opção 1: Quando não existe companhia aérea ou logótipo, apresentar o Emblema Oficial do Construtor (OEM)
  return (
    <div className="w-11 h-11 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-lg sm:rounded-xl border border-neutral-800 shadow-md flex items-center justify-center shrink-0 overflow-hidden transition-all bg-[#0d0f16]">
      <EmblemaFabricante
        fabricante={fabricante}
        modelo={modeloAeronave}
        callsign={callsign}
        className="w-full h-full"
      />
    </div>
  );
}

// ─── Componente Visual: Mini-Radar de Proximidade Cockpit TCAS ─────────────────

function calcularBearingGraus(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const rad = Math.PI / 180;
  const phi1 = lat1 * rad;
  const phi2 = lat2 * rad;
  const deltaLambda = (lon2 - lon1) * rad;

  const y = Math.sin(deltaLambda) * Math.cos(phi2);
  const x = Math.cos(phi1) * Math.sin(phi2) - Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda);
  const theta = Math.atan2(y, x);
  return ((theta * 180) / Math.PI + 360) % 360;
}

function obterCardeal(graus: number): string {
  const direcoes = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  const val = Math.floor(graus / 22.5 + 0.5);
  return direcoes[val % 16];
}

interface MiniRadarDisplayProps {
  latUtilizador: number;
  lonUtilizador: number;
  latVoo?: number | null;
  lonVoo?: number | null;
  rumoVoo?: number;
  distKm: number;
  raioMaxKm: number;
  unidadeVelocidade: "KTS" | "KMH" | "MPH";
  unidadeDistancia?: "KM" | "NM" | "MI";
}

function MiniRadarDisplay({
  latUtilizador,
  lonUtilizador,
  latVoo,
  lonVoo,
  rumoVoo = 0,
  distKm,
  raioMaxKm,
  unidadeVelocidade,
  unidadeDistancia,
}: MiniRadarDisplayProps) {
  // Cálculo do azimute (direção cardeal do avião relativa ao utilizador)
  const bearing = useMemo(() => {
    if (latVoo == null || lonVoo == null) return 0;
    return Math.round(calcularBearingGraus(latUtilizador, lonUtilizador, latVoo, lonVoo));
  }, [latUtilizador, lonUtilizador, latVoo, lonVoo]);

  const cardeal = useMemo(() => obterCardeal(bearing), [bearing]);

  // Posição no radar circular SVG (cx=24, cy=24, R=20)
  const { px, py } = useMemo(() => {
    const cx = 24;
    const cy = 24;
    const R = 20;
    // Escala normalizada entre 0.15 e 0.88 do raio do visor
    const frac = Math.min(0.88, Math.max(0.18, distKm / Math.max(raioMaxKm, 1)));
    const angRad = ((bearing - 90) * Math.PI) / 180;
    return {
      px: cx + frac * R * Math.cos(angRad),
      py: cy + frac * R * Math.sin(angRad),
    };
  }, [bearing, distKm, raioMaxKm]);

  // Formatação de distância respeitando a unidade escolhida (KM, NM ou MI)
  const distNm = distKm / 1.852;
  const distMi = distKm / 1.60934;
  const unidadeAtiva = unidadeDistancia || (unidadeVelocidade === "KTS" ? "NM" : unidadeVelocidade === "MPH" ? "MI" : "KM");

  let valorDisplay = "";
  let subtextoSecundario = "";

  if (unidadeAtiva === "NM") {
    valorDisplay = distNm < 10 ? distNm.toFixed(1) : Math.round(distNm).toString();
    subtextoSecundario = `${distKm.toFixed(1)} KM`;
  } else if (unidadeAtiva === "MI") {
    valorDisplay = distMi < 10 ? distMi.toFixed(1) : Math.round(distMi).toString();
    subtextoSecundario = `${distKm.toFixed(1)} KM`;
  } else {
    valorDisplay = distKm < 10 ? distKm.toFixed(1) : Math.round(distKm).toString();
    subtextoSecundario = `${distNm.toFixed(1)} NM`;
  }
  const unidadePrincipal = unidadeAtiva;

  return (
    <div className="flex items-center justify-center gap-1 sm:gap-2 w-full max-w-full overflow-hidden">
      {/* Scope Circular do Radar com Efeito de Varrimento */}
      <div className="relative w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-[#03090e] border border-emerald-500/40 shadow-[0_0_8px_rgba(16,185,129,0.25)] flex items-center justify-center overflow-hidden shrink-0">
        {/* Feixe rotativo de varredura (Sweep Beam) */}
        <div
          className="absolute inset-0 rounded-full animate-spin pointer-events-none opacity-40"
          style={{
            animationDuration: "3.5s",
            background: "conic-gradient(from 0deg, rgba(16,185,129,0.5) 0deg, rgba(16,185,129,0.05) 60deg, transparent 90deg, transparent 360deg)",
          }}
        />

        {/* Grelha SVG: anéis concêntricos + mira central */}
        <svg viewBox="0 0 48 48" className="absolute inset-0 w-full h-full pointer-events-none">
          {/* Anel exterior (100% alcance) */}
          <circle cx="24" cy="24" r="20" fill="none" stroke="#10b981" strokeWidth="0.8" strokeOpacity="0.4" />
          {/* Anel intermédio (50% alcance) */}
          <circle cx="24" cy="24" r="10" fill="none" stroke="#10b981" strokeWidth="0.6" strokeDasharray="1.5,1.5" strokeOpacity="0.3" />
          {/* Eixos cardeais da mira */}
          <line x1="24" y1="4" x2="24" y2="44" stroke="#10b981" strokeWidth="0.5" strokeOpacity="0.25" />
          <line x1="4" y1="24" x2="44" y2="24" stroke="#10b981" strokeWidth="0.5" strokeOpacity="0.25" />
          {/* Ponto Central (Utilizador / Estação de Radar) */}
          <circle cx="24" cy="24" r="1.5" fill="#34d399" />
          {/* Letra N no topo */}
          <text x="24" y="8" textAnchor="middle" fill="#34d399" fontSize="4.5" fontWeight="bold" opacity="0.7">N</text>
        </svg>

        {/* Blip Pulsante da Aeronave */}
        <div
          className="absolute z-10 flex items-center justify-center pointer-events-none"
          style={{
            left: `${(px / 48) * 100}%`,
            top: `${(py / 48) * 100}%`,
            transform: "translate(-50%, -50%)",
          }}
        >
          {/* Ponto de eco de radar pulsante */}
          <span className="absolute w-2 h-2 rounded-full bg-amber-400/40 animate-ping" />
          {/* Ícone estilizado do avião orientado com o rumo real */}
          <svg
            className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-amber-300 drop-shadow-[0_0_4px_rgba(251,191,36,0.9)]"
            viewBox="0 0 24 24"
            fill="currentColor"
            style={{ transform: `rotate(${rumoVoo}deg)` }}
          >
            <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
          </svg>
        </div>
      </div>

      {/* Dados Numéricos de Distância e Azimute */}
      <div className="flex flex-col items-start min-w-0 overflow-hidden">
        <div className="flex items-baseline gap-0.5 sm:gap-1 leading-none">
          <LedText text={valorDisplay} size="md" />
          <span className="text-[8px] sm:text-[10px] text-neutral-400 font-bold shrink-0">{unidadePrincipal}</span>
        </div>
        <div className="flex items-center gap-1 text-[7px] sm:text-[8px] font-mono text-emerald-400 font-bold tracking-wider leading-none truncate max-w-full">
          <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          <span className="truncate">{cardeal} • {bearing.toString().padStart(3, "0")}°</span>
          <span className="text-neutral-500 hidden xl:inline">({subtextoSecundario})</span>
        </div>
      </div>
    </div>
  );
}

// ─── Componente de Palheta com Escala Universal Auto-Fit ──────────────────────

// ─── Componente de Palheta Mecânica Solari com Rotação Dinâmica ──────────────

const ALFABETO_FLAP = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

interface FlapCellProps {
  char: string;
  size?: "sm" | "md" | "lg" | "xl" | "hero";
  index?: number;
  triggerRoll?: number;
}

function FlapCell({ char, size = "lg", index = 0, triggerRoll = 0 }: FlapCellProps) {
  const [charExibir, setCharExibir] = useState<string>(char === " " ? "\u00A0" : (char || "").toUpperCase());
  const [animating, setAnimating] = useState(false);
  const [flipKey, setFlipKey] = useState(0);

  const ultimoCharRef = useRef<string>(char);
  const ultimoTriggerRef = useRef<number>(triggerRoll);

  useEffect(() => {
    const charAlvo = char === " " ? "\u00A0" : (char || "").toUpperCase();
    const mudouChar = char !== ultimoCharRef.current;
    const disparouTrigger = triggerRoll !== ultimoTriggerRef.current && triggerRoll > 0;

    ultimoCharRef.current = char;
    ultimoTriggerRef.current = triggerRoll;

    // Se não há alteração nem disparo explícito, mantém o caractere alvo sem rodar
    if (!mudouChar && !disparouTrigger) {
      setCharExibir(charAlvo);
      return;
    }

    if (!charAlvo || charAlvo === "\u00A0") {
      setCharExibir("\u00A0");
      return;
    }

    // Duração total: 1.5 segundos (1500ms) com cascata mecânica Solari di Udine.
    // Índice 0 para aos 1150ms, índice 1 aos 1325ms, índice 2 aos 1500ms exatos.
    const tempoParagem = 1150 + (index % 3) * 175;
    const inicio = Date.now();
    let idxAlfa = Math.floor(Math.random() * 26);

    // Arranque com o primeiro estalo mecânico
    setAnimating(true);
    setFlipKey((prev) => prev + 1);
    tocarSomFlapClack();

    const intervalTimer = setInterval(() => {
      const decorrido = Date.now() - inicio;

      if (decorrido >= tempoParagem) {
        clearInterval(intervalTimer);
        setCharExibir(charAlvo);
        setAnimating(true);
        setFlipKey((prev) => prev + 1);
        tocarSomFlapClack();

        // Liberta a animação após assentar
        setTimeout(() => {
          setAnimating(false);
        }, 220);
      } else {
        idxAlfa = (idxAlfa + 1) % ALFABETO_FLAP.length;
        setCharExibir(ALFABETO_FLAP[idxAlfa]);
        setAnimating(true);
        setFlipKey((prev) => prev + 1);
        tocarSomFlapClack();
      }
    }, 65);

    return () => {
      clearInterval(intervalTimer);
    };
  }, [char, triggerRoll, index]);

  const dimensões = {
    sm: "w-[clamp(0.8rem,min(2.6vw,4.5vh),1.5rem)] h-[clamp(1.1rem,min(3.6vw,6.2vh),2.1rem)] text-[clamp(0.8rem,min(2.4vw,4.2vh),1.3rem)] font-black rounded-[2px]",
    md: "w-[clamp(0.95rem,min(3.2vw,5.5vh),1.9rem)] h-[clamp(1.3rem,min(4.4vw,7.8vh),2.6rem)] text-[clamp(0.9rem,min(3vw,5.2vh),1.55rem)] font-black rounded-[3px]",
    lg: "w-[clamp(1.15rem,min(3.8vw,6.8vh),2.3rem)] h-[clamp(1.55rem,min(5.2vw,9.5vh),3.2rem)] text-[clamp(1.05rem,min(3.5vw,6.5vh),1.95rem)] font-black rounded-[4px]",
    xl: "w-[clamp(1.35rem,min(4.6vw,8.2vh),2.8rem)] h-[clamp(1.8rem,min(6.2vw,11.2vh),3.7rem)] text-[clamp(1.2rem,min(4.2vw,7.8vh),2.3rem)] font-black rounded-[5px]",
    hero: "w-[clamp(1.5rem,min(5.4vw,11vh),3.4rem)] h-[clamp(2.1rem,min(7.4vw,15vh),4.3rem)] text-[clamp(1.4rem,min(5vw,10.5vh),2.8rem)] font-black rounded-[5px]",
  }[size];

  const coresTexto = "text-white bg-[#0e1017] border-[#252834] shadow-[0_2px_8px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.25)]";

  return (
    <div
      key={flipKey}
      className={`flap-cell shrink-0 ${dimensões} ${coresTexto} ${animating ? "animate-flap" : ""}`}
    >
      <span className="flap-pin-left" />
      <span className="flap-pin-right" />
      <span className="flap-split-line" />
      <span className="leading-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)] tracking-tighter select-none">
        {charExibir}
      </span>
    </div>
  );
}

// ─── Componente de Palavra Contínua com Sincronismo de Rotação ───────────────

interface FlapWordProps {
  text: string;
  size?: "sm" | "md" | "lg" | "xl" | "hero";
  triggerRoll?: number;
}

function FlapWord({ text, size = "lg", triggerRoll = 0 }: FlapWordProps) {
  const chars = (text || "").split("");

  return (
    <div className="flex items-center gap-[2px] sm:gap-1 flex-nowrap shrink-0 max-w-full">
      {chars.map((c, i) => (
        <FlapCell key={i} char={c} size={size} index={i} triggerRoll={triggerRoll} />
      ))}
    </div>
  );
}

// ─── Matriz de Caracteres 5x7 para Ecrã LED Dot-Matrix Autêntico ─────────────

const LED_FONT_5X7: Record<string, number[]> = {
  ' ': [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00],
  // Números
  '0': [0x0e, 0x11, 0x13, 0x15, 0x19, 0x11, 0x0e],
  '1': [0x04, 0x0c, 0x04, 0x04, 0x04, 0x04, 0x0e],
  '2': [0x0e, 0x11, 0x01, 0x02, 0x04, 0x08, 0x1f],
  '3': [0x1f, 0x02, 0x04, 0x02, 0x01, 0x11, 0x0e],
  '4': [0x02, 0x06, 0x0a, 0x12, 0x1f, 0x02, 0x02],
  '5': [0x1f, 0x10, 0x1e, 0x01, 0x01, 0x11, 0x0e],
  '6': [0x06, 0x08, 0x10, 0x1e, 0x11, 0x11, 0x0e],
  '7': [0x1f, 0x01, 0x02, 0x04, 0x08, 0x08, 0x08],
  '8': [0x0e, 0x11, 0x11, 0x0e, 0x11, 0x11, 0x0e],
  '9': [0x0e, 0x11, 0x11, 0x0f, 0x01, 0x02, 0x0c],
  // Letras Maiúsculas
  'A': [0x0e, 0x11, 0x11, 0x1f, 0x11, 0x11, 0x11],
  'B': [0x1e, 0x11, 0x11, 0x1e, 0x11, 0x11, 0x1e],
  'C': [0x0e, 0x11, 0x10, 0x10, 0x10, 0x11, 0x0e],
  'D': [0x1c, 0x12, 0x11, 0x11, 0x11, 0x12, 0x1c],
  'E': [0x1f, 0x10, 0x10, 0x1e, 0x10, 0x10, 0x1f],
  'F': [0x1f, 0x10, 0x10, 0x1e, 0x10, 0x10, 0x10],
  'G': [0x0e, 0x11, 0x10, 0x17, 0x11, 0x11, 0x0f],
  'H': [0x11, 0x11, 0x11, 0x1f, 0x11, 0x11, 0x11],
  'I': [0x0e, 0x04, 0x04, 0x04, 0x04, 0x04, 0x0e],
  'J': [0x07, 0x02, 0x02, 0x02, 0x02, 0x12, 0x0c],
  'K': [0x11, 0x12, 0x14, 0x18, 0x14, 0x12, 0x11],
  'L': [0x10, 0x10, 0x10, 0x10, 0x10, 0x10, 0x1f],
  'M': [0x11, 0x1b, 0x15, 0x15, 0x11, 0x11, 0x11],
  'N': [0x11, 0x11, 0x19, 0x15, 0x13, 0x11, 0x11],
  'O': [0x0e, 0x11, 0x11, 0x11, 0x11, 0x11, 0x0e],
  'P': [0x1e, 0x11, 0x11, 0x1e, 0x10, 0x10, 0x10],
  'Q': [0x0e, 0x11, 0x11, 0x11, 0x15, 0x12, 0x0d],
  'R': [0x1e, 0x11, 0x11, 0x1e, 0x14, 0x12, 0x11],
  'S': [0x0e, 0x11, 0x10, 0x0e, 0x01, 0x11, 0x0e],
  'T': [0x1f, 0x04, 0x04, 0x04, 0x04, 0x04, 0x04],
  'U': [0x11, 0x11, 0x11, 0x11, 0x11, 0x11, 0x0e],
  'V': [0x11, 0x11, 0x11, 0x11, 0x11, 0x0a, 0x04],
  'W': [0x11, 0x11, 0x11, 0x15, 0x15, 0x15, 0x0a],
  'X': [0x11, 0x11, 0x0a, 0x04, 0x0a, 0x11, 0x11],
  'Y': [0x11, 0x11, 0x0a, 0x04, 0x04, 0x04, 0x04],
  'Z': [0x1f, 0x01, 0x02, 0x04, 0x08, 0x10, 0x1f],
  // Letras Minúsculas
  'a': [0x00, 0x00, 0x0e, 0x01, 0x0f, 0x11, 0x0f],
  'b': [0x10, 0x10, 0x16, 0x19, 0x11, 0x11, 0x1e],
  'c': [0x00, 0x00, 0x0e, 0x11, 0x10, 0x11, 0x0e],
  'd': [0x01, 0x01, 0x0d, 0x13, 0x11, 0x11, 0x0f],
  'e': [0x00, 0x00, 0x0e, 0x11, 0x1f, 0x10, 0x0e],
  'f': [0x06, 0x09, 0x08, 0x1c, 0x08, 0x08, 0x08],
  'g': [0x00, 0x0f, 0x11, 0x11, 0x0f, 0x01, 0x0e],
  'h': [0x10, 0x10, 0x16, 0x19, 0x11, 0x11, 0x11],
  'i': [0x04, 0x00, 0x0c, 0x04, 0x04, 0x04, 0x0e],
  'j': [0x02, 0x00, 0x06, 0x02, 0x02, 0x12, 0x0c],
  'k': [0x10, 0x10, 0x12, 0x14, 0x18, 0x14, 0x12],
  'l': [0x0c, 0x04, 0x04, 0x04, 0x04, 0x04, 0x0e],
  'm': [0x00, 0x00, 0x1a, 0x15, 0x15, 0x11, 0x11],
  'n': [0x00, 0x00, 0x16, 0x19, 0x11, 0x11, 0x11],
  'o': [0x00, 0x00, 0x0e, 0x11, 0x11, 0x11, 0x0e],
  'p': [0x00, 0x00, 0x1e, 0x11, 0x1e, 0x10, 0x10],
  'q': [0x00, 0x00, 0x0d, 0x13, 0x0f, 0x01, 0x01],
  'r': [0x00, 0x00, 0x16, 0x19, 0x10, 0x10, 0x10],
  's': [0x00, 0x00, 0x0f, 0x10, 0x0e, 0x01, 0x1e],
  't': [0x08, 0x08, 0x1c, 0x08, 0x08, 0x09, 0x06],
  'u': [0x00, 0x00, 0x11, 0x11, 0x11, 0x13, 0x0d],
  'v': [0x00, 0x00, 0x11, 0x11, 0x11, 0x0a, 0x04],
  'w': [0x00, 0x00, 0x11, 0x11, 0x15, 0x15, 0x0a],
  'x': [0x00, 0x00, 0x11, 0x0a, 0x04, 0x0a, 0x11],
  'y': [0x00, 0x00, 0x11, 0x11, 0x0f, 0x01, 0x0e],
  'z': [0x00, 0x00, 0x1f, 0x02, 0x04, 0x08, 0x1f],
  // Símbolos e Pontuação
  '-': [0x00, 0x00, 0x00, 0x1f, 0x00, 0x00, 0x00],
  '+': [0x00, 0x04, 0x04, 0x1f, 0x04, 0x04, 0x00],
  ':': [0x00, 0x0c, 0x0c, 0x00, 0x0c, 0x0c, 0x00],
  '.': [0x00, 0x00, 0x00, 0x00, 0x00, 0x0c, 0x0c],
  ',': [0x00, 0x00, 0x00, 0x00, 0x00, 0x0c, 0x08],
  '/': [0x01, 0x02, 0x02, 0x04, 0x08, 0x08, 0x10],
  '°': [0x06, 0x09, 0x09, 0x06, 0x00, 0x00, 0x00],
  '%': [0x19, 0x19, 0x02, 0x04, 0x08, 0x13, 0x13],
  '(': [0x02, 0x04, 0x08, 0x08, 0x08, 0x04, 0x02],
  ')': [0x08, 0x04, 0x02, 0x02, 0x02, 0x04, 0x08],
  '?': [0x0e, 0x11, 0x01, 0x02, 0x04, 0x00, 0x04],
  '!': [0x04, 0x04, 0x04, 0x04, 0x04, 0x00, 0x04],
  '•': [0x00, 0x00, 0x04, 0x0e, 0x04, 0x00, 0x00],
};

// ─── Componente LED Display Dot-Matrix (LEDs Redondos Físicos) ───────────────

interface LedTextProps {
  text: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "hero";
  color?: string;
  className?: string;
}

function LedText({ text, size = "lg", color = "#f4f9ff", className = "" }: LedTextProps) {
  const sizeClass = {
    xs: "h-[0.95rem] sm:h-[1.15rem]",
    sm: "h-[1.15rem] sm:h-[1.35rem]",
    md: "h-[1.4rem] sm:h-[1.75rem]",
    lg: "h-[1.75rem] sm:h-[2.35rem]",
    xl: "h-[2.1rem] sm:h-[2.9rem]",
    hero: "h-[2.6rem] sm:h-[3.8rem]",
  }[size];

  // Cálculo de coordenadas dos LEDs redondos individuais
  const { totalWidth, activeDots, backgroundDots } = useMemo(() => {
    const raw = String(text ?? "");
    const normalized = raw.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    const DOT_STEP = 6;      // Distância entre centros dos LEDs
    const CHAR_COLS = 5;     // 5 colunas por caractere
    const CHAR_ROWS = 7;     // 7 linhas de altura
    const CHAR_GAP = 6;      // 1 coluna de espaçamento entre caracteres
    const SPACE_WIDTH = 14;  // Espaçamento para ' '

    let curX = 3;
    const act: { cx: number; cy: number }[] = [];
    const bg: { cx: number; cy: number }[] = [];

    for (let i = 0; i < normalized.length; i++) {
      const ch = normalized[i];
      if (ch === " ") {
        curX += SPACE_WIDTH;
        continue;
      }

      const glyph = LED_FONT_5X7[ch] || LED_FONT_5X7[ch.toUpperCase()] || LED_FONT_5X7[' '];

      for (let r = 0; r < CHAR_ROWS; r++) {
        const rowVal = glyph[r] ?? 0;
        const cy = r * DOT_STEP + 3;

        for (let c = 0; c < CHAR_COLS; c++) {
          const cx = curX + c * DOT_STEP;
          const isOn = ((rowVal >> (CHAR_COLS - 1 - c)) & 1) === 1;

          if (isOn) {
            act.push({ cx, cy });
          } else {
            bg.push({ cx, cy });
          }
        }
      }

      curX += (CHAR_COLS * DOT_STEP) + CHAR_GAP;
    }

    const totalWidth = Math.max(curX - CHAR_GAP + 3, 20);
    return { totalWidth, activeDots: act, backgroundDots: bg };
  }, [text]);

  return (
    <svg
      viewBox={`0 0 ${totalWidth} 42`}
      preserveAspectRatio="xMidYMid meet"
      className={`inline-block w-auto shrink-0 max-w-full select-none ${sizeClass} ${className}`}
      style={{
        display: "inline-block",
        verticalAlign: "middle",
      }}
    >
      {/* 1. LEDs apagados no fundo (textura de matriz física) */}
      <g fill="#10141f" opacity="0.45">
        {backgroundDots.map((dot, idx) => (
          <circle key={`bg-${idx}`} cx={dot.cx} cy={dot.cy} r={1.5} />
        ))}
      </g>

      {/* 2. LEDs acesos: Diodos redondos individuais com brilho controlado */}
      <g
        fill={color}
        style={{
          filter: "drop-shadow(0 0 1.2px rgba(180,220,255,0.85)) drop-shadow(0 0 3px rgba(100,160,255,0.4))",
        }}
      >
        {activeDots.map((dot, idx) => (
          <circle
            key={`act-${idx}`}
            cx={dot.cx}
            cy={dot.cy}
            r={1.85} // Raio 1.85 com passo 6 garante 2.3 unidades de espaço livre (nunca funde em néon)
          />
        ))}
      </g>

      {/* 3. Ponto focal de alta intensidade no centro do díodo para realismo óptico */}
      <g fill="#ffffff" opacity="0.95">
        {activeDots.map((dot, idx) => (
          <circle key={`core-${idx}`} cx={dot.cx} cy={dot.cy} r={0.9} />
        ))}
      </g>
    </svg>
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

function formatarDistanciaDisplay(distKmNum: number | null | undefined, unidade: "KM" | "NM" | "MI"): string {
  if (distKmNum == null || isNaN(distKmNum)) return "--";
  if (unidade === "NM") {
    const nm = distKmNum / 1.852;
    return `${nm < 10 ? nm.toFixed(1) : Math.round(nm)} NM`;
  }
  if (unidade === "MI") {
    const mi = distKmNum / 1.60934;
    return `${mi < 10 ? mi.toFixed(1) : Math.round(mi)} MI`;
  }
  return `${distKmNum < 10 ? distKmNum.toFixed(1) : Math.round(distKmNum)} KM`;
}

function converterTemperatura(tempCelsius: number, unidade: "C" | "F"): { valor: number; simbolo: string; str: string } {
  if (unidade === "F") {
    const f = Math.round((tempCelsius * 9) / 5 + 32);
    return { valor: f, simbolo: "°F", str: `${f}°F` };
  }
  const c = Math.round(tempCelsius);
  return { valor: c, simbolo: "°C", str: `${c}°C` };
}

function estaNoHorarioNoturno(inicio: string, fim: string, horaAtualStr: string): boolean {
  if (!inicio || !fim || !horaAtualStr) return false;
  const [hIni, mIni] = inicio.split(":").map(Number);
  const [hFim, mFim] = fim.split(":").map(Number);
  const [hAtu, mAtu] = horaAtualStr.split(":").map(Number);

  if (isNaN(hIni) || isNaN(hFim) || isNaN(hAtu)) return false;

  const minIni = hIni * 60 + (mIni || 0);
  const minFim = hFim * 60 + (mFim || 0);
  const minAtu = hAtu * 60 + (mAtu || 0);

  if (minIni <= minFim) {
    return minAtu >= minIni && minAtu < minFim;
  } else {
    return minAtu >= minIni || minAtu < minFim;
  }
}

export interface InfoLocalizacao {
  lat: number;
  lon: number;
  nome: string;
  origem: "gps" | "preset" | "manual" | "padrao";
}

export const LOCALIZACAO_PADRAO: InfoLocalizacao = {
  lat: 41.091,
  lon: -8.642,
  nome: "VALADARES / GAIA",
  origem: "padrao",
};

export default function PainelAnalogicoMobileFullscreen() {
  const [listaVoos, setListaVoos] = useState<EstadoVoo[]>([]);
  const listaVoosRef = useRef<EstadoVoo[]>([]);
  const [ecraAtivo, setEcraAtivo] = useState<"principal" | "restantes" | "meteo">("principal");
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
  const [modalOpcoesAberto, setModalOpcoesAberto] = useState<boolean>(false);
  const [somAtivo, setSomAtivo] = useState<boolean>(true);
  const [volumeSom, setVolumeSom] = useState<number>(80);
  const [unidadeAltitude, setUnidadeAltitude] = useState<"FT" | "MT">("FT");
  const [unidadeVelocidade, setUnidadeVelocidade] = useState<"KTS" | "KMH" | "MPH">("KTS");
  const [unidadeDistancia, setUnidadeDistancia] = useState<"KM" | "NM" | "MI">("KM");
  const [unidadeTemperatura, setUnidadeTemperatura] = useState<"C" | "F">("C");
  const [luminosidadeManual, setLuminosidadeManual] = useState<number>(100);
  const [luminosidadeAuto, setLuminosidadeAuto] = useState<boolean>(true);
  const [brilhoBoostAtivo, setBrilhoBoostAtivo] = useState<boolean>(false);
  const timerBrilhoBoostRef = useRef<NodeJS.Timeout | null>(null);
  const [modoNoturnoManual, setModoNoturnoManual] = useState<boolean>(false);
  const [modoNoturnoAuto, setModoNoturnoAuto] = useState<boolean>(false);
  const [modoNoturnoInicio, setModoNoturnoInicio] = useState<string>("23:00");
  const [modoNoturnoFim, setModoNoturnoFim] = useState<string>("07:00");
  const [modoNoturnoAcordadoTemporario, setModoNoturnoAcordadoTemporario] = useState<boolean>(false);
  const timerAcordarNoturnoRef = useRef<NodeJS.Timeout | null>(null);
  const [idioma, setIdioma] = useState<Idioma>("en");
  const [raioKm, setRaioKm] = useState<number>(20);
  const [raioInput, setRaioInput] = useState<string>("20");
  const [onboardingPasso, setOnboardingPasso] = useState<"nenhum" | "instalacao" | "gps">("nenhum");
  const [triggerFlapsNovoVoo, setTriggerFlapsNovoVoo] = useState<number>(0);

  // Dicionário de traduções reactivo ao idioma ativo (arranque sempre em inglês por omissão)
  const t = useMemo(() => TRADUCOES[idioma] || TRADUCOES.en, [idioma]);

  // Carregar definições do utilizador guardadas em localStorage (som, volume, unidades e raio)
  // Nota: Conforme especificado, o idioma arranca SEMPRE em inglês ("en")
  useEffect(() => {
    try {
      // 1. Raio de Ação
      const raioSalvo = localStorage.getItem("flight_panel_raio_km");
      if (raioSalvo) {
        const r = parseInt(raioSalvo, 10);
        if (!isNaN(r) && r >= 1 && r <= 250) {
          setRaioKm(r);
          setRaioInput(r.toString());
        }
      }

      // 2. Outras definições (som, volume, unidades)
      const configSalva = localStorage.getItem("flight_panel_user_settings");
      if (configSalva) {
        const parsed = JSON.parse(configSalva);
        if (typeof parsed.somAtivo === "boolean") {
          setSomAtivo(parsed.somAtivo);
          definirSomHabilitado(parsed.somAtivo);
        }
        if (typeof parsed.volumeSom === "number" && !isNaN(parsed.volumeSom)) {
          const volClamp = Math.max(0, Math.min(100, Math.round(parsed.volumeSom)));
          setVolumeSom(volClamp);
          definirVolumeGlobal(volClamp / 100);
        }
        if (parsed.unidadeAltitude === "FT" || parsed.unidadeAltitude === "MT") {
          setUnidadeAltitude(parsed.unidadeAltitude);
        }
        if (parsed.unidadeVelocidade === "KTS" || parsed.unidadeVelocidade === "KMH" || parsed.unidadeVelocidade === "MPH") {
          setUnidadeVelocidade(parsed.unidadeVelocidade);
        }
        if (parsed.unidadeDistancia === "KM" || parsed.unidadeDistancia === "NM" || parsed.unidadeDistancia === "MI") {
          setUnidadeDistancia(parsed.unidadeDistancia);
        }
        if (parsed.unidadeTemperatura === "C" || parsed.unidadeTemperatura === "F") {
          setUnidadeTemperatura(parsed.unidadeTemperatura);
        }
        if (typeof parsed.luminosidadeManual === "number" && !isNaN(parsed.luminosidadeManual)) {
          const lClamp = Math.max(10, Math.min(100, Math.round(parsed.luminosidadeManual)));
          setLuminosidadeManual(lClamp);
        }
        if (typeof parsed.luminosidadeAuto === "boolean") {
          setLuminosidadeAuto(parsed.luminosidadeAuto);
        }
        if (typeof parsed.raioKm === "number" && !isNaN(parsed.raioKm)) {
          const rClamp = Math.max(1, Math.min(250, Math.round(parsed.raioKm)));
          setRaioKm(rClamp);
          setRaioInput(rClamp.toString());
        }
        if (typeof parsed.modoNoturnoManual === "boolean") {
          setModoNoturnoManual(parsed.modoNoturnoManual);
        }
        if (typeof parsed.modoNoturnoAuto === "boolean") {
          setModoNoturnoAuto(parsed.modoNoturnoAuto);
        }
        if (typeof parsed.modoNoturnoInicio === "string" && parsed.modoNoturnoInicio) {
          setModoNoturnoInicio(parsed.modoNoturnoInicio);
        }
        if (typeof parsed.modoNoturnoFim === "string" && parsed.modoNoturnoFim) {
          setModoNoturnoFim(parsed.modoNoturnoFim);
        }
      }

      // 2.1 Carregamento independente de luminosidade de chaves dedicadas
      const lumDedicada = localStorage.getItem("flight_panel_luminosidade");
      if (lumDedicada !== null) {
        const lNum = Number(lumDedicada);
        if (!isNaN(lNum) && lNum >= 10 && lNum <= 100) {
          setLuminosidadeManual(lNum);
        }
      }
      const autoDedicada = localStorage.getItem("flight_panel_luminosidade_auto");
      if (autoDedicada !== null) {
        setLuminosidadeAuto(autoDedicada === "true");
      }

      // 3. Verificação de primeira abertura (Onboarding: Passo 1 - Instalação PWA)
      const jaViuOnboarding = localStorage.getItem("flight_panel_onboarding_v1");
      const isStandalone = typeof window !== "undefined" && (
        window.matchMedia("(display-mode: standalone)").matches ||
        window.matchMedia("(display-mode: fullscreen)").matches ||
        (window.navigator as any).standalone === true
      );
      if (!jaViuOnboarding && !isStandalone) {
        setOnboardingPasso("instalacao");
      }
    } catch { }
  }, []);

  const alternarIdioma = (novo: Idioma) => {
    setIdioma(novo);
    try {
      localStorage.setItem("flightpanel_idioma", novo);
      const configSalva = localStorage.getItem("flight_panel_user_settings");
      const parsed = configSalva ? JSON.parse(configSalva) : {};
      localStorage.setItem("flight_panel_user_settings", JSON.stringify({ ...parsed, idioma: novo, raioKm }));
      window.dispatchEvent(new CustomEvent("flightpanel_idioma_alterado", { detail: novo }));
    } catch { }
    if (somAtivo) {
      tocarSomFlapClack(0.2);
    }
  };

  const ciclarIdioma = () => {
    const codigos: Idioma[] = ["pt", "en", "fr", "es"];
    const idx = codigos.indexOf(idioma);
    const proximo = codigos[(idx + 1) % codigos.length];
    alternarIdioma(proximo);
  };

  const alternarSom = (novo: boolean) => {
    setSomAtivo(novo);
    definirSomHabilitado(novo);
    guardarDefinicoes({ somAtivo: novo, volumeSom, unidadeAltitude, unidadeVelocidade, idioma, raioKm });
  };

  const alternarVolume = (novoVolume: number) => {
    const volClamp = Math.max(0, Math.min(100, Math.round(novoVolume)));
    setVolumeSom(volClamp);
    definirVolumeGlobal(volClamp / 100);
    if (volClamp > 0 && !somAtivo) {
      setSomAtivo(true);
      definirSomHabilitado(true);
    }
    guardarDefinicoes({ somAtivo: volClamp > 0 ? (somAtivo ? true : true) : somAtivo, volumeSom: volClamp, unidadeAltitude, unidadeVelocidade, idioma, raioKm });
  };

  const alternarAltitude = (novo: "FT" | "MT") => {
    setUnidadeAltitude(novo);
    guardarDefinicoes({ somAtivo, volumeSom, unidadeAltitude: novo, unidadeVelocidade, unidadeDistancia, unidadeTemperatura, idioma, raioKm });
  };

  const alternarVelocidade = (novo: "KTS" | "KMH" | "MPH") => {
    setUnidadeVelocidade(novo);
    guardarDefinicoes({ somAtivo, volumeSom, unidadeAltitude, unidadeVelocidade: novo, unidadeDistancia, unidadeTemperatura, idioma, raioKm });
  };

  const alternarDistancia = (novo: "KM" | "NM" | "MI") => {
    setUnidadeDistancia(novo);
    guardarDefinicoes({ somAtivo, volumeSom, unidadeAltitude, unidadeVelocidade, unidadeDistancia: novo, unidadeTemperatura, idioma, raioKm });
  };

  const alternarTemperatura = (novo: "C" | "F") => {
    setUnidadeTemperatura(novo);
    guardarDefinicoes({ somAtivo, volumeSom, unidadeAltitude, unidadeVelocidade, unidadeDistancia, unidadeTemperatura: novo, luminosidadeManual, luminosidadeAuto, idioma, raioKm });
  };

  const dispararBoostLuminosidade = useCallback(() => {
    if (timerBrilhoBoostRef.current) {
      clearTimeout(timerBrilhoBoostRef.current);
    }
    setBrilhoBoostAtivo(true);
    timerBrilhoBoostRef.current = setTimeout(() => {
      setBrilhoBoostAtivo(false);
      timerBrilhoBoostRef.current = null;
    }, 5000);
  }, []);

  const alternarLuminosidadeManual = (novo: number) => {
    const lClamp = Math.max(10, Math.min(100, Math.round(novo)));
    setLuminosidadeManual(lClamp);
    try {
      localStorage.setItem("flight_panel_luminosidade", lClamp.toString());
    } catch { }
    guardarDefinicoes({ somAtivo, volumeSom, unidadeAltitude, unidadeVelocidade, unidadeDistancia, unidadeTemperatura, luminosidadeManual: lClamp, luminosidadeAuto, idioma, raioKm });
  };

  const alternarLuminosidadeAuto = (novo: boolean) => {
    setLuminosidadeAuto(novo);
    try {
      localStorage.setItem("flight_panel_luminosidade_auto", novo.toString());
    } catch { }
    guardarDefinicoes({ somAtivo, volumeSom, unidadeAltitude, unidadeVelocidade, unidadeDistancia, unidadeTemperatura, luminosidadeManual, luminosidadeAuto: novo, idioma, raioKm });
  };

  const alternarRaio = (novoRaio: number) => {
    const rClamp = Math.max(1, Math.min(250, Math.round(novoRaio)));
    setRaioKm(rClamp);
    setRaioInput(rClamp.toString());
    guardarDefinicoes({ somAtivo, volumeSom, unidadeAltitude, unidadeVelocidade, unidadeDistancia, unidadeTemperatura, luminosidadeManual, luminosidadeAuto, idioma, raioKm: rClamp });
  };

  const alternarModoNoturnoManual = (novo: boolean) => {
    setModoNoturnoManual(novo);
    guardarDefinicoes({
      somAtivo,
      volumeSom,
      unidadeAltitude,
      unidadeVelocidade,
      unidadeDistancia,
      unidadeTemperatura,
      luminosidadeManual,
      luminosidadeAuto,
      idioma,
      raioKm,
      modoNoturnoManual: novo,
      modoNoturnoAuto,
      modoNoturnoInicio,
      modoNoturnoFim,
    });
  };

  const alternarModoNoturnoAuto = (novo: boolean) => {
    setModoNoturnoAuto(novo);
    guardarDefinicoes({
      somAtivo,
      volumeSom,
      unidadeAltitude,
      unidadeVelocidade,
      unidadeDistancia,
      unidadeTemperatura,
      luminosidadeManual,
      luminosidadeAuto,
      idioma,
      raioKm,
      modoNoturnoManual,
      modoNoturnoAuto: novo,
      modoNoturnoInicio,
      modoNoturnoFim,
    });
  };

  const alterarHorarioNoturno = (inicio: string, fim: string) => {
    setModoNoturnoInicio(inicio);
    setModoNoturnoFim(fim);
    guardarDefinicoes({
      somAtivo,
      volumeSom,
      unidadeAltitude,
      unidadeVelocidade,
      unidadeDistancia,
      unidadeTemperatura,
      luminosidadeManual,
      luminosidadeAuto,
      idioma,
      raioKm,
      modoNoturnoManual,
      modoNoturnoAuto,
      modoNoturnoInicio: inicio,
      modoNoturnoFim: fim,
    });
  };

  const guardarDefinicoes = (defs: {
    somAtivo: boolean;
    volumeSom: number;
    unidadeAltitude: "FT" | "MT";
    unidadeVelocidade: "KTS" | "KMH" | "MPH";
    unidadeDistancia?: "KM" | "NM" | "MI";
    unidadeTemperatura?: "C" | "F";
    luminosidadeManual?: number;
    luminosidadeAuto?: boolean;
    idioma: Idioma;
    raioKm?: number;
    modoNoturnoManual?: boolean;
    modoNoturnoAuto?: boolean;
    modoNoturnoInicio?: string;
    modoNoturnoFim?: string;
  }) => {
    try {
      const valorRaio = defs.raioKm ?? raioKm;
      const valorLum = defs.luminosidadeManual ?? luminosidadeManual;
      const valorAutoLum = defs.luminosidadeAuto ?? luminosidadeAuto;
      const payload = {
        ...defs,
        unidadeDistancia: defs.unidadeDistancia ?? unidadeDistancia,
        unidadeTemperatura: defs.unidadeTemperatura ?? unidadeTemperatura,
        luminosidadeManual: valorLum,
        luminosidadeAuto: valorAutoLum,
        raioKm: valorRaio,
        modoNoturnoManual: defs.modoNoturnoManual ?? modoNoturnoManual,
        modoNoturnoAuto: defs.modoNoturnoAuto ?? modoNoturnoAuto,
        modoNoturnoInicio: defs.modoNoturnoInicio ?? modoNoturnoInicio,
        modoNoturnoFim: defs.modoNoturnoFim ?? modoNoturnoFim,
      };
      localStorage.setItem("flight_panel_user_settings", JSON.stringify(payload));
      localStorage.setItem("flight_panel_luminosidade", valorLum.toString());
      localStorage.setItem("flight_panel_luminosidade_auto", valorAutoLum.toString());
      localStorage.setItem("flightpanel_idioma", defs.idioma);
      localStorage.setItem("flight_panel_raio_km", valorRaio.toString());
      if (defs.idioma) {
        setIdioma(defs.idioma);
        window.dispatchEvent(new CustomEvent("flightpanel_idioma_alterado", { detail: defs.idioma }));
      }
    } catch { }
  };

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

  // ── ATIVAÇÃO AUTOMÁTICA DE FULLSCREEN NA ABERTURA DA APP ───────────────────
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

    // 1. Manter o ecrã sempre activo (WakeLock) sem suspensão de energia
    if (typeof window !== "undefined" && "wakeLock" in navigator) {
      (navigator as any).wakeLock.request("screen").catch(() => { });
    }

    // 2. Desbloquear permissões de áudio no primeiro gesto do utilizador (sem forçar fullscreen da API JS)
    const onUserInteraction = () => {
      desbloquearAudioGlobal();
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

  const [totalNoRadar, setTotalNoRadar] = useState(0);
  const [horaAtual, setHoraAtual] = useState("12:00");
  const [horaComSegundos, setHoraComSegundos] = useState("12:00:00");
  const [dataAtual, setDataAtual] = useState("08 SET");
  const [rotasMap, setRotasMap] = useState<Record<string, any>>({});
  const rotasMapRef = useRef<Record<string, any>>({});

  // Relógio de estação analógica em tempo real para o cabeçalho meteorológico
  useEffect(() => {
    const atualizarTempo = () => {
      const agora = new Date();
      const h = agora.toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" });
      const hSeg = agora.toLocaleTimeString("pt-PT");
      const dia = agora.getDate().toString().padStart(2, "0");
      const mes = obterMesAbreviado(agora.getMonth(), idioma);
      setHoraAtual(h);
      setHoraComSegundos(hSeg);
      setDataAtual(`${dia} ${mes}`);
    };
    atualizarTempo();
    const interval = setInterval(atualizarTempo, 1000);
    return () => clearInterval(interval);
  }, [idioma]);

  // Verificação de Modo Noturno ativo (manual ou por horário automático)
  const estaNoHorarioNoturnoAtivo = useMemo(() => {
    if (!modoNoturnoAuto) return false;
    return estaNoHorarioNoturno(modoNoturnoInicio, modoNoturnoFim, horaAtual);
  }, [modoNoturnoAuto, modoNoturnoInicio, modoNoturnoFim, horaAtual]);

  const modoNoturnoAtivo = modoNoturnoManual || estaNoHorarioNoturnoAtivo;

  // Ao ativar ou desativar o modo noturno, silencia ou restaura o motor de som
  useEffect(() => {
    if (modoNoturnoAtivo) {
      definirSomHabilitado(false);
    } else {
      definirSomHabilitado(somAtivo);
    }
  }, [modoNoturnoAtivo, somAtivo]);

  // Função para acordar temporariamente o ecrã no escuro ao tocar (15 segundos)
  const acordarModoNoturnoTemporario = useCallback(() => {
    if (!modoNoturnoAtivo) return;
    setModoNoturnoAcordadoTemporario(true);
    if (timerAcordarNoturnoRef.current) {
      clearTimeout(timerAcordarNoturnoRef.current);
    }
    timerAcordarNoturnoRef.current = setTimeout(() => {
      setModoNoturnoAcordadoTemporario(false);
    }, 15000);
  }, [modoNoturnoAtivo]);

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
    } catch { }
  }, []);

  // Obtenção de Coordenadas por IP da Rede (Ideal para PC sem chip de GPS)
  const obterLocalizacaoPorIp = useCallback(async (silencioso = false) => {
    if (typeof window === "undefined") return;

    if (!silencioso) {
      setStatusGps("iniciando");
      setDetalheErroGps("A consultar localização aproximada através do IP da rede...");
    }

    try {
      const res = await fetch("/api/geolocalizacao-ip");
      const data = await res.json();

      if (data.sucesso && typeof data.lat === "number" && typeof data.lon === "number") {
        const nomeGeo =
          resolverLocalidadePorCoordenadas(data.lat, data.lon) ||
          `${(data.cidade || "LOCALIDADE DETETADA").toUpperCase()} (${(data.pais || "PT").toUpperCase()})`;

        const novo: InfoLocalizacao = {
          lat: data.lat,
          lon: data.lon,
          nome: nomeGeo,
          origem: "gps",
        };
        setLocalizacao(novo);
        setStatusGps("ativo");
        setPrecisaoMetros(null);
        if (!silencioso) {
          setDetalheErroGps(`Localização obtida por IP da rede (${nomeGeo}).`);
          tocarSomFlapClack(0.3);
        }
        setLatManual(novo.lat.toString());
        setLonManual(novo.lon.toString());
        try {
          localStorage.setItem("flight_panel_user_location", JSON.stringify(novo));
        } catch { }
        return true;
      } else {
        if (!silencioso) {
          setStatusGps("erro");
          setDetalheErroGps("Não foi possível obter localização por IP. Escolhe a localidade na lista abaixo.");
        }
        return false;
      }
    } catch {
      if (!silencioso) {
        setStatusGps("erro");
        setDetalheErroGps("Falha ao contactar o serviço de localização por IP.");
      }
      return false;
    }
  }, []);

  // Motor de Geolocalização com fallback automático por IP para PCs
  const obterGpsDoDispositivo = useCallback((altaPrecisao = true, silencioso = false) => {
    if (typeof window === "undefined") return;

    if (!("geolocation" in navigator)) {
      if (!silencioso) {
        setDetalheErroGps("Navegador sem GPS físico. A tentar obter localização por IP...");
      }
      obterLocalizacaoPorIp(silencioso);
      return;
    }

    if (window.isSecureContext === false) {
      if (!silencioso) {
        setDetalheErroGps("Contexto HTTP inseguro. A obter localização por IP...");
      }
      obterLocalizacaoPorIp(silencioso);
      return;
    }

    if (!silencioso) {
      setStatusGps("iniciando");
      setDetalheErroGps("A solicitar coordenadas de satélite / rede...");
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const acc = pos.coords.accuracy ? Math.round(pos.coords.accuracy) : null;
        setPrecisaoMetros(acc);
        const latFix = Number(pos.coords.latitude.toFixed(4));
        const lonFix = Number(pos.coords.longitude.toFixed(4));
        const nomeGeo = resolverLocalidadePorCoordenadas(latFix, lonFix);
        const novo: InfoLocalizacao = {
          lat: latFix,
          lon: lonFix,
          nome: nomeGeo,
          origem: "gps",
        };
        setLocalizacao(novo);
        setStatusGps("ativo");
        if (!silencioso) {
          setDetalheErroGps(`Sinal GPS fixado (${acc ? acc + "m de precisão" : "Excelente"}).`);
        }
        setLatManual(novo.lat.toString());
        setLonManual(novo.lon.toString());
        try {
          localStorage.setItem("flight_panel_user_location", JSON.stringify(novo));
        } catch { }
      },
      (err) => {
        // Se o GPS falhar por timeout (comum em PC sem antena) ou permissão, aciona o fallback por IP
        if (altaPrecisao && err.code === err.TIMEOUT) {
          obterGpsDoDispositivo(false, silencioso);
        } else {
          if (!silencioso) {
            setDetalheErroGps(`GPS não disponível no PC (${err.message}). A obter localização por IP da rede...`);
          }
          obterLocalizacaoPorIp(silencioso);
        }
      },
      { timeout: 7000, enableHighAccuracy: altaPrecisao, maximumAge: 10000 }
    );
  }, [obterLocalizacaoPorIp]);

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
            const latFix = Number(pos.coords.latitude.toFixed(4));
            const lonFix = Number(pos.coords.longitude.toFixed(4));
            const nomeGeo = resolverLocalidadePorCoordenadas(latFix, lonFix);
            if (atual.lat === latFix && atual.lon === lonFix && atual.nome === nomeGeo) {
              return atual;
            }
            return {
              lat: latFix,
              lon: lonFix,
              nome: nomeGeo,
              origem: "gps",
            };
          });
          setStatusGps("ativo");
          setDetalheErroGps(`Sinal de GPS em refinamento contínuo (precisão atual: ±${acc ?? "?"}m).`);
        },
        () => { },
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 20000 }
      );
    } catch { }

    return () => {
      if (watchId !== null && typeof navigator !== "undefined" && "geolocation" in navigator) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, []);

  // Recuperar localização guardada no dispositivo (localStorage) e gerir arranque com pesquisa automática de localização
  useEffect(() => {
    try {
      // 1. Verificar se é a primeira vez que a app é aberta
      const salvoOnboarding = localStorage.getItem("flight_panel_onboarding_v1");
      if (!salvoOnboarding) {
        const eStandalone = typeof window !== "undefined" && (
          Boolean((window.navigator as any)?.standalone) ||
          window.matchMedia("(display-mode: standalone)").matches
        );
        setOnboardingPasso(eStandalone ? "gps" : "instalacao");
      }

      // 2. Recuperar localização previamente gravada como base imediata (zero tempo de espera)
      const salvo = localStorage.getItem("flight_panel_user_location");
      if (salvo) {
        const parsed = JSON.parse(salvo);
        if (parsed.lat && parsed.lon) {
          setLocalizacao(parsed);
          setStatusGps(parsed.origem === "gps" ? "ativo" : "fixo");
          setLatManual(parsed.lat.toString());
          setLonManual(parsed.lon.toString());
        }
      }
    } catch { }

    // 3. Pesquisa de localização automática e silenciosa a cada abertura (seja primeira vez ou subsequente).
    // Desta forma, se a app for aberta noutra cidade ou país, as coordenadas reais do dispositivo são
    // atualizadas em segundo plano com as ferramentas integradas (GPS com fallback para IP), sem ruído nem bloqueios.
    obterGpsDoDispositivo(true, true);
  }, [obterGpsDoDispositivo]);



  const guardarCoordenadasManuais = () => {
    const lat = parseFloat(latManual);
    const lon = parseFloat(lonManual);
    if (isNaN(lat) || isNaN(lon)) return;
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
    } catch { }
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
        wakeLockInstance.release().catch(() => { });
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

  // Alternância entre os 3 Ecrãs: 1. Principal | 2. Restantes Voos | 3. Meteorologia Dedicada
  const irParaRestantes = useCallback(() => {
    tocarSomFlapClack();
    setEcraAtivo("restantes");
  }, []);

  const irParaPrincipal = useCallback(() => {
    tocarSomFlapClack();
    setEcraAtivo("principal");
  }, []);

  const irParaMeteo = useCallback(() => {
    tocarSomFlapClack();
    setEcraAtivo("meteo");
  }, []);

  // Gestos de Swipe & Arrastar para os lados do ecrã (Ecrã táctil móvel + Rato desktop)
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

    // Arrasto horizontal nítido (> 35px e mais horizontal do que vertical)
    if (Math.abs(deltaX) > 35 && Math.abs(deltaX) > Math.abs(deltaY) * 1.2) {
      if (deltaX < 0) {
        // Arrastar para a esquerda: avança sempre sequencialmente (1 -> 2 -> 3)
        if (ecraAtivo === "principal") {
          irParaRestantes();
        } else if (ecraAtivo === "restantes") {
          irParaMeteo();
        }
      } else {
        // Arrastar para a direita: recua sempre sequencialmente (3 -> 2 -> 1)
        if (ecraAtivo === "meteo") {
          irParaRestantes();
        } else if (ecraAtivo === "restantes") {
          irParaPrincipal();
        }
      }
    }
  };

  // Função para activar ecrã inteiro (utilizada automaticamente na abertura e pelo botão)
  const solicitarFullScreen = useCallback(() => {
    if (typeof window !== "undefined" && "wakeLock" in navigator) {
      (navigator as any).wakeLock.request("screen").catch(() => { });
    }

    if (typeof window !== "undefined") {
      inicializarAudioContext();
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
  }, []);

  // Modo Ecrã Inteiro controlado manualmente por botão dedicado
  const alternarFullScreen = () => {
    if (typeof document !== "undefined") {
      const doc = document as Document & {
        webkitFullscreenElement?: Element;
        webkitExitFullscreen?: () => Promise<void>;
        mozCancelFullScreen?: () => Promise<void>;
        msExitFullscreen?: () => Promise<void>;
      };

      const isFs = !!(doc.fullscreenElement || doc.webkitFullscreenElement);
      if (!isFs) {
        solicitarFullScreen();
      } else {
        if (doc.exitFullscreen) {
          doc.exitFullscreen().catch(() => { });
        } else if (doc.webkitExitFullscreen) {
          doc.webkitExitFullscreen().catch(() => { });
        } else if (doc.mozCancelFullScreen) {
          doc.mozCancelFullScreen().catch(() => { });
        } else if (doc.msExitFullscreen) {
          doc.msExitFullscreen().catch(() => { });
        }
      }
    }
  };



  const carregarMeteorologia = useCallback(async (localCoords?: { lat: number; lon: number } | null) => {
    try {
      const q = localCoords ? `?lat=${localCoords.lat.toFixed(2)}&lon=${localCoords.lon.toFixed(2)}` : "";
      const resMeteo = await fetch(`/api/meteorologia${q}`, { cache: "no-store" });
      const dadosMeteo = await resMeteo.json();
      if (!dadosMeteo.erro) {
        setMeteorologia(dadosMeteo);
      }
    } catch {
      // Ignorar erros
    }
  }, []);

  const tratarZeroVoos = useCallback(async (refLat: number, refLon: number) => {
    // Remoção imediata: espaço aéreo livre transita de imediato para a meteorologia
    listaVoosRef.current = [];
    setListaVoos([]);
    setEcraAtivo("principal");
    setTotalNoRadar(0);
    await carregarMeteorologia({ lat: refLat, lon: refLon });
  }, [carregarMeteorologia]);

  const buscarDados = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      params.set("lat", localizacao.lat.toString());
      params.set("lon", localizacao.lon.toString());
      params.set("radius", raioKm.toString());

      const resVoos = await fetch(`/api/voos?${params.toString()}`);
      const dadosVoos = await resVoos.json();

      if (dadosVoos.rotas && Object.keys(dadosVoos.rotas).length > 0) {
        rotasMapRef.current = { ...rotasMapRef.current, ...dadosVoos.rotas };
        setRotasMap((prev) => ({ ...prev, ...dadosVoos.rotas }));
      }

      const refLat = localizacao.lat;
      const refLon = localizacao.lon;

      if (dadosVoos.estados && dadosVoos.estados.length > 0) {
        // Filtrar aeronaves no ar (não no solo) e estritamente dentro do raio circular exato (elimina cantos da caixa)
        const voosEmAr = dadosVoos.estados.filter((v: EstadoVoo) => {
          if (v[8]) return false;
          if (v[6] == null || v[5] == null) return false;
          const dist = calcularDistanciaHaversineKm(refLat, refLon, v[6], v[5]);
          return dist <= raioKm;
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

          listaVoosRef.current = voosEmAr;
          setListaVoos(voosEmAr);
          setTotalNoRadar(voosEmAr.length);
          if (ecraAtivo === "meteo") {
            carregarMeteorologia({ lat: refLat, lon: refLon });
          }

          // Partilha de dados em cache para a nova página de lista de voos restantes (/voos)
          try {
            sessionStorage.setItem(
              "flight_panel_radar_data",
              JSON.stringify({
                voos: voosEmAr,
                rotas: rotasMapRef.current,
                localizacao: { lat: refLat, lon: refLon, nome: localizacao.nome, raioKm },
                atualizadoEm: Date.now(),
              })
            );
          } catch { }
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
  }, [localizacao, raioKm, carregarMeteorologia, tratarZeroVoos]);

  useEffect(() => {
    buscarDados();
    const int = setInterval(buscarDados, INTERVALO_MS);
    return () => clearInterval(int);
  }, [buscarDados]);

  // O painel principal exibe exclusivamente o voo mais próximo detetado no radar (#1)
  const vooAtual = listaVoos.length > 0 ? listaVoos[0] : null;

  // ── Gestão de Áudio de Entrada de Novo Voo (/Flight.mp3 e Chime de Cabine) ──
  // 1. Toca exclusivamente se o utilizador estiver no Ecrã 1 (ecraAtivo === "principal").
  // 2. Dispara sempre que o voo em destaque no Ecrã 1 (#1) mudar para uma aeronave diferente da anterior.
  // 3. No arranque inicial da página, guarda o voo existente como ponto de partida (baseline) sem disparar som abrupto.
  // 4. Cooldown de segurança (mínimo 6 segundos) para evitar oscilações se dois voos estiverem emparelhados à mesma distância.
  const ultimoVooExibidoIdRef = useRef<string | null>(null);
  const primeiroCarregamentoFeitoRef = useRef<boolean>(false);
  const ultimoSomTocadoTimestampRef = useRef<number>(0);

  useEffect(() => {
    if (!vooAtual) {
      ultimoVooExibidoIdRef.current = null;
      return;
    }

    const idIcao = (vooAtual[0] || "").trim().toLowerCase();
    const idCallsign = (vooAtual[1] || "").trim().toUpperCase();
    const idVoo = idIcao || idCallsign;
    if (!idVoo) return;

    const agora = Date.now();

    // 1. No arranque inicial (primeiro voo recebido após abrir a app),
    // define a aeronave de partida como conhecida para não assustar no primeiro frame
    if (!primeiroCarregamentoFeitoRef.current) {
      primeiroCarregamentoFeitoRef.current = true;
      ultimoVooExibidoIdRef.current = idVoo;
      return;
    }

    // 2. Se o modo noturno estiver ativo, silêncio absoluto e sem boost de luminosidade
    if (modoNoturnoAtivo) {
      ultimoVooExibidoIdRef.current = idVoo;
      return;
    }

    // 2.1 Apenas toca se estiver no Ecrã 1
    if (ecraAtivo !== "principal") {
      ultimoVooExibidoIdRef.current = idVoo;
      return;
    }

    // 3. Se o voo exibido for exatamente o mesmo do ciclo anterior, não toca
    if (ultimoVooExibidoIdRef.current === idVoo) {
      return;
    }

    // 4. Cooldown de segurança (6 segundos) para evitar repetições caso 2 voos alternem rapidamente
    if (agora - ultimoSomTocadoTimestampRef.current < 6000) {
      ultimoVooExibidoIdRef.current = idVoo;
      return;
    }

    // 5. Novo voo assumiu o ecrã principal (#1): toca som oficial de cabine (/Flight.mp3), roda flaps durante 1.5s e aciona boost de luz
    tocarSomNovoVoo();
    setTriggerFlapsNovoVoo(agora);
    if (luminosidadeAuto) {
      dispararBoostLuminosidade();
    }
    ultimoVooExibidoIdRef.current = idVoo;
    ultimoSomTocadoTimestampRef.current = agora;
  }, [vooAtual, ecraAtivo, luminosidadeAuto, dispararBoostLuminosidade, modoNoturnoAtivo]);

  // Assegura carregamento imediato da meteorologia ao entrar no 3º ecrã
  useEffect(() => {
    if (ecraAtivo === "meteo") {
      carregarMeteorologia({ lat: localizacao.lat, lon: localizacao.lon });
    }
  }, [ecraAtivo, localizacao.lat, localizacao.lon, carregarMeteorologia]);

  // Nome limpo da estação meteorológica (resolvido por GPS ou preset, sem strings técnicas)
  const nomeEstacaoDisplay = useMemo(() => {
    const nomeBruto = (meteorologia?.name && meteorologia.name !== "ESTAÇÃO LOCAL")
      ? meteorologia.name
      : localizacao.nome;
    return formatarNomeEstacaoDisplay(nomeBruto, localizacao.lat, localizacao.lon);
  }, [meteorologia?.name, localizacao.nome, localizacao.lat, localizacao.lon]);

  const refLatAtual = localizacao.lat;
  const refLonAtual = localizacao.lon;
  const distVooAtual = (vooAtual && vooAtual[6] != null && vooAtual[5] != null)
    ? calcularDistanciaHaversineKm(refLatAtual, refLonAtual, vooAtual[6], vooAtual[5])
    : null;

  const infoVoo = vooAtual ? resolverVooInfo(vooAtual, rotasMap) : null;
  const emModoNoturnoEscuro = modoNoturnoAtivo && !modoNoturnoAcordadoTemporario;
  const brilhoEfetivo = emModoNoturnoEscuro ? 2 : (brilhoBoostAtivo ? 100 : luminosidadeManual);
  const opacidadeDimmer = emModoNoturnoEscuro ? 0.96 : ((100 - brilhoEfetivo) / 100) * 0.88;

  return (
    <main
      onTouchStart={(e) => {
        acordarModoNoturnoTemporario();
        lidarComInicioArrasto(e);
      }}
      onTouchEnd={lidarComFimArrasto}
      onMouseDown={(e) => {
        acordarModoNoturnoTemporario();
        lidarComInicioArrasto(e);
      }}
      onMouseUp={lidarComFimArrasto}
      className="h-[100dvh] w-[100dvw] max-h-[100dvh] max-w-[100dvw] bg-[#050608] text-white flex flex-col items-center justify-between p-1 sm:p-2 select-none font-mono cursor-default relative overflow-hidden board-texture pb-[max(0.25rem,env(safe-area-inset-bottom))]"
    >
      {/* Título semântico para motores de pesquisa e acessibilidade (SEO) */}
      <h1 className="sr-only">
        Flight Panel — Radar ADS-B e Painel Mecânico Split-Flap de Voos em Tempo Real
      </h1>

      {/* ── SELETOR DE ECRÃ: PAINEL PRINCIPAL (VOO MAIS PRÓXIMO) vs SEGUNDO ECRÃ (RESTANTES VOOS) ── */}
      {ecraAtivo === "principal" ? (
        /* ── PAINEL INTEGRADO SEM MOLDURA EXTERNA (EDGE-TO-EDGE) ─────────────── */
        <div className="w-full max-w-5xl h-full max-h-full flex flex-col justify-between gap-1 sm:gap-1.5 overflow-hidden">

        {/* ── ESTADO A CARREGAR / LOADING ─────────────────────────────────── */}
        {carregando && (
          <div className="h-full flex flex-col items-center justify-center gap-3 text-center">
            <LedText text={t.estado_carregando || "LOADING"} size="lg" />
          </div>
        )}

        {/* ── MODO 1: VOO ACTIVO DETECTADO NO RADAR ────────────────────────── */}
        {!carregando && vooAtual && infoVoo && (
          <div className="flex-1 min-h-0 flex flex-col justify-between gap-1 sm:gap-1.5 overflow-hidden">

            {/* LINHA 1: VOO & LOGÓTIPO & COMPANHIA */}
            <div className="w-full bg-[#10121a] px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl border border-white/10 flex flex-row items-center justify-between gap-2 shadow-lg shrink-0">

              {/* Logótipo Oficial Garantido + Voo + Companhia Aérea */}
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 shrink-0">
                <AirlineLogo
                  icao={infoVoo.icao}
                  iata={infoVoo.iata}
                  nome={infoVoo.nomeCompanhia}
                  callsign={infoVoo.callsign}
                  fabricante={infoVoo.fabricante}
                  modeloAeronave={infoVoo.aeronave}
                />

                <div className="flex flex-col items-start gap-0.5 min-w-0">
                  <span className="text-[8px] sm:text-[10px] uppercase tracking-widest text-neutral-400 font-bold leading-none">
                    {t.rotulo_voo}
                  </span>
                  <LedText
                    text={infoVoo.numeroVoo}
                    size={infoVoo.numeroVoo.length >= 7 ? "sm" : infoVoo.numeroVoo.length >= 5 ? "md" : "lg"}
                  />
                  <span className="text-[9px] sm:text-[11px] font-bold text-neutral-300 tracking-wider truncate max-w-[120px] sm:max-w-[200px] leading-tight">
                    {infoVoo.nomeCompanhia}
                  </span>
                </div>
              </div>

              {/* Aeronave, Fabricante do Avião e Botões de Ação */}
              <div className="flex items-center gap-2 sm:gap-3 shrink-0 max-w-[60%]">
                <div className="flex flex-col items-end gap-0.5 text-right min-w-0 overflow-hidden">
                  <span className="text-[8px] sm:text-[10px] uppercase tracking-widest text-neutral-400 font-bold leading-none">
                    {t.rotulo_aeronave}
                  </span>
                  <LedText
                    text={infoVoo.aeronave}
                    size={infoVoo.aeronave.length >= 12 ? "xs" : infoVoo.aeronave.length >= 9 ? "sm" : "md"}
                  />
                  <span className="text-[9px] sm:text-[11px] font-bold text-neutral-300 tracking-wider truncate max-w-[120px] sm:max-w-none leading-tight">
                    {infoVoo.fabricante}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {promptInstalacao && (
                    <button
                      onClick={instalarApp}
                      className="bg-white/10 hover:bg-white/20 text-white text-[8px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded border border-white/20 transition-all flex items-center gap-1 shadow-md animate-pulse cursor-pointer"
                    >
                      {t.btn_instalar}
                    </button>
                  )}

                  {/* Atalho tátil para o Segundo Ecrã (Restantes Voos) */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      irParaRestantes();
                    }}
                    title="Ver Ecrã 2 (Restantes Voos)"
                    aria-label="Ver Ecrã 2"
                    className="h-6 sm:h-7 px-1.5 sm:px-2 rounded-lg bg-white/5 hover:bg-white/15 active:scale-90 text-amber-400 hover:text-amber-300 border border-white/15 transition-all flex items-center gap-1 text-[9px] sm:text-[10px] font-mono font-bold shadow-sm cursor-pointer shrink-0"
                  >
                    <span>🛫</span>
                    <span>{Math.max(0, listaVoos.length - 1)}</span>
                  </button>

                  {/* Indicador e Atalho Discreto de Modo Noturno Ativo */}
                  {modoNoturnoAtivo && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setModalOpcoesAberto(true);
                      }}
                      title={t.opcoes_noturno_badge_ativo}
                      className="h-6 sm:h-7 px-1.5 sm:px-2 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 transition-all flex items-center gap-1 text-[9px] sm:text-[10px] font-mono font-bold shadow-sm cursor-pointer shrink-0 animate-pulse"
                    >
                      <span>🌙</span>
                      <span className="hidden xs:inline">{t.opcoes_noturno_ativar}</span>
                    </button>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setModalOpcoesAberto(true);
                    }}
                    title={t.btn_opcoes}
                    aria-label={t.btn_opcoes}
                    className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-white/5 hover:bg-white/15 active:scale-90 text-neutral-300 hover:text-white border border-white/15 transition-all flex items-center justify-center text-xs sm:text-sm shadow-sm cursor-pointer shrink-0"
                  >
                    ⚙️
                  </button>
                </div>
              </div>

            </div>

            {/* LINHA 2: SECÇÃO PRINCIPAL DE ROTA (EXPANDIDA NO CENTRO) ───────── */}
            <div className="w-full flex-1 min-h-0 bg-[#10121a] px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl border border-white/10 flex flex-col justify-between shadow-lg overflow-hidden">

              {/* CABEÇALHO DEDICADO DE ROTA: ORIGEM | ESTADO DE VOO | DESTINO */}
              <div className="w-full flex items-center justify-between text-[7px] sm:text-[9px] uppercase tracking-widest text-neutral-400 font-bold shrink-0 pb-0.5">
                <span className="text-left">{t.rotulo_origem}</span>
                <div className="flex items-center gap-1 sm:gap-2 text-neutral-300">
                  <div className="w-3 sm:w-6 h-px bg-white/30" />
                  <span className="text-[7px] sm:text-[8px] text-amber-400 font-bold tracking-wider">
                    {infoVoo.noSolo ? t.estado_no_solo : t.estado_em_voo}
                  </span>
                  <span className="text-white text-[10px] sm:text-xs">✈</span>
                  <div className="w-3 sm:w-6 h-px bg-white/30" />
                </div>
                <span className="text-right">{t.rotulo_destino}</span>
              </div>

              {/* CORPO DE FLAPS: ORIGEM (ESQUERDA) | FLAPS CENTRADOS E AMPLIADOS (CENTRO) | DESTINO (DIREITA) */}
              <div className="w-full flex-1 flex items-center justify-between gap-1 sm:gap-4 min-h-0">
                {/* ORIGEM: LEDs no exterior esquerdo */}
                <div className="flex-1 flex flex-col items-start justify-center min-w-0 pr-1 sm:pr-2">
                  <LedText text={infoVoo.origem} size={infoVoo.origem.length >= 12 ? "xs" : infoVoo.origem.length >= 8 ? "sm" : "md"} />
                  {infoVoo.origemAeroporto && (
                    <span className="text-[8px] sm:text-[10px] font-mono font-bold text-amber-300/90 tracking-wide uppercase truncate max-w-[120px] sm:max-w-[200px] leading-tight">
                      {infoVoo.origemAeroporto}
                    </span>
                  )}
                  {infoVoo.origemPais && (
                    <span className="text-[8px] sm:text-[9px] font-mono font-bold text-sky-400 tracking-wider uppercase leading-tight">
                      {traduzirPais(infoVoo.origemPais, idioma)}
                    </span>
                  )}
                </div>

                {/* CENTRO: Os dois FlapWords agrupados, aumentados com size="hero" e destacados */}
                <div className="flex items-center justify-center gap-1.5 sm:gap-3 flex-nowrap shrink-0 px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-black/50 border border-white/15 shadow-[inset_0_2px_8px_rgba(0,0,0,0.85)]">
                  <FlapWord text={infoVoo.origemCode} size="hero" triggerRoll={triggerFlapsNovoVoo} />
                  <div className="flex items-center gap-1 text-amber-400 font-bold shrink-0 px-1">
                    <div className="w-2.5 sm:w-4 h-px bg-white/20" />
                    <span className="text-amber-400 text-xs sm:text-base animate-pulse">✈</span>
                    <div className="w-2.5 sm:w-4 h-px bg-white/20" />
                  </div>
                  <FlapWord text={infoVoo.destinoCode} size="hero" triggerRoll={triggerFlapsNovoVoo} />
                </div>

                {/* DESTINO: LEDs no exterior direito */}
                <div className="flex-1 flex flex-col items-end justify-center min-w-0 pl-1 sm:pl-2 text-right">
                  <LedText text={infoVoo.destino} size={infoVoo.destino.length >= 12 ? "xs" : infoVoo.destino.length >= 8 ? "sm" : "md"} />
                  {infoVoo.destinoAeroporto && (
                    <span className="text-[8px] sm:text-[10px] font-mono font-bold text-amber-300/90 tracking-wide uppercase truncate max-w-[120px] sm:max-w-[200px] leading-tight">
                      {infoVoo.destinoAeroporto}
                    </span>
                  )}
                  {infoVoo.destinoPais && (
                    <span className="text-[8px] sm:text-[9px] font-mono font-bold text-sky-400 tracking-wider uppercase leading-tight">
                      {traduzirPais(infoVoo.destinoPais, idioma)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* LINHA 3: TELEMETRIA EM 4 MÓDULOS (INCLUINDO MINI-RADAR DE PROXIMIDADE) ── */}
            <div className="w-full grid grid-cols-4 gap-1 sm:gap-2 shrink-0 h-13 sm:h-15 md:h-16">

              {/* 1. ALTITUDE */}
              <div className="bg-[#10121a] px-1 py-0.5 sm:px-2 sm:py-1 rounded-lg sm:rounded-xl border border-white/10 flex flex-col items-center justify-center text-center shadow-md h-full overflow-hidden">
                <span className="text-[7px] sm:text-[9px] uppercase tracking-wider text-neutral-400 font-bold mb-0.5 leading-none shrink-0">
                  {t.rotulo_altitude}
                </span>
                <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
                  <LedText
                    text={`${unidadeAltitude === "FT" ? infoVoo.altitudePes : infoVoo.altitudeMetros}`}
                    size="md"
                  />
                  <span className="text-[8px] sm:text-[10px] text-neutral-400 font-bold">
                    {unidadeAltitude}
                  </span>
                </div>
              </div>

              {/* 2. VELOCIDADE */}
              <div className="bg-[#10121a] px-1 py-0.5 sm:px-2 sm:py-1 rounded-lg sm:rounded-xl border border-white/10 flex flex-col items-center justify-center text-center shadow-md h-full overflow-hidden">
                <span className="text-[7px] sm:text-[9px] uppercase tracking-wider text-neutral-400 font-bold mb-0.5 leading-none shrink-0">
                  {t.rotulo_velocidade}
                </span>
                <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
                  <LedText
                    text={`${unidadeVelocidade === "KTS" ? infoVoo.velocidadeKts : unidadeVelocidade === "KMH" ? infoVoo.velocidadeKmh : infoVoo.velocidadeMph}`}
                    size="md"
                  />
                  <span className="text-[8px] sm:text-[10px] text-neutral-400 font-bold">
                    {unidadeVelocidade === "KTS" ? "KTS" : unidadeVelocidade === "KMH" ? "KMS" : "MPH"}
                  </span>
                </div>
              </div>

              {/* 3. RUMO */}
              <div className="bg-[#10121a] px-1 py-0.5 sm:px-2 sm:py-1 rounded-lg sm:rounded-xl border border-white/10 flex flex-col items-center justify-center text-center shadow-md h-full overflow-hidden">
                <span className="text-[7px] sm:text-[9px] uppercase tracking-wider text-neutral-400 font-bold mb-0.5 leading-none shrink-0">
                  {t.rotulo_rumo}
                </span>
                <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
                  <LedText text={`${infoVoo.rumo}`} size="md" />
                  <span className="text-[8px] sm:text-[10px] text-neutral-400 font-bold">°</span>
                </div>
              </div>

              {/* 4. RADAR DE DISTÂNCIA */}
              <div className="bg-[#10121a] px-1 py-0.5 sm:px-2 sm:py-1 rounded-lg sm:rounded-xl border border-emerald-500/20 flex flex-col items-center justify-center text-center shadow-md relative overflow-hidden h-full">
                <span className="text-[7px] sm:text-[9px] uppercase tracking-wider text-emerald-400 font-bold mb-0.5 flex items-center gap-1 leading-none shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {t.rotulo_distancia}
                </span>
                {distVooAtual != null ? (
                  <MiniRadarDisplay
                    latUtilizador={refLatAtual}
                    lonUtilizador={refLonAtual}
                    latVoo={vooAtual[6]}
                    lonVoo={vooAtual[5]}
                    rumoVoo={infoVoo.rumo}
                    distKm={distVooAtual}
                    raioMaxKm={raioKm}
                    unidadeVelocidade={unidadeVelocidade}
                    unidadeDistancia={unidadeDistancia}
                  />
                ) : (
                  <div className="flex items-center gap-1 shrink-0">
                    <LedText text="---" size="md" />
                    <span className="text-[8px] sm:text-[10px] text-neutral-400 font-bold">{unidadeDistancia}</span>
                  </div>
                )}
              </div>

            </div>

          </div>
        )}

        {/* ── MODO 2: SEM VOOS → MODO METEOROLOGIA AERONÁUTICA AUTOMÁTICA ─── */}
        {!carregando && !vooAtual && (
          <div className="flex-1 min-h-0 flex flex-col justify-between gap-1.5 sm:gap-2.5 overflow-hidden">

            {/* LINHA 1: CABEÇALHO DA ESTAÇÃO METEOROLÓGICA & RADAR */}
            <div className="w-full bg-[#10121a] p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl border border-white/10 flex flex-row items-center justify-between gap-1.5 sm:gap-3 shadow-lg shrink-0 overflow-hidden">
              <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
                <div className="w-9 h-9 sm:w-12 sm:h-12 bg-neutral-900 border border-white/10 rounded-lg flex items-center justify-center shrink-0 shadow-inner">
                  <WeatherIconSVG
                    code={meteorologia?.weather?.[0]?.code}
                    isDay={meteorologia?.environment?.is_day ?? true}
                    className="w-5 h-5 sm:w-8 sm:h-8"
                  />
                </div>
                <div className="flex flex-col items-start gap-0.5 shrink-0">
                  <div className="flex items-center gap-1.5 flex-nowrap whitespace-nowrap">
                    <span className="text-[8px] sm:text-[9px] uppercase tracking-widest text-neutral-400 font-mono font-bold truncate max-w-[150px] sm:max-w-none">
                      {t.cabecalho_radar}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1.5 flex-nowrap whitespace-nowrap shrink-0">
                    <LedText text={horaAtual} size="lg" />
                    <LedText text={dataAtual} size="sm" />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-3 min-w-0 max-w-[45%] justify-end shrink">
                <div className="flex flex-col items-end gap-0.5 text-right min-w-0 overflow-hidden">
                  <span className="text-[8px] sm:text-[9px] uppercase tracking-widest text-neutral-400 font-bold truncate">
                    {t.meteo_estacao}
                  </span>
                  <div className="truncate max-w-full flex justify-end">
                    <LedText
                      text={nomeEstacaoDisplay}
                      size={nomeEstacaoDisplay.length > 10 ? "xs" : nomeEstacaoDisplay.length > 7 ? "sm" : "md"}
                    />
                  </div>
                  <span className="text-[8px] sm:text-[9px] font-mono text-neutral-400 truncate">
                    {localizacao.lat.toFixed(2)}°N, {Math.abs(localizacao.lon).toFixed(2)}°W
                  </span>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setModalOpcoesAberto(true);
                  }}
                  title={t.btn_opcoes}
                  aria-label={t.btn_opcoes}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white/5 hover:bg-white/15 active:scale-90 text-neutral-300 hover:text-white border border-white/15 transition-all flex items-center justify-center text-sm sm:text-base shadow-sm cursor-pointer shrink-0"
                >
                  ⚙️
                </button>
              </div>
            </div>

            {/* LINHA 2: CONDIÇÕES CENTRAIS DE TEMPO & TEMPERATURA */}
            <div className="w-full flex-1 min-h-0 bg-[#10121a] px-3 sm:px-4 py-2 sm:py-3 rounded-xl border border-white/10 flex flex-col justify-between shadow-lg overflow-hidden">
              <div className="w-full flex items-center justify-between text-[8px] sm:text-[10px] uppercase tracking-widest text-neutral-400 font-bold shrink-0">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                  {t.meteo_condicoes}
                </span>
                <span>{t.meteo_temperatura_sensacao}</span>
              </div>

              <div className="w-full flex-1 flex items-center justify-between gap-4 min-h-0 py-1">
                <div className="flex flex-col items-start gap-1 min-w-0">
                  <LedText text={traduzirCondicaoMeteo(meteorologia?.weather?.[0]?.description, idioma)} size="hero" />
                  <div className="flex items-center gap-2 flex-wrap text-[9px] sm:text-xs text-neutral-400 font-mono whitespace-nowrap">
                    {meteorologia?.environment?.precipitation_mm != null && (
                      <>
                        <span className="text-cyan-400 font-bold tracking-wider">
                          {t.meteo_precipitacao}: {meteorologia.environment.precipitation_mm.toFixed(1)} mm
                        </span>
                        <span>•</span>
                      </>
                    )}
                    <span className="text-amber-400/90 font-bold">
                      {t.meteo_sensacao}: {converterTemperatura(meteorologia?.main?.feels_like ?? meteorologia?.main?.temp ?? 18, unidadeTemperatura).str}
                    </span>
                    <span>•</span>
                    <span className="text-sky-300">
                      {t.meteo_min} {converterTemperatura(meteorologia?.main?.temp_min ?? ((meteorologia?.main?.temp ?? 18) - 3), unidadeTemperatura).str}
                    </span>
                    <span>/</span>
                    <span className="text-orange-400">
                      {t.meteo_max} {converterTemperatura(meteorologia?.main?.temp_max ?? ((meteorologia?.main?.temp ?? 18) + 3), unidadeTemperatura).str}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end shrink-0">
                  <div className="flex items-center gap-1">
                    <LedText text={`${converterTemperatura(meteorologia?.main?.temp ?? 18, unidadeTemperatura).valor}`} size="hero" />
                    <span className="text-2xl sm:text-4xl font-black text-white">{converterTemperatura(meteorologia?.main?.temp ?? 18, unidadeTemperatura).simbolo}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* LINHA 3: TELEMETRIA METEOROLÓGICA (GRELHA DE 6 MÓDULOS) */}
            <div className="w-full grid grid-cols-3 sm:grid-cols-6 gap-1 sm:gap-2 shrink-0">

              {/* Módulo 1: Vento */}
              <div className="bg-[#10121a] p-1.5 sm:p-2 rounded-xl border border-white/10 flex flex-col items-center justify-center text-center shadow-md">
                <span className="text-[8px] sm:text-[9px] uppercase tracking-wider text-neutral-400 font-bold mb-0.5">{t.meteo_vento}</span>
                <div className="flex items-center gap-0.5">
                  <LedText text={`${meteorologia?.wind?.speed_kmh ?? Math.round((meteorologia?.wind?.speed ?? 3.5) * 3.6)}`} size="sm" />
                  <span className="text-[8px] text-neutral-400 font-bold font-mono">KM/H</span>
                </div>
                <span className="text-[8px] sm:text-[9px] text-amber-400 font-mono font-bold">
                  {meteorologia?.wind?.direction_cardinal || "N"} ({meteorologia?.wind?.speed_kts ?? 7} KT)
                </span>
              </div>

              {/* Módulo 2: QNH */}
              <div className="bg-[#10121a] p-1.5 sm:p-2 rounded-xl border border-white/10 flex flex-col items-center justify-center text-center shadow-md">
                <span className="text-[8px] sm:text-[9px] uppercase tracking-wider text-neutral-400 font-bold mb-0.5">{t.meteo_pressao}</span>
                <div className="flex items-center gap-0.5">
                  <LedText text={`${meteorologia?.aviation?.qnh ?? meteorologia?.main?.pressure ?? 1016}`} size="sm" />
                  <span className="text-[8px] text-neutral-400 font-bold font-mono">HPA</span>
                </div>
                <span className="text-[8px] sm:text-[9px] text-emerald-400 font-mono font-bold">{t.meteo_sub_altimetro}</span>
              </div>

              {/* Módulo 3: Humidade */}
              <div className="bg-[#10121a] p-1.5 sm:p-2 rounded-xl border border-white/10 flex flex-col items-center justify-center text-center shadow-md">
                <span className="text-[8px] sm:text-[9px] uppercase tracking-wider text-neutral-400 font-bold mb-0.5">{t.meteo_humidade}</span>
                <div className="flex items-center gap-0.5">
                  <LedText text={`${meteorologia?.main?.humidity ?? 70}`} size="sm" />
                  <span className="text-[8px] text-neutral-400 font-bold font-mono">%</span>
                </div>
                <span className="text-[8px] sm:text-[9px] text-sky-400 font-mono font-bold">{t.meteo_sub_humidade}</span>
              </div>

              {/* Módulo 4: Nascer do Sol */}
              <div className="bg-[#10121a] p-1.5 sm:p-2 rounded-xl border border-white/10 flex flex-col items-center justify-center text-center shadow-md">
                <span className="text-[8px] sm:text-[9px] uppercase tracking-wider text-neutral-400 font-bold mb-0.5">{t.meteo_nascer_sol}</span>
                <div className="flex items-center gap-1 text-[10px] sm:text-xs font-mono font-black text-white">
                  <span className="text-amber-400">☀️</span>
                  {meteorologia?.environment?.sunrise || "07:15"}
                </div>
                <span className="text-[8px] sm:text-[9px] text-neutral-400 font-mono">{t.meteo_sub_aurora}</span>
              </div>

              {/* Módulo 5: Pôr do Sol */}
              <div className="bg-[#10121a] p-1.5 sm:p-2 rounded-xl border border-white/10 flex flex-col items-center justify-center text-center shadow-md">
                <span className="text-[8px] sm:text-[9px] uppercase tracking-wider text-neutral-400 font-bold mb-0.5">{t.meteo_por_sol}</span>
                <div className="flex items-center gap-1 text-[10px] sm:text-xs font-mono font-black text-white">
                  <span className="text-orange-400">🌙</span>
                  {meteorologia?.environment?.sunset || "19:50"}
                </div>
                <span className="text-[8px] sm:text-[9px] text-neutral-400 font-mono">{t.meteo_sub_crepusculo}</span>
              </div>

              {/* Módulo 6: Índice UV */}
              <div className="bg-[#10121a] p-1.5 sm:p-2 rounded-xl border border-white/10 flex flex-col items-center justify-center text-center shadow-md">
                <span className="text-[8px] sm:text-[9px] uppercase tracking-wider text-neutral-400 font-bold mb-0.5">{t.meteo_uv}</span>
                <div className="flex items-center gap-0.5">
                  <span className="text-[10px] sm:text-xs font-mono font-black text-amber-300">
                    UV {meteorologia?.environment?.uv_index ?? 3}
                  </span>
                </div>
                <span className="text-[8px] sm:text-[9px] text-emerald-400 font-mono font-bold">{t.meteo_sub_uv}</span>
              </div>

            </div>

          </div>
        )}

      </div >
      ) : ecraAtivo === "restantes" ? (
        /* ── SEGUNDO ECRÃ: RADAR ADS-B COM CARTÕES DETALHADOS DE VOO ── */
        <div className="w-full max-w-5xl h-full max-h-full flex flex-col justify-between gap-2 sm:gap-3 overflow-hidden font-mono">
          {/* CABEÇALHO DO RADAR ADS-B (ECRÃ 2) */}
          <header className="w-full bg-[#0c0e14] border border-white/15 rounded-xl sm:rounded-2xl p-2.5 sm:p-3.5 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 shrink-0">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <button
                onClick={irParaPrincipal}
                className="flex items-center gap-1.5 bg-sky-500/20 hover:bg-sky-500/35 active:scale-95 text-sky-300 hover:text-white px-2.5 sm:px-3 py-1.5 rounded-lg border border-sky-400/40 text-xs sm:text-sm font-bold font-mono transition-all cursor-pointer shadow-md shrink-0"
                title={t.tab_voltar}
              >
                <span>←</span>
                <span>{t.tab_voltar}</span>
              </button>
              <div>
                <h1 className="text-xs sm:text-sm font-black tracking-wider text-white uppercase flex items-center gap-2">
                  <span>RADAR ADS-B</span>
                  <span className="text-[9px] sm:text-[10px] bg-emerald-950/80 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30 font-mono">
                    {horaComSegundos}
                  </span>
                </h1>
                <p className="text-[9px] sm:text-[11px] text-neutral-400">
                  📍 {localizacao.nome.toUpperCase()} • {t.tab_raio_circular} {raioKm} KM
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs self-end sm:self-center">
              <span className="bg-white/10 px-2 sm:px-2.5 py-1 rounded-lg border border-white/15 text-neutral-300 font-bold text-[10px] sm:text-xs">
                {t.estado_em_voo}: <strong className="text-amber-400">{listaVoos.length}</strong>
              </span>
              <span className="bg-sky-500/15 px-2 sm:px-2.5 py-1 rounded-lg border border-sky-500/30 text-sky-300 font-bold text-[10px] sm:text-xs">
                {t.tab_voo}: <strong className="text-white">{Math.max(0, listaVoos.length - 1)}</strong>
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setModalOpcoesAberto(true);
                }}
                title={t.btn_opcoes}
                aria-label={t.btn_opcoes}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white/5 hover:bg-white/15 active:scale-90 text-neutral-300 hover:text-white border border-white/15 transition-all flex items-center justify-center text-xs sm:text-sm shadow-sm cursor-pointer shrink-0"
              >
                ⚙️
              </button>
            </div>
          </header>

          {/* ÁREA DE SCROLL DOS CARTÕES DE VOO */}
          <div className="w-full flex-1 min-h-0 overflow-y-auto pr-1 flex flex-col gap-3 sm:gap-4 pb-2">
            {listaVoos.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center gap-3 text-center p-8 bg-[#10121a]/50 rounded-2xl border border-white/10 my-auto">
                <span className="text-3xl sm:text-4xl">📡</span>
                <span className="text-sm sm:text-base font-bold text-neutral-200">{t.tab_sem_outros_voos}</span>
                <span className="text-xs text-neutral-400 max-w-md">
                  {t.tab_sem_voos_desc_geral} {raioKm} km.
                </span>
                <button
                  onClick={irParaPrincipal}
                  className="mt-3 px-4 py-2 rounded-xl bg-sky-500/20 hover:bg-sky-500/35 text-xs font-bold text-sky-300 border border-sky-400/30 transition-all cursor-pointer"
                >
                  ← {t.tab_voltar}
                </button>
              </div>
            ) : (
              <>
                {/* ── 1. VOO PRINCIPAL (MAIS PRÓXIMO) ── */}
                {(() => {
                  const voo = listaVoos[0];
                  const info = resolverVooInfo(voo, rotasMap);
                  const distKmNum =
                    voo[6] != null && voo[5] != null
                      ? calcularDistanciaHaversineKm(localizacao.lat, localizacao.lon, voo[6], voo[5])
                      : null;
                  const textoDistancia = formatarDistanciaDisplay(distKmNum, unidadeDistancia);

                  return (
                    <section className="bg-gradient-to-r from-emerald-950/40 via-[#10131d] to-[#0c0e14] border border-emerald-500/30 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-lg flex flex-col gap-2 shrink-0">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-emerald-400 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          {t.tab_voo_principal}
                        </span>
                        <span className="text-xs sm:text-sm font-bold text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30 tabular-nums">
                          📍 {textoDistancia}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <AirlineLogo
                            icao={info.icao}
                            iata={info.iata}
                            nome={info.nomeCompanhia}
                            callsign={info.callsign}
                            fabricante={info.fabricante}
                            modeloAeronave={info.aeronave}
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
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
                          <div className="text-[10px] sm:text-xs text-neutral-200 font-bold max-w-[260px] sm:max-w-none truncate sm:whitespace-normal">
                            <span>{info.origem}</span>
                            {info.origemAeroporto && <span className="text-amber-300/90 font-mono ml-1 font-semibold">({info.origemAeroporto})</span>}
                            {info.origemPais && <span className="text-sky-400 text-[9px] sm:text-[10px] font-mono ml-1">[{traduzirPais(info.origemPais, idioma)}]</span>}
                            <span className="text-amber-400 mx-1.5">➔</span>
                            <span>{info.destino}</span>
                            {info.destinoAeroporto && <span className="text-amber-300/90 font-mono ml-1 font-semibold">({info.destinoAeroporto})</span>}
                            {info.destinoPais && <span className="text-sky-400 text-[9px] sm:text-[10px] font-mono ml-1">[{traduzirPais(info.destinoPais, idioma)}]</span>}
                          </div>
                          <div className="text-[9px] sm:text-[10px] text-neutral-300 font-mono mt-0.5">
                            {unidadeAltitude === "FT" ? info.altitudePes : info.altitudeMetros} {unidadeAltitude} • {unidadeVelocidade === "KTS" ? info.velocidadeKts : unidadeVelocidade === "KMH" ? info.velocidadeKmh : info.velocidadeMph} {unidadeVelocidade === "KTS" ? "KTS" : unidadeVelocidade === "KMH" ? "KMS" : "MPH"} • {info.rumo}°
                          </div>
                        </div>
                      </div>
                    </section>
                  );
                })()}

                {/* ── 2. SECÇÃO DOS VOOS RESTANTES NO RADAR ── */}
                <section className="flex flex-col gap-2.5">
                  <div className="flex items-center justify-between px-1">
                    <h2 className="text-xs sm:text-sm font-black tracking-widest uppercase text-neutral-300 flex items-center gap-2">
                      <span>✈️ {t.ecra2_titulo}</span>
                      <span className="text-[10px] text-neutral-400 font-normal">
                        ({t.tab_distancia})
                      </span>
                    </h2>
                    <span className="text-[10px] text-neutral-400 font-mono">
                      {t.tab_total}: {Math.max(0, listaVoos.length - 1)}
                    </span>
                  </div>

                  {listaVoos.length <= 1 ? (
                    <div className="bg-[#10121a] p-6 sm:p-8 rounded-xl border border-white/10 text-center text-neutral-400 text-xs sm:text-sm font-mono flex flex-col items-center justify-center gap-2">
                      <span className="text-2xl">📡</span>
                      <span className="text-neutral-200 font-bold">{t.tab_sem_outros_voos}</span>
                      <span className="text-[11px] text-neutral-400 max-w-md">
                        {t.tab_sem_outros_voos_desc_com_principal} {raioKm} km.
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2.5">
                      {listaVoos.slice(1).map((voo, idx) => {
                        const info = resolverVooInfo(voo, rotasMap);
                        const distKmNum =
                          voo[6] != null && voo[5] != null
                            ? calcularDistanciaHaversineKm(localizacao.lat, localizacao.lon, voo[6], voo[5])
                            : null;
                        const textoDistancia = formatarDistanciaDisplay(distKmNum, unidadeDistancia);

                        return (
                          <div
                            key={voo[0] || idx}
                            className="bg-[#10121a] hover:bg-[#141824] border border-white/10 hover:border-white/20 rounded-xl p-3 sm:p-4 shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0"
                          >
                            {/* Esquerda: Ordem, Logótipo, Voo e Aeronave */}
                            <div className="flex items-center gap-3 min-w-0">
                              <span className="text-xs font-bold text-neutral-400 font-mono w-6 text-center shrink-0">
                                #{idx + 2}
                              </span>

                              <AirlineLogo
                                icao={info.icao}
                                iata={info.iata}
                                nome={info.nomeCompanhia}
                                callsign={info.callsign}
                                fabricante={info.fabricante}
                                modeloAeronave={info.aeronave}
                              />

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
                                    {traduzirPais(info.origemPais, idioma) || info.origemCode}
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
                                  📍 {textoDistancia}
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
                                  {info.origemPais && <span className="text-sky-400 font-mono ml-0.5">[{traduzirPais(info.origemPais, idioma)}]</span>}
                                  <span className="text-amber-400 mx-1">➔</span>
                                  <span>{info.destino}</span>
                                  {info.destinoAeroporto && <span className="text-amber-300/90 font-mono ml-0.5">({info.destinoAeroporto})</span>}
                                  {info.destinoPais && <span className="text-sky-400 font-mono ml-0.5">[{traduzirPais(info.destinoPais, idioma)}]</span>}
                                </div>
                              </div>

                              {/* Telemetria */}
                              <div className="text-[9px] sm:text-[10px] text-neutral-300 font-mono text-right flex items-center gap-1.5">
                                <span>{unidadeAltitude === "FT" ? info.altitudePes : info.altitudeMetros} {unidadeAltitude}</span>
                                <span>•</span>
                                <span>{unidadeVelocidade === "KTS" ? info.velocidadeKts : unidadeVelocidade === "KMH" ? info.velocidadeKmh : info.velocidadeMph} {unidadeVelocidade === "KTS" ? "KTS" : unidadeVelocidade === "KMH" ? "KMS" : "MPH"}</span>
                                <span>•</span>
                                <span>{info.rumo}°</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </section>
              </>
            )}
          </div>

        </div>
      ) : (
        /* ── TERCEIRO ECRÃ: METEOROLOGIA DEDICADA ────────────────────────────── */
        <div className="w-full max-w-5xl h-full max-h-full flex flex-col justify-between gap-1.5 sm:gap-2.5 overflow-hidden">
          {/* CABEÇALHO DO 3º ECRÃ: ESTAÇÃO METEOROLÓGICA & RADAR */}
          <div className="w-full bg-[#10121a] p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl border border-white/10 flex flex-row items-center justify-between gap-1.5 sm:gap-3 shadow-lg shrink-0 overflow-hidden">
            <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
              <button
                onClick={irParaPrincipal}
                className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 active:scale-95 text-amber-400 hover:text-amber-300 border border-amber-400/30 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shrink-0"
                title="Voltar ao Voo Principal"
              >
                <span>⟵</span>
                <span className="hidden md:inline">{t.opcoes_ecra_principal}</span>
              </button>

              <div className="w-9 h-9 sm:w-12 sm:h-12 bg-neutral-900 border border-white/10 rounded-lg flex items-center justify-center shrink-0 shadow-inner">
                <WeatherIconSVG
                  code={meteorologia?.weather?.[0]?.code}
                  isDay={meteorologia?.environment?.is_day ?? true}
                  className="w-5 h-5 sm:w-8 sm:h-8"
                />
              </div>

              <div className="flex flex-col items-start gap-0.5 shrink-0">
                <div className="flex items-center gap-1.5 flex-nowrap whitespace-nowrap">
                  <span className="text-[8px] sm:text-[9px] uppercase tracking-widest text-sky-400 font-mono font-bold truncate max-w-[150px] sm:max-w-none">
                    {t.cabecalho_ecra3}
                  </span>
                  <span className="hidden sm:inline-block text-[8px] sm:text-[9px] font-mono px-1 py-0.2 rounded bg-emerald-400/10 border border-emerald-400/30 text-emerald-300 font-bold">
                    {listaVoos.length > 0 ? `${listaVoos.length} ${t.meteo_voos_detectados}` : t.meteo_aguardando}
                  </span>
                </div>
                <div className="flex items-baseline gap-1.5 flex-nowrap whitespace-nowrap shrink-0">
                  <LedText text={horaAtual} size="lg" />
                  <LedText text={dataAtual} size="sm" />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-3 min-w-0 max-w-[45%] justify-end shrink">
              <div className="flex flex-col items-end gap-0.5 text-right min-w-0 overflow-hidden">
                <span className="text-[8px] sm:text-[9px] uppercase tracking-widest text-neutral-400 font-bold truncate">
                  {t.meteo_estacao}
                </span>
                <div className="truncate max-w-full flex justify-end">
                  <LedText
                    text={nomeEstacaoDisplay}
                    size={nomeEstacaoDisplay.length > 10 ? "xs" : nomeEstacaoDisplay.length > 7 ? "sm" : "md"}
                  />
                </div>
                <span className="text-[8px] sm:text-[9px] font-mono text-neutral-400 truncate">
                  {localizacao.lat.toFixed(2)}°N, {Math.abs(localizacao.lon).toFixed(2)}°W
                </span>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setModalOpcoesAberto(true);
                }}
                title={t.btn_opcoes}
                aria-label={t.btn_opcoes}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white/5 hover:bg-white/15 active:scale-90 text-neutral-300 hover:text-white border border-white/15 transition-all flex items-center justify-center text-sm sm:text-base shadow-sm cursor-pointer shrink-0"
              >
                ⚙️
              </button>
            </div>
          </div>

          {/* LINHA 2: CONDIÇÕES CENTRAIS DE TEMPO & TEMPERATURA */}
          <div className="w-full flex-1 min-h-0 bg-[#10121a] px-3 sm:px-4 py-2 sm:py-3 rounded-xl border border-white/10 flex flex-col justify-between shadow-lg overflow-hidden">
            <div className="w-full flex items-center justify-between text-[8px] sm:text-[10px] uppercase tracking-widest text-neutral-400 font-bold shrink-0">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                {t.meteo_condicoes}
              </span>
              <span>{t.meteo_temperatura_sensacao}</span>
            </div>

            <div className="w-full flex-1 flex items-center justify-between gap-4 min-h-0 py-1">
              <div className="flex flex-col items-start gap-1 min-w-0">
                <LedText text={traduzirCondicaoMeteo(meteorologia?.weather?.[0]?.description, idioma)} size="hero" />
                <div className="flex items-center gap-2 flex-wrap text-[9px] sm:text-xs text-neutral-400 font-mono whitespace-nowrap">
                  {meteorologia?.environment?.precipitation_mm != null && (
                    <>
                      <span className="text-cyan-400 font-bold tracking-wider">
                        {t.meteo_precipitacao}: {meteorologia.environment.precipitation_mm.toFixed(1)} mm
                      </span>
                      <span>•</span>
                    </>
                  )}
                  <span className="text-amber-400/90 font-bold">
                    {t.meteo_sensacao}: {converterTemperatura(meteorologia?.main?.feels_like ?? meteorologia?.main?.temp ?? 18, unidadeTemperatura).str}
                  </span>
                  <span>•</span>
                  <span className="text-sky-300">
                    {t.meteo_min} {converterTemperatura(meteorologia?.main?.temp_min ?? ((meteorologia?.main?.temp ?? 18) - 3), unidadeTemperatura).str}
                  </span>
                  <span>/</span>
                  <span className="text-orange-400">
                    {t.meteo_max} {converterTemperatura(meteorologia?.main?.temp_max ?? ((meteorologia?.main?.temp ?? 18) + 3), unidadeTemperatura).str}
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-end shrink-0">
                <div className="flex items-center gap-1">
                  <LedText text={`${converterTemperatura(meteorologia?.main?.temp ?? 18, unidadeTemperatura).valor}`} size="hero" />
                  <span className="text-2xl sm:text-4xl font-black text-white">{converterTemperatura(meteorologia?.main?.temp ?? 18, unidadeTemperatura).simbolo}</span>
                </div>
              </div>
            </div>
          </div>

          {/* LINHA 3: TELEMETRIA METEOROLÓGICA (GRELHA DE 6 MÓDULOS) */}
          <div className="w-full grid grid-cols-3 sm:grid-cols-6 gap-1.5 sm:gap-2 shrink-0">
            {/* Módulo 1: Vento */}
            <div className="bg-[#10121a] p-1.5 sm:p-2 rounded-xl border border-white/10 flex flex-col items-center justify-center text-center shadow-md">
              <span className="text-[8px] sm:text-[9px] uppercase tracking-wider text-neutral-400 font-bold mb-0.5">{t.meteo_vento}</span>
              <div className="flex items-center gap-0.5">
                <LedText text={`${meteorologia?.wind?.speed_kmh ?? Math.round((meteorologia?.wind?.speed ?? 3.5) * 3.6)}`} size="sm" />
                <span className="text-[8px] text-neutral-400 font-bold font-mono">KM/H</span>
              </div>
              <span className="text-[8px] sm:text-[9px] text-amber-400 font-mono font-bold">
                {meteorologia?.wind?.direction_cardinal || "N"} ({meteorologia?.wind?.speed_kts ?? 7} KT)
              </span>
            </div>

            {/* Módulo 2: QNH */}
            <div className="bg-[#10121a] p-1.5 sm:p-2 rounded-xl border border-white/10 flex flex-col items-center justify-center text-center shadow-md">
              <span className="text-[8px] sm:text-[9px] uppercase tracking-wider text-neutral-400 font-bold mb-0.5">{t.meteo_pressao}</span>
              <div className="flex items-center gap-0.5">
                <LedText text={`${meteorologia?.aviation?.qnh ?? meteorologia?.main?.pressure ?? 1016}`} size="sm" />
                <span className="text-[8px] text-neutral-400 font-bold font-mono">HPA</span>
              </div>
              <span className="text-[8px] sm:text-[9px] text-emerald-400 font-mono font-bold">{t.meteo_sub_altimetro}</span>
            </div>

            {/* Módulo 3: Humidade */}
            <div className="bg-[#10121a] p-1.5 sm:p-2 rounded-xl border border-white/10 flex flex-col items-center justify-center text-center shadow-md">
              <span className="text-[8px] sm:text-[9px] uppercase tracking-wider text-neutral-400 font-bold mb-0.5">{t.meteo_humidade}</span>
              <div className="flex items-center gap-0.5">
                <LedText text={`${meteorologia?.main?.humidity ?? 70}`} size="sm" />
                <span className="text-[8px] text-neutral-400 font-bold font-mono">%</span>
              </div>
              <span className="text-[8px] sm:text-[9px] text-sky-400 font-mono font-bold">{t.meteo_sub_humidade}</span>
            </div>

            {/* Módulo 4: Nascer do Sol */}
            <div className="bg-[#10121a] p-1.5 sm:p-2 rounded-xl border border-white/10 flex flex-col items-center justify-center text-center shadow-md">
              <span className="text-[8px] sm:text-[9px] uppercase tracking-wider text-neutral-400 font-bold mb-0.5">{t.meteo_nascer_sol}</span>
              <div className="flex items-center gap-1 text-[10px] sm:text-xs font-mono font-black text-white">
                <span className="text-amber-400">☀️</span>
                {meteorologia?.environment?.sunrise || "07:15"}
              </div>
              <span className="text-[8px] sm:text-[9px] text-neutral-400 font-mono">{t.meteo_sub_aurora}</span>
            </div>

            {/* Módulo 5: Pôr do Sol */}
            <div className="bg-[#10121a] p-1.5 sm:p-2 rounded-xl border border-white/10 flex flex-col items-center justify-center text-center shadow-md">
              <span className="text-[8px] sm:text-[9px] uppercase tracking-wider text-neutral-400 font-bold mb-0.5">{t.meteo_por_sol}</span>
              <div className="flex items-center gap-1 text-[10px] sm:text-xs font-mono font-black text-white">
                <span className="text-orange-400">🌙</span>
                {meteorologia?.environment?.sunset || "19:50"}
              </div>
              <span className="text-[8px] sm:text-[9px] text-neutral-400 font-mono">{t.meteo_sub_crepusculo}</span>
            </div>

            {/* Módulo 6: Índice UV */}
            <div className="bg-[#10121a] p-1.5 sm:p-2 rounded-xl border border-white/10 flex flex-col items-center justify-center text-center shadow-md">
              <span className="text-[8px] sm:text-[9px] uppercase tracking-wider text-neutral-400 font-bold mb-0.5">{t.meteo_uv}</span>
              <div className="flex items-center gap-0.5">
                <span className="text-[10px] sm:text-xs font-mono font-black text-amber-300">
                  UV {meteorologia?.environment?.uv_index ?? 3}
                </span>
              </div>
              <span className="text-[8px] sm:text-[9px] text-emerald-400 font-mono font-bold">{t.meteo_sub_uv}</span>
            </div>
          </div>

        </div>
      )}

      {/* ── MODAL DE OPÇÕES / DEFINIÇÕES (SOM, UNIDADES, LOCALIZAÇÃO) ── */}
      {modalOpcoesAberto && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 select-none"
          onClick={(e) => { e.stopPropagation(); setModalOpcoesAberto(false); }}
        >
          <div
            className="w-full max-w-lg bg-[#0c0e14] border border-white/20 rounded-2xl p-3 sm:p-5 shadow-2xl flex flex-col gap-2.5 sm:gap-3.5 font-mono text-white max-h-[92dvh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Cabeçalho */}
            <div className="flex items-center justify-between border-b border-white/10 pb-2 shrink-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-base sm:text-lg">⚙️</span>
                <h2 className="text-xs sm:text-sm font-black tracking-wider uppercase text-amber-400">
                  {t.opcoes_titulo}
                </h2>
                {/* Etiqueta com a versão atualizada */}
                <div
                  title={`Flight Panel v${INFO_VERSAO.versao} • ${INFO_VERSAO.buildId}`}
                  className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-400/50 text-cyan-300 text-[10px] sm:text-xs font-mono font-bold shadow-[0_0_12px_rgba(6,182,212,0.35)]"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  <span>v{INFO_VERSAO.versao}</span>
                </div>
              </div>
              <button
                onClick={() => setModalOpcoesAberto(false)}
                className="text-neutral-400 hover:text-white text-sm px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Opção 0: Idioma / Language (4 Idiomas: PT, EN, FR, ES) */}
            <div className="flex flex-col gap-1.5 shrink-0 bg-white/[0.02] border border-white/5 p-2 sm:p-2.5 rounded-xl">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-neutral-300 flex items-center gap-1.5">
                  <span>🌐</span>
                  <span>{t.opcoes_idioma_titulo}</span>
                </span>
                <span className="text-[10px] text-amber-400 font-mono font-bold flex items-center gap-1.5">
                  <IconeBandeira codigo={idioma} className="w-4 h-2.5" />
                  <span>{IDIOMAS_DISPONIVEIS.find(i => i.codigo === idioma)?.nomeNativo}</span>
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {IDIOMAS_DISPONIVEIS.map((item) => (
                  <button
                    key={item.codigo}
                    type="button"
                    onClick={() => alternarIdioma(item.codigo)}
                    className={`py-1.5 px-1 rounded-lg border text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 cursor-pointer ${
                      idioma === item.codigo
                        ? "bg-amber-400/25 border-amber-400 text-amber-300 shadow-sm"
                        : "bg-white/5 border-white/10 text-neutral-400 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <IconeBandeira codigo={item.codigo} className="w-5 h-3.5" />
                    <span className="text-[11px] font-mono">{item.rotulo}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Opção 1: Som e Controlo de Volume Independente */}
            <div className="flex flex-col gap-2 shrink-0 bg-white/[0.02] border border-white/5 p-2 sm:p-2.5 rounded-xl">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-neutral-300">{t.opcoes_audio_titulo}</span>
                <span className="text-[9px] text-neutral-400">{t.opcoes_audio_subtitulo}</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => alternarSom(true)}
                  className={`py-1.5 px-2.5 rounded-lg border text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${somAtivo ? "bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-sm" : "bg-white/5 border-white/10 text-neutral-400 hover:bg-white/10"}`}
                >
                  <span>🔊</span>
                  <span>{t.opcoes_audio_ativado}</span>
                </button>
                <button
                  type="button"
                  onClick={() => alternarSom(false)}
                  className={`py-1.5 px-2.5 rounded-lg border text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${!somAtivo ? "bg-rose-500/20 border-rose-400 text-rose-300 shadow-sm" : "bg-white/5 border-white/10 text-neutral-400 hover:bg-white/10"}`}
                >
                  <span>🔇</span>
                  <span>{t.opcoes_audio_desativado}</span>
                </button>
              </div>

              {/* Controlo Deslizante de Volume (Independente do Som do Sistema) */}
              <div className="flex flex-col gap-1.5 pt-1 border-t border-white/5">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-neutral-400 font-mono flex items-center gap-1">
                    <span>{volumeSom === 0 || !somAtivo ? "🔇" : volumeSom < 50 ? "🔉" : "🔊"}</span>
                    <span>{t.opcoes_volume_titulo}</span>
                  </span>
                  <span className={`font-mono font-bold ${!somAtivo || volumeSom === 0 ? "text-neutral-500" : "text-amber-400"}`}>
                    {!somAtivo ? t.opcoes_volume_silenciado : `${volumeSom}%`}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={somAtivo ? volumeSom : 0}
                    disabled={!somAtivo}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      alternarVolume(val);
                    }}
                    onPointerUp={() => {
                      if (somAtivo && volumeSom > 0) {
                        tocarSomFlapClack(volumeSom / 100);
                      }
                    }}
                    className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-400 disabled:opacity-40 disabled:cursor-not-allowed"
                  />
                </div>

                {/* Predefinições Rápidas de Volume */}
                <div className="grid grid-cols-4 gap-1 pt-0.5">
                  {[25, 50, 75, 100].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      disabled={!somAtivo}
                      onClick={() => {
                        alternarVolume(preset);
                        tocarSomFlapClack(preset / 100);
                      }}
                      className={`py-0.5 text-[9px] font-mono rounded border transition-colors cursor-pointer ${
                        somAtivo && volumeSom === preset
                          ? "bg-amber-400/20 border-amber-400 text-amber-300 font-bold"
                          : "bg-white/5 border-white/10 text-neutral-400 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
                      }`}
                    >
                      {preset}%
                    </button>
                  ))}
                </div>

                {/* Botão de Teste do Som de Novo Voo (Cabine / Chime) */}
                <div className="pt-1.5 border-t border-white/5">
                  <button
                    type="button"
                    disabled={!somAtivo}
                    onClick={() => {
                      desbloquearAudioGlobal();
                      tocarSomNovoVoo(volumeSom / 100);
                      setTriggerFlapsNovoVoo(Date.now());
                    }}
                    className="w-full py-1.5 px-2 bg-amber-400/15 hover:bg-amber-400/25 active:scale-[0.99] border border-amber-400/50 rounded-lg text-amber-300 font-mono text-[10px] font-bold tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
                  >
                    <span>🔔</span>
                    <span>{t.opcoes_testar_som_novo_voo}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Opção: Luminosidade do Ecrã (Manual & Automático em Novo Voo) */}
            <div className="flex flex-col gap-2 shrink-0 bg-white/[0.02] border border-white/5 p-2 sm:p-2.5 rounded-xl">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-neutral-300 flex items-center gap-1.5">
                  <span>☀️</span>
                  <span>{t.opcoes_luminosidade_titulo}</span>
                </span>
                <span className={`text-[9px] font-mono font-bold ${brilhoBoostAtivo ? "text-amber-300 animate-pulse" : "text-amber-400"}`}>
                  {brilhoBoostAtivo ? "100% (BOOST 5s)" : `${luminosidadeManual}%`}
                </span>
              </div>

              {/* Slider Manual de Luminosidade */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-[10px] text-neutral-400">
                  <span>{t.opcoes_luminosidade_manual}</span>
                  <span className="font-mono">{luminosidadeManual}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-neutral-500">🌙</span>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    step="5"
                    value={luminosidadeManual}
                    onChange={(e) => alternarLuminosidadeManual(Number(e.target.value))}
                    className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                  />
                  <span className="text-xs text-amber-300">☀️</span>
                </div>

                {/* Predefinições Rápidas de Luminosidade */}
                <div className="grid grid-cols-4 gap-1 pt-0.5">
                  {[25, 50, 75, 100].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => alternarLuminosidadeManual(preset)}
                      className={`py-0.5 text-[9px] font-mono rounded border transition-colors cursor-pointer ${
                        luminosidadeManual === preset
                          ? "bg-amber-400/20 border-amber-400 text-amber-300 font-bold"
                          : "bg-white/5 border-white/10 text-neutral-400 hover:bg-white/10"
                      }`}
                    >
                      {preset}%
                    </button>
                  ))}
                </div>
              </div>

              {/* Alternador do Modo Automático (Aumento em Novo Voo) */}
              <div className="pt-2 border-t border-white/5 flex flex-col gap-1.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-neutral-300 flex items-center gap-1">
                      <span>💡</span>
                      <span>{t.opcoes_luminosidade_auto}</span>
                    </span>
                    <span className="text-[8px] sm:text-[9px] text-neutral-400 leading-tight">
                      {t.opcoes_luminosidade_auto_desc}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => alternarLuminosidadeAuto(!luminosidadeAuto)}
                    className={`py-1 px-2.5 rounded-lg border text-[10px] font-bold font-mono transition-all shrink-0 cursor-pointer ${
                      luminosidadeAuto
                        ? "bg-emerald-500/25 border-emerald-400 text-emerald-300 shadow-sm"
                        : "bg-white/5 border-white/10 text-neutral-400 hover:bg-white/10"
                    }`}
                  >
                    {luminosidadeAuto ? "ATIVADO" : "DESATIVADO"}
                  </button>
                </div>

                {/* Botão de Teste do Efeito (5 segundos) */}
                <button
                  type="button"
                  onClick={() => {
                    dispararBoostLuminosidade();
                    setTriggerFlapsNovoVoo(Date.now());
                  }}
                  className="w-full py-1 px-2 bg-white/5 hover:bg-white/10 active:scale-[0.99] border border-white/10 rounded-lg text-neutral-300 font-mono text-[9px] font-bold tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <span>✨</span>
                  <span>{t.opcoes_luminosidade_testar_btn}</span>
                </button>
              </div>
            </div>

            {/* Opção Nova: Modo Noturno / Sono (Silêncio total e ecrã ultra escuro) */}
            <div className="flex flex-col gap-2 shrink-0 bg-gradient-to-r from-indigo-950/30 via-[#0c0e18] to-indigo-950/20 border border-indigo-500/30 p-2.5 sm:p-3 rounded-xl shadow-inner">
              <div className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span className="text-base sm:text-lg">🌙</span>
                  <div className="flex flex-col">
                    <span className="font-bold text-indigo-300 uppercase tracking-wide">
                      {t.opcoes_noturno_titulo}
                    </span>
                    <span className="text-[9px] text-neutral-400">
                      {t.opcoes_noturno_subtitulo}
                    </span>
                  </div>
                </div>

                {/* Botão de Ativação Manual Imediata */}
                <button
                  type="button"
                  onClick={() => alternarModoNoturnoManual(!modoNoturnoManual)}
                  className={`py-1 px-2.5 rounded-lg border text-[10px] font-bold font-mono transition-all shrink-0 cursor-pointer ${
                    modoNoturnoManual
                      ? "bg-indigo-500/35 border-indigo-400 text-indigo-200 shadow-md ring-1 ring-indigo-400/40"
                      : "bg-white/5 border-white/10 text-neutral-400 hover:bg-white/10"
                  }`}
                >
                  {modoNoturnoManual ? t.opcoes_noturno_ativado : t.opcoes_noturno_desativado}
                </button>
              </div>

              {/* Ativação Automática por Horário de Sono */}
              <div className="pt-2 border-t border-white/5 flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-neutral-300 flex items-center gap-1">
                      <span>⏰</span>
                      <span>{t.opcoes_noturno_auto}</span>
                    </span>
                    <span className="text-[8px] sm:text-[9px] text-neutral-400 leading-tight">
                      {t.opcoes_noturno_auto_desc}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => alternarModoNoturnoAuto(!modoNoturnoAuto)}
                    className={`py-1 px-2.5 rounded-lg border text-[10px] font-bold font-mono transition-all shrink-0 cursor-pointer ${
                      modoNoturnoAuto
                        ? "bg-indigo-500/30 border-indigo-400 text-indigo-200 shadow-sm"
                        : "bg-white/5 border-white/10 text-neutral-400 hover:bg-white/10"
                    }`}
                  >
                    {modoNoturnoAuto ? t.opcoes_noturno_ativado : t.opcoes_noturno_desativado}
                  </button>
                </div>

                {/* Configuração do Horário de Início e Fim */}
                {modoNoturnoAuto && (
                  <div className="grid grid-cols-2 gap-2 bg-black/50 p-2 rounded-lg border border-indigo-500/20">
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] text-neutral-400 uppercase font-mono font-bold">
                        {t.opcoes_noturno_inicio}:
                      </label>
                      <input
                        type="time"
                        value={modoNoturnoInicio}
                        onChange={(e) => alterarHorarioNoturno(e.target.value, modoNoturnoFim)}
                        className="bg-white/5 border border-white/15 rounded px-2 py-1 text-xs font-mono text-white focus:outline-none focus:border-indigo-400 cursor-pointer"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] text-neutral-400 uppercase font-mono font-bold">
                        {t.opcoes_noturno_fim}:
                      </label>
                      <input
                        type="time"
                        value={modoNoturnoFim}
                        onChange={(e) => alterarHorarioNoturno(modoNoturnoInicio, e.target.value)}
                        className="bg-white/5 border border-white/15 rounded px-2 py-1 text-xs font-mono text-white focus:outline-none focus:border-indigo-400 cursor-pointer"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Opções 2 e 3: Unidades lado a lado (Altitude e Velocidade) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 shrink-0">
              {/* Opção 2: Unidade de Altitude */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-neutral-300">{t.opcoes_altitude_titulo}</span>
                  <span className="text-[9px] text-neutral-400">{t.opcoes_altitude_subtitulo}</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => alternarAltitude("FT")}
                    className={`py-1.5 px-2 rounded-lg border text-[11px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${unidadeAltitude === "FT" ? "bg-sky-500/20 border-sky-400 text-sky-300 shadow-sm" : "bg-white/5 border-white/10 text-neutral-400 hover:bg-white/10"}`}
                  >
                    <span>{t.opcoes_unidade_pes}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => alternarAltitude("MT")}
                    className={`py-1.5 px-2 rounded-lg border text-[11px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${unidadeAltitude === "MT" ? "bg-sky-500/20 border-sky-400 text-sky-300 shadow-sm" : "bg-white/5 border-white/10 text-neutral-400 hover:bg-white/10"}`}
                  >
                    <span>{t.opcoes_unidade_metros}</span>
                  </button>
                </div>
              </div>

              {/* Opção 3: Unidade de Velocidade */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-neutral-300">{t.opcoes_velocidade_titulo}</span>
                  <span className="text-[9px] text-neutral-400">{t.opcoes_velocidade_subtitulo}</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => alternarVelocidade("KTS")}
                    className={`py-1.5 px-2 rounded-lg border text-[11px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${unidadeVelocidade === "KTS" ? "bg-sky-500/20 border-sky-400 text-sky-300 shadow-sm" : "bg-white/5 border-white/10 text-neutral-400 hover:bg-white/10"}`}
                  >
                    <span>{t.opcoes_unidade_nos}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => alternarVelocidade("KMH")}
                    className={`py-1.5 px-2 rounded-lg border text-[11px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${unidadeVelocidade === "KMH" ? "bg-sky-500/20 border-sky-400 text-sky-300 shadow-sm" : "bg-white/5 border-white/10 text-neutral-400 hover:bg-white/10"}`}
                  >
                    <span>{t.opcoes_unidade_kmh}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => alternarVelocidade("MPH")}
                    className={`py-1.5 px-2 rounded-lg border text-[11px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${unidadeVelocidade === "MPH" ? "bg-sky-500/20 border-sky-400 text-sky-300 shadow-sm" : "bg-white/5 border-white/10 text-neutral-400 hover:bg-white/10"}`}
                  >
                    <span>{t.opcoes_unidade_mph}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Opções: Unidades de Distância e Temperatura */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 shrink-0">
              {/* Unidade de Distância */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-neutral-300">{t.opcoes_distancia_titulo}</span>
                  <span className="text-[9px] text-neutral-400">{t.opcoes_distancia_subtitulo}</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => alternarDistancia("KM")}
                    className={`py-1.5 px-1 rounded-lg border text-[11px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${unidadeDistancia === "KM" ? "bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-sm" : "bg-white/5 border-white/10 text-neutral-400 hover:bg-white/10"}`}
                  >
                    <span>{t.opcoes_unidade_km}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => alternarDistancia("NM")}
                    className={`py-1.5 px-1 rounded-lg border text-[11px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${unidadeDistancia === "NM" ? "bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-sm" : "bg-white/5 border-white/10 text-neutral-400 hover:bg-white/10"}`}
                  >
                    <span>{t.opcoes_unidade_nm}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => alternarDistancia("MI")}
                    className={`py-1.5 px-1 rounded-lg border text-[11px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${unidadeDistancia === "MI" ? "bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-sm" : "bg-white/5 border-white/10 text-neutral-400 hover:bg-white/10"}`}
                  >
                    <span>{t.opcoes_unidade_mi}</span>
                  </button>
                </div>
              </div>

              {/* Unidade de Temperatura */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-neutral-300">{t.opcoes_temperatura_titulo}</span>
                  <span className="text-[9px] text-neutral-400">{t.opcoes_temperatura_subtitulo}</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => alternarTemperatura("C")}
                    className={`py-1.5 px-2 rounded-lg border text-[11px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${unidadeTemperatura === "C" ? "bg-amber-500/20 border-amber-400 text-amber-300 shadow-sm" : "bg-white/5 border-white/10 text-neutral-400 hover:bg-white/10"}`}
                  >
                    <span>{t.opcoes_unidade_celsius}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => alternarTemperatura("F")}
                    className={`py-1.5 px-2 rounded-lg border text-[11px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${unidadeTemperatura === "F" ? "bg-amber-500/20 border-amber-400 text-amber-300 shadow-sm" : "bg-white/5 border-white/10 text-neutral-400 hover:bg-white/10"}`}
                  >
                    <span>{t.opcoes_unidade_fahrenheit}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Opção 4: Raio de Ação do Radar (Exato) */}
            <div className="border-t border-white/10 pt-2 flex flex-col gap-1.5 shrink-0 bg-white/[0.02] border border-white/5 p-2 sm:p-2.5 rounded-xl">
              <div className="flex items-center justify-between text-[11px]">
                <div>
                  <span className="font-bold text-neutral-300 flex items-center gap-1.5">
                    <span>🎯</span>
                    <span>{t.opcoes_raio_titulo}</span>
                  </span>
                  <span className="text-[9px] text-neutral-400 block">{t.opcoes_raio_subtitulo}</span>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-amber-400 text-xs sm:text-sm">
                    {raioKm} KM
                  </span>
                  <span className="text-[9px] text-neutral-400 block font-mono">
                    ≈ {(raioKm * 0.539957).toFixed(1)} NM
                  </span>
                </div>
              </div>

              {/* Botões Rápidos */}
              <div className="grid grid-cols-5 gap-1">
                {[5, 10, 20, 30, 50].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => alternarRaio(r)}
                    className={`py-1 rounded-lg border text-[10px] font-mono font-bold transition-all cursor-pointer ${
                      raioKm === r
                        ? "bg-amber-400/25 border-amber-400 text-amber-300 shadow-sm"
                        : "bg-white/5 border-white/10 text-neutral-400 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {r} KM
                  </button>
                ))}
              </div>

              {/* Slider + Campo Numérico Exato */}
              <div className="flex items-center gap-2 pt-0.5">
                <button
                  type="button"
                  onClick={() => alternarRaio(raioKm - 1)}
                  disabled={raioKm <= 1}
                  className="w-6 h-6 bg-white/5 hover:bg-white/15 disabled:opacity-30 rounded text-white font-bold flex items-center justify-center border border-white/10 text-xs cursor-pointer"
                >
                  −
                </button>
                <input
                  type="range"
                  min="1"
                  max="150"
                  step="1"
                  value={raioKm}
                  onChange={(e) => alternarRaio(Number(e.target.value))}
                  className="flex-1 accent-amber-400 cursor-pointer h-1.5 bg-neutral-800 rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => alternarRaio(raioKm + 1)}
                  disabled={raioKm >= 250}
                  className="w-6 h-6 bg-white/5 hover:bg-white/15 disabled:opacity-30 rounded text-white font-bold flex items-center justify-center border border-white/10 text-xs cursor-pointer"
                >
                  +
                </button>
                <div className="flex items-center gap-1 shrink-0">
                  <input
                    type="number"
                    min="1"
                    max="250"
                    step="1"
                    value={raioInput}
                    onChange={(e) => {
                      setRaioInput(e.target.value);
                      const v = parseInt(e.target.value, 10);
                      if (!isNaN(v) && v >= 1 && v <= 250) {
                        alternarRaio(v);
                      }
                    }}
                    className="w-12 bg-[#141720] border border-white/20 rounded px-1.5 py-0.5 text-center font-mono text-[11px] text-white focus:border-amber-400 outline-none"
                  />
                  <span className="text-[10px] text-neutral-400 font-mono">KM</span>
                </div>
              </div>
            </div>

            {/* Opção: Localização do Radar (Teste e Refresh Direto) */}
            <div className="border-t border-white/10 pt-2 flex flex-col gap-1.5 shrink-0 bg-white/[0.02] border border-white/5 p-2 sm:p-2.5 rounded-xl">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-neutral-300 flex items-center gap-1.5">
                  <span>📍</span>
                  <span>{t.opcoes_localizacao_titulo}</span>
                </span>
                <span className="text-[10px] text-emerald-400 font-mono font-bold">
                  📍 {localizacao.nome}
                </span>
              </div>

              {/* Detalhes de Coordenadas e Precisão */}
              <div className="flex items-center justify-between text-[9px] font-mono text-neutral-400 px-0.5">
                <span>
                  {localizacao.lat.toFixed(4)}°N, {localizacao.lon.toFixed(4)}°W
                  {precisaoMetros ? ` (±${precisaoMetros}m)` : ""}
                </span>
                <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${statusGps === "ativo" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-sky-500/20 text-sky-400 border border-sky-500/30"}`}>
                  {localizacao.origem.toUpperCase()}
                </span>
              </div>

              {/* Botões Diretos de Teste de Posição Geográfica e Refresh */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    obterGpsDoDispositivo(true, false);
                    tocarSomFlapClack(0.2);
                  }}
                  disabled={statusGps === "iniciando"}
                  className="py-1.5 px-2 bg-emerald-500/15 hover:bg-emerald-500/25 active:scale-[0.99] border border-emerald-500/50 rounded-lg text-emerald-300 font-mono text-[10px] font-bold tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 shadow-sm"
                >
                  <span className={statusGps === "iniciando" ? "animate-spin" : ""}>📡</span>
                  <span>{statusGps === "iniciando" ? t.opcoes_localizacao_a_obter : t.opcoes_localizacao_gps_btn}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    obterLocalizacaoPorIp(false);
                    tocarSomFlapClack(0.2);
                  }}
                  className="py-1.5 px-2 bg-sky-500/15 hover:bg-sky-500/25 active:scale-[0.99] border border-sky-500/50 rounded-lg text-sky-300 font-mono text-[10px] font-bold tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
                >
                  <span>🌐</span>
                  <span>{t.opcoes_localizacao_ip_btn}</span>
                </button>
              </div>

              {detalheErroGps && (
                <p className="text-[9px] text-amber-300/90 font-mono bg-amber-950/30 p-1.5 rounded border border-amber-500/20 leading-tight">
                  {detalheErroGps}
                </p>
              )}
            </div>

            {/* Opção 5: Navegação entre os 3 Ecrãs */}
            <div className="border-t border-white/10 pt-2 flex flex-col gap-1.5 shrink-0">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-neutral-300">{t.opcoes_navegacao_titulo}</span>
                <span className="text-[9px] text-sky-400 font-mono">
                  {ecraAtivo === "principal" ? "Ecrã 1" : ecraAtivo === "restantes" ? "Ecrã 2" : "Ecrã 3"}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setModalOpcoesAberto(false);
                    irParaPrincipal();
                  }}
                  className={`w-full py-1.5 px-2 rounded-lg border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${ecraAtivo === "principal" ? "bg-amber-400/25 border-amber-400 text-amber-300 shadow-sm" : "bg-white/5 border-white/10 text-neutral-300 hover:bg-white/10"}`}
                >
                  <span>✈️</span>
                  <span>{t.opcoes_ecra_principal}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setModalOpcoesAberto(false);
                    irParaRestantes();
                  }}
                  className={`w-full py-1.5 px-2 rounded-lg border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${ecraAtivo === "restantes" ? "bg-amber-400/25 border-amber-400 text-amber-300 shadow-sm" : "bg-white/5 border-white/10 text-neutral-300 hover:bg-white/10"}`}
                  title="Ver restantes voos em LEDs"
                >
                  <span>🛫</span>
                  <span>{t.opcoes_ecra_restantes} ({Math.max(0, listaVoos.length - 1)})</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setModalOpcoesAberto(false);
                    irParaMeteo();
                  }}
                  className={`w-full py-1.5 px-2 rounded-lg border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${ecraAtivo === "meteo" ? "bg-sky-500/25 border-sky-400 text-sky-300 shadow-sm" : "bg-white/5 border-white/10 text-neutral-300 hover:bg-white/10"}`}
                >
                  <span>⛅</span>
                  <span>{t.opcoes_ecra_meteo}</span>
                </button>
              </div>

              {listaVoos.length > 0 && (
                <Link
                  href="/voos"
                  onClick={() => setModalOpcoesAberto(false)}
                  className="w-full py-1.5 px-2.5 rounded-lg border border-sky-400/30 bg-sky-500/10 hover:bg-sky-500/20 text-xs font-bold text-sky-300 transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-0.5"
                >
                  <span>📋</span>
                  <span>{t.opcoes_ver_tabela} ({listaVoos.length})</span>
                </Link>
              )}
            </div>

            {/* Assistente de Instalação e Calibração Inicial */}
            <div className="border-t border-white/10 pt-2 flex flex-col gap-1 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setModalOpcoesAberto(false);
                  setOnboardingPasso("instalacao");
                }}
                className="w-full py-1.5 px-3 rounded-lg border border-amber-400/40 bg-amber-400/10 hover:bg-amber-400/20 text-xs font-bold text-amber-300 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <span>📲</span>
                <span>REABRIR ASSISTENTE DE INSTALAÇÃO & GPS</span>
              </button>
            </div>

            {/* Rodapé com Versão Atualizada e Botão Fechar */}
            <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-2 text-[10px] text-neutral-400 font-mono">
                <span className="text-neutral-500 font-semibold">Flight Panel</span>
                <span className="px-1.5 py-0.5 rounded bg-neutral-900 border border-cyan-500/30 text-cyan-300 font-bold">
                  v{INFO_VERSAO.versao}
                </span>
                <span className="hidden sm:inline text-neutral-600 text-[9px]">• {INFO_VERSAO.dataLancamento}</span>
              </div>
              <button
                type="button"
                onClick={() => setModalOpcoesAberto(false)}
                className="bg-amber-400 hover:bg-amber-300 active:scale-95 text-black font-black text-xs px-5 py-1.5 rounded-lg transition-all cursor-pointer shadow-md"
              >
                {t.opcoes_guardar_fechar}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ── MODAL ANALÓGICO DE CONFIGURAÇÃO DE LOCALIZAÇÃO DO RADAR ──── */}
      {
        modalLocalizacaoAberto && (
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
                      Define o centro do raio circular de {raioKm} km
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
                    {localizacao.lat.toFixed(4)}°N, {localizacao.lon.toFixed(4)}°W • Raio {raioKm} KM
                  </span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${statusGps === "ativo" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-neutral-700/50 text-neutral-300"}`}>
                  {localizacao.origem.toUpperCase()}
                </span>
              </div>

              {/* Raio de Ação do Radar (Exato) */}
              <div className="bg-[#151922] p-3 rounded-xl border border-white/10 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[9px] uppercase tracking-widest text-amber-400 font-bold block">
                      🎯 {t.opcoes_raio_titulo}
                    </span>
                    <span className="text-[9px] text-neutral-400">
                      {t.opcoes_raio_subtitulo}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black font-mono text-amber-400">
                      {raioKm} KM
                    </span>
                    <span className="text-[9px] text-neutral-400 block font-mono">
                      ≈ {(raioKm * 0.539957).toFixed(1)} NM
                    </span>
                  </div>
                </div>

                {/* Predefinições Rápidas */}
                <div className="grid grid-cols-5 gap-1.5">
                  {[5, 10, 20, 30, 50].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => alternarRaio(r)}
                      className={`py-1 rounded-lg border text-[10px] font-mono font-bold transition-all cursor-pointer ${
                        raioKm === r
                          ? "bg-amber-400/25 border-amber-400 text-amber-300 shadow-sm"
                          : "bg-white/5 border-white/10 text-neutral-400 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      {r} KM
                    </button>
                  ))}
                </div>

                {/* Slider + Campo Numérico Exato */}
                <div className="flex items-center gap-2 pt-0.5">
                  <button
                    type="button"
                    onClick={() => alternarRaio(raioKm - 1)}
                    disabled={raioKm <= 1}
                    className="w-7 h-7 bg-white/5 hover:bg-white/15 disabled:opacity-30 rounded-lg text-white font-bold flex items-center justify-center border border-white/10 cursor-pointer"
                  >
                    −
                  </button>
                  <input
                    type="range"
                    min="1"
                    max="150"
                    step="1"
                    value={raioKm}
                    onChange={(e) => alternarRaio(Number(e.target.value))}
                    className="flex-1 accent-amber-400 cursor-pointer h-1.5 bg-neutral-800 rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => alternarRaio(raioKm + 1)}
                    disabled={raioKm >= 250}
                    className="w-7 h-7 bg-white/5 hover:bg-white/15 disabled:opacity-30 rounded-lg text-white font-bold flex items-center justify-center border border-white/10 cursor-pointer"
                  >
                    +
                  </button>
                  <div className="flex items-center gap-1 shrink-0">
                    <input
                      type="number"
                      min="1"
                      max="250"
                      step="1"
                      value={raioInput}
                      onChange={(e) => {
                        setRaioInput(e.target.value);
                        const v = parseInt(e.target.value, 10);
                        if (!isNaN(v) && v >= 1 && v <= 250) {
                          alternarRaio(v);
                        }
                      }}
                      className="w-14 bg-[#141720] border border-white/20 rounded-lg px-2 py-1 text-center font-mono text-xs text-white focus:border-amber-400 outline-none"
                    />
                    <span className="text-[10px] text-neutral-400 font-mono">KM</span>
                  </div>
                </div>
              </div>

              {/* Botões de Localização (GPS e IP) */}
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => obterGpsDoDispositivo(true)}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer border border-emerald-400/30"
                >
                  <span>📡</span>
                  <span>OBTER COORDENADAS POR GPS (TELEMÓVEL / PC)</span>
                </button>

                <button
                  type="button"
                  onClick={() => obterLocalizacaoPorIp(false)}
                  className="w-full bg-sky-700/80 hover:bg-sky-600 active:scale-[0.99] text-white py-2 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer border border-sky-400/30"
                >
                  <span>🌐</span>
                  <span>OBTER LOCALIZAÇÃO POR IP (IDEAL PARA PC)</span>
                </button>

                {detalheErroGps && (
                  <p className="text-[10px] sm:text-xs text-amber-300 bg-amber-950/40 p-2 rounded border border-amber-500/30 leading-relaxed">
                    {detalheErroGps}
                  </p>
                )}
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
                    {t.loc_guardar}
                  </button>
                </div>
              </div>

              {/* Rodapé do Modal */}
              <div className="flex justify-end pt-2 border-t border-white/10">
                <button
                  onClick={() => setModalLocalizacaoAberto(false)}
                  className="bg-white/10 hover:bg-white/20 px-4 py-1.5 rounded-lg text-xs font-bold text-neutral-300 hover:text-white transition-all cursor-pointer"
                >
                  {t.opcoes_guardar_fechar}
                </button>
              </div>
            </div>
          </div>
        )
      }

      {/* ── MODAIS DE ONBOARDING NA PRIMEIRA ABERTURA (PASSO 1: INSTALAÇÃO -> PASSO 2: GPS) ──── */}
      {onboardingPasso === "instalacao" && (
        <div
          className="fixed inset-0 z-[60] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="w-full max-w-md bg-[#0c0e14] border border-amber-400/40 rounded-2xl p-4 sm:p-5 shadow-2xl flex flex-col gap-3.5 text-white font-mono max-h-[92dvh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Cabeçalho com Badge */}
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="text-xl">📲</span>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.5 rounded font-black tracking-widest uppercase">
                      {t.onboarding_passo_1_badge}
                    </span>
                    <span className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider">
                      {t.onboarding_instalacao_pwa_badge}
                    </span>
                  </div>
                  <h2 className="text-sm sm:text-base font-black tracking-wider text-amber-400 uppercase mt-0.5">
                    {t.onboarding_instalar_titulo}
                  </h2>
                </div>
              </div>
            </div>

            {/* Texto Descritivo */}
            <p className="text-xs text-neutral-300 leading-relaxed">
              {t.onboarding_instalar_subtitulo}
            </p>

            {/* Vantagens em Grelha Compacta */}
            <div className="grid grid-cols-3 gap-2 bg-[#141720] p-2.5 rounded-xl border border-white/10 text-center">
              <div className="flex flex-col items-center gap-1">
                <span className="text-base">⚡</span>
                <span className="text-[9px] font-bold text-neutral-200 uppercase leading-tight">
                  {t.onboarding_card_ecra_inteiro}
                </span>
                <span className="text-[8px] text-neutral-400 leading-tight">{t.onboarding_card_sem_barras}</span>
              </div>
              <div className="flex flex-col items-center gap-1 border-x border-white/10 px-1">
                <span className="text-base">🔊</span>
                <span className="text-[9px] font-bold text-neutral-200 uppercase leading-tight">
                  {t.onboarding_card_audio}
                </span>
                <span className="text-[8px] text-neutral-400 leading-tight">{t.onboarding_card_jingle}</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="text-base">📡</span>
                <span className="text-[9px] font-bold text-neutral-200 uppercase leading-tight">
                  {t.onboarding_card_radar}
                </span>
                <span className="text-[8px] text-neutral-400 leading-tight">{t.onboarding_card_tempo_real}</span>
              </div>
            </div>

            {/* Dica para iOS se não houver prompt nativo */}
            {!promptInstalacao && (
              <p className="text-[10px] text-amber-300/80 bg-amber-950/30 p-2 rounded-lg border border-amber-500/20 leading-relaxed text-center">
                ℹ️ {t.onboarding_instalar_dica_ios}
              </p>
            )}

            {/* Botões de Ação */}
            <div className="flex flex-col gap-2 pt-1 border-t border-white/10">
              <button
                type="button"
                onClick={() => {
                  if (promptInstalacao) {
                    promptInstalacao.prompt();
                    promptInstalacao.userChoice.finally(() => {
                      setPromptInstalacao(null);
                      tocarSomFlapClack();
                      setOnboardingPasso("gps");
                    });
                  } else {
                    tocarSomFlapClack();
                    setOnboardingPasso("gps");
                  }
                }}
                className="w-full bg-amber-400 hover:bg-amber-300 active:scale-[0.99] text-black font-black text-xs sm:text-sm py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer border border-amber-300/50"
              >
                <span>{promptInstalacao ? t.onboarding_instalar_btn : `${t.opcoes_guardar_fechar.toUpperCase()} / ${t.onboarding_seguinte} ➔`}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  tocarSomFlapClack();
                  setOnboardingPasso("gps");
                }}
                className="w-full bg-white/10 hover:bg-white/15 active:scale-[0.99] text-neutral-300 hover:text-white font-bold text-[11px] sm:text-xs py-2 px-3 rounded-xl transition-all cursor-pointer text-center"
              >
                {t.onboarding_instalar_mais_tarde}
              </button>
            </div>
          </div>
        </div>
      )}

      {onboardingPasso === "gps" && (
        <div
          className="fixed inset-0 z-[60] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="w-full max-w-md bg-[#0c0e14] border border-emerald-500/40 rounded-2xl p-4 sm:p-5 shadow-2xl flex flex-col gap-3.5 text-white font-mono max-h-[92dvh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Cabeçalho com Badge */}
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="text-xl">📡</span>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-1.5 py-0.5 rounded font-black tracking-widest uppercase">
                      {t.onboarding_passo_2_badge}
                    </span>
                    <span className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider">
                      {t.onboarding_coordenadas_badge}
                    </span>
                  </div>
                  <h2 className="text-sm sm:text-base font-black tracking-wider text-emerald-400 uppercase mt-0.5">
                    {t.onboarding_gps_titulo}
                  </h2>
                </div>
              </div>
            </div>

            {/* Texto Descritivo */}
            <p className="text-xs text-neutral-300 leading-relaxed">
              {t.onboarding_gps_subtitulo}
            </p>

            {/* Cartão de Estado do GPS */}
            <div className="bg-[#141720] p-3 rounded-xl border border-white/10 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[9px] uppercase tracking-widest text-neutral-400 font-bold">
                  {t.onboarding_estado_sinal}
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                  statusGps === "ativo"
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : statusGps === "iniciando"
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse"
                    : "bg-neutral-800 text-neutral-400"
                }`}>
                  {statusGps === "ativo" ? t.onboarding_status_conectado : statusGps === "iniciando" ? t.onboarding_status_sintonizando : t.onboarding_status_aguardando}
                </span>
              </div>

              {statusGps === "ativo" ? (
                <div className="bg-emerald-950/30 border border-emerald-500/30 p-2.5 rounded-lg flex flex-col gap-1">
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <span>✅</span>
                    <span>{t.onboarding_gps_sucesso}</span>
                  </span>
                  <span className="text-xs text-white font-mono font-bold">
                    📍 {localizacao.nome} {precisaoMetros ? `(±${precisaoMetros}m)` : ""}
                  </span>
                  <span className="text-[10px] text-neutral-400 font-mono">
                    {localizacao.lat.toFixed(4)}°N, {localizacao.lon.toFixed(4)}°W • {t.onboarding_raio_rotulo} {raioKm} KM
                  </span>
                </div>
              ) : statusGps === "iniciando" ? (
                <div className="bg-amber-950/30 border border-amber-500/30 p-2.5 rounded-lg flex items-center gap-2">
                  <span className="animate-spin text-sm">⏳</span>
                  <span className="text-xs text-amber-300 font-bold">{t.onboarding_gps_a_obter}</span>
                </div>
              ) : detalheErroGps ? (
                <div className="bg-red-950/30 border border-red-500/30 p-2 rounded-lg text-[10px] text-red-300 leading-relaxed">
                  ⚠️ {detalheErroGps}
                </div>
              ) : (
                <div className="text-[11px] text-neutral-400">
                  {t.onboarding_instrucao_gps}
                </div>
              )}
            </div>

            {/* Botões de Ação */}
            <div className="flex flex-col gap-2 pt-1 border-t border-white/10">
              {statusGps === "ativo" ? (
                <button
                  type="button"
                  onClick={() => {
                    try {
                      localStorage.setItem("flight_panel_onboarding_v1", "concluido");
                    } catch { }
                    tocarSomFlapClack();
                    setOnboardingPasso("nenhum");
                  }}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 active:scale-[0.99] text-black font-black text-xs sm:text-sm py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer border border-emerald-300/50"
                >
                  <span>✈️</span>
                  <span>{t.onboarding_concluir}</span>
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      obterGpsDoDispositivo(true);
                    }}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white font-bold text-xs sm:text-sm py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer border border-emerald-400/30"
                  >
                    <span>📡</span>
                    <span>{t.onboarding_gps_btn}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      obterLocalizacaoPorIp(false);
                    }}
                    className="w-full bg-sky-700/80 hover:bg-sky-600 active:scale-[0.99] text-white font-bold text-xs py-2 px-3 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer border border-sky-400/30"
                  >
                    <span>🌐</span>
                    <span>{t.onboarding_obter_ip_btn}</span>
                  </button>
                </>
              )}

              <button
                type="button"
                onClick={() => {
                  try {
                    localStorage.setItem("flight_panel_onboarding_v1", "concluido");
                  } catch { }
                  tocarSomFlapClack();
                  setOnboardingPasso("nenhum");
                }}
                className="w-full bg-white/10 hover:bg-white/15 active:scale-[0.99] text-neutral-300 hover:text-white font-bold text-[11px] sm:text-xs py-2 px-3 rounded-xl transition-all cursor-pointer text-center"
              >
                {statusGps === "ativo" ? t.onboarding_concluir_btn : t.onboarding_gps_padrao_btn}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Camada Dinâmica de Luminosidade / Dimmer de Ecrã (Transição Suave de 700ms) */}
      <div
        className="fixed inset-0 pointer-events-none z-[9990] transition-opacity duration-700 ease-out"
        style={{
          backgroundColor: "#000000",
          opacity: opacidadeDimmer,
        }}
        aria-hidden="true"
      />

      {/* Dica discreta durante o Modo Noturno ativo */}
      {emModoNoturnoEscuro && (
        <div className="fixed bottom-2 left-1/2 -translate-x-1/2 z-[9995] pointer-events-none text-[8px] sm:text-[9px] font-mono text-white/40 tracking-widest uppercase flex items-center gap-1.5 select-none bg-black/60 px-3 py-1 rounded-full border border-white/5 backdrop-blur-sm">
          <span>🌙</span>
          <span>{t.opcoes_noturno_toque_acordar}</span>
        </div>
      )}
    </main>
  );
}
