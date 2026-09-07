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
const TOTAL_LINHAS = 9; // Número fixo de linhas da grelha de partidas

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

function resolverVooLinha(voo: EstadoVoo, horaBase: Date) {
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

  // Formatar a hora do voo (último contacto ou hora base)
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

    const bufferSize = Math.floor(globalAudioCtx.sampleRate * 0.018);
    const buffer = globalAudioCtx.createBuffer(1, bufferSize, globalAudioCtx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.22));
    }

    const noise = globalAudioCtx.createBufferSource();
    noise.buffer = buffer;

    const filter = globalAudioCtx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(1700 + Math.random() * 400, now);
    filter.Q.setValueAtTime(3, now);

    const noiseGain = globalAudioCtx.createGain();
    noiseGain.gain.setValueAtTime(0.15, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.018);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(globalAudioCtx.destination);

    noise.start(now);

    const osc = globalAudioCtx.createOscillator();
    const oscGain = globalAudioCtx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(150 + Math.random() * 30, now);
    osc.frequency.exponentialRampToValueAtTime(35, now + 0.02);

    oscGain.gain.setValueAtTime(0.07, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

    osc.connect(oscGain);
    oscGain.connect(globalAudioCtx.destination);

    osc.start(now);
    osc.stop(now + 0.02);
  } catch {
    // Ignorar
  }
}

// ─── Componente Célula Split-Flap Aeroporto Vintage ───────────────────────────

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
    <div className="w-[18px] h-[28px] text-sm sm:w-[26px] sm:h-[38px] sm:text-xl md:w-[32px] md:h-[46px] md:text-2xl font-bold font-mono text-white bg-[#141519] rounded-[2px] mx-[1px] relative inline-flex items-center justify-center select-none shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_2px_4px_rgba(0,0,0,0.9)] border border-[#22242c] shrink-0">
      {/* Linha de Corte Horizontal */}
      <span className="absolute top-1/2 left-0 right-0 h-[1.5px] bg-[#000000] shadow-[0_1px_1px_rgba(255,255,255,0.1)] z-10 pointer-events-none" />
      
      {/* Pinos do Rotor */}
      <span className="absolute top-1/2 left-[-2px] w-[3px] h-[4px] bg-[#2d303b] rounded-[1px] -translate-y-1/2 z-20" />
      <span className="absolute top-1/2 right-[-2px] w-[3px] h-[4px] bg-[#2d303b] rounded-[1px] -translate-y-1/2 z-20" />

      {/* Sombra de palheta */}
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
    <div className="inline-flex items-center">
      {padded.split("").map((c, i) => (
        <SplitFlapChar key={i} char={c} somAtivo={somAtivo} />
      ))}
    </div>
  );
}

// ─── Componente Principal ─────────────────────────────────────────────────────

