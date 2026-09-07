"use client";

import { useEffect, useState, useCallback } from "react";
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

const INTERVALO_MS = 25_000;

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

// ─── Dicionário de Companhias Aéreas ──────────────────────────────────────────

const COMPANHIAS: Record<string, InfoCompanhia> = {
  TAP: { nome: "TAP AIR PORTUGAL", iata: "TP", origem: "PORTO", destino: "LISBOA", origemCode: "OPO", destinoCode: "LIS", aeronave: "A320-251N" },
  AEA: { nome: "AIR EUROPA", iata: "UX", origem: "MADRID", destino: "PORTO", origemCode: "MAD", destinoCode: "OPO", aeronave: "B737-800" },
  IBE: { nome: "IBERIA", iata: "IB", origem: "MADRID", destino: "PORTO", origemCode: "MAD", destinoCode: "OPO", aeronave: "A320-200" },
  IBS: { nome: "IBERIA EXPRESS", iata: "I2", origem: "MADRID", destino: "PORTO", origemCode: "MAD", destinoCode: "OPO", aeronave: "A320-200" },
  VLG: { nome: "VUELING", iata: "VY", origem: "BARCELONA", destino: "PORTO", origemCode: "BCN", destinoCode: "OPO", aeronave: "A320-232" },
  VOE: { nome: "VOLOTEA", iata: "V7", origem: "NANTES", destino: "PORTO", origemCode: "NTE", destinoCode: "OPO", aeronave: "A319-100" },
  OBS: { nome: "ORBEST", iata: "6O", origem: "LISBOA", destino: "PORTO", origemCode: "LIS", destinoCode: "OPO", aeronave: "A330-900" },
  RYR: { nome: "RYANAIR", iata: "FR", origem: "PORTO", destino: "MADRID", origemCode: "OPO", destinoCode: "MAD", aeronave: "B737-800" },
  RUK: { nome: "RYANAIR UK", iata: "RK", origem: "LONDRES", destino: "PORTO", origemCode: "STN", destinoCode: "OPO", aeronave: "B737-800" },
  EJU: { nome: "EASYJET EUROPE", iata: "U2", origem: "PORTO", destino: "PARIS", origemCode: "OPO", destinoCode: "CDG", aeronave: "A320-214" },
  EZY: { nome: "EASYJET UK", iata: "U2", origem: "LONDRES", destino: "PORTO", origemCode: "LGW", destinoCode: "OPO", aeronave: "A320-214" },
  EZS: { nome: "EASYJET SWISS", iata: "DS", origem: "ZURIQUE", destino: "PORTO", origemCode: "ZRH", destinoCode: "OPO", aeronave: "A320-214" },
  WZZ: { nome: "WIZZ AIR", iata: "W6", origem: "BUDAPESTE", destino: "PORTO", origemCode: "BUD", destinoCode: "OPO", aeronave: "A321NEO" },
  WUK: { nome: "WIZZ AIR UK", iata: "W9", origem: "LONDRES", destino: "PORTO", origemCode: "LTN", destinoCode: "OPO", aeronave: "A321NEO" },
  TVF: { nome: "TRANSAVIA FRANCE", iata: "TO", origem: "PARIS", destino: "PORTO", origemCode: "ORY", destinoCode: "OPO", aeronave: "B737-800" },
  TRA: { nome: "TRANSAVIA", iata: "HV", origem: "AMSTERDAO", destino: "PORTO", origemCode: "AMS", destinoCode: "OPO", aeronave: "B737-800" },
  EXS: { nome: "JET2.COM", iata: "LS", origem: "MANCHESTER", destino: "PORTO", origemCode: "MAN", destinoCode: "OPO", aeronave: "B737-800" },
  NOZ: { nome: "NORWEGIAN", iata: "DY", origem: "OSLO", destino: "PORTO", origemCode: "OSL", destinoCode: "OPO", aeronave: "B737 MAX 8" },
  AFR: { nome: "AIR FRANCE", iata: "AF", origem: "PARIS", destino: "PORTO", origemCode: "CDG", destinoCode: "OPO", aeronave: "A320-200" },
  DLH: { nome: "LUFTHANSA", iata: "LH", origem: "FRANKFURT", destino: "PORTO", origemCode: "FRA", destinoCode: "OPO", aeronave: "A321-271NX" },
  KLM: { nome: "KLM ROYAL DUTCH", iata: "KL", origem: "AMSTERDAO", destino: "PORTO", origemCode: "AMS", destinoCode: "OPO", aeronave: "B737-800" },
  BAW: { nome: "BRITISH AIRWAYS", iata: "BA", origem: "LONDRES", destino: "PORTO", origemCode: "LHR", destinoCode: "OPO", aeronave: "A320-232" },
  SWR: { nome: "SWISS AIR LINES", iata: "LX", origem: "ZURIQUE", destino: "PORTO", origemCode: "ZRH", destinoCode: "OPO", aeronave: "A220-300" },
  AUA: { nome: "AUSTRIAN AIRLINES", iata: "OS", origem: "VIENA", destino: "PORTO", origemCode: "VIE", destinoCode: "OPO", aeronave: "A320-200" },
  BEL: { nome: "BRUSSELS AIRLINES", iata: "SN", origem: "BRUXELAS", destino: "PORTO", origemCode: "BRU", destinoCode: "OPO", aeronave: "A319-100" },
  LGL: { nome: "LUXAIR", iata: "LG", origem: "LUXEMBURGO", destino: "PORTO", origemCode: "LUX", destinoCode: "OPO", aeronave: "DASH 8-400" },
  FIN: { nome: "FINNAIR", iata: "AY", origem: "HELSINQUIA", destino: "PORTO", origemCode: "HEL", destinoCode: "OPO", aeronave: "A321-200" },
  SAS: { nome: "SCANDINAVIAN AIRLINES", iata: "SK", origem: "ESTOCOLMO", destino: "PORTO", origemCode: "ARN", destinoCode: "OPO", aeronave: "A320NEO" },
  LOT: { nome: "LOT POLISH", iata: "LO", origem: "VARSOVIA", destino: "PORTO", origemCode: "WAW", destinoCode: "OPO", aeronave: "B737-800" },
  THY: { nome: "TURKISH AIRLINES", iata: "TK", origem: "ISTAMBUL", destino: "PORTO", origemCode: "IST", destinoCode: "OPO", aeronave: "A321NEO" },
  AEE: { nome: "AEGEAN AIRLINES", iata: "A3", origem: "ATENAS", destino: "PORTO", origemCode: "ATH", destinoCode: "OPO", aeronave: "A320NEO" },
  UAE: { nome: "EMIRATES", iata: "EK", origem: "DUBAI", destino: "PORTO", origemCode: "DXB", destinoCode: "OPO", aeronave: "B777-300ER" },
  QTR: { nome: "QATAR AIRWAYS", iata: "QR", origem: "DOHA", destino: "LISBOA", origemCode: "DOH", destinoCode: "LIS", aeronave: "B787-9" },
  AZA: { nome: "ITA AIRWAYS", iata: "AZ", origem: "ROMA", destino: "PORTO", origemCode: "FCO", destinoCode: "OPO", aeronave: "A320NEO" },
  ITY: { nome: "ITA AIRWAYS", iata: "AZ", origem: "ROMA", destino: "PORTO", origemCode: "FCO", destinoCode: "OPO", aeronave: "A320NEO" },
};

