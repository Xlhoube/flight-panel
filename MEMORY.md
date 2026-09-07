# MEMORY.md — Flight Panel

> Projecto inicializado sob GEMINI v5.0

---

## Contexto Actual

**Projecto:** Flight Panel — Painel analógico electromecânico de partidas de aeroporto (*Departures Solari Split-Flap Board*)  
**Objectivo:** Replicar com precisão o painel de partidas analógico clássico de aeroporto (com placa de cabeçalho `DEPARTURES` com ícones de aviões e grelha de palhetas pretas divididas com colunas `TIME`, `DESTINATION` e `FLIGHT`).  
**Versão:** v0.3.0  
**Data de início:** 2026-09-06  
**Última sessão:** 2026-09-07  
**Estado:** Interface recriada com base na imagem de referência fornecida pelo utilizador. Grelha analógica completa com palhetas pretas, som procedural de viragem e suporte a tráfego aéreo/meteorologia.

---

## Stack

| Componente      | Tecnologia                        | Justificação                                       |
|-----------------|-----------------------------------|---------------------------------------------------|
| Framework       | Next.js 16 (App Router)           | SSR + Route Handlers (API segura)                 |
| Linguagem       | TypeScript                        | Segurança estrita de tipos                        |
| Estilos         | Tailwind CSS v4 + Vanilla CSS     | Palhetas 3D Split-Flap e moldura Solari clássica  |
| Áudio           | Web Audio API (Procedural)        | Sintetizador de estalido mecânico de palhetas     |
| Font            | Geist Mono                        | Tipografia aeroportuária monoespaçada clássica    |
| Voos            | OpenSky Network (gratuito)        | Telemetria pública de tráfego aéreo               |
| Meteorologia    | OpenWeatherMap (gratuito)         | API meteorológica em PT                           |

---

## Decisões Técnicas (ADRs)

### ADR-001 a 007 — (Ver sessões anteriores)

### ADR-008 — Recriação Fiel do Painel Clássico de Partidas (2026-09-07)
**Contexto:** O utilizador partilhou uma imagem de referência de um painel de partidas analógico tradicional de aeroporto (*DEPARTURES Board*) com palhetas pretas e colunas `TIME`, `DESTINATION` e `FLIGHT`.  
**Decisão:** Reestruturar a página principal para replicar a estética da referência (moldura preta sólida com borda branca, placa superior `✈ DEPARTURES ✈`, colunas alinhadas `TIME` [5 palhetas], `DESTINATION` [10 palhetas] e `FLIGHT` [7 palhetas], com 9 linhas mecânicas fixas).  
**Consequência:** Fidelidade visual absoluta ao modelo tradicional pretendido pelo utilizador.

---

## Histórico

| Data       | Versão | Acção                                                                  |
|------------|--------|------------------------------------------------------------------------|
| 2026-09-06 | v0.1.0 | Projecto inicializado, estrutura base criada e segura                  |
| 2026-09-07 | v0.2.0 | Redesign completo para painel analógico Split-Flap (Solari di Udine)   |
| 2026-09-07 | v0.2.1 | Reformulação minimalista (Logótipo + Voo + Rota) e correcção do som    |
| 2026-09-07 | v0.2.2 | Resolução do campo Origem e melhoria visual do layout minimalista      |
| 2026-09-07 | v0.2.3 | Correcção do corte de letras e alinhamento responsivo das palhetas    |
| 2026-09-07 | v0.3.0 | Recriação fiel do painel clássico de partidas (DEPARTURES board)       |
