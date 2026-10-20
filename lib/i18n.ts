// ─── Motor de Internacionalização (i18n) — Flight Panel ───────────────────────
// Suporte a 4 idiomas: Português (PT), Inglês (EN), Francês (FR) e Espanhol (ES)

export type Idioma = "pt" | "en" | "fr" | "es";

export interface InfoIdioma {
  codigo: Idioma;
  rotulo: string;
  bandeira: string;
  nomeNativo: string;
}

export const IDIOMAS_DISPONIVEIS: InfoIdioma[] = [
  { codigo: "pt", rotulo: "PT", bandeira: "🇵🇹", nomeNativo: "Português" },
  { codigo: "en", rotulo: "EN", bandeira: "🇬🇧", nomeNativo: "English" },
  { codigo: "fr", rotulo: "FR", bandeira: "🇫🇷", nomeNativo: "Français" },
  { codigo: "es", rotulo: "ES", bandeira: "🇪🇸", nomeNativo: "Español" },
];

export interface DicionarioTraducoes {
  // Cabeçalho & Linha 1
  rotulo_voo: string;
  rotulo_callsign: string;
  rotulo_aeronave: string;
  rotulo_radar: string;
  btn_instalar: string;
  btn_opcoes: string;
  no_radar: string;

  // Linha 2 (Rota)
  rotulo_origem: string;
  rotulo_destino: string;
  estado_em_voo: string;
  estado_no_solo: string;
  estado_carregando: string;

  // Linha 3 (Telemetria)
  rotulo_altitude: string;
  rotulo_velocidade: string;
  rotulo_rumo: string;
  rotulo_distancia: string;
  telemetria_subindo: string;
  telemetria_descendo: string;
  telemetria_nivelado: string;

  // Ecrã 2: Lista dos Restantes Voos
  ecra2_titulo: string;
  ecra2_subtitulo: string;
  ecra2_sem_outros: string;
  ecra2_voo_principal_aviso: string;
  ecra2_origem: string;
  ecra2_destino: string;

  // Ecrã 3 & Fallback: Meteorologia
  meteo_estacao: string;
  meteo_estacao_local: string;
  cabecalho_ecra3: string;
  cabecalho_radar: string;
  meteo_condicoes: string;
  meteo_temperatura: string;
  meteo_sensacao: string;
  meteo_temperatura_sensacao: string;
  meteo_min_max: string;
  meteo_min: string;
  meteo_max: string;
  meteo_precipitacao: string;
  meteo_vento: string;
  meteo_humidade: string;
  meteo_pressao: string;
  meteo_uv: string;
  meteo_nascer_sol: string;
  meteo_por_sol: string;
  meteo_sub_altimetro: string;
  meteo_sub_humidade: string;
  meteo_sub_aurora: string;
  meteo_sub_crepusculo: string;
  meteo_sub_uv: string;
  meteo_sem_voos_radar: string;
  meteo_aguardando: string;
  meteo_procurando_voos: string;
  meteo_voos_detectados: string;

  // Modal de Opções
  opcoes_titulo: string;
  opcoes_idioma_titulo: string;
  opcoes_idioma_subtitulo: string;
  opcoes_audio_titulo: string;
  opcoes_audio_subtitulo: string;
  opcoes_audio_ativado: string;
  opcoes_audio_desativado: string;
  opcoes_volume_titulo: string;
  opcoes_volume_silenciado: string;
  opcoes_altitude_titulo: string;
  opcoes_altitude_subtitulo: string;
  opcoes_unidade_pes: string;
  opcoes_unidade_metros: string;
  opcoes_velocidade_titulo: string;
  opcoes_velocidade_subtitulo: string;
  opcoes_unidade_nos: string;
  opcoes_unidade_kmh: string;
  opcoes_distancia_titulo: string;
  opcoes_distancia_subtitulo: string;
  opcoes_unidade_km: string;
  opcoes_unidade_nm: string;
  opcoes_unidade_mi: string;
  opcoes_temperatura_titulo: string;
  opcoes_temperatura_subtitulo: string;
  opcoes_unidade_celsius: string;
  opcoes_unidade_fahrenheit: string;
  opcoes_luminosidade_titulo: string;
  opcoes_luminosidade_subtitulo: string;
  opcoes_luminosidade_manual: string;
  opcoes_luminosidade_auto: string;
  opcoes_luminosidade_auto_desc: string;
  opcoes_luminosidade_testar_btn: string;
  opcoes_raio_titulo: string;
  opcoes_raio_subtitulo: string;
  opcoes_raio_alcance_exato: string;
  loc_raio_titulo: string;
  opcoes_localizacao_titulo: string;
  opcoes_localizacao_btn: string;
  opcoes_navegacao_titulo: string;
  opcoes_ecra_principal: string;
  opcoes_ecra_restantes: string;
  opcoes_ecra_meteo: string;
  opcoes_ver_tabela: string;
  opcoes_guardar_fechar: string;
  opcoes_reabrir_onboarding: string;

  // Modal de Localização
  loc_titulo: string;
  loc_subtitulo: string;
  loc_ponto_activo: string;
  loc_cidade: string;
  loc_lat: string;
  loc_lon: string;
  loc_gps_btn: string;
  loc_guardar: string;
  loc_cancelar: string;

  // Tabela de Voos (/voos)
  tab_titulo: string;
  tab_voltar: string;
  tab_voo: string;
  tab_companhia: string;
  tab_origem: string;
  tab_destino: string;
  tab_altitude: string;
  tab_velocidade: string;
  tab_distancia: string;
  tab_aeronave: string;
  tab_voo_principal: string;

  // Onboarding (Primeira Abertura)
  onboarding_passo_1_badge: string;
  onboarding_instalacao_pwa_badge: string;
  onboarding_instalar_titulo: string;
  onboarding_instalar_subtitulo: string;
  onboarding_card_ecra_inteiro: string;
  onboarding_card_sem_barras: string;
  onboarding_card_audio: string;
  onboarding_card_jingle: string;
  onboarding_card_radar: string;
  onboarding_card_tempo_real: string;
  onboarding_instalar_btn: string;
  onboarding_instalar_mais_tarde: string;
  onboarding_instalar_dica_ios: string;
  onboarding_seguinte: string;
  onboarding_passo_2_badge: string;
  onboarding_coordenadas_badge: string;
  onboarding_gps_titulo: string;
  onboarding_gps_subtitulo: string;
  onboarding_estado_sinal: string;
  onboarding_status_conectado: string;
  onboarding_status_sintonizando: string;
  onboarding_status_aguardando: string;
  onboarding_instrucao_gps: string;
  onboarding_gps_btn: string;
  onboarding_gps_padrao_btn: string;
  onboarding_obter_ip_btn: string;
  onboarding_gps_a_obter: string;
  onboarding_gps_sucesso: string;
  onboarding_gps_erro: string;
  onboarding_concluir: string;
  onboarding_concluir_btn: string;
  onboarding_raio_rotulo: string;
}

