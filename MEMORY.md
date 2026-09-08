# MEMORY.md — Flight Panel

> Projecto inicializado sob GEMINI v5.0

---

## Contexto Actual

**Projecto:** Flight Panel — Painel de monitorização aérea e meteorológica (*The Flight Wall Official Replica*)  
**Objectivo:** Interface inspirada na referência **theflightwall.com**, reproduzindo a estética oficial da marca: moldura física de display inteligente, cartão com fotografia de alta resolução da pintura da aeronave (*Livery Card*), logótipo oficial da companhia, rota em códigos IATA (`OPO` ➔ `LIS`), modelo da aeronave (`Airbus A320-251N`) e barra de telemetria de aviação (altitude em pés, velocidade em nós e bússola em graus).  
**Versão:** v1.1.1  
**Data de início:** 2026-09-06  
**Última sessão:** 2026-09-08  
**Estado:** PWA com visibilidade garantida da barra de rodapé em ecrã inteiro móvel (flex-1 min-h-0 + safe-area insets), callsigns ICAO integrais e Service Worker v5.

---

## Stack

| Componente      | Tecnologia                        | Justificação                                       |
|-----------------|-----------------------------------|---------------------------------------------------|
| Framework       | Next.js 16 (App Router) + PWA     | SSR + Route Handlers + Web App Manifest           |
| Linguagem       | TypeScript                        | Segurança estrita de tipos                        |
| PWA / Mobile    | Service Worker + Manifest + Icons | Instalação nativa direta no ecrã do telemóvel     |
| Ecrã Activo     | Screen Wake Lock API              | Impede que o ecrã do telemóvel/PC se desligue      |
| Estilos         | Tailwind CSS v4 + Split-Flap CSS  | Células de palhetas mecânicas brancas 3D          |
| Áudio           | Web Audio API (Flap Clack)        | Som mecânico sintetizado ao alternar palhetas    |
| Imagens         | FlightAware ICAO DB + Aviasales   | Base de dados com milhares de logótipos por ICAO  |
| Voos            | OpenSky Network (gratuito)        | Telemetria pública de tráfego aéreo               |
| Meteorologia    | OpenWeatherMap + Open-Meteo       | API meteorológica em PT com fallback sem chaves   |

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
**Consequência:** A aplicação pode ser instalada com 1 toque no telemóvel, abrindo com o seu próprio ícone no ecrã principal sem barras de navegação do browser em modo landscape autónomo.

