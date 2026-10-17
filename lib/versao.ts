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
  versao: "2.6.1",
  buildId: "build-20261017-v261",
  dataLancamento: "2026-10-17",
  descricao: "Diretivas canónicas notranslate para desativação do popup de tradução automática dos browsers.",
};
