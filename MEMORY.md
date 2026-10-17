# MEMORY.md — Flight Panel

> Projecto inicializado sob GEMINI v5.0

---

## Contexto Actual

**Projecto:** Flight Panel — Painel de monitorização aérea e meteorológica (*The Flight Wall Official Replica*)  
**Objectivo:** Interface inspirada na referência **theflightwall.com**, reproduzindo a estética oficial da marca: moldura física de display inteligente, cartão com fotografia de alta resolução da pintura da aeronave (*Livery Card*), logótipo oficial da companhia, rota em códigos IATA (`OPO` ➔ `LIS`), modelo da aeronave (`Airbus A320-251N`) e barra de telemetria de aviação (altitude em pés, velocidade em nós e bússola em graus).  
**Versão:** v2.6.0  
**Data de início:** 2026-09-06  
**Última sessão:** 2026-10-17  
**Estado:** PWA internacional completa com 3 ecrãs integrados, suporte para unidades de temperatura (°C e °F) e distância (KM, NM e MI), arranque canónico padronizado sempre em inglês (English default boot), motor de áudio com pré-carregamento e chime aeronáutico de cabine, alerta ativo de novas atualizações, base de dados ICAO Doc 8643/8585, catálogo executivo jets.flights e operadores aviapages.

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

### ADR-034 — Alternância por Swipe entre Painel Principal e Segundo Ecrã de Restantes Voos em LEDs Redondos (2026-09-19)
**Contexto:** O utilizador solicitou que o painel principal exiba fixamente o voo mais próximo (sem alternar voo a voo por swipe) e que o gesto de swipe seja utilizado para alternar entre o painel principal e um segundo ecrã contendo a lista dos restantes voos, onde cada voo exibe exclusivamente a Origem e o Destino com o layout dos LEDs redondos físicos.  
**Decisão:** Fixar o painel principal em `listaVoos[0]`. Configurar os gestos de arrasto lateral horizontal: arrastar para a esquerda no painel principal transita para o segundo ecrã de restantes voos com som de flap, e arrastar para a direita no segundo ecrã regressa ao painel principal. No segundo ecrã (`RestantesVoos`), iterar sobre `listaVoos.slice(1)` e apresentar apenas os códigos IATA e cidades de Origem e Destino com o componente de LEDs redondos (`LedText` com diodos circulares SVG Dot-Matrix), sem qualquer elemento secundário ou telemetria dispersiva. Disponibilizar também botão táctil na Linha 1 do painel e no menu de opções.  
**Consequência:** Navegação fluida de ecrã duplo sem sair da aplicação, foco puro no voo mais próximo no ecrã principal e catálogo ultra-legível em matriz LED analógica para os restantes voos no segundo ecrã.

### ADR-035 — Preservação do Fallback Automático e Adição do 3º Ecrã de Meteorologia Dedicada (2026-09-19)
**Contexto:** O utilizador solicitou que se mantenha ativa a funcionalidade de alternar automaticamente para a meteorologia quando não houver voos no radar e que se adicione um 3º ecrã dedicado à meteorologia.  
**Decisão:** Preservar a transição automática no ecrã principal (`principal`): quando `listaVoos.length === 0` (ou `!vooAtual`), o painel comuta automaticamente para o modo meteorológico com relógio LED, estação e condições atmosféricas. Criar o 3º ecrã dedicado (`meteo`), acessível a qualquer momento através de swipe (arrasto para a esquerda a partir do 2º ecrã ou a partir do 1º se não houver outros voos), botões táteis no cabeçalho/rodapé e atalho direto no menu de opções (`⚙️`). No 3º ecrã, disponibilizar a estação meteorológica completa com telemetria (vento, altímetro QNH, humidade, nascer/pôr do sol e índice UV) e radar integrado com contagem de voos no ar.  
**Consequência:** Arquitetura trilateral perfeita de 3 ecrãs: o utilizador pode consultar a meteorologia sempre que desejar sem perder o conforto da transição automática quando o espaço aéreo fica sem voos.

### ADR-036 — Internacionalização Multilíngue (i18n) em 4 Idiomas com Alternância Instantânea (2026-09-20)
**Contexto:** O utilizador solicitou a funcionalidade: "Internacionalização & Design: 4 Idiomas suportados com alternância instantânea (🇵🇹 PT, 🇬🇧 EN, 🇫🇷 FR, 🇪🇸 ES)".  
**Decisão:** Criar módulo central de internacionalização (`lib/i18n.ts`) com tipos fortes `Idioma = "pt" | "en" | "fr" | "es"` e dicionários completos para as quatro línguas, abrangendo todos os ecrãs (Painel principal de voo, Ecrã 2 de Restantes Voos, Ecrã 3 de Meteorologia Dedicada, Fallback meteorológico automático, Modal de Opções, Modal de Localização e Tabela de Voos `/voos`). Adicionar dicionário multilíngue de nomes de países (`traduzirPais`). Integrar botão de alternância rápida de idioma diretamente no cabeçalho ao lado de `⚙️` (`🇵🇹 PT` / `🇬🇧 EN` / `🇫🇷 FR` / `🇪🇸 ES`) e um seletor visual com 4 botões e bandeiras no modal de opções. Implementar persistência local instantânea em `localStorage` sob as chaves `flightpanel_idioma` e `flight_panel_user_settings.idioma`, sincronização reativa imediata sem recarregar o ecrã e feedback sonoro Flap-Clack Solari ao trocar de língua.  
**Consequência:** Experiência global nativa em 4 idiomas, com mudança a quente instantânea com 1 toque, garantindo total clareza internacional e fidelidade estética.

### ADR-037 — Centralização da Seleção de Idioma Dentro das Definições (2026-10-16)
**Contexto:** O utilizador solicitou a remoção da seleção de idioma do Ecrã 1 para dentro das definições.  
**Decisão:** Eliminar os botões de alternância rápida de idioma presentes nos cabeçalhos dos ecrãs (Ecrã 1 no modo voo e modo meteorologia fallback, bem como Ecrã 2 e Ecrã 3). A seleção e configuração do idioma (🇵🇹 PT, 🇬🇧 EN, 🇫🇷 FR, 🇪🇸 ES) passa a residir de forma exclusiva e dedicada dentro do modal de definições (`⚙️ OPÇÕES / DEFINIÇÕES`), onde se encontra a grelha visual com bandeiras e títulos nativos.  
**Consequência:** Design purificado e limpo nos cabeçalhos analógicos dos ecrãs, alinhado com a autenticidade Solari, mantendo controlo total da internacionalização centralizado nas opções.