### ADR-023 — Publicação no GitHub e Deploy na Nuvem Vercel (2026-09-07)
**Contexto:** O utilizador solicitou o envio do código para o GitHub (https://github.com/Xlhoube/flight-panel.git) e a disponibilização na Vercel para acesso a partir de qualquer rede ou telemóvel.  
**Decisão:** Configurar o repositório remoto `origin` ligado ao GitHub oficial do utilizador, sincronizar a branch `main` e preparar a integração contínua com a Vercel.  
**Consequência:** A aplicação passa a estar acessível globalmente a partir de qualquer dispositivo ou rede através de um endereço web seguro HTTPS com CI/CD automático.

### ADR-024 — Resolução de Bloqueio no Modo Meteorológico & Telemetria Dinâmica (2026-09-08)
**Contexto:** A aplicação inicializava no modo meteorológico sem transitar para a informação de voos devido a coordenadas estáticas restritas (~30 km no Porto), ausência de tráfego aéreo pontual na caixa delimitadora e bloqueios/rate limits da OpenSky Network.  
**Decisão:** Tornar o endpoint `/api/voos` dinâmico aceitando coordenadas do dispositivo (GPS) e raio configurável; implementar expansão regional automática (até raio x 2) quando o cone imediato não tem aviões; adicionar cache de resiliência em memória para proteger contra 429/interrupções; e criar fallback meteorológico transparente sem dependência de chaves de API (Open-Meteo).  
**Consequência:** Detecçã### ADR-025 — Manter o Ecrã Sempre Ligado via Screen Wake Lock API (2026-09-08)
**Contexto:** O utilizador solicitou que o ecrã do telemóvel ou computador permaneça sempre activo e ligado enquanto a aplicação estiver em execução.  
**Decisão:** Integrar a Screen Wake Lock API com activação automática no carregamento, reactivação em `visibilitychange` (quando o utilizador regressa à aba) e reforço em gestos de toque no ecrã.  
**Consequência:** O dispositivo não suspende nem desliga o ecrã por inactividade, funcionando de forma contínua como um ecrã físico dedicado de voos.

### ADR-026 — Dupla Fonte de Telemetria ADS-B e Invalidação de Cache PWA (2026-09-08)
**Contexto:** Voos detectados a sobrevoar a região não activavam o painel devido a bloqueios pontuais de datacenter na OpenSky Network e a cache estática retida no Service Worker móvel.  
**Decisão:** Implementar arquitectura de dupla fonte com feed comunitário aberto `adsb.fi` (sem bloqueio de IP de datacenters e com descrições reais de modelo de aeronave) + `OpenSky Network` como redundância; acelerar o ciclo de sondagem para 10 segundos; adicionar barra de instrumentação de radar no fundo; e atualizar o Service Worker com estratégia Network-First para páginas com limpeza automática de cache antiga v1.  
**Consequência:** Detecção imediata de aeronaves em tráfego de aproximação ou cruzeiro, transição em tempo real sem atrasos e garantia de código sempre actualizado no telemóvel.

### ADR-027 — Relógio Solari Mecânico (Data & Hora) e Localização no Modo Meteorologia (2026-09-08)
**Contexto:** O utilizador solicitou a substituição do texto estático "ESPACO LIVRE" no cabeçalho meteorológico por data, hora e localização.  
**Decisão:** Transformar a secção superior do modo meteorológico num relógio analógico Solari de estação em tempo real, exibindo a hora (HH:MM), data (DD MES) e a localização activa em palhetas mecânicas brancas com actualização contínua.  
**Consequência:** O painel funciona como um elegante relógio de aeroporto vintage com meteorologia quando o espaço aéreo não tem voos activos.

### ADR-028 — Resolução de Omissão de Letras no Número de Voo & Auto-Fit Responsivo (2026-09-08)
**Contexto:** O utilizador identificou que o campo do número de voo parecia estar a omitir letras/dígitos.  
**Decisão:** Eliminar cortes arbitrários de callsigns; limpar espaços internos sem amputar caracteres; implementar dimensionamento dinâmico automático das palhetas com base no comprimento do identificador (`xl` para curtos, `lg` para médios, `md` para longos com 7+ caracteres); e adicionar indicação do callsign ATC completo caso difira do código comercial.  
**Consequência:** Visibilidade total e sem corte de caracteres em qualquer tamanho de ecrã ou modelo de aeronave.

### ADR-029 — Redefinição do Raio de Alcance do Radar para 30 km (2026-09-08)
**Contexto:** O utilizador solicitou o ajustamento do raio de monitorização aérea de 50 km para 30 km para focar as passagens aéreas mais próximas e relevantes.  
**Decisão:** Atualizar o raio padrão de busca na rota `/api/voos` para 30 km (com conversão proporcional para ~16 NM no feed ADS-B), sincronizar a requisição no frontend e atualizar a legenda na barra de estado do radar.  
**Consequência:** Foco restrito a aeronaves a sobrevoar a área imediata (30 km), transição precisa e coerência visual em toda a instrumentação.

### ADR-030 — Integração de Rotas Reais ADS-B (adsbdb) & Preservação de Callsigns Alfanuméricos (2026-09-08)
**Contexto:** O voo Swiss `SWR1ZD` surgia no painel como `LX1ZD` com rota `OPO ➔ OPO` (origem e destino idênticos), enquanto no FlightRadar24 surgia como `SWR1ZD` com destino a Genebra (`GVA`).  
**Decisão:** Integrar o serviço global de rotas `api.adsbdb.com` com cache em memória no endpoint `/api/voos` para descarregar aeroportos de partida e chegada reais (ex: `OPO ➔ GVA`); preservar o callsign original no mostrador principal quando o sufixo for alfanumérico (ex: `SWR1ZD`), convertendo para IATA apenas voos com sufixo estritamente numérico (ex: `TAP1972` ➔ `TP1972`); exibir badges complementares de `ATC` e `IATA`; e adicionar salvaguarda estrita para impedir que origem e destino sejam alguma vez idênticos.  
**Consequência:** Correspondência a 100% com os dados do FlightRadar24, eliminação de destinos fictícios ou circulares (`OPO ➔ OPO`) e apresentação da rota real de voo.

### ADR-031 — Exibição Integral de Callsigns ICAO sem Omissão e Service Worker v5 (2026-09-08)
**Contexto:** Ao converter o código ICAO de 3 letras (ex: `EJU34XV`, `AFR442`) para IATA de 2 caracteres (`U234XV`, `AF442`), o utilizador interpretava que o sistema estava a omitir letras (`EJU` virava `U2`, `AFR` virava `AF`), para além de o Service Worker estar a reter activos em cache (`flight-panel-v2`).  
**Decisão:** Manter SEMPRE o callsign ICAO completo e integral nas palhetas principais (`EJU34XV`, `AFR442`, `SWR1ZD`, `TAP1972`), exactamente idêntico ao título principal do FlightRadar24; passar o código comercial IATA para o crachá complementar; actualizar o Service Worker para `v5` com estratégia Network-First forçada para `/_next/` e `/api/`; exibir a versão activa no rodapé (`v1.1.0`); e adicionar acção de limpeza imediata de cache com um simples toque na barra de status inferior.  
**Consequência:** Fidelidade total letra por letra com o radar, sem omissões e actualização imediata sem retenção de cache antiga.

### ADR-032 — Garantia de Visibilidade do Rodapé em Fullscreen Móvel (2026-09-08)
**Contexto:** O utilizador reportou que na versão de telemóvel em fullscreen não conseguia visualizar a barra inferior de rodapé (`RADAR ADS-B`).  
**Decisão:** Substituir `h-full` dos blocos de Modo 1 e Modo 2 por `flex-1 min-h-0`, ajustando o contentor exterior com `overflow-hidden` e espaçamentos dinâmicos (`gap-1.5 sm:gap-2.5`, `p-1.5 sm:p-3`), além de adicionar protecção de safe-area (`pb-[max(0.375rem,env(safe-area-inset-bottom))]`).  
**Consequência:** A barra de rodapé permanece 100% visível e ancorada no fundo do ecrã em qualquer telemóvel ou tablet (portrait ou landscape fullscreen), sem ser empurrada para fora da vista.

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
| 2026-09-08 | v0.8.0 | Fullscreen com 1 toque no ecrã e todas as letras em branco 100%        |
| 2026-09-07 | v0.8.1 | Logótipos garantidos para todas as companhias e transição meteo no ar |
| 2026-09-07 | v0.8.2 | Encaixe perfeito 100dvh sem scroll em fullscreen e cidades nas origens |
| 2026-09-07 | v0.9.0 | Chassis preenchido sem vazios e base global de logótipos ICAO         |
| 2026-09-07 | v0.9.1 | Remoção da moldura de fundo externa (design borderless edge-to-edge)  |
| 2026-09-07 | v1.0.0 | Lançamento oficial v1.0.0 com suporte completo a instalador PWA Mobile |
| 2026-09-07 | v1.0.1 | Integração GitHub remota (Xlhoube/flight-panel) e suporte a deploy Vercel |
| 2026-09-07 | v1.0.2 | Resolução definitiva de imagens quebradas, emblema aeronáutico e suporte a aviação geral |
| 2026-09-08 | v1.0.3 | Resolução de bloqueio meteorológico: coordenadas dinâmicas, GPS, expansão de raio e cache anti-429 |
| 2026-09-08 | v1.0.4 | Implementação de Screen Wake Lock para manter o ecrã sempre ligado durante a utilização |
| 2026-09-08 | v1.0.5 | Dupla fonte ADS-B (adsb.fi + OpenSky), polling rápido de 10s e actualização de Service Worker |
| 2026-09-08 | v1.0.6 | Relógio Solari em tempo real (Data e Hora) e Localização no cabeçalho meteorológico |
| 2026-09-08 | v1.0.7 | Resolução de corte de letras no número do voo, auto-fit responsivo e callsign ATC |
| 2026-09-08 | v1.0.8 | Redefinição do raio de alcance do radar para 30 km (API, frontend e status) |
| 2026-09-08 | v1.0.9 | Integração de rotas reais ADS-B (adsbdb), preservação de callsigns alfanuméricos e correcção OPO->OPO |
| 2026-09-08 | v1.1.0 | Exibição integral de callsigns ICAO (sem omissão de letras), SW v5 Network-First e purge no status |
| 2026-09-08 | v1.1.1 | Garantia de visibilidade da barra de rodapé em fullscreen móvel (flex-1 min-h-0) |
