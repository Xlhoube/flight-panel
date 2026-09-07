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
  main: { temp: number; humidity: number; pressure?: number };
  wind: { speed: number; deg?: number };
  name: string;
}

const INTERVALO_MS = 25_000;

// ─── Utilitário de Áudio Mecânico (Procedural Web Audio API) ──────────────────

function reproduzirSomFlap(ctx: AudioContext | null) {
  if (!ctx || ctx.state !== "running") return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(140 + Math.random() * 40, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.04);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(1200, ctx.currentTime);

    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.035);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.04);
  } catch {
    // Ignorar erros de áudio silenciosamente
  }
}

// ─── Componente Célula Split-Flap ─────────────────────────────────────────────

interface SplitFlapCharProps {
  char: string;
  size?: "sm" | "md" | "lg";
  color?: "yellow" | "white" | "green" | "amber" | "red";
  audioContextRef?: React.RefObject<AudioContext | null>;
  somAtivo?: boolean;
}

function SplitFlapChar({
  char,
  size = "md",
  color = "yellow",
  audioContextRef,
  somAtivo = false,
}: SplitFlapCharProps) {
  const [displayChar, setDisplayChar] = useState(char || " ");
  const [isFlipping, setIsFlipping] = useState(false);
  const prevCharRef = useRef(char);

  useEffect(() => {
    if (char !== prevCharRef.current) {
      prevCharRef.current = char;
      setIsFlipping(true);
      if (somAtivo && audioContextRef?.current) {
        reproduzirSomFlap(audioContextRef.current);
      }
      const timer = setTimeout(() => {
        setDisplayChar(char || " ");
        setIsFlipping(false);
      }, 110);
      return () => clearTimeout(timer);
    }
  }, [char, somAtivo, audioContextRef]);

  const sizeClasses = {
    sm: "w-5 h-7 text-xs",
    md: "w-6 h-9 text-sm sm:w-7 sm:h-10 sm:text-base",
    lg: "w-8 h-12 text-xl sm:w-10 sm:h-14 sm:text-2xl font-bold",
  }[size];

  const colorClasses = {
    yellow: "text-amber-400 drop-shadow-[0_0_2px_rgba(251,191,36,0.5)]",
    white: "text-neutral-100 drop-shadow-[0_0_1px_rgba(255,255,255,0.4)]",
    green: "text-emerald-400 drop-shadow-[0_0_2px_rgba(52,211,153,0.5)]",
    amber: "text-amber-500 drop-shadow-[0_0_2px_rgba(245,158,11,0.5)]",
    red: "text-rose-500 drop-shadow-[0_0_2px_rgba(244,63,94,0.5)]",
  }[color];

  return (
    <div className={`flap-cell ${sizeClasses} mx-[1px] relative select-none font-mono font-bold tracking-tight inline-flex items-center justify-center`}>
      {/* Pinos do eixo mecânico nas laterais */}
      <span className="flap-pin-left" />
      <span className="flap-pin-right" />

      {/* Linha divisória de corte mecânica */}
      <span className="flap-split-line" />

      {/* Aba Superior (Sombra de iluminação) */}
      <div className="absolute top-0 inset-x-0 bottom-1/2 bg-gradient-to-b from-white/[0.08] to-transparent pointer-events-none rounded-t-[2px]" />

      {/* Aba Inferior (Sombra profunda inferior) */}
      <div className="absolute top-1/2 inset-x-0 bottom-0 bg-gradient-to-b from-black/40 to-black/80 pointer-events-none rounded-b-[2px]" />

      {/* Caractere exibido */}
      <span className={`${colorClasses} ${isFlipping ? "animate-flap" : ""} transition-transform z-0`}>
        {displayChar === " " ? "\u00A0" : displayChar}
      </span>
    </div>
  );
}

// ─── Componente Sequência Split-Flap ──────────────────────────────────────────

