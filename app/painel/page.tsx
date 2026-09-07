"use client";

import { useEffect, useState, useCallback, useRef } from "react";

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
  origemPadrao: string;
  destinoPadrao: string;
}

const INTERVALO_MS = 25_000;

// ─── Dicionário de Companhias Aéreas e Rotas Habituais no Porto ──────────────

const COMPANHIAS: Record<string, InfoCompanhia> = {
  TAP: { nome: "TAP AIR PORTUGAL", iata: "TP", origemPadrao: "PORTO", destinoPadrao: "LISBOA" },
  RYR: { nome: "RYANAIR", iata: "FR", origemPadrao: "PORTO", destinoPadrao: "MADRID" },
  EJU: { nome: "EASYJET", iata: "U2", origemPadrao: "PORTO", destinoPadrao: "PARIS" },
  EZY: { nome: "EASYJET", iata: "U2", origemPadrao: "LONDRES", destinoPadrao: "PORTO" },
  EZS: { nome: "EASYJET SWISS", iata: "U2", origemPadrao: "ZURIQUE", destinoPadrao: "PORTO" },
  TVF: { nome: "TRANSAVIA FRANCE", iata: "TO", origemPadrao: "PARIS", destinoPadrao: "PORTO" },
  TRA: { nome: "TRANSAVIA", iata: "HV", origemPadrao: "AMSTERDAO", destinoPadrao: "PORTO" },
  LGL: { nome: "LUXAIR", iata: "LG", origemPadrao: "LUXEMBURGO", destinoPadrao: "PORTO" },
  NOZ: { nome: "NORWEGIAN", iata: "DY", origemPadrao: "OSLO", destinoPadrao: "PORTO" },
  NAX: { nome: "NORWEGIAN AIR", iata: "DY", origemPadrao: "OSLO", destinoPadrao: "PORTO" },
  DLH: { nome: "LUFTHANSA", iata: "LH", origemPadrao: "FRANKFURT", destinoPadrao: "PORTO" },
  VLG: { nome: "VUELING", iata: "VY", origemPadrao: "BARCELONA", destinoPadrao: "PORTO" },
  IBE: { nome: "IBERIA", iata: "IB", origemPadrao: "MADRID", destinoPadrao: "PORTO" },
  SWR: { nome: "SWISS AIRLINES", iata: "LX", origemPadrao: "ZURIQUE", destinoPadrao: "PORTO" },
  KLM: { nome: "KLM ROYAL DUTCH", iata: "KL", origemPadrao: "AMSTERDAO", destinoPadrao: "PORTO" },
  BAW: { nome: "BRITISH AIRWAYS", iata: "BA", origemPadrao: "LONDRES", destinoPadrao: "PORTO" },
  AFR: { nome: "AIR FRANCE", iata: "AF", origemPadrao: "PARIS", destinoPadrao: "PORTO" },
  WZZ: { nome: "WIZZ AIR", iata: "W6", origemPadrao: "BUDAPESTE", destinoPadrao: "PORTO" },
};

const PAISES_NOMES: Record<string, string> = {
  FRANCE: "PARIS",
  SWITZERLAND: "ZURIQUE",
  SPAIN: "MADRID",
  PORTUGAL: "PORTO",
  GERMANY: "FRANKFURT",
  "UNITED KINGDOM": "LONDRES",
  IRELAND: "DUBLIN",
  LUXEMBOURG: "LUXEMBURGO",
  NETHERLANDS: "AMSTERDAO",
  AUSTRIA: "VIENA",
  SWEDEN: "ESTOCOLMO",
};

