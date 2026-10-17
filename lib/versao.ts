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
  versao: "2.7.2",
  buildId: "build-20261017-v272",
  dataLancamento: "2026-10-17",
  descricao: "Restauro da escala visual heróica e imponente das palhetas split-flaps, logótipos e telemetria.",
};
