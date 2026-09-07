# MEMORY.md — Flight Panel

> Projecto inicializado sob GEMINI v5.0

---

## Contexto Actual

**Projecto:** Flight Panel — Painel analógico electromecânico de monitorização aérea e meteorológica  
**Objectivo:** Interface ultra-minimalista 100% monocromática contendo exclusivamente 4 elementos: Logótipo da Companhia Aérea (em escala de cinzentos/silhueta), Número do Voo, Origem e Destino em palhetas mecânicas pretas e brancas (*Split-Flap*).  
**Versão:** v0.4.0  
**Data de início:** 2026-09-06  
**Última sessão:** 2026-09-07  
**Estado:** Interface purificada para o modo 100% monocromático preto e branco. Todos os títulos de partidas, relógios, molduras decorativas e cores foram removidos.

---

## Stack

| Componente      | Tecnologia                        | Justificação                                       |
|-----------------|-----------------------------------|---------------------------------------------------|
| Framework       | Next.js 16 (App Router)           | SSR + Route Handlers (API segura)                 |
| Linguagem       | TypeScript                        | Segurança estrita de tipos                        |
| Estilos         | Tailwind CSS v4 + Vanilla CSS     | Palhetas 3D Split-Flap 100% monocromáticas        |
| Áudio           | Web Audio API (Procedural)        | Sintetizador de estalido mecânico de palhetas     |
| Font            | Geist Mono                        | Tipografia aeroportuária monoespaçada clássica    |
| Logótipos       | Aviasales CDN (`pics.avs.io`)     | Logótipos oficiais convertidos para monocromático  |
| Voos            | OpenSky Network (gratuito)        | Telemetria pública de tráfego aéreo               |
| Meteorologia    | OpenWeatherMap (gratuito)         | API meteorológica em PT                           |

---

## Decisões Técnicas (ADRs)

### ADR-001 a 009 — (Ver sessões anteriores)

### ADR-010 — Estética Purista 100% Monocromática (2026-09-07)
**Contexto:** O utilizador ordenou explicitamente a remoção de todas as molduras, relógios, botões e elementos decorativos, exigindo um visual estritamente monocromático apenas com o Logótipo da Companhia Aérea, Número do Voo, Origem e Destino.  
**Decisão:** Limpar a interface de qualquer moldura ou cor secundária (amarelo/verde). Aplicar filtros `grayscale(1) brightness(2) invert(1)` ao logótipo e utilizar palhetas pretas com tipografia branca pura sob fundo preto absoluto.  
**Consequência:** Design ultra-minimalista, sóbrio e sem qualquer elemento de distração.

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
| 2026-09-07 | v0.4.0 | Purificação da interface: 100% monocromático (Logo + Voo + Origem + Destino)|
