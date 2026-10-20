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
  versao: "2.10.0",
  buildId: "build-20261020-v2100",
  dataLancamento: "2026-10-20",
  descricao: "Ecrã 2 enriquecido com cartões completos de voo (Radar ADS-B) e novo Modo Noturno / Sono com silenciamento total e ecrã ultra-escuro.",
};
