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
  versao: "2.6.3",
  buildId: "build-20261017-v263",
  dataLancamento: "2026-10-17",
  descricao: "Eliminação da chamada forçada de requestFullscreen nos toques, eliminando a notificação nativa do Android.",
};
