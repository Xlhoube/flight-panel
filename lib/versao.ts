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
  versao: "2.6.0",
  buildId: "build-20261017-v260",
  dataLancamento: "2026-10-17",
  descricao: "Suporte internacional para unidades de temperatura (°C e °F) e distância (KM, NM e MI).",
};
