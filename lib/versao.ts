import { Idioma } from "./i18n";

export interface InfoVersao {
  versao: string;
  buildId: string;
  dataLancamento: string;
  descricao: string;
  descricaoMultilingue?: Partial<Record<Idioma, string>>;
}

export const INFO_VERSAO: InfoVersao = {
  versao: "2.12.0",
  buildId: "build-20261026-v2120",
  dataLancamento: "2026-10-26",
  descricao: "Reconhecimento oficial de forças aéreas internacionais (Royal Air Force / RAF britânica com Roundel militar), catálogo Boeing C-17A Globemaster III e aeroporto militar de Boscombe Down (QUA).",
  descricaoMultilingue: {
    pt: "Reconhecimento oficial de forças aéreas internacionais (Royal Air Force / RAF britânica com Roundel militar), catálogo Boeing C-17A Globemaster III e aeroporto militar de Boscombe Down (QUA).",
    en: "Official recognition of international air forces (United Kingdom Royal Air Force with official military Roundel), Boeing C-17A Globemaster III catalog, and MoD Boscombe Down airfield (QUA).",
    fr: "Reconnaissance officielle des forces aériennes internationales (Royal Air Force britannique avec cocarde militaire officielle), catalogue Boeing C-17A Globemaster III et aéroport MoD Boscombe Down (QUA).",
    es: "Reconocimiento oficial de fuerzas aéreas internacionales (Royal Air Force británica con escarapela militar oficial), catálogo Boeing C-17A Globemaster III y aeródromo MoD Boscombe Down (QUA).",
  },
};
