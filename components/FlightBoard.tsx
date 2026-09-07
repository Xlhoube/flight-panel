"use client";

import React from "react";
import { SplitFlapRow } from "./SplitFlapRow";
import { FlightData } from "@/app/api/flights/route";

interface FlightBoardProps {
  flights: FlightData[];
  radiusKm: number;
}

export const FlightBoard: React.FC<FlightBoardProps> = ({
  flights,
  radiusKm = 20,
}) => {
  const displayFlights = flights.slice(0, 6);

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Moldura superior do painel Solari com parafusos industriais */}
      <div className="bg-zinc-950/90 border-2 border-zinc-800 rounded-lg shadow-2xl p-3 md:p-6 backdrop-blur-md relative">
        {/* Parafusos de fixação nos 4 cantos */}
        <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-zinc-700 border border-zinc-900 shadow-inner" />
        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-zinc-700 border border-zinc-900 shadow-inner" />
        <div className="absolute bottom-2 left-2 w-2 h-2 rounded-full bg-zinc-700 border border-zinc-900 shadow-inner" />
        <div className="absolute bottom-2 right-2 w-2 h-2 rounded-full bg-zinc-700 border border-zinc-900 shadow-inner" />

        {/* Barra de cabeçalho do painel */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-zinc-800 pb-3 mb-4">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <div className="text-xs md:text-sm font-mono tracking-widest text-emerald-400 font-bold uppercase">
              RADAR DE ESPAÇO AÉREO • RAIO {radiusKm} KM
            </div>
          </div>
          <div className="text-xs font-mono text-zinc-400 tracking-wider">
            AERONAVES EM CONTACTO:{" "}
            <span className="text-amber-400 font-bold">{flights.length}</span>
          </div>
        </div>

        {/* Cabeçalhos das Colunas em Âmbar Aeroportuário */}
        <div className="hidden sm:grid grid-cols-12 gap-2 text-[11px] md:text-xs font-mono font-bold tracking-wider text-amber-400 border-b border-zinc-800/80 pb-2 mb-3 px-1 uppercase">
          <div className="col-span-3">IDENT / VOO</div>
          <div className="col-span-3">ORIGEM / PAÍS</div>
          <div className="col-span-2 text-right">ALTITUDE</div>
          <div className="col-span-2 text-right">VELOCIDADE</div>
          <div className="col-span-2 text-right">DISTÂNCIA</div>
        </div>

        {/* Linhas de Voos Analógicos */}
        <div className="flex flex-col gap-2.5 overflow-x-auto pb-1">
          {displayFlights.map((flight, idx) => {
            const callsign = (flight.callsign || "DESCON").padEnd(8, " ");
            const country = (flight.country || "INDEF").slice(0, 10).padEnd(10, " ");
            const altText = flight.onGround
              ? "CHÃO  "
              : flight.altitudeFeet !== null
              ? `${flight.altitudeFeet}FT`.padStart(7, " ")
              : "----FT ";
            const speedText =
              flight.velocityKnots !== null
                ? `${flight.velocityKnots}KT`.padStart(6, " ")
                : "---KT ";
            const distText = `${flight.distanceKm.toFixed(1)}KM`.padStart(6, " ");

            return (
              <div
                key={flight.icao24 || idx}
                className="bg-black/60 p-1.5 md:p-2 rounded border border-zinc-800/60 flex flex-nowrap items-center justify-between gap-2 min-w-[580px] sm:min-w-0"
              >
                {/* Voo */}
                <div className="w-28 sm:w-1/4">
                  <SplitFlapRow
                    text={callsign}
                    length={8}
                    size="sm"
                    colorTheme="amber"
                    baseDelayMs={idx * 80}
                  />
                </div>

                {/* País */}
                <div className="w-32 sm:w-1/4">
                  <SplitFlapRow
                    text={country}
                    length={10}
                    size="sm"
                    colorTheme="white"
                    baseDelayMs={idx * 80 + 50}
                  />
                </div>

                {/* Altitude */}
                <div className="w-24 sm:w-1/6 flex justify-end">
                  <SplitFlapRow
                    text={altText}
                    length={7}
                    size="sm"
                    colorTheme={flight.onGround ? "cyan" : "white"}
                    baseDelayMs={idx * 80 + 100}
                  />
                </div>

                {/* Velocidade */}
                <div className="w-20 sm:w-1/6 flex justify-end">
                  <SplitFlapRow
                    text={speedText}
                    length={6}
                    size="sm"
                    colorTheme="white"
                    baseDelayMs={idx * 80 + 140}
                  />
                </div>

                {/* Distância */}
                <div className="w-20 sm:w-1/6 flex justify-end">
                  <SplitFlapRow
                    text={distText}
                    length={6}
                    size="sm"
                    colorTheme="green"
                    baseDelayMs={idx * 80 + 180}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
