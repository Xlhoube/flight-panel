"use client";

import React from "react";
import { SplitFlapRow } from "./SplitFlapRow";
import { WeatherData } from "@/app/api/weather/route";

interface WeatherBoardProps {
  weather: WeatherData | null;
  radiusKm: number;
}

export const WeatherBoard: React.FC<WeatherBoardProps> = ({
  weather,
  radiusKm = 20,
}) => {
  const tempStr = weather ? `${weather.temperature > 0 ? "+" : ""}${weather.temperature}°C` : "--°C";
  const condStr = weather?.conditionText ? weather.conditionText.padEnd(20, " ") : "A AGUARDAR METEO   ";
  const windStr = weather
    ? `${weather.windSpeedKmh}KM/H ${weather.windDirection}°`.padEnd(16, " ")
    : "--- KM/H ---°   ";
  const humidityStr = weather
    ? `${weather.relativeHumidity}% HUM ${weather.surfacePressureHpa}HPA`.padEnd(16, " ")
    : "--% HUM ----HPA ";

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-zinc-950/90 border-2 border-zinc-800 rounded-lg shadow-2xl p-4 md:p-8 backdrop-blur-md relative">
        {/* Parafusos nos cantos */}
        <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-zinc-700 border border-zinc-900" />
        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-zinc-700 border border-zinc-900" />
        <div className="absolute bottom-2 left-2 w-2 h-2 rounded-full bg-zinc-700 border border-zinc-900" />
        <div className="absolute bottom-2 right-2 w-2 h-2 rounded-full bg-zinc-700 border border-zinc-900" />

        {/* Alerta de ausência de aeronaves */}
        <div className="flex items-center justify-between border-b-2 border-zinc-800 pb-3 mb-6">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
            </span>
            <div className="text-xs md:text-sm font-mono tracking-widest text-amber-400 font-bold uppercase">
              SEM TRÁFEGO AÉREO DIRECTO (RAIO {radiusKm} KM)
            </div>
          </div>
          <div className="text-xs font-mono text-zinc-400 uppercase tracking-widest">
            MODO METEOROLOGIA • ACTIVO
          </div>
        </div>

        {/* Informações Meteorológicas Analógicas Solari */}
        <div className="flex flex-col gap-4">
          {/* Linha 1: Estado / Condição */}
          <div className="bg-black/60 p-3 rounded border border-zinc-800/80 flex flex-col md:flex-row md:items-center justify-between gap-2">
            <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider font-semibold">
              ESTADO DO TEMPO
            </span>
            <SplitFlapRow
              text={condStr}
              length={20}
              size="md"
              colorTheme="amber"
              baseDelayMs={50}
            />
          </div>

          {/* Linha 2: Temperatura */}
          <div className="bg-black/60 p-3 rounded border border-zinc-800/80 flex flex-col md:flex-row md:items-center justify-between gap-2">
            <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider font-semibold">
              TEMPERATURA
            </span>
            <div className="flex items-center gap-2">
              <SplitFlapRow
                text={tempStr.padStart(8, " ")}
                length={8}
                size="md"
                colorTheme="cyan"
                baseDelayMs={120}
              />
            </div>
          </div>

          {/* Linha 3: Vento e Rumo */}
          <div className="bg-black/60 p-3 rounded border border-zinc-800/80 flex flex-col md:flex-row md:items-center justify-between gap-2">
            <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider font-semibold">
              VENTO E RUMO
            </span>
            <SplitFlapRow
              text={windStr}
              length={16}
              size="md"
              colorTheme="white"
              baseDelayMs={180}
            />
          </div>

          {/* Linha 4: Humidade e Pressão Atmosférica */}
          <div className="bg-black/60 p-3 rounded border border-zinc-800/80 flex flex-col md:flex-row md:items-center justify-between gap-2">
            <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider font-semibold">
              ATMOSFERA
            </span>
            <SplitFlapRow
              text={humidityStr}
              length={16}
              size="md"
              colorTheme="green"
              baseDelayMs={240}
            />
          </div>
        </div>

        {/* Rodapé mecânico */}
        <div className="mt-6 pt-3 border-t border-zinc-800/80 text-center text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
          ESTAÇÃO AUTOMÁTICA DE SUPERFÍCIE • ROTAÇÃO MECÂNICA CONTÍNUA
        </div>
      </div>
    </div>
  );
};
