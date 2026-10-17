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
  versao: "2.7.0",
  buildId: "build-20261017-v270",
  dataLancamento: "2026-10-17",
  descricao: "Controlo manual e automático de luminosidade do ecrã com boost de 5 segundos ao detetar novo voo.",
};