export default function PainelAeroportoDepartures() {
  const [voos, setVoos] = useState<EstadoVoo[]>([]);
  const [meteorologia, setMeteorologia] = useState<DadosMeteo | null>(null);
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
        setVoos(dadosVoos.estados);
        setMeteorologia(null);
      } else {
        setVoos([]);
        const resMeteo = await fetch("/api/meteorologia");
        const dadosMeteo = await resMeteo.json();
        if (!dadosMeteo.erro) {
          setMeteorologia(dadosMeteo);
        }
      }
    } catch {
      // Ignorar erros
    }
  }, []);

  useEffect(() => {
    buscarDados();
    const int = setInterval(buscarDados, INTERVALO_MS);
    return () => clearInterval(int);
  }, [buscarDados]);

  // Preparar as linhas de partidas
  const linhasTabela = [];

  if (voos.length > 0) {
    for (let i = 0; i < TOTAL_LINHAS; i++) {
      if (i < voos.length) {
        const info = resolverVooLinha(voos[i], horaAtual);
        linhasTabela.push(info);
      } else {
        // Linha em branco (palhetas pretas com espaços)
        linhasTabela.push({ time: "     ", destination: "          ", flight: "       " });
      }
    }
  } else if (meteorologia) {
    // Caso de meteorologia (preencher as linhas da grelha com informação meteo)
    const tempStr = `${Math.round(meteorologia.main.temp)} C`;
    const windStr = `${Math.round(meteorologia.wind.speed * 3.6)} KM/H`;
    const descStr = meteorologia.weather[0]?.description.toUpperCase() || "LIMPO";

    linhasTabela.push({ time: "METEO", destination: meteorologia.name.toUpperCase().slice(0, 10), flight: "VALADAR" });
    linhasTabela.push({ time: "TEMP ", destination: tempStr.slice(0, 10), flight: "LOCAL  " });
    linhasTabela.push({ time: "VENTO", destination: windStr.slice(0, 10), flight: "RADAR  " });
    linhasTabela.push({ time: "COND ", destination: descStr.slice(0, 10), flight: "OK     " });

    for (let i = 4; i < TOTAL_LINHAS; i++) {
      linhasTabela.push({ time: "     ", destination: "          ", flight: "       " });
    }
  } else {
    // A carregar
    for (let i = 0; i < TOTAL_LINHAS; i++) {
      if (i === 0) {
        linhasTabela.push({ time: "RADAR", destination: "SINTONIA  ", flight: "BUSCA  " });
      } else {
        linhasTabela.push({ time: "     ", destination: "          ", flight: "       " });
      }
    }
  }

  return (
    <main
      onClick={ativarAudio}
      className="min-h-screen bg-[#333333] flex flex-col items-center justify-center p-3 sm:p-6 md:p-10 select-none font-mono"
    >
      
      {/* ── QUADRO DE PARTIDAS ESTILO AEROPORTO CLÁSSICO ──────────────────── */}
      <div className="w-full max-w-4xl bg-[#000000] p-4 sm:p-8 rounded-lg shadow-[0_25px_60px_rgba(0,0,0,0.95)] border-4 border-[#1a1a1a] flex flex-col items-center">
        
        {/* ── PLACA DO CABEÇALHO SUPERIOR (✈ DEPARTURES ✈) ────────────────── */}
        <header className="w-full bg-[#000000] border-4 border-[#ffffff] rounded-md py-3 px-4 sm:px-8 mb-6 flex items-center justify-between shadow-md">
          <span className="text-2xl sm:text-4xl text-white font-bold">✈</span>
          
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white uppercase tracking-[0.25em] text-center font-sans">
            DEPARTURES
          </h1>

          <div className="flex items-center gap-3">
            <span className="text-2xl sm:text-4xl text-white font-bold">✈</span>
            {/* Interruptor discreto de som */}
            <button
              onClick={toggleSom}
              className={`hidden sm:inline-block px-2.5 py-1 rounded border text-[10px] font-bold uppercase transition-all ${
                somAtivo
                  ? "bg-white text-black border-white"
                  : "bg-transparent text-neutral-400 border-neutral-600 hover:text-white"
              }`}
            >
              {somAtivo ? "🔊 SOM ON" : "🔇 SOM OFF"}
            </button>
          </div>
        </header>

        {/* ── GRELHA DE COLUNAS SOLARI ────────────────────────────────────── */}
        <div className="w-full overflow-x-auto">
          <div className="min-w-[620px] flex flex-col items-center">
            
            {/* Títulos das Colunas */}
            <div className="w-full flex justify-between px-2 mb-2 text-xs sm:text-sm font-black tracking-widest text-white uppercase font-sans">
              <div className="w-[20%] text-center">TIME</div>
              <div className="w-[50%] text-center">DESTINATION</div>
              <div className="w-[30%] text-center">FLIGHT</div>
            </div>

            {/* Linhas de Palhetas Mecânicas */}
            <div className="w-full flex flex-col gap-2 bg-[#0a0a0a] p-3 sm:p-4 rounded border border-[#222222]">
              {linhasTabela.map((linha, idx) => (
                <div
                  key={idx}
                  className="w-full flex justify-between items-center py-0.5 border-b border-[#181818] last:border-b-0"
                >
                  {/* Coluna TIME (5 palhetas) */}
                  <div className="w-[20%] flex justify-center">
                    <SplitFlapWord
                      text={linha.time}
                      length={5}
                      align="center"
                      somAtivo={somAtivo}
                    />
                  </div>

                  {/* Coluna DESTINATION (10 palhetas) */}
                  <div className="w-[50%] flex justify-center">
                    <SplitFlapWord
                      text={linha.destination}
                      length={10}
                      align="left"
                      somAtivo={somAtivo}
                    />
                  </div>

                  {/* Coluna FLIGHT (7 palhetas) */}
                  <div className="w-[30%] flex justify-center">
                    <SplitFlapWord
                      text={linha.flight}
                      length={7}
                      align="center"
                      somAtivo={somAtivo}
                    />
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* Rodapé do Painel */}
        <footer className="w-full mt-4 pt-3 border-t border-[#1f1f1f] flex items-center justify-between text-[10px] text-neutral-400 font-bold uppercase tracking-widest">
          <span>VALADARES AIRPORT BOARD</span>
          <button
            onClick={toggleSom}
            className="sm:hidden text-neutral-300 font-bold"
          >
            {somAtivo ? "🔊 SOM ATIVADO" : "🔇 TOQUE PARA ATIVAR SOM"}
          </button>
          <span>AUTO-REFRESH: 25S</span>
        </footer>

      </div>
    </main>
  );
}
