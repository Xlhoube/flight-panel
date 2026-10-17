"use client";

import React from "react";

interface LogoProps {
  className?: string;
}

// ─── 1. HONDA AIRCRAFT COMPANY / HONDAJET ─────────────────────────────────────
export function LogoHonda({ className = "w-full h-full" }: LogoProps) {
  return (
    <div className={`flex flex-col items-center justify-center bg-gradient-to-b from-[#1a1c24] to-[#0c0d12] p-1 rounded-lg border border-red-500/30 shadow-inner ${className}`}>
      {/* Emblema "H" da Honda com gradiente cromado/rubi */}
      <svg className="w-6 h-6 sm:w-8 sm:h-8" viewBox="0 0 100 100" fill="none">
        <defs>
          <linearGradient id="hondaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff4d4d" />
            <stop offset="50%" stopColor="#cc0000" />
            <stop offset="100%" stopColor="#880000" />
          </linearGradient>
        </defs>
        {/* Trapézio curvado icónico */}
        <path
          d="M12 18 C12 18, 50 12, 88 18 C90 35, 86 78, 80 88 C50 94, 50 94, 20 88 C14 78, 10 35, 12 18 Z"
          stroke="url(#hondaGrad)"
          strokeWidth="6"
          fill="#140505"
        />
        {/* Letra H estilizada da Honda */}
        <path
          d="M32 30 L32 76 M68 30 L68 76 M32 50 L68 50"
          stroke="#ffffff"
          strokeWidth="7"
          strokeLinecap="round"
        />
      </svg>
      <span className="font-mono font-black text-[7px] sm:text-[8px] text-red-400 tracking-widest uppercase mt-0.5 leading-none">
        HONDAJET
      </span>
    </div>
  );
}

// ─── 2. CESSNA / TEXTRON AVIATION ─────────────────────────────────────────────
export function LogoCessna({ className = "w-full h-full" }: LogoProps) {
  return (
    <div className={`flex flex-col items-center justify-center bg-gradient-to-b from-[#131b2c] to-[#090d16] p-1 rounded-lg border border-sky-500/30 shadow-inner ${className}`}>
      {/* Asas dinâmicas da Cessna com faixa vermelha e azul */}
      <svg className="w-7 h-5 sm:w-9 sm:h-7" viewBox="0 0 100 60" fill="none">
        <path
          d="M5 38 C25 20, 55 12, 95 10 C70 24, 45 32, 25 44 Z"
          fill="#0055b8"
        />
        <path
          d="M15 42 C35 28, 65 20, 95 18 C72 32, 50 40, 32 48 Z"
          fill="#e01a22"
        />
      </svg>
      <span className="font-mono font-black text-[7px] sm:text-[8px] text-sky-300 tracking-widest uppercase mt-0.5 leading-none">
        CESSNA
      </span>
    </div>
  );
}

// ─── 3. GULFSTREAM AEROSPACE ──────────────────────────────────────────────────
export function LogoGulfstream({ className = "w-full h-full" }: LogoProps) {
  return (
    <div className={`flex flex-col items-center justify-center bg-gradient-to-b from-[#161a28] to-[#0a0d16] p-1 rounded-lg border border-amber-400/40 shadow-inner ${className}`}>
      {/* Escudo / Brasão luxuoso da Gulfstream */}
      <svg className="w-6 h-6 sm:w-8 sm:h-8" viewBox="0 0 100 100" fill="none">
        <circle cx="50" cy="50" r="44" stroke="#d4af37" strokeWidth="4" fill="#0d111b" />
        <path
          d="M20 50 C35 35, 65 35, 80 50 C65 42, 35 42, 20 50 Z"
          fill="#d4af37"
        />
        <path
          d="M50 20 L50 80 M35 60 L50 72 L65 60"
          stroke="#d4af37"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
      </svg>
      <span className="font-mono font-black text-[6px] sm:text-[7px] text-amber-300 tracking-wider uppercase mt-0.5 leading-none">
        GULFSTREAM
      </span>
    </div>
  );
}

