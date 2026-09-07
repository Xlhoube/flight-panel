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

// Mapeamento de Países para Nomes Curtos e Limpos
const PAISES_NOMES: Record<string, string> = {
  FRANCE: "FRANÇA",
  SWITZERLAND: "SUÍÇA",
  SPAIN: "ESPANHA",
  PORTUGAL: "PORTO",
  GERMANY: "ALEMANHA",
  "UNITED KINGDOM": "LONDRES",
  IRELAND: "IRLANDA",
  LUXEMBOURG: "LUXEMBURGO",
  NETHERLANDS: "AMSTERDÃO",
  AUSTRIA: "ÁUSTRIA",
  SWEDEN: "SUÉCIA",
};

function resolverVooInfo(
  callsignRaw: string | null,
  paisOrigem: string | null,
  altitude: number | null,
  vRate: number | null
) {
  const cs = (callsignRaw || "").trim().toUpperCase();
  const prefixo = cs.slice(0, 3);
  const info = COMPANHIAS[prefixo];

  let iata = info?.iata || null;
  let numeroFormatado = cs || "DESCONHECIDO";
  let nomeCompanhia = info?.nome || (paisOrigem ? `REGISTO: ${paisOrigem.toUpperCase()}` : "VOO COMERCIAL");

  if (info && cs.length > 3) {
    const resto = cs.slice(3).trim();
    numeroFormatado = `${info.iata} ${resto}`;
  }

  // País traduzido limpo
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

  // Se forem iguais, diferencia
  if (origem === destino) {
    if (origem === "PORTO") {
      destino = paisFmt !== "PORTO" ? paisFmt : "LISBOA";
    } else {
      destino = "PORTO";
    }
  }

  return {
    nomeCompanhia,
    numeroVoo: numeroFormatado,
    iata,
    origem: origem.slice(0, 9),
    destino: destino.slice(0, 9),
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

// ─── Componente Célula Split-Flap Responsivo ──────────────────────────────────

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
    <div className="flap-cell w-6 h-9 text-lg sm:w-8 sm:h-12 sm:text-2xl md:w-10 md:h-14 md:text-3xl font-bold font-mono text-amber-400 mx-[1px] sm:mx-[2px] relative inline-flex items-center justify-center select-none shadow-md shrink-0">
      <span className="flap-split-line" />
      <span className="flap-pin-left" />
      <span className="flap-pin-right" />
      <span className={isFlipping ? "animate-flap" : ""}>
        {displayChar === " " ? "\u00A0" : displayChar}
      </span>
    </div>
  );
}

function SplitFlapWord({ text, length = 8, align = "center", somAtivo }: { text: string; length?: number; align?: "left" | "right" | "center"; somAtivo: boolean }) {
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
    <div className="inline-flex items-center justify-center max-w-full">
      {padded.split("").map((c, i) => (
        <SplitFlapChar key={i} char={c} somAtivo={somAtivo} />
      ))}
    </div>
  );
}

// ─── Componente Principal ─────────────────────────────────────────────────────

