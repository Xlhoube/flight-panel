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
  versao: "2.8.0",
  buildId: "build-20261020-v280",
  dataLancamento: "2026-10-20",
  descricao: "Internacionalização integral do onboarding e pesquisa automática e silenciosa de localização no arranque.",
};
