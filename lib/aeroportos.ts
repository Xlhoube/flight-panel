// ─── Base Global de Dados e Resolução de Aeroportos (IATA) ──────────────────────
// Cobre mais de 7.900 aeroportos comerciais, civis e cargueiros de todo o mundo.

import { AEROPORTOS_DB } from "./aeroportos-db";

export interface InfoAeroportoCompleta {
  cidade: string;
  aeroporto: string;
  pais: string;
}

// ─── 1. Dicionário de Países ISO (2 letras) para Português Oficial ───────────
const ISO_PARA_PAIS: Record<string, string> = {
  PT: "PORTUGAL",
  ES: "ESPANHA",
  FR: "FRANÇA",
  GB: "REINO UNIDO",
  UK: "REINO UNIDO",
  DE: "ALEMANHA",
  NL: "PAÍSES BAIXOS",
  BE: "BÉLGICA",
  CH: "SUÍÇA",
  IT: "ITÁLIA",
  IE: "IRLANDA",
  AT: "ÁUSTRIA",
  PL: "POLÓNIA",
  LU: "LUXEMBURGO",
  NO: "NORUEGA",
  SE: "SUÉCIA",
  DK: "DINAMARCA",
  FI: "FINLÂNDIA",
  IS: "ISLÂNDIA",
  GR: "GRÉCIA",
  TR: "TURQUIA",
  CZ: "CHÉQUIA",
  HU: "HUNGRIA",
  RO: "ROMÉNIA",
  BG: "BULGÁRIA",
  RS: "SÉRVIA",
  HR: "CROÁCIA",
  SI: "ESLOVÉNIA",
  SK: "ESLOVÁQUIA",
  CY: "CHIPRE",
  MT: "MALTA",
  MA: "MARROCOS",
  DZ: "ARGÉLIA",
  TN: "TUNÍSIA",
  EG: "EGITO",
  CV: "CABO VERDE",
  AO: "ANGOLA",
  MZ: "MOÇAMBIQUE",
  GW: "GUINÉ-BISSAU",
  ST: "SÃO TOMÉ E PRÍNCIPE",
  SN: "SENEGAL",
  ZA: "ÁFRICA DO SUL",
  AE: "EMIRADOS ÁRABES UNIDOS",
  QA: "CATAR",
  SA: "ARÁBIA SAUDITA",
  IL: "ISRAEL",
  JO: "JORDÂNIA",
  LB: "LÍBANO",
  US: "ESTADOS UNIDOS",
  CA: "CANADÁ",
  BR: "BRASIL",
  AR: "ARGENTINA",
  CL: "CHILE",
  CO: "COLÔMBIA",
  PE: "PERU",
  MX: "MÉXICO",
  PA: "PANAMÁ",
  CU: "CUBA",
  DO: "REPÚBLICA DOMINICANA",
  CN: "CHINA",
  JP: "JAPÃO",
  KR: "COREIA DO SUL",
  SG: "SINGAPURA",
  TH: "TAILÂNDIA",
  IN: "ÍNDIA",
  AU: "AUSTRÁLIA",
  NZ: "NOVA ZELÂNDIA",
};