export const TRADUCOES: Record<Idioma, DicionarioTraducoes> = {
  pt: {
    // Cabeçalho & Linha 1
    rotulo_voo: "VOO",
    rotulo_callsign: "INDICATIVO",
    rotulo_aeronave: "AERONAVE",
    rotulo_radar: "RADAR",
    btn_instalar: "📲 INSTALAR",
    btn_opcoes: "Opções",
    no_radar: "no radar",

    // Linha 2 (Rota)
    rotulo_origem: "ORIGEM",
    rotulo_destino: "DESTINO",
    estado_em_voo: "EM VOO",
    estado_no_solo: "NO SOLO",
    estado_carregando: "A CARREGAR",

    // Linha 3 (Telemetria)
    rotulo_altitude: "ALTITUDE",
    rotulo_velocidade: "VELOCIDADE",
    rotulo_rumo: "RUMO",
    rotulo_distancia: "DISTÂNCIA",
    telemetria_subindo: "SUBIDA",
    telemetria_descendo: "DESCIDA",
    telemetria_nivelado: "NIVELADO",

    // Ecrã 2: Lista dos Restantes Voos
    ecra2_titulo: "VOOS RESTANTES NO RADAR",
    ecra2_subtitulo: "AERONAVES ADICIONAIS CAPTADAS NO ESPAÇO AÉREO",
    ecra2_sem_outros: "SEM OUTROS VOOS NO ESPAÇO AÉREO",
    ecra2_voo_principal_aviso: "VOO MAIS PRÓXIMO EM EXIBIÇÃO NO ECRÃ PRINCIPAL",
    ecra2_origem: "ORIGEM",
    ecra2_destino: "DESTINO",

    // Ecrã 3 & Fallback: Meteorologia
    meteo_estacao: "LOCALIZAÇÃO",
    meteo_estacao_local: "ESTAÇÃO METEOROLÓGICA LOCAL",
    cabecalho_ecra3: "3º ECRÃ • ESTAÇÃO METEOROLÓGICA (20 KM)",
    cabecalho_radar: "RADAR METEOROLÓGICO ATIVO (20 KM)",
    meteo_condicoes: "CONDIÇÕES METEOROLÓGICAS",
    meteo_temperatura: "TEMPERATURA",
    meteo_sensacao: "SENSAÇÃO",
    meteo_temperatura_sensacao: "TEMPERATURA & SENSAÇÃO",
    meteo_min_max: "MÍN / MÁX",
    meteo_min: "MÍN",
    meteo_max: "MÁX",
    meteo_precipitacao: "PRECIP",
    meteo_vento: "VENTO",
    meteo_humidade: "HUMIDADE",
    meteo_pressao: "PRESSÃO QNH",
    meteo_uv: "ÍNDICE UV",
    meteo_nascer_sol: "NASCER DO SOL",
    meteo_por_sol: "PÔR DO SOL",
    meteo_sub_altimetro: "ALTÍMETRO",
    meteo_sub_humidade: "RELATIVA",
    meteo_sub_aurora: "AURORA",
    meteo_sub_crepusculo: "CREPÚSCULO",
    meteo_sub_uv: "MODERADO",
    meteo_sem_voos_radar: "SEM AERONAVES NO ESPAÇO AÉREO IMEDIATO",
    meteo_aguardando: "EM ESPERA DE TRÁFEGO AÉREO",
    meteo_procurando_voos: "A PROCURAR VOOS NO ESPAÇO AÉREO...",
    meteo_voos_detectados: "VOOS DETETADOS NO RADAR",

    // Modal de Opções
    opcoes_titulo: "OPÇÕES DO PAINEL",
    opcoes_idioma_titulo: "IDIOMA DO PAINEL",
    opcoes_idioma_subtitulo: "Alternância Instantânea",
    opcoes_audio_titulo: "ÁUDIO E EFEITOS SONOROS",
    opcoes_audio_subtitulo: "Palhetas e Alertas",
    opcoes_audio_ativado: "ATIVADO",
    opcoes_audio_desativado: "DESATIVADO",
    opcoes_volume_titulo: "VOLUME INDEPENDENTE",
    opcoes_volume_silenciado: "SILENCIADO",
    opcoes_altitude_titulo: "ALTITUDE",
    opcoes_altitude_subtitulo: "Telemetria",
    opcoes_unidade_pes: "PÉS (FT)",
    opcoes_unidade_metros: "METROS (MT)",
    opcoes_velocidade_titulo: "VELOCIDADE",
    opcoes_velocidade_subtitulo: "Ar",
    opcoes_unidade_nos: "NÓS (KTS)",
    opcoes_unidade_kmh: "KM/H (KMS)",
    opcoes_distancia_titulo: "DISTÂNCIA",
    opcoes_distancia_subtitulo: "Radar e Voos",
    opcoes_unidade_km: "QUILÓMETROS (KM)",
    opcoes_unidade_nm: "MILHAS NÁUTICAS (NM)",
    opcoes_unidade_mi: "MILHAS (MI)",
    opcoes_temperatura_titulo: "TEMPERATURA",
    opcoes_temperatura_subtitulo: "Meteorologia",
    opcoes_unidade_celsius: "CELSIUS (°C)",
    opcoes_unidade_fahrenheit: "FAHRENHEIT (°F)",
    opcoes_luminosidade_titulo: "LUMINOSIDADE DO ECRÃ",
    opcoes_luminosidade_subtitulo: "Controlo manual e automático",
    opcoes_luminosidade_manual: "Nível de Luminosidade",
    opcoes_luminosidade_auto: "Aumento Automático em Novo Voo",
    opcoes_luminosidade_auto_desc: "Aumenta a luminosidade para 100% durante 5 segundos ao detetar um novo voo.",
    opcoes_luminosidade_testar_btn: "TESTAR AUMENTO DE BRILHO (5 SEGUNDOS)",
    opcoes_raio_titulo: "RAIO DE AÇÃO DO RADAR",
    opcoes_raio_subtitulo: "Alcance circular de deteção (exato)",
    opcoes_raio_alcance_exato: "Raio exato",
    loc_raio_titulo: "RAIO DE AÇÃO",
    opcoes_localizacao_titulo: "LOCALIZAÇÃO DO RADAR",
    opcoes_localizacao_btn: "ALTERAR LOCALIDADE OU COORDENADAS",
    opcoes_navegacao_titulo: "NAVEGAÇÃO ENTRE ECRÃS (3 ECRÃS)",
    opcoes_ecra_principal: "1. VOO PRINCIPAL",
    opcoes_ecra_restantes: "2. RESTANTES",
    opcoes_ecra_meteo: "3. METEOROLOGIA",
    opcoes_ver_tabela: "VER TABELA COMPLETA DE VOOS",
    opcoes_guardar_fechar: "GUARDAR E FECHAR",
    opcoes_reabrir_onboarding: "REABRIR ASSISTENTE DE INSTALAÇÃO & GPS",

    // Modal de Localização
    loc_titulo: "Localização do Radar",
    loc_subtitulo: "Define o centro do raio circular de",
    loc_ponto_activo: "PONTO ACTUAL ACTIVO",
    loc_cidade: "CIDADE OU REGIÃO",
    loc_lat: "LATITUDE",
    loc_lon: "LONGITUDE",
    loc_gps_btn: "OBTER GPS AUTOMÁTICO",
    loc_guardar: "GUARDAR LOCALIZAÇÃO",
    loc_cancelar: "CANCELAR",

    // Tabela de Voos (/voos)
    tab_titulo: "TABELA DETALHADA DE VOOS NO RADAR",
    tab_voltar: "VOLTAR AO PAINEL",
    tab_voo: "VOO",
    tab_companhia: "COMPANHIA",
    tab_origem: "ORIGEM",
    tab_destino: "DESTINO",
    tab_altitude: "ALTITUDE",
    tab_velocidade: "VELOCIDADE",
    tab_distancia: "DISTÂNCIA",
    tab_aeronave: "AERONAVE",
    tab_voo_principal: "VOO PRINCIPAL",

    // Onboarding (Primeira Abertura)
    onboarding_passo_1_badge: "PASSO 1 DE 2",
    onboarding_instalacao_pwa_badge: "INSTALAÇÃO PWA",
    onboarding_instalar_titulo: "BEM-VINDO AO FLIGHT PANEL",
    onboarding_instalar_subtitulo: "Instala a aplicação no teu ecrã inicial para uma experiência imersiva de ecrã inteiro sem barras do navegador e com áudio de cabine.",
    onboarding_card_ecra_inteiro: "Ecrã Inteiro",
    onboarding_card_sem_barras: "Sem barras",
    onboarding_card_audio: "Áudio Cockpit",
    onboarding_card_jingle: "Jingle Solari",
    onboarding_card_radar: "Radar Direto",
    onboarding_card_tempo_real: "Tempo Real",
    onboarding_instalar_btn: "📲 INSTALAR APLICAÇÃO",
    onboarding_instalar_mais_tarde: "CONTINUAR NO NAVEGADOR",
    onboarding_instalar_dica_ios: "Dica iOS: toca em Partilhar ⎋ e seleciona 'Ecrã Principal'.",
    onboarding_seguinte: "SEGUINTE",
    onboarding_passo_2_badge: "PASSO 2 DE 2",
    onboarding_coordenadas_badge: "COORDENADAS & RADAR",
    onboarding_gps_titulo: "CALIBRAÇÃO DO RADAR",
    onboarding_gps_subtitulo: "O Flight Panel necessita da localização do teu dispositivo para detetar os aviões que estão a passar por cima de ti em tempo real.",
    onboarding_estado_sinal: "ESTADO DO SINAL",
    onboarding_status_conectado: "CONECTADO",
    onboarding_status_sintonizando: "SINTONIZANDO",
    onboarding_status_aguardando: "AGUARDANDO",
    onboarding_instrucao_gps: "Clica no botão abaixo para permitir o acesso à localização do teu dispositivo.",
    onboarding_gps_btn: "📡 ATIVAR LOCALIZAÇÃO GPS",
    onboarding_gps_padrao_btn: "USAR LOCALIZAÇÃO PADRÃO (PORTO, PT)",
    onboarding_obter_ip_btn: "OBTER POR IP DA REDE (PC)",
    onboarding_gps_a_obter: "A sintonizar satélites GPS...",
    onboarding_gps_sucesso: "Sinal GPS fixado com sucesso!",
    onboarding_gps_erro: "Não foi possível obter o sinal GPS.",
    onboarding_concluir: "ENTRAR NO PAINEL ➔",
    onboarding_concluir_btn: "CONCLUIR",
    onboarding_raio_rotulo: "Raio",
  },

  en: {
    // Header & Line 1
    rotulo_voo: "FLIGHT",
    rotulo_callsign: "CALLSIGN",
    rotulo_aeronave: "AIRCRAFT",
    rotulo_radar: "RADAR",
    btn_instalar: "📲 INSTALL",
    btn_opcoes: "Options",
    no_radar: "on radar",

    // Line 2 (Route)
    rotulo_origem: "ORIGIN",
    rotulo_destino: "DESTINATION",
    estado_em_voo: "AIRBORNE",
    estado_no_solo: "ON GROUND",
    estado_carregando: "LOADING",

    // Line 3 (Telemetry)
    rotulo_altitude: "ALTITUDE",
    rotulo_velocidade: "SPEED",
    rotulo_rumo: "HEADING",
    rotulo_distancia: "DISTANCE",
    telemetria_subindo: "CLIMBING",
    telemetria_descendo: "DESCENDING",
    telemetria_nivelado: "LEVEL",

    // Screen 2: Remaining Flights
    ecra2_titulo: "REMAINING FLIGHTS ON RADAR",
    ecra2_subtitulo: "ADDITIONAL AIRCRAFT DETECTED IN AIRSPACE",
    ecra2_sem_outros: "NO OTHER FLIGHTS IN AIRSPACE",
    ecra2_voo_principal_aviso: "CLOSEST FLIGHT DISPLAYED ON MAIN SCREEN",
    ecra2_origem: "ORIGIN",
    ecra2_destino: "DESTINATION",

    // Screen 3 & Fallback: Weather
    meteo_estacao: "LOCATION",
    meteo_estacao_local: "LOCAL WEATHER STATION",
    cabecalho_ecra3: "3RD SCREEN • WEATHER STATION (20 KM)",
    cabecalho_radar: "ACTIVE WEATHER RADAR (20 KM)",
    meteo_condicoes: "WEATHER CONDITIONS",
    meteo_temperatura: "TEMPERATURE",
    meteo_sensacao: "FEELS LIKE",
    meteo_temperatura_sensacao: "TEMPERATURE & FEELS LIKE",
    meteo_min_max: "MIN / MAX",
    meteo_min: "MIN",
    meteo_max: "MAX",
    meteo_precipitacao: "PRECIP",
    meteo_vento: "WIND",
    meteo_humidade: "HUMIDITY",
    meteo_pressao: "QNH PRESSURE",
    meteo_uv: "UV INDEX",
    meteo_nascer_sol: "SUNRISE",
    meteo_por_sol: "SUNSET",
    meteo_sub_altimetro: "ALTIMETER",
    meteo_sub_humidade: "RELATIVE",
    meteo_sub_aurora: "DAWN",
    meteo_sub_crepusculo: "DUSK",
    meteo_sub_uv: "MODERATE",
    meteo_sem_voos_radar: "NO AIRCRAFT IN IMMEDIATE AIRSPACE",
    meteo_aguardando: "AWAITING AIR TRAFFIC",
    meteo_procurando_voos: "SCANNING AIRSPACE FOR FLIGHTS...",
    meteo_voos_detectados: "FLIGHTS DETECTED ON RADAR",

    // Options Modal
    opcoes_titulo: "PANEL OPTIONS",
    opcoes_idioma_titulo: "PANEL LANGUAGE",
    opcoes_idioma_subtitulo: "Instant Switch",
    opcoes_audio_titulo: "AUDIO & SOUND EFFECTS",
    opcoes_audio_subtitulo: "Flaps and Alerts",
    opcoes_audio_ativado: "ENABLED",
    opcoes_audio_desativado: "DISABLED",
    opcoes_volume_titulo: "INDEPENDENT VOLUME",
    opcoes_volume_silenciado: "MUTED",
    opcoes_altitude_titulo: "ALTITUDE",
    opcoes_altitude_subtitulo: "Telemetry",
    opcoes_unidade_pes: "FEET (FT)",
    opcoes_unidade_metros: "METERS (MT)",
    opcoes_velocidade_titulo: "SPEED",
    opcoes_velocidade_subtitulo: "Air",
    opcoes_unidade_nos: "KNOTS (KTS)",
    opcoes_unidade_kmh: "KM/H (KMS)",
    opcoes_distancia_titulo: "DISTANCE",
    opcoes_distancia_subtitulo: "Radar & Flights",
    opcoes_unidade_km: "KILOMETERS (KM)",
    opcoes_unidade_nm: "NAUTICAL MILES (NM)",
    opcoes_unidade_mi: "STATUTE MILES (MI)",
    opcoes_temperatura_titulo: "TEMPERATURE",
    opcoes_temperatura_subtitulo: "Weather",
    opcoes_unidade_celsius: "CELSIUS (°C)",
    opcoes_unidade_fahrenheit: "FAHRENHEIT (°F)",
    opcoes_luminosidade_titulo: "SCREEN BRIGHTNESS",
    opcoes_luminosidade_subtitulo: "Manual & automatic control",
    opcoes_luminosidade_manual: "Brightness Level",
    opcoes_luminosidade_auto: "Auto-Boost on New Flight",
    opcoes_luminosidade_auto_desc: "Increases brightness to 100% for 5 seconds when a new flight is detected.",
    opcoes_luminosidade_testar_btn: "TEST BRIGHTNESS BOOST (5 SECONDS)",
    opcoes_raio_titulo: "RADAR ACTION RADIUS",
    opcoes_raio_subtitulo: "Circular detection range (exact)",
    opcoes_raio_alcance_exato: "Exact radius",
    loc_raio_titulo: "ACTION RADIUS",
    opcoes_localizacao_titulo: "RADAR LOCATION",
    opcoes_localizacao_btn: "CHANGE CITY OR COORDINATES",
    opcoes_navegacao_titulo: "SCREEN NAVIGATION (3 SCREENS)",
    opcoes_ecra_principal: "1. MAIN FLIGHT",
    opcoes_ecra_restantes: "2. REMAINING",
    opcoes_ecra_meteo: "3. WEATHER",
    opcoes_ver_tabela: "VIEW FULL FLIGHT TABLE",
    opcoes_guardar_fechar: "SAVE AND CLOSE",
    opcoes_reabrir_onboarding: "REOPEN INSTALLATION & GPS WIZARD",

    // Location Modal
    loc_titulo: "Radar Location",
    loc_subtitulo: "Sets the center of the circular radius of",
    loc_ponto_activo: "CURRENT ACTIVE POINT",
    loc_cidade: "CITY OR REGION",
    loc_lat: "LATITUDE",
    loc_lon: "LONGITUDE",
    loc_gps_btn: "GET AUTO GPS",
    loc_guardar: "SAVE LOCATION",
    loc_cancelar: "CANCEL",

    // Flights Table (/voos)
    tab_titulo: "DETAILED RADAR FLIGHT TABLE",
    tab_voltar: "BACK TO PANEL",
    tab_voo: "FLIGHT",
    tab_companhia: "AIRLINE",
    tab_origem: "ORIGIN",
    tab_destino: "DESTINATION",
    tab_altitude: "ALTITUDE",
    tab_velocidade: "SPEED",
    tab_distancia: "DISTANCE",
    tab_aeronave: "AIRCRAFT",
    tab_voo_principal: "MAIN FLIGHT",

    // Onboarding (First Launch)
    onboarding_passo_1_badge: "STEP 1 OF 2",
    onboarding_instalacao_pwa_badge: "PWA INSTALLATION",
    onboarding_instalar_titulo: "WELCOME TO FLIGHT PANEL",
    onboarding_instalar_subtitulo: "Install the app on your home screen for an immersive full-screen cockpit experience without browser bars.",
    onboarding_card_ecra_inteiro: "Full Screen",
    onboarding_card_sem_barras: "No bars",
    onboarding_card_audio: "Cockpit Audio",
    onboarding_card_jingle: "Solari Jingle",
    onboarding_card_radar: "Live Radar",
    onboarding_card_tempo_real: "Real Time",
    onboarding_instalar_btn: "📲 INSTALL APP",
    onboarding_instalar_mais_tarde: "CONTINUE IN BROWSER",
    onboarding_instalar_dica_ios: "iOS tip: tap Share ⎋ and select 'Add to Home Screen'.",
    onboarding_seguinte: "NEXT",
    onboarding_passo_2_badge: "STEP 2 OF 2",
    onboarding_coordenadas_badge: "COORDINATES & RADAR",
    onboarding_gps_titulo: "RADAR CALIBRATION",
    onboarding_gps_subtitulo: "Flight Panel needs your device location to detect flights passing right above you in real time.",
    onboarding_estado_sinal: "SIGNAL STATUS",
    onboarding_status_conectado: "CONNECTED",
    onboarding_status_sintonizando: "TUNING",
    onboarding_status_aguardando: "WAITING",
    onboarding_instrucao_gps: "Click the button below to allow access to your device's location.",
    onboarding_gps_btn: "📡 ENABLE GPS LOCATION",
    onboarding_gps_padrao_btn: "USE DEFAULT LOCATION (PORTO, PT)",
    onboarding_obter_ip_btn: "GET VIA NETWORK IP (PC)",
    onboarding_gps_a_obter: "Tuning GPS satellites...",
    onboarding_gps_sucesso: "GPS signal locked successfully!",
    onboarding_gps_erro: "Unable to acquire GPS signal.",
    onboarding_concluir: "ENTER PANEL ➔",
    onboarding_concluir_btn: "FINISH",
    onboarding_raio_rotulo: "Radius",
  },

  fr: {
    // En-tête & Ligne 1
    rotulo_voo: "VOL",
    rotulo_callsign: "INDICATIF",
    rotulo_aeronave: "AÉRONEF",
    rotulo_radar: "RADAR",
    btn_instalar: "📲 INSTALLER",
    btn_opcoes: "Options",
    no_radar: "au radar",

    // Ligne 2 (Route)
    rotulo_origem: "ORIGINE",
    rotulo_destino: "DESTINATION",
    estado_em_voo: "EN VOL",
    estado_no_solo: "AU SOL",
    estado_carregando: "CHARGEMENT",

    // Ligne 3 (Télémétrie)
    rotulo_altitude: "ALTITUDE",
    rotulo_velocidade: "VITESSE",
    rotulo_rumo: "CAP",
    rotulo_distancia: "DISTANCE",
    telemetria_subindo: "MONTÉE",
    telemetria_descendo: "DESCENTE",
    telemetria_nivelado: "PALIER",

    // Écran 2: Reste des vols
    ecra2_titulo: "VOLS RESTANTS AU RADAR",
    ecra2_subtitulo: "AÉRONEFS SUPPLÉMENTAIRES DÉTECTÉS DANS L'ESPACE AÉRIEN",
    ecra2_sem_outros: "AUCUN AUTRE VOL DANS L'ESPACE AÉRIEN",
    ecra2_voo_principal_aviso: "VOL LE PLUS PROCHE AFFICHÉ SUR L'ÉCRAN PRINCIPAL",
    ecra2_origem: "ORIGINE",
    ecra2_destino: "DESTINATION",

    // Écran 3 & Fallback: Météorologie
    meteo_estacao: "LOCALISATION",
    meteo_estacao_local: "STATION MÉTÉO LOCALE",
    cabecalho_ecra3: "3E ÉCRAN • STATION MÉTÉOROLOGIQUE (20 KM)",
    cabecalho_radar: "RADAR MÉTÉOROLOGIQUE ACTIF (20 KM)",
    meteo_condicoes: "CONDITIONS MÉTÉOROLOGIQUES",
    meteo_temperatura: "TEMPÉRATURE",
    meteo_sensacao: "RESSENTI",
    meteo_temperatura_sensacao: "TEMPÉRATURE & RESSENTI",
    meteo_min_max: "MIN / MAX",
    meteo_min: "MIN",
    meteo_max: "MAX",
    meteo_precipitacao: "PRÉCIP",
    meteo_vento: "VENT",
    meteo_humidade: "HUMIDITÉ",
    meteo_pressao: "PRESSION QNH",
    meteo_uv: "INDICE UV",
    meteo_nascer_sol: "LEVER DU SOLEIL",
    meteo_por_sol: "COUCHER DU SOLEIL",
    meteo_sub_altimetro: "ALTIMÈTRE",
    meteo_sub_humidade: "RELATIVE",
    meteo_sub_aurora: "AURORE",
    meteo_sub_crepusculo: "CRÉPUSCULE",
    meteo_sub_uv: "MODÉRÉ",
    meteo_sem_voos_radar: "AUCUN AÉRONEF DANS L'ESPACE AÉRIEN IMMÉDIAT",
    meteo_aguardando: "EN ATTENTE DE TRAFIC AÉRIEN",
    meteo_procurando_voos: "RECHERCHE DE VOLS EN COURS...",
    meteo_voos_detectados: "VOLS DÉTECTÉS AU RADAR",

    // Modal d'Options
    opcoes_titulo: "OPTIONS DU PANNEAU",
    opcoes_idioma_titulo: "LANGUE DU PANNEAU",
    opcoes_idioma_subtitulo: "Changement Instantané",
    opcoes_audio_titulo: "AUDIO ET EFFETS SONORES",
    opcoes_audio_subtitulo: "Volets et Alertes",
    opcoes_audio_ativado: "ACTIVÉ",
    opcoes_audio_desativado: "DÉSACTIVÉ",
    opcoes_volume_titulo: "VOLUME INDÉPENDANT",
    opcoes_volume_silenciado: "EN SOURDINE",
    opcoes_altitude_titulo: "ALTITUDE",
    opcoes_altitude_subtitulo: "Télémétrie",
    opcoes_unidade_pes: "PIEDS (FT)",
    opcoes_unidade_metros: "MÈTRES (MT)",
    opcoes_velocidade_titulo: "VITESSE",
    opcoes_velocidade_subtitulo: "Air",
    opcoes_unidade_nos: "NŒUDS (KTS)",
    opcoes_unidade_kmh: "KM/H (KMS)",
    opcoes_distancia_titulo: "DISTANCE",
    opcoes_distancia_subtitulo: "Radar et Vols",
    opcoes_unidade_km: "KILOMÈTRES (KM)",
    opcoes_unidade_nm: "MILLES NAUTIQUES (NM)",
    opcoes_unidade_mi: "MILLES (MI)",
    opcoes_temperatura_titulo: "TEMPÉRATURE",
    opcoes_temperatura_subtitulo: "Météo",
    opcoes_unidade_celsius: "CELSIUS (°C)",
    opcoes_unidade_fahrenheit: "FAHRENHEIT (°F)",
    opcoes_luminosidade_titulo: "LUMINOSITÉ DE L'ÉCRAN",
    opcoes_luminosidade_subtitulo: "Contrôle manuel et automatique",
    opcoes_luminosidade_manual: "Niveau de Luminosité",
    opcoes_luminosidade_auto: "Augmentation Auto sur Nouveau Vol",
    opcoes_luminosidade_auto_desc: "Augmente la luminosité à 100% pendant 5 secondes lors de la détection d'un nouveau vol.",
    opcoes_luminosidade_testar_btn: "TESTER L'AUGMENTATION DE LUMINOSITÉ (5 SECONDES)",
    opcoes_raio_titulo: "RAYON D'ACTION DU RADAR",
    opcoes_raio_subtitulo: "Portée circulaire de détection (exacte)",
    opcoes_raio_alcance_exato: "Rayon exact",
    loc_raio_titulo: "RAYON D'ACTION",
    opcoes_localizacao_titulo: "POSITION DU RADAR",
    opcoes_localizacao_btn: "CHANGER DE VILLE OU COORDONNÉES",
    opcoes_navegacao_titulo: "NAVIGATION ENTRE ÉCRANS (3 ÉCRANS)",
    opcoes_ecra_principal: "1. VOL PRINCIPAL",
    opcoes_ecra_restantes: "2. RESTANTS",
    opcoes_ecra_meteo: "3. MÉTÉO",
    opcoes_ver_tabela: "VOIR LE TABLEAU COMPLET DES VOLS",
    opcoes_guardar_fechar: "ENREGISTRER ET FERMER",
    opcoes_reabrir_onboarding: "ROUVRIR L'ASSISTANT D'INSTALLATION & GPS",

    // Modal de Localisation
    loc_titulo: "Position du Radar",
    loc_subtitulo: "Définit le centre du rayon circulaire de",
    loc_ponto_activo: "POINT ACTIF ACTUEL",
    loc_cidade: "VILLE OU RÉGION",
    loc_lat: "LATITUDE",
    loc_lon: "LONGITUDE",
    loc_gps_btn: "OBTENIR GPS AUTO",
    loc_guardar: "ENREGISTRER LA POSITION",
    loc_cancelar: "ANNULER",

    // Tableau des Vols (/voos)
    tab_titulo: "TABLEAU DÉTAILLÉ DES VOLS AU RADAR",
    tab_voltar: "RETOUR AU PANNEAU",
    tab_voo: "VOL",
    tab_companhia: "COMPAGNIE",
    tab_origem: "ORIGINE",
    tab_destino: "DESTINATION",
    tab_altitude: "ALTITUDE",
    tab_velocidade: "VITESSE",
    tab_distancia: "DISTANCE",
    tab_aeronave: "AÉRONEF",
    tab_voo_principal: "VOL PRINCIPAL",

    // Onboarding (Première Ouverture)
    onboarding_passo_1_badge: "ÉTAPE 1 SUR 2",
    onboarding_instalacao_pwa_badge: "INSTALLATION PWA",
    onboarding_instalar_titulo: "BIENVENUE SUR FLIGHT PANEL",
    onboarding_instalar_subtitulo: "Installez l'application sur votre écran d'accueil pour une expérience plein écran immersive sans barre de navigation.",
    onboarding_card_ecra_inteiro: "Plein Écran",
    onboarding_card_sem_barras: "Sans barres",
    onboarding_card_audio: "Audio Cockpit",
    onboarding_card_jingle: "Jingle Solari",
    onboarding_card_radar: "Radar Direct",
    onboarding_card_tempo_real: "Temps Réel",
    onboarding_instalar_btn: "📲 INSTALLER L'APPLICATION",
    onboarding_instalar_mais_tarde: "CONTINUER SUR LE NAVIGATEUR",
    onboarding_instalar_dica_ios: "Astuce iOS: touchez Partager ⎋ et sélectionnez 'Sur l'écran d'accueil'.",
    onboarding_seguinte: "SUIVANT",
    onboarding_passo_2_badge: "ÉTAPE 2 SUR 2",
    onboarding_coordenadas_badge: "COORDONNÉES & RADAR",
    onboarding_gps_titulo: "CALIBRAGE DU RADAR",
    onboarding_gps_subtitulo: "Flight Panel a besoin de la position de votre appareil pour détecter les vols au-dessus de vous en temps réel.",
    onboarding_estado_sinal: "ÉTAT DU SIGNAL",
    onboarding_status_conectado: "CONNECTÉ",
    onboarding_status_sintonizando: "SYNTONISATION",
    onboarding_status_aguardando: "EN ATTENTE",
    onboarding_instrucao_gps: "Cliquez sur le bouton ci-dessous pour autoriser l'accès à la localisation de votre appareil.",
    onboarding_gps_btn: "📡 ACTIVER LA POSITION GPS",
    onboarding_gps_padrao_btn: "UTILISER LA POSITION PAR DÉFAUT (PORTO, PT)",
    onboarding_obter_ip_btn: "OBTENIR PAR IP RÉSEAU (PC)",
    onboarding_gps_a_obter: "Recherche des satellites GPS...",
    onboarding_gps_sucesso: "Signal GPS verrouillé avec succès!",
    onboarding_gps_erro: "Impossible d'acquérir le signal GPS.",
    onboarding_concluir: "OUVRIR LE PANNEAU ➔",
    onboarding_concluir_btn: "TERMINER",
    onboarding_raio_rotulo: "Rayon",
  },

  es: {
    // Encabezado & Línea 1
    rotulo_voo: "VUELO",
    rotulo_callsign: "INDICATIVO",
    rotulo_aeronave: "AERONAVE",
    rotulo_radar: "RADAR",
    btn_instalar: "📲 INSTALAR",
    btn_opcoes: "Opciones",
    no_radar: "en radar",

    // Línea 2 (Ruta)
    rotulo_origem: "ORIGEN",
    rotulo_destino: "DESTINO",
    estado_em_voo: "EN VUELO",
    estado_no_solo: "EN TIERRA",
    estado_carregando: "CARGANDO",

    // Línea 3 (Telemetría)
    rotulo_altitude: "ALTITUD",
    rotulo_velocidade: "VELOCIDAD",
    rotulo_rumo: "RUMBO",
    rotulo_distancia: "DISTANCIA",
    telemetria_subindo: "ASCENSO",
    telemetria_descendo: "DESCENSO",
    telemetria_nivelado: "NIVELADO",

    // Pantalla 2: Vuelos restantes
    ecra2_titulo: "VUELOS RESTANTES EN RADAR",
    ecra2_subtitulo: "AERONAVES ADICIONALES DETECTADAS EN EL ESPACIO AÉREO",
    ecra2_sem_outros: "NO HAY OTROS VUELOS EN EL ESPACIO AÉREO",
    ecra2_voo_principal_aviso: "VUELO MÁS CERCANO MOSTRADO EN LA PANTALLA PRINCIPAL",
    ecra2_origem: "ORIGEN",
    ecra2_destino: "DESTINO",

    // Pantalla 3 & Fallback: Meteorología
    meteo_estacao: "LOCALIZACIÓN",
    meteo_estacao_local: "ESTACIÓN METEOROLÓGICA LOCAL",
    cabecalho_ecra3: "3.ª PANTALLA • ESTACIÓN METEOROLÓGICA (20 KM)",
    cabecalho_radar: "RADAR METEOROLÓGICO ACTIVO (20 KM)",
    meteo_condicoes: "CONDICIONES METEOROLÓGICAS",
    meteo_temperatura: "TEMPERATURA",
    meteo_sensacao: "SENSACIÓN",
    meteo_temperatura_sensacao: "TEMPERATURA Y SENSACIÓN",
    meteo_min_max: "MÍN / MÁX",
    meteo_min: "MÍN",
    meteo_max: "MÁX",
    meteo_precipitacao: "PRECIP",
    meteo_vento: "VIENTO",
    meteo_humidade: "HUMEDAD",
    meteo_pressao: "PRESIÓN QNH",
    meteo_uv: "ÍNDICE UV",
    meteo_nascer_sol: "AMANECER",
    meteo_por_sol: "ATARDECER",
    meteo_sub_altimetro: "ALTÍMETRO",
    meteo_sub_humidade: "RELATIVA",
    meteo_sub_aurora: "AMANECER",
    meteo_sub_crepusculo: "ATARDECER",
    meteo_sub_uv: "MODERADO",
    meteo_sem_voos_radar: "SIN AERONAVES EN EL ESPACIO AÉREO INMEDIATO",
    meteo_aguardando: "EN ESPERA DE TRÁFICO AÉREO",
    meteo_procurando_voos: "BUSCANDO VUELOS EN EL ESPACIO AÉREO...",
    meteo_voos_detectados: "VUELOS DETECTADOS EN EL RADAR",

    // Modal de Opciones
    opcoes_titulo: "OPCIONES DEL PANEL",
    opcoes_idioma_titulo: "IDIOMA DEL PANEL",
    opcoes_idioma_subtitulo: "Cambio Instantáneo",
    opcoes_audio_titulo: "AUDIO Y EFECTOS DE SONIDO",
    opcoes_audio_subtitulo: "Paletas y Alertas",
    opcoes_audio_ativado: "ACTIVADO",
    opcoes_audio_desativado: "DESACTIVADO",
    opcoes_volume_titulo: "VOLUMEN INDEPENDIENTE",
    opcoes_volume_silenciado: "SILENCIADO",
    opcoes_altitude_titulo: "ALTITUD",
    opcoes_altitude_subtitulo: "Telemetría",
    opcoes_unidade_pes: "PIES (FT)",
    opcoes_unidade_metros: "METROS (MT)",
    opcoes_velocidade_titulo: "VELOCIDAD",
    opcoes_velocidade_subtitulo: "Aire",
    opcoes_unidade_nos: "NUDOS (KTS)",
    opcoes_unidade_kmh: "KM/H (KMS)",
    opcoes_distancia_titulo: "DISTANCIA",
    opcoes_distancia_subtitulo: "Radar y Vuelos",
    opcoes_unidade_km: "KILÓMETROS (KM)",
    opcoes_unidade_nm: "MILLAS NÁUTICAS (NM)",
    opcoes_unidade_mi: "MILLAS (MI)",
    opcoes_temperatura_titulo: "TEMPERATURA",
    opcoes_temperatura_subtitulo: "Meteorología",
    opcoes_unidade_celsius: "CELSIUS (°C)",
    opcoes_unidade_fahrenheit: "FAHRENHEIT (°F)",
    opcoes_luminosidade_titulo: "BRILLO DE LA PANTALLA",
    opcoes_luminosidade_subtitulo: "Control manual y automático",
    opcoes_luminosidade_manual: "Nivel de Brillo",
    opcoes_luminosidade_auto: "Aumento Automático en Nuevo Vuelo",
    opcoes_luminosidade_auto_desc: "Aumenta el brillo al 100% durante 5 segundos al detectar un nuevo vuelo.",
    opcoes_luminosidade_testar_btn: "PROBAR AUMENTO DE BRILLO (5 SEGUNDOS)",
    opcoes_raio_titulo: "RADIO DE ACCIÓN DEL RADAR",
    opcoes_raio_subtitulo: "Alcance circular de detección (exacto)",
    opcoes_raio_alcance_exato: "Radio exacto",
    loc_raio_titulo: "RADIO DE ACCIÓN",
    opcoes_localizacao_titulo: "UBICACIÓN DEL RADAR",
    opcoes_localizacao_btn: "CAMBIAR CIUDAD O COORDENADAS",
    opcoes_navegacao_titulo: "NAVEGACIÓN ENTRE PANTALLAS (3 PANTALLAS)",
    opcoes_ecra_principal: "1. VUELO PRINCIPAL",
    opcoes_ecra_restantes: "2. RESTANTES",
    opcoes_ecra_meteo: "3. METEOROLOGÍA",
    opcoes_ver_tabela: "VER TABLA COMPLETA DE VUELOS",
    opcoes_guardar_fechar: "GUARDAR Y CERRAR",
    opcoes_reabrir_onboarding: "REABRIR ASISTENTE DE INSTALACIÓN Y GPS",

    // Modal de Ubicación
    loc_titulo: "Ubicación del Radar",
    loc_subtitulo: "Define el centro del radio circular de",
    loc_ponto_activo: "PUNTO ACTUAL ACTIVO",
    loc_cidade: "CIUDAD O REGIÓN",
    loc_lat: "LATITUD",
    loc_lon: "LONGITUD",
    loc_gps_btn: "OBTENER GPS AUTO",
    loc_guardar: "GUARDAR UBICACIÓN",
    loc_cancelar: "CANCELAR",

    // Tabla de Vuelos (/voos)
    tab_titulo: "TABLA DETALLADA DE VUELOS EN RADAR",
    tab_voltar: "VOLVER AL PANEL",
    tab_voo: "VUELO",
    tab_companhia: "AEROLÍNEA",
    tab_origem: "ORIGEN",
    tab_destino: "DESTINO",
    tab_altitude: "ALTITUD",
    tab_velocidade: "VELOCIDAD",
    tab_distancia: "DISTANCIA",
    tab_aeronave: "AERONAVE",
    tab_voo_principal: "VUELO PRINCIPAL",

    // Onboarding (Primera Apertura)
    onboarding_passo_1_badge: "PASO 1 DE 2",
    onboarding_instalacao_pwa_badge: "INSTALACIÓN PWA",
    onboarding_instalar_titulo: "BIENVENIDO A FLIGHT PANEL",
    onboarding_instalar_subtitulo: "Instala la aplicación en tu pantalla de inicio para una experiencia inmersiva a pantalla completa sin barras del navegador.",
    onboarding_card_ecra_inteiro: "Pantalla Completa",
    onboarding_card_sem_barras: "Sin barras",
    onboarding_card_audio: "Audio Cockpit",
    onboarding_card_jingle: "Jingle Solari",
    onboarding_card_radar: "Radar en Vivo",
    onboarding_card_tempo_real: "Tiempo Real",
    onboarding_instalar_btn: "📲 INSTALAR APLICACIÓN",
    onboarding_instalar_mais_tarde: "CONTINUAR EN EL NAVEGADOR",
    onboarding_instalar_dica_ios: "Consejo iOS: pulsa Compartir ⎋ y selecciona 'Añadir a pantalla de inicio'.",
    onboarding_seguinte: "SIGUIENTE",
    onboarding_passo_2_badge: "PASO 2 DE 2",
    onboarding_coordenadas_badge: "COORDENADAS Y RADAR",
    onboarding_gps_titulo: "CALIBRACIÓN DEL RADAR",
    onboarding_gps_subtitulo: "Flight Panel necesita la ubicación de tu dispositivo para detectar los vuelos sobre ti en tiempo real.",
    onboarding_estado_sinal: "ESTADO DE LA SEÑAL",
    onboarding_status_conectado: "CONECTADO",
    onboarding_status_sintonizando: "SINTONIZANDO",
    onboarding_status_aguardando: "ESPERANDO",
    onboarding_instrucao_gps: "Haz clic en el botón de abajo para permitir el acceso a la ubicación de tu dispositivo.",
    onboarding_gps_btn: "📡 ACTIVAR UBICACIÓN GPS",
    onboarding_gps_padrao_btn: "USAR UBICACIÓN PREDETERMINADA (PORTO, PT)",
    onboarding_obter_ip_btn: "OBTENER POR IP DE RED (PC)",
    onboarding_gps_a_obter: "Sintonizando satélites GPS...",
    onboarding_gps_sucesso: "¡Señal GPS fijada con éxito!",
    onboarding_gps_erro: "No fue posible obtener la señal GPS.",
    onboarding_concluir: "ENTRAR AL PANEL ➔",
    onboarding_concluir_btn: "FINALIZAR",
    onboarding_raio_rotulo: "Radio",
  },
};

