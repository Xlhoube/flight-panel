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

// ─── Dicionário de Companhias Aéreas ──────────────────────────────────────────

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

function resolverVooInfo(callsignRaw: string | null, paisOrigem: string | null, altitude: number | null, vRate: number | null) {
  const cs = (callsignRaw || "").trim().toUpperCase();
  const prefixo = cs.slice(0, 3);
  const info = COMPANHIAS[prefixo];

  let iata = info?.iata || null;
  let numeroFormatado = cs || "UNK 000";

  if (info && cs.length > 3) {
    const resto = cs.slice(3).trim();
    numeroFormatado = `${info.iata} ${resto}`;
  }

  const paisUpper = (paisOrigem || "").toUpperCase();
  const paisFmt = PAISES_NOMES[paisUpper] || paisUpper || "EUROPA";

  let origem = info?.origemPadrao || paisFmt;
  let destino = info?.destinoPadrao || "PORTO";

  if (vRate != null) {
    if (vRate < -0.5) {
      destino = "PORTO";
      if (origem === "PORTO") {
        origem = info?.origemPadrao || paisFmt;
      }
    } else if (vRate > 0.5) {
      origem = "PORTO";
      if (destino === "PORTO") {
        destino = info?.destinoPadrao || paisFmt;
      }
    }
  }

  if (altitude != null && altitude < 1500 && vRate == null) {
    destino = "PORTO";
  }

  if (origem === destino) {
    if (origem === "PORTO") {
      destino = paisFmt !== "PORTO" ? paisFmt : "LISBOA";
    } else {
      destino = "PORTO";
    }
  }

  return {
    numeroVoo: numeroFormatado,
    iata,
    origem: origem.slice(0, 10),
    destino: destino.slice(0, 10),
  };
}

// ─── Sintetizador de Som Mecânico ─────────────────────────────────────────────

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
      output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25));
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
  } catch {
    // Ignorar
  }
}

// ─── Componente Logótipo Pixel Art Monocromático (Canvas Pixelation) ─────────

function PixelLogo({ iata }: { iata: string | null }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!iata || typeof window === "undefined") return;
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.src = `https://pics.avs.io/200/200/${iata}.png`;

    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const size = 64; // Alta Definição Pixel Art (64x64)
      canvas.width = size;
      canvas.height = size;

      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(img, 0, 0, size, size);

      try {
        const imgData = ctx.getImageData(0, 0, size, size);
        const d = imgData.data;
        for (let i = 0; i < d.length; i += 4) {
          const brightness = (d[i] + d[i + 1] + d[i + 2]) / 3;
          const alpha = d[i + 3];

          if (alpha < 30) {
            d[i + 3] = 0;
          } else {
            const isBright = brightness > 120;
            const colorVal = isBright ? 255 : 0;
            d[i] = colorVal;
            d[i + 1] = colorVal;
            d[i + 2] = colorVal;
            d[i + 3] = 255;
          }
        }
        ctx.putImageData(imgData, 0, 0);
      } catch {
        // Fallback
      }
    };
  }, [iata]);

  if (!iata) {
    return (
      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-black border-2 border-neutral-700 rounded-xl flex items-center justify-center text-white text-3xl shrink-0">
        ✈
      </div>
    );
  }

  return (
    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-black border-2 border-neutral-700 p-2 rounded-xl flex items-center justify-center shrink-0 shadow-md">
      <canvas
        ref={canvasRef}
        className="w-12 h-12 sm:w-16 sm:h-16 [image-rendering:pixelated] [image-rendering:crisp-edges]"
      />
    </div>
  );
}

// ─── Componente Célula Split-Flap Monocromático ──────────────────────────────