// ─── 2. Sobreposição Consagrada de Alta Qualidade para Aeroportos Ibéricos e Europeus ─
const SOBREPOSICAO_AEROPORTOS: Record<string, InfoAeroportoCompleta> = {
  // Portugal
  OPO: { cidade: "PORTO", aeroporto: "FRANCISCO SÁ CARNEIRO", pais: "PORTUGAL" },
  LIS: { cidade: "LISBOA", aeroporto: "HUMBERTO DELGADO", pais: "PORTUGAL" },
  FAO: { cidade: "FARO", aeroporto: "GAGO COUTINHO", pais: "PORTUGAL" },
  FNC: { cidade: "FUNCHAL", aeroporto: "CRISTIANO RONALDO", pais: "PORTUGAL" },
  PDL: { cidade: "PONTA DELGADA", aeroporto: "JOÃO PAULO II", pais: "PORTUGAL" },
  TER: { cidade: "TERCEIRA", aeroporto: "LAJES", pais: "PORTUGAL" },
  PXO: { cidade: "PORTO SANTO", aeroporto: "PORTO SANTO", pais: "PORTUGAL" },
  SMA: { cidade: "SANTA MARIA", aeroporto: "SANTA MARIA", pais: "PORTUGAL" },
  HOR: { cidade: "HORTA", aeroporto: "HORTA", pais: "PORTUGAL" },
  FLW: { cidade: "FLORES", aeroporto: "FLORES", pais: "PORTUGAL" },
  GRW: { cidade: "GRACIOSA", aeroporto: "GRACIOSA", pais: "PORTUGAL" },
  SJZ: { cidade: "SÃO JORGE", aeroporto: "SÃO JORGE", pais: "PORTUGAL" },
  CVU: { cidade: "CORVO", aeroporto: "CORVO", pais: "PORTUGAL" },
  VRL: { cidade: "VILA REAL", aeroporto: "VILA REAL", pais: "PORTUGAL" },
  BGC: { cidade: "BRAGANÇA", aeroporto: "BRAGANÇA", pais: "PORTUGAL" },
  CAT: { cidade: "CASCAIS", aeroporto: "CASCAIS TIRES", pais: "PORTUGAL" },
  PRM: { cidade: "PORTIMÃO", aeroporto: "AERÓDROMO DE PORTIMÃO", pais: "PORTUGAL" },
  VSE: { cidade: "VISEU", aeroporto: "GONÇALVES LOBATO", pais: "PORTUGAL" },
  COI: { cidade: "COIMBRA", aeroporto: "BISSAIA BARRETO", pais: "PORTUGAL" },
  CHV: { cidade: "CHAVES", aeroporto: "AERÓDROMO DE CHAVES", pais: "PORTUGAL" },
  EVR: { cidade: "ÉVORA", aeroporto: "AERÓDROMO DE ÉVORA", pais: "PORTUGAL" },
  BYJ: { cidade: "BEJA", aeroporto: "BA11 BEJA", pais: "PORTUGAL" },
  OVR: { cidade: "OVAR", aeroporto: "BA8 OVAR", pais: "PORTUGAL" },
  MTO: { cidade: "MONTIJO", aeroporto: "BA6 MONTIJO", pais: "PORTUGAL" },
  MTR: { cidade: "MONTE REAL", aeroporto: "BA5 MONTE REAL", pais: "PORTUGAL" },

  // Espanha
  MAD: { cidade: "MADRID", aeroporto: "ADOLFO SUÁREZ BARAJAS", pais: "ESPANHA" },
  BCN: { cidade: "BARCELONA", aeroporto: "JOSEP TARRADELLAS EL PRAT", pais: "ESPANHA" },
  VLC: { cidade: "VALÊNCIA", aeroporto: "MANISES", pais: "ESPANHA" },
  SVQ: { cidade: "SEVILHA", aeroporto: "SAN PABLO", pais: "ESPANHA" },
  AGP: { cidade: "MÁLAGA", aeroporto: "COSTA DEL SOL", pais: "ESPANHA" },
  ALC: { cidade: "ALICANTE", aeroporto: "ELCHE MIGUEL HERNÁNDEZ", pais: "ESPANHA" },
  BIO: { cidade: "BILBAO", aeroporto: "LOIU", pais: "ESPANHA" },
  SCQ: { cidade: "SANTIAGO", aeroporto: "ROSALÍA DE CASTRO", pais: "ESPANHA" },
  VGO: { cidade: "VIGO", aeroporto: "PEINADOR", pais: "ESPANHA" },
  LCG: { cidade: "CORUNHA", aeroporto: "ALVEDRO", pais: "ESPANHA" },
  VIT: { cidade: "VITÓRIA", aeroporto: "FORONDA", pais: "ESPANHA" },
  ZAZ: { cidade: "SARAGOÇA", aeroporto: "ZARAGOZA (BASE AÉREA)", pais: "ESPANHA" },
  OVD: { cidade: "ASTÚRIAS", aeroporto: "ASTURIAS", pais: "ESPANHA" },
  SDR: { cidade: "SANTANDER", aeroporto: "SEVE BALLESTEROS", pais: "ESPANHA" },
  EAS: { cidade: "SAN SEBASTIÁN", aeroporto: "SAN SEBASTIÁN", pais: "ESPANHA" },
  PNA: { cidade: "PAMPLONA", aeroporto: "PAMPLONA", pais: "ESPANHA" },
  VLL: { cidade: "VALLADOLID", aeroporto: "VALLADOLID", pais: "ESPANHA" },
  SLM: { cidade: "SALAMANCA", aeroporto: "MATACÁN", pais: "ESPANHA" },
  BJZ: { cidade: "BADAJOZ", aeroporto: "TALAVERA LA REAL", pais: "ESPANHA" },
  GRX: { cidade: "GRANADA", aeroporto: "FEDERICO GARCÍA LORCA", pais: "ESPANHA" },
  XRY: { cidade: "JEREZ", aeroporto: "LA PARRA", pais: "ESPANHA" },
  LEI: { cidade: "ALMERÍA", aeroporto: "ALMERÍA", pais: "ESPANHA" },
  RMU: { cidade: "MÚRCIA", aeroporto: "REGIÓN DE MURCIA", pais: "ESPANHA" },
  CDT: { cidade: "CASTELLÓN", aeroporto: "CASTELLÓN-COSTA AZAHAR", pais: "ESPANHA" },
  REU: { cidade: "REUS", aeroporto: "REUS", pais: "ESPANHA" },
  GRO: { cidade: "GIRONA", aeroporto: "COSTA BRAVA", pais: "ESPANHA" },
  LEN: { cidade: "LEÃO", aeroporto: "VIRGEN DEL CAMINO", pais: "ESPANHA" },
  RGS: { cidade: "BURGOS", aeroporto: "VILLAFRÍA", pais: "ESPANHA" },
  PMI: { cidade: "PALMA MAIORCA", aeroporto: "SON SANT JOAN", pais: "ESPANHA" },
  IBZ: { cidade: "IBIZA", aeroporto: "ES CODOLAR", pais: "ESPANHA" },
  MAH: { cidade: "MENORCA", aeroporto: "MENORCA", pais: "ESPANHA" },
  TFS: { cidade: "TENERIFE SUL", aeroporto: "REINA SOFÍA", pais: "ESPANHA" },
  TFN: { cidade: "TENERIFE NORTE", aeroporto: "CIUDAD DE LA LAGUNA", pais: "ESPANHA" },
  LPA: { cidade: "GRAN CANARIA", aeroporto: "GANDO", pais: "ESPANHA" },
  ACE: { cidade: "LANZAROTE", aeroporto: "CÉSAR MANRIQUE", pais: "ESPANHA" },
  FUE: { cidade: "FUERTEVENTURA", aeroporto: "EL MATORRAL", pais: "ESPANHA" },
  SPC: { cidade: "LA PALMA", aeroporto: "VILLA DE MAZO", pais: "ESPANHA" },

  // Alemanha e Hubs DHL/Carga
  LEJ: { cidade: "LEIPZIG", aeroporto: "LEIPZIG/HALLE (HUB DHL)", pais: "ALEMANHA" },
  CGN: { cidade: "COLÓNIA", aeroporto: "KONRAD ADENAUER", pais: "ALEMANHA" },
  FRA: { cidade: "FRANKFURT", aeroporto: "FRANKFURT MAIN", pais: "ALEMANHA" },
  HHN: { cidade: "FRANKFURT-HAHN", aeroporto: "HAHN", pais: "ALEMANHA" },
  MUC: { cidade: "MUNIQUE", aeroporto: "FRANZ JOSEF STRAUSS", pais: "ALEMANHA" },
  BER: { cidade: "BERLIM", aeroporto: "WILLY BRANDT", pais: "ALEMANHA" },
  HAM: { cidade: "HAMBURGO", aeroporto: "HELMUT SCHMIDT", pais: "ALEMANHA" },
  DUS: { cidade: "DÜSSELDORF", aeroporto: "DÜSSELDORF", pais: "ALEMANHA" },
  STR: { cidade: "ESTUGARDA", aeroporto: "MANFRED ROMMEL", pais: "ALEMANHA" },
  NUE: { cidade: "NUREMBERGA", aeroporto: "ALBRECHT DÜRER", pais: "ALEMANHA" },
  HAJ: { cidade: "HANNOVER", aeroporto: "LANGENHAGEN", pais: "ALEMANHA" },
  BRE: { cidade: "BREMEN", aeroporto: "HANS KOSCHNICK", pais: "ALEMANHA" },
  DTM: { cidade: "DORTMUND", aeroporto: "DORTMUND", pais: "ALEMANHA" },

  // Bélgica, Holanda e Luxemburgo
  LGG: { cidade: "LIÈGE", aeroporto: "LIÈGE AIRPORT (CARGO HUB)", pais: "BÉLGICA" },
  BRU: { cidade: "BRUXELAS", aeroporto: "ZAVENTEM", pais: "BÉLGICA" },
  CRL: { cidade: "CHARLEROI", aeroporto: "BRUSSELS SOUTH", pais: "BÉLGICA" },
  AMS: { cidade: "AMESTERDÃO", aeroporto: "SCHIPHOL", pais: "PAÍSES BAIXOS" },
  EIN: { cidade: "EINDHOVEN", aeroporto: "EINDHOVEN", pais: "PAÍSES BAIXOS" },
  RTM: { cidade: "ROTERDÃO", aeroporto: "THE HAGUE", pais: "PAÍSES BAIXOS" },
  MST: { cidade: "MAASTRICHT", aeroporto: "AACHEN", pais: "PAÍSES BAIXOS" },
  LUX: { cidade: "LUXEMBURGO", aeroporto: "FINDEL (CARGOLUX)", pais: "LUXEMBURGO" },

  // França
  CDG: { cidade: "PARIS", aeroporto: "CHARLES DE GAULLE", pais: "FRANÇA" },
  ORY: { cidade: "PARIS", aeroporto: "ORLY", pais: "FRANÇA" },
  BVA: { cidade: "PARIS", aeroporto: "BEAUVAIS-TILLÉ", pais: "FRANÇA" },
  LYS: { cidade: "LYON", aeroporto: "SAINT-EXUPÉRY", pais: "FRANÇA" },
  MRS: { cidade: "MARSELHA", aeroporto: "MARSEILLE PROVENCE", pais: "FRANÇA" },
  NCE: { cidade: "NICE", aeroporto: "CÔTE D'AZUR", pais: "FRANÇA" },
  TLS: { cidade: "TOULOUSE", aeroporto: "BLAGNAC", pais: "FRANÇA" },
  BOD: { cidade: "BORDEUS", aeroporto: "MÉRIGNAC", pais: "FRANÇA" },
  NTE: { cidade: "NANTES", aeroporto: "ATLANTIQUE", pais: "FRANÇA" },
  BIQ: { cidade: "BIARRITZ", aeroporto: "PAYS BASQUE", pais: "FRANÇA" },
  BSL: { cidade: "BASILEIA", aeroporto: "EUROAIRPORT", pais: "SUÍÇA" },
  MLH: { cidade: "MULHOUSE", aeroporto: "EUROAIRPORT", pais: "FRANÇA" },

  // Reino Unido e Irlanda
  LHR: { cidade: "LONDRES", aeroporto: "HEATHROW", pais: "REINO UNIDO" },
  LGW: { cidade: "LONDRES", aeroporto: "GATWICK", pais: "REINO UNIDO" },
  STN: { cidade: "LONDRES", aeroporto: "STANSTED", pais: "REINO UNIDO" },
  LTN: { cidade: "LONDRES", aeroporto: "LUTON", pais: "REINO UNIDO" },
  LCY: { cidade: "LONDRES", aeroporto: "LONDON CITY", pais: "REINO UNIDO" },
  SEN: { cidade: "LONDRES", aeroporto: "SOUTHEND", pais: "REINO UNIDO" },
  MAN: { cidade: "MANCHESTER", aeroporto: "MANCHESTER", pais: "REINO UNIDO" },
  BHX: { cidade: "BIRMINGHAM", aeroporto: "BIRMINGHAM", pais: "REINO UNIDO" },
  EMA: { cidade: "EAST MIDLANDS", aeroporto: "EAST MIDLANDS (CARGO HUB)", pais: "REINO UNIDO" },
  EDI: { cidade: "EDIMBURGO", aeroporto: "EDINBURGH", pais: "REINO UNIDO" },
  GLA: { cidade: "GLASGOW", aeroporto: "GLASGOW", pais: "REINO UNIDO" },
  BRS: { cidade: "BRISTOL", aeroporto: "BRISTOL", pais: "REINO UNIDO" },
  LPL: { cidade: "LIVERPOOL", aeroporto: "JOHN LENNON", pais: "REINO UNIDO" },
  QUA: { cidade: "AMESBURY", aeroporto: "MOD BOSCOMBE DOWN", pais: "REINO UNIDO" },
  BZZ: { cidade: "OXFORD", aeroporto: "RAF BRIZE NORTON", pais: "REINO UNIDO" },
  WAD: { cidade: "LINCOLN", aeroporto: "RAF WADDINGTON", pais: "REINO UNIDO" },
  FAB: { cidade: "FARNBOROUGH", aeroporto: "FARNBOROUGH", pais: "REINO UNIDO" },
  DUB: { cidade: "DUBLIN", aeroporto: "DUBLIN", pais: "IRLANDA" },
  SNN: { cidade: "SHANNON", aeroporto: "SHANNON", pais: "IRLANDA" },
  ORK: { cidade: "CORK", aeroporto: "CORK", pais: "IRLANDA" },

  // Itália e Suíça
  FCO: { cidade: "ROMA", aeroporto: "LEONARDO DA VINCI", pais: "ITÁLIA" },
  CIA: { cidade: "ROMA", aeroporto: "CIAMPINO", pais: "ITÁLIA" },
  MXP: { cidade: "MILÃO", aeroporto: "MALPENSA", pais: "ITÁLIA" },
  LIN: { cidade: "MILÃO", aeroporto: "LINATE", pais: "ITÁLIA" },
  BGY: { cidade: "BÉRGAMO", aeroporto: "ORIO AL SERIO (DHL HUB)", pais: "ITÁLIA" },
  VCE: { cidade: "VENEZA", aeroporto: "MARCO POLO", pais: "ITÁLIA" },
  NAP: { cidade: "NÁPOLES", aeroporto: "CAPODICHINO", pais: "ITÁLIA" },
  BLQ: { cidade: "BOLONHA", aeroporto: "GUGLIELMO MARCONI", pais: "ITÁLIA" },
  ZRH: { cidade: "ZURIQUE", aeroporto: "KLOTEN", pais: "SUÍÇA" },
  GVA: { cidade: "GENEBRA", aeroporto: "COINTRIN", pais: "SUÍÇA" },
};