// ─── Dicionário Multilíngue de Países ──────────────────────────────────────────

const PAISES_TRADUCOES: Record<string, Record<Idioma, string>> = {
  PORTUGAL: { pt: "PORTUGAL", en: "PORTUGAL", fr: "PORTUGAL", es: "PORTUGAL" },
  PT: { pt: "PORTUGAL", en: "PORTUGAL", fr: "PORTUGAL", es: "PORTUGAL" },
  SPAIN: { pt: "ESPANHA", en: "SPAIN", fr: "ESPAGNE", es: "ESPAÑA" },
  ESPANHA: { pt: "ESPANHA", en: "SPAIN", fr: "ESPAGNE", es: "ESPAÑA" },
  ESPAÑA: { pt: "ESPANHA", en: "SPAIN", fr: "ESPAGNE", es: "ESPAÑA" },
  ES: { pt: "ESPANHA", en: "SPAIN", fr: "ESPAGNE", es: "ESPAÑA" },
  FRANCE: { pt: "FRANÇA", en: "FRANCE", fr: "FRANCE", es: "FRANCIA" },
  FRANÇA: { pt: "FRANÇA", en: "FRANCE", fr: "FRANCE", es: "FRANCIA" },
  FRANCIA: { pt: "FRANÇA", en: "FRANCE", fr: "FRANCE", es: "FRANCIA" },
  FR: { pt: "FRANÇA", en: "FRANCE", fr: "FRANCE", es: "FRANCIA" },
  "UNITED KINGDOM": { pt: "REINO UNIDO", en: "UNITED KINGDOM", fr: "ROYAUME-UNI", es: "REINO UNIDO" },
  "REINO UNIDO": { pt: "REINO UNIDO", en: "UNITED KINGDOM", fr: "ROYAUME-UNI", es: "REINO UNIDO" },
  "ROYAUME-UNI": { pt: "REINO UNIDO", en: "UNITED KINGDOM", fr: "ROYAUME-UNI", es: "REINO UNIDO" },
  GB: { pt: "REINO UNIDO", en: "UNITED KINGDOM", fr: "ROYAUME-UNI", es: "REINO UNIDO" },
  UK: { pt: "REINO UNIDO", en: "UNITED KINGDOM", fr: "ROYAUME-UNI", es: "REINO UNIDO" },
  GERMANY: { pt: "ALEMANHA", en: "GERMANY", fr: "ALLEMAGNE", es: "ALEMANIA" },
  ALEMANHA: { pt: "ALEMANHA", en: "GERMANY", fr: "ALLEMAGNE", es: "ALEMANIA" },
  ALEMANIA: { pt: "ALEMANHA", en: "GERMANY", fr: "ALLEMAGNE", es: "ALEMANIA" },
  DE: { pt: "ALEMANHA", en: "GERMANY", fr: "ALLEMAGNE", es: "ALEMANIA" },
  SWITZERLAND: { pt: "SUÍÇA", en: "SWITZERLAND", fr: "SUISSE", es: "SUIZA" },
  SUÍÇA: { pt: "SUÍÇA", en: "SWITZERLAND", fr: "SUISSE", es: "SUIZA" },
  SUIZA: { pt: "SUÍÇA", en: "SWITZERLAND", fr: "SUISSE", es: "SUIZA" },
  SUISSE: { pt: "SUÍÇA", en: "SWITZERLAND", fr: "SUISSE", es: "SUIZA" },
  CH: { pt: "SUÍÇA", en: "SWITZERLAND", fr: "SUISSE", es: "SUIZA" },
  NETHERLANDS: { pt: "PAÍSES BAIXOS", en: "NETHERLANDS", fr: "PAYS-BAS", es: "PAÍSES BAJOS" },
  "PAÍSES BAIXOS": { pt: "PAÍSES BAIXOS", en: "NETHERLANDS", fr: "PAYS-BAS", es: "PAÍSES BAJOS" },
  "PAÍSES BAJOS": { pt: "PAÍSES BAIXOS", en: "NETHERLANDS", fr: "PAYS-BAS", es: "PAÍSES BAJOS" },
  "PAYS-BAS": { pt: "PAÍSES BAIXOS", en: "NETHERLANDS", fr: "PAYS-BAS", es: "PAÍSES BAJOS" },
  NL: { pt: "PAÍSES BAIXOS", en: "NETHERLANDS", fr: "PAYS-BAS", es: "PAÍSES BAJOS" },
  ITALY: { pt: "ITÁLIA", en: "ITALY", fr: "ITALIE", es: "ITALIA" },
  ITÁLIA: { pt: "ITÁLIA", en: "ITALY", fr: "ITALIE", es: "ITALIA" },
  ITALIA: { pt: "ITÁLIA", en: "ITALY", fr: "ITALIE", es: "ITALIA" },
  IT: { pt: "ITÁLIA", en: "ITALY", fr: "ITALIE", es: "ITALIA" },
  BELGIUM: { pt: "BÉLGICA", en: "BELGIUM", fr: "BELGIQUE", es: "BÉLGICA" },
  BÉLGICA: { pt: "BÉLGICA", en: "BELGIUM", fr: "BELGIQUE", es: "BÉLGICA" },
  BELGIQUE: { pt: "BÉLGICA", en: "BELGIUM", fr: "BELGIQUE", es: "BÉLGICA" },
  BE: { pt: "BÉLGICA", en: "BELGIUM", fr: "BELGIQUE", es: "BÉLGICA" },
  IRELAND: { pt: "IRLANDA", en: "IRELAND", fr: "IRLANDE", es: "IRLANDA" },
  IRLANDA: { pt: "IRLANDA", en: "IRELAND", fr: "IRLANDE", es: "IRLANDA" },
  IRLANDE: { pt: "IRLANDA", en: "IRELAND", fr: "IRLANDE", es: "IRLANDA" },
  IE: { pt: "IRLANDA", en: "IRELAND", fr: "IRLANDE", es: "IRLANDA" },
  AUSTRIA: { pt: "ÁUSTRIA", en: "AUSTRIA", fr: "AUTRICHE", es: "AUSTRIA" },
  ÁUSTRIA: { pt: "ÁUSTRIA", en: "AUSTRIA", fr: "AUTRICHE", es: "AUSTRIA" },
  AUTRICHE: { pt: "ÁUSTRIA", en: "AUSTRIA", fr: "AUTRICHE", es: "AUSTRIA" },
  AT: { pt: "ÁUSTRIA", en: "AUSTRIA", fr: "AUTRICHE", es: "AUSTRIA" },
  POLAND: { pt: "POLÓNIA", en: "POLAND", fr: "POLOGNE", es: "POLONIA" },
  POLÓNIA: { pt: "POLÓNIA", en: "POLAND", fr: "POLOGNE", es: "POLONIA" },
  POLONIA: { pt: "POLÓNIA", en: "POLAND", fr: "POLOGNE", es: "POLONIA" },
  POLOGNE: { pt: "POLÓNIA", en: "POLAND", fr: "POLOGNE", es: "POLONIA" },
  PL: { pt: "POLÓNIA", en: "POLAND", fr: "POLOGNE", es: "POLONIA" },
  LUXEMBOURG: { pt: "LUXEMBURGO", en: "LUXEMBOURG", fr: "LUXEMBOURG", es: "LUXEMBURGO" },
  LUXEMBURGO: { pt: "LUXEMBURGO", en: "LUXEMBOURG", fr: "LUXEMBOURG", es: "LUXEMBURGO" },
  LU: { pt: "LUXEMBURGO", en: "LUXEMBOURG", fr: "LUXEMBOURG", es: "LUXEMBURGO" },
  NORWAY: { pt: "NORUEGA", en: "NORWAY", fr: "NORVÈGE", es: "NORUEGA" },
  NORUEGA: { pt: "NORUEGA", en: "NORWAY", fr: "NORVÈGE", es: "NORUEGA" },
  NO: { pt: "NORUEGA", en: "NORWAY", fr: "NORVÈGE", es: "NORUEGA" },
  SWEDEN: { pt: "SUÉCIA", en: "SWEDEN", fr: "SUÈDE", es: "SUECIA" },
  SUÉCIA: { pt: "SUÉCIA", en: "SWEDEN", fr: "SUÈDE", es: "SUECIA" },
  SUECIA: { pt: "SUÉCIA", en: "SWEDEN", fr: "SUÈDE", es: "SUECIA" },
  SE: { pt: "SUÉCIA", en: "SWEDEN", fr: "SUÈDE", es: "SUECIA" },
  DENMARK: { pt: "DINAMARCA", en: "DENMARK", fr: "DANEMARK", es: "DINAMARCA" },
  DINAMARCA: { pt: "DINAMARCA", en: "DENMARK", fr: "DANEMARK", es: "DINAMARCA" },
  DK: { pt: "DINAMARCA", en: "DENMARK", fr: "DANEMARK", es: "DINAMARCA" },
  TURKEY: { pt: "TURQUIA", en: "TURKEY", fr: "TURQUIE", es: "TURQUÍA" },
  TURQUIA: { pt: "TURQUIA", en: "TURKEY", fr: "TURQUIE", es: "TURQUÍA" },
  TURQUÍA: { pt: "TURQUIA", en: "TURKEY", fr: "TURQUIE", es: "TURQUÍA" },
  TR: { pt: "TURQUIA", en: "TURKEY", fr: "TURQUIE", es: "TURQUÍA" },
  "UNITED ARAB EMIRATES": { pt: "EMIRADOS ÁRABES UNIDOS", en: "UNITED ARAB EMIRATES", fr: "ÉMIRATS ARABES UNIS", es: "EMIRATOS ÁRABES UNIDOS" },
  "EMIRADOS ÁRABES UNIDOS": { pt: "EMIRADOS ÁRABES UNIDOS", en: "UNITED ARAB EMIRATES", fr: "ÉMIRATS ARABES UNIS", es: "EMIRATOS ÁRABES UNIDOS" },
  AE: { pt: "EMIRADOS ÁRABES UNIDOS", en: "UNITED ARAB EMIRATES", fr: "ÉMIRATS ARABES UNIS", es: "EMIRATOS ÁRABES UNIDOS" },
  "UNITED STATES": { pt: "ESTADOS UNIDOS", en: "UNITED STATES", fr: "ÉTATS-UNIS", es: "ESTADOS UNIDOS" },
  "ESTADOS UNIDOS": { pt: "ESTADOS UNIDOS", en: "UNITED STATES", fr: "ÉTATS-UNIS", es: "ESTADOS UNIDOS" },
  US: { pt: "ESTADOS UNIDOS", en: "UNITED STATES", fr: "ÉTATS-UNIS", es: "ESTADOS UNIDOS" },
  USA: { pt: "ESTADOS UNIDOS", en: "UNITED STATES", fr: "ÉTATS-UNIS", es: "ESTADOS UNIDOS" },
  BRAZIL: { pt: "BRASIL", en: "BRAZIL", fr: "BRÉSIL", es: "BRASIL" },
  BRASIL: { pt: "BRASIL", en: "BRAZIL", fr: "BRÉSIL", es: "BRASIL" },
  BR: { pt: "BRASIL", en: "BRAZIL", fr: "BRÉSIL", es: "BRASIL" },
  CANADA: { pt: "CANADÁ", en: "CANADA", fr: "CANADA", es: "CANADÁ" },
  CANADÁ: { pt: "CANADÁ", en: "CANADA", fr: "CANADA", es: "CANADÁ" },
  CA: { pt: "CANADÁ", en: "CANADA", fr: "CANADA", es: "CANADÁ" },
  MOROCCO: { pt: "MARROCOS", en: "MOROCCO", fr: "MAROC", es: "MARRUECOS" },
  MARROCOS: { pt: "MARROCOS", en: "MOROCCO", fr: "MAROC", es: "MARRUECOS" },
  MA: { pt: "MARROCOS", en: "MOROCCO", fr: "MAROC", es: "MARRUECOS" },
  CAPE_VERDE: { pt: "CABO VERDE", en: "CAPE VERDE", fr: "CAP-VERT", es: "CABO VERDE" },
  "CAPE VERDE": { pt: "CABO VERDE", en: "CAPE VERDE", fr: "CAP-VERT", es: "CABO VERDE" },
  "CABO VERDE": { pt: "CABO VERDE", en: "CAPE VERDE", fr: "CAP-VERT", es: "CABO VERDE" },
  CV: { pt: "CABO VERDE", en: "CAPE VERDE", fr: "CAP-VERT", es: "CABO VERDE" },
  ANGOLA: { pt: "ANGOLA", en: "ANGOLA", fr: "ANGOLA", es: "ANGOLA" },
  AO: { pt: "ANGOLA", en: "ANGOLA", fr: "ANGOLA", es: "ANGOLA" },
  MOZAMBIQUE: { pt: "MOÇAMBIQUE", en: "MOZAMBIQUE", fr: "MOZAMBIQUE", es: "MOZAMBIQUE" },
  MOÇAMBIQUE: { pt: "MOÇAMBIQUE", en: "MOZAMBIQUE", fr: "MOZAMBIQUE", es: "MOZAMBIQUE" },
  MZ: { pt: "MOÇAMBIQUE", en: "MOZAMBIQUE", fr: "MOZAMBIQUE", es: "MOZAMBIQUE" },
  GREECE: { pt: "GRÉCIA", en: "GREECE", fr: "GRÈCE", es: "GRECIA" },
  GRÉCIA: { pt: "GRÉCIA", en: "GREECE", fr: "GRÈCE", es: "GRECIA" },
  GR: { pt: "GRÉCIA", en: "GREECE", fr: "GRÈCE", es: "GRECIA" },
  FINLAND: { pt: "FINLÂNDIA", en: "FINLAND", fr: "FINLANDE", es: "FINLANDIA" },
  FINLÂNDIA: { pt: "FINLÂNDIA", en: "FINLAND", fr: "FINLANDE", es: "FINLANDIA" },
  FI: { pt: "FINLÂNDIA", en: "FINLAND", fr: "FINLANDE", es: "FINLANDIA" },
  CZECH_REPUBLIC: { pt: "CHÉQUIA", en: "CZECH REPUBLIC", fr: "TCHÉQUIE", es: "REPÚBLICA CHECA" },
  "CZECH REPUBLIC": { pt: "CHÉQUIA", en: "CZECH REPUBLIC", fr: "TCHÉQUIE", es: "REPÚBLICA CHECA" },
  CHÉQUIA: { pt: "CHÉQUIA", en: "CZECH REPUBLIC", fr: "TCHÉQUIE", es: "REPÚBLICA CHECA" },
  CZ: { pt: "CHÉQUIA", en: "CZECH REPUBLIC", fr: "TCHÉQUIE", es: "REPÚBLICA CHECA" },
  HUNGARY: { pt: "HUNGRIA", en: "HUNGARY", fr: "HONGRIE", es: "HUNGRÍA" },
  HUNGRIA: { pt: "HUNGRIA", en: "HUNGARY", fr: "HONGRIE", es: "HUNGRÍA" },
  HU: { pt: "HUNGRIA", en: "HUNGARY", fr: "HONGRIE", es: "HUNGRÍA" },
  ROMANIA: { pt: "ROMÉNIA", en: "ROMANIA", fr: "ROUMANIE", es: "RUMANÍA" },
  ROMÉNIA: { pt: "ROMÉNIA", en: "ROMANIA", fr: "ROUMANIE", es: "RUMANÍA" },
  RO: { pt: "ROMÉNIA", en: "ROMANIA", fr: "ROUMANIE", es: "RUMANÍA" },
};

