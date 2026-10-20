import { Idioma } from "./i18n";

export interface InfoVersao {
  versao: string;
  buildId: string;
  dataLancamento: string;
  descricao: string;
  descricaoMultilingue?: Partial<Record<Idioma, string>>;
}

export const INFO_VERSAO: InfoVersao = {
  versao: "2.10.1",
  buildId: "build-20261020-v2101",
  dataLancamento: "2026-10-20",
  descricao: "Internacionalização integral do alerta de nova versão (PWA / Cockpit) nos 4 idiomas (PT, EN, FR, ES) e sincronização reativa imediata.",
  descricaoMultilingue: {
    pt: "Internacionalização integral do alerta de nova versão (PWA / Cockpit) nos 4 idiomas (PT, EN, FR, ES) e sincronização reativa imediata.",
    en: "Full internationalization of the new version alert (PWA / Cockpit) in 4 languages (PT, EN, FR, ES) with instant reactive sync.",
    fr: "Internationalisation complète de l'alerte de nouvelle version (PWA / Cockpit) en 4 langues (PT, EN, FR, ES) avec synchronisation réactive.",
    es: "Internacionalización integral de la alerta de nueva versión (PWA / Cockpit) en 4 idiomas (PT, EN, FR, ES) con sincronización reactiva inmediata.",
  },
};
