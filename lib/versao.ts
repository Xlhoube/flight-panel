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
  versao: "2.8.2",
  buildId: "build-20261020-v282",
  dataLancamento: "2026-10-20",
  descricao: "Remoção do nome do ficheiro (/Flight.mp3) no botão de teste de som e internacionalização nas 4 línguas.",
};
