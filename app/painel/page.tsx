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
  imagemUrl: string;
}

const INTERVALO_MS = 25_000;

// ─── Imagens de Aeronaves/Pinturas para o Estilo Flight Wall ─────────────────

const IMAGENS_AERONAVES: Record<string, string> = {
  TAP: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=1200&auto=format&fit=crop",
  RYR: "https://images.unsplash.com/photo-1520437358207-323b43b50729?q=80&w=1200&auto=format&fit=crop",
  EJU: "https://images.unsplash.com/photo-1556388158-158ea5ccacbd?q=80&w=1200&auto=format&fit=crop",
  EZY: "https://images.unsplash.com/photo-1556388158-158ea5ccacbd?q=80&w=1200&auto=format&fit=crop",
  EZS: "https://images.unsplash.com/photo-1556388158-158ea5ccacbd?q=80&w=1200&auto=format&fit=crop",
  DLH: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=1200&auto=format&fit=crop",
  KLM: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=1200&auto=format&fit=crop",
  BAW: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=1200&auto=format&fit=crop",
  PADRAO: "https://images.unsplash.com/photo-1506012787146-f92b2d7d6d96?q=80&w=1200&auto=format&fit=crop",
};

// ─── Dicionário de Companhias Aéreas Flight Wall ──────────────────────────────