function SplitFlapWord({
  text,
  length,
  size = "md",
  color = "yellow",
  align = "left",
  audioContextRef,
  somAtivo = false,
}: {
  text: string;
  length: number;
  size?: "sm" | "md" | "lg";
  color?: "yellow" | "white" | "green" | "amber" | "red";
  align?: "left" | "right" | "center";
  audioContextRef?: React.RefObject<AudioContext | null>;
  somAtivo?: boolean;
}) {
  const safeText = (text || "").toUpperCase().slice(0, length);
  let padded = safeText;

  if (safeText.length < length) {
    const diff = length - safeText.length;
    if (align === "left") {
      padded = safeText.padEnd(length, " ");
    } else if (align === "right") {
      padded = safeText.padStart(length, " ");
    } else {
      const padLeft = Math.floor(diff / 2);
      const padRight = diff - padLeft;
      padded = " ".repeat(padLeft) + safeText + " ".repeat(padRight);
    }
  }

  return (
    <div className="inline-flex items-center">
      {padded.split("").map((c, i) => (
        <SplitFlapChar
          key={i}
          char={c}
          size={size}
          color={color}
          audioContextRef={audioContextRef}
          somAtivo={somAtivo}
        />
      ))}
    </div>
  );
}

// ─── Componente Principal do Painel de Aeroporto ──────────────────────────────

