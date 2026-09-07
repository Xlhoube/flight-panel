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
  weather: Array<{ description: string }>;
  main: { temp: number; humidity: number };
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

// ─── Dicionário de Companhias Aéreas ──────────────────────────────────────────

const COMPANHIAS: Record<string, InfoCompanhia> = {
  TAP: { nome: "TAP AIR PORTUGAL", iata: "TP", origem: "PORTO", destino: "LISBOA", origemCode: "OPO", destinoCode: "LIS", aeronave: "A320-251N" },
  RYR: { nome: "RYANAIR", iata: "FR", origem: "PORTO", destino: "MADRID", origemCode: "OPO", destinoCode: "MAD", aeronave: "B737-800" },
  EJU: { nome: "EASYJET EUROPE", iata: "U2", origem: "PORTO", destino: "PARIS", origemCode: "OPO", destinoCode: "CDG", aeronave: "A320-214" },
  EZY: { nome: "EASYJET UK", iata: "U2", origem: "LONDRES", destino: "PORTO", origemCode: "LGW", destinoCode: "OPO", aeronave: "A320-214" },
  EZS: { nome: "EASYJET SWISS", iata: "U2", origem: "ZURIQUE", destino: "PORTO", origemCode: "ZRH", destinoCode: "OPO", aeronave: "A320-214" },
  TVF: { nome: "TRANSAVIA FRANCE", iata: "TO", origem: "PARIS", destino: "PORTO", origemCode: "ORY", destinoCode: "OPO", aeronave: "B737-800" },
  TRA: { nome: "TRANSAVIA", iata: "HV", origem: "AMSTERDAO", destino: "PORTO", origemCode: "AMS", destinoCode: "OPO", aeronave: "B737-800" },
  LGL: { nome: "LUXAIR", iata: "LG", origem: "LUXEMBURGO", destino: "PORTO", origemCode: "LUX", destinoCode: "OPO", aeronave: "DASH 8-400" },
  NOZ: { nome: "NORWEGIAN", iata: "DY", origem: "OSLO", destino: "PORTO", origemCode: "OSL", destinoCode: "OPO", aeronave: "B737 MAX 8" },
  DLH: { nome: "LUFTHANSA", iata: "LH", origem: "FRANKFURT", destino: "PORTO", origemCode: "FRA", destinoCode: "OPO", aeronave: "A321-271NX" },
  VLG: { nome: "VUELING", iata: "VY", origem: "BARCELONA", destino: "PORTO", origemCode: "BCN", destinoCode: "OPO", aeronave: "A320-232" },
  IBE: { nome: "IBERIA", iata: "IB", origem: "MADRID", destino: "PORTO", origemCode: "MAD", destinoCode: "OPO", aeronave: "A320-200" },
  SWR: { nome: "SWISS AIR LINES", iata: "LX", origem: "ZURIQUE", destino: "PORTO", origemCode: "ZRH", destinoCode: "OPO", aeronave: "A220-300" },
  KLM: { nome: "KLM ROYAL DUTCH", iata: "KL", origem: "AMSTERDAO", destino: "PORTO", origemCode: "AMS", destinoCode: "OPO", aeronave: "B737-800" },
  BAW: { nome: "BRITISH AIRWAYS", iata: "BA", origem: "LONDRES", destino: "PORTO", origemCode: "LHR", destinoCode: "OPO", aeronave: "A320-232" },
};