### ADR-038 — Base Global de 7.900+ Aeroportos IATA e Resolução Simétrica de Origem/Destino (2026-10-16)
**Contexto:** O utilizador reportou que em certos voos faltava informação na Origem comparado ao Destino (ex: voo cargueiro DHL BCS57D com origem em Vitória/Foronda `VIT`, onde as palhetas e LEDs apresentavam apenas a sigla `VIT` sem o nome do aeroporto nem o país, enquanto o destino `PORTO` exibia cidade, nome oficial do aeroporto e país).  
**Decisão:** Identificada a causa raiz: dependência de dicionários estáticos reduzidos que cobriam apenas cerca de 60 aeroportos. Implementada uma base global de dados com mais de 7.900 aeroportos IATA do mundo (`lib/aeroportos-db.ts`), integrada com sobreposição de alta qualidade para aeroportos e cidades ibéricas e europeias (`lib/aeroportos.ts`), mapeador completo de países ISO para português e suporte multilíngue em `PAISES_TRADUCOES`. Na API de voos (`/api/voos`) e no cliente (`/painel` e `/voos`), todas as origens e destinos são agora enriquecidos com resolução O(1) de latência zero: `cidade` por extenso, `aeroporto` oficial consagrado (ex: `FORONDA` para `VIT`) e `país` normalizado (ex: `ESPANHA` / `SPAIN`), eliminando qualquer assimetria ou falta de dados.  
**Consequência:** Cobertura global de 100% de aeroportos IATA comerciais, civis e cargueiros, com exibição simétrica e rica de cidade, aeroporto e país em todos os voos.

### ADR-039 — Áudio de Novo Voo Exclusivo para o Ecrã 1 / Voo Principal (2026-10-16)
**Contexto:** O utilizador solicitou: "O som de novo voo so deve ser aplicado quando um novo voo aparece no ecra1, deve ignorar os voos do ecra 2". Anteriormente, o efeito sonoro de cabine (`/Flight.mp3`) era despoletado sempre que qualquer aeronave secundária entrava no alcance do radar, mesmo que ficasse posicionada apenas na lista do Ecrã 2.  
**Decisão:** Reformular o gatilho de áudio de novo voo em `app/painel/page.tsx` para monitorizar exclusivamente o identificador da aeronave do Ecrã 1 (`vooAtual = listaVoos[0]`). O jingle `/Flight.mp3` toca unicamente quando um voo surge pela primeira vez no Ecrã 1 ou quando o voo principal em destaque é substituído por outro mais próximo. Qualquer entrada ou saída de voos secundários confinados ao Ecrã 2 (`listaVoos.slice(1)`) é totalmente silenciada.  
**Consequência:** Experiência sonora focada e autêntica, eliminando alertas supérfluos causados por tráfego distante secundário no radar.

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
| 2026-09-19 | v1.8.0 | Alternância por swipe entre painel principal e segundo ecrã de restantes voos em LEDs redondos |
| 2026-09-19 | v1.9.0 | Preservação do fallback automático de meteorologia e adição do 3º ecrã de meteorologia dedicada |
| 2026-09-19 | v1.9.1 | Remoção do botão de restantes voos (+X RESTANTES ➔) do cabeçalho da Linha 1 |
| 2026-09-19 | v1.9.2 | Remoção do botão METEO dos cabeçalhos e eliminação total das barras inferiores de navegação (Rodapés) |
| 2026-09-20 | v2.0.0 | Internacionalização completa (i18n): 4 idiomas (🇵🇹 PT, 🇬🇧 EN, 🇫🇷 FR, 🇪🇸 ES) com alternância instantânea |
| 2026-10-16 | v2.0.1 | Remoção do botão de idioma dos cabeçalhos dos ecrãs; seleção centralizada exclusivamente nas definições |
| 2026-10-16 | v2.0.2 | Base global de 7.900+ aeroportos IATA; resolução completa de cidade, aeroporto e país em origens e destinos |
| 2026-10-16 | v2.0.3 | Áudio de novo voo restrito exclusivamente ao Ecrã 1, ignorando entradas no Ecrã 2 |
| 2026-10-16 | v2.0.4 | Resolução geográfica de estações por GPS, eliminação de strings técnicas e blindagem contra sobreposição no relógio |
| 2026-10-16 | v2.0.5 | Purificação e consistência estrita de idiomas (i18n): eliminação de rótulos bilingues, tradução de condições meteorológicas e meses no relógio |
| 2026-10-16 | v2.0.6 | Simplificação e purificação do modal de localização: remoção da grelha de localidades predefinidas e do botão de cópia de link para telemóvel |
| 2026-10-16 | v2.0.7 | Adição do seletor exato de Raio de Ação do Radar (KM/NM) com filtro Haversine rigoroso e persistência local |
| 2026-10-16 | v2.0.8 | Inversão simétrica dos flaps e leds na Linha 2 de rota: flaps no centro e leds nas extremidades exteriores |
| 2026-10-16 | v2.0.9 | Blindagem e deduplicação estrita do som de novo voo: exclusivo ao Ecrã 1, sem repetições por oscilação ou alternância de voos |
| 2026-10-16 | v2.1.0 | Mini-Radar de Proximidade Cockpit TCAS na Linha 3 de telemetria com varrimento animado, azimute e distância exata (KM/NM) |
| 2026-10-16 | v2.1.1 | Transferência da companhia aérea para o bloco esquerdo (junto ao voo) e adição do fabricante sob o modelo da aeronave à direita |
| 2026-10-16 | v2.1.2 | Otimização total e blindagem de proporções para ecrãs de telemóvel na horizontal (landscape): eliminação de flex-wrap na rota, escala proporcional e encaixe perfeito |
| 2026-10-16 | v2.2.0 | Fluxo de boas-vindas e onboarding sequencial na primeira abertura: popup 1 de instalação PWA seguido do popup 2 de calibração de GPS |

---