const COMPANHIAS: Record<string, InfoCompanhia> = {
  TAP: { nome: "TAP Air Portugal", iata: "TP", origem: "Porto", destino: "Lisboa", origemCode: "OPO", destinoCode: "LIS", aeronave: "Airbus A320-251N", imagemUrl: IMAGENS_AERONAVES.TAP },
  RYR: { nome: "Ryanair", iata: "FR", origem: "Porto", destino: "Madrid", origemCode: "OPO", destinoCode: "MAD", aeronave: "Boeing 737-800", imagemUrl: IMAGENS_AERONAVES.RYR },
  EJU: { nome: "easyJet Europe", iata: "U2", origem: "Porto", destino: "Paris", origemCode: "OPO", destinoCode: "CDG", aeronave: "Airbus A320-214", imagemUrl: IMAGENS_AERONAVES.EJU },
  EZY: { nome: "easyJet UK", iata: "U2", origem: "Londres", destino: "Porto", origemCode: "LGW", destinoCode: "OPO", aeronave: "Airbus A320-214", imagemUrl: IMAGENS_AERONAVES.EZY },
  EZS: { nome: "easyJet Switzerland", iata: "U2", origem: "Zurique", destino: "Porto", origemCode: "ZRH", destinoCode: "OPO", aeronave: "Airbus A320-214", imagemUrl: IMAGENS_AERONAVES.EZS },
  TVF: { nome: "Transavia France", iata: "TO", origem: "Paris", destino: "Porto", origemCode: "ORY", destinoCode: "OPO", aeronave: "Boeing 737-800", imagemUrl: IMAGENS_AERONAVES.PADRAO },
  TRA: { nome: "Transavia", iata: "HV", origem: "Amsterdão", destino: "Porto", origemCode: "AMS", destinoCode: "OPO", aeronave: "Boeing 737-800", imagemUrl: IMAGENS_AERONAVES.PADRAO },
  LGL: { nome: "Luxair", iata: "LG", origem: "Luxemburgo", destino: "Porto", origemCode: "LUX", destinoCode: "OPO", aeronave: "De Havilland Dash 8", imagemUrl: IMAGENS_AERONAVES.PADRAO },
  NOZ: { nome: "Norwegian", iata: "DY", origem: "Oslo", destino: "Porto", origemCode: "OSL", destinoCode: "OPO", aeronave: "Boeing 737 MAX 8", imagemUrl: IMAGENS_AERONAVES.PADRAO },
  DLH: { nome: "Lufthansa", iata: "LH", origem: "Frankfurt", destino: "Porto", origemCode: "FRA", destinoCode: "OPO", aeronave: "Airbus A321-271NX", imagemUrl: IMAGENS_AERONAVES.DLH },
  VLG: { nome: "Vueling", iata: "VY", origem: "Barcelona", destino: "Porto", origemCode: "BCN", destinoCode: "OPO", aeronave: "Airbus A320-232", imagemUrl: IMAGENS_AERONAVES.PADRAO },
  IBE: { nome: "Iberia", iata: "IB", origem: "Madrid", destino: "Porto", origemCode: "MAD", destinoCode: "OPO", aeronave: "Airbus A320-200", imagemUrl: IMAGENS_AERONAVES.PADRAO },
  SWR: { nome: "Swiss Air Lines", iata: "LX", origem: "Zurique", destino: "Porto", origemCode: "ZRH", destinoCode: "OPO", aeronave: "Airbus A220-300", imagemUrl: IMAGENS_AERONAVES.PADRAO },
  KLM: { nome: "KLM Royal Dutch", iata: "KL", origem: "Amsterdão", destino: "Porto", origemCode: "AMS", destinoCode: "OPO", aeronave: "Boeing 737-800", imagemUrl: IMAGENS_AERONAVES.KLM },
  BAW: { nome: "British Airways", iata: "BA", origem: "Londres", destino: "Porto", origemCode: "LHR", destinoCode: "OPO", aeronave: "Airbus A320-232", imagemUrl: IMAGENS_AERONAVES.BAW },
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
  let origem = info?.origem || paisUpper || "Internacional";
  let destino = info?.destino || "Porto";
  let origemCode = info?.origemCode || "ORG";
  let destinoCode = info?.destinoCode || "OPO";

  const vRate = voo[11];
  if (vRate != null) {
    if (vRate < -0.5) {
      destino = "Porto";
      destinoCode = "OPO";
    } else if (vRate > 0.5) {
      origem = "Porto";
      origemCode = "OPO";
    }
  }

  const altitudeMetros = voo[7] != null ? Math.round(voo[7]) : 0;
  const altitudePes = Math.round(altitudeMetros * 3.28084);
  const velocidadeKmh = voo[9] != null ? Math.round(voo[9] * 3.6) : 0;
  const velocidadeKts = voo[9] != null ? Math.round(voo[9] * 1.94384) : 0;
  const rumo = voo[10] != null ? Math.round(voo[10]) : 0;

  return {
    callsign: cs,
    numeroVoo,
    nomeCompanhia: info?.nome || (voo[2] ? `Companhia (${voo[2]})` : "Companhia Aérea"),
    aeronave: info?.aeronave || "Airbus A320 Comercial",
    imagemUrl: info?.imagemUrl || IMAGENS_AERONAVES.PADRAO,
    iata,
    origem,
    origemCode,
    destino,
    destinoCode,
    altitudeMetros,
    altitudePes,
    velocidadeKmh,
    velocidadeKts,
    rumo,
    noSolo: voo[8],
  };
}

// ─── Sintetizador de Som ──────────────────────────────────────────────────────

let globalAudioCtx: AudioContext | null = null;

function tocarSomChime() {
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
    const osc = globalAudioCtx.createOscillator();
    const gain = globalAudioCtx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(523.25, now); // C5
    osc.frequency.setValueAtTime(659.25, now + 0.08); // E5

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(globalAudioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.25);
  } catch {
    // Ignorar
  }
}

// ─── Componente Estilo The Flight Wall (Smart Display) ───────────────────────

