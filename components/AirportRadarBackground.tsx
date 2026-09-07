"use client";

import React, { useEffect, useRef } from "react";
import { FlightData } from "@/app/api/flights/route";

interface AirportRadarBackgroundProps {
  userLat: number;
  userLon: number;
  radiusKm: number;
  flights: FlightData[];
}

export const AirportRadarBackground: React.FC<AirportRadarBackgroundProps> = ({
  userLat,
  userLon,
  radiusKm = 20,
  flights = [],
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const angleRef = useRef<number>(0);
  const animFrameId = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = canvas.parentElement?.clientWidth || 800);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 600);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    window.addEventListener("resize", handleResize);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const maxRadarRadius = Math.min(width, height) * 0.44;

      // Fundo suave de ecrã de fósforo CRT
      const bgGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, maxRadarRadius * 1.2);
      bgGrad.addColorStop(0, "rgba(5, 20, 15, 0.4)");
      bgGrad.addColorStop(0.7, "rgba(2, 10, 8, 0.7)");
      bgGrad.addColorStop(1, "rgba(0, 0, 0, 0.95)");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Círculos concêntricos de alcance (5 km, 10 km, 15 km, 20 km)
      const rangeSteps = [5, 10, 15, 20];
      rangeSteps.forEach((dist) => {
        const r = (dist / radiusKm) * maxRadarRadius;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = dist === 20 ? "rgba(34, 197, 94, 0.35)" : "rgba(34, 197, 94, 0.15)";
        ctx.lineWidth = dist === 20 ? 1.5 : 1;
        ctx.setLineDash(dist === 20 ? [] : [4, 4]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Rótulo da distância
        ctx.font = "10px monospace";
        ctx.fillStyle = "rgba(34, 197, 94, 0.5)";
        ctx.fillText(`${dist}km`, cx + 4, cy - r + 12);
      });

      // Eixos em cruz (N, S, E, O)
      ctx.beginPath();
      ctx.moveTo(cx - maxRadarRadius, cy);
      ctx.lineTo(cx + maxRadarRadius, cy);
      ctx.moveTo(cx, cy - maxRadarRadius);
      ctx.lineTo(cx, cy + maxRadarRadius);
      ctx.strokeStyle = "rgba(34, 197, 94, 0.2)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Graus cardinais
      ctx.font = "bold 11px monospace";
      ctx.fillStyle = "rgba(34, 197, 94, 0.8)";
      ctx.textAlign = "center";
      ctx.fillText("N 360°", cx, cy - maxRadarRadius - 8);
      ctx.fillText("S 180°", cx, cy + maxRadarRadius + 16);
      ctx.fillText("E 090°", cx + maxRadarRadius + 24, cy + 4);
      ctx.fillText("W 270°", cx - maxRadarRadius - 24, cy + 4);

      // Linha rotativa de varrimento de radar
      angleRef.current = (angleRef.current + 0.02) % (Math.PI * 2);
      const sweepAngle = angleRef.current;

      // Setor com rasto de pós-luminescência (fósforo CRT)
      const sweepGradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxRadarRadius);
      sweepGradient.addColorStop(0, "rgba(74, 222, 128, 0.25)");
      sweepGradient.addColorStop(1, "rgba(34, 197, 94, 0.0)");

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, maxRadarRadius, sweepAngle - 0.35, sweepAngle);
      ctx.closePath();
      ctx.fillStyle = sweepGradient;
      ctx.fill();
      ctx.restore();

      // Linha viva da frente de varrimento
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(
        cx + Math.cos(sweepAngle) * maxRadarRadius,
        cy + Math.sin(sweepAngle) * maxRadarRadius
      );
      ctx.strokeStyle = "rgba(134, 239, 172, 0.85)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Centro (Localização do Utilizador)
      ctx.beginPath();
      ctx.arc(cx, cy, 4, 0, Math.PI * 2);
      ctx.fillStyle = "#22c55e";
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Desenho das aeronaves rastreadas
      flights.forEach((flight) => {
        if (flight.latitude === null || flight.longitude === null) return;

        // Calcular rumo relativo e distância
        const dLat = flight.latitude - userLat;
        const dLon =
          (flight.longitude - userLon) * Math.cos((userLat * Math.PI) / 180);

        // Ângulo em relação ao Norte
        const angle = Math.atan2(dLon, dLat); // 0 = Norte, PI/2 = Este
        const distRatio = Math.min(flight.distanceKm / radiusKm, 1);
        const planeR = distRatio * maxRadarRadius;

        // Conversão para coordenadas no ecrã (X = Este/Oeste, Y = Norte/Sul invertido)
        const px = cx + Math.sin(angle) * planeR;
        const py = cy - Math.cos(angle) * planeR;

        // Desenho do alvo da aeronave
        ctx.beginPath();
        ctx.arc(px, py, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = "#38bdf8"; // Azul ciano aviação
        ctx.fill();

        // Vector de rumo / velocidade se disponível
        if (flight.heading !== null) {
          const headingRad = ((flight.heading - 90) * Math.PI) / 180;
          const vectorLen = 14;
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(
            px + Math.cos(headingRad) * vectorLen,
            py + Math.sin(headingRad) * vectorLen
          );
          ctx.strokeStyle = "rgba(56, 189, 248, 0.7)";
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }

        // Rótulo da aeronave (Callsign + Altitude)
        ctx.font = "9px monospace";
        ctx.fillStyle = "#e0f2fe";
        ctx.textAlign = "left";
        const altText = flight.altitudeFeet ? `${flight.altitudeFeet}ft` : "GND";
        ctx.fillText(`${flight.callsign}`, px + 6, py - 4);
        ctx.fillStyle = "rgba(186, 230, 253, 0.7)";
        ctx.fillText(`${altText} • ${flight.distanceKm}km`, px + 6, py + 6);
      });

      animFrameId.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [userLat, userLon, radiusKm, flights]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-35 transition-opacity duration-1000">
      <canvas ref={canvasRef} className="w-full h-full block" />
      {/* Linhas de grelha CRT scanline para ambiente de aeroporto */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.35) 50%)",
          backgroundSize: "100% 4px",
        }}
      />
    </div>
  );
};
