"use client";

import { useEffect, useState, useCallback, useRef } from "react";
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
    numeroVoo = `${info.iata} ${cs.slice(3).trim()}`;
  }

  const paisUpper = (voo[2] || "").toUpperCase();
  let origem = info?.origem || paisUpper || "INTERNACIONAL";
  let destino = info?.destino || "PORTO";
  let origemCode = info?.origemCode || "ORG";
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

    // Efeito de clique seco de palheta mecânica
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
  size?: "sm" | "md" | "lg" | "xl";
}

function FlapCell({ char, variant = "yellow", size = "md" }: FlapCellProps) {
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
    sm: "w-6 h-9 text-base font-black rounded-[3px]",
    md: "w-8 h-12 text-xl font-black rounded-[4px]",
    lg: "w-11 h-16 text-3xl font-black rounded-[5px]",
    xl: "w-14 h-20 text-4xl font-black rounded-[6px]",
  }[size];

  const coresTexto = {
    yellow: "text-[#facc15] bg-[#111319] border-[#222634] shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]",
    white: "text-[#f8fafc] bg-[#111319] border-[#222634] shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]",
    amber: "text-[#fbbf24] bg-[#16130b] border-[#382b13]",
    green: "text-[#34d399] bg-[#0c1713] border-[#18392b]",
  }[variant];

  const charExibir = char === " " ? "\u00A0" : char.toUpperCase();

  return (
    <div className={`flap-cell ${dimensões} ${coresTexto} ${animating ? "animate-flap" : ""}`}>
      {/* Pinos metálicos laterais do rotor */}
      <span className="flap-pin-left" />
      <span className="flap-pin-right" />

      {/* Linha de corte horizontal central da palheta */}
      <span className="flap-split-line" />

      {/* Carácter impresso na palheta */}
      <span className="leading-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] tracking-tighter">
        {charExibir}
      </span>
    </div>
  );
}

// ─── Componente de Palavra / Linha Solari (FlapWord) ──────────────────────────

interface FlapWordProps {
  text: string;
  length: number;
  variant?: "yellow" | "white" | "amber" | "green";
  size?: "sm" | "md" | "lg" | "xl";
}

function FlapWord({ text, length, variant = "yellow", size = "md" }: FlapWordProps) {
  const padText = (text || "").padEnd(length, " ").slice(0, length);

  return (
    <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
      {padText.split("").map((c, i) => (
        <FlapCell key={i} char={c} variant={variant} size={size} />
      ))}
    </div>
  );
}

// ─── Componente Principal Painel Analógico Aeroporto (Landscape Edition) ──────