export default function PainelMinimalista() {
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
      // Ignorar erros na UI
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

  const horaStr = horaAtual.toLocaleTimeString("pt-PT", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <main
      onClick={ativarAudio}
      className="min-h-screen bg-[#040406] text-neutral-100 flex flex-col items-center justify-center p-3 sm:p-6 select-none relative cursor-pointer font-mono"
    >
      
      {/* ── MOLDURA PRINCIPAL SOLARI ─────────────────────────────────────── */}
      <div className="w-full max-w-4xl bg-[#090b0f] rounded-2xl border border-[#1b1f2b] shadow-[0_30px_70px_rgba(0,0,0,0.95)] p-4 sm:p-8 flex flex-col items-center relative overflow-hidden">
        
        {/* Cabeçalho */}
        <header className="w-full flex items-center justify-between border-b border-[#161a24] pb-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 indicator-lamp" />
            <span className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-neutral-400 font-bold">
              RADAR VALADARES · MONITORIZAÇÃO AÉREA
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs sm:text-sm font-bold tracking-wider text-amber-400/90">
              {horaStr}
            </span>
            <button
              onClick={toggleSom}
              className={`px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider transition-all ${
                somAtivo
                  ? "bg-amber-500/20 border-amber-500 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.25)]"
                  : "bg-[#12151e] border-[#252936] text-neutral-400 hover:text-neutral-200"
              }`}
            >
              {somAtivo ? "🔊 SOM" : "🔇 SOM"}
            </button>
          </div>
        </header>

        {/* ── SE ACABOU DE CARREGAR ───────────────────────────────────────── */}
        {carregando && (
          <div className="py-12 flex flex-col items-center gap-4">
            <SplitFlapWord text="PROCURANDO" length={10} somAtivo={somAtivo} />
          </div>
        )}

        {/* ── EXIBIÇÃO DO VOO ─────────────────────────────────────────────── */}
        {!carregando && vooAtual && infoVoo && (
          <div className="flex flex-col items-center gap-6 sm:gap-10 w-full py-2">
            
            {/* Bloco 1: Companhia + Logótipo + Voo */}
            <div className="flex flex-col items-center gap-3">
              <span className="text-[11px] sm:text-xs uppercase tracking-[0.3em] text-amber-400/80 font-bold">
                {infoVoo.nomeCompanhia}
              </span>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
                {/* Logótipo em Cartão */}
                {infoVoo.iata ? (
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white p-2 rounded-2xl shadow-lg border border-white/20 flex items-center justify-center shrink-0">
                    <Image
                      src={`https://pics.avs.io/200/200/${infoVoo.iata}.png`}
                      alt={infoVoo.numeroVoo}
                      width={76}
                      height={76}
                      className="object-contain max-h-full"
                      unoptimized
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#141720] border border-[#272b38] rounded-2xl flex items-center justify-center text-amber-400 text-3xl shrink-0 shadow-inner">
                    ✈
                  </div>
                )}

                {/* Número do Voo (8 Palhetas) */}
                <SplitFlapWord
                  text={infoVoo.numeroVoo}
                  length={8}
                  align="center"
                  somAtivo={somAtivo}
                />
              </div>
            </div>

            {/* Linha Divisória */}
            <div className="w-full h-px bg-gradient-to-r from-transparent via-[#1f2431] to-transparent my-1" />

            {/* Bloco 2: Origem ➔ Destino */}
            <div className="flex flex-col items-center gap-3 w-full">
              <span className="text-[10px] sm:text-xs uppercase tracking-[0.3em] text-neutral-400 font-bold">
                ROTA DA AERONAVE
              </span>

              <div className="flex flex-col md:flex-row items-center justify-center gap-4 sm:gap-8 w-full">
                {/* Origem (8 Palhetas) */}
                <div className="flex flex-col items-center gap-1">
                  <span className="text-[9px] uppercase tracking-widest text-neutral-400">ORIGEM</span>
                  <SplitFlapWord
                    text={infoVoo.origem}
                    length={8}
                    align="center"
                    somAtivo={somAtivo}
                  />
                </div>

                {/* Ícone de Avião */}
                <div className="text-amber-400 text-2xl sm:text-3xl font-bold px-2 my-1 md:my-0 animate-pulse">
                  ✈
                </div>

                {/* Destino (8 Palhetas) */}
                <div className="flex flex-col items-center gap-1">
                  <span className="text-[9px] uppercase tracking-widest text-neutral-400">DESTINO</span>
                  <SplitFlapWord
                    text={infoVoo.destino}
                    length={8}
                    align="center"
                    somAtivo={somAtivo}
                  />
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ── MODO METEOROLOGIA MINIMALISTA ─────────────────────────────── */}
        {!carregando && !vooAtual && (
          <div className="flex flex-col items-center justify-center gap-6 w-full py-8">
            <span className="text-[10px] sm:text-xs uppercase tracking-[0.3em] text-neutral-400 font-bold">
              SEM TRÁFEGO AÉREO DIRECTO · METEOROLOGIA LOCAL
            </span>

            {/* Localidade */}
            <SplitFlapWord
              text={meteorologia?.name?.toUpperCase() || "VALADARES"}
              length={9}
              align="center"
              somAtivo={somAtivo}
            />

            {/* Temperatura e Descrição */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <SplitFlapWord
                text={`${Math.round(meteorologia?.main?.temp ?? 18)} C`}
                length={5}
                align="center"
                somAtivo={somAtivo}
              />

              <SplitFlapWord
                text={meteorologia?.weather?.[0]?.description.toUpperCase() || "CEU LIMPO"}
                length={10}
                align="center"
                somAtivo={somAtivo}
              />
            </div>
          </div>
        )}

        {/* Rodapé */}
        <footer className="w-full border-t border-[#161a24] pt-4 mt-4 flex items-center justify-between text-[10px] uppercase tracking-widest text-neutral-400">
          <span>VALADARES · PORTO</span>
          <span>ACTUALIZADO A CADA 25S</span>
        </footer>

      </div>
    </main>
  );
}