// ─── 4. BOMBARDIER AEROSPACE ──────────────────────────────────────────────────
export function LogoBombardier({ className = "w-full h-full" }: LogoProps) {
  return (
    <div className={`flex flex-col items-center justify-center bg-gradient-to-b from-[#181a20] to-[#0a0c10] p-1 rounded-lg border border-neutral-600/40 shadow-inner ${className}`}>
      {/* Flor-de-lis / Três pás aero da Bombardier */}
      <svg className="w-6 h-6 sm:w-7 sm:h-7" viewBox="0 0 100 100" fill="none">
        <path
          d="M50 15 C58 35, 65 45, 85 50 C65 55, 58 65, 50 85 C42 65, 35 55, 15 50 C35 45, 42 35, 50 15 Z"
          fill="#ffffff"
        />
        <circle cx="50" cy="50" r="10" fill="#000000" />
      </svg>
      <span className="font-mono font-black text-[6px] sm:text-[7px] text-neutral-200 tracking-wider uppercase mt-0.5 leading-none">
        BOMBARDIER
      </span>
    </div>
  );
}

// ─── 5. EMBRAER EXECUTIVE JETS ────────────────────────────────────────────────
export function LogoEmbraer({ className = "w-full h-full" }: LogoProps) {
  return (
    <div className={`flex flex-col items-center justify-center bg-gradient-to-b from-[#121826] to-[#080d16] p-1 rounded-lg border border-blue-500/40 shadow-inner ${className}`}>
      {/* Voo estilizado / Asa da Embraer */}
      <svg className="w-7 h-5 sm:w-9 sm:h-7" viewBox="0 0 100 60" fill="none">
        <path
          d="M10 40 C30 25, 60 15, 90 20 C65 28, 40 38, 20 48 Z"
          fill="#00529b"
        />
        <path
          d="M25 46 C45 35, 70 28, 92 30 C72 38, 50 46, 32 52 Z"
          fill="#ffffff"
        />
      </svg>
      <span className="font-mono font-black text-[7px] sm:text-[8px] text-sky-400 tracking-widest uppercase mt-0.5 leading-none">
        EMBRAER
      </span>
    </div>
  );
}

// ─── 6. DASSAULT AVIATION (FALCON) ───────────────────────────────────────────
export function LogoDassault({ className = "w-full h-full" }: LogoProps) {
  return (
    <div className={`flex flex-col items-center justify-center bg-gradient-to-b from-[#181a24] to-[#0a0c14] p-1 rounded-lg border border-emerald-500/30 shadow-inner ${className}`}>
      {/* Trevo e asas delta da Dassault */}
      <svg className="w-6 h-6 sm:w-8 sm:h-8" viewBox="0 0 100 100" fill="none">
        <circle cx="50" cy="50" r="42" stroke="#ffffff" strokeWidth="4" />
        <path
          d="M50 22 L65 65 L50 55 L35 65 Z"
          fill="#00994d"
          stroke="#ffffff"
          strokeWidth="2"
        />
      </svg>
      <span className="font-mono font-black text-[6px] sm:text-[7px] text-emerald-400 tracking-wider uppercase mt-0.5 leading-none">
        DASSAULT
      </span>
    </div>
  );
}

// ─── 7. PILATUS AIRCRAFT ──────────────────────────────────────────────────────
export function LogoPilatus({ className = "w-full h-full" }: LogoProps) {
  return (
    <div className={`flex flex-col items-center justify-center bg-gradient-to-b from-[#221416] to-[#0e0809] p-1 rounded-lg border border-red-500/40 shadow-inner ${className}`}>
      {/* Escudo Suíço da Pilatus */}
      <svg className="w-6 h-6 sm:w-8 sm:h-8" viewBox="0 0 100 100" fill="none">
        <path
          d="M20 20 L80 20 C80 55, 70 75, 50 88 C30 75, 20 55, 20 20 Z"
          fill="#d50000"
          stroke="#ffffff"
          strokeWidth="4"
        />
        {/* Cruz Suíça */}
        <path d="M42 34 H58 V46 H70 V58 H58 V70 H42 V58 H30 V46 H42 Z" fill="#ffffff" />
      </svg>
      <span className="font-mono font-black text-[7px] sm:text-[8px] text-red-300 tracking-widest uppercase mt-0.5 leading-none">
        PILATUS
      </span>
    </div>
  );
}

