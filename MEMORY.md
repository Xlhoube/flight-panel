# MEMORY.md — Flight Panel

> Projecto inicializado sob GEMINI v5.0

---

## Contexto Actual

**Projecto:** Flight Panel — Painel de monitorização aérea e meteorológica (*The Flight Wall Mobile Edition*)  
**Objectivo:** Interface inspirada na referência **The Flight Wall**, totalmente optimizada para utilização tátil em telemóveis (Mobile First). Apresenta cartões táteis com o Logótipo da Companhia Aérea, Número do Voo, Rota com Códigos IATA (`OPO` ➔ `LIS`), Modelo de Aeronave (Airbus/Boeing) e métricas verticais de altitude, velocidade e rumo com avião rodado a 360°.  
**Versão:** v0.5.0  
**Data de início:** 2026-09-06  
**Última sessão:** 2026-09-07  
**Estado:** Interface 'The Flight Wall Mobile' operacional, responsiva, fluida e com suporte a meteorologia quando sem tráfego aéreo.

---

## Stack

| Componente      | Tecnologia                        | Justificação                                       |
|-----------------|-----------------------------------|---------------------------------------------------|
| Framework       | Next.js 16 (App Router)           | SSR + Route Handlers (API segura)                 |
| Linguagem       | TypeScript                        | Segurança estrita de tipos                        |
| Estilos         | Tailwind CSS v4 + Glassmorphism   | Layout móvel estilo Smart Display / Flight Wall   |
| Áudio           | Web Audio API                     | Som sintético tátil                               |
| Logótipos       | Aviasales CDN (`pics.avs.io`)     | Logótipos oficiais de alta definição              |
| Voos            | OpenSky Network (gratuito)        | Telemetria pública de tráfego aéreo               |
| Meteorologia    | OpenWeatherMap (gratuito)         | API meteorológica em PT                           |

---

## Decisões Técnicas (ADRs)

### ADR-001 a 013 — (Ver sessões anteriores)

### ADR-014 — Implementação The Flight Wall Mobile Edition (2026-09-07)
**Contexto:** O utilizador forneceu o link de referência de `theflightwall.com` solicitando um ecrã equivalente optimizado para utilização em telemóvel.  
**Decisão:** Construir uma interface móvel vertical estilo cartão inteligente *Glassmorphism* com métricas de voo, logótipo da companhia, rota em códigos IATA (`OPO`, `LIS`, `CDG`, etc.), bússola de rumo 360° com rotação de aeronave e modo meteorologia móvel.  
**Consequência:** Experiência móvel tátil idêntica a um Smart Display de aviação profissional.

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
| 2026-09-07 | v0.4.1 | Conversão do logótipo da companhia para Pixel Art 8-bit monocromático  |
| 2026-09-07 | v0.4.2 | Aumento da definição da matriz Pixel Art para 64x64                    |
| 2026-09-07 | v0.4.3 | Correcção do erro de parsing em @swc/helpers e limpeza de cache        |
| 2026-09-07 | v0.5.0 | Implementação do 'The Flight Wall Mobile Edition' para telemóveis      |
