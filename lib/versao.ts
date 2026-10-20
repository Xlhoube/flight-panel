import { Idioma } from "./i18n";

export interface InfoVersao {
  versao: string;
  buildId: string;
  dataLancamento: string;
  descricao: string;
  descricaoMultilingue?: Partial<Record<Idioma, string>>;
}

export const INFO_VERSAO: InfoVersao = {
  versao: "2.11.0",
  buildId: "build-20261020-v2110",
  dataLancamento: "2026-10-20",
  descricao: "Implementação completa de SEO, Open Graph & Twitter Card com imagem de pré-visualização oficial, Sitemap, Robots e Dados Estruturados Schema.org.",
  descricaoMultilingue: {
    pt: "Implementação completa de SEO, Open Graph & Twitter Card com imagem de pré-visualização oficial, Sitemap, Robots e Dados Estruturados Schema.org.",
    en: "Full SEO, Open Graph & Twitter Card implementation with official app preview image, Sitemap, Robots, and Schema.org Structured Data.",
    fr: "Implémentation complète de SEO, Open Graph et Twitter Card avec image de prévisualisation officielle, Sitemap, Robots et données structurées Schema.org.",
    es: "Implementación completa de SEO, Open Graph y Twitter Card con imagen de vista previa oficial, Sitemap, Robots y datos estructurados Schema.org.",
  },
};