function resolverVooInfo(voo: EstadoVoo) {
  const cs = (voo[1] || "").trim().toUpperCase();
  const prefixo = cs.slice(0, 3);
  const info = COMPANHIAS[prefixo];

  let iata = info?.iata || null;
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
    nomeCompanhia: info?.nome || (voo[2] ? `COMPANHIA (${voo[2]})` : "COMPANHIA AEREA"),
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

// ─── Componente de Palheta Mecânica Solari Auto-Adaptável aos Ecrãs ───────────

interface FlapCellProps {
  char: string;
  variant?: "yellow" | "white" | "amber" | "green";
  size?: "sm" | "md" | "lg" | "xl" | "hero";
}

function FlapCell({ char, variant = "yellow", size = "lg" }: FlapCellProps) {
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

  // Dimensionamento fluido baseado em clamp() para caber perfeitamente em qualquer telemóvel
  const dimensões = {
    sm: "w-[clamp(0.75rem,2.2vw,1.4rem)] h-[clamp(1.1rem,3.2vw,2rem)] text-[clamp(0.7rem,1.8vw,1.1rem)] font-black rounded-[2px]",
    md: "w-[clamp(0.9rem,3vw,1.8rem)] h-[clamp(1.3rem,4.2vw,2.5rem)] text-[clamp(0.8rem,2.5vw,1.4rem)] font-black rounded-[3px]",
    lg: "w-[clamp(1.1rem,3.8vw,2.4rem)] h-[clamp(1.6rem,5.2vw,3.3rem)] text-[clamp(0.95rem,3.2vw,1.9rem)] font-black rounded-[4px]",
    xl: "w-[clamp(1.3rem,4.6vw,2.9rem)] h-[clamp(1.8rem,6.2vw,4rem)] text-[clamp(1.1rem,3.8vw,2.3rem)] font-black rounded-[5px]",
    hero: "w-[clamp(1.5rem,5.5vw,3.6rem)] h-[clamp(2.1rem,7.4vw,4.8rem)] text-[clamp(1.3rem,4.5vw,3rem)] font-black rounded-[5px]",
  }[size];

  const coresTexto = {
    yellow: "text-[#facc15] bg-[#111319] border-[#222634] shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]",
    white: "text-[#f8fafc] bg-[#111319] border-[#222634] shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]",
    amber: "text-[#fbbf24] bg-[#16130b] border-[#382b13]",
    green: "text-[#34d399] bg-[#0c1713] border-[#18392b]",
  }[variant];

  const charExibir = char === " " ? "\u00A0" : char.toUpperCase();

  return (
    <div className={`flap-cell shrink-0 ${dimensões} ${coresTexto} ${animating ? "animate-flap" : ""}`}>
      {/* Pinos mecânicos laterais */}
      <span className="flap-pin-left" />
      <span className="flap-pin-right" />

      {/* Linha de corte central */}
      <span className="flap-split-line" />

      {/* Letra ou Dígito */}
      <span className="leading-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] tracking-tighter select-none">
        {charExibir}
      </span>
    </div>
  );
}

// ─── Componente de Palavra (Linha Contínua Flexível) ──────────────────────────

interface FlapWordProps {
  text: string;
  variant?: "yellow" | "white" | "amber" | "green";
  size?: "sm" | "md" | "lg" | "xl" | "hero";
}

function FlapWord({ text, variant = "yellow", size = "lg" }: FlapWordProps) {
  const chars = (text || "").split("");

  return (
    <div className="flex items-center gap-[2px] sm:gap-1 flex-nowrap shrink-0 max-w-full">
      {chars.map((c, i) => (
        <FlapCell key={i} char={c} variant={variant} size={size} />
      ))}
    </div>
  );
}

// ─── Componente Principal Painel Analógico Responsivo para Telemóveis ─────────

export default function PainelAnalogicoMobileAdaptativo() {
  const [vooAtual, setVooAtual] = useState<EstadoVoo | null>(null);
  const [meteorologia, setMeteorologia] = useState<DadosMeteo | null>(null);
  const [carregando, setCarregando] = useState(true);

  const ativarAudio = () => {
    if (!globalAudioCtx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      globalAudioCtx = new AudioCtxClass();
    }
    if (globalAudioCtx.state === "suspended") {
      globalAudioCtx.resume();
    }
    tocarSomFlapClack();
  };

  const buscarDados = useCallback(async () => {
    try {
      const resVoos = await fetch("/api/voos");
      const dadosVoos = await resVoos.json();

      if (dadosVoos.estados && dadosVoos.estados.length > 0) {
        const voosEmAr = dadosVoos.estados.filter((v: EstadoVoo) => !v[8]);
        const voo = voosEmAr.length > 0 ? voosEmAr[0] : dadosVoos.estados[0];
        setVooAtual(voo);
        setMeteorologia(null);
      } else {
        setVooAtual(null);
        const resMeteo = await fetch("/api/meteorologia");
        const dadosMeteo = await resMeteo.json();
        if (!dadosMeteo.erro) {
          setMeteorologia(dadosMeteo);
        }
      }
    } catch {
      // Ignorar erros
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
      onClick={ativarAudio}
      className="min-h-screen w-full bg-[#060709] text-neutral-100 flex flex-col items-center justify-center p-2 xs:p-3 sm:p-6 select-none font-mono cursor-pointer relative overflow-x-hidden board-texture"
    >
      {/* Retroiluminação ambiente */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-[800px] h-[300px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* ── QUADRO METÁLICO ANALÓGICO TOTALMENTE RESPONSIVO (AUTO-FIT MOBILE) ─ */}
      <div className="w-full max-w-5xl bg-[#0b0c10] border-4 sm:border-8 md:border-[14px] border-[#14161f] rounded-2xl sm:rounded-[2.5rem] p-3 sm:p-6 md:p-8 shadow-[0_30px_90px_rgba(0,0,0,0.98),inset_0_2px_10px_rgba(255,255,255,0.06)] relative z-10 flex flex-col gap-3 sm:gap-6">
        
        {/* ── ESTADO A CARREGAR PALHETAS ──────────────────────────────────── */}
        {carregando && (
          <div className="py-16 sm:py-24 flex flex-col items-center justify-center gap-3 text-center">
            <FlapWord text="A CARREGAR" variant="yellow" size="lg" />
          </div>
        )}

        {/* ── MODO ANALÓGICO COM VOO ACTIVO (RESPONSIVO PARA TELEMÓVEIS) ──── */}
        {!carregando && vooAtual && infoVoo && (
          <div className="w-full flex flex-col gap-3 sm:gap-6">
            
            {/* ── LINHA 1: VOO & COMPANHIA ──────────────────────────────────── */}
            <div className="w-full bg-[#10121a] p-3 sm:p-5 rounded-xl sm:rounded-2xl border border-white/10 flex flex-row items-center justify-between gap-2 sm:gap-4 shadow-xl">
              
              {/* Voo e Logótipo */}
              <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                {infoVoo.iata && (
                  <div className="w-10 h-10 sm:w-16 sm:h-16 bg-white p-1 rounded-lg sm:rounded-xl border border-neutral-700 shadow-md flex items-center justify-center shrink-0">
                    <Image
                      src={`https://pics.avs.io/200/200/${infoVoo.iata}.png`}
                      alt={infoVoo.nomeCompanhia}
                      width={56}
                      height={56}
                      className="object-contain max-h-full"
                      unoptimized
                    />
                  </div>
                )}

                <div className="flex flex-col items-start gap-0.5 sm:gap-1">
                  <span className="text-[9px] sm:text-xs uppercase tracking-widest text-neutral-400 font-bold">
                    VOO / FLIGHT
                  </span>
                  <FlapWord text={infoVoo.numeroVoo} variant="yellow" size="xl" />
                </div>
              </div>

              {/* Aeronave e Nome da Companhia */}
              <div className="flex flex-col items-end gap-0.5 sm:gap-1 text-right">
                <span className="text-[9px] sm:text-xs uppercase tracking-widest text-neutral-400 font-bold">
                  AIRCRAFT
                </span>
                <FlapWord text={infoVoo.aeronave} variant="white" size="md" />
                <span className="text-[10px] sm:text-xs font-bold text-amber-400/90 tracking-wider truncate max-w-[140px] sm:max-w-none">
                  {infoVoo.nomeCompanhia}
                </span>
              </div>

            </div>

            {/* ── LINHA 2: ROTA EM PALHETAS (ORIGEM ➔ DESTINO) ─────────────── */}
            <div className="w-full bg-[#10121a] p-3 sm:p-6 rounded-xl sm:rounded-2xl border border-white/10 flex flex-row items-center justify-between gap-1 sm:gap-4 shadow-xl">
              
              {/* DEPARTURE (ORIGEM) */}
              <div className="flex flex-col items-start gap-1">
                <span className="text-[9px] sm:text-xs uppercase tracking-widest text-neutral-400 font-bold">
                  ORIGEM
                </span>
                <div className="flex items-center gap-1 sm:gap-2">
                  <FlapWord text={infoVoo.origemCode} variant="yellow" size="hero" />
                  <div className="hidden xs:block">
                    <FlapWord text={infoVoo.origem} variant="white" size="sm" />
                  </div>
                </div>
              </div>

              {/* ÍCONE CENTRAL DE VOO */}
              <div className="flex flex-col items-center justify-center px-1 sm:px-3 shrink-0">
                <span className="text-[8px] sm:text-[10px] uppercase tracking-widest text-emerald-400 font-bold animate-pulse">
                  {infoVoo.noSolo ? "NO SOLO" : "EM VOO"}
                </span>
                <div className="flex items-center gap-1 sm:gap-2">
                  <span className="text-amber-400 text-lg sm:text-3xl">✈</span>
                  <div className="hidden sm:block w-8 sm:w-16 h-0.5 bg-amber-400/40" />
                </div>
              </div>

              {/* DESTINATION (DESTINO) */}
              <div className="flex flex-col items-end gap-1 text-right">
                <span className="text-[9px] sm:text-xs uppercase tracking-widest text-neutral-400 font-bold">
                  DESTINO
                </span>
                <div className="flex items-center gap-1 sm:gap-2">
                  <div className="hidden xs:block">
                    <FlapWord text={infoVoo.destino} variant="white" size="sm" />
                  </div>
                  <FlapWord text={infoVoo.destinoCode} variant="yellow" size="hero" />
                </div>
              </div>

            </div>

            {/* ── LINHA 3: TELEMETRIA (3 COLUNAS AUTO-AJUSTÁVEIS) ─────────── */}
            <div className="w-full grid grid-cols-3 gap-2 sm:gap-4">
              
              {/* ALTITUDE */}
              <div className="bg-[#10121a] p-2 sm:p-4 rounded-xl sm:rounded-2xl border border-white/10 flex flex-col items-center justify-center text-center shadow-lg">
                <span className="text-[8px] sm:text-xs uppercase tracking-wider text-neutral-400 font-bold mb-1">
                  ALTITUDE
                </span>
                <div className="flex items-center gap-0.5 sm:gap-1">
                  <FlapWord text={`${infoVoo.altitudePes}`} variant="amber" size="md" />
                  <span className="text-[9px] sm:text-xs text-neutral-400 font-bold">FT</span>
                </div>
              </div>

              {/* VELOCIDADE */}
              <div className="bg-[#10121a] p-2 sm:p-4 rounded-xl sm:rounded-2xl border border-white/10 flex flex-col items-center justify-center text-center shadow-lg">
                <span className="text-[8px] sm:text-xs uppercase tracking-wider text-neutral-400 font-bold mb-1">
                  VELOCIDADE
                </span>
                <div className="flex items-center gap-0.5 sm:gap-1">
                  <FlapWord text={`${infoVoo.velocidadeKts}`} variant="amber" size="md" />
                  <span className="text-[9px] sm:text-xs text-neutral-400 font-bold">KTS</span>
                </div>
              </div>

              {/* RUMO */}
              <div className="bg-[#10121a] p-2 sm:p-4 rounded-xl sm:rounded-2xl border border-white/10 flex flex-col items-center justify-center text-center shadow-lg">
                <span className="text-[8px] sm:text-xs uppercase tracking-wider text-neutral-400 font-bold mb-1">
                  RUMO
                </span>
                <div className="flex items-center gap-0.5 sm:gap-1">
                  <FlapWord text={`${infoVoo.rumo}`} variant="green" size="md" />
                  <span className="text-[9px] sm:text-xs text-neutral-400 font-bold">°</span>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ── MODO METEOROLÓGICO (SEM VOOS NO RADAR) ───────────────────────── */}
        {!carregando && !vooAtual && (
          <div className="w-full flex flex-col items-center justify-center py-8 gap-4 sm:gap-6 text-center">
            
            <div className="flex flex-col items-center gap-2">
              <span className="text-xs uppercase tracking-widest text-emerald-400 font-bold">
                RADAR EM VALADARES / PORTO
              </span>
              <FlapWord text="ESPACO AEREO LIVRE" variant="yellow" size="lg" />
            </div>

            <div className="w-full max-w-3xl bg-[#10121a] p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-white/10 grid grid-cols-3 gap-2 sm:gap-4 shadow-xl">
              <div className="flex flex-col items-center gap-1">
                <span className="text-[9px] sm:text-xs uppercase tracking-widest text-neutral-400 font-bold">
                  LOCAL
                </span>
                <FlapWord text={meteorologia?.name || "PORTO"} variant="white" size="sm" />
              </div>

              <div className="flex flex-col items-center gap-1">
                <span className="text-[9px] sm:text-xs uppercase tracking-widest text-neutral-400 font-bold">
                  TEMP
                </span>
                <div className="flex items-center gap-0.5">
                  <FlapWord text={`${Math.round(meteorologia?.main?.temp ?? 18)}`} variant="amber" size="md" />
                  <span className="text-[9px] sm:text-xs text-neutral-400 font-bold">°C</span>
                </div>
              </div>

              <div className="flex flex-col items-center gap-1">
                <span className="text-[9px] sm:text-xs uppercase tracking-widest text-neutral-400 font-bold">
                  METEO
                </span>
                <FlapWord text={meteorologia?.weather?.[0]?.description || "CEU LIMPO"} variant="green" size="sm" />
              </div>
            </div>

          </div>
        )}

      </div>
    </main>
  );
}
