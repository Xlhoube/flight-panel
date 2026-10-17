/**
 * Catálogo e Base de Dados de Aeronaves (ICAO Doc 8643)
 * Especializado em Jatos Executivos / Particulares, Linhas Aéreas Comerciais e Aeronaves Militares.
 */

export interface InfoAeronave {
  modelo: string;       // Designação limpa para display em matriz LED (máx. ~14 carateres)
  fabricante: string;   // Nome oficial do fabricante aeronáutico
  classe?: string;      // Ex: "Very Light Jet", "Super Midsize Jet", "Ultra Long Range", etc.
  categoria?: "executivo" | "comercial" | "militar" | "geral" | "helicoptero";
}

export const AERONAVES_DB: Record<string, InfoAeronave> = {
  // ─── JATOS EXECUTIVOS E PARTICULARES (BUSINESS & PRIVATE JETS) ───────────────
  // Honda Aircraft Company
  HDJT: { modelo: "HONDAJET", fabricante: "HONDA AIRCRAFT", classe: "Very Light Jet", categoria: "executivo" },

  // Embraer Executive Jets
  E50P: { modelo: "PHENOM 100", fabricante: "EMBRAER", classe: "Very Light Jet", categoria: "executivo" },
  E55P: { modelo: "PHENOM 300", fabricante: "EMBRAER", classe: "Light Jet", categoria: "executivo" },
  E545: { modelo: "PRAETOR 500", fabricante: "EMBRAER", classe: "Midsize Jet", categoria: "executivo" },
  E550: { modelo: "PRAETOR 600", fabricante: "EMBRAER", classe: "Super Midsize", categoria: "executivo" },
  E135: { modelo: "LEGACY 600", fabricante: "EMBRAER", classe: "Large Jet", categoria: "executivo" },
  E145: { modelo: "LEGACY 650", fabricante: "EMBRAER", classe: "Large Jet", categoria: "executivo" },
  E390: { modelo: "KC-390 MILL", fabricante: "EMBRAER", classe: "Military Transport", categoria: "militar" },

  // Cessna / Textron Aviation (Citations)
  C510: { modelo: "CITATION MUST", fabricante: "CESSNA", classe: "Very Light Jet", categoria: "executivo" },
  C525: { modelo: "CITATION M2", fabricante: "CESSNA", classe: "Light Jet", categoria: "executivo" },
  C25A: { modelo: "CITATION CJ2", fabricante: "CESSNA", classe: "Light Jet", categoria: "executivo" },
  C25B: { modelo: "CITATION CJ3", fabricante: "CESSNA", classe: "Light Jet", categoria: "executivo" },
  C25C: { modelo: "CITATION CJ4", fabricante: "CESSNA", classe: "Light Jet", categoria: "executivo" },
  C550: { modelo: "CITATION II", fabricante: "CESSNA", classe: "Light Jet", categoria: "executivo" },
  C55B: { modelo: "CITATION BRAVO", fabricante: "CESSNA", classe: "Light Jet", categoria: "executivo" },
  C560: { modelo: "CITATION V", fabricante: "CESSNA", classe: "Light Jet", categoria: "executivo" },
  C56X: { modelo: "CITATION XLS", fabricante: "CESSNA", classe: "Midsize Jet", categoria: "executivo" },
  C650: { modelo: "CITATION III", fabricante: "CESSNA", classe: "Midsize Jet", categoria: "executivo" },
  C680: { modelo: "CITATION SOV", fabricante: "CESSNA", classe: "Super Midsize", categoria: "executivo" },
  C68A: { modelo: "CITATION LAT", fabricante: "CESSNA", classe: "Midsize Jet", categoria: "executivo" },
  C700: { modelo: "CITATION LONG", fabricante: "CESSNA", classe: "Super Midsize", categoria: "executivo" },
  C750: { modelo: "CITATION X", fabricante: "CESSNA", classe: "Super Midsize", categoria: "executivo" },

  // Bombardier Aerospace / Canadair (Challenger, Global, Learjet)
  CL30: { modelo: "CHALLENGER 300", fabricante: "BOMBARDIER", classe: "Super Midsize", categoria: "executivo" },
  CL35: { modelo: "CHALLENGER 350", fabricante: "BOMBARDIER", classe: "Super Midsize", categoria: "executivo" },
  CL60: { modelo: "CHALLENGER 600", fabricante: "BOMBARDIER", classe: "Large Jet", categoria: "executivo" },
  CL64: { modelo: "CHALLENGER 604", fabricante: "BOMBARDIER", classe: "Large Jet", categoria: "executivo" },
  CL65: { modelo: "CHALLENGER 605", fabricante: "BOMBARDIER", classe: "Large Jet", categoria: "executivo" },
  GLEX: { modelo: "GLOBAL EXP", fabricante: "BOMBARDIER", classe: "Ultra Long Range", categoria: "executivo" },
  GL5T: { modelo: "GLOBAL 5000", fabricante: "BOMBARDIER", classe: "Ultra Long Range", categoria: "executivo" },
  GL6T: { modelo: "GLOBAL 6000", fabricante: "BOMBARDIER", classe: "Ultra Long Range", categoria: "executivo" },
  GL7T: { modelo: "GLOBAL 7500", fabricante: "BOMBARDIER", classe: "Ultra Long Range", categoria: "executivo" },
  GL8T: { modelo: "GLOBAL 8000", fabricante: "BOMBARDIER", classe: "Ultra Long Range", categoria: "executivo" },
  LJ31: { modelo: "LEARJET 31", fabricante: "BOMBARDIER", classe: "Light Jet", categoria: "executivo" },
  LJ35: { modelo: "LEARJET 35", fabricante: "BOMBARDIER", classe: "Light Jet", categoria: "executivo" },
  LJ40: { modelo: "LEARJET 40", fabricante: "BOMBARDIER", classe: "Light Jet", categoria: "executivo" },
  LJ45: { modelo: "LEARJET 45", fabricante: "BOMBARDIER", classe: "Super Light Jet", categoria: "executivo" },
  LJ60: { modelo: "LEARJET 60", fabricante: "BOMBARDIER", classe: "Midsize Jet", categoria: "executivo" },
  LJ70: { modelo: "LEARJET 70", fabricante: "BOMBARDIER", classe: "Light Jet", categoria: "executivo" },
  LJ75: { modelo: "LEARJET 75", fabricante: "BOMBARDIER", classe: "Light Jet", categoria: "executivo" },

  // Gulfstream Aerospace
  G150: { modelo: "GULFSTREAM G150", fabricante: "GULFSTREAM", classe: "Midsize Jet", categoria: "executivo" },
  G200: { modelo: "GULFSTREAM G200", fabricante: "GULFSTREAM", classe: "Super Midsize", categoria: "executivo" },
  G280: { modelo: "GULFSTREAM G280", fabricante: "GULFSTREAM", classe: "Super Midsize", categoria: "executivo" },
  GLF4: { modelo: "GULFSTREAM G450", fabricante: "GULFSTREAM", classe: "Large Jet", categoria: "executivo" },
  GLF5: { modelo: "GULFSTREAM G550", fabricante: "GULFSTREAM", classe: "Ultra Long Range", categoria: "executivo" },
  GLF6: { modelo: "GULFSTREAM G650", fabricante: "GULFSTREAM", classe: "Ultra Long Range", categoria: "executivo" },
  GA5C: { modelo: "GULFSTREAM G500", fabricante: "GULFSTREAM", classe: "Ultra Long Range", categoria: "executivo" },
  GA6C: { modelo: "GULFSTREAM G600", fabricante: "GULFSTREAM", classe: "Ultra Long Range", categoria: "executivo" },
  G700: { modelo: "GULFSTREAM G700", fabricante: "GULFSTREAM", classe: "Ultra Long Range", categoria: "executivo" },
  G800: { modelo: "GULFSTREAM G800", fabricante: "GULFSTREAM", classe: "Ultra Long Range", categoria: "executivo" },

  // Dassault Aviation (Falcon)
  FA10: { modelo: "FALCON 10", fabricante: "DASSAULT", classe: "Light Jet", categoria: "executivo" },
  FA20: { modelo: "FALCON 20", fabricante: "DASSAULT", classe: "Midsize Jet", categoria: "executivo" },
  FA50: { modelo: "FALCON 50", fabricante: "DASSAULT", classe: "Super Midsize", categoria: "executivo" },
  F900: { modelo: "FALCON 900", fabricante: "DASSAULT", classe: "Large Jet", categoria: "executivo" },
  F2TH: { modelo: "FALCON 2000", fabricante: "DASSAULT", classe: "Large Jet", categoria: "executivo" },
  FA7X: { modelo: "FALCON 7X", fabricante: "DASSAULT", classe: "Ultra Long Range", categoria: "executivo" },
  FA8X: { modelo: "FALCON 8X", fabricante: "DASSAULT", classe: "Ultra Long Range", categoria: "executivo" },
  FA6X: { modelo: "FALCON 6X", fabricante: "DASSAULT", classe: "Ultra Long Range", categoria: "executivo" },

  // Pilatus Aircraft
  PC12: { modelo: "PILATUS PC-12", fabricante: "PILATUS", classe: "Single Turboprop", categoria: "executivo" },
  PC24: { modelo: "PILATUS PC-24", fabricante: "PILATUS", classe: "Super Versatile", categoria: "executivo" },
  PC21: { modelo: "PILATUS PC-21", fabricante: "PILATUS", classe: "Military Trainer", categoria: "militar" },

  // Beechcraft / Raytheon / Hawker
  BE9L: { modelo: "KING AIR 90", fabricante: "BEECHCRAFT", classe: "Twin Turboprop", categoria: "executivo" },
  BE20: { modelo: "SUPER KING AIR", fabricante: "BEECHCRAFT", classe: "Twin Turboprop", categoria: "executivo" },
  B350: { modelo: "KING AIR 350", fabricante: "BEECHCRAFT", classe: "Twin Turboprop", categoria: "executivo" },
  BE39: { modelo: "PREMIER I", fabricante: "BEECHCRAFT", classe: "Light Jet", categoria: "executivo" },
  BE40: { modelo: "HAWKER 400XP", fabricante: "BEECHCRAFT", classe: "Light Jet", categoria: "executivo" },
  BE4W: { modelo: "NEXTANT 400XTI", fabricante: "NEXTANT", classe: "Light Jet", categoria: "executivo" },
  H25B: { modelo: "HAWKER 800XP", fabricante: "HAWKER", classe: "Midsize Jet", categoria: "executivo" },
  H25C: { modelo: "HAWKER 1000", fabricante: "HAWKER", classe: "Super Midsize", categoria: "executivo" },

  // Cirrus Aircraft
  SF50: { modelo: "CIRRUS VISION", fabricante: "CIRRUS", classe: "Personal Jet", categoria: "executivo" },
  SR20: { modelo: "CIRRUS SR20", fabricante: "CIRRUS", classe: "Piston Single", categoria: "geral" },
  SR22: { modelo: "CIRRUS SR22", fabricante: "CIRRUS", classe: "Piston Single", categoria: "geral" },

  // Eclipse Aerospace
  EA50: { modelo: "ECLIPSE 500", fabricante: "ECLIPSE", classe: "Very Light Jet", categoria: "executivo" },
  EA55: { modelo: "ECLIPSE 550", fabricante: "ECLIPSE", classe: "Very Light Jet", categoria: "executivo" },

  // Piaggio Aerospace
  P180: { modelo: "AVANTI P180", fabricante: "PIAGGIO", classe: "Twin Turboprop", categoria: "executivo" },

  // Daher / Socata (TBM & Kodiak)
  TBM7: { modelo: "DAHER TBM 700", fabricante: "DAHER", classe: "Single Turboprop", categoria: "executivo" },
  TBM8: { modelo: "DAHER TBM 850", fabricante: "DAHER", classe: "Single Turboprop", categoria: "executivo" },
  TBM9: { modelo: "DAHER TBM 930", fabricante: "DAHER", classe: "Single Turboprop", categoria: "executivo" },
  KODI: { modelo: "DAHER KODIAK", fabricante: "DAHER", classe: "Turboprop Utility", categoria: "geral" },

  // Piper Aircraft
  PA28: { modelo: "PIPER ARCHER", fabricante: "PIPER", classe: "Piston Single", categoria: "geral" },
  PA34: { modelo: "PIPER SENECA", fabricante: "PIPER", classe: "Piston Twin", categoria: "geral" },
  PA46: { modelo: "PIPER MALIBU", fabricante: "PIPER", classe: "Pressurized Single", categoria: "executivo" },
  PAY2: { modelo: "PIPER CHEYENNE", fabricante: "PIPER", classe: "Twin Turboprop", categoria: "executivo" },

  // Grob Aerospace
  G180: { modelo: "GROB SPN", fabricante: "GROB", classe: "Light Jet", categoria: "executivo" },

  // SyberJet Aircraft
  SJ30: { modelo: "SYBERJET SJ30", fabricante: "SYBERJET", classe: "Light Jet", categoria: "executivo" },

  // Mitsubishi / Nextant Aerospace
  MU30: { modelo: "DIAMOND IA", fabricante: "MITSUBISHI", classe: "Light Jet", categoria: "executivo" },
  G90X: { modelo: "NEXTANT G90XT", fabricante: "NEXTANT", classe: "Twin Turboprop", categoria: "executivo" },

  // Israel Aerospace Industries (IAI) / Gulfstream Astra
  ASTR: { modelo: "GULFSTREAM G100", fabricante: "GULFSTREAM", classe: "Midsize Jet", categoria: "executivo" },
  WW24: { modelo: "WESTWIND II", fabricante: "IAI", classe: "Midsize Jet", categoria: "executivo" },

  // Diamond Aircraft
  DA40: { modelo: "DIAMOND DA40", fabricante: "DIAMOND", classe: "Piston Single", categoria: "geral" },
  DA42: { modelo: "DIAMOND DA42", fabricante: "DIAMOND", classe: "Piston Twin", categoria: "geral" },
  DA62: { modelo: "DIAMOND DA62", fabricante: "DIAMOND", classe: "Twin Piston Exec", categoria: "executivo" },

  // Vulcanair & Tecnam (Bimotores executivos / táxi aéreo)
  P68: { modelo: "VULCANAIR P68", fabricante: "VULCANAIR", classe: "Twin Piston", categoria: "executivo" },
  P206: { modelo: "TECNAM P2006T", fabricante: "TECNAM", classe: "Twin Light", categoria: "geral" },
  P201: { modelo: "TECNAM P2012", fabricante: "TECNAM", classe: "Twin Commuter", categoria: "executivo" },

  // ─── LINHAS AÉREAS COMERCIAIS (AIRBUS) ───────────────────────────────────────
  A318: { modelo: "AIRBUS A318", fabricante: "AIRBUS", classe: "Narrow-body", categoria: "comercial" },
  A319: { modelo: "AIRBUS A319", fabricante: "AIRBUS", classe: "Narrow-body", categoria: "comercial" },
  A19N: { modelo: "AIRBUS A319NEO", fabricante: "AIRBUS", classe: "Narrow-body", categoria: "comercial" },
  A320: { modelo: "AIRBUS A320", fabricante: "AIRBUS", classe: "Narrow-body", categoria: "comercial" },
  A20N: { modelo: "AIRBUS A320NEO", fabricante: "AIRBUS", classe: "Narrow-body", categoria: "comercial" },
  A321: { modelo: "AIRBUS A321", fabricante: "AIRBUS", classe: "Narrow-body", categoria: "comercial" },
  A21N: { modelo: "AIRBUS A321NEO", fabricante: "AIRBUS", classe: "Narrow-body", categoria: "comercial" },
  A21X: { modelo: "A321XLR", fabricante: "AIRBUS", classe: "Narrow-body LR", categoria: "comercial" },
  BCS1: { modelo: "AIRBUS A220-100", fabricante: "AIRBUS", classe: "Regional Jet", categoria: "comercial" },
  BCS3: { modelo: "AIRBUS A220-300", fabricante: "AIRBUS", classe: "Regional Jet", categoria: "comercial" },
  A332: { modelo: "AIRBUS A330-200", fabricante: "AIRBUS", classe: "Wide-body", categoria: "comercial" },
  A333: { modelo: "AIRBUS A330-300", fabricante: "AIRBUS", classe: "Wide-body", categoria: "comercial" },
  A338: { modelo: "AIRBUS A330-800", fabricante: "AIRBUS", classe: "Wide-body", categoria: "comercial" },
  A339: { modelo: "AIRBUS A330-900", fabricante: "AIRBUS", classe: "Wide-body", categoria: "comercial" },
  A343: { modelo: "AIRBUS A340-300", fabricante: "AIRBUS", classe: "Wide-body 4-Engine", categoria: "comercial" },
  A346: { modelo: "AIRBUS A340-600", fabricante: "AIRBUS", classe: "Wide-body 4-Engine", categoria: "comercial" },
  A359: { modelo: "AIRBUS A350-900", fabricante: "AIRBUS", classe: "Wide-body Long Range", categoria: "comercial" },
  A35K: { modelo: "A350-1000", fabricante: "AIRBUS", classe: "Wide-body Long Range", categoria: "comercial" },
  A388: { modelo: "AIRBUS A380-800", fabricante: "AIRBUS", classe: "Superjumbo Double-Deck", categoria: "comercial" },
  A306: { modelo: "AIRBUS A300-600", fabricante: "AIRBUS", classe: "Wide-body Freighter", categoria: "comercial" },
  A3ST: { modelo: "BELUGA XL", fabricante: "AIRBUS", classe: "Special Cargo", categoria: "comercial" },

  // ─── LINHAS AÉREAS COMERCIAIS (BOEING) ───────────────────────────────────────
  B737: { modelo: "BOEING 737-700", fabricante: "BOEING", classe: "Narrow-body", categoria: "comercial" },
  B738: { modelo: "BOEING 737-800", fabricante: "BOEING", classe: "Narrow-body", categoria: "comercial" },
  B739: { modelo: "BOEING 737-900", fabricante: "BOEING", classe: "Narrow-body", categoria: "comercial" },
  B37M: { modelo: "B737 MAX 7", fabricante: "BOEING", classe: "Narrow-body", categoria: "comercial" },
  B38M: { modelo: "B737 MAX 8", fabricante: "BOEING", classe: "Narrow-body", categoria: "comercial" },
  B39M: { modelo: "B737 MAX 9", fabricante: "BOEING", classe: "Narrow-body", categoria: "comercial" },
  B3XM: { modelo: "B737 MAX 10", fabricante: "BOEING", classe: "Narrow-body", categoria: "comercial" },
  B744: { modelo: "BOEING 747-400", fabricante: "BOEING", classe: "Wide-body Jumbo", categoria: "comercial" },
  B748: { modelo: "BOEING 747-8I", fabricante: "BOEING", classe: "Wide-body Jumbo", categoria: "comercial" },
  B752: { modelo: "BOEING 757-200", fabricante: "BOEING", classe: "Narrow-body Long Range", categoria: "comercial" },
  B753: { modelo: "BOEING 757-300", fabricante: "BOEING", classe: "Narrow-body", categoria: "comercial" },
  B763: { modelo: "BOEING 767-300", fabricante: "BOEING", classe: "Wide-body", categoria: "comercial" },
  B764: { modelo: "BOEING 767-400", fabricante: "BOEING", classe: "Wide-body", categoria: "comercial" },
  B772: { modelo: "BOEING 777-200", fabricante: "BOEING", classe: "Wide-body", categoria: "comercial" },
  B77L: { modelo: "B777-200LR", fabricante: "BOEING", classe: "Wide-body Long Range", categoria: "comercial" },
  B77W: { modelo: "B777-300ER", fabricante: "BOEING", classe: "Wide-body Flagship", categoria: "comercial" },
  B779: { modelo: "BOEING 777-9", fabricante: "BOEING", classe: "Wide-body Flagship", categoria: "comercial" },
  B788: { modelo: "BOEING 787-8", fabricante: "BOEING", classe: "Dreamliner Wide-body", categoria: "comercial" },
  B789: { modelo: "BOEING 787-9", fabricante: "BOEING", classe: "Dreamliner Wide-body", categoria: "comercial" },
  B78X: { modelo: "BOEING 787-10", fabricante: "BOEING", classe: "Dreamliner Wide-body", categoria: "comercial" },

  // ─── LINHAS AÉREAS REGIONAIS (EMBRAER, ATR, BOMBARDIER, DE HAVILLAND) ─────────
  E170: { modelo: "EMBRAER 170", fabricante: "EMBRAER", classe: "Regional Jet", categoria: "comercial" },
  E175: { modelo: "EMBRAER 175", fabricante: "EMBRAER", classe: "Regional Jet", categoria: "comercial" },
  E190: { modelo: "EMBRAER 190", fabricante: "EMBRAER", classe: "Regional Jet", categoria: "comercial" },
  E195: { modelo: "EMBRAER 195", fabricante: "EMBRAER", classe: "Regional Jet", categoria: "comercial" },
  E290: { modelo: "EMBRAER E190-E2", fabricante: "EMBRAER", classe: "Regional Jet Next-Gen", categoria: "comercial" },
  E295: { modelo: "EMBRAER E195-E2", fabricante: "EMBRAER", classe: "Regional Jet Next-Gen", categoria: "comercial" },
  AT43: { modelo: "ATR 42-300", fabricante: "ATR", classe: "Regional Turboprop", categoria: "comercial" },
  AT45: { modelo: "ATR 42-500", fabricante: "ATR", classe: "Regional Turboprop", categoria: "comercial" },
  AT46: { modelo: "ATR 42-600", fabricante: "ATR", classe: "Regional Turboprop", categoria: "comercial" },
  AT72: { modelo: "ATR 72-200", fabricante: "ATR", classe: "Regional Turboprop", categoria: "comercial" },
  AT75: { modelo: "ATR 72-500", fabricante: "ATR", classe: "Regional Turboprop", categoria: "comercial" },
  AT76: { modelo: "ATR 72-600", fabricante: "ATR", classe: "Regional Turboprop", categoria: "comercial" },
  DH8A: { modelo: "DASH 8-100", fabricante: "DE HAVILLAND", classe: "Regional Turboprop", categoria: "comercial" },
  DH8B: { modelo: "DASH 8-200", fabricante: "DE HAVILLAND", classe: "Regional Turboprop", categoria: "comercial" },
  DH8C: { modelo: "DASH 8-300", fabricante: "DE HAVILLAND", classe: "Regional Turboprop", categoria: "comercial" },
  DH8D: { modelo: "DASH 8-400", fabricante: "DE HAVILLAND", classe: "Regional Turboprop", categoria: "comercial" },
  CRJ1: { modelo: "CRJ-100", fabricante: "BOMBARDIER", classe: "Regional Jet", categoria: "comercial" },
  CRJ2: { modelo: "CRJ-200", fabricante: "BOMBARDIER", classe: "Regional Jet", categoria: "comercial" },
  CRJ7: { modelo: "CRJ-700", fabricante: "BOMBARDIER", classe: "Regional Jet", categoria: "comercial" },
  CRJ9: { modelo: "CRJ-900", fabricante: "BOMBARDIER", classe: "Regional Jet", categoria: "comercial" },
  CRJX: { modelo: "CRJ-1000", fabricante: "BOMBARDIER", classe: "Regional Jet", categoria: "comercial" },

  // ─── MILITARES E FORÇAS AÉREAS ──────────────────────────────────────────────
  H60: { modelo: "UH-60 BLACK HAWK", fabricante: "SIKORSKY", classe: "Military Utility", categoria: "militar" },
  UH60: { modelo: "UH-60 BLACK HAWK", fabricante: "SIKORSKY", classe: "Military Utility", categoria: "militar" },
  S70: { modelo: "SIKORSKY S-70", fabricante: "SIKORSKY", classe: "Military Utility", categoria: "militar" },
  F16: { modelo: "F-16M FALCON", fabricante: "LOCKHEED MARTIN", classe: "Multirole Fighter", categoria: "militar" },
  C130: { modelo: "LOCKHEED C-130H", fabricante: "LOCKHEED MARTIN", classe: "Tactical Transport", categoria: "militar" },
  C390: { modelo: "EMBRAER KC-390", fabricante: "EMBRAER", classe: "Tactical Transport", categoria: "militar" },
  C295: { modelo: "AIRBUS C-295M", fabricante: "AIRBUS", classe: "Tactical Transport", categoria: "militar" },
  E101: { modelo: "EH-101 MERLIN", fabricante: "LEONARDO", classe: "SAR Helicopter", categoria: "militar" },
  A119: { modelo: "AW119 KOALA", fabricante: "LEONARDO", classe: "Light Helicopter", categoria: "militar" },
  EC35: { modelo: "H135", fabricante: "AIRBUS HELICOPTERS", classe: "Twin Helicopter", categoria: "helicoptero" },
  EC45: { modelo: "H145", fabricante: "AIRBUS HELICOPTERS", classe: "Twin Helicopter", categoria: "helicoptero" },
  EC55: { modelo: "H155 DAUPHIN", fabricante: "AIRBUS HELICOPTERS", classe: "VIP Helicopter", categoria: "executivo" },
  EC30: { modelo: "H130", fabricante: "AIRBUS HELICOPTERS", classe: "Single Helicopter", categoria: "helicoptero" },
  AS50: { modelo: "H125 ÉCUREUIL", fabricante: "AIRBUS HELICOPTERS", classe: "Single Helicopter", categoria: "helicoptero" },

  // Leonardo Helicopters (VIP & Executivo)
  A109: { modelo: "AW109 GRAND", fabricante: "LEONARDO", classe: "VIP Helicopter", categoria: "executivo" },
  A139: { modelo: "AW139 VIP", fabricante: "LEONARDO", classe: "VIP Helicopter", categoria: "executivo" },
  A169: { modelo: "AW169 VIP", fabricante: "LEONARDO", classe: "VIP Helicopter", categoria: "executivo" },

  // Sikorsky Aircraft (VIP & Offshore)
  S76: { modelo: "SIKORSKY S-76", fabricante: "SIKORSKY", classe: "Executive Helo", categoria: "executivo" },
  S92: { modelo: "SIKORSKY S-92", fabricante: "SIKORSKY", classe: "Heavy Helo", categoria: "executivo" },

  // Bell Helicopter
  B06: { modelo: "BELL 206 JET", fabricante: "BELL", classe: "Light Turbine Helo", categoria: "helicoptero" },
  B429: { modelo: "BELL 429", fabricante: "BELL", classe: "Twin VIP Helo", categoria: "executivo" },

  // ─── AVIAÇÃO GERAL E ESCOLARES ──────────────────────────────────────────────
  C150: { modelo: "CESSNA 150", fabricante: "CESSNA", classe: "Trainer Single", categoria: "geral" },
  C152: { modelo: "CESSNA 152", fabricante: "CESSNA", classe: "Trainer Single", categoria: "geral" },
  C172: { modelo: "CESSNA 172", fabricante: "CESSNA", classe: "Skyhawk Single", categoria: "geral" },
  C182: { modelo: "CESSNA 182", fabricante: "CESSNA", classe: "Skylane Single", categoria: "geral" },
  C206: { modelo: "CESSNA 206", fabricante: "CESSNA", classe: "Stationair Single", categoria: "geral" },
  C208: { modelo: "CESSNA CARAVAN", fabricante: "CESSNA", classe: "Turboprop Utility", categoria: "geral" },
  R22: { modelo: "ROBINSON R22", fabricante: "ROBINSON", classe: "Light Helicopter", categoria: "helicoptero" },
  R44: { modelo: "ROBINSON R44", fabricante: "ROBINSON", classe: "Light Helicopter", categoria: "helicoptero" },
  R66: { modelo: "ROBINSON R66", fabricante: "ROBINSON", classe: "Turbine Helicopter", categoria: "helicoptero" },
};

