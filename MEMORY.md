# MEMORY.md — Flight Panel

> Projecto inicializado sob GEMINI v5.0

---

## Contexto Actual

**Projecto:** Flight Panel — Painel analógico electromecânico de monitorização aérea e meteorológica  
**Objectivo:** Interface ultra-minimalista 100% monocromática com logótipo em estilo **Pixel Art 8-bit**, Número do Voo, Origem e Destino em palhetas mecânicas pretas e brancas (*Split-Flap*).  
**Versão:** v0.4.1  
**Data de início:** 2026-09-06  
**Última sessão:** 2026-09-07  
**Estado:** Logótipo convertido para estética Pixel Art retro monocromática via renderização em Canvas HTML5.

---

## Stack

| Componente      | Tecnologia                        | Justificação                                       |
|-----------------|-----------------------------------|---------------------------------------------------|
| Framework       | Next.js 16 (App Router)           | SSR + Route Handlers (API segura)                 |
| Linguagem       | TypeScript                        | Segurança estrita de tipos                        |
| Estilos         | Tailwind CSS v4 + Canvas HTML5    | Pixel Art 8-bit + Palhetas 3D Split-Flap          |
| Áudio           | Web Audio API (Procedural)        | Sintetizador de estalido mecânico de palhetas     |
| Font            | Geist Mono                        | Tipografia aeroportuária monoespaçada clássica    |
| Logótipos       | Canvas HTML5 (Binarização 1-bit)  | Conversão do logótipo em Pixel Art retro          |
| Voos            | OpenSky Network (gratuito)        | Telemetria pública de tráfego aéreo               |
| Meteorologia    | OpenWeatherMap (gratuito)         | API meteorológica em PT                           |

---

## Decisões Técnicas (ADRs)

### ADR-001 a 010 — (Ver sessões anteriores)

### ADR-011 — Logótipo em Pixel Art Retro Monocromático (2026-09-07)
**Contexto:** O utilizador solicitou a conversão do logótipo da companhia aérea para um formato em pixeis (*Pixel Art*).  
**Decisão:** Criar o componente `<PixelLogo>` que renderiza a imagem num `<canvas>` com grelha reduzida 24x24, desativa a interpolação (`imageSmoothingEnabled = false`), aplica binarização de pixeis em 1-bit e amplia com a propriedade CSS `image-rendering: pixelated`.  
**Consequência:** Estética retrô pixel art 8-bit pura e perfeitamente integrada no painel monocromático.

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
