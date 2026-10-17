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
  versao: "2.5.0",
  buildId: "build-20261017-v250",
  dataLancamento: "2026-10-17",
  descricao: "Catálogo ICAO Doc 8643/8585, frota executiva jets.flights e operadores aviapages.",
};
