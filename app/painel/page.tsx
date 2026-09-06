"use client";

import { useEffect, useState, useCallback } from "react";

// ─── Tipos ────────────────────────────────────────────────────────────────────

type EstadoVoo = [
  string,       // 0: icao24
  string | null,// 1: callsign
  string,       // 2: origin_country
  number | null,// 3: time_position
  number,       // 4: last_contact
  number | null,// 5: longitude
  number | null,// 6: latitude
  number | null,// 7: baro_altitude (metros)
  boolean,      // 8: on_ground
  number | null,// 9: velocity (m/s)
  number | null,// 10: true_track
  number | null,// 11: vertical_rate
  null,         // 12: sensors
  number | null,// 13: geo_altitude
  string | null,// 14: squawk
  boolean,      // 15: spi
  number,       // 16: position_source
];

interface DadosMeteo {
  weather: Array<{ description: string }>;
  main: { temp: number; humidity: number };
  wind: { speed: number };
  name: string;
}

// ─── Constantes ───────────────────────────────────────────────────────────────

const INTERVALO_MS = 30_000;

// ─── Utilitários ──────────────────────────────────────────────────────────────

function formatarHora(date: Date) {
  return date.toLocaleTimeString("pt-PT", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function formatarData(date: Date) {
  return date.toLocaleDateString("pt-PT", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).toUpperCase();
}

// ─── Componente Principal ─────────────────────────────────────────────────────

export default function PainelAeroporto() {
  const [vooAtual, setVooAtual] = useState<EstadoVoo | null>(null);
  const [meteorologia, setMeteorologia] = useState<DadosMeteo | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [erroMeteo, setErroMeteo] = useState<string | null>(null);
  const [horaAtual, setHoraAtual] = useState(new Date());
  const [progresso, setProgresso] = useState(0);
  const [aRadar, setARadar] = useState(false);

  // ── Relógio em tempo real ──────────────────────────────────────────────────
  useEffect(() => {
    const tick = setInterval(() => setHoraAtual(new Date()), 1000);
    return () => clearInterval(tick);
  }, []);

  // ── Barra de progresso ────────────────────────────────────────────────────
  useEffect(() => {
    const passo = 100;
    const incremento = (passo / INTERVALO_MS) * 100;
    const timer = setInterval(() => {
      setProgresso((p) => {
        if (p >= 100) return 0;
        return Math.min(p + incremento, 100);
      });
    }, passo);
    return () => clearInterval(timer);
  }, []);

  // ── Fetch principal ───────────────────────────────────────────────────────
  const buscarDados = useCallback(async () => {
    setARadar(true);
    setProgresso(0);

    try {
      // 1. Voos
      const resVoos = await fetch("/api/voos");
      const dadosVoos = await resVoos.json();

      if (dadosVoos.estados && dadosVoos.estados.length > 0) {
        // Avião detectado — prioridade ao voo mais alto (índice 7 = altitude)
        const voosEmAr = dadosVoos.estados.filter((v: EstadoVoo) => !v[8]);
        const voo = voosEmAr.length > 0 ? voosEmAr[0] : dadosVoos.estados[0];
        setVooAtual(voo);
        setMeteorologia(null);
        setErroMeteo(null);
      } else {
        // Sem aviões — buscar meteorologia
        setVooAtual(null);
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
      setErro("Falha na ligação aos radares.");
    } finally {
      setARadar(false);
    }
  }, []);

  useEffect(() => {
    buscarDados();
    const intervalo = setInterval(buscarDados, INTERVALO_MS);
    return () => clearInterval(intervalo);
  }, [buscarDados]);

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-black flex flex-col items-center justify-center p-6 md:p-12 text-yellow-400 select-none">

      {/* ── Cabeçalho ─────────────────────────────────────────────────────── */}
      <div className="w-full max-w-4xl border-b-2 border-yellow-400/60 pb-4 mb-10 flex flex-col sm:flex-row justify-between gap-2">
        <div className="flex flex-col">
          <span className="text-xs opacity-40 uppercase tracking-widest mb-1">Sistema</span>
          <span className="text-lg uppercase tracking-widest font-bold">
            Valadares Airspace
          </span>
        </div>
        <div className="flex flex-col items-start sm:items-end">
          <span className="text-xs opacity-40 uppercase tracking-widest mb-1">
            {formatarData(horaAtual)}
          </span>
          <span className="text-2xl font-bold tabular-nums">
            {formatarHora(horaAtual)}
          </span>
        </div>
      </div>

      {/* ── Indicador de modo ─────────────────────────────────────────────── */}
      <div className="w-full max-w-4xl mb-6 flex items-center gap-3">
        <div
          className={`w-2.5 h-2.5 rounded-full ${aRadar
              ? "bg-yellow-400 animate-ping"
              : vooAtual
                ? "bg-green-400 animate-pulse"
                : "bg-yellow-400/40"
            }`}
        />
        <span className="text-xs uppercase tracking-widest opacity-60">
          {aRadar
            ? "A sintonizar radares..."
            : vooAtual
              ? "Voo detectado no espaço aéreo"
              : meteorologia
                ? "Sem tráfego aéreo — Meteorologia activa"
                : "A aguardar dados..."}
        </span>
      </div>

      {/* ── Área de informação principal ──────────────────────────────────── */}
      <div className="w-full max-w-4xl min-h-[320px] flex flex-col justify-center">

        {/* Erro de rede */}
        {erro && (
          <p className="text-red-500 animate-pulse text-xl uppercase tracking-widest">
            ⚠ {erro}
          </p>
        )}

        {/* ── Painel de VOO ──────────────────────────────────────────────── */}
        {vooAtual && !erro && (
          <div className="flex flex-col gap-6">
            <Linha label="Voo" valor={vooAtual[1]?.trim() || "DESCONHECIDO"} destaque />
            <Linha
              label="Altitude"
              valor={vooAtual[7] != null ? `${Math.round(vooAtual[7]).toLocaleString("pt-PT")} m` : "N/D"}
            />
            <Linha
              label="Velocidade"
              valor={vooAtual[9] != null ? `${Math.round(vooAtual[9] * 3.6)} km/h` : "N/D"}
            />
            <Linha label="País de Registo" valor={vooAtual[2]} />
            <Linha
              label="Altitude Geométrica"
              valor={vooAtual[13] != null ? `${Math.round(vooAtual[13]).toLocaleString("pt-PT")} m` : "N/D"}
            />
          </div>
        )}

        {/* ── Painel de METEOROLOGIA ─────────────────────────────────────── */}
        {meteorologia && !vooAtual && !erro && (
          <div className="flex flex-col gap-6">
            <Linha label="Local" valor={meteorologia.name?.toUpperCase() || "VALADARES"} destaque />
            <Linha label="Estado" valor={meteorologia.weather[0].description.toUpperCase()} />
            <Linha label="Temperatura" valor={`${Math.round(meteorologia.main.temp)} °C`} />
            <Linha
              label="Vento"
              valor={`${Math.round(meteorologia.wind.speed * 3.6)} km/h`}
            />
            <Linha label="Humidade" valor={`${meteorologia.main.humidity} %`} />
          </div>
        )}

        {/* Erro de meteorologia (sem voos e sem dados meteo) */}
        {erroMeteo && !vooAtual && !meteorologia && !erro && (
          <div className="flex flex-col gap-3 opacity-70">
            <p className="text-yellow-400/60 text-sm uppercase tracking-widest">
              Sem tráfego aéreo detectado
            </p>
            <p className="text-red-400/80 text-xs">{erroMeteo}</p>
          </div>
        )}

        {/* Estado inicial de carregamento */}
        {!vooAtual && !meteorologia && !erro && !erroMeteo && (
          <p className="text-2xl animate-pulse text-center uppercase tracking-widest opacity-60">
            A sintonizar radares...
          </p>
        )}
      </div>

      {/* ── Rodapé com barra de progresso ────────────────────────────────── */}
      <div className="w-full max-w-4xl mt-10 flex flex-col gap-2">
        {/* Barra de progresso */}
        <div className="w-full h-px bg-yellow-400/20 relative overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full bg-yellow-400 transition-all duration-100"
            style={{ width: `${progresso}%` }}
          />
        </div>
        <div className="flex justify-between text-xs opacity-30 uppercase tracking-widest">
          <span>Radar Valadares · Porto</span>
          <span>Actualização: 30s</span>
        </div>
      </div>
    </main>
  );
}

// ─── Sub-componente de linha ───────────────────────────────────────────────────

function Linha({
  label,
  valor,
  destaque = false,
}: {
  label: string;
  valor: string;
  destaque?: boolean;
}) {
  return (
    <div className="flex justify-between items-baseline border-b border-yellow-400/10 pb-3">
      <span className="text-xs uppercase tracking-widest opacity-40 shrink-0 pr-4">
        {label}
      </span>
      <span
        className={`uppercase tracking-widest text-right ${destaque ? "text-3xl md:text-4xl font-bold" : "text-xl md:text-2xl"
          }`}
      >
        {valor}
      </span>
    </div>
  );
}