### ADR-040 — Resolução Geográfica de Estações e Blindagem do Cabeçalho Meteorológico (2026-10-16)
**Contexto:** O utilizador reportou que no cabeçalho meteorológico por vezes aparecia a string cortada `"GPS SATELITE ("` em vez do nome da localidade e que, dependendo do tamanho da palavra, o bloco da estação colidia e sobrepunha-se fisicamente sobre o relógio e a data.  
**Causa Raiz:** O hook de geolocalização guardava em `localizacao.nome` strings técnicas brutas com parêntesis abertos (ex: `"GPS SATÉLITE (±15M)"`), as quais eram truncadas a 14 caracteres (`"GPS SATELITE ("`). Quando o ecrã continha voos no radar, `setMeteorologia(null)` limpava a meteorologia, forçando o fallback para essa string técnica. Além disso, o relógio e a data não tinham `shrink-0` nem `whitespace-nowrap`, permitindo que a data quebrasse de linha e colidisse com o bloco da direita.  
**Decisão:**  
1. Criar `lib/localidades.ts` com cálculo de menor distância Haversine a mais de 80 localidades e concelhos de Portugal e Ibéria, resolvendo nomes reais (ex: `"VALADARES / GAIA"`, `"PORTO"`, etc.).  
2. Atribuir o nome geográfico resolvido diretamente em `getCurrentPosition` e `watchPosition`, expurgando qualquer string técnica com parêntesis da interface.  
3. Assegurar carregamento imediato e preservação dos dados meteorológicos ao transitar para o 3º ecrã, mesmo com aeronaves detetadas no radar.  
4. Reestruturar o cabeçalho meteorológico (no Fallback do Ecrã 1 e no 3º Ecrã) com `shrink-0` e alinhamento horizontal inquebrável para o relógio e a data (`horaAtual` em `lg` e `dataAtual` em `sm`), limitando o bloco da estação a `max-w-[45%]` com dimensionamento dinâmico no `LedText` (`xs`, `sm` ou `md`).  
**Consequência:** Eliminação total de colisões visuais, relógio sempre estável e legível, e exibição limpa da estação meteorológica geográfica real.

### ADR-041 — Purificação e Consistência Estrita de Idiomas (i18n) (2026-10-16)
**Contexto:** O utilizador reportou a existência de misturas de idiomas na interface (ex: termos em inglês a aparecer em português ou rótulos bilingues com barras).  
**Causa Raiz:**  
1. Rótulos compostos antigos com barras bilingues residuais (`VOO / FLIGHT`, `ORIGEM / DEPARTURE`, `DESTINO / DESTINATION`, `RUMO / HEADING`, `AIRCRAFT`).  
2. Textos estáticos fixados em português no template JSX (`3º ECRÃ • `, `ALTÍMETRO`, `RELATIVA`, `AURORA`, `CREPÚSCULO`, `MODERADO`, `RADAR METEOROLÓGICO ATIVO`, `CONDIÇÃO ATMOSFÉRICA`).  
3. Descrições textuais das condições atmosféricas fornecidas pela API OpenWeatherMap em português (ex: `CEU LIMPO`, `NUBLADO`) sem tradução dinâmica para os restantes idiomas.  
4. Nomes de meses no relógio fixos em português (`OUT`) mesmo com idioma inglês, francês ou espanhol selecionado.  
**Decisão:**  
1. Purificar completamente os 4 dicionários em `lib/i18n.ts` (`pt`, `en`, `fr`, `es`), garantindo que cada idioma utiliza exclusivamente termos puros da sua própria língua sem barras bilingues nem termos estrangeiros residuais.  
2. Adicionar novas chaves ao dicionário: `cabecalho_ecra3`, `cabecalho_radar`, `meteo_temperatura_sensacao`, `meteo_min`, `meteo_max`, `meteo_precipitacao`, e subtítulos dedicados para os 6 cartões de telemetria meteorológica.  
3. Implementar a função `traduzirCondicaoMeteo(condicao, idioma)` para traduzir dinamicamente as condições atmosféricas da API para o idioma ativo.  
4. Implementar a função `obterMesAbreviado(mesIndex, idioma)` e reativar a atualização da data no relógio ao alternar o idioma.  
**Consequência:** 100% de coerência e pureza linguística em todos os ecrãs (Ecrã 1 Voo/Fallback, Ecrã 2 Restantes Voos, Ecrã 3 Meteorologia e tabela `/voos`), sem qualquer mistura de línguas.

### ADR-042 — Simplificação do Modal de Localização / Radar (2026-10-16)
**Contexto:** O utilizador solicitou a remoção da grelha de botões de localidades predefinidas (`OU SELECCIONA A TUA LOCALIDADE (1 TOQUE)`) e do botão de partilha de link para telemóvel (`COPIAR LINK DE COORDENADAS PARA O TELEMÓVEL`) do modal de localização.  
**Decisão:**  
1. Remover cirurgicamente o bloco de cópia de coordenadas e respetiva legenda explicativa.  
2. Remover a secção e a grelha de localidades predefinidas (`LOCAIS_PREDEFINIDOS`).  
3. Preservar o bloco de telemetria ativa (`PONTO ACTUAL ACTIVO` com nome geográfico e precisão em metros), o botão direto de GPS (`OBTER COORDENADAS POR GPS (TELEMÓVEL / PC)`) e a secção de coordenadas manuais personalizadas com botão de gravação.  
**Consequência:** Modal muito mais limpo, minimalista e sem poluição visual ou elementos redundantes.

### ADR-043 — Controlo Exato e Dinâmico do Raio de Ação do Radar (2026-10-16)
**Contexto:** O utilizador solicitou a adição de uma opção exata para configurar o raio de ação do radar. Anteriormente o raio estava fixado em 20 km no código do cliente e com limites restritivos no backend.  
**Decisão:**  
1. **Controlo de UI Unificado e Flexível:** Adicionar a secção `RAIO DE AÇÃO DO RADAR` tanto no Modal de Opções Gerais como no Modal de Localização, com botões de seleção rápida (5, 10, 20, 30 e 50 KM), slider deslizante contínuo e campo de entrada numérico manual para digitação de qualquer valor exato ao quilómetro (de 1 a 250 KM), acompanhado da conversão náutica aeronáutica em tempo real (`NM`).  
2. **Filtragem Circular Rigorosa (Haversine):** No backend (`/api/voos`), alargar o parâmetro `radius` para permitir qualquer valor exato entre 1 e 250 km e manter o filtro circular estrito `calcularDistanciaHaversineKm <= radiusKm`. No cliente (`/painel` e `/voos`), substituir os valores fixos de 20 km pelo estado dinâmico `raioKm`, garantindo exatidão geométrica perfeita.  
3. **Persistência e Reatividade Imediata:** Guardar a preferência em `localStorage` sob `flight_panel_user_settings.raioKm` e `flight_panel_raio_km`. Qualquer alteração no raio aciona um novo pedido de voos imediato sem recarregar a página.  
**Consequência:** O utilizador tem controlo milimétrico e absoluto sobre o alcance de deteção aérea, adaptável a aeroportos próximos ou a espaço aéreo alargado.
 
