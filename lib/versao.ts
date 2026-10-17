/**
 * Informação de Versão e Release do Flight Panel
 * Esta constante é a referência de versão compilada na aplicação.
 */

export interface InfoVersao {
  versao: string;
  buildId: string;
  dataLancamento: string;
  descricao: string;
}

export const INFO_VERSAO: InfoVersao = {
  versao: "2.6.6",
  buildId: "build-20261017-v266",
  dataLancamento: "2026-10-17",
  descricao: "Proteção anti-corte e adaptação vertical dinâmica para telemóveis em modo horizontal (landscape 100dvh e viewportFit cover).",
};
