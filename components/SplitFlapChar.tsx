"use client";

import React, { useEffect, useState, useRef } from "react";
import { splitFlapAudio } from "@/lib/sound";

interface SplitFlapCharProps {
  char: string;
  size?: "sm" | "md" | "lg";
  colorTheme?: "white" | "amber" | "green" | "cyan" | "red";
  delayMs?: number;
}

// Conjunto de caracteres analógicos clássicos
const FLAP_CHARACTERS = " ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.:-/*°+";

export const SplitFlapChar: React.FC<SplitFlapCharProps> = ({
  char = " ",
  size = "md",
  colorTheme = "white",
  delayMs = 0,
}) => {
  const targetChar = (char || " ").toUpperCase();
  const [currentChar, setCurrentChar] = useState<string>(targetChar);
  const [previousChar, setPreviousChar] = useState<string>(targetChar);
  const [isFlipping, setIsFlipping] = useState<boolean>(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (targetChar === currentChar) return;

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      let currentIndex = FLAP_CHARACTERS.indexOf(currentChar);
      if (currentIndex === -1) currentIndex = 0;
      const targetIndex = FLAP_CHARACTERS.indexOf(targetChar);
      const safeTargetIndex = targetIndex === -1 ? 0 : targetIndex;

      // Calcular quantos passos mecânicos dar (mínimo 1, máximo 8 para resposta rápida mas orgânica)
      const diff =
        (safeTargetIndex - currentIndex + FLAP_CHARACTERS.length) % FLAP_CHARACTERS.length;
      const stepCount = Math.min(Math.max(diff, 1), 6);

      let step = 0;
      let animChar = currentChar;

      const flipInterval = setInterval(() => {
        step++;
        const nextIdx = (FLAP_CHARACTERS.indexOf(animChar) + 1) % FLAP_CHARACTERS.length;
        const nextChar = step >= stepCount ? targetChar : FLAP_CHARACTERS[nextIdx];

        setPreviousChar(animChar);
        setCurrentChar(nextChar);
        setIsFlipping(true);

        splitFlapAudio.playMechanicalClick(0.8);

        setTimeout(() => {
          setIsFlipping(false);
        }, 110);

        animChar = nextChar;

        if (step >= stepCount || animChar === targetChar) {
          clearInterval(flipInterval);
          setCurrentChar(targetChar);
        }
      }, 75);

      return () => clearInterval(flipInterval);
    }, delayMs);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [targetChar, delayMs, currentChar]);

  // Dimensionamento rigoroso
  const sizeClasses = {
    sm: "w-5 h-7 text-xs",
    md: "w-7 h-10 text-base md:w-8 md:h-11 md:text-lg",
    lg: "w-9 h-12 text-xl md:w-11 md:h-15 md:text-2xl",
  }[size];

  // Paleta de cores analógicas
  const themeTextClasses = {
    white: "text-zinc-100",
    amber: "text-amber-400 font-semibold",
    green: "text-emerald-400 font-semibold",
    cyan: "text-cyan-300 font-semibold",
    red: "text-rose-400 font-semibold",
  }[colorTheme];

  return (
    <div
      className={`relative inline-block select-none font-mono ${sizeClasses} perspective-[600px] mx-[1px]`}
      style={{ perspective: "500px" }}
    >
      {/* Caixa de fundo analógica escura com bisel */}
      <div className="absolute inset-0 bg-zinc-950 rounded-[2px] shadow-[inset_0_1px_2px_rgba(0,0,0,0.8),0_1px_1px_rgba(255,255,255,0.08)] border border-zinc-800/80 overflow-hidden flex flex-col">
        {/* Metade superior (estática ou base) */}
        <div className="relative w-full h-1/2 bg-gradient-to-b from-zinc-900 to-zinc-950 overflow-hidden border-b border-black/90">
          <span
            className={`absolute top-0 left-0 w-full h-[200%] flex items-center justify-center font-bold tracking-tighter ${themeTextClasses}`}
            style={{ lineHeight: 1 }}
          >
            {currentChar}
          </span>
          {/* Sombra de ranhura */}
          <div className="absolute bottom-0 inset-x-0 h-[1px] bg-black/80" />
        </div>

        {/* Metade inferior (estática) */}
        <div className="relative w-full h-1/2 bg-gradient-to-b from-zinc-950 to-zinc-900 overflow-hidden">
          <span
            className={`absolute -top-full left-0 w-full h-[200%] flex items-center justify-center font-bold tracking-tighter ${themeTextClasses}`}
            style={{ lineHeight: 1 }}
          >
            {currentChar}
          </span>
          {/* Brilho suave na parte inferior da aba */}
          <div className="absolute inset-x-0 bottom-0 h-[1px] bg-white/5" />
        </div>
      </div>

      {/* Flap móvel que roda em 3D durante a transição mecânica */}
      {isFlipping && (
        <div
          className="absolute inset-x-0 top-0 h-1/2 origin-bottom bg-gradient-to-b from-zinc-900 to-zinc-950 border border-zinc-800/80 border-b border-black overflow-hidden pointer-events-none"
          style={{
            animation: "flapDown 120ms cubic-bezier(0.4, 0.0, 0.2, 1) forwards",
            transformOrigin: "bottom center",
            backfaceVisibility: "hidden",
            boxShadow: "0 4px 6px rgba(0,0,0,0.6)",
          }}
        >
          <span
            className={`absolute top-0 left-0 w-full h-[200%] flex items-center justify-center font-bold tracking-tighter ${themeTextClasses}`}
            style={{ lineHeight: 1 }}
          >
            {previousChar}
          </span>
        </div>
      )}

      {/* Ranhura central metálica com dobradiça mecânica lateral */}
      <div className="absolute top-1/2 -translate-y-[0.5px] inset-x-0 h-[1.5px] bg-black pointer-events-none z-10 shadow-[0_1px_1px_rgba(255,255,255,0.05)]" />
      <div className="absolute top-1/2 -translate-y-[2px] left-[1px] w-[2px] h-[4px] bg-zinc-700 rounded-full pointer-events-none z-20" />
      <div className="absolute top-1/2 -translate-y-[2px] right-[1px] w-[2px] h-[4px] bg-zinc-700 rounded-full pointer-events-none z-20" />
    </div>
  );
};