### ADR-044 — Inversão Simétrica de Flaps e LEDs na Linha 2 de Rota (2026-10-16)
**Contexto:** O utilizador solicitou trocar de lado os LEDs com os flaps na Linha 2 de rota aérea (`Muda de lado os leds com os flaps`), anexando uma imagem do bloco de destino.  
**Decisão:**  
1. Inverter a disposição interna dos elementos de rota para uma composição com simetria central:
   - **Origem (à esquerda do ecrã):** Posicionar os LEDs informativos (`LedText` com cidade, aeroporto e país) à esquerda (exterior) e as 3 palhetas Split-Flap (`FlapWord`) à direita (centro).
   - **Destino (à direita do ecrã):** Posicionar as 3 palhetas Split-Flap (`FlapWord`) à esquerda (centro) e os LEDs informativos (`LedText` com cidade, aeroporto e país) à direita (exterior).
2. Layout global resultante: `[LEDS ORIGEM] [FLAP ORIGEM]` ➔ ✈ ➔ `[FLAP DESTINO] [LEDS DESTINO]`. Os flaps mecânicos unem-se no centro da rota ao redor do ícone do avião, e os leds informativos equilibram harmoniosamente as extremidades laterais.  
**Consequência:** Simetria visual e equilíbrio estético no Ecrã 1, mantendo total responsividade e legibilidade de todas as informações aeroportuárias.

