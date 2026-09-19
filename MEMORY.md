# MEMORY.md — Flight Panel

> Projecto inicializado sob GEMINI v5.0

---

## Contexto Actual

**Projecto:** Flight Panel — Painel de monitorização aérea e meteorológica (*The Flight Wall Official Replica*)  
**Objectivo:** Interface inspirada na referência **theflightwall.com**, reproduzindo a estética oficial da marca: moldura física de display inteligente, cartão com fotografia de alta resolução da pintura da aeronave (*Livery Card*), logótipo oficial da companhia, rota em códigos IATA (`OPO` ➔ `LIS`), modelo da aeronave (`Airbus A320-251N`) e barra de telemetria de aviação (altitude em pés, velocidade em nós e bússola em graus).  
**Versão:** v1.7.0  
**Data de início:** 2026-09-06  
**Última sessão:** 2026-09-19  
**Estado:** PWA (Progressive Web App) completa e instalável directamente no telemóvel (Android / iPhone), com ícones próprios, Service Worker, arranque automático em modo autónomo (standalone landscape), ecrã inteiro, navegação por arrasto lateral entre todos os voos detectados, botão de opções minimalista ⚙️ e controlo de volume sonoro independente (0 a 100%) com predefinições táteis.

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
**Consequência:** A aplicação pode ser instalada com 1 toque no telemóvel, abrindo com o seu próprio ícone no ecrã principal sem barras de navegação do browser em modo landscape autónomo.

