"use client";

import React from "react";
import { SplitFlapChar } from "./SplitFlapChar";

interface SplitFlapRowProps {
  text: string;
  length?: number;
  size?: "sm" | "md" | "lg";
  colorTheme?: "white" | "amber" | "green" | "cyan" | "red";
  baseDelayMs?: number;
  staggerMs?: number;
  className?: string;
}

export const SplitFlapRow: React.FC<SplitFlapRowProps> = ({
  text,
  length,
  size = "md",
  colorTheme = "white",
  baseDelayMs = 0,
  staggerMs = 25,
  className = "",
}) => {
  const targetLength = length ?? text.length;
  // Preencher com espaços se o texto for mais curto do que o comprimento desejado
  const paddedText = text.padEnd(targetLength, " ").slice(0, targetLength);
  const chars = paddedText.split("");

  return (
    <div className={`flex items-center flex-nowrap ${className}`}>
      {chars.map((char, index) => (
        <SplitFlapChar
          key={index}
          char={char}
          size={size}
          colorTheme={colorTheme}
          delayMs={baseDelayMs + index * staggerMs}
        />
      ))}
    </div>
  );
};
