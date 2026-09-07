# MEMORY.md — Flight Panel

> Projecto inicializado sob GEMINI v5.0

---

## Contexto Actual

**Projecto:** Flight Panel — Painel analógico electromecânico de monitorização aérea e meteorológica  
**Objectivo:** Apresentar o voo detetado em tempo real sobre Valadares (Porto) num formato minimalista de alto impacto visual (*Split-Flap*), exibindo o Logótipo da Companhia Aérea, o Número do Voo e a Rota (Origem ➔ Destino).  
**Versão:** v0.2.2  
**Data de início:** 2026-09-06  
**Última sessão:** 2026-09-07  
**Estado:** Interface minimalista aprimorada com moldura Solari de acabamento acrílico, resolução infalível para o campo Origem com fallback para país de registo e som mecânico.

---

## Stack

| Componente      | Tecnologia                        | Justificação                                       |
|-----------------|-----------------------------------|---------------------------------------------------|
| Framework       | Next.js 16 (App Router)           | SSR + Route Handlers (API segura)                 |
| Linguagem       | TypeScript                        | Segurança estrita de tipos                        |
| Estilos         | Tailwind CSS v4 + Vanilla CSS     | Palhetas 3D Split-Flap e moldura Solari minimalista|
| Áudio           | Web Audio API (Procedural)        | Sintetizador de estalido mecânico de palhetas     |
| Font            | Geist Mono                        | Tipografia aeroportuária monoespaçada clássica    |
| Logótipos       | Aviasales CDN (`pics.avs.io`)     | Logótipos oficiais de companhias por IATA          |
| Voos            | OpenSky Network (gratuito)        | Telemetria pública de tráfego aéreo               |
| Meteorologia    | OpenWeatherMap (gratuito)         | API meteorológica em PT                           |

---

## Decisões Técnicas (ADRs)

### ADR-001 a 005 — (Ver sessões anteriores)

### ADR-006 — Aprimoramento de Layout & Resolução de Origem (2026-09-07)
**Contexto:** O campo da Origem por vezes não aparecia ou ficava indeterminado em companhias não registadas e o layout necessitava de refinamento estético.  
**Decisão:** Integrar o `origin_country` da telemetria OpenSky como fallback automático e envolver o painel numa moldura Solari flutuante de vidro acrílico escurecido com iluminação e cartões de vidro fosco para os logótipos.  
**Consequência:** A Origem aparece sempre de forma clara e a estética do painel atingiu um nível de design refinado.

---

## Histórico

| Data       | Versão | Acção                                                                  |
|------------|--------|------------------------------------------------------------------------|
| 2026-09-06 | v0.1.0 | Projecto inicializado, estrutura base criada e segura                  |
| 2026-09-07 | v0.2.0 | Redesign completo para painel analógico Split-Flap (Solari di Udine)   |
| 2026-09-07 | v0.2.1 | Reformulação minimalista (Logótipo + Voo + Rota) e correcção do som    |
| 2026-09-07 | v0.2.2 | Resolução do campo Origem e melhoria visual do layout minimalista      |