// ─── 8. CIRRUS AIRCRAFT ───────────────────────────────────────────────────────
export function LogoCirrus({ className = "w-full h-full" }: LogoProps) {
  return (
    <div className={`flex flex-col items-center justify-center bg-gradient-to-b from-[#131b26] to-[#090e15] p-1 rounded-lg border border-cyan-500/30 shadow-inner ${className}`}>
      {/* Vórtice dinâmico circular da Cirrus */}
      <svg className="w-6 h-6 sm:w-8 sm:h-8" viewBox="0 0 100 100" fill="none">
        <circle cx="50" cy="50" r="40" stroke="#00b4d8" strokeWidth="5" strokeDasharray="16 8" />
        <path d="M25 50 Q50 30 75 50 Q50 70 25 50" fill="#00b4d8" />
      </svg>
      <span className="font-mono font-black text-[7px] sm:text-[8px] text-cyan-300 tracking-widest uppercase mt-0.5 leading-none">
        CIRRUS
      </span>
    </div>
  );
}

// ─── 9. BEECHCRAFT ────────────────────────────────────────────────────────────
export function LogoBeechcraft({ className = "w-full h-full" }: LogoProps) {
  return (
    <div className={`flex flex-col items-center justify-center bg-gradient-to-b from-[#201518] to-[#0d090a] p-1 rounded-lg border border-red-500/30 shadow-inner ${className}`}>
      <svg className="w-7 h-5 sm:w-9 sm:h-7" viewBox="0 0 100 60" fill="none">
        <path d="M10 25 C30 15, 70 15, 90 25 C70 35, 30 35, 10 25 Z" fill="#c41230" />
        <path d="M40 20 L60 20 L50 35 Z" fill="#ffffff" />
      </svg>
      <span className="font-mono font-black text-[6px] sm:text-[7px] text-red-300 tracking-wider uppercase mt-0.5 leading-none">
        BEECHCRAFT
      </span>
    </div>
  );
}

// ─── 10. BOEING ───────────────────────────────────────────────────────────────
export function LogoBoeing({ className = "w-full h-full" }: LogoProps) {
  return (
    <div className={`flex flex-col items-center justify-center bg-gradient-to-b from-[#111a28] to-[#080d16] p-1 rounded-lg border border-blue-500/30 shadow-inner ${className}`}>
      <svg className="w-7 h-5 sm:w-9 sm:h-7" viewBox="0 0 100 60" fill="none">
        <circle cx="50" cy="30" r="22" stroke="#0033a0" strokeWidth="5" />
        <path d="M15 30 Q50 5 85 30" stroke="#0033a0" strokeWidth="4" fill="none" />
        <polygon points="50,15 65,40 50,33 35,40" fill="#ffffff" />
      </svg>
      <span className="font-mono font-black text-[7px] sm:text-[8px] text-sky-400 tracking-widest uppercase mt-0.5 leading-none">
        BOEING
      </span>
    </div>
  );
}

// ─── 11. AIRBUS ───────────────────────────────────────────────────────────────
export function LogoAirbus({ className = "w-full h-full" }: LogoProps) {
  return (
    <div className={`flex flex-col items-center justify-center bg-gradient-to-b from-[#121927] to-[#080d16] p-1 rounded-lg border border-sky-500/30 shadow-inner ${className}`}>
      <svg className="w-7 h-5 sm:w-9 sm:h-7" viewBox="0 0 100 60" fill="none">
        <circle cx="35" cy="30" r="18" stroke="#00205b" strokeWidth="5" />
        <circle cx="65" cy="30" r="18" stroke="#00a3e0" strokeWidth="5" />
      </svg>
      <span className="font-mono font-black text-[7px] sm:text-[8px] text-sky-300 tracking-widest uppercase mt-0.5 leading-none">
        AIRBUS
      </span>
    </div>
  );
}