/**
 * Resolve o modelo e fabricante com prioridade estrita para o catálogo ICAO.
 * Caso o código não esteja mapeado diretamente, recorre a análise heurística inteligente.
 */
export function resolverInfoAeronave(codAeronaveRaw: string, nomeRaw?: string): InfoAeronave {
  const codLimpo = (codAeronaveRaw || "").trim().toUpperCase();
  const nomeLimpo = (nomeRaw || "").trim().toUpperCase();

  // 1. Verificação direta por código ICAO exato no catálogo
  if (AERONAVES_DB[codLimpo]) {
    return AERONAVES_DB[codLimpo];
  }

  // 2. Verificação de correspondência parcial para variações com hífen (ex: B738-800 -> B738)
  const codBase = codLimpo.replace(/[^A-Z0-9]/g, "").slice(0, 4);
  if (AERONAVES_DB[codBase]) {
    return AERONAVES_DB[codBase];
  }

  // 3. Heurística e resolução inteligente para modelos não catalogados
  let modelo = codLimpo || "AERONAVE";
  let fabricante = "AERONAVE COMERCIAL";

  // Honda
  if (/^HDJT|HONDA/i.test(codLimpo) || /HONDA\s*JET/i.test(nomeLimpo)) {
    modelo = "HONDAJET";
    fabricante = "HONDA AIRCRAFT";
    return { modelo, fabricante, classe: "Very Light Jet", categoria: "executivo" };
  }

  // Boeing
  if (/^B7\d|B3[789X]M|^7[0-9]{2}|BOEING|DREAMLINER|MAX\s*[7891]/i.test(codLimpo) || /BOEING|B737|B747|B757|B767|B777|B787/i.test(nomeLimpo)) {
    fabricante = "BOEING";
  }
  // Airbus
  else if (/^A[23][0-9]{2}|AIRBUS|^A3[123458][0-9N]|BELUGA|^BCS/i.test(codLimpo) || /AIRBUS|^A[23][0-9]{2}/i.test(nomeLimpo)) {
    fabricante = "AIRBUS";
  }
  // Embraer
  else if (/^E[125][0-9]{2}|^E\d{3}|EMBRAER|KC-?390|PHENOM|PRAETOR|LINEAGE|ERJ/i.test(codLimpo) || /EMBRAER|PHENOM|PRAETOR|E190|E195/i.test(nomeLimpo)) {
    fabricante = "EMBRAER";
  }
  // Cessna / Citation
  else if (/^C[12567][0-9]{2}|CITATION|CESSNA|^C208|^C172|^C152/i.test(codLimpo) || /CESSNA|CITATION/i.test(nomeLimpo)) {
    fabricante = "CESSNA";
  }
  // Bombardier / Canadair / Learjet
  else if (/^CRJ|^CL[36]|DH8|DASH|CHALLENGER|GLOBAL|BOMBARDIER|DHC|^LJ\d/i.test(codLimpo) || /BOMBARDIER|CHALLENGER|GLOBAL|LEARJET/i.test(nomeLimpo)) {
    fabricante = "BOMBARDIER";
  }
  // Gulfstream
  else if (/^GLF|GULFSTREAM|^G[1245678][0-9]{2}|^GA[56]C/i.test(codLimpo) || /GULFSTREAM/i.test(nomeLimpo)) {
    fabricante = "GULFSTREAM";
  }
  // Dassault Falcon
  else if (/^FA[125678]X?|^F900|^F2TH|FALCON|DASSAULT/i.test(codLimpo) || /FALCON|DASSAULT/i.test(nomeLimpo)) {
    fabricante = "DASSAULT";
  }
  // Pilatus
  else if (/^PC[12][124]|PILATUS/i.test(codLimpo) || /PILATUS/i.test(nomeLimpo)) {
    fabricante = "PILATUS";
  }
  // Beechcraft / Hawker
  else if (/^BE[12349]|KING\s*AIR|BEECHCRAFT|SUPER\s*KING|^H25[BC]/i.test(codLimpo) || /BEECHCRAFT|KING\s*AIR|HAWKER/i.test(nomeLimpo)) {
    fabricante = "BEECHCRAFT";
  }
  // Cirrus
  else if (/^SR2[02]|^SF50|CIRRUS/i.test(codLimpo) || /CIRRUS/i.test(nomeLimpo)) {
    fabricante = "CIRRUS";
  }
  // ATR
  else if (/^AT[47][0-9]|ATR/i.test(codLimpo) || /ATR\s*[47]2/i.test(nomeLimpo)) {
    fabricante = "ATR";
  }
  // Sikorsky
  else if (/^H60|^S70|^UH60|BLACK\s*HAWK|SIKORSKY/i.test(codLimpo) || /BLACK\s*HAWK|SIKORSKY/i.test(nomeLimpo)) {
    fabricante = "SIKORSKY";
  }
  // Lockheed Martin
  else if (/^C130|^L100|^F16|LOCKHEED|HERCULES/i.test(codLimpo) || /LOCKHEED|F-16/i.test(nomeLimpo)) {
    fabricante = "LOCKHEED MARTIN";
  }
  // Leonardo / AgustaWestland
  else if (/^A119|^AW1|KOALA|MERLIN|EH101|LEONARDO|AGUSTA/i.test(codLimpo) || /KOALA|MERLIN|AGUSTA|LEONARDO/i.test(nomeLimpo)) {
    fabricante = "LEONARDO";
  }
  // Piper
  else if (/^PA\d{2}|PIPER/i.test(codLimpo) || /PIPER/i.test(nomeLimpo)) {
    fabricante = "PIPER";
  }
  // Robinson
  else if (/^R[246]2|^R44|^R66|ROBINSON/i.test(codLimpo) || /ROBINSON/i.test(nomeLimpo)) {
    fabricante = "ROBINSON";
  }
  // Piaggio Aerospace
  else if (/^P180|AVANTI|PIAGGIO/i.test(codLimpo) || /PIAGGIO|AVANTI/i.test(nomeLimpo)) {
    fabricante = "PIAGGIO";
  }
  // Daher (TBM / Kodiak)
  else if (/^TBM[789]|^KODI|DAHER|SOCATA/i.test(codLimpo) || /DAHER|TBM|KODIAK/i.test(nomeLimpo)) {
    fabricante = "DAHER";
  }
  // Bell Helicopter
  else if (/^B06|^B429|^B407|^B212|BELL/i.test(codLimpo) || /BELL\s*[0-9]/i.test(nomeLimpo)) {
    fabricante = "BELL";
  }
  // Grob Aerospace
  else if (/^G180|^G115|^G120|GROB/i.test(codLimpo) || /GROB/i.test(nomeLimpo)) {
    fabricante = "GROB";
  }
  // Tecnam
  else if (/^P20[0-9]|TECNAM/i.test(codLimpo) || /TECNAM/i.test(nomeLimpo)) {
    fabricante = "TECNAM";
  }
  // Vulcanair
  else if (/^P68|VULCANAIR/i.test(codLimpo) || /VULCANAIR/i.test(nomeLimpo)) {
    fabricante = "VULCANAIR";
  }
  // Fallback inteligente
  else {
    const primeiraPalavra = (nomeLimpo || codLimpo).split(" ")[0];
    if (primeiraPalavra && primeiraPalavra.length >= 3 && !/^\d+$/.test(primeiraPalavra)) {
      fabricante = primeiraPalavra;
    }
  }

  // Formatação do modelo caso seja demasiado longo para display
  if (modelo.length > 14) {
    if (modelo.includes("CITATION")) modelo = "CITATION";
    else if (modelo.includes("CHALLENGER")) modelo = "CHALLENGER";
    else if (modelo.includes("FALCON")) modelo = "FALCON";
    else if (modelo.includes("KING AIR")) modelo = "KING AIR";
    else if (modelo.includes("GLOBAL")) modelo = "GLOBAL EXP";
    else modelo = modelo.slice(0, 14).trim();
  }

  return { modelo, fabricante };
}
