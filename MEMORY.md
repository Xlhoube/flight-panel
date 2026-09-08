# MEMORY.md — Flight Panel

> Projecto inicializado sob GEMINI v5.0

---

## Contexto Actual

**Projecto:** Flight Panel — Painel de monitorização aérea e meteorológica (*The Flight Wall Official Replica*)  
**Objectivo:** Interface inspirada na referência **theflightwall.com**, reproduzindo a estética oficial da marca: moldura física de display inteligente, cartão com fotografia de alta resolução da pintura da aeronave (*Livery Card*), logótipo oficial da companhia, rota em códigos IATA (`OPO` ➔ `LIS`), modelo da aeronave (`Airbus A320-251N`) e barra de telemetria de aviação (altitude em pés, velocidade em nós e bússola em graus).  
**Versão:** v1.0.3  
**Data de início:** 2026-09-06  
**Última sessão:** 2026-09-08  
**Estado:** PWA (Progressive Web App) completa com telemetria de voos em tempo real com raio adaptativo, suporte a GPS, cache de resiliência e fallback meteorológico automático.

---

## Stack

| Componente      | Tecnologia                        | Justificação                                       |
|-----------------|-----------------------------------|---------------------------------------------------|
| Framework       | Next.js 16 (App Router) + PWA     | SSR + Route Handlers + Web App Manifest           |
| Linguagem       | TypeScript                        | Segurança estrita de tipos                        |
| PWA / Mobile    | Service Worker + Manifest + Icons | Instalação nativa direta no ecrã do telemóvel     |
| Estilos         | Tailwind CSS v4 + Split-Flap CSS  | Células de palhetas mecânicas brancas 3D          |
| Áudio           | Web Audio API (Flap Clack)        | Som mecânico sintetizado ao alternar palhetas    |
| Imagens         | FlightAware ICAO DB + Aviasales   | Base de dados com milhares de logótipos por ICAO  |
| Voos            | OpenSky Network (gratuito)        | Telemetria pública de tráfego aéreo               |
| Meteorologia    | OpenWeatherMap (gratuito)         | API meteorológica em PT                           |

---

## Decisões Técnicas (ADRs)

### ADR-001 a 020 — (Ver sessões anteriores)

### ADR-021 — Remoção da Moldura de Fundo / Layout Borderless (2026-09-07)
**Contexto:** O utilizador solicitou a remoção da moldura de fundo externa para eliminar margens e molduras artificiais.  
**Decisão:** Eliminar os contornos e sombras da moldura exterior circundante, permitindo que as secções do painel preencham o ecrã de forma limpa e borderless *edge-to-edge*.  
**Consequência:** Estética minimalista e maximização do espaço útil do ecrã.

### ADR-022 — Instalador PWA para Telemóveis Android e iPhone (2026-09-07)
**Contexto:** O utilizador solicitou um instalador para usar o painel no telemóvel como uma aplicação dedicada.  
**Decisão:** Implementar a arquitetura completa de Progressive Web App (PWA): manifest.json, ícones dedicados (192x192 e 512x512), Service Worker (sw.js), metadados Apple Mobile Web App e botão/prompt nativo de instalação.  
**Consequência:** A aplicação pode ser instalada com 1 toque no telemóvel, abrindo com o seu próprio ícone ### ADR-023 — Publicação no GitHub e Deploy na Nuvem Vercel (2026-09-07)
**Contexto:** O utilizador solicitou o envio do código para o GitHub (https://github.com/Xlhoube/flight-panel.git) e a disponibilização na Vercel para acesso a partir de qualquer rede ou telemóvel.  
**Decisão:** Configurar o repositório remoto `origin` ligado ao GitHub oficial do utilizador, sincronizar a branch `main` e preparar a integração contínua com a Vercel.  
**Consequência:** A aplicação passa a estar acessível globalmente a partir de qualquer dispositivo ou rede através de um endereço web seguro HTTPS com CI/CD automático.

### ADR-024 — Resolução de Bloqueio no Modo Meteorológico & Telemetria Dinâmica (2026-09-08)
**Contexto:** A aplicação inicializava no modo meteorológico sem transitar para a informação de voos devido a coordenadas estáticas restritas (~30 km no Porto), ausência de tráfego aéreo pontual na caixa delimitadora e bloqueios/rate limits da OpenSky Network.  
**Decisão:** Tornar o endpoint `/api/voos` dinâmico aceitando coordenadas do dispositivo (GPS) e raio configurável; implementar expansão regional automática (até raio x 2) quando o cone imediato não tem aviões; adicionar cache de resiliência em memória para proteger contra 429/interrupções; e criar fallback meteorológico transparente sem dependência de chaves de API (Open-Meteo).  
**Consequência:** Detecção imediata de aeronaves em tráfego regional, garantia de dados de voo no radar e eliminação do bloqueio estático no painel de meteorologia.

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
| 2026-09-07 | v0.8.2 | Encaixe perfeito 100dvh sem scroll em fullscreen e cidades nas origens |
| 2026-09-07 | v0.9.0 | Chassis preenchido sem vazios e base global de logótipos ICAO         |
| 2026-09-07 | v0.9.1 | Remoção da moldura de fundo externa (design borderless edge-to-edge)  |
| 2026-09-07 | v1.0.0 | Lançamento oficial v1.0.0 com suporte completo a instalador PWA Mobile |
| 2026-09-07 | v1.0.1 | Integração GitHub remota (Xlhoube/flight-panel) e suporte a deploy Vercel |
| 2026-09-07 | v1.0.2 | Resolução definitiva de imagens quebradas, emblema aeronáutico e suporte a aviação geral |
| 2026-09-08 | v1.0.3 | Resolução de bloqueio meteorológico: coordenadas dinâmicas, GPS, expansão de raio e cache anti-429 |