// ─── 12. VIP WINGS (INSÍGNIA DE AVIAÇÃO EXECUTIVA / PRIVADA UNIVERSAL) ────────
export function LogoVipWings({ callsign, className = "w-full h-full" }: LogoProps & { callsign?: string }) {
  const sigla = (callsign || "VIP").slice(0, 4).toUpperCase();
  return (
    <div className={`flex flex-col items-center justify-center bg-gradient-to-b from-[#1e1b14] via-[#12110c] to-[#080705] p-1 rounded-lg border border-amber-500/50 shadow-[0_2px_8px_rgba(217,119,6,0.25)] ${className}`}>
      {/* Asas duplas douradas de piloto privado */}
      <svg className="w-7 h-5 sm:w-9 sm:h-6" viewBox="0 0 100 50" fill="none">
        <defs>
          <linearGradient id="goldWings" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="50%" stopColor="#eab308" />
            <stop offset="100%" stopColor="#854d0e" />
          </linearGradient>
        </defs>
        {/* Asa Esquerda */}
        <path d="M50 25 C35 15, 18 18, 5 30 C15 32, 30 30, 45 28 Z" fill="url(#goldWings)" />
        {/* Asa Direita */}
        <path d="M50 25 C65 15, 82 18, 95 30 C85 32, 70 30, 55 28 Z" fill="url(#goldWings)" />
        {/* Escudo Central com Estrela */}
        <circle cx="50" cy="26" r="8" fill="#1c1917" stroke="url(#goldWings)" strokeWidth="2" />
        <polygon points="50,21 52,25 56,26 53,28 54,32 50,30 46,32 47,28 44,26 48,25" fill="#fef08a" />
      </svg>
      <span className="font-mono font-black text-[6px] sm:text-[7px] text-amber-300 tracking-wider uppercase mt-0.5 leading-none">
        {sigla || "VIP JET"}
      </span>
    </div>
  );
}

// ─── 13. NETJETS (THE PRIVATE JET LEADER) ────────────────────────────────────
export function LogoNetJets({ className = "w-full h-full" }: LogoProps) {
  return (
    <div className={`flex flex-col items-center justify-center bg-gradient-to-b from-[#14151a] to-[#08090c] p-1 rounded-lg border border-neutral-400/40 shadow-inner ${className}`}>
      <svg className="w-7 h-5 sm:w-9 sm:h-7" viewBox="0 0 100 60" fill="none">
        {/* Estrela diamante estilizada com asas geométricas */}
        <polygon points="50,12 55,28 72,30 58,40 62,56 50,46 38,56 42,40 28,30 45,28" fill="#e5e5e5" />
        <circle cx="50" cy="34" r="3" fill="#000000" />
      </svg>
      <span className="font-mono font-black text-[7px] sm:text-[8px] text-neutral-200 tracking-widest uppercase mt-0.5 leading-none">
        NETJETS
      </span>
    </div>
  );
}

// ─── 14. VISTAJET (GLOBAL BUSINESS AVIATION) ──────────────────────────────────
export function LogoVistaJet({ className = "w-full h-full" }: LogoProps) {
  return (
    <div className={`flex flex-col items-center justify-center bg-gradient-to-b from-[#181a1f] to-[#0c0e12] p-1 rounded-lg border border-red-500/40 shadow-inner ${className}`}>
      {/* Listra vermelha carmesim horizontal icónica da VistaJet */}
      <svg className="w-8 h-4 sm:w-10 sm:h-5" viewBox="0 0 100 40" fill="none">
        <line x1="5" y1="20" x2="95" y2="20" stroke="#d90429" strokeWidth="6" strokeLinecap="round" />
        <path d="M50 8 L58 20 L50 32 L42 20 Z" fill="#ffffff" />
      </svg>
      <span className="font-mono font-black text-[6px] sm:text-[7px] text-red-400 tracking-widest uppercase mt-0.5 leading-none">
        VISTAJET
      </span>
    </div>
  );
}

