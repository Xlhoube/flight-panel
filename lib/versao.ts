import { Idioma } from "./i18n";

export interface InfoVersao {
  versao: string;
  buildId: string;
  dataLancamento: string;
  descricao: string;
  descricaoMultilingue?: Partial<Record<Idioma, string>>;
}

export const INFO_VERSAO: InfoVersao = {
  versao: "2.13.0",
  buildId: "build-20261026-v2130",
  dataLancamento: "2026-10-26",
  descricao: "Novo radar ADS-B de alta precisão geométrica com vetor de rumo (Heading Vector), scope ampliado com anéis métricos calibrados e modal tático HD Cockpit TCAS.",
  descricaoMultilingue: {
    pt: "Novo radar ADS-B de alta precisão geométrica com vetor de rumo (Heading Vector), scope ampliado com anéis métricos calibrados e modal tático HD Cockpit TCAS.",
    en: "New high-precision geometric ADS-B radar with heading vector, enlarged scope with calibrated metric range rings, and HD Cockpit TCAS tactical view modal.",
    fr: "Nouveau radar ADS-B haute précision géométrique avec vecteur de cap, scope agrandi à anneaux métriques calibrés et modal tactique HD Cockpit TCAS.",
    es: "Nuevo radar ADS-B de alta precisión geométrica con vector de rumbo, visor ampliado con anillos métricos calibrados y modal táctico HD Cockpit TCAS.",
  },
};