// ─── 3. Função Principal de Resolução Completa de Aeroportos ─────────────────

export function obterDadosAeroporto(codigo?: string, dicas?: { nome?: string; cidade?: string; pais?: string }): InfoAeroportoCompleta {
  const cod = (codigo || "").trim().toUpperCase();

  // 1. Verificar sobreposição prioritária de alta qualidade
  if (SOBREPOSICAO_AEROPORTOS[cod]) {
    return { ...SOBREPOSICAO_AEROPORTOS[cod] };
  }

  // 2. Verificar base de dados mundial (7.900+ aeroportos IATA)
  const dbItem = AEROPORTOS_DB[cod];
  if (dbItem) {
    const paisNome = ISO_PARA_PAIS[dbItem.p.toUpperCase()] || dbItem.p || "";
    let cidadeNome = dbItem.c.toUpperCase().trim();
    let aeroportoNome = dbItem.n.toUpperCase().trim();

    // Limpar sufixos redundantes
    aeroportoNome = aeroportoNome
      .replace(/\s+AIRPORT/i, "")
      .replace(/\s+INTERNATIONAL/i, "")
      .replace(/\s+INTL/i, "")
      .trim();

    if (!cidadeNome && aeroportoNome) {
      cidadeNome = aeroportoNome;
    }

    return {
      cidade: cidadeNome || cod,
      aeroporto: aeroportoNome || cidadeNome || cod,
      pais: paisNome || "INTERNACIONAL",
    };
  }

  // 3. Fallback inteligente através de dicas recebidas da API ADS-B
  if (dicas) {
    let cidade = (dicas.cidade || "").toUpperCase().trim();
    let aeroporto = (dicas.nome || "").toUpperCase().trim();
    let pais = (dicas.pais || "").toUpperCase().trim();

    if (pais && ISO_PARA_PAIS[pais]) {
      pais = ISO_PARA_PAIS[pais];
    }

    aeroporto = aeroporto
      .replace(/\s+AIRPORT/i, "")
      .replace(/\s+INTERNATIONAL/i, "")
      .replace(/\s+INTL/i, "")
      .trim();

    if (!cidade && aeroporto) cidade = aeroporto;
    if (!aeroporto && cidade) aeroporto = cidade;

    if (cidade || aeroporto || pais) {
      return {
        cidade: cidade || cod,
        aeroporto: aeroporto || cidade || cod,
        pais: pais || "INTERNACIONAL",
      };
    }
  }

  // 4. Último recurso: manter código e país genérico
  return {
    cidade: cod || "DESCONHECIDO",
    aeroporto: cod || "AERÓDROMO",
    pais: "",
  };
}

export function obterNomeAeroporto(codigo?: string, nomeRecebido?: string): string {
  const dados = obterDadosAeroporto(codigo, { nome: nomeRecebido });
  return dados.aeroporto;
}

export function obterPaisDoAeroporto(codigo?: string, paisRecebido?: string): string {
  const dados = obterDadosAeroporto(codigo, { pais: paisRecebido });
  return dados.pais;
}

export function obterCidadeDoAeroporto(codigo?: string, cidadeRecebida?: string): string {
  const dados = obterDadosAeroporto(codigo, { cidade: cidadeRecebida });
  return dados.cidade;
}
