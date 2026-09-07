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
  origemCode: string;
  destinoCode: string;
  modeloPadrao: string;
}

const INTERVALO_MS = 25_000;

// ─── Dicionário de Companhias Aéreas e Aeronaves ──────────────────────────────

const COMPANHIAS: Record<string, InfoCompanhia> = {
  TAP: { nome: "TAP Air Portugal", iata: "TP", origemPadrao: "Porto", destinoPadrao: "Lisboa", origemCode: "OPO", destinoCode: "LIS", modeloPadrao: "Airbus A320neo" },
  RYR: { nome: "Ryanair", iata: "FR", origemPadrao: "Porto", destinoPadrao: "Madrid", origemCode: "OPO", destinoCode: "MAD", modeloPadrao: "Boeing 737-800" },
  EJU: { nome: "easyJet Europe", iata: "U2", origemPadrao: "Porto", destinoPadrao: "Paris", origemCode: "OPO", destinoCode: "CDG", modeloPadrao: "Airbus A320" },
  EZY: { nome: "easyJet UK", iata: "U2", origemPadrao: "Londres", destinoPadrao: "Porto", origemCode: "LGW", destinoCode: "OPO", modeloPadrao: "Airbus A320" },
  EZS: { nome: "easyJet Switzerland", iata: "U2", origemPadrao: "Zurique", destinoPadrao: "Porto", origemCode: "ZRH", destinoCode: "OPO", modeloPadrao: "Airbus A320" },
  TVF: { nome: "Transavia France", iata: "TO", origemPadrao: "Paris", destinoPadrao: "Porto", origemCode: "ORY", destinoCode: "OPO", modeloPadrao: "Boeing 737-800" },
  TRA: { nome: "Transavia", iata: "HV", origemPadrao: "Amsterdão", destinoPadrao: "Porto", origemCode: "AMS", destinoCode: "OPO", modeloPadrao: "Boeing 737-800" },
  LGL: { nome: "Luxair", iata: "LG", origemPadrao: "Luxemburgo", destinoPadrao: "Porto", origemCode: "LUX", destinoCode: "OPO", modeloPadrao: "De Havilland Dash 8" },
  NOZ: { nome: "Norwegian", iata: "DY", origemPadrao: "Oslo", destinoPadrao: "Porto", origemCode: "OSL", destinoCode: "OPO", modeloPadrao: "Boeing 737 MAX 8" },
  NAX: { nome: "Norwegian Air", iata: "DY", origemPadrao: "Oslo", destinoPadrao: "Porto", origemCode: "OSL", destinoCode: "OPO", modeloPadrao: "Boeing 737-800" },
  DLH: { nome: "Lufthansa", iata: "LH", origemPadrao: "Frankfurt", destinoPadrao: "Porto", origemCode: "FRA", destinoCode: "OPO", modeloPadrao: "Airbus A321neo" },
  VLG: { nome: "Vueling", iata: "VY", origemPadrao: "Barcelona", destinoPadrao: "Porto", origemCode: "BCN", destinoCode: "OPO", modeloPadrao: "Airbus A320" },
  IBE: { nome: "Iberia", iata: "IB", origemPadrao: "Madrid", destinoPadrao: "Porto", origemCode: "MAD", destinoCode: "OPO", modeloPadrao: "Airbus A320" },
  SWR: { nome: "Swiss Air Lines", iata: "LX", origemPadrao: "Zurique", destinoPadrao: "Porto", origemCode: "ZRH", destinoCode: "OPO", modeloPadrao: "Airbus A220-300" },
  KLM: { nome: "KLM Royal Dutch", iata: "KL", origemPadrao: "Amsterdão", destinoPadrao: "Porto", origemCode: "AMS", destinoCode: "OPO", modeloPadrao: "Boeing 737-800" },
  BAW: { nome: "British Airways", iata: "BA", origemPadrao: "Londres", destinoPadrao: "Porto", origemCode: "LHR", destinoCode: "OPO", modeloPadrao: "Airbus A320" },
  AFR: { nome: "Air France", iata: "AF", origemPadrao: "Paris", destinoPadrao: "Porto", origemCode: "CDG", destinoCode: "OPO", modeloPadrao: "Airbus A318" },
  WZZ: { nome: "Wizz Air", iata: "W6", origemPadrao: "Budapeste", destinoPadrao: "Porto", origemCode: "BUD", destinoCode: "OPO", modeloPadrao: "Airbus A321neo" },
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
  let origem = info?.origemPadrao || paisUpper || "Internacional";
  let destino = info?.destinoPadrao || "Porto";
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
    modeloAeronave: info?.modeloPadrao || "Aeronave Comercial",
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

// ─── Sintetizador de Som Mecânico/Digital ─────────────────────────────────────

let globalAudioCtx: AudioContext | null = null;

function tocarSomBeep() {
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
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(440, now + 0.05);

    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(globalAudioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.05);
  } catch {
    // Ignorar
  }
}

