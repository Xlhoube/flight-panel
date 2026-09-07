# MEMORY.md — Flight Panel

> Projecto inicializado sob GEMINI v5.0

---

## Contexto Actual

**Projecto:** Flight Panel — Painel de monitorização aérea e meteorológica (*The Flight Wall Official Replica*)  
**Objectivo:** Interface inspirada na referência **theflightwall.com**, reproduzindo a estética oficial da marca: moldura física de display inteligente, cartão com fotografia de alta resolução da pintura da aeronave (*Livery Card*), logótipo oficial da companhia, rota em códigos IATA (`OPO` ➔ `LIS`), modelo da aeronave (`Airbus A320-251N`) e barra de telemetria de aviação (altitude em pés, velocidade em nós e bússola em graus).  
**Versão:** v0.8.1  
**Data de início:** 2026-09-06  
**Última sessão:** 2026-09-07  
**Estado:** Painel analógico Split-Flap com exibição garantida de logótipos de companhias aéreas e transição automática para o modo meteorológico completo quando não houver aviões no ar.

---

## Stack

| Componente      | Tecnologia                        | Justificação                                       |
|-----------------|-----------------------------------|---------------------------------------------------|
| Framework       | Next.js 16 (App Router)           | SSR + Route Handlers (API segura)                 |
| Linguagem       | TypeScript                        | Segurança estrita de tipos                        |
| Estilos         | Tailwind CSS v4 + Split-Flap CSS  | Células de palhetas mecânicas brancas 3D          |
| Áudio           | Web Audio API (Flap Clack)        | Som mecânico sintetizado ao alternar palhetas    |
| Imagens         | Aviasales CDN + Emblem Fallback   | Logótipos oficiais e emblemas de aviação          |
| Voos            | OpenSky Network (gratuito)        | Telemetria pública de tráfego aéreo               |
| Meteorologia    | OpenWeatherMap (gratuito)         | API meteorológica em PT                           |

---

## Decisões Técnicas (ADRs)

### ADR-001 a 016 — (Ver sessões anteriores)

### ADR-017 — Ecrã Inteiro (Fullscreen) com 1 Toque e Tipografia Branca (2026-09-07)
**Contexto:** O utilizador solicitou que todas as letras fossem em branco e que um toque no ecrã colocasse o painel automaticamente em ecrã inteiro (Fullscreen).  
**Decisão:** Integrar a Fullscreen API no elemento raiz activada ao toque/clique em conjunto com o áudio, e uniformizar todas as células de palhetas mecânicas com tipografia monocromática 100% branca sobre fundo escuro.  
**Consequência:** Experiência imersiva em telemóvel/tablet/ecrã sem barras de navegação do browser, com estética minimalista monocromática.

### ADR-018 — Resolução Universal de Logótipos e Transição Meteo Automática (2026-09-07)
**Contexto:** Garantir que o logótipo da companhia aérea nunca fica em falta (mesmo para códigos ICAO não catalogados) e que a ausência de voos no ar transita automaticamente para o modo meteorológico.  
**Decisão:** Expandir o dicionário de operadoras aéreas, adicionar resolução IATA de 2 letras e emblema de cauda de aviação de reserva; verificar ativamente a ausência de tráfego em voo para carregar a estação meteorológica em palhetas brancas.  
**Consequência:** Visual 100% consistente, sem falhas visuais no logótipo e com informação meteorológica sempre que o radar estiver livre.

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
| 2026-09-07 | v0.6.0 | Réplica autêntica do estilo oficial The Flight Wall (Livery + Telemetria)|
| 2026-09-07 | v0.7.0 | Painel analógico aeroporto Solari Split-Flap vintage em Landscape 16:9 |
| 2026-09-07 | v0.7.1 | Remoção de cabeçalhos/rodapés redundantes e simplificação do layout    |
| 2026-09-07 | v0.7.2 | Aumento do tamanho das letras e correcção de quebras de linha das palhetas|
| 2026-09-07 | v0.7.3 | Adaptação fluida e responsiva com clamp() para ecrãs de telemóveis    |
| 2026-09-07 | v0.8.0 | Fullscreen com 1 toque no ecrã e todas as letras em branco 100%        |
| 2026-09-07 | v0.8.1 | Logótipos garantidos para todas as companhias e transição meteo no ar |