export default function PainelAeroporto() {
  const [voos, setVoos] = useState<EstadoVoo[]>([]);
  const [vooDestaque, setVooDestaque] = useState<EstadoVoo | null>(null);
  const [meteorologia, setMeteorologia] = useState<DadosMeteo | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [erroMeteo, setErroMeteo] = useState<string | null>(null);
  const [horaAtual, setHoraAtual] = useState(new Date());
  const [aRadar, setARadar] = useState(false);
  const [somAtivo, setSomAtivo] = useState(false);
  const [tempoRestante, setTempoRestante] = useState(INTERVALO_MS / 1000);

  const audioContextRef = useRef<AudioContext | null>(null);

  // Inicializar AudioContext com clique do utilizador
  const toggleSom = () => {
    if (!audioContextRef.current) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioContextRef.current = new AudioCtx();
    }
    if (audioContextRef.current.state === "suspended") {
      audioContextRef.current.resume();
    }
    setSomAtivo((prev) => !prev);
  };

  // Relógio
  useEffect(() => {
    const tick = setInterval(() => {
      setHoraAtual(new Date());
    }, 1000);
    return () => clearInterval(tick);
  }, []);

  // Contador de atualização
  useEffect(() => {
    const timer = setInterval(() => {
      setTempoRestante((t) => (t <= 1 ? INTERVALO_MS / 1000 : t - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Obtenção de dados da API
  const buscarDados = useCallback(async () => {
    setARadar(true);
    setTempoRestante(INTERVALO_MS / 1000);

    try {
      // 1. Voos OpenSky
      const resVoos = await fetch("/api/voos");
      const dadosVoos = await resVoos.json();

      if (dadosVoos.estados && dadosVoos.estados.length > 0) {
        // Ordenar por voos no ar e por altitude
        const ordenados = [...dadosVoos.estados].sort((a: EstadoVoo, b: EstadoVoo) => {
          if (!a[8] && b[8]) return -1;
          if (a[8] && !b[8]) return 1;
          return (b[7] ?? 0) - (a[7] ?? 0);
        });

        setVoos(ordenados);
        setVooDestaque(ordenados[0]);
        setMeteorologia(null);
        setErroMeteo(null);
      } else {
        setVoos([]);
        setVooDestaque(null);

        // 2. Meteorologia local
        const resMeteo = await fetch("/api/meteorologia");
        const dadosMeteo = await resMeteo.json();
        if (dadosMeteo.erro) {
          setErroMeteo(dadosMeteo.erro);
          setMeteorologia(null);
        } else {
          setMeteorologia(dadosMeteo);
          setErroMeteo(null);
        }
      }
      setErro(null);
    } catch {
      setErro("FALHA RADAR");
    } finally {
      setARadar(false);
    }
  }, []);

  useEffect(() => {
    buscarDados();
    const intervalo = setInterval(buscarDados, INTERVALO_MS);
    return () => clearInterval(intervalo);
  }, [buscarDados]);

  // Formatações
  const horaStr = horaAtual.toLocaleTimeString("pt-PT", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const dataStr = horaAtual
    .toLocaleDateString("pt-PT", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
    .toUpperCase();

  return (
    <main className="min-h-screen bg-[#07080a] text-neutral-200 flex flex-col items-center justify-start p-3 sm:p-6 md:p-10 font-mono board-texture select-none">
      
      {/* ── CHASSI INDUSTRIAL ANALÓGICO (SOLARI DI UDINE) ────────────────── */}
      <div className="w-full max-w-5xl bg-[#0e1014] rounded-lg border-4 border-[#22252e] shadow-[0_20px_50px_rgba(0,0,0,0.95),inset_0_2px_4px_rgba(255,255,255,0.1)] p-4 sm:p-7 relative overflow-hidden">
        
        {/* Parafusos de fixação nos quatro cantos */}
        <div className="absolute top-3 left-3 screw" />
        <div className="absolute top-3 right-3 screw" />
        <div className="absolute bottom-3 left-3 screw" />
        <div className="absolute bottom-3 right-3 screw" />

        {/* ── PLACA SUPERIOR DE IDENTIFICAÇÃO DO SISTEMA ─────────────────── */}
        <header className="border-b-2 border-[#1f232c] pb-5 mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Título Estilo Placa Metálica */}
          <div className="flex items-center gap-3">
            <div className="w-3 h-10 bg-amber-500 rounded-sm shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
            <div>
              <div className="text-[10px] tracking-[0.28em] text-neutral-400 uppercase font-semibold">
                SISTEMA ELECTROMECÂNICO DE CONTROLO AÉREO
              </div>
              <h1 className="text-lg sm:text-xl font-black tracking-widest text-amber-400 uppercase drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                AEROPORTO DO PORTO · SECTOR VALADARES
              </h1>
            </div>
          </div>

          {/* Relógio Mecânico Split-Flap */}
          <div className="flex items-center gap-3 bg-[#0a0b0e] px-4 py-2 rounded border border-[#20232b] shadow-inner">
            <div className="flex flex-col items-end">
              <span className="text-[9px] uppercase tracking-widest text-neutral-400 font-bold mb-1">
                DATA & HORA UTC+1
              </span>
              <div className="flex items-center gap-2">
                <SplitFlapWord
                  text={dataStr}
                  length={11}
                  size="sm"
                  color="white"
                  audioContextRef={audioContextRef}
                  somAtivo={somAtivo}
                />
                <SplitFlapWord
                  text={horaStr}
                  length={8}
                  size="sm"
                  color="yellow"
                  audioContextRef={audioContextRef}
                  somAtivo={somAtivo}
                />
              </div>
            </div>
          </div>
        </header>

        {/* ── BARRA DE LÂMPADAS INDICADORAS E CONTROLOS RETRO ─────────────── */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#13161c] px-4 py-2.5 rounded border border-[#242833] mb-6 text-xs">
          
          {/* Lâmpadas Piloto */}
          <div className="flex items-center gap-5">
            {/* Lâmpada Radar */}
            <div className="flex items-center gap-2">
              <span
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  aRadar
                    ? "bg-amber-400 text-amber-400 indicator-lamp animate-ping"
                    : "bg-emerald-500 text-emerald-500 indicator-lamp"
                }`}
              />
              <span className="text-[10px] uppercase tracking-wider font-bold text-neutral-300">
                {aRadar ? "SINTONIA RADAR" : "RADAR OPERACIONAL"}
              </span>
            </div>

            {/* Lâmpada Modo */}
            <div className="flex items-center gap-2">
              <span
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  voos.length > 0
                    ? "bg-amber-400 text-amber-400 indicator-lamp"
                    : "bg-cyan-400 text-cyan-400 indicator-lamp"
                }`}
              />
              <span className="text-[10px] uppercase tracking-wider font-bold text-neutral-300">
                {voos.length > 0 ? `TRÁFEGO (${voos.length} DETECTADOS)` : "METEOROLOGIA LOCAL"}
              </span>
            </div>

            {/* Lâmpada Erro */}
            {erro && (
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500 text-rose-500 indicator-lamp animate-pulse" />
                <span className="text-[10px] uppercase tracking-wider font-bold text-rose-400">
                  {erro}
                </span>
              </div>
            )}
          </div>

          {/* Interruptor de Som Mecânico */}
          <button
            onClick={toggleSom}
            className={`flex items-center gap-2 px-3 py-1 rounded border text-[11px] font-bold uppercase tracking-wider transition-colors ${
              somAtivo
                ? "bg-amber-500/20 border-amber-500 text-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.3)]"
                : "bg-[#1b1e26] border-[#313644] text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <span>{somAtivo ? "🔊" : "🔇"}</span>
            <span>SOM DE PALHETAS [{somAtivo ? "LIGADO" : "DESLIGADO"}]</span>
          </button>
        </div>

        {/* ── TABELA ANALÓGICA DE PARTIDAS / VOOS EM TRÂNSITO ────────────── */}
        {voos.length > 0 && (
          <div className="mb-6 overflow-x-auto">
            
            {/* Cabeçalho da Tabela Estilo Placa de Aeroporto */}
            <div className="min-w-[680px] bg-[#181a20] px-4 py-2 rounded-t border-t border-x border-[#2c303d] flex text-[10px] font-bold tracking-widest text-neutral-400 uppercase">
              <div className="w-[18%]">VOO</div>
              <div className="w-[26%]">ORIGEM/PAÍS</div>
              <div className="w-[18%] text-right pr-4">ALTITUDE</div>
              <div className="w-[18%] text-right pr-4">VELOCIDADE</div>
              <div className="w-[20%] text-right">ESTADO</div>
            </div>

            {/* Linhas de Palhetas Mecânicas */}
            <div className="min-w-[680px] bg-[#0c0d11] p-3 border-x border-b border-[#252834] rounded-b flex flex-col gap-2.5">
              {voos.slice(0, 5).map((voo, idx) => {
                const callsign = (voo[1] || voo[0] || "DESCONHECIDO").trim();
                const pais = (voo[2] || "INTERNACIONAL").slice(0, 14);
                const alt = voo[7] != null ? `${Math.round(voo[7])}M` : "N/D";
                const vel = voo[9] != null ? `${Math.round(voo[9] * 3.6)}KM` : "N/D";
                const estado = voo[8]
                  ? "NO SOLO"
                  : (voo[11] ?? 0) < -1
                  ? "DESCIDA"
                  : (voo[11] ?? 0) > 1
                  ? "SUBIDA"
                  : "EM VOO";

                const isTop = idx === 0;

                return (
                  <div
                    key={voo[0]}
                    onClick={() => setVooDestaque(voo)}
                    className={`flex items-center px-3 py-1.5 rounded transition-all cursor-pointer ${
                      vooDestaque?.[0] === voo[0]
                        ? "bg-[#1c202a] border border-amber-500/50 shadow-[0_0_12px_rgba(245,158,11,0.15)]"
                        : "hover:bg-[#15171e]"
                    }`}
                  >
                    {/* Voo (Callsign) */}
                    <div className="w-[18%]">
                      <SplitFlapWord
                        text={callsign}
                        length={8}
                        size="md"
                        color={isTop ? "yellow" : "white"}
                        audioContextRef={audioContextRef}
                        somAtivo={somAtivo}
                      />
                    </div>

                    {/* País */}
                    <div className="w-[26%]">
                      <SplitFlapWord
                        text={pais}
                        length={14}
                        size="md"
                        color="white"
                        audioContextRef={audioContextRef}
                        somAtivo={somAtivo}
                      />
                    </div>

                    {/* Altitude */}
                    <div className="w-[18%] flex justify-end pr-4">
                      <SplitFlapWord
                        text={alt}
                        length={8}
                        size="md"
                        color="amber"
                        align="right"
                        audioContextRef={audioContextRef}
                        somAtivo={somAtivo}
                      />
                    </div>

                    {/* Velocidade */}
                    <div className="w-[18%] flex justify-end pr-4">
                      <SplitFlapWord
                        text={vel}
                        length={8}
                        size="md"
                        color="white"
                        align="right"
                        audioContextRef={audioContextRef}
                        somAtivo={somAtivo}
                      />
                    </div>

                    {/* Estado */}
                    <div className="w-[20%] flex justify-end">
                      <SplitFlapWord
                        text={estado}
                        length={8}
                        size="md"
                        color={estado === "NO SOLO" ? "amber" : "green"}
                        align="right"
                        audioContextRef={audioContextRef}
                        somAtivo={somAtivo}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── PAINEL DE METEOROLOGIA ANALÓGICA (SE NÃO HOUVER VOOS) ───────── */}
        {voos.length === 0 && !erro && (
          <div className="mb-6">
            <div className="bg-[#181a20] px-4 py-2 rounded-t border-t border-x border-[#2c303d] text-[10px] font-bold tracking-widest text-neutral-400 uppercase">
              BOLETIM METEOROLÓGICO DE SUPERFÍCIE · ESTAÇÃO VALADARES
            </div>

            <div className="bg-[#0c0d11] p-5 border-x border-b border-[#252834] rounded-b flex flex-col gap-4">
              {meteorologia ? (
                <>
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center pb-3 border-b border-[#1b1e26] gap-2">
                    <span className="text-xs uppercase text-neutral-400 tracking-widest">ESTAÇÃO LOCAL</span>
                    <SplitFlapWord
                      text={meteorologia.name?.toUpperCase() || "VALADARES"}
                      length={18}
                      size="lg"
                      color="yellow"
                      audioContextRef={audioContextRef}
                      somAtivo={somAtivo}
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between sm:items-center pb-3 border-b border-[#1b1e26] gap-2">
                    <span className="text-xs uppercase text-neutral-400 tracking-widest">CONDIÇÕES GERAIS</span>
                    <SplitFlapWord
                      text={meteorologia.weather[0]?.description.toUpperCase() || "LIMPO"}
                      length={18}
                      size="md"
                      color="white"
                      audioContextRef={audioContextRef}
                      somAtivo={somAtivo}
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between sm:items-center pb-3 border-b border-[#1b1e26] gap-2">
                    <span className="text-xs uppercase text-neutral-400 tracking-widest">TEMPERATURA AR</span>
                    <SplitFlapWord
                      text={`${Math.round(meteorologia.main.temp)} C`}
                      length={8}
                      size="lg"
                      color="amber"
                      audioContextRef={audioContextRef}
                      somAtivo={somAtivo}
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between sm:items-center pb-3 border-b border-[#1b1e26] gap-2">
                    <span className="text-xs uppercase text-neutral-400 tracking-widest">VELOCIDADE VENTO</span>
                    <SplitFlapWord
                      text={`${Math.round(meteorologia.wind.speed * 3.6)} KM/H`}
                      length={12}
                      size="md"
                      color="white"
                      audioContextRef={audioContextRef}
                      somAtivo={somAtivo}
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                    <span className="text-xs uppercase text-neutral-400 tracking-widest">HUMIDADE RELATIVA</span>
                    <SplitFlapWord
                      text={`${meteorologia.main.humidity} %`}
                      length={8}
                      size="md"
                      color="green"
                      audioContextRef={audioContextRef}
                      somAtivo={somAtivo}
                    />
                  </div>
                </>
              ) : erroMeteo ? (
                <div className="p-6 text-center">
                  <div className="text-amber-400 text-sm tracking-widest mb-2">
                    SEM TRÁFEGO AÉREO DIRECTO NO SECTOR
                  </div>
                  <div className="text-neutral-500 text-xs tracking-wider">
                    {erroMeteo}
                  </div>
                </div>
              ) : (
                <div className="p-10 flex flex-col items-center justify-center gap-3">
                  <span className="text-xs tracking-widest text-neutral-400">A CARREGAR INFORMAÇÃO ELECTROMECÂNICA...</span>
                  <SplitFlapWord
                    text="SINTONIZANDO"
                    length={12}
                    size="lg"
                    color="yellow"
                    audioContextRef={audioContextRef}
                    somAtivo={somAtivo}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── INSTRUMENTAÇÃO ANALÓGICA COMPLEMENTAR (VOO EM DESTAQUE) ──────── */}
        {vooDestaque && (
          <div className="bg-[#12141a] p-4 rounded border border-[#232733] mb-6 shadow-inner">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#21242e]">
              <span className="text-[10px] uppercase tracking-[0.2em] text-amber-400/90 font-bold">
                TELEMETRIA DO VOO SELECCIONADO
              </span>
              <span className="text-[10px] tracking-wider text-neutral-400">
                TRANSPONDER ICAO24: <strong className="text-neutral-200">{vooDestaque[0].toUpperCase()}</strong>
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-[#0b0c10] p-2.5 rounded border border-[#1d2029]">
                <div className="text-[9px] uppercase tracking-wider text-neutral-400 mb-1">RUMO MAGNÉTICO</div>
                <div className="text-amber-400 font-bold text-sm">
                  {vooDestaque[10] != null ? `${Math.round(vooDestaque[10])}°` : "N/D"}
                </div>
              </div>

              <div className="bg-[#0b0c10] p-2.5 rounded border border-[#1d2029]">
                <div className="text-[9px] uppercase tracking-wider text-neutral-400 mb-1">CÓDIGO SQUAWK</div>
                <div className="text-neutral-200 font-bold text-sm">
                  {vooDestaque[14] || "1000"}
                </div>
              </div>

              <div className="bg-[#0b0c10] p-2.5 rounded border border-[#1d2029]">
                <div className="text-[9px] uppercase tracking-wider text-neutral-400 mb-1">TAXA VERTICAL</div>
                <div className={`font-bold text-sm ${(vooDestaque[11] ?? 0) < 0 ? "text-amber-400" : "text-emerald-400"}`}>
                  {vooDestaque[11] != null ? `${vooDestaque[11] > 0 ? "+" : ""}${vooDestaque[11].toFixed(1)} m/s` : "0.0 m/s"}
                </div>
              </div>

              <div className="bg-[#0b0c10] p-2.5 rounded border border-[#1d2029]">
                <div className="text-[9px] uppercase tracking-wider text-neutral-400 mb-1">COORDENADAS GPS</div>
                <div className="text-neutral-300 font-bold text-[11px] truncate">
                  {vooDestaque[6]?.toFixed(3)}N, {vooDestaque[5]?.toFixed(3)}W
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── RODAPÉ MECÂNICO COM CONTADOR DE VARREDURA ─────────────────── */}
        <footer className="pt-3 border-t border-[#1e212a] flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] text-neutral-400 uppercase tracking-widest font-semibold">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span>LOCALIZAÇÃO: 41.084°N 8.655°W (VALADARES · GAIA)</span>
          </div>

          <div className="flex items-center gap-3">
            <span>PRÓXIMO CICLO DE VARREDURA:</span>
            <span className="text-amber-400 font-bold text-xs bg-[#0b0c10] px-2 py-0.5 rounded border border-[#21242e]">
              {String(tempoRestante).padStart(2, "0")}S
            </span>
          </div>
        </footer>

      </div>
    </main>
  );
}
