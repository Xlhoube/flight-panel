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

// ─── Dicionário Expandido de Companhias Aéreas ────────────────────────────────

const COMPANHIAS: Record<string, InfoCompanhia> = {
  // Portugal & Espanha
  TAP: { nome: "TAP AIR PORTUGAL", iata: "TP", origem: "PORTO", destino: "LISBOA", origemCode: "OPO", destinoCode: "LIS", aeronave: "A320-251N" },
  AEA: { nome: "AIR EUROPA", iata: "UX", origem: "MADRID", destino: "PORTO", origemCode: "MAD", destinoCode: "OPO", aeronave: "B737-800" },
  IBE: { nome: "IBERIA", iata: "IB", origem: "MADRID", destino: "PORTO", origemCode: "MAD", destinoCode: "OPO", aeronave: "A320-200" },
  IBS: { nome: "IBERIA EXPRESS", iata: "I2", origem: "MADRID", destino: "PORTO", origemCode: "MAD", destinoCode: "OPO", aeronave: "A320-200" },
  VLG: { nome: "VUELING", iata: "VY", origem: "BARCELONA", destino: "PORTO", origemCode: "BCN", destinoCode: "OPO", aeronave: "A320-232" },
  VOE: { nome: "VOLOTEA", iata: "V7", origem: "NANTES", destino: "PORTO", origemCode: "NTE", destinoCode: "OPO", aeronave: "A319-100" },
  OBS: { nome: "ORBEST", iata: "6O", origem: "LISBOA", destino: "PORTO", origemCode: "LIS", destinoCode: "OPO", aeronave: "A330-900" },

  // Low Cost Principais
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

  // Legadas Europeias
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
  LOT: { nome: "LOT POLISH", iata: "LO", origem: "VARSÓVIA", destino: "PORTO", origemCode: "WAW", destinoCode: "OPO", aeronave: "B737-800" },
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
  
  // 1. Procurar por código ICAO de 3 letras
  let info = COMPANHIAS[prefixo3];
  
  // 2. Se não encontrar, verificar se começa por código IATA de 2 letras
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
  let origem = info?.origem || paisUpper || "ESP";
  let destino = info?.destino || "PORTO";
  let origemCode = info?.origemCode || (paisUpper ? paisUpper.slice(0, 3) : "ORG");
  let destinoCode = info?.destinoCode || "OPO";

  const vRate = voo[11];
  if (vRate != null) {
    if (vRate < -0.5) {
      destino = "PORTO";
      destinoCode = "OPO";
    } else if (vRate > 0.5) {
      origem = "PORTO";
      origemCode = "OPO";
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

// ─── Sintetizador de Som Mecânico (Split-Flap Clack) ──────────────────────────

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

// ─── Componente de Palheta Mecânica Solari 100% Branco e Responsivo ───────────

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
    sm: "w-[clamp(0.75rem,2.2vw,1.4rem)] h-[clamp(1.1rem,3.2vw,2rem)] text-[clamp(0.7rem,1.8vw,1.1rem)] font-black rounded-[2px]",
    md: "w-[clamp(0.9rem,3vw,1.8rem)] h-[clamp(1.3rem,4.2vw,2.5rem)] text-[clamp(0.8rem,2.5vw,1.4rem)] font-black rounded-[3px]",
    lg: "w-[clamp(1.1rem,3.8vw,2.4rem)] h-[clamp(1.6rem,5.2vw,3.3rem)] text-[clamp(0.95rem,3.2vw,1.9rem)] font-black rounded-[4px]",
    xl: "w-[clamp(1.3rem,4.6vw,2.9rem)] h-[clamp(1.8rem,6.2vw,4rem)] text-[clamp(1.1rem,3.8vw,2.3rem)] font-black rounded-[5px]",
    hero: "w-[clamp(1.5rem,5.5vw,3.6rem)] h-[clamp(2.1rem,7.4vw,4.8rem)] text-[clamp(1.3rem,4.5vw,3rem)] font-black rounded-[5px]",
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

// ─── Componente de Palavra Contínua em Branco ─────────────────────────────────

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

// ─── Componente Principal Painel Analógico ────────────────────────────────────

export default function PainelAnalogicoPrincipal() {
  const [vooAtual, setVooAtual] = useState<EstadoVoo | null>(null);
  const [meteorologia, setMeteorologia] = useState<DadosMeteo | null>(null);
  const [carregando, setCarregando] = useState(true);

  // Fullscreen + Áudio ao toque
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

      // Verificar se existem voos ACTIVOS EM AR (não no solo)
      if (dadosVoos.estados && dadosVoos.estados.length > 0) {
        const voosEmAr = dadosVoos.estados.filter((v: EstadoVoo) => !v[8]);
        
        if (voosEmAr.length > 0) {
          setVooAtual(voosEmAr[0]);
          setMeteorologia(null);
        } else {
          // Sem voos no ar -> passar directamente para modo meteorologia
          setVooAtual(null);
          await carregarMeteorologia();
        }
      } else {
        // Sem tráfego aéreo -> modo meteorologia
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
      className="min-h-screen w-full bg-[#050608] text-white flex flex-col items-center justify-center p-2 xs:p-3 sm:p-6 select-none font-mono cursor-pointer relative overflow-x-hidden board-texture"
    >
      {/* ── QUADRO METÁLICO ANALÓGICO 100% BRANCO RESPONSIVO ───────────────── */}
      <div className="w-full max-w-5xl bg-[#0a0b0e] border-4 sm:border-8 md:border-[14px] border-[#14161f] rounded-2xl sm:rounded-[2.5rem] p-3 sm:p-6 md:p-8 shadow-[0_30px_90px_rgba(0,0,0,0.98),inset_0_2px_10px_rgba(255,255,255,0.06)] relative z-10 flex flex-col gap-3 sm:gap-6">
        
        {/* ── ESTADO A CARREGAR ───────────────────────────────────────────── */}
        {carregando && (
          <div className="py-16 sm:py-24 flex flex-col items-center justify-center gap-3 text-center">
            <FlapWord text="A CARREGAR" size="lg" />
          </div>
        )}

        {/* ── MODO 1: VOO ACTIVO DETECTADO NO RADAR ────────────────────────── */}
        {!carregando && vooAtual && infoVoo && (
          <div className="w-full flex flex-col gap-3 sm:gap-6">
            
            {/* LINHA 1: VOO & LOGÓTIPO & COMPANHIA */}
            <div className="w-full bg-[#10121a] p-3 sm:p-5 rounded-xl sm:rounded-2xl border border-white/10 flex flex-row items-center justify-between gap-2 sm:gap-4 shadow-xl">
              
              {/* Voo e Logótipo Oficial ou Emblema Garantido */}
              <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                <div className="w-10 h-10 sm:w-16 sm:h-16 bg-white p-1 rounded-lg sm:rounded-xl border border-neutral-700 shadow-md flex items-center justify-center shrink-0">
                  {infoVoo.iata ? (
                    <Image
                      src={`https://pics.avs.io/200/200/${infoVoo.iata}.png`}
                      alt={infoVoo.nomeCompanhia}
                      width={56}
                      height={56}
                      className="object-contain max-h-full"
                      unoptimized
                    />
                  ) : (
                    // Emblema de cauda de aviação de reserva em alto contraste
                    <div className="w-full h-full bg-black rounded-md flex items-center justify-center text-white font-black text-sm sm:text-xl">
                      ✈
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-start gap-0.5 sm:gap-1">
                  <span className="text-[9px] sm:text-xs uppercase tracking-widest text-neutral-400 font-bold">
                    VOO / FLIGHT
                  </span>
                  <FlapWord text={infoVoo.numeroVoo} size="xl" />
                </div>
              </div>

              {/* Aeronave e Nome da Companhia */}
              <div className="flex flex-col items-end gap-0.5 sm:gap-1 text-right">
                <span className="text-[9px] sm:text-xs uppercase tracking-widest text-neutral-400 font-bold">
                  AIRCRAFT
                </span>
                <FlapWord text={infoVoo.aeronave} size="md" />
                <span className="text-[10px] sm:text-xs font-bold text-neutral-300 tracking-wider truncate max-w-[140px] sm:max-w-none">
                  {infoVoo.nomeCompanhia}
                </span>
              </div>

            </div>

            {/* LINHA 2: ROTA EM PALHETAS (ORIGEM ➔ DESTINO) */}
            <div className="w-full bg-[#10121a] p-3 sm:p-6 rounded-xl sm:rounded-2xl border border-white/10 flex flex-row items-center justify-between gap-1 sm:gap-4 shadow-xl">
              
              {/* DEPARTURE (ORIGEM) */}
              <div className="flex flex-col items-start gap-1">
                <span className="text-[9px] sm:text-xs uppercase tracking-widest text-neutral-400 font-bold">
                  ORIGEM
                </span>
                <div className="flex items-center gap-1 sm:gap-2">
                  <FlapWord text={infoVoo.origemCode} size="hero" />
                  <div className="hidden xs:block">
                    <FlapWord text={infoVoo.origem} size="sm" />
                  </div>
                </div>
              </div>

              {/* ÍCONE CENTRAL DE VOO */}
              <div className="flex flex-col items-center justify-center px-1 sm:px-3 shrink-0">
                <span className="text-[8px] sm:text-[10px] uppercase tracking-widest text-neutral-300 font-bold">
                  {infoVoo.noSolo ? "NO SOLO" : "EM VOO"}
                </span>
                <div className="flex items-center gap-1 sm:gap-2">
                  <span className="text-white text-lg sm:text-3xl">✈</span>
                  <div className="hidden sm:block w-8 sm:w-16 h-0.5 bg-white/40" />
                </div>
              </div>

              {/* DESTINATION (DESTINO) */}
              <div className="flex flex-col items-end gap-1 text-right">
                <span className="text-[9px] sm:text-xs uppercase tracking-widest text-neutral-400 font-bold">
                  DESTINO
                </span>
                <div className="flex items-center gap-1 sm:gap-2">
                  <div className="hidden xs:block">
                    <FlapWord text={infoVoo.destino} size="sm" />
                  </div>
                  <FlapWord text={infoVoo.destinoCode} size="hero" />
                </div>
              </div>

            </div>

            {/* LINHA 3: TELEMETRIA EM 3 COLUNAS BRANCAS */}
            <div className="w-full grid grid-cols-3 gap-2 sm:gap-4">
              
              {/* ALTITUDE */}
              <div className="bg-[#10121a] p-2 sm:p-4 rounded-xl sm:rounded-2xl border border-white/10 flex flex-col items-center justify-center text-center shadow-lg">
                <span className="text-[8px] sm:text-xs uppercase tracking-wider text-neutral-400 font-bold mb-1">
                  ALTITUDE
                </span>
                <div className="flex items-center gap-0.5 sm:gap-1">
                  <FlapWord text={`${infoVoo.altitudePes}`} size="md" />
                  <span className="text-[9px] sm:text-xs text-neutral-400 font-bold">FT</span>
                </div>
              </div>

              {/* VELOCIDADE */}
              <div className="bg-[#10121a] p-2 sm:p-4 rounded-xl sm:rounded-2xl border border-white/10 flex flex-col items-center justify-center text-center shadow-lg">
                <span className="text-[8px] sm:text-xs uppercase tracking-wider text-neutral-400 font-bold mb-1">
                  VELOCIDADE
                </span>
                <div className="flex items-center gap-0.5 sm:gap-1">
                  <FlapWord text={`${infoVoo.velocidadeKts}`} size="md" />
                  <span className="text-[9px] sm:text-xs text-neutral-400 font-bold">KTS</span>
                </div>
              </div>

              {/* RUMO */}
              <div className="bg-[#10121a] p-2 sm:p-4 rounded-xl sm:rounded-2xl border border-white/10 flex flex-col items-center justify-center text-center shadow-lg">
                <span className="text-[8px] sm:text-xs uppercase tracking-wider text-neutral-400 font-bold mb-1">
                  RUMO
                </span>
                <div className="flex items-center gap-0.5 sm:gap-1">
                  <FlapWord text={`${infoVoo.rumo}`} size="md" />
                  <span className="text-[9px] sm:text-xs text-neutral-400 font-bold">°</span>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ── MODO 2: SEM VOOS -> MODO METEOROLOGIA AUTOMÁTICO ────────────── */}
        {!carregando && !vooAtual && (
          <div className="w-full flex flex-col gap-3 sm:gap-6">
            
            {/* Cabeçalho Meteorológico Solari */}
            <div className="w-full bg-[#10121a] p-3 sm:p-5 rounded-xl sm:rounded-2xl border border-white/10 flex flex-row items-center justify-between gap-2 sm:gap-4 shadow-xl">
              <div className="flex items-center gap-2 sm:gap-4">
                <div className="w-10 h-10 sm:w-16 sm:h-16 bg-white p-1 rounded-lg sm:rounded-xl border border-neutral-700 shadow-md flex items-center justify-center text-xl sm:text-3xl shrink-0">
                  🌤️
                </div>
                <div className="flex flex-col items-start gap-0.5 sm:gap-1">
                  <span className="text-[9px] sm:text-xs uppercase tracking-widest text-neutral-400 font-bold">
                    STATUS RADAR
                  </span>
                  <FlapWord text="ESPACO LIVRE" size="xl" />
                </div>
              </div>

              <div className="flex flex-col items-end gap-0.5 sm:gap-1 text-right">
                <span className="text-[9px] sm:text-xs uppercase tracking-widest text-neutral-400 font-bold">
                  LOCALIDADE
                </span>
                <FlapWord text={meteorologia?.name || "PORTO"} size="md" />
              </div>
            </div>

            {/* Linha Principal de Meteorologia em Palhetas */}
            <div className="w-full bg-[#10121a] p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
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
            <div className="w-full grid grid-cols-3 gap-2 sm:gap-4">
              <div className="bg-[#10121a] p-2 sm:p-4 rounded-xl sm:rounded-2xl border border-white/10 flex flex-col items-center justify-center text-center shadow-lg">
                <span className="text-[8px] sm:text-xs uppercase tracking-wider text-neutral-400 font-bold mb-1">
                  VENTO
                </span>
                <div className="flex items-center gap-0.5 sm:gap-1">
                  <FlapWord text={`${Math.round((meteorologia?.wind?.speed ?? 3.5) * 3.6)}`} size="md" />
                  <span className="text-[9px] sm:text-xs text-neutral-400 font-bold">KM/H</span>
                </div>
              </div>

              <div className="bg-[#10121a] p-2 sm:p-4 rounded-xl sm:rounded-2xl border border-white/10 flex flex-col items-center justify-center text-center shadow-lg">
                <span className="text-[8px] sm:text-xs uppercase tracking-wider text-neutral-400 font-bold mb-1">
                  HUMIDADE
                </span>
                <div className="flex items-center gap-0.5 sm:gap-1">
                  <FlapWord text={`${meteorologia?.main?.humidity ?? 70}`} size="md" />
                  <span className="text-[9px] sm:text-xs text-neutral-400 font-bold">%</span>
                </div>
              </div>

              <div className="bg-[#10121a] p-2 sm:p-4 rounded-xl sm:rounded-2xl border border-white/10 flex flex-col items-center justify-center text-center shadow-lg">
                <span className="text-[8px] sm:text-xs uppercase tracking-wider text-neutral-400 font-bold mb-1">
                  SENSAÇÃO
                </span>
                <div className="flex items-center gap-0.5 sm:gap-1">
                  <FlapWord text={`${Math.round(meteorologia?.main?.feels_like ?? meteorologia?.main?.temp ?? 18)}`} size="md" />
                  <span className="text-[9px] sm:text-xs text-neutral-400 font-bold">°C</span>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>
    </main>
  );
}