export function traduzirPais(pais: string | null | undefined, idioma: Idioma): string {
  if (!pais) return "";
  const limpo = pais.trim().toUpperCase();
  if (PAISES_TRADUCOES[limpo] && PAISES_TRADUCOES[limpo][idioma]) {
    return PAISES_TRADUCOES[limpo][idioma];
  }
  return pais;
}

export function obterTexto(idioma: Idioma, chave: keyof DicionarioTraducoes): string {
  const dict = TRADUCOES[idioma] || TRADUCOES.pt;
  return dict[chave] || TRADUCOES.pt[chave] || "";
}

// ─── Tabela de Meses Abreviados por Idioma ────────────────────────────────────

const MESES_POR_IDIOMA: Record<Idioma, string[]> = {
  pt: ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"],
  en: ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"],
  fr: ["JAN", "FÉV", "MAR", "AVR", "MAI", "JUIN", "JUIL", "AOÛ", "SEP", "OCT", "NOV", "DÉC"],
  es: ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"],
};

export function obterMesAbreviado(mesIndex: number, idioma: Idioma): string {
  const lista = MESES_POR_IDIOMA[idioma] || MESES_POR_IDIOMA.pt;
  return lista[mesIndex] || "JAN";
}

// ─── Tradução Automática de Condições Meteorológicas ──────────────────────────