function resolverVooInfo(voo: EstadoVoo, horaBase: Date) {
  const cs = (voo[1] || "").trim().toUpperCase();
  const prefixo = cs.slice(0, 3);
  const info = COMPANHIAS[prefixo];

  let flightNo = cs || voo[0].toUpperCase();
  if (info && cs.length > 3) {
    flightNo = `${info.iata} ${cs.slice(3).trim()}`;
  }

  const paisUpper = (voo[2] || "").toUpperCase();
  const paisFmt = PAISES_NOMES[paisUpper] || paisUpper || "EUROPA";

  const vRate = voo[11];
  let destino = info?.destinoPadrao || "PORTO";

  if (vRate != null && vRate > 0.5) {
    destino = info?.destinoPadrao || paisFmt;
    if (destino === "PORTO") destino = "MADRID";
  } else if (vRate != null && vRate < -0.5) {
    destino = "PORTO";
  }

  const dataVoo = voo[4] ? new Date(voo[4] * 1000) : horaBase;
  const timeStr = dataVoo.toLocaleTimeString("pt-PT", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return {
    time: timeStr,
    destination: destino.slice(0, 10),
    flight: flightNo.slice(0, 7),
  };
}

// ─── Sintetizador de Som Mecânico de Palhetas ─────────────────────────────────

let globalAudioCtx: AudioContext | null = null;

function tocarSomPalheta() {
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

    const bufferSize = Math.floor(globalAudioCtx.sampleRate * 0.02);
    const buffer = globalAudioCtx.createBuffer(1, bufferSize, globalAudioCtx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25));
    }

    const noise = globalAudioCtx.createBufferSource();
    noise.buffer = buffer;

    const filter = globalAudioCtx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(1600 + Math.random() * 500, now);
    filter.Q.setValueAtTime(2.5, now);

    const noiseGain = globalAudioCtx.createGain();
    noiseGain.gain.setValueAtTime(0.18, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(globalAudioCtx.destination);

    noise.start(now);

    const osc = globalAudioCtx.createOscillator();
    const oscGain = globalAudioCtx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(140 + Math.random() * 30, now);
    osc.frequency.exponentialRampToValueAtTime(35, now + 0.025);

    oscGain.gain.setValueAtTime(0.08, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

    osc.connect(oscGain);
    oscGain.connect(globalAudioCtx.destination);

    osc.start(now);
    osc.stop(now + 0.025);
  } catch {
    // Ignorar erros
  }
}

// ─── Componente Célula Split-Flap Aeroporto ───────────────────────────────────