function resolverVooInfo(voo: EstadoVoo) {
  const cs = (voo[1] || "").trim().toUpperCase();
  const prefixo3 = cs.slice(0, 3);
  const prefixo2 = cs.slice(0, 2);
  
  let info = COMPANHIAS[prefixo3];
  let iata = info?.iata || null;
  if (!iata) {
    if (prefixo2 === "TP") iata = "TP";
    else if (prefixo2 === "FR") iata = "FR";
    else if (prefixo2 === "U2") iata = "U2";
    else if (prefixo2 === "UX") iata = "UX";
    else if (prefixo2 === "IB") iata = "IB";
    else if (prefixo2 === "VY") iata = "VY";
    else if (prefixo2 === "LH") iata = "LH";
    else if (prefixo2 === "AF") iata = "AF";
    else if (prefixo2 === "BA") iata = "BA";
    else if (prefixo2 === "KL") iata = "KL";
    else if (prefixo2 === "TO") iata = "TO";
    else if (prefixo2 === "HV") iata = "HV";
    else if (prefixo2 === "W6") iata = "W6";
  }

  let numeroVoo = cs || voo[0].toUpperCase();
  if (info && cs.length > 3) {
    numeroVoo = `${info.iata}${cs.slice(3).trim()}`;
  }

  const paisUpper = (voo[2] || "").toUpperCase();
  const dadosPais = CIDADES_PAISES[paisUpper];

  let origem = info?.origem || dadosPais?.cidade || "MADRID";
  let destino = info?.destino || "PORTO";
  let origemCode = info?.origemCode || dadosPais?.code || "MAD";
  let destinoCode = info?.destinoCode || "OPO";

  const vRate = voo[11];
  if (vRate != null) {
    if (vRate < -0.5) {
      destino = "PORTO";
      destinoCode = "OPO";
    } else if (vRate > 0.5) {
      origem = "PORTO";
      origemCode = "OPO";
      if (dadosPais && dadosPais.cidade !== "PORTO") {
        destino = dadosPais.cidade;
        destinoCode = dadosPais.code;
      }
    }
  }

  const altitudeMetros = voo[7] != null ? Math.round(voo[7]) : 0;
  const altitudePes = Math.round(altitudeMetros * 3.28084);
  const velocidadeKts = voo[9] != null ? Math.round(voo[9] * 1.94384) : 0;
  const rumo = voo[10] != null ? Math.round(voo[10]) : 0;

  return {
    callsign: cs,
    numeroVoo,
    nomeCompanhia: info?.nome || (voo[2] ? `COMPANHIA (${voo[2]})` : "AVIAÇÃO COMERCIAL"),
    aeronave: info?.aeronave || "A320",
    iata,
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

// ─── Componente de Palheta com Escala Universal Auto-Fit (min(vw, vh)) ─────────

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

  // Dimensionamento proporcional a min(vw, vh) para CABER 100% NO ECRÃ EM FULLSCREEN SEM SCROLL
  const dimensões = {
    sm: "w-[clamp(0.65rem,min(2vw,4.2vh),1.3rem)] h-[clamp(0.95rem,min(3vw,5.8vh),1.8rem)] text-[clamp(0.65rem,min(1.8vw,3.6vh),1.1rem)] font-black rounded-[2px]",
    md: "w-[clamp(0.8rem,min(2.6vw,5.2vh),1.6rem)] h-[clamp(1.15rem,min(3.8vw,7.2vh),2.3rem)] text-[clamp(0.75rem,min(2.4vw,4.5vh),1.3rem)] font-black rounded-[3px]",
    lg: "w-[clamp(0.95rem,min(3.4vw,6.5vh),2.1rem)] h-[clamp(1.4rem,min(4.8vw,9vh),2.9rem)] text-[clamp(0.9rem,min(3vw,5.5vh),1.7rem)] font-black rounded-[4px]",
    xl: "w-[clamp(1.1rem,min(4.2vw,8vh),2.6rem)] h-[clamp(1.6rem,min(5.8vw,11vh),3.6rem)] text-[clamp(1rem,min(3.6vw,7vh),2.1rem)] font-black rounded-[5px]",
    hero: "w-[clamp(1.3rem,min(5vw,9.5vh),3.2rem)] h-[clamp(1.8rem,min(6.8vw,13vh),4.3rem)] text-[clamp(1.2rem,min(4.4vw,8.5vh),2.6rem)] font-black rounded-[5px]",
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

// ─── Componente de Palavra (Sem Quebra de Linha) ──────────────────────────────

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

// ─── Componente Principal Painel Analógico 100% Fullscreen Mobile Fit ─────────

export default function PainelAnalogicoMobileFullscreen() {
  const [vooAtual, setVooAtual] = useState<EstadoVoo | null>(null);
  const [meteorologia, setMeteorologia] = useState<DadosMeteo | null>(null);
  const [carregando, setCarregando] = useState(true);

  // Fullscreen com 1 toque no ecrã
  const manipularToqueEcra = () => {
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

  const carregarMeteorologia = async () => {
    try {
      const resMeteo = await fetch("/api/meteorologia");
      const dadosMeteo = await resMeteo.json();
      if (!dadosMeteo.erro) {
        setMeteorologia(dadosMeteo);
      }
    } catch {
      // Ignorar erros
    }
  };

  const buscarDados = useCallback(async () => {
    try {
      const resVoos = await fetch("/api/voos");
      const dadosVoos = await resVoos.json();

      if (dadosVoos.estados && dadosVoos.estados.length > 0) {
        const voosEmAr = dadosVoos.estados.filter((v: EstadoVoo) => !v[8]);
        
        if (voosEmAr.length > 0) {
          setVooAtual(voosEmAr[0]);
          setMeteorologia(null);
        } else {
          setVooAtual(null);
          await carregarMeteorologia();
        }
      } else {
        setVooAtual(null);
        await carregarMeteorologia();
      }
    } catch {
      setVooAtual(null);
      await carregarMeteorologia();
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    buscarDados();
    const int = setInterval(buscarDados, INTERVALO_MS);
    return () => clearInterval(int);
  }, [buscarDados]);

  const infoVoo = vooAtual ? resolverVooInfo(vooAtual) : null;

  return (
    <main
      onClick={manipularToqueEcra}
      className="h-[100dvh] w-[100dvw] max-h-[100dvh] max-w-[100dvw] bg-[#050608] text-white flex flex-col items-center justify-center p-1.5 sm:p-4 select-none font-mono cursor-pointer relative overflow-hidden board-texture"
    >
      {/* ── QUADRO METÁLICO TOTALMENTE INTEGRADO (ZERO SCROLL EM FULLSCREEN) ── */}
      <div className="w-full max-w-5xl h-full max-h-full bg-[#0a0b0e] border-2 sm:border-6 md:border-[10px] border-[#14161f] rounded-xl sm:rounded-3xl p-2 sm:p-5 md:p-6 shadow-[0_20px_60px_rgba(0,0,0,0.98),inset_0_2px_8px_rgba(255,255,255,0.06)] relative z-10 flex flex-col justify-between overflow-hidden">
        
        {/* ── ESTADO A CARREGAR ───────────────────────────────────────────── */}
        {carregando && (
          <div className="h-full flex flex-col items-center justify-center gap-3 text-center">
            <FlapWord text="A CARREGAR" size="lg" />
          </div>
        )}

        {/* ── MODO 1: VOO ACTIVO NO RADAR ─────────────────────────────────── */}
        {!carregando && vooAtual && infoVoo && (
          <div className="h-full flex flex-col justify-between gap-1.5 sm:gap-3">
            
            {/* LINHA 1: VOO & LOGÓTIPO & COMPANHIA */}
            <div className="w-full bg-[#10121a] p-2 sm:p-3.5 rounded-lg sm:rounded-xl border border-white/10 flex flex-row items-center justify-between gap-2 shadow-lg">
              
              {/* Voo e Logótipo Oficial */}
              <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                <div className="w-9 h-9 sm:w-14 sm:h-14 bg-white p-1 rounded-md sm:rounded-lg border border-neutral-700 shadow-md flex items-center justify-center shrink-0">
                  {infoVoo.iata ? (
                    <Image
                      src={`https://pics.avs.io/200/200/${infoVoo.iata}.png`}
                      alt={infoVoo.nomeCompanhia}
                      width={48}
                      height={48}
                      className="object-contain max-h-full"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full bg-black rounded flex items-center justify-center text-white font-black text-xs sm:text-base">
                      ✈
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-start gap-0.5">
                  <span className="text-[8px] sm:text-[10px] uppercase tracking-widest text-neutral-400 font-bold">
                    VOO
                  </span>
                  <FlapWord text={infoVoo.numeroVoo} size="xl" />
                </div>
              </div>

              {/* Aeronave e Nome da Companhia */}
              <div className="flex flex-col items-end gap-0.5 text-right">
                <span className="text-[8px] sm:text-[10px] uppercase tracking-widest text-neutral-400 font-bold">
                  AERONAVE
                </span>
                <FlapWord text={infoVoo.aeronave} size="md" />
                <span className="text-[9px] sm:text-xs font-bold text-neutral-300 tracking-wider truncate max-w-[130px] sm:max-w-none">
                  {infoVoo.nomeCompanhia}
                </span>
              </div>

            </div>

            {/* LINHA 2: ROTA COMPLETA (CÓDIGO IATA + CIDADE / AEROPORTO) ────── */}
            <div className="w-full bg-[#10121a] p-2 sm:p-4 rounded-lg sm:rounded-xl border border-white/10 flex flex-row items-center justify-between gap-1 sm:gap-3 shadow-lg">
              
              {/* ORIGEM (CÓDIGO + CIDADE / AEROPORTO) */}
              <div className="flex flex-col items-start gap-0.5">
                <span className="text-[8px] sm:text-[10px] uppercase tracking-widest text-neutral-400 font-bold">
                  ORIGEM
                </span>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <FlapWord text={infoVoo.origemCode} size="hero" />
                  <FlapWord text={infoVoo.origem} size="md" />
                </div>
              </div>

              {/* ÍCONE CENTRAL DE VOO */}
              <div className="flex flex-col items-center justify-center px-1 shrink-0">
                <span className="text-[7px] sm:text-[9px] uppercase tracking-widest text-neutral-300 font-bold">
                  {infoVoo.noSolo ? "NO SOLO" : "EM VOO"}
                </span>
                <div className="flex items-center gap-1">
                  <span className="text-white text-base sm:text-2xl">✈</span>
                  <div className="hidden sm:block w-6 sm:w-12 h-0.5 bg-white/40" />
                </div>
              </div>

              {/* DESTINO (CÓDIGO + CIDADE / AEROPORTO) */}
              <div className="flex flex-col items-end gap-0.5 text-right">
                <span className="text-[8px] sm:text-[10px] uppercase tracking-widest text-neutral-400 font-bold">
                  DESTINO
                </span>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <FlapWord text={infoVoo.destino} size="md" />
                  <FlapWord text={infoVoo.destinoCode} size="hero" />
                </div>
              </div>

            </div>

            {/* LINHA 3: TELEMETRIA EM 3 COLUNAS ───────────────────────────── */}
            <div className="w-full grid grid-cols-3 gap-1.5 sm:gap-3">
              
              {/* ALTITUDE */}
              <div className="bg-[#10121a] p-1.5 sm:p-3 rounded-lg sm:rounded-xl border border-white/10 flex flex-col items-center justify-center text-center shadow-md">
                <span className="text-[7px] sm:text-[10px] uppercase tracking-wider text-neutral-400 font-bold mb-0.5">
                  ALTITUDE
                </span>
                <div className="flex items-center gap-0.5 sm:gap-1">
                  <FlapWord text={`${infoVoo.altitudePes}`} size="md" />
                  <span className="text-[8px] sm:text-[10px] text-neutral-400 font-bold">FT</span>
                </div>
              </div>

              {/* VELOCIDADE */}
              <div className="bg-[#10121a] p-1.5 sm:p-3 rounded-lg sm:rounded-xl border border-white/10 flex flex-col items-center justify-center text-center shadow-md">
                <span className="text-[7px] sm:text-[10px] uppercase tracking-wider text-neutral-400 font-bold mb-0.5">
                  VELOCIDADE
                </span>
                <div className="flex items-center gap-0.5 sm:gap-1">
                  <FlapWord text={`${infoVoo.velocidadeKts}`} size="md" />
                  <span className="text-[8px] sm:text-[10px] text-neutral-400 font-bold">KTS</span>
                </div>
              </div>

              {/* RUMO */}
              <div className="bg-[#10121a] p-1.5 sm:p-3 rounded-lg sm:rounded-xl border border-white/10 flex flex-col items-center justify-center text-center shadow-md">
                <span className="text-[7px] sm:text-[10px] uppercase tracking-wider text-neutral-400 font-bold mb-0.5">
                  RUMO
                </span>
                <div className="flex items-center gap-0.5 sm:gap-1">
                  <FlapWord text={`${infoVoo.rumo}`} size="md" />
                  <span className="text-[8px] sm:text-[10px] text-neutral-400 font-bold">°</span>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ── MODO 2: SEM VOOS -> MODO METEOROLOGIA AUTOMÁTICO ────────────── */}
        {!carregando && !vooAtual && (
          <div className="h-full flex flex-col justify-between gap-1.5 sm:gap-3">
            
            {/* Cabeçalho Meteorológico */}
            <div className="w-full bg-[#10121a] p-2 sm:p-3.5 rounded-lg sm:rounded-xl border border-white/10 flex flex-row items-center justify-between gap-2 shadow-lg">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-9 h-9 sm:w-14 sm:h-14 bg-white p-1 rounded-md sm:rounded-lg border border-neutral-700 shadow-md flex items-center justify-center text-base sm:text-2xl shrink-0">
                  🌤️
                </div>
                <div className="flex flex-col items-start gap-0.5">
                  <span className="text-[8px] sm:text-[10px] uppercase tracking-widest text-neutral-400 font-bold">
                    STATUS RADAR
                  </span>
                  <FlapWord text="ESPACO LIVRE" size="xl" />
                </div>
              </div>

              <div className="flex flex-col items-end gap-0.5 text-right">
                <span className="text-[8px] sm:text-[10px] uppercase tracking-widest text-neutral-400 font-bold">
                  LOCALIDADE
                </span>
                <FlapWord text={meteorologia?.name || "PORTO"} size="md" />
              </div>
            </div>

            {/* Linha Principal Meteorológica */}
            <div className="w-full bg-[#10121a] p-2 sm:p-4 rounded-lg sm:rounded-xl border border-white/10 flex flex-row items-center justify-between gap-2 shadow-lg">
              <div className="flex flex-col items-start gap-0.5">
                <span className="text-[8px] sm:text-[10px] uppercase tracking-widest text-neutral-400 font-bold">
                  CONDIÇÃO DO TEMPO
                </span>
                <FlapWord text={meteorologia?.weather?.[0]?.description || "CEU LIMPO"} size="hero" />
              </div>

              <div className="flex flex-col items-end gap-0.5 text-right">
                <span className="text-[8px] sm:text-[10px] uppercase tracking-widest text-neutral-400 font-bold">
                  TEMPERATURA
                </span>
                <div className="flex items-center gap-1">
                  <FlapWord text={`${Math.round(meteorologia?.main?.temp ?? 18)}`} size="hero" />
                  <span className="text-base sm:text-2xl font-black text-white">°C</span>
                </div>
              </div>
            </div>

            {/* Telemetria Meteorológica */}
            <div className="w-full grid grid-cols-3 gap-1.5 sm:gap-3">
              <div className="bg-[#10121a] p-1.5 sm:p-3 rounded-lg sm:rounded-xl border border-white/10 flex flex-col items-center justify-center text-center shadow-md">
                <span className="text-[7px] sm:text-[10px] uppercase tracking-wider text-neutral-400 font-bold mb-0.5">
                  VENTO
                </span>
                <div className="flex items-center gap-0.5 sm:gap-1">
                  <FlapWord text={`${Math.round((meteorologia?.wind?.speed ?? 3.5) * 3.6)}`} size="md" />
                  <span className="text-[8px] sm:text-[10px] text-neutral-400 font-bold">KM/H</span>
                </div>
              </div>

              <div className="bg-[#10121a] p-1.5 sm:p-3 rounded-lg sm:rounded-xl border border-white/10 flex flex-col items-center justify-center text-center shadow-md">
                <span className="text-[7px] sm:text-[10px] uppercase tracking-wider text-neutral-400 font-bold mb-0.5">
                  HUMIDADE
                </span>
                <div className="flex items-center gap-0.5 sm:gap-1">
                  <FlapWord text={`${meteorologia?.main?.humidity ?? 70}`} size="md" />
                  <span className="text-[8px] sm:text-[10px] text-neutral-400 font-bold">%</span>
                </div>
              </div>

              <div className="bg-[#10121a] p-1.5 sm:p-3 rounded-lg sm:rounded-xl border border-white/10 flex flex-col items-center justify-center text-center shadow-md">
                <span className="text-[7px] sm:text-[10px] uppercase tracking-wider text-neutral-400 font-bold mb-0.5">
                  SENSAÇÃO
                </span>
                <div className="flex items-center gap-0.5 sm:gap-1">
                  <FlapWord text={`${Math.round(meteorologia?.main?.feels_like ?? meteorologia?.main?.temp ?? 18)}`} size="md" />
                  <span className="text-[8px] sm:text-[10px] text-neutral-400 font-bold">°C</span>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>
    </main>
  );
}