const CONDICOES_METEO: Record<string, Record<Idioma, string>> = {
  "CEU LIMPO": { pt: "CÉU LIMPO", en: "CLEAR SKY", fr: "CIEL DÉGAGÉ", es: "CIELO DESPEJADO" },
  "CLEAR SKY": { pt: "CÉU LIMPO", en: "CLEAR SKY", fr: "CIEL DÉGAGÉ", es: "CIELO DESPEJADO" },
  "BOM TEMPO": { pt: "BOM TEMPO", en: "MAINLY CLEAR", fr: "BEAU TEMPS", es: "BUEN TIEMPO" },
  "MAINLY CLEAR": { pt: "BOM TEMPO", en: "MAINLY CLEAR", fr: "BEAU TEMPS", es: "BUEN TIEMPO" },
  "POUCO NUBLADO": { pt: "POUCO NUBLADO", en: "PARTLY CLOUDY", fr: "PEU NUAGEUX", es: "PARCIALMENTE NUBLADO" },
  "PARTLY CLOUDY": { pt: "POUCO NUBLADO", en: "PARTLY CLOUDY", fr: "PEU NUAGEUX", es: "PARCIALMENTE NUBLADO" },
  "FEW CLOUDS": { pt: "POUCO NUBLADO", en: "FEW CLOUDS", fr: "PEU NUAGEUX", es: "POCAS NUBES" },
  "SCATTERED CLOUDS": { pt: "POUCO NUBLADO", en: "SCATTERED CLOUDS", fr: "NUAGES ÉPARS", es: "NUBES DISPERSAS" },
  "NUBLADO": { pt: "NUBLADO", en: "CLOUDY", fr: "NUAGEUX", es: "NUBLADO" },
  "CLOUDY": { pt: "NUBLADO", en: "CLOUDY", fr: "NUAGEUX", es: "NUBLADO" },
  "BROKEN CLOUDS": { pt: "NUBLADO", en: "BROKEN CLOUDS", fr: "NUAGES FRAGMENTÉS", es: "NUBLADO" },
  "ENCOBERTO": { pt: "ENCOBERTO", en: "OVERCAST", fr: "COUVERT", es: "CUBIERTO" },
  "OVERCAST": { pt: "ENCOBERTO", en: "OVERCAST", fr: "COUVERT", es: "CUBIERTO" },
  "OVERCAST CLOUDS": { pt: "ENCOBERTO", en: "OVERCAST", fr: "COUVERT", es: "CUBIERTO" },
  "NEVOEIRO": { pt: "NEVOEIRO", en: "FOG", fr: "BROUILLARD", es: "NIEBLA" },
  "FOG": { pt: "NEVOEIRO", en: "FOG", fr: "BROUILLARD", es: "NIEBLA" },
  "MIST": { pt: "NEVOEIRO", en: "MIST", fr: "BRUME", es: "NEBLINA" },
  "CHUVISCOS": { pt: "CHUVISCOS", en: "DRIZZLE", fr: "BRUINE", es: "LLOVIZNA" },
  "DRIZZLE": { pt: "CHUVISCOS", en: "DRIZZLE", fr: "BRUINE", es: "LLOVIZNA" },
  "CHUVA FRACA": { pt: "CHUVA FRACA", en: "LIGHT RAIN", fr: "PLUIE FAIBLE", es: "LLUVIA DÉBIL" },
  "LIGHT RAIN": { pt: "CHUVA FRACA", en: "LIGHT RAIN", fr: "PLUIE FAIBLE", es: "LLUVIA DÉBIL" },
  "CHUVA MODERADA": { pt: "CHUVA MODERADA", en: "MODERATE RAIN", fr: "PLUIE MODÉRÉE", es: "LLUVIA MODERADA" },
  "MODERATE RAIN": { pt: "CHUVA MODERADA", en: "MODERATE RAIN", fr: "PLUIE MODÉRÉE", es: "LLUVIA MODERADA" },
  "CHUVA FORTE": { pt: "CHUVA FORTE", en: "HEAVY RAIN", fr: "PLUIE FORTE", es: "LLUVIA FUERTE" },
  "HEAVY RAIN": { pt: "CHUVA FORTE", en: "HEAVY RAIN", fr: "PLUIE FORTE", es: "LLUVIA FUERTE" },
  "CHUVA": { pt: "CHUVA", en: "RAIN", fr: "PLUIE", es: "LLUVIA" },
  "RAIN": { pt: "CHUVA", en: "RAIN", fr: "PLUIE", es: "LLUVIA" },
  "NEVE": { pt: "NEVE", en: "SNOW", fr: "NEIGE", es: "NIEVE" },
  "SNOW": { pt: "NEVE", en: "SNOW", fr: "NEIGE", es: "NIEVE" },
  "AGUACEIROS": { pt: "AGUACEIROS", en: "SHOWERS", fr: "AVERSES", es: "CHUBASCOS" },
  "SHOWERS": { pt: "AGUACEIROS", en: "SHOWERS", fr: "AVERSES", es: "CHUBASCOS" },
  "TROVOADA": { pt: "TROVOADA", en: "THUNDERSTORM", fr: "ORAGE", es: "TORMENTA" },
  "THUNDERSTORM": { pt: "TROVOADA", en: "THUNDERSTORM", fr: "ORAGE", es: "TORMENTA" },
  "ESTAVEL": { pt: "ESTÁVEL", en: "FAIR", fr: "STABLE", es: "ESTABLE" },
};

export function traduzirCondicaoMeteo(condicao: string | null | undefined, idioma: Idioma): string {
  if (!condicao) return CONDICOES_METEO["CEU LIMPO"][idioma] || "CEU LIMPO";
  const limpo = condicao.trim().toUpperCase();
  if (CONDICOES_METEO[limpo] && CONDICOES_METEO[limpo][idioma]) {
    return CONDICOES_METEO[limpo][idioma];
  }
  return condicao.toUpperCase();
}

