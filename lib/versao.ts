import { Idioma } from "./i18n";

export interface InfoVersao {
  versao: string;
  buildId: string;
  dataLancamento: string;
  descricao: string;
  descricaoMultilingue?: Partial<Record<Idioma, string>>;
}

export const INFO_VERSAO: InfoVersao = {
  versao: "2.11.1",
  buildId: "build-20261020-v2111",
  dataLancamento: "2026-10-20",
  descricao: "Recalibração geodésica de alta precisão com suporte integral a Serzedo e todas as freguesias de Gaia, e motor dinâmico de georresolução reversa.",
  descricaoMultilingue: {
    pt: "Recalibração geodésica de alta precisão com suporte integral a Serzedo e todas as freguesias de Gaia, e motor dinâmico de georresolução reversa.",
    en: "High-precision geodetic recalibration with full support for Serzedo and Gaia parishes, plus dynamic reverse geocoding engine.",
    fr: "Recalibrage géodésique de haute précision avec prise en charge intégrale de Serzedo et des paroisses de Gaia, et moteur dynamique de géoréférencement inverse.",
    es: "Recalibración geodésica de alta precisión con soporte integral para Serzedo y parroquias de Gaia, y motor dinámico de georresolución inversa.",
  },
};