export default function TheFlightWall() {
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
    tocarSomChime();
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
  });

  return (
    <main
      onClick={ativarAudio}
      className="min-h-screen bg-[#07080a] text-neutral-100 flex flex-col items-center justify-center p-3 sm:p-6 select-none font-sans cursor-pointer relative overflow-hidden"
    >
      {/* Moldura / Quadro Físico 'The Flight Wall' */}
      <div className="w-full max-w-sm sm:max-w-md md:max-w-lg bg-[#0e1015] border-[10px] border-[#181a20] rounded-[2.5rem] p-5 sm:p-7 shadow-[0_40px_100px_rgba(0,0,0,0.95),inset_0_2px_8px_rgba(255,255,255,0.05)] relative z-10 flex flex-col items-center">
        
        {/* Placa de Identificação do Quadro */}
        <header className="w-full flex items-center justify-between pb-4 border-b border-white/10 mb-5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-neutral-400">
              The Flight Wall
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-bold text-neutral-300">
              {horaStr}
            </span>
            <button
              onClick={toggleSom}
              className={`p-1.5 rounded-full text-xs transition-all ${
                somAtivo ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40" : "bg-neutral-800 text-neutral-400"
              }`}
            >
              {somAtivo ? "🔊" : "🔇"}
            </button>
          </div>
        </header>

        {/* ── ESTADO A CARREGAR ───────────────────────────────────────────── */}
        {carregando && (
          <div className="py-20 flex flex-col items-center gap-4 text-center">
            <div className="w-12 h-12 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs tracking-widest text-neutral-400 uppercase font-mono">
              Detectando Tráfego Aéreo...
            </span>
          </div>
        )}

        {/* ── DESIGN FLIGHT WALL (AERONAVE EM TEMPO REAL) ────────────────── */}
        {!carregando && vooAtual && infoVoo && (
          <div className="w-full flex flex-col items-center gap-5">
            
            {/* 1. Imagem de Alta Fidelidade do Avião / Livery Card */}
            <div className="w-full h-48 sm:h-56 rounded-2xl relative overflow-hidden shadow-2xl border border-white/10 group">
              <Image
                src={infoVoo.imagemUrl}
                alt={infoVoo.aeronave}
                fill
                className="object-cover transition-transform duration-1000 group-hover:scale-105"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

              {/* Logótipo Sobreposto no Canto Superior Esquerdo */}
              {infoVoo.iata && (
                <div className="absolute top-3 left-3 w-12 h-12 bg-white/95 backdrop-blur-md p-1.5 rounded-xl shadow-lg border border-white/40 flex items-center justify-center">
                  <Image
                    src={`https://pics.avs.io/200/200/${infoVoo.iata}.png`}
                    alt={infoVoo.nomeCompanhia}
                    width={48}
                    height={48}
                    className="object-contain max-h-full"
                    unoptimized
                  />
                </div>
              )}

              {/* Número do Voo e Aeronave no Canto Inferior */}
              <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between text-white">
                <div className="flex flex-col">
                  <span className="text-3xl font-black font-mono tracking-tight drop-shadow-md">
                    {infoVoo.numeroVoo}
                  </span>
                  <span className="text-xs text-neutral-300 font-medium">
                    {infoVoo.nomeCompanhia}
                  </span>
                </div>

                {/* Tag do Modelo */}
                <span className="bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] font-mono border border-white/20 text-neutral-300">
                  {infoVoo.aeronave}
                </span>
              </div>
            </div>

            {/* 2. Seção de Rota Origem ➔ Destino (flightwall.com style) */}
            <div className="w-full bg-[#141720] p-5 rounded-2xl border border-white/5 flex items-center justify-between relative shadow-inner">
              
              {/* Origem */}
              <div className="flex flex-col items-start">
                <span className="text-3xl font-black font-mono tracking-tight text-white">
                  {infoVoo.origemCode}
                </span>
                <span className="text-xs text-neutral-400 font-medium truncate max-w-[110px]">
                  {infoVoo.origem}
                </span>
              </div>

              {/* Seta de Rota Animada */}
              <div className="flex flex-col items-center px-2">
                <span className="text-[10px] font-mono text-sky-400 font-bold uppercase tracking-wider mb-1">
                  {infoVoo.noSolo ? "NO SOLO" : "EM VOO"}
                </span>
                <div className="w-20 sm:w-28 h-0.5 bg-gradient-to-r from-sky-500/20 via-sky-400 to-sky-500/20 relative">
                  <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-sky-400 text-base">
                    ✈
                  </span>
                </div>
              </div>

              {/* Destino */}
              <div className="flex flex-col items-end">
                <span className="text-3xl font-black font-mono tracking-tight text-white">
                  {infoVoo.destinoCode}
                </span>
                <span className="text-xs text-neutral-400 font-medium truncate max-w-[110px]">
                  {infoVoo.destino}
                </span>
              </div>
            </div>

            {/* 3. Barra de Métricas e Telemetria de Voo */}
            <div className="w-full grid grid-cols-3 gap-2.5">
              
              {/* Altitude */}
              <div className="bg-[#141720] p-3 rounded-xl border border-white/5 flex flex-col items-center text-center">
                <span className="text-[9px] uppercase tracking-wider font-bold text-neutral-400 mb-0.5">
                  ALTITUDE
                </span>
                <span className="text-sm font-bold font-mono text-white">
                  {infoVoo.altitudePes.toLocaleString("pt-PT")}
                </span>
                <span className="text-[9px] text-neutral-500 font-mono">FT</span>
              </div>

              {/* Velocidade */}
              <div className="bg-[#141720] p-3 rounded-xl border border-white/5 flex flex-col items-center text-center">
                <span className="text-[9px] uppercase tracking-wider font-bold text-neutral-400 mb-0.5">
                  VELOCIDADE
                </span>
                <span className="text-sm font-bold font-mono text-white">
                  {infoVoo.velocidadeKts}
                </span>
                <span className="text-[9px] text-neutral-500 font-mono">KTS</span>
              </div>

              {/* Bússola Rumo */}
              <div className="bg-[#141720] p-3 rounded-xl border border-white/5 flex flex-col items-center text-center">
                <span className="text-[9px] uppercase tracking-wider font-bold text-neutral-400 mb-0.5">
                  RUMO
                </span>
                <div className="flex items-center gap-1">
                  <span
                    className="inline-block text-xs text-sky-400"
                    style={{ transform: `rotate(${infoVoo.rumo - 45}deg)` }}
                  >
                    ✈
                  </span>
                  <span className="text-sm font-bold font-mono text-white">
                    {infoVoo.rumo}°
                  </span>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ── MODO METEOROLOGIA (SEM VOOS) ───────────────────────────────── */}
        {!carregando && !vooAtual && (
          <div className="w-full flex flex-col items-center gap-5 py-6">
            <div className="w-20 h-20 bg-sky-500/10 border border-sky-500/20 rounded-2xl flex items-center justify-center text-4xl shadow-inner">
              🌤️
            </div>

            <div className="flex flex-col items-center text-center">
              <span className="text-xs uppercase tracking-widest text-sky-400 font-bold mb-1">
                Espaço Aéreo Livre
              </span>
              <span className="text-2xl font-bold font-mono text-white">
                {meteorologia?.name?.toUpperCase() || "VALADARES"}
              </span>
            </div>

            <div className="w-full grid grid-cols-2 gap-3 mt-2">
              <div className="bg-[#141720] p-4 rounded-xl border border-white/5 flex flex-col items-center">
                <span className="text-[10px] uppercase tracking-wider font-bold text-neutral-400 mb-1">
                  TEMPERATURA
                </span>
                <span className="text-2xl font-black font-mono text-amber-400">
                  {Math.round(meteorologia?.main?.temp ?? 18)}°C
                </span>
              </div>

              <div className="bg-[#141720] p-4 rounded-xl border border-white/5 flex flex-col items-center">
                <span className="text-[10px] uppercase tracking-wider font-bold text-neutral-400 mb-1">
                  ESTADO
                </span>
                <span className="text-xs font-bold font-mono text-emerald-400 uppercase text-center mt-1">
                  {meteorologia?.weather?.[0]?.description || "CÉU LIMPO"}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Rodapé The Flight Wall */}
        <footer className="w-full mt-5 pt-3 border-t border-white/10 flex items-center justify-between text-[10px] text-neutral-500 uppercase tracking-widest font-mono">
          <span>The Flight Wall Display</span>
          <span>Porto · Valadares</span>
        </footer>

      </div>
    </main>
  );
}