function SplitFlapChar({ char }: { char: string }) {
  const [displayChar, setDisplayChar] = useState(char || " ");
  const [isFlipping, setIsFlipping] = useState(false);
  const prevCharRef = useRef(char);

  useEffect(() => {
    if (char !== prevCharRef.current) {
      prevCharRef.current = char;
      setIsFlipping(true);
      tocarSomPalheta();
      const timer = setTimeout(() => {
        setDisplayChar(char || " ");
        setIsFlipping(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [char]);

  return (
    <div className="w-7 h-11 text-xl sm:w-10 sm:h-15 sm:text-3xl md:w-12 md:h-17 md:text-4xl font-bold font-mono text-white bg-[#121212] rounded-[2px] mx-[1.5px] sm:mx-[2px] relative inline-flex items-center justify-center select-none shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_2px_4px_rgba(0,0,0,0.9)] border border-[#262626] shrink-0">
      <span className="absolute top-1/2 left-0 right-0 h-[1.5px] bg-[#000000] z-10 pointer-events-none" />
      <span className="absolute top-1/2 left-[-2px] w-[3px] h-[4px] bg-[#333333] rounded-[1px] -translate-y-1/2 z-20" />
      <span className="absolute top-1/2 right-[-2px] w-[3px] h-[4px] bg-[#333333] rounded-[1px] -translate-y-1/2 z-20" />

      <span className={`${isFlipping ? "animate-flap" : ""} transition-transform z-0 tracking-tighter`}>
        {displayChar === " " ? "\u00A0" : displayChar}
      </span>
    </div>
  );
}

function SplitFlapWord({ text, length, align = "center" }: { text: string; length: number; align?: "left" | "right" | "center" }) {
  const safe = (text || "").toUpperCase().trim().slice(0, length);
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
        <SplitFlapChar key={i} char={c} />
      ))}
    </div>
  );
}

// ─── Componente Principal ─────────────────────────────────────────────────────

export default function PainelMonocromaticoPixel() {
  const [vooAtual, setVooAtual] = useState<EstadoVoo | null>(null);
  const [meteorologia, setMeteorologia] = useState<DadosMeteo | null>(null);
  const [carregando, setCarregando] = useState(true);

  const ativarAudioContext = () => {
    if (!globalAudioCtx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      globalAudioCtx = new AudioCtxClass();
    }
    if (globalAudioCtx.state === "suspended") {
      globalAudioCtx.resume();
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
      // Ignorar
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    buscarDados();
    const int = setInterval(buscarDados, INTERVALO_MS);
    return () => clearInterval(int);
  }, [buscarDados]);

  const infoVoo = vooAtual
    ? resolverVooInfo(vooAtual[1], vooAtual[2], vooAtual[7], vooAtual[11])
    : null;

  return (
    <main
      onClick={ativarAudioContext}
      className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 sm:p-8 select-none font-mono cursor-pointer"
    >
      <div className="flex flex-col items-center justify-center gap-10 sm:gap-14 w-full max-w-3xl">

        {/* ── SE ACABOU DE CARREGAR ───────────────────────────────────────── */}
        {carregando && (
          <div className="py-12 flex flex-col items-center gap-4">
            <SplitFlapWord text="PROCURANDO" length={10} />
          </div>
        )}

        {/* ── EXIBIÇÃO MONOCROMÁTICA DO VOO COM LOGÓTIPO PIXEL ART ────────── */}
        {!carregando && vooAtual && infoVoo && (
          <div className="flex flex-col items-center justify-center gap-10 sm:gap-14 w-full">
            
            {/* 1. Logótipo Pixel Art + Número do Voo */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-5 sm:gap-7">
              <PixelLogo iata={infoVoo.iata} />
              <SplitFlapWord text={infoVoo.numeroVoo} length={9} align="center" />
            </div>

            {/* 2. Origem */}
            <div className="flex flex-col items-center justify-center gap-2.5 w-full">
              <span className="text-[10px] sm:text-xs uppercase tracking-[0.35em] text-neutral-500 font-bold">
                ORIGEM
              </span>
              <SplitFlapWord text={infoVoo.origem} length={10} align="center" />
            </div>

            {/* 3. Destino */}
            <div className="flex flex-col items-center justify-center gap-2.5 w-full">
              <span className="text-[10px] sm:text-xs uppercase tracking-[0.35em] text-neutral-500 font-bold">
                DESTINO
              </span>
              <SplitFlapWord text={infoVoo.destino} length={10} align="center" />
            </div>

          </div>
        )}

        {/* ── MODO METEOROLOGIA MONOCROMÁTICO (SEM VOOS) ─────────────────── */}
        {!carregando && !vooAtual && (
          <div className="flex flex-col items-center justify-center gap-10 sm:gap-14 w-full">
            <PixelLogo iata={null} />

            <SplitFlapWord text="METEOROL" length={9} align="center" />

            <div className="flex flex-col items-center justify-center gap-2.5 w-full">
              <span className="text-[10px] sm:text-xs uppercase tracking-[0.35em] text-neutral-500 font-bold">
                ORIGEM
              </span>
              <SplitFlapWord
                text={meteorologia?.name?.toUpperCase() || "VALADARES"}
                length={10}
                align="center"
              />
            </div>

            <div className="flex flex-col items-center justify-center gap-2.5 w-full">
              <span className="text-[10px] sm:text-xs uppercase tracking-[0.35em] text-neutral-500 font-bold">
                DESTINO
              </span>
              <SplitFlapWord
                text={`${Math.round(meteorologia?.main?.temp ?? 18)} C`}
                length={10}
                align="center"
              />
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
