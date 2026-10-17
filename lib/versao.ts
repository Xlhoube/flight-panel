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
  versao: "2.6.5",
  buildId: "build-20261017-v265",
  dataLancamento: "2026-10-17",
  descricao: "Fixação e estabilização de altura da barra inferior de telemetria (h-13/h-16 uniforme com LedText size=md e scope compacto).",
};