### ADR-045 — Blindagem e Deduplicação Estrita do Áudio de Novo Voo (/Flight.mp3) (2026-10-16)
**Contexto:** O utilizador reportou que o som de novo voo parecia estar a repetir demasiadas vezes e exigiu que apenas deve tocar para o voo que estiver no Ecrã 1 (`Verifica o som de novo voo, parece estar a repetir demasiadas vezes. apenas deve tocar para o voo que estiver no ecra 1`).  
**Causa Raiz:**  
1. **Alternância no Topo (#1):** Quando 2 ou mais voos sobrevoam o radar com distâncias próximas, pequenas variações de cálculo faziam-nos alternar entre 1º e 2º lugar a cada 15 segundos; como a referência anterior guardava apenas o ID do último voo, cada transição disparava o som repetidamente em loop.  
2. **Oscilação de Rede/API:** Se a OpenSky devolvesse temporariamente 0 estados ou desse timeout por um ciclo, a lista de voos era esvaziada e, no ciclo seguinte, o mesmo voo reaparecia e disparava o som de novo.  
3. **Reprodução Fora do Ecrã 1:** O efeito disparava mesmo quando o utilizador estava a visualizar o Ecrã 2 (Restantes Voos) ou o Ecrã 3 (Meteorologia).  
**Decisão:**  
1. **Verificação de Ecrã Ativo:** Condicionar a reprodução estritamente a `ecraAtivo === "principal"` e `vooAtual !== null`. Se o utilizador estiver noutro ecrã, o áudio nunca toca.  
2. **Deduplicação Persistente por Aeronave:** Implementar `voosJaTocadosRef` (`Map<string, number>`) indexado pela chave única da aeronave (`ICAO24` ou `Callsign`). Uma aeronave toca no máximo **uma única vez** por sessão (com janela de expiração de 45 min).  
3. **Prevenção de Falso Alarme no Arranque:** Ao carregar a aplicação pela primeira vez com voos já presentes, as aeronaves existentes são registadas como já conhecidas, evitando disparos abruptos imediatos.  
4. **Cooldown de Segurança:** Limitar o intervalo entre toques a um mínimo de 15 segundos para evitar qualquer disparo em rajada.  
5. **Estabilização do GPS:** Impedir re-renders redundantes no hook `watchPosition` quando a latitude e longitude não sofreram alterações.  
**Consequência:** O som `/Flight.mp3` toca com precisão cirúrgica apenas quando uma nova aeronave entra no Ecrã 1, eliminando completamente repetições irritantes ou loops de áudio.

### ADR-046 — Mini-Radar de Proximidade Cockpit TCAS na Linha 3 de Telemetria (2026-10-16)
**Contexto:** O utilizador solicitou a criação de uma espécie de radar que informa a que distância está o avião do utilizador (`Cria uma especie de radar que informa a que distançia esta o aviao do utiizador`).  
**Decisão:**  
1. **Módulo de Radar na Telemetria:** Expandir a Linha 3 de 3 para 4 módulos balanceados (`grid-cols-2 sm:grid-cols-4`): `ALTITUDE`, `VELOCIDADE`, `RUMO` e `DISTÂNCIA / RADAR`.
2. **Componente Visual `MiniRadarDisplay`:**
   - Scope circular escuro com acabamento esmeralda fosforescente (`#03090e`, borda `emerald-500/40` e sombra de cockpit).
   - Efeito de varrimento contínuo 360° (*Sweep Beam*) via animação rotativa suave (`conic-gradient`).
   - Grelha tática com anel exterior de alcance máximo (`raioKm`), anel intermédio de 50%, eixos cardeais de mira central e indicador Norte (`N`).
   - Posição do utilizador no centro como ponto de radar verde fixo.
   - Cálculo geodésico de azimute (*Bearing*) e distância relativa Haversine: a aeronave é plotada com precisão polar no ângulo e distância relativa exatos.
   - Blip da aeronave com anel de eco pulsante e silhueta orientada dinamicamente com o rumo magnético real (`rumoVoo`).
3. **Leitura Numérica Estilo Cockpit LED:**
   - Exibição em grande formato numérico `LedText` da distância com adaptação automática de unidade: `NM` (milhas náuticas) quando a velocidade está em `KTS`, ou `KM` quando a velocidade está em `KMH`.
   - Subtítulo com direção cardeal e graus de azimute (ex: `NE • 042°`) e equivalência métrica/náutica secundária.
**Consequência:** Informação de proximidade aeronáutica em tempo real de nível profissional, integrando perfeitamente a estética oficial do display sem comprometer o espaço útil do ecrã.

### ADR-047 — Reorganização da Linha 1: Companhia Aérea à Esquerda e Fabricante do Avião à Direita (2026-10-16)
**Contexto:** O utilizador solicitou mudar de lado o nome da companhia aérea e adicionar o fabricante do avião (`Muda o nome da companhia e adiciona o fabricante do aviao`), desenhando na captura de ecrã uma seta a transferir a companhia da direita para a esquerda.  
**Decisão:**  
1. **Transferência da Companhia Aérea:** Mover o nome da companhia (`infoVoo.nomeCompanhia`, ex: `RYANAIR`) para o bloco esquerdo da Linha 1, posicionado harmoniosamente por baixo do número de voo em LED e junto ao logótipo oficial.
2. **Resolução Automática do Fabricante:** Criar a função `obterFabricanteAeronave(codAeronave, nomeAeronave)` que analisa os códigos ICAO e designações para determinar com precisão o construtor aeronáutico (`BOEING`, `AIRBUS`, `EMBRAER`, `ATR`, `BOMBARDIER`, `CESSNA`, `DASSAULT`, `GULFSTREAM`, `BEECHCRAFT`, `PILATUS`, `CIRRUS`, `SIKORSKY`, `LOCKHEED MARTIN`, `ROBINSON`, `LEONARDO`, etc.).
3. **Exibição do Fabricante:** No bloco direito da Linha 1, por baixo do modelo da aeronave em LEDs (`B737 MAX 8`, `A320NEO`, etc.), exibir em destaque o fabricante aeronáutico resolvido (`infoVoo.fabricante`).  
**Consequência:** Linha 1 perfeitamente equilibrada e contextualizada: a identidade da operadora (logótipo, voo e companhia) fica concentrada à esquerda, e a ficha técnica da máquina (rótulo, modelo e fabricante) fica concentrada à direita.

### ADR-048 — Otimização Estrita para Ecrãs de Telemóvel na Horizontal (Landscape) (2026-10-16)
**Contexto:** O utilizador relembrou que a aplicação é concebida prioritariamente para ecrãs de telemóvel na horizontal (modo paisagem/landscape) e exigiu que todos os elementos têm de encaixar com perfeição absoluta sem cortes ou distorções (`Lembra-te que esta app é para ser usada em ecra de telemovel na horizontal, não te esqueças que tem de encaizar tudo muito bem`).  
**Causa Raiz:**  
1. Em ecrãs móveis landscape (ex: 844x390, 896x414, 915x412), a largura do dispositivo ativa os prefixos `sm:` do Tailwind que aumentam o padding e os tamanhos das fontes, enquanto a altura útil real é muito reduzida (~380px a 410px).  
2. Na Linha 2 de rota aérea, o contentor usava `flex-wrap`, provocando quebras de linha indesejadas que empurravam as palhetas split-flap ou os LEDs para uma segunda linha, dobrando a altura vertical exigida e cortando os elementos na base.  
3. As palhetas mecânicas Split-Flap (`FlapWord`) com tamanho `hero` excediam a altura disponível quando conjugadas com o cabeçalho e a telemetria da Linha 3.  
**Decisão:**  
1. **Linha 2 (Rota) Inquebrável:** Substituir `flex-wrap` por `flex-nowrap shrink-0` em toda a extensão da rota: `[CIDADES + AEROPORTO] [FLAP] --- ✈ --- [FLAP] [CIDADES + AEROPORTO]`. Reduzir `FlapWord` de `hero` para `xl`, que possui a altura mecânica ideal (~38px) para ecrãs horizontais móveis com altura <= 430px.  
2. **Compactação Proporcional da Linha 1 (Cabeçalho):** Ajustar o padding vertical para `px-2 py-1 sm:px-3 sm:py-1.5`, com logótipo proporcional (`w-8 h-8 sm:w-10 sm:h-10`) e distribuição harmoniosa entre o bloco da companhia à esquerda e o fabricante à direita.  
3. **Alinhamento da Linha 3 (Telemetria):** Configurar `grid-cols-4` compacto numa única linha contínua (`py-1 sm:py-1.5`), mantendo o Mini-Radar de Proximidade e os módulos de Altitude, Velocidade e Rumo com proporções milimétricas.  
4. **Proteção Anti-Transbordo:** Ajustar os espaçamentos gerais para `gap-1 sm:gap-1.5`, padding perimetral de segurança `p-1 sm:p-2` e `overflow-hidden` sem barras de scroll.  
**Consequência:** Encaixe perfeito e milimétrico em 100% da área visível de qualquer telemóvel na horizontal (resoluções de 380px a 430px de altura), com 100% dos dados legíveis, zero quebras de linha e fidelidade total ao painel analógico Solari.

### ADR-049 — Fluxo de Boas-Vindas e Onboarding Sequencial na Primeira Abertura (2026-10-16)
**Contexto:** O utilizador solicitou que, ao abrir a aplicação pela primeira vez, surja um popup de instalação seguido de outro popup para obter as coordenadas do dispositivo (`Quando se abre pela primeira vez a app, popup de instalação, seguido de outro popup para obter cordenadas do dispositivo`).  
**Decisão:**  
1. **Deteção de Primeira Abertura:**  
   - Utilização da chave de armazenamento `localStorage.getItem("flight_panel_onboarding_v1")`. Se inexistente, ativa o assistente de boas-vindas com transição suave.
   - O disparo automático e invasivo do GPS nativo do browser no primeiro carregamento foi suprimido até que o utilizador chegue ao passo dedicado de geolocalização.
2. **Passo 1 — Instalação PWA (Popup 1):**  
   - Apresenta um cartão analógico de boas-vindas com destaque `PASSO 1 DE 2 • INSTALAÇÃO PWA`.  
   - Explica as vantagens da aplicação instalada (ecrã inteiro nativo sem barras de navegação, áudio Solari ativo e radar contínuo).  
   - Se o browser fornecer o evento nativo `beforeinstallprompt`, disponibiliza o botão primário de instalação direta (`📲 INSTALAR APLICAÇÃO`). Se não houver prompt nativo (ex: iOS Safari), apresenta instrução simples e botão de avanço (`SEGUINTE ➔`).  
   - O botão secundário (`CONTINUAR NO NAVEGADOR` / `MAIS TARDE`) permite dispensar a instalação sem bloquear o utilizador, transitando de imediato para o Passo 2.
3. **Passo 2 — Coordenadas do Dispositivo e Radar (Popup 2):**  
   - Apresenta o cartão de calibração com destaque `PASSO 2 DE 2 • COORDENADAS & RADAR`.  
   - Explica de forma clara que as coordenadas são essenciais para detetar os voos que passam por cima do utilizador em tempo real.  
   - Botão primário com consentimento consciente (`📡 ATIVAR LOCALIZAÇÃO GPS`). Ao receber sinal, resolve a localidade geográfica com feedback visual imediato (`✅ Sinal GPS fixado com sucesso: [Localidade] (±Xm)`) e botão finalizador (`✈️ ENTRAR NO PAINEL ➔`).  
   - Botão secundário (`USAR LOCALIZAÇÃO PADRÃO (PORTO, PT)`) permite prosseguir sem GPS caso o utilizador prefira não partilhar a localização.
4. **Finalização e Persistência:**  
   - Ao concluir o fluxo, grava `flight_panel_onboarding_v1 = "concluido"` e emite o feedback sonoro de palhetas Solari (`tocarSomFlapClack()`). Em todas as sessões futuras, a aplicação arranca imediatamente no painel de voos sem qualquer interrupção.  
5. **Internacionalização Estrita (i18n):**  
   - Todas as mensagens, botões e notas explicativas foram integradas nativamente nos 4 idiomas suportados (`pt`, `en`, `fr`, `es`).  
**Consequência:** Experiência de utilizador moderna, ergonómica e guiada desde o primeiro segundo, assegurando taxa máxima de adoção de PWA e calibração imediata do radar com consentimento claro do utilizador.

### ADR-050 — Base de Dados Dedicada de Aeronaves ICAO com Foco em Jatos Executivos (2026-10-17)
**Contexto:** O utilizador reportou que jatos privados como o HondaJet surgiam identificados de forma crua pelo código ICAO (`HDJT` tanto no modelo como no fabricante).  
**Decisão:**  
1. Criação do módulo dedicado `lib/aeronaves-db.ts` contendo mais de 150 códigos ICAO de jatos executivos (HondaJet, Embraer Phenom/Praetor/Legacy, Cessna Citation M2/CJ/XLS/Latitude/Longitude, Bombardier Challenger/Global/Learjet, Gulfstream G150 a G800, Dassault Falcon, Pilatus PC-12/PC-24, Beechcraft King Air/Premier, Cirrus Vision Jet, Eclipse, Daher TBM, etc.), além de aviões comerciais e militares.  
2. Implementação da função `resolverInfoAeronave` que resolve modelos para a matriz LED (ex: `HDJT` ➔ `HONDAJET`) e determina o fabricante oficial (ex: `HONDA AIRCRAFT`), eliminando repetições brutas.  
**Consequência:** Apresentação elegante, profissional e precisa de qualquer jato particular ou comercial no painel principal e na lista de voos.

### ADR-051 — Centralização e Ampliação das Palhetas Split-Flap com Áudio Mecânico Ativo (2026-10-17)
**Contexto:** O utilizador questionou sobre juntar os painéis de palhetas no centro, aumentá-los ligeiramente e se o som de rotação mecânica continuava ativo ao mudarem de letra.  
**Decisão:**  
1. **Layout Centralizado em 3 Colunas:** Reorganizar a Linha 2 de forma simétrica: Origem em LEDs no exterior esquerdo, painéis de palhetas (`FlapWord`) agrupados no centro com moldura e sombra interna analógica (`[ ORIGEM ] ✈ [ DESTINO ]`), e Destino em LEDs no exterior direito.  
2. **Ampliação Responsiva (`hero`):** Aumentar a escala das palhetas com regras dinâmicas `clamp()` seguras para visualização em telemóveis horizontais.  
3. **Áudio Mecânico Autêntico na Rotação:** Criar a função `tocarRajadaFlaps()` e associá-la à mudança de texto no componente `FlapWord`. Sempre que os códigos IATA mudam, o sistema dispara uma rajada percussiva de 4 cliques rápidos (Web Audio API sintetizada), reproduzindo o som físico de palhetas Solari a rodar.  
**Consequência:** Linha 2 com foco imponente no centro, estética autêntica de painel de aeroporto e feedback sonoro realista a cada rotação de voo.

### ADR-052 — Emblemas Oficiais de Construtores Aeronáuticos OEM para Jatos Executivos e Voos Sem Logótipo (2026-10-17)
**Contexto:** Em voos executivos particulares (ex: HondaJet, Cessna Citation, Embraer Phenom, Gulfstream) ou voos sem companhia aérea registada, surgia uma caixa quadrada genérica escura ou um espaço vazio, quebrando a estética de luxo do cockpit. O utilizador escolheu a Opção 1: exibir o emblema oficial do fabricante da aeronave (OEM).  
**Decisão:**  
1. Criação do componente vetorial dedicado `lib/fabricantes-logos.tsx` contendo logótipos SVG oficiais de alta fidelidade e emblemas estilizados dos principais construtores aeronáuticos mundiais:
   - **Honda / HondaJet:** Asas estilizadas e tipografia oficial HondaJet.
   - **Cessna:** Emblema histórico do brasão e asas Cessna Citation.
   - **Gulfstream:** Asas de longo alcance com o logótipo oficial Gulfstream.
   - **Bombardier / Learjet:** Trevo emblemático Bombardier Aerospace.
   - **Embraer Executive:** Monograma estilizado de luxo Embraer Executive Jets.
   - **Dassault Falcon:** Silhueta e asas Dassault Aviation.
   - **Pilatus:** Logótipo e escudo suíço Pilatus Aircraft.
   - **Cirrus:** Asas elípticas Cirrus Aircraft / Vision Jet.
   - **Beechcraft:** Brasão clássico Beechcraft / King Air.
   - **Airbus / Boeing / VIP Wings:** Fallbacks dedicados para linhas aéreas ou charters privados.
2. Atualização dos componentes `AirlineLogo` no painel principal (`/painel`) e na lista de voos (`/voos`):
   - Se existir logótipo da companhia aérea comercial via CDN, continua a ser apresentado.
   - Se o logótipo não existir ou falhar, o sistema deteta automaticamente o fabricante e o modelo da aeronave através de `aeronaves-db.ts` e renderiza o emblema vetorial oficial com moldura escura de luxo (`#0d0f16` com rebordo `border-neutral-800`), sem caixas brancas desfasadas.  
**Consequência:** Aspeto premium de fábrica aeronáutica (OEM), eliminando caixas vazias ou genéricas e enriquecendo imediatamente a presença visual de jatos executivos.

### ADR-053 — Unificação Arquitetural do Motor de Áudio Split-Flap e Cabine (2026-10-17)
**Contexto:** Existiam implementações dispersas de Web Audio API e gestão de volume entre `lib/sound.ts` e `app/painel/page.tsx`, gerando código redundante e variáveis globais não sincronizadas.  
**Decisão:**  
1. **Consolidação em `lib/sound.ts`:**  
   - Classe Singleton `SplitFlapAudioEngine` com controlo de estado (`volume`, `isMuted`), gestão preguiçosa e resiliente do `AudioContext` (`resume()`), e sintetizador de impacto mecânico com amortecimento exponencial e ressonância metálica.  
   - Métodos dedicados: `playMechanicalClick()`, `playBurst()` (rajadas percussivas de rotação rápida de palhetas) e `playNewFlight()` (jingle oficial `/Flight.mp3` com fallback mecânico).  
2. **Exportação de API Limpa e Consistente:**  
   - Exportação direta de `tocarSomFlapClack()`, `tocarRajadaFlaps()`, `tocarSomNovoVoo()`, `definirVolumeGlobal()`, `obterVolumeGlobal()`, `definirSomHabilitado()`, `obterSomHabilitado()` e `inicializarAudioContext()`.  
3. **Refatorização de `app/painel/page.tsx`:**  
   - Eliminação de todo o código redundante de sintetizador local e variáveis globais soltas.  
   - Conexão direta dos seletores de áudio do modal de opções `⚙️` e dos componentes `FlapCell` ao motor unificado.  
**Consequência:** Arquitetura limpa, ficheiro `lib/sound.ts` totalmente ativo como fonte única da verdade para o áudio, e desempenho sem fugas de memória nem colisões de `AudioContext`.

### ADR-054 — Geolocalização Híbrida Inteligente com Suporte a IP de Rede para Computadores / PC (2026-10-17)
**Contexto:** No computador (PC de secretária ou portátil ligado por cabo Ethernet ou sem antenas de satélite ativas), o navegador disparava erro de tempo esgotado (`Timeout expired`), impedindo a obtenção automática de coordenadas para o radar de proximidade.  
**Decisão:**  
1. **Endpoint de Servidor Dedicado (`/api/geolocalizacao-ip`):**  
   - Criação da rota Route Handler com múltiplos fornecedores em cascata (`ipapi.co`, `ipwho.is`, `freeipapi.com`) com timeout de segurança e leitura de cabeçalhos de proxy (`x-forwarded-for`, `x-real-ip`).  
   - Devolve latitude, longitude, cidade e país com precisão aproximada (~2 a 4 km) e imunidade a bloqueadores de anúncios (adblockers).  
2. **Fallback Automático Transparente:**  
   - Redução do timeout do GPS do navegador para 7 segundos.  
   - Se ocorrer erro de satélite (`TIMEOUT`, `PERMISSION_DENIED` ou `POSITION_UNAVAILABLE`), o sistema aciona de imediato e de forma transparente o fallback por IP, resolvendo a cidade e fixando o radar de voos sem bloquear o utilizador com ecrãs de erro.  
3. **Controlos Dedicados:**  
   - Adição do botão táctil `🌐 OBTER LOCALIZAÇÃO POR IP (IDEAL PARA PC)` tanto no modal `⚙️ OPÇÕES` como no Passo 2 do assistente de boas-vindas (*Onboarding*).  
**Consequência:** Resolução instantânea e sem atritos da localização em computadores sem antena de satélite GPS, garantindo experiência suave e radar ativo em qualquer dispositivo à primeira tentativa.

### ADR-055 — Integração com Padrões ICAO, Catálogo jets.flights e Diretório aviapages (2026-10-17)
**Contexto:** O utilizador forneceu três referências essenciais de aviação: o portal da ICAO (International Civil Aviation Organization), o catálogo de jatos executivos `jets.flights/catalog/` e o diretório de operadores charter `aviapages.com/companies/`. Era necessário enriquecer a base de dados para garantir que qualquer jato executivo, táxi aéreo ou operador VIP europeu ou global seja imediatamente identificado com o modelo exato, classe, fabricante e logótipo oficial.  
**Decisão:**  
1. **Catálogo de Aeronaves ICAO Doc 8643 (`lib/aeronaves-db.ts`):**  
   - Expansão de modelos executivos e bimotores: Grob SPn (`G180`), SyberJet (`SJ30`), Nextant 400XTI/G90XT (`BE4W`, `G90X`), Mitsubishi Diamond (`MU30`), Gulfstream G100 / Astra (`ASTR`), Westwind (`WW24`), Vulcanair P68 (`P68`), Tecnam P2006T/P2012 (`P206`, `P201`).  
   - Helicópteros executivos e VIP de luxo: Leonardo AW109/AW139/AW169 (`A109`, `A139`, `A169`), Sikorsky S-76 e S-92 VIP (`S76`, `S92`), Bell 206 e 429 (`B06`, `B429`), Airbus Helicopters H130 e Dauphin H155 (`EC30`, `EC55`).  
   - Heurística inteligente enriquecida com suporte a Piaggio, Daher, Bell, Grob, Tecnam e Vulcanair.  
2. **Dicionário de Operadores ICAO Doc 8585 (`app/painel/page.tsx` e `app/voos/page.tsx`):**  
   - Mapeamento direto de companhias charter da `aviapages.com`: NetJets Europe (`NJE`), NetJets US (`EJA`), VistaJet (`VJT`), Flexjet (`LXJ`), Flexjet Europe (`FLJ`), GlobeAir (`GAC`), Air Hamburg (`AHO`), Luxaviation (`LXA`), White Airways Portugal (`WHT`), Valair Portugal (`VVV`), Omni Aviation (`OCN`), ExecuJet (`VCN`), Air X Charter (`AXY`), Luxwing (`LWG`), Tyrol Air Ambulance (`TYW`), Swiss Air-Ambulance Rega (`SAZ`), AirGO Flugservice (`XGO`), Flying Group (`FYL`).  
3. **Emblemas Vetoriais Oficiais OEM e Operadores (`lib/fabricantes-logos.tsx`):**  
   - Criação de insígnias oficiais vetoriais para: **NetJets** (estrela de diamante/asas em preto e platina), **VistaJet** (listra carmesim icónica horizontal), **Flexjet** (asas rubi e ouro), **GlobeAir** (ave geométrica rubi), **Daher TBM** (vórtice aerodinâmico azul e laranja), e **Piaggio Aerospace** (escudo clássico com P alado).  
   - Despacho dinâmico inteligente em `EmblemaFabricante` por fabricante, modelo ou indicativo de chamada (*callsign*).  
**Consequência:** Cobertura de aviação executiva e privada de nível profissional em estrita conformidade com os padrões da ICAO e as principais referências do setor aeronáutico internacional.

### ADR-056 — Sistema Ativo de Deteção e Notificação de Novas Versões para Aplicações em Execução Permanente (2026-10-17)
**Contexto:** Sendo o Flight Panel uma aplicação concebida para funcionar continuamente ligada num ecrã dedicado, tablet, monitor de parede ou quiosque (24 horas por dia, 7 dias por semana), o utilizador necessitava que qualquer nova versão publicada emitisse um alerta visível e ativo enquanto a aplicação está aberta, permitindo atualizar de imediato com um toque.  
**Decisão:**  
1. **Configuração de Versão Central (`lib/versao.ts`):**  
   - Definição canónica de `INFO_VERSAO` contendo `versao`, `buildId`, `dataLancamento` e `descricao` das novidades.  
2. **Endpoint em Tempo Real (`/api/versao`):**  
   - Route handler Next.js configurado com `dynamic = 'force-dynamic'` e cabeçalhos estritos `Cache-Control: no-store, no-cache, max-age=0` para garantir que respostas nunca fiquem em cache intermédia de rede.  
3. **Componente de Cliente Ativo (`components/AlertaAtualizacao.tsx`):**  
   - Registo em `app/layout.tsx` cobrindo transversalmente todos os ecrãs (`/painel`, `/voos`, etc.).  
   - Polling ativo a cada 60 segundos com verificação imediata ao retomar visibilidade (`visibilitychange`/`focus`).  
   - Integração com o Service Worker da PWA (`updatefound` / `SKIP_WAITING`).  
4. **Interface de Alerta com Estética Aeronáutica:**  
   - Notificação flutuante com luz de aviso pulsante ciano/esmeralda, diferencial de versões (`v2.5.0 ➔ v2.5.1`) e resumo das novidades.  
   - Botão de ação primária `🔄 ATUALIZAR AGORA (RECARREGAR)` que limpa caches da PWA e recarrega instantaneamente.  
   - Botão de adiamento `⏱️ ADIAR` (15 min) que preserva um *pill* discreto e pulsante no canto do ecrã para atualização posterior a qualquer momento.  
   - Sinal sonoro discreto de aviso ao disparar pela primeira vez no cockpit.  
**Consequência:** Experiência ininterrupta e autonomia total para ecrãs dedicados — o utilizador é sempre informado no exato momento em que uma nova compilação é disponibilizada na nuvem.

### ADR-057 — Correção do Disparo de Som de Novo Voo, Pré-Carregamento e Chime de Cabine Resiliente (2026-10-17)
**Contexto:** O utilizador reportou que o som de novo voo (`/Flight.mp3`) deixou de funcionar.  
**Diagnóstico & Causa Raiz:**  
1. **Deduplicação Inicial Ultra-Agressiva:** No arranque do painel, o código anterior iterava por todos os voos retornados pela API e marcava toda a lista como já tocada. Quando o voo mais próximo (#1) mudava para outro avião que já constava na lista da área, o som era bloqueado e nunca chegava a tocar.  
2. **Políticas de Autoplay dos Navegadores:** O navegador bloqueava chamadas a `new Audio().play()` geradas por timers assíncronos (`useEffect`/`fetch`) sem prévia interação com o elemento.  
3. **Falta de Desbloqueio Global:** O `AudioContext` permanecia em estado `suspended` na ausência de retoma associada aos gestos globais do utilizador.  
**Decisão:**  
1. **Reestruturação da Lógica de Deteção em `app/painel/page.tsx`:**  
   - Rastreio estrito de `ultimoVooExibidoIdRef`. No arranque inicial, apenas a aeronave atual é registada como linha de base.  
   - Assim que o voo em destaque no Ecrã 1 (#1) muda para outra aeronave, dispara de imediato `tocarSomNovoVoo()` com um cooldown de segurança de 6 segundos.  
2. **Arquitetura de Áudio em `lib/sound.ts`:**  
   - Instância persistente de áudio com `preload = "auto"`.  
   - Função `unlockAudio()` acionada nos eventos de ponteiro/clique/teclado para desbloquear permissões de media de forma transparente.  
   - Criação de sintetizador nativo de **Chime de Cabine Aeronáutica** (*Ding-Dong* com dois tons senoidais Fá#5 e Ré#5) através de Web Audio API, garantindo som instantâneo mesmo que o ficheiro MP3 seja barrado por políticas de navegador.  
3. **Botão de Teste no Modal `⚙️ OPÇÕES`:**  
   - Adição do botão `🔔 TESTAR SOM DE NOVO VOO (/Flight.mp3)` que permite ao utilizador testar e ouvir o som imediatamente.  
**Consequência:** Som de novo voo 100% restaurado, imune a bloqueios de autoplay e com feedback auditivo garantido.

### ADR-058 — Padronização Canónica de Arranque Sempre em Inglês (2026-10-17)
**Contexto:** O utilizador solicitou expressamente que a aplicação deve arrancar sempre em inglês ("en"), alinhando o Flight Panel com o padrão internacional da aviação civil comercial e executiva.  
**Decisão:**  
1. **Configuração de Idioma Raiz em `app/layout.tsx`:**  
   - Atualização da propriedade `<html lang="en">` no layout principal.  
2. **Inicialização de Estado em `app/painel/page.tsx` e `app/voos/page.tsx`:**  
   - O estado do componente arranca estritamente em `useState<Idioma>("en")`.  
   - O fallback das traduções é configurado para `TRADUCOES.en`.  
   - A rotina de montagem de componentes (`useEffect`) deixa de restaurar idiomas locais anteriores gravados no navegador, assegurando que, independentemente do dispositivo ou histórico anterior de sessões, cada novo carregamento ou abertura da aplicação arranca sempre em Inglês.  
   - A alternância dinâmica de idioma durante a sessão continua disponível através do seletor de 4 bandeiras (PT, EN, FR, ES) no modal `⚙️ OPÇÕES`.  
**Consequência:** Consistência internacional aeronáutica e respeito integral pela especificação de arranque do utilizador.

### ADR-059 — Unidades Internacionais de Temperatura (°C / °F) e Distância (KM / NM / MI) (2026-10-17)
**Contexto:** O utilizador solicitou o suporte para outras medidas de temperatura no painel meteorológico e unidades de milhas junto aos quilómetros para internacionalização completa da aplicação.  
**Decisão:**  
1. **Internacionalização em `lib/i18n.ts`:**  
   - Adicionadas 9 novas chaves de tradução nos 4 idiomas (PT, EN, FR, ES) para títulos, subtítulos e unidades de distância (`KM`, `NM`, `MI`) e temperatura (`°C`, `°F`).  
2. **Temperatura Configurável (°C vs °F):**  
   - Implementada a função utilitária `converterTemperatura(tempC, unidade)` com a fórmula `(C * 9/5) + 32`.  
   - Aplicada a conversão automática em tempo real a todas as métricas térmicas: temperatura ambiente principal, sensação térmica, temperatura mínima e temperatura máxima no Ecrã 3 (Meteorologia Dedicada) e no modo meteorológico do Ecrã 1.  
3. **Distância Configurável (KM vs NM vs MI):**  
   - O componente `MiniRadarDisplay` calcula agora a unidade ativa com conversão simultânea em quilómetros (`KM`), milhas náuticas aeronáuticas (`NM` com fator 1.852) e milhas terrestres (`MI` com fator 1.60934), mantendo o valor secundário legível em parêntesis.  
   - A página de voos restantes (`/voos`) lê a preferência do utilizador e formata automaticamente os crachás de proximidade do voo principal e a lista de tráfego aéreo.  
4. **Modal `⚙️ OPÇÕES`:**  
   - Adicionados dois novos blocos de controlo tátil com botões interativos para Distância e Temperatura, com persistência imediata em `localStorage`.  
**Consequência:** Aplicação 100% internacionalizada, compatível com os padrões aeronáuticos e preferências dos utilizadores de qualquer região do mundo.