// ─── 15. FLEXJET (PREMIUM FRACTIONAL JETS) ────────────────────────────────────
export function LogoFlexjet({ className = "w-full h-full" }: LogoProps) {
  return (
    <div className={`flex flex-col items-center justify-center bg-gradient-to-b from-[#1a1515] to-[#0d0909] p-1 rounded-lg border border-red-600/30 shadow-inner ${className}`}>
      <svg className="w-7 h-5 sm:w-9 sm:h-6" viewBox="0 0 100 50" fill="none">
        <path d="M15 25 Q35 10 85 15 Q55 25 35 40 Z" fill="#dc2626" />
        <circle cx="78" cy="18" r="4" fill="#fbbf24" />
      </svg>
      <span className="font-mono font-black text-[6px] sm:text-[7px] text-red-300 tracking-widest uppercase mt-0.5 leading-none">
        FLEXJET
      </span>
    </div>
  );
}

// ─── 16. GLOBEAIR (VERY LIGHT JET AIR TAXI) ───────────────────────────────────
export function LogoGlobeAir({ className = "w-full h-full" }: LogoProps) {
  return (
    <div className={`flex flex-col items-center justify-center bg-gradient-to-b from-[#18181c] to-[#0b0b0e] p-1 rounded-lg border border-rose-500/40 shadow-inner ${className}`}>
      <svg className="w-7 h-5 sm:w-8 sm:h-6" viewBox="0 0 100 60" fill="none">
        <circle cx="50" cy="30" r="22" stroke="#e11d48" strokeWidth="4" />
        <path d="M30 30 L70 30 M50 10 L50 50" stroke="#ffffff" strokeWidth="2.5" />
      </svg>
      <span className="font-mono font-black text-[6px] sm:text-[7px] text-rose-300 tracking-widest uppercase mt-0.5 leading-none">
        GLOBEAIR
      </span>
    </div>
  );
}

// ─── 17. DAHER (TBM & KODIAK) ─────────────────────────────────────────────────
export function LogoDaher({ className = "w-full h-full" }: LogoProps) {
  return (
    <div className={`flex flex-col items-center justify-center bg-gradient-to-b from-[#111928] to-[#070b14] p-1 rounded-lg border border-sky-400/40 shadow-inner ${className}`}>
      <svg className="w-7 h-5 sm:w-9 sm:h-6" viewBox="0 0 100 50" fill="none">
        <path d="M20 35 L50 12 L80 35 L65 35 L50 24 L35 35 Z" fill="#38bdf8" />
        <circle cx="50" cy="12" r="3.5" fill="#f97316" />
      </svg>
      <span className="font-mono font-black text-[6px] sm:text-[7px] text-sky-300 tracking-widest uppercase mt-0.5 leading-none">
        DAHER TBM
      </span>
    </div>
  );
}

// ─── 18. PIAGGIO AEROSPACE (AVANTI P180) ──────────────────────────────────────
export function LogoPiaggio({ className = "w-full h-full" }: LogoProps) {
  return (
    <div className={`flex flex-col items-center justify-center bg-gradient-to-b from-[#191924] to-[#0a0a10] p-1 rounded-lg border border-indigo-400/40 shadow-inner ${className}`}>
      <svg className="w-6 h-6 sm:w-7 sm:h-7" viewBox="0 0 100 100" fill="none">
        <circle cx="50" cy="50" r="40" stroke="#6366f1" strokeWidth="4" fill="#11111b" />
        <path d="M40 30 L40 70 M40 30 C58 30, 68 40, 58 52 C52 56, 40 56, 40 56" stroke="#ffffff" strokeWidth="6" strokeLinecap="round" />
      </svg>
      <span className="font-mono font-black text-[6px] sm:text-[7px] text-indigo-300 tracking-widest uppercase mt-0.5 leading-none">
        PIAGGIO
      </span>
    </div>
  );
}

