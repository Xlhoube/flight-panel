"use client";

import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { INFO_VERSAO, InfoVersao } from "@/lib/versao";
import { tocarSomFlapClack } from "@/lib/sound";
import { TRADUCOES, Idioma } from "@/lib/i18n";

export default function AlertaAtualizacao() {
  const [novaVersaoInfo, setNovaVersaoInfo] = useState<InfoVersao | null>(null);
  const [alertaVisivel, setAlertaVisivel] = useState(false);
  const [atualizando, setAtualizando] = useState(false);
  const [estaAdiado, setEstaAdiado] = useState<boolean>(false);
  const timerAdiadoRef = useRef<NodeJS.Timeout | null>(null);

  // Idioma selecionado pelo utilizador (com arranque padrão em inglês ou restaurado de localStorage)
  const [idioma, setIdioma] = useState<Idioma>("en");

  // Escuta imediata de alterações de idioma em localStorage e eventos de aplicação
  useEffect(() => {
    const carregarIdioma = () => {
      try {
        const salvo = localStorage.getItem("flightpanel_idioma");
        if (salvo === "pt" || salvo === "en" || salvo === "fr" || salvo === "es") {
          setIdioma(salvo);
          return;
        }
        const userSettings = localStorage.getItem("flight_panel_user_settings");
        if (userSettings) {
          const parsed = JSON.parse(userSettings);
          if (parsed.idioma && ["pt", "en", "fr", "es"].includes(parsed.idioma)) {
            setIdioma(parsed.idioma);
          }
        }
      } catch { }
    };

    carregarIdioma();

    const handleCustomIdioma = (e: Event) => {
      const custom = e as CustomEvent<Idioma>;
      if (custom.detail && ["pt", "en", "fr", "es"].includes(custom.detail)) {
        setIdioma(custom.detail);
      } else {
        carregarIdioma();
      }
    };

    window.addEventListener("flightpanel_idioma_alterado", handleCustomIdioma);
    window.addEventListener("storage", handleCustomIdioma);

    return () => {
      window.removeEventListener("flightpanel_idioma_alterado", handleCustomIdioma);
      window.removeEventListener("storage", handleCustomIdioma);
    };
  }, []);

  const t = useMemo(() => TRADUCOES[idioma] || TRADUCOES.en, [idioma]);

  // Registo da versão inicial com que a página foi carregada
  const versaoInicialRef = useRef<string>(INFO_VERSAO.versao);
  const buildIdInicialRef = useRef<string>(INFO_VERSAO.buildId);
  const jaTocouSomRef = useRef<boolean>(false);

  // Função central de verificação com a API do servidor
  const verificarAtualizacao = useCallback(async () => {
    try {
      // Pedido sem cache com carimbo de data/hora único para garantir dados frescos do servidor
      const res = await fetch(`/api/versao?_t=${Date.now()}`, {
        cache: "no-store",
        headers: {
          Pragma: "no-cache",
          "Cache-Control": "no-cache",
        },
      });

      if (!res.ok) return;

      const data: InfoVersao = await res.json();

      // Se a versão ou o identificador de compilação (buildId) do servidor diferirem da versão em execução no ecrã
      const haMudanca =
        data.versao !== versaoInicialRef.current ||
        (data.buildId && data.buildId !== buildIdInicialRef.current);

      if (haMudanca) {
        setNovaVersaoInfo(data);
        setAlertaVisivel(true);

        // Toca som discreto de aviso no cockpit ao detetar pela primeira vez
        if (!jaTocouSomRef.current) {
          jaTocouSomRef.current = true;
          try {
            tocarSomFlapClack();
          } catch {
            // Ignora se o áudio não tiver permissão de interação ainda
          }
        }
      }
    } catch {
      // Falha temporária de rede silenciosa
    }
  }, []);

  // Efeito principal: escuta Service Worker e faz polling periódico ativo
  useEffect(() => {
    // 1. Verificação inicial após 5 segundos de arranque
    const timerInicial = setTimeout(() => {
      verificarAtualizacao();
    }, 5000);

    // 2. Polling periódico ativo a cada 60 segundos (ideal para apps permanentemente ligadas em quiosque)
    const intervaloPolling = setInterval(() => {
      verificarAtualizacao();
    }, 60000);

    // 3. Verificação ao mudar de visibilidade ou recuperar o foco do ecrã
    const handleVisibilidade = () => {
      if (document.visibilityState === "visible") {
        verificarAtualizacao();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilidade);
    window.addEventListener("focus", handleVisibilidade);

    // 4. Integração nativa com o Service Worker da PWA
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        // Força uma verificação de atualizações no Service Worker
        registration.update().catch(() => {});

        registration.addEventListener("updatefound", () => {
          const novoWorker = registration.installing;
          if (novoWorker) {
            novoWorker.addEventListener("statechange", () => {
              if (
                novoWorker.state === "installed" &&
                navigator.serviceWorker.controller
              ) {
                // Novo Service Worker pronto e aguardando ativação
                verificarAtualizacao();
              }
            });
          }
        });
      });
    }

    return () => {
      clearTimeout(timerInicial);
      clearInterval(intervaloPolling);
      document.removeEventListener("visibilitychange", handleVisibilidade);
      window.removeEventListener("focus", handleVisibilidade);
    };
  }, [verificarAtualizacao]);

  // Aplica a atualização de forma limpa e recarrega a aplicação
  const aplicarAtualizacao = async () => {
    setAtualizando(true);

    try {
      // 1. Limpa caches de PWA para não carregar ficheiros antigos
      if ("caches" in window) {
        const cacheKeys = await caches.keys();
        await Promise.all(cacheKeys.map((key) => caches.delete(key)));
      }

      // 2. Notifica o Service Worker para assumir imediatamente
      if ("serviceWorker" in navigator) {
        const reg = await navigator.serviceWorker.getRegistration();
        if (reg?.waiting) {
          reg.waiting.postMessage({ type: "SKIP_WAITING" });
        }
      }
    } catch {
      // Continua para o recarregamento mesmo em caso de erro na limpeza
    }

    // 3. Força recarregamento sem cache
    setTimeout(() => {
      window.location.reload();
    }, 400);
  };

  // Adiar por 15 minutos
  const adiarAtualizacao = () => {
    setEstaAdiado(true);
    if (timerAdiadoRef.current) clearTimeout(timerAdiadoRef.current);
    timerAdiadoRef.current = setTimeout(() => {
      setEstaAdiado(false);
      timerAdiadoRef.current = null;
    }, 15 * 60 * 1000);
  };

  if (!novaVersaoInfo) return null;

  // Se o utilizador adiou, mostra apenas um pill discreto no canto superior
  if (estaAdiado) {
    return (
      <div className="fixed top-3 right-3 z-[9999]">
        <button
          onClick={() => {
            setEstaAdiado(false);
            if (timerAdiadoRef.current) {
              clearTimeout(timerAdiadoRef.current);
              timerAdiadoRef.current = null;
            }
          }}
          className="flex items-center gap-2 px-3 py-1.5 bg-[#0f172a]/95 hover:bg-[#1e293b] border border-cyan-400/60 rounded-full text-cyan-300 text-xs font-mono shadow-[0_0_15px_rgba(6,182,212,0.35)] backdrop-blur-md transition-all animate-pulse"
          title={t.alerta_atualizacao_pill_tooltip}
        >
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span>v{novaVersaoInfo.versao} {t.alerta_atualizacao_pill_disponivel}</span>
          <span className="text-[10px] bg-cyan-950/80 px-1.5 py-0.5 rounded text-cyan-200 border border-cyan-500/30">
            {t.alerta_atualizacao_pill_btn}
          </span>
        </button>
      </div>
    );
  }

  if (!alertaVisivel) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] w-[94%] max-w-xl transition-all duration-300 animate-in fade-in slide-in-from-top-6">
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-b from-[#111625] via-[#0b0e18] to-[#06080e] border-2 border-cyan-400/70 p-4 shadow-[0_10px_40px_rgba(0,0,0,0.85),0_0_30px_rgba(6,182,212,0.3)] backdrop-blur-xl">
        {/* Barra superior de cockpit com luz de alerta */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500 shadow-[0_0_10px_#06b6d4]" />
            </span>
            <span className="font-mono font-black text-xs sm:text-sm tracking-widest text-cyan-300 uppercase">
              {t.alerta_atualizacao_titulo}
            </span>
          </div>

          <div className="flex items-center gap-1 font-mono text-[10px] text-neutral-400 bg-neutral-900/90 px-2 py-0.5 rounded border border-neutral-700">
            <span>{INFO_VERSAO.versao}</span>
            <span className="text-cyan-400">➔</span>
            <span className="text-emerald-400 font-bold">{novaVersaoInfo.versao}</span>
          </div>
        </div>

        {/* Corpo do Alerta */}
        <div className="py-3 font-mono">
          <p className="text-neutral-200 text-xs sm:text-sm leading-relaxed font-semibold">
            {t.alerta_atualizacao_desc_prefix}<span className="text-cyan-300 font-bold">Flight Panel</span>{t.alerta_atualizacao_desc_sufixo}
          </p>

          {(novaVersaoInfo.descricaoMultilingue?.[idioma] || novaVersaoInfo.descricao) && (
            <div className="mt-2 text-[11px] text-neutral-300 bg-black/40 p-2.5 rounded-lg border border-neutral-800/80 leading-normal">
              <span className="text-cyan-400 font-bold mr-1.5">{t.alerta_atualizacao_novidades}</span>
              {novaVersaoInfo.descricaoMultilingue?.[idioma] || novaVersaoInfo.descricao}
            </div>
          )}
        </div>

        {/* Botões de Ação */}
        <div className="flex items-center gap-2 pt-2 border-t border-neutral-800/80">
          <button
            onClick={aplicarAtualizacao}
            disabled={atualizando}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-mono font-black text-xs sm:text-sm tracking-wider uppercase rounded-lg shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
          >
            {atualizando ? (
              <>
                <svg
                  className="animate-spin h-4 w-4 text-black"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>{t.alerta_atualizacao_a_reiniciar}</span>
              </>
            ) : (
              <>
                <span>🔄 {t.alerta_atualizacao_btn_agora}</span>
                <span className="text-[10px] opacity-75 font-normal">{t.alerta_atualizacao_btn_recarregar}</span>
              </>
            )}
          </button>

          <button
            onClick={adiarAtualizacao}
            disabled={atualizando}
            className="px-3 py-2.5 bg-neutral-900/80 hover:bg-neutral-800 text-neutral-300 font-mono text-xs rounded-lg border border-neutral-700/80 transition-all cursor-pointer whitespace-nowrap"
            title={t.alerta_atualizacao_adiar_tooltip}
          >
            {t.alerta_atualizacao_btn_adiar}
          </button>
        </div>
      </div>
    </div>
  );
}