// ─── Componente Principal Flight Wall Mobile ──────────────────────────────────

export default function FlightWallMobile() {
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
    tocarSomBeep();
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
      className="min-h-screen bg-[#08090c] text-neutral-100 flex flex-col items-center justify-center p-4 sm:p-6 select-none font-sans cursor-pointer relative overflow-hidden"
    >
      {/* Luz ambiente de fundo inspirada em painel inteligente */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* ── CARTÃO FLIGHT WALL (OPTIMIZADO PARA MÓVEL / SMART DISPLAY) ──────── */}
      <div className="w-full max-w-sm sm:max-w-md bg-[#101218]/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-8 flex flex-col items-center shadow-[0_30px_90px_rgba(0,0,0,0.9)] relative z-10">
        
        {/* Cabeçalho do Cartão */}
        <header className="w-full flex items-center justify-between pb-4 border-b border-white/10 mb-6">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            <span className="text-xs uppercase tracking-widest font-semibold text-neutral-400">
              Valadares Airspace
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-bold text-neutral-300">
              {horaStr}
            </span>
            <button
              onClick={toggleSom}
              className={`p-1.5 rounded-full transition-colors ${
                somAtivo ? "bg-emerald-500/20 text-emerald-400" : "bg-neutral-800 text-neutral-400"
              }`}
            >
              {somAtivo ? "🔊" : "🔇"}
            </button>
          </div>
        </header>

        {/* ── ESTADO A CARREGAR ───────────────────────────────────────────── */}
        {carregando && (
          <div className="py-16 flex flex-col items-center gap-4 text-center">
            <div className="w-12 h-12 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm tracking-widest text-neutral-400 uppercase">
              Sintonizando Radares...
            </span>
          </div>
        )}

        {/* ── EXIBIÇÃO THE FLIGHT WALL (VOO DETECTADO) ───────────────────── */}
        {!carregando && vooAtual && infoVoo && (
          <div className="w-full flex flex-col items-center gap-6">
            
            {/* 1. Logótipo e Cartão do Voo */}
            <div className="w-full bg-[#161922] p-5 rounded-2xl border border-white/5 flex items-center justify-between shadow-inner">
              <div className="flex items-center gap-4">
                {infoVoo.iata ? (
                  <div className="w-14 h-14 bg-white p-2 rounded-xl flex items-center justify-center shrink-0 shadow-md">
                    <Image
                      src={`https://pics.avs.io/200/200/${infoVoo.iata}.png`}
                      alt={infoVoo.nomeCompanhia}
                      width={56}
                      height={56}
                      className="object-contain max-h-full"
                      unoptimized
                    />
                  </div>
                ) : (
                  <div className="w-14 h-14 bg-sky-500/20 text-sky-400 rounded-xl flex items-center justify-center text-2xl font-bold shrink-0">
                    ✈
                  </div>
                )}

                <div className="flex flex-col">
                  <span className="text-2xl font-black font-mono tracking-tight text-white">
                    {infoVoo.numeroVoo}
                  </span>
                  <span className="text-xs text-neutral-400 font-medium truncate max-w-[160px]">
                    {infoVoo.nomeCompanhia}
                  </span>
                </div>
              </div>

              {/* Indicador de Rumo / Avião Rodado */}
              <div className="flex flex-col items-center">
                <div
                  className="w-10 h-10 bg-sky-500/10 border border-sky-500/30 rounded-full flex items-center justify-center text-sky-400 text-lg transition-transform duration-700 shadow-md"
                  style={{ transform: `rotate(${infoVoo.rumo - 45}deg)` }}
                >
                  ✈
                </div>
                <span className="text-[10px] font-mono text-neutral-400 mt-1">
                  {infoVoo.rumo}°
                </span>
              </div>
            </div>

            {/* 2. Rota Principal Origem ➔ Destino (Grandes Códigos IATA & Cidades) */}
            <div className="w-full bg-[#161922] p-6 rounded-2xl border border-white/5 flex items-center justify-between relative overflow-hidden">
              
              {/* Origem */}
              <div className="flex flex-col items-start">
                <span className="text-3xl font-black font-mono tracking-tight text-white">
                  {infoVoo.origemCode}
                </span>
                <span className="text-xs text-neutral-400 font-medium max-w-[100px] truncate">
                  {infoVoo.origem}
                </span>
              </div>

              {/* Seta Dinâmica de Voo */}
              <div className="flex flex-col items-center px-2">
                <span className="text-xs font-mono text-sky-400 font-bold uppercase tracking-wider mb-1">
                  {infoVoo.noSolo ? "NO SOLO" : "EM VOO"}
                </span>
                <div className="w-16 sm:w-24 h-0.5 bg-gradient-to-r from-sky-500/20 via-sky-400 to-sky-500/20 relative">
                  <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-sky-400 text-sm">
                    ✈
                  </span>
                </div>
              </div>

              {/* Destino */}
              <div className="flex flex-col items-end">
                <span className="text-3xl font-black font-mono tracking-tight text-white">
                  {infoVoo.destinoCode}
                </span>
                <span className="text-xs text-neutral-400 font-medium max-w-[100px] truncate">
                  {infoVoo.destino}
                </span>
              </div>
            </div>

            {/* 3. Modelo da Aeronave */}
            <div className="w-full bg-[#13151d] py-2.5 px-4 rounded-xl border border-white/5 flex items-center justify-between text-xs">
              <span className="text-neutral-400 font-medium">Aeronave</span>
              <span className="text-neutral-200 font-bold font-mono">
                {infoVoo.modeloAeronave}
              </span>
            </div>

            {/* 4. Grelha de Telemetria (Métricas em tempo real) */}
            <div className="w-full grid grid-cols-2 gap-3">
              
              {/* Altitude */}
              <div className="bg-[#161922] p-3.5 rounded-xl border border-white/5 flex flex-col">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-neutral-400 mb-1">
                  ALTITUDE
                </span>
                <span className="text-lg font-bold font-mono text-white">
                  {infoVoo.altitudeMetros.toLocaleString("pt-PT")} <span className="text-xs font-normal text-neutral-400">m</span>
                </span>
                <span className="text-[11px] text-neutral-500 font-mono">
                  {infoVoo.altitudePes.toLocaleString("pt-PT")} ft
                </span>
              </div>

              {/* Velocidade */}
              <div className="bg-[#161922] p-3.5 rounded-xl border border-white/5 flex flex-col">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-neutral-400 mb-1">
                  VELOCIDADE
                </span>
                <span className="text-lg font-bold font-mono text-white">
                  {infoVoo.velocidadeKmh} <span className="text-xs font-normal text-neutral-400">km/h</span>
                </span>
                <span className="text-[11px] text-neutral-500 font-mono">
                  {infoVoo.velocidadeKts} kts
                </span>
              </div>

            </div>

          </div>
        )}

        {/* ── MODO METEOROLOGIA (SEM VOOS) ───────────────────────────────── */}
        {!carregando && !vooAtual && (
          <div className="w-full flex flex-col items-center gap-6 py-4">
            
            {/* Ícone Meteo */}
            <div className="w-20 h-20 bg-sky-500/10 border border-sky-500/20 rounded-full flex items-center justify-center text-4xl shadow-inner">
              ☁️
            </div>

            <div className="flex flex-col items-center text-center">
              <span className="text-xs uppercase tracking-widest text-sky-400 font-bold mb-1">
                Sem Tráfego Aéreo Directo
              </span>
              <span className="text-2xl font-bold font-mono text-white">
                {meteorologia?.name?.toUpperCase() || "VALADARES"}
              </span>
            </div>

            {/* Métricas Meteo */}
            <div className="w-full grid grid-cols-2 gap-3 mt-2">
              <div className="bg-[#161922] p-4 rounded-xl border border-white/5 flex flex-col items-center">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-neutral-400 mb-1">
                  TEMPERATURA
                </span>
                <span className="text-2xl font-black font-mono text-amber-400">
                  {Math.round(meteorologia?.main?.temp ?? 18)}°C
                </span>
              </div>

              <div className="bg-[#161922] p-4 rounded-xl border border-white/5 flex flex-col items-center">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-neutral-400 mb-1">
                  CONDIÇÃO
                </span>
                <span className="text-xs font-bold font-mono text-emerald-400 uppercase text-center mt-1">
                  {meteorologia?.weather?.[0]?.description || "CÉU LIMPO"}
                </span>
              </div>
            </div>

          </div>
        )}

        {/* Rodapé Mobile */}
        <footer className="w-full mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-[10px] text-neutral-500 uppercase tracking-widest">
          <span>The Flight Wall · Mobile Edition</span>
          <span>Atualização: 25s</span>
        </footer>

      </div>
    </main>
  );
}