export default function PainelAnalogicoAeroporto() {
  const [vooAtual, setVooAtual] = useState<EstadoVoo | null>(null);
  const [meteorologia, setMeteorologia] = useState<DadosMeteo | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [somAtivo, setSomAtivo] = useState(false);
  const [horaAtual, setHoraAtual] = useState(new Date());

  useEffect(() => {
    const tick = setInterval(() => setHoraAtual(new Date()), 1000);
    return () => clearInterval(tick);
  }, []);

  const ativarAudio = () => {
    if (!globalAudioCtx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      globalAudioCtx = new AudioCtxClass();
    }
    if (globalAudioCtx.state === "suspended") {
      globalAudioCtx.resume();
    }
    setSomAtivo(true);
    tocarSomFlapClack();
  };

  const toggleSom = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!somAtivo) {
      ativarAudio();
    } else {
      setSomAtivo(false);
    }
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

  const horaStr = horaAtual.toLocaleTimeString("pt-PT", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <main
      onClick={ativarAudio}
      className="min-h-screen bg-[#07080a] text-neutral-100 flex flex-col items-center justify-center p-3 sm:p-6 select-none font-mono cursor-pointer relative overflow-hidden board-texture"
    >
      {/* Glow mecânico de retroiluminação das palhetas */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* ── QUADRO METÁLICO ANALÓGICO SOLARI (16:9 LANDSCAPE WIDESCREEN) ─────── */}
      <div className="w-full max-w-5xl bg-[#0c0d12] border-[12px] sm:border-[16px] border-[#161820] rounded-[1.5rem] sm:rounded-[2rem] p-5 sm:p-7 shadow-[0_50px_120px_rgba(0,0,0,0.98),inset_0_2px_10px_rgba(255,255,255,0.06)] relative z-10 flex flex-col">
        
        {/* Parafusos industriais nos 4 cantos da moldura */}
        <span className="screw absolute top-3 left-3" />
        <span className="screw absolute top-3 right-3" />
        <span className="screw absolute bottom-3 left-3" />
        <span className="screw absolute bottom-3 right-3" />

        {/* ── CABEÇALHO ANALÓGICO DO PAINEL DE PARTIDAS ─────────────────────── */}
        <header className="w-full flex items-center justify-between pb-4 border-b border-white/10 mb-6">
          
          {/* Lâmpadas indicadoras vintage & Título */}
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-emerald-500 indicator-lamp animate-pulse" />
            <div className="flex flex-col">
              <span className="text-sm sm:text-base font-black uppercase tracking-[0.3em] text-amber-400 drop-shadow-[0_2px_4px_rgba(251,191,36,0.3)]">
                DEPARTURES · SOLARI SPLIT-FLAP
              </span>
              <span className="text-[10px] text-neutral-500 tracking-widest uppercase font-bold">
                AEROPORTO DO PORTO · VALADARES RADAR
              </span>
            </div>
          </div>

          {/* Relógio de Palhetas e Controlo de Som */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 bg-[#12141c] px-3 py-1.5 rounded-lg border border-white/10 shadow-inner">
              <span className="text-[10px] text-neutral-400 uppercase tracking-widest">HORA</span>
              <span className="text-sm font-black text-amber-400 tracking-widest font-mono">
                {horaStr}
              </span>
            </div>

            <button
              onClick={toggleSom}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all border ${
                somAtivo
                  ? "bg-amber-500/20 text-amber-400 border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.3)]"
                  : "bg-neutral-800 text-neutral-400 border-neutral-700"
              }`}
            >
              {somAtivo ? "🔊 CLAQUE ON" : "🔇 CLAQUE OFF"}
            </button>
          </div>
        </header>

        {/* ── ESTADO A CARREGAR PALHETAS ──────────────────────────────────── */}
        {carregando && (
          <div className="py-20 flex flex-col items-center gap-4 text-center">
            <div className="flex items-center gap-2">
              <FlapCell char="C" size="md" />
              <FlapCell char="A" size="md" />
              <FlapCell char="R" size="md" />
              <FlapCell char="R" size="md" />
              <FlapCell char="E" size="md" />
              <FlapCell char="G" size="md" />
              <FlapCell char="A" size="md" />
              <FlapCell char="R" size="md" />
            </div>
            <span className="text-xs tracking-widest text-neutral-400 uppercase font-mono mt-2">
              A SINCRONIZAR ROTORES MECÂNICOS...
            </span>
          </div>
        )}

        {/* ── MODO ANALÓGICO COM VOO ACTIVO (LANDSCAPE WIDESCREEN) ────────── */}
        {!carregando && vooAtual && infoVoo && (
          <div className="w-full flex flex-col gap-6 my-2">
            
            {/* LINHA 1: COMPANHIA AÉREA & NÚMERO DO VOO */}
            <div className="w-full bg-[#12141c] p-4 sm:p-5 rounded-xl border border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 shadow-2xl">
              
              <div className="flex items-center gap-4">
                {/* Badge/Logótipo da Companhia em cartão Solari */}
                {infoVoo.iata && (
                  <div className="w-14 h-14 bg-white p-1 rounded-lg border-2 border-neutral-700 shadow-md flex items-center justify-center shrink-0">
                    <Image
                      src={`https://pics.avs.io/200/200/${infoVoo.iata}.png`}
                      alt={infoVoo.nomeCompanhia}
                      width={52}
                      height={52}
                      className="object-contain max-h-full"
                      unoptimized
                    />
                  </div>
                )}
                
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold mb-1">
                    VOO / FLIGHT
                  </span>
                  <FlapWord text={infoVoo.numeroVoo} length={8} variant="yellow" size="lg" />
                </div>
              </div>

              {/* Nome da Companhia e Modelo de Aeronave em Palhetas */}
              <div className="flex flex-col items-start md:items-end w-full md:w-auto">
                <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold mb-1">
                  AERONAVE / AIRCRAFT
                </span>
                <FlapWord text={infoVoo.aeronave} length={14} variant="white" size="sm" />
                <span className="text-xs text-amber-400/80 font-bold mt-1 tracking-wider">
                  {infoVoo.nomeCompanhia}
                </span>
              </div>

            </div>

            {/* LINHA 2: ROTA EM PALHETAS MECÂNICAS (ORIGEM ➔ DESTINO) */}
            <div className="w-full bg-[#12141c] p-5 sm:p-6 rounded-xl border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
              
              {/* ORIGEM */}
              <div className="flex flex-col items-start gap-1">
                <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold">
                  DEPARTURE / ORIGEM
                </span>
                <div className="flex items-center gap-3">
                  <FlapWord text={infoVoo.origemCode} length={3} variant="yellow" size="xl" />
                  <FlapWord text={infoVoo.origem} length={10} variant="white" size="sm" />
                </div>
              </div>

              {/* ÍCONE DE ESTADO DE VOO / FLAP STATUS */}
              <div className="flex flex-col items-center justify-center px-4">
                <span className="text-[10px] uppercase tracking-widest text-emerald-400 font-bold mb-2 animate-pulse">
                  {infoVoo.noSolo ? "NO SOLO" : "EM VOO"}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-amber-400 text-2xl animate-bounce">✈</span>
                  <span className="text-neutral-500 font-mono text-sm tracking-widest">━━━━</span>
                </div>
              </div>

              {/* DESTINO */}
              <div className="flex flex-col items-start md:items-end gap-1">
                <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold">
                  DESTINATION / DESTINO
                </span>
                <div className="flex items-center gap-3">
                  <FlapWord text={infoVoo.destinoCode} length={3} variant="yellow" size="xl" />
                  <FlapWord text={infoVoo.destino} length={10} variant="white" size="sm" />
                </div>
              </div>

            </div>

            {/* LINHA 3: TELEMETRIA ANALÓGICA DE AVIAÇÃO */}
            <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* ALTITUDE */}
              <div className="bg-[#12141c] p-4 rounded-xl border border-white/10 flex flex-col items-center justify-center text-center shadow-lg">
                <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold mb-2">
                  ALTITUDE (FT)
                </span>
                <FlapWord text={`${infoVoo.altitudePes} FT`} length={9} variant="amber" size="md" />
              </div>

              {/* VELOCIDADE */}
              <div className="bg-[#12141c] p-4 rounded-xl border border-white/10 flex flex-col items-center justify-center text-center shadow-lg">
                <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold mb-2">
                  VELOCIDADE (KTS)
                </span>
                <FlapWord text={`${infoVoo.velocidadeKts} KTS`} length={8} variant="amber" size="md" />
              </div>

              {/* RUMO / COMPASS */}
              <div className="bg-[#12141c] p-4 rounded-xl border border-white/10 flex flex-col items-center justify-center text-center shadow-lg">
                <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold mb-2">
                  RUMO / HEADING
                </span>
                <FlapWord text={`${infoVoo.rumo} DEG`} length={7} variant="green" size="md" />
              </div>

            </div>

          </div>
        )}

        {/* ── MODO ANALÓGICO METEOROLÓGICO (SEM TRAFEGO) ───────────────────── */}
        {!carregando && !vooAtual && (
          <div className="w-full flex flex-col items-center justify-center py-8 gap-6 text-center">
            
            <div className="flex flex-col items-center gap-2">
              <span className="text-xs uppercase tracking-widest text-emerald-400 font-bold mb-1">
                STATUS: RADAR LIVRE
              </span>
              <FlapWord text="ESPACO AEREO LIVRE" length={18} variant="yellow" size="lg" />
            </div>

            <div className="w-full max-w-2xl bg-[#12141c] p-6 rounded-xl border border-white/10 flex flex-col md:flex-row items-center justify-around gap-6 shadow-2xl">
              <div className="flex flex-col items-center">
                <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold mb-2">
                  CIDADE
                </span>
                <FlapWord text={meteorologia?.name || "PORTO"} length={8} variant="white" size="md" />
              </div>

              <div className="flex flex-col items-center">
                <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold mb-2">
                  TEMPERATURA
                </span>
                <FlapWord text={`${Math.round(meteorologia?.main?.temp ?? 18)} C`} length={5} variant="amber" size="md" />
              </div>

              <div className="flex flex-col items-center">
                <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold mb-2">
                  CONDAO METEO
                </span>
                <FlapWord text={meteorologia?.weather?.[0]?.description || "CEU LIMPO"} length={10} variant="green" size="sm" />
              </div>
            </div>

          </div>
        )}

        {/* RODAPÉ DO PAINEL MECÂNICO */}
        <footer className="w-full mt-6 pt-3 border-t border-white/10 flex items-center justify-between text-[10px] text-neutral-500 uppercase tracking-widest font-mono">
          <span>PAINEL ANALOGICO SOLARI DI UDINE · REPLICA VINTAGE</span>
          <span>ATUALIZACAO: 25S</span>
        </footer>

      </div>
    </main>
  );
}
