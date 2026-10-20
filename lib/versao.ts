import { Idioma } from "./i18n";

export interface InfoVersao {
  versao: string;
  buildId: string;
  dataLancamento: string;
  descricao: string;
  descricaoMultilingue?: Partial<Record<Idioma, string>>;
}

export const INFO_VERSAO: InfoVersao = {
  versao: "2.10.2",
  buildId: "build-20261020-v2102",
  dataLancamento: "2026-10-20",
  descricao: "Etiqueta luminosa com a versão atualizada no cabeçalho e rodapé do menu de opções (⚙️ OPÇÕES).",
  descricaoMultilingue: {
    pt: "Etiqueta luminosa com a versão atualizada no cabeçalho e rodapé do menu de opções (⚙️ OPÇÕES).",
    en: "Glowing updated version badge in the header and footer of the options menu (⚙️ OPTIONS).",
    fr: "Badge lumineux avec la version mise à jour dans l'en-tête et pied de page du menu d'options (⚙️ OPTIONS).",
    es: "Etiqueta luminosa con la versión actualizada en el encabezado y pie de página del menú de opciones (⚙️ OPCIONES).",
  },
};