/**
 * Componente que resolve e renderiza o emblema oficial do fabricante da aeronave (OEM)
 * ou do operador líder de aviação executiva caso seja um voo charter.
 */
export function EmblemaFabricante({
  fabricante,
  modelo,
  callsign,
  className,
}: {
  fabricante?: string;
  modelo?: string;
  callsign?: string;
  className?: string;
}) {
  const fab = (fabricante || "").toUpperCase();
  const mod = (modelo || "").toUpperCase();
  const call = (callsign || "").toUpperCase();

  // Operadores de Jatos Executivos e Charters (Aviapages & ICAO Doc 8585)
  if (call.startsWith("NJE") || call.startsWith("EJA") || fab.includes("NETJETS")) {
    return <LogoNetJets className={className} />;
  }
  if (call.startsWith("VJT") || fab.includes("VISTAJET")) {
    return <LogoVistaJet className={className} />;
  }
  if (call.startsWith("LXJ") || call.startsWith("FLJ") || fab.includes("FLEXJET")) {
    return <LogoFlexjet className={className} />;
  }
  if (call.startsWith("GAC") || fab.includes("GLOBEAIR")) {
    return <LogoGlobeAir className={className} />;
  }

  // Fabricantes Aeronáuticos (OEM)
  // Honda
  if (fab.includes("HONDA") || mod.includes("HONDA") || mod.includes("HDJT")) {
    return <LogoHonda className={className} />;
  }
  // Cessna / Textron
  if (fab.includes("CESSNA") || mod.includes("CITATION") || fab.includes("TEXTRON")) {
    return <LogoCessna className={className} />;
  }
  // Gulfstream
  if (fab.includes("GULFSTREAM") || mod.includes("GULFSTREAM") || mod.includes("GLF")) {
    return <LogoGulfstream className={className} />;
  }
  // Bombardier / Learjet
  if (fab.includes("BOMBARDIER") || mod.includes("CHALLENGER") || mod.includes("GLOBAL") || mod.includes("LEARJET") || mod.includes("CL3") || mod.includes("CL6")) {
    return <LogoBombardier className={className} />;
  }
  // Embraer
  if (fab.includes("EMBRAER") || mod.includes("PHENOM") || mod.includes("PRAETOR") || mod.includes("LEGACY") || mod.includes("E50P") || mod.includes("E55P")) {
    return <LogoEmbraer className={className} />;
  }
  // Dassault Falcon
  if (fab.includes("DASSAULT") || mod.includes("FALCON") || mod.includes("FA7X") || mod.includes("FA8X") || mod.includes("F2TH")) {
    return <LogoDassault className={className} />;
  }
  // Pilatus
  if (fab.includes("PILATUS") || mod.includes("PC-12") || mod.includes("PC-24") || mod.includes("PC12") || mod.includes("PC24")) {
    return <LogoPilatus className={className} />;
  }
  // Cirrus
  if (fab.includes("CIRRUS") || mod.includes("VISION") || mod.includes("SF50")) {
    return <LogoCirrus className={className} />;
  }
  // Daher
  if (fab.includes("DAHER") || mod.includes("TBM") || mod.includes("KODIAK")) {
    return <LogoDaher className={className} />;
  }
  // Piaggio
  if (fab.includes("PIAGGIO") || mod.includes("AVANTI") || mod.includes("P180")) {
    return <LogoPiaggio className={className} />;
  }
  // Beechcraft
  if (fab.includes("BEECHCRAFT") || mod.includes("KING AIR") || mod.includes("HAWKER") || mod.includes("BE20") || mod.includes("B350")) {
    return <LogoBeechcraft className={className} />;
  }
  // Boeing
  if (fab.includes("BOEING")) {
    return <LogoBoeing className={className} />;
  }
  // Airbus
  if (fab.includes("AIRBUS")) {
    return <LogoAirbus className={className} />;
  }

  // Fallback para qualquer outro voo executivo / privado
  return <LogoVipWings callsign={callsign} className={className} />;
}
