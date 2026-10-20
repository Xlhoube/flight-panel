import React from "react";
import { Idioma } from "@/lib/i18n";

export function BandeiraPortugal({ className = "w-5 h-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 600 400" className={className} xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
      <rect width="240" height="400" fill="#046A38" />
      <rect x="240" width="360" height="400" fill="#DA291C" />
      <circle cx="240" cy="200" r="75" fill="#FFD100" stroke="#000000" strokeWidth="4" />
      <path d="M212 165 h56 v52 c0 26 -28 38 -28 38 s-28 -12 -28 -38 z" fill="#FFFFFF" stroke="#DA291C" strokeWidth="5" />
      <path d="M222 175 h36 v26 c0 16 -18 24 -18 24 s-18 -8 -18 -24 z" fill="#DA291C" />
      <circle cx="240" cy="190" r="5" fill="#002B7F" />
      <circle cx="230" cy="182" r="4" fill="#002B7F" />
      <circle cx="250" cy="182" r="4" fill="#002B7F" />
      <circle cx="230" cy="198" r="4" fill="#002B7F" />
      <circle cx="250" cy="198" r="4" fill="#002B7F" />
    </svg>
  );
}

export function BandeiraReinoUnido({ className = "w-5 h-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 30" className={className} xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
      <clipPath id="uk-clip-s">
        <path d="M0,0 v30 h60 v-30 z"/>
      </clipPath>
      <clipPath id="uk-clip-t">
        <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z"/>
      </clipPath>
      <g clipPath="url(#uk-clip-s)">
        <path d="M0,0 v30 h60 v-30 z" fill="#012169"/>
        <path d="M0,0 L60,30 M60,0 L0,30" stroke="#ffffff" strokeWidth="6"/>
        <path d="M0,0 L60,30 M60,0 L0,30" clipPath="url(#uk-clip-t)" stroke="#C8102E" strokeWidth="4"/>
        <path d="M30,0 v30 M0,15 h60" stroke="#ffffff" strokeWidth="10"/>
        <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6"/>
      </g>
    </svg>
  );
}

export function BandeiraFranca({ className = "w-5 h-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 3 2" className={className} xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
      <rect width="1" height="2" fill="#002654" />
      <rect x="1" width="1" height="2" fill="#FFFFFF" />
      <rect x="2" width="1" height="2" fill="#ED2939" />
    </svg>
  );
}

export function BandeiraEspanha({ className = "w-5 h-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 750 500" className={className} xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
      <rect width="750" height="500" fill="#AA151B" />
      <rect y="125" width="750" height="250" fill="#F1BF00" />
      <g transform="translate(180, 200) scale(0.7)">
        <path d="M0 0 h50 v45 c0 25 -25 35 -25 35 s-25 -10 -25 -35 z" fill="#AA151B" stroke="#000" strokeWidth="3" />
        <rect x="10" y="10" width="30" height="30" fill="#F1BF00" />
        <circle cx="25" cy="25" r="7" fill="#002B7F" />
        <path d="M-15 -10 v90 M65 -10 v90" stroke="#C0C0C0" strokeWidth="6" />
        <path d="M-22 -15 h14 M58 -15 h14" stroke="#F1BF00" strokeWidth="4" />
      </g>
    </svg>
  );
}

export function IconeBandeira({ codigo, className = "w-5 h-3.5" }: { codigo: Idioma | string; className?: string }) {
  const containerClass = `inline-flex overflow-hidden rounded-[2px] shadow-[0_0_2px_rgba(0,0,0,0.6)] border border-white/20 shrink-0 ${className}`;
  switch (codigo) {
    case "pt":
      return <BandeiraPortugal className={containerClass} />;
    case "en":
      return <BandeiraReinoUnido className={containerClass} />;
    case "fr":
      return <BandeiraFranca className={containerClass} />;
    case "es":
      return <BandeiraEspanha className={containerClass} />;
    default:
      return null;
  }
}