### ADR-023 — Publicação no GitHub e Deploy na Nuvem Vercel (2026-09-07)
**Contexto:** O utilizador solicitou o envio do código para o GitHub (https://github.com/Xlhoube/flight-panel.git) e a disponibilização na Vercel para acesso a partir de qualquer rede ou telemóvel.  
**Decisão:** Configurar o repositório remoto `origin` ligado ao GitHub oficial do utilizador, sincronizar a branch `main` e preparar a integração contínua com a Vercel.  
**Consequência:** A aplicação passa a estar acessível globalmente a partir de qualquer dispositivo ou rede através de um endereço web seguro HTTPS com CI/CD automático.

### ADR-025 — Abertura Automática em Modo Ecrã Inteiro / Fullscreen (2026-09-19)
**Contexto:** O utilizador solicitou que a aplicação abra automaticamente em fullscreen.  
**Decisão:** Configurar o Web App Manifest com `"display": "fullscreen"` (para abertura nativa em ecrã inteiro total quando instalada no telemóvel ou PC). No cliente web, acionar `requestFullscreen()` e `WakeLock` imediatamente na montagem do componente e associar listeners globais de gesto passivo para que, caso o browser imponha restrições de segurança que impeçam fullscreen não solicitado, o primeiro toque em qualquer ponto do ecrã acione instantaneamente o modo ecrã inteiro.  
**Consequência:** A aplicação arranca de imediato ou no primeiro toque em ecrã inteiro total, sem barras de navegador nem distrações.

### ADR-026 — Botão de Opções, Controlo de Áudio e Conversão de Unidades (2026-09-19)
**Contexto:** O utilizador solicitou um botão para opções onde se possa desligar o som e mudar as medidas de altitude de FT (pés) para MT (metros) e de velocidade de KTS (nós) para KMS (km/h).  
**Decisão:** Adicionar o botão `⚙️ OPÇÕES` no cabeçalho do painel principal e criar um modal de opções com alternadores táteis e persistência em `localStorage`. Suportar muting do sintetizador de palhetas e do ficheiro `/Flight.mp3`, bem como cálculo e formatação instantânea de unidades métricas e aeronáuticas (`FT`/`MT` e `KTS`/`KMS`) no painel e na lista de voos.  
**Consequência:** Controlo absoluto do utilizador sobre o ambiente sonoro e visual da aplicação, com opções preservadas entre sessões.

### ADR-027 — Nome Oficial do Aeroporto em Origens e Destinos (2026-09-19)
**Contexto:** O utilizador solicitou a inclusão do nome do aeroporto nas origens e destinos.  
**Decisão:** Integrar dicionário exaustivo de nomes de aeroportos oficiais (`AEROPORTOS_NOMES`), enriquecer a rota com dados da API ADS-B/FlightRadar24 (`origemAeroporto` e `destinoAeroporto`), e apresentá-los com tipografia dedicada em âmbar suave no painel principal e na lista de voos restantes (`/voos`).  
**Consequência:** Identificação transparente e inequívoca do aeroporto específico (ex: "FRANCISCO SÁ CARNEIRO", "HUMBERTO DELGADO", "CHARLES DE GAULLE", "HEATHROW", "ADOLFO SUÁREZ BARAJAS").

### ADR-028 — Navegação entre Voos Restantes por Arrasto Lateral / Swipe (2026-09-19)
**Contexto:** O utilizador solicitou que a lista dos restantes voos seja apresentada através do arrasto para os lados do ecrã.  
**Decisão:** Implementar sistema de gestos táteis e de rato com deteção de arrasto horizontal (`deltaX > 35px` com tolerância angular vertical). No painel principal (`/painel`), arrastar para a esquerda avança para os voos restantes mais distantes, e arrastar para a direita recua em direção ao voo mais próximo. Ao navegar entre voos, acionar o som mecânico de palhetas Solari (`tocarSomFlapClack`), mantendo o jingle de cabine (`/Flight.mp3`) reservado para novos voos detetados no espaço aéreo. Na página `/voos`, arrastar para a direita transita de volta para o painel principal.  
**Consequência:** Navegação fluida, tátil e intuitiva entre todos os voos captados, sem perder o acesso direto à tabela completa.

### ADR-029 — Paridade Meteorológica entre Telemóvel e PC (2026-09-19)
**Contexto:** O utilizador reportou que o painel meteorológico apresentava informações divergentes entre o telemóvel e o computador.  
**Decisão:** Normalização de coordenadas a 2 casas decimais (~1 km), fuso horário explícito `Europe/Lisbon` para horas solares, correção de chave OpenWeatherMap, desativação de cache e respeito rigoroso pelas preferências de localização do utilizador.  
**Consequência:** Dados meteorológicos sincronizados e consistentes entre dispositivos.

### ADR-030 — Remoção dos Emblemas de Telemetria da Linha 1 (2026-09-19)
**Contexto:** O utilizador solicitou a remoção da informação secundária (emblemas de distância em km, número de callsign e contador no radar) exibida junto ao rótulo `VOO / FLIGHT`.  
**Decisão:** Eliminar os elementos de telemetria secundária da Linha 1, mantendo apenas a etiqueta pura `VOO / FLIGHT` e o número do voo em matriz LED de grandes dimensões. A navegação entre voos continua 100% ativa através do arrasto lateral do ecrã (swipe) e a tabela completa de voos fica acessível de forma discreta dentro do menu `⚙️ OPÇÕES`.  
**Consequência:** Design purificado, foco absoluto na identidade visual do voo e eliminação de distrações visuais no cabeçalho.

### ADR-031 — Redesign e Reposicionamento do Botão de Opções (2026-09-19)
**Contexto:** O utilizador solicitou a melhoria do posicionamento do botão de opções e a simplificação para exibir apenas o ícone, sem texto.  
**Decisão:** Retirar o botão com texto da etiqueta `AIRCRAFT` e `LOCALIZAÇÃO / ESTAÇÃO`. Criar um botão quadrado arredondado exclusivo (`w-7 h-7 sm:w-8 sm:h-8`), com fundo translúcido e rebordo subtil, contendo exclusivamente o ícone `⚙️`, perfeitamente alinhado na extremidade direita do cabeçalho da Linha 1 tanto no modo de voo como no modo meteorológico.  
**Consequência:** Layout desafogado, eliminação de sobreposição com as legendas de aeronave e localização, e posicionamento consistente e ergonómico em todos os ecrãs.

### ADR-032 — Design Compacto e Responsivo do Modal de Opções para Telemóveis em Modo Paisagem (2026-09-19)
**Contexto:** O utilizador reportou que o quadro de opções ultrapassava a altura do ecrã do telemóvel ("o quadro das opções é maior que o ecra do telemovel"), especialmente no modo horizontal/paisagem.  
**Decisão:** Reestruturar o modal de opções para altura máxima dinâmica (`max-h-[92dvh]`) com barra de desfasamento vertical interna (`overflow-y-auto`), fundir as opções de unidades de altitude e velocidade numa grelha responsiva de 2 colunas (`grid-cols-1 sm:grid-cols-2`), compactar os espaçamentos e preenchimentos (`p-3 sm:p-5`, `gap-2.5 sm:gap-3.5`) e garantir que todos os botões e títulos cabem confortavelmente em qualquer dispositivo móvel.  
**Consequência:** Encaixe perfeito no ecrã do telemóvel em modo horizontal e vertical, sem cortes nem botões inacessíveis.

### ADR-033 — Controlo de Volume Independente de Áudio nas Opções (2026-09-19)
**Contexto:** O utilizador solicitou a adição de um controlo de volume nas opções para que o som da aplicação seja regulado independentemente do som do sistema operativo.  
**Decisão:** Implementar controlo de ganho independente (`globalVolume`) no sintetizador de palhetas mecânicas Solari (`tocarSomFlapClack`), no reprodutor de áudio (`/Flight.mp3`) e no motor `SplitFlapAudioEngine`. No modal de opções, disponibilizar um controlo deslizante (*slider range*) com percentagem em tempo real (0% a 100%), ícones sonoros dinâmicos (`🔇`, `🔉`, `🔊`), quatro atalhos tácteis predefinidos (`25%`, `50%`, `75%`, `100%`), feedback sonoro imediato de calibração e persistência em `localStorage`.  
**Consequência:** Ajuste preciso do volume sonoro na aplicação sem necessidade de alterar o volume principal do telemóvel ou do computador.

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
| 2026-09-07 | v1.0.2 | Resolução definitiva de imagens quebradas, emblema aeronáutico e suporte a aviação geral |
| 2026-09-12 | v1.1.0 | Ecrã híbrido: Palhetas apenas nos códigos IATA (3 letras) e LED display para todo o resto |
| 2026-09-12 | v1.2.0 | LEDs redondos individuais (SVG Dot-Matrix 5x7) com pitch espaçado e GPS 100% automático na abertura |
| 2026-09-19 | v1.3.0 | Remoção de swipe lateral, fixação no voo mais próximo, nova página /voos e áudio Flight.mp3 ao detetar voo |
| 2026-09-19 | v1.3.1 | Inclusão de informação do país em origens e destinos no painel principal e na lista de voos |
| 2026-09-19 | v1.3.2 | Abertura e ativação automática em modo ecrã inteiro (fullscreen nativo e PWA) |
| 2026-09-19 | v1.3.3 | Remoção total da barra inferior de status e libertação de espaço vertical |
| 2026-09-19 | v1.4.0 | Modal de Opções: botão de controlo de som (muting) e conversor de medidas (FT/MT e KTS/KMS) |
| 2026-09-19 | v1.5.0 | Exibição do nome oficial do aeroporto (origens e destinos) no painel e na lista de voos |
| 2026-09-19 | v1.6.0 | Navegação entre todos os voos restantes por arrasto lateral (ecrã tátil e rato) e botões dedicados |
| 2026-09-19 | v1.6.1 | Correção e sincronização da telemetria meteorológica entre telemóvel e computador |
| 2026-09-19 | v1.6.2 | Remoção dos emblemas de telemetria da Linha 1 para design minimalista limpo |
| 2026-09-19 | v1.6.3 | Reposicionamento do botão de opções com ícone ⚙️ minimalista à direita |
| 2026-09-19 | v1.6.4 | Design compacto do modal de opções com scroll interno e grelha 2-col para telemóveis em modo paisagem |
| 2026-09-19 | v1.7.0 | Controlo de volume de áudio independente (0 a 100%) nas opções com slider e atalhos rápidos |
