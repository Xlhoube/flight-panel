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

// ─── Componente de Palheta Mecânica Solari (Split-Flap Tile) ──────────────────

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

  const dimensões = {
    sm: "w-7 sm:w-8 h-10 sm:h-12 text-lg sm:text-xl font-black rounded-[3px]",
    md: "w-9 sm:w-11 h-13 sm:h-15 text-2xl sm:text-3xl font-black rounded-[4px]",
    lg: "w-11 sm:w-14 h-16 sm:h-20 text-3xl sm:text-4xl font-black rounded-[5px]",
    xl: "w-14 sm:w-16 h-20 sm:h-24 text-4xl sm:text-5xl font-black rounded-[6px]",
    hero: "w-14 sm:w-18 h-20 sm:h-26 text-4xl sm:text-6xl font-black rounded-[6px]",
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
      {/* Pinos metálicos laterais */}
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

// ─── Componente de Palavra Contínua (Sem Quebras de Linha) ────────────────────

interface FlapWordProps {
  text: string;
  variant?: "yellow" | "white" | "amber" | "green";
  size?: "sm" | "md" | "lg" | "xl" | "hero";
}

function FlapWord({ text, variant = "yellow", size = "lg" }: FlapWordProps) {
  const chars = (text || "").split("");

  return (
    <div className="flex items-center gap-1 sm:gap-1.5 flex-nowrap shrink-0">
      {chars.map((c, i) => (
        <FlapCell key={i} char={c} variant={variant} size={size} />
      ))}
    </div>
  );
}

// ─── Componente Principal Painel Analógico Organizado (Landscape) ─────────────

export default function PainelAnalogicoOrganizado() {
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
      className="min-h-screen bg-[#060709] text-neutral-100 flex flex-col items-center justify-center p-3 sm:p-6 select-none font-mono cursor-pointer relative overflow-hidden board-texture"
    >
      {/* Retroiluminação subtil das palhetas */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-amber-500/5 rounded-full blur-[140px] pointer-events-none" />

      {/* ── QUADRO METÁLICO ANALÓGICO ORGANIZADO EM WIDESCREEN 16:9 ───────── */}
      <div className="w-full max-w-5xl bg-[#0b0c10] border-[10px] sm:border-[16px] border-[#14161f] rounded-[1.5rem] sm:rounded-[2.5rem] p-6 sm:p-10 shadow-[0_50px_120px_rgba(0,0,0,0.98),inset_0_2px_10px_rgba(255,255,255,0.06)] relative z-10 flex flex-col gap-6 sm:gap-8">
        
        {/* ── ESTADO A CARREGAR PALHETAS ──────────────────────────────────── */}
        {carregando && (
          <div className="py-24 flex flex-col items-center justify-center gap-4 text-center">
            <FlapWord text="A CARREGAR" variant="yellow" size="xl" />
          </div>
        )}

        {/* ── MODO ANALÓGICO COM VOO ACTIVO (LETRAS GRANDES E ORGANIZADAS) ── */}
        {!carregando && vooAtual && infoVoo && (
          <div className="w-full flex flex-col gap-6 sm:gap-8">
            
            {/* ── LINHA 1: VOO & COMPANHIA ──────────────────────────────────── */}
            <div className="w-full bg-[#10121a] p-5 sm:p-6 rounded-2xl border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl">
              
              {/* Voo e Logótipo */}
              <div className="flex items-center gap-4 sm:gap-6">
                {infoVoo.iata && (
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white p-1.5 rounded-xl border-2 border-neutral-700 shadow-xl flex items-center justify-center shrink-0">
                    <Image
                      src={`https://pics.avs.io/200/200/${infoVoo.iata}.png`}
                      alt={infoVoo.nomeCompanhia}
                      width={68}
                      height={68}
                      className="object-contain max-h-full"
                      unoptimized
                    />
                  </div>
                )}

                <div className="flex flex-col items-start gap-1">
                  <span className="text-xs uppercase tracking-widest text-neutral-400 font-bold">
                    VOO / FLIGHT
                  </span>
                  <FlapWord text={infoVoo.numeroVoo} variant="yellow" size="xl" />
                </div>
              </div>

              {/* Aeronave e Nome da Companhia */}
              <div className="flex flex-col items-start sm:items-end gap-1">
                <span className="text-xs uppercase tracking-widest text-neutral-400 font-bold">
                  AERONAVE / AIRCRAFT
                </span>
                <FlapWord text={infoVoo.aeronave} variant="white" size="md" />
                <span className="text-sm font-bold text-amber-400/90 tracking-wider mt-1">
                  {infoVoo.nomeCompanhia}
                </span>
              </div>

            </div>

            {/* ── LINHA 2: ROTA EM PALHETAS GIGANTES (ORIGEM ➔ DESTINO) ────── */}
            <div className="w-full bg-[#10121a] p-6 sm:p-8 rounded-2xl border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
              
              {/* DEPARTURE (ORIGEM) */}
              <div className="flex flex-col items-start gap-2">
                <span className="text-xs uppercase tracking-widest text-neutral-400 font-bold">
                  ORIGEM / DEPARTURE
                </span>
                <div className="flex items-center gap-3 sm:gap-4">
                  <FlapWord text={infoVoo.origemCode} variant="yellow" size="hero" />
                  <FlapWord text={infoVoo.origem} variant="white" size="md" />
                </div>
              </div>

              {/* ÍCONE CENTRAL DE VOO */}
              <div className="flex flex-col items-center justify-center px-4">
                <span className="text-xs uppercase tracking-widest text-emerald-400 font-bold mb-2 animate-pulse">
                  {infoVoo.noSolo ? "NO SOLO" : "EM VOO"}
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-amber-400 text-3xl sm:text-4xl">✈</span>
                  <div className="w-16 sm:w-24 h-1 bg-gradient-to-r from-amber-500/30 via-amber-400 to-amber-500/30 rounded-full" />
                </div>
              </div>

              {/* DESTINATION (DESTINO) */}
              <div className="flex flex-col items-start md:items-end gap-2">
                <span className="text-xs uppercase tracking-widest text-neutral-400 font-bold">
                  DESTINO / DESTINATION
                </span>
                <div className="flex items-center gap-3 sm:gap-4">
                  <FlapWord text={infoVoo.destinoCode} variant="yellow" size="hero" />
                  <FlapWord text={infoVoo.destino} variant="white" size="md" />
                </div>
              </div>

            </div>

            {/* ── LINHA 3: TELEMETRIA EM LETRAS GRANDES E LEGÍVEIS ─────────── */}
            <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              
              {/* ALTITUDE */}
              <div className="bg-[#10121a] p-5 sm:p-6 rounded-2xl border border-white/10 flex flex-col items-center justify-center text-center shadow-xl">
                <span className="text-xs uppercase tracking-widest text-neutral-400 font-bold mb-3">
                  ALTITUDE
                </span>
                <div className="flex items-center gap-2">
                  <FlapWord text={`${infoVoo.altitudePes}`} variant="amber" size="lg" />
                  <FlapWord text="FT" variant="white" size="sm" />
                </div>
              </div>

              {/* VELOCIDADE */}
              <div className="bg-[#10121a] p-5 sm:p-6 rounded-2xl border border-white/10 flex flex-col items-center justify-center text-center shadow-xl">
                <span className="text-xs uppercase tracking-widest text-neutral-400 font-bold mb-3">
                  VELOCIDADE
                </span>
                <div className="flex items-center gap-2">
                  <FlapWord text={`${infoVoo.velocidadeKts}`} variant="amber" size="lg" />
                  <FlapWord text="KTS" variant="white" size="sm" />
                </div>
              </div>

              {/* RUMO */}
              <div className="bg-[#10121a] p-5 sm:p-6 rounded-2xl border border-white/10 flex flex-col items-center justify-center text-center shadow-xl">
                <span className="text-xs uppercase tracking-widest text-neutral-400 font-bold mb-3">
                  RUMO / HEADING
                </span>
                <div className="flex items-center gap-2">
                  <FlapWord text={`${infoVoo.rumo}`} variant="green" size="lg" />
                  <FlapWord text="DEG" variant="white" size="sm" />
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ── MODO METEOROLÓGICO (SEM VOOS NO RADAR) ───────────────────────── */}
        {!carregando && !vooAtual && (
          <div className="w-full flex flex-col items-center justify-center py-10 gap-8 text-center">
            
            <div className="flex flex-col items-center gap-3">
              <span className="text-sm uppercase tracking-widest text-emerald-400 font-bold">
                RADAR EM VALADARES / PORTO
              </span>
              <FlapWord text="ESPACO AEREO LIVRE" variant="yellow" size="xl" />
            </div>

            <div className="w-full max-w-3xl bg-[#10121a] p-8 rounded-2xl border border-white/10 flex flex-col md:flex-row items-center justify-around gap-8 shadow-2xl">
              <div className="flex flex-col items-center gap-2">
                <span className="text-xs uppercase tracking-widest text-neutral-400 font-bold">
                  LOCAL
                </span>
                <FlapWord text={meteorologia?.name || "PORTO"} variant="white" size="md" />
              </div>

              <div className="flex flex-col items-center gap-2">
                <span className="text-xs uppercase tracking-widest text-neutral-400 font-bold">
                  TEMPERATURA
                </span>
                <div className="flex items-center gap-2">
                  <FlapWord text={`${Math.round(meteorologia?.main?.temp ?? 18)}`} variant="amber" size="lg" />
                  <FlapWord text="C" variant="white" size="sm" />
                </div>
              </div>

              <div className="flex flex-col items-center gap-2">
                <span className="text-xs uppercase tracking-widest text-neutral-400 font-bold">
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
