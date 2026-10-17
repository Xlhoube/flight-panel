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
  versao: "2.7.1",
  buildId: "build-20261017-v271",
  dataLancamento: "2026-10-17",
  descricao: "Animação mecânica de split-flaps de 1.5 segundos em cascata ao entrar um novo voo.",
};
