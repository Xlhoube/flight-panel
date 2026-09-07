# MEMORY.md — Flight Panel

> Projecto inicializado sob GEMINI v5.0

---

## Contexto Actual

**Projecto:** Flight Panel — Painel analógico electromecânico de partidas de aeroporto (*Departures Solari Split-Flap Board*)  
**Objectivo:** Apresentar a estética do painel clássico `✈ DEPARTURES ✈` da imagem com palhetas pretas divididas, mas exibindo **apenas um único voo de cada vez** em destaque no centro da placa.  
**Versão:** v0.3.1  
**Data de início:** 2026-09-06  
**Última sessão:** 2026-09-07  
**Estado:** Interface simplificada para exibição de 1 único voo de cada vez na grelha `TIME` · `DESTINATION` · `FLIGHT` com palhetas em escala expandida.

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

### ADR-001 a 008 — (Ver sessões anteriores)

### ADR-009 — Exibição Focada de Único Voo Ativo (2026-09-07)
**Contexto:** O utilizador solicitou apresentar apenas 1 único voo de cada vez mantendo o estilo visual da placa de partidas `✈ DEPARTURES ✈`.  
**Decisão:** Reformular o layout para exibir uma única linha de palhetas mecânicas de dimensões expandidas (`w-[40px] h-[58px]`) alinhadas sob as colunas `TIME`, `DESTINATION` e `FLIGHT`.  
**Consequência:** Foco total na aeronave ativa sobre Valadares sem poluição visual.

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
| 2026-09-07 | v0.3.1 | Ajuste para exibição exclusiva de 1 único voo de cada vez              |
