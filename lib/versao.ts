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
  versao: "2.9.0",
  buildId: "build-20261020-v290",
  dataLancamento: "2026-10-20",
  descricao: "Suporte a milhas por hora (MPH), botões diretos de teste/refresh geográfico sem lista de cidades e eliminação total de idiomas misturados na tabela de voos.",
};