function SplitFlapChar({ char, somAtivo }: { char: string; somAtivo: boolean }) {
  const [displayChar, setDisplayChar] = useState(char || " ");
  const [isFlipping, setIsFlipping] = useState(false);
  const prevCharRef = useRef(char);

  useEffect(() => {
    if (char !== prevCharRef.current) {
      prevCharRef.current = char;
      setIsFlipping(true);
      if (somAtivo) {
        tocarSomPalheta();
      }
      const timer = setTimeout(() => {
        setDisplayChar(char || " ");
        setIsFlipping(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [char, somAtivo]);

  return (
    <div className="w-[22px] h-[34px] text-base sm:w-[32px] sm:h-[48px] sm:text-2xl md:w-[40px] md:h-[58px] md:text-3xl font-bold font-mono text-white bg-[#141519] rounded-[3px] mx-[1.5px] sm:mx-[2.5px] relative inline-flex items-center justify-center select-none shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_3px_6px_rgba(0,0,0,0.9)] border border-[#22242c] shrink-0">
      {/* Linha de Corte Horizontal */}
      <span className="absolute top-1/2 left-0 right-0 h-[1.5px] bg-[#000000] shadow-[0_1px_1px_rgba(255,255,255,0.1)] z-10 pointer-events-none" />
      
      {/* Pinos do Rotor */}
      <span className="absolute top-1/2 left-[-2px] w-[3px] h-[4px] bg-[#2d303b] rounded-[1px] -translate-y-1/2 z-20" />
      <span className="absolute top-1/2 right-[-2px] w-[3px] h-[4px] bg-[#2d303b] rounded-[1px] -translate-y-1/2 z-20" />

      {/* Sombras */}
      <div className="absolute top-0 inset-x-0 bottom-1/2 bg-gradient-to-b from-white/[0.06] to-transparent pointer-events-none" />
      <div className="absolute top-1/2 inset-x-0 bottom-0 bg-gradient-to-b from-black/40 to-black/80 pointer-events-none" />

      {/* Caractere */}
      <span className={`${isFlipping ? "animate-flap" : ""} transition-transform z-0 tracking-tighter`}>
        {displayChar === " " ? "\u00A0" : displayChar}
      </span>
    </div>
  );
}

function SplitFlapWord({ text, length, align = "left", somAtivo }: { text: string; length: number; align?: "left" | "right" | "center"; somAtivo: boolean }) {
  const safe = (text || "").toUpperCase().slice(0, length);
  let padded = safe;
  if (safe.length < length) {
    const diff = length - safe.length;
    if (align === "left") padded = safe.padEnd(length, " ");
    else if (align === "right") padded = safe.padStart(length, " ");
    else {
      const pL = Math.floor(diff / 2);
      padded = " ".repeat(pL) + safe + " ".repeat(diff - pL);
    }
  }

  return (
    <div className="inline-flex items-center justify-center">
      {padded.split("").map((c, i) => (
        <SplitFlapChar key={i} char={c} somAtivo={somAtivo} />
      ))}
    </div>
  );
}

// ─── Componente Principal (1 Voo de cada vez) ─────────────────────────────────

export default function PainelAeroportoUnicoVoo() {
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
    tocarSomPalheta();
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

  const horaStr = horaAtual.toLocaleTimeString("pt-PT", {
    hour: "2-digit",
    minute: "2-digit",
  });

  // Dados da ÚNICA linha a ser exibida
  let linhaInfo = {
    time: horaStr,
    destination: "SINTONIA",
    flight: "PROCURA",
  };

  if (!carregando && vooAtual) {
    linhaInfo = resolverVooInfo(vooAtual, horaAtual);
  } else if (!carregando && meteorologia) {
    linhaInfo = {
      time: horaStr,
      destination: meteorologia.name.toUpperCase().slice(0, 10),
      flight: `${Math.round(meteorologia.main.temp)} C`,
    };
  }

  return (
    <main
      onClick={ativarAudio}
      className="min-h-screen bg-[#222222] text-white flex flex-col items-center justify-center p-4 sm:p-8 select-none font-mono"
    >
      {/* ── QUADRO DE DEPARTURES Solari (Apenas 1 voo de cada vez) ───────── */}
      <div className="w-full max-w-4xl bg-[#000000] p-6 sm:p-10 rounded-xl shadow-[0_30px_70px_rgba(0,0,0,0.95)] border-4 border-[#141414] flex flex-col items-center">
        
        {/* Placa do Cabeçalho DEPARTURES */}
        <header className="w-full bg-[#000000] border-4 border-[#ffffff] rounded-md py-4 px-6 sm:px-10 mb-8 flex items-center justify-between shadow-md">
          <span className="text-3xl sm:text-5xl text-white font-bold">✈</span>
          
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white uppercase tracking-[0.25em] text-center font-sans">
            DEPARTURES
          </h1>

          <div className="flex items-center gap-3">
            <span className="text-3xl sm:text-5xl text-white font-bold">✈</span>
            <button
              onClick={toggleSom}
              className={`hidden sm:inline-block px-3 py-1 rounded border text-xs font-bold uppercase transition-all ${
                somAtivo
                  ? "bg-white text-black border-white"
                  : "bg-transparent text-neutral-400 border-neutral-600 hover:text-white"
              }`}
            >
              {somAtivo ? "🔊 SOM ON" : "🔇 SOM OFF"}
            </button>
          </div>
        </header>

        {/* Títulos das Colunas (TIME · DESTINATION · FLIGHT) */}
        <div className="w-full flex justify-between px-2 mb-4 text-sm sm:text-base md:text-lg font-black tracking-widest text-white uppercase font-sans border-b border-[#222222] pb-3">
          <div className="w-[25%] text-center">TIME</div>
          <div className="w-[48%] text-center">DESTINATION</div>
          <div className="w-[27%] text-center">FLIGHT</div>
        </div>

        {/* ÚNICA Linha de Palhetas Mecânicas (1 Voo de cada vez) */}
        <div className="w-full bg-[#0a0a0a] p-4 sm:p-6 rounded-lg border border-[#222222] flex justify-between items-center shadow-inner py-6">
          
          {/* TIME (5 palhetas) */}
          <div className="w-[25%] flex justify-center">
            <SplitFlapWord
              text={linhaInfo.time}
              length={5}
              align="center"
              somAtivo={somAtivo}
            />
          </div>

          {/* DESTINATION (10 palhetas) */}
          <div className="w-[48%] flex justify-center">
            <SplitFlapWord
              text={linhaInfo.destination}
              length={10}
              align="left"
              somAtivo={somAtivo}
            />
          </div>

          {/* FLIGHT (7 palhetas) */}
          <div className="w-[27%] flex justify-center">
            <SplitFlapWord
              text={linhaInfo.flight}
              length={7}
              align="center"
              somAtivo={somAtivo}
            />
          </div>
        </div>

        {/* Rodapé */}
        <footer className="w-full mt-6 pt-4 border-t border-[#1f1f1f] flex items-center justify-between text-xs text-neutral-400 font-bold uppercase tracking-widest">
          <span>RADAR VALADARES · SECTOR PORTO</span>
          <button
            onClick={toggleSom}
            className="sm:hidden text-neutral-200 font-bold underline"
          >
            {somAtivo ? "🔊 SOM ATIVADO" : "🔇 ATIVAR SOM"}
          </button>
          <span>VOO ACTIVO</span>
        </footer>

      </div>
    </main>
  );
}
