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
  meteo_condicoes: string;
  meteo_temperatura: string;
  meteo_sensacao: string;
  meteo_min_max: string;
  meteo_vento: string;
  meteo_humidade: string;
  meteo_pressao: string;
  meteo_uv: string;
  meteo_nascer_sol: string;
  meteo_por_sol: string;
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
  opcoes_localizacao_titulo: string;
  opcoes_localizacao_btn: string;
  opcoes_navegacao_titulo: string;
  opcoes_ecra_principal: string;
  opcoes_ecra_restantes: string;
  opcoes_ecra_meteo: string;
  opcoes_ver_tabela: string;
  opcoes_guardar_fechar: string;

  // Modal de Localização
  loc_titulo: string;
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
}

export const TRADUCOES: Record<Idioma, DicionarioTraducoes> = {
  pt: {
    // Cabeçalho & Linha 1
    rotulo_voo: "VOO / FLIGHT",
    rotulo_callsign: "CALLSIGN",
    rotulo_aeronave: "AIRCRAFT",
    rotulo_radar: "RADAR",
    btn_instalar: "📲 INSTALAR",
    btn_opcoes: "Opções",
    no_radar: "no radar",

    // Linha 2 (Rota)
    rotulo_origem: "ORIGEM / DEPARTURE",
    rotulo_destino: "DESTINO / DESTINATION",
    estado_em_voo: "EM VOO",
    estado_no_solo: "NO SOLO",

    // Linha 3 (Telemetria)
    rotulo_altitude: "ALTITUDE",
    rotulo_velocidade: "VELOCIDADE",
    rotulo_rumo: "RUMO / HEADING",
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
    meteo_estacao: "LOCALIZAÇÃO / ESTAÇÃO",
    meteo_estacao_local: "ESTAÇÃO METEOROLÓGICA LOCAL",
    meteo_condicoes: "CONDIÇÕES METEOROLÓGICAS",
    meteo_temperatura: "TEMPERATURA",
    meteo_sensacao: "SENSAÇÃO",
    meteo_min_max: "MÍN / MÁX",
    meteo_vento: "VENTO",
    meteo_humidade: "HUMIDADE",
    meteo_pressao: "PRESSÃO QNH",
    meteo_uv: "ÍNDICE UV",
    meteo_nascer_sol: "NASCER DO SOL",
    meteo_por_sol: "PÔR DO SOL",
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
    opcoes_localizacao_titulo: "LOCALIZAÇÃO DO RADAR",
    opcoes_localizacao_btn: "ALTERAR LOCALIDADE OU COORDENADAS",
    opcoes_navegacao_titulo: "NAVEGAÇÃO ENTRE ECRÃS (3 ECRÃS)",
    opcoes_ecra_principal: "1. VOO PRINCIPAL",
    opcoes_ecra_restantes: "2. RESTANTES",
    opcoes_ecra_meteo: "3. METEOROLOGIA",
    opcoes_ver_tabela: "VER TABELA COMPLETA DE VOOS",
    opcoes_guardar_fechar: "GUARDAR E FECHAR",

    // Modal de Localização
    loc_titulo: "Localização do Radar",
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
    rotulo_origem: "ORIGIN / DEPARTURE",
    rotulo_destino: "DESTINATION",
    estado_em_voo: "AIRBORNE",
    estado_no_solo: "ON GROUND",

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
    meteo_estacao: "LOCATION / STATION",
    meteo_estacao_local: "LOCAL WEATHER STATION",
    meteo_condicoes: "WEATHER CONDITIONS",
    meteo_temperatura: "TEMPERATURE",
    meteo_sensacao: "FEELS LIKE",
    meteo_min_max: "MIN / MAX",
    meteo_vento: "WIND",
    meteo_humidade: "HUMIDITY",
    meteo_pressao: "QNH PRESSURE",
    meteo_uv: "UV INDEX",
    meteo_nascer_sol: "SUNRISE",
    meteo_por_sol: "SUNSET",
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
    opcoes_localizacao_titulo: "RADAR LOCATION",
    opcoes_localizacao_btn: "CHANGE CITY OR COORDINATES",
    opcoes_navegacao_titulo: "SCREEN NAVIGATION (3 SCREENS)",
    opcoes_ecra_principal: "1. MAIN FLIGHT",
    opcoes_ecra_restantes: "2. REMAINING",
    opcoes_ecra_meteo: "3. WEATHER",
    opcoes_ver_tabela: "VIEW FULL FLIGHT TABLE",
    opcoes_guardar_fechar: "SAVE AND CLOSE",

    // Location Modal
    loc_titulo: "Radar Location",
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
  },

  fr: {
    // En-tête & Ligne 1
    rotulo_voo: "VOL / FLIGHT",
    rotulo_callsign: "INDICATIF",
    rotulo_aeronave: "AÉRONEF",
    rotulo_radar: "RADAR",
    btn_instalar: "📲 INSTALLER",
    btn_opcoes: "Options",
    no_radar: "au radar",

    // Ligne 2 (Route)
    rotulo_origem: "ORIGINE / DÉPART",
    rotulo_destino: "DESTINATION",
    estado_em_voo: "EN VOL",
    estado_no_solo: "AU SOL",

    // Ligne 3 (Télémétrie)
    rotulo_altitude: "ALTITUDE",
    rotulo_velocidade: "VITESSE",
    rotulo_rumo: "CAP / HEADING",
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
    meteo_estacao: "LOCALISATION / STATION",
    meteo_estacao_local: "STATION MÉTÉO LOCALE",
    meteo_condicoes: "CONDITIONS MÉTÉOROLOGIQUES",
    meteo_temperatura: "TEMPÉRATURE",
    meteo_sensacao: "RESSENTI",
    meteo_min_max: "MIN / MAX",
    meteo_vento: "VENT",
    meteo_humidade: "HUMIDITÉ",
    meteo_pressao: "PRESSION QNH",
    meteo_uv: "INDICE UV",
    meteo_nascer_sol: "LEVER DU SOLEIL",
    meteo_por_sol: "COUCHER DU SOLEIL",
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
    opcoes_localizacao_titulo: "POSITION DU RADAR",
    opcoes_localizacao_btn: "CHANGER DE VILLE OU COORDONNÉES",
    opcoes_navegacao_titulo: "NAVIGATION ENTRE ÉCRANS (3 ÉCRANS)",
    opcoes_ecra_principal: "1. VOL PRINCIPAL",
    opcoes_ecra_restantes: "2. RESTANTS",
    opcoes_ecra_meteo: "3. MÉTÉO",
    opcoes_ver_tabela: "VOIR LE TABLEAU COMPLET DES VOLS",
    opcoes_guardar_fechar: "ENREGISTRER ET FERMER",

    // Modal de Localisation
    loc_titulo: "Position du Radar",
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
  },

  es: {
    // Encabezado & Línea 1
    rotulo_voo: "VUELO / FLIGHT",
    rotulo_callsign: "CALLSIGN",
    rotulo_aeronave: "AERONAVE",
    rotulo_radar: "RADAR",
    btn_instalar: "📲 INSTALAR",
    btn_opcoes: "Opciones",
    no_radar: "en radar",

    // Línea 2 (Ruta)
    rotulo_origem: "ORIGEN / SALIDA",
    rotulo_destino: "DESTINO",
    estado_em_voo: "EN VUELO",
    estado_no_solo: "EN TIERRA",

    // Línea 3 (Telemetría)
    rotulo_altitude: "ALTITUD",
    rotulo_velocidade: "VELOCIDAD",
    rotulo_rumo: "RUMBO / HEADING",
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
    meteo_estacao: "UBICACIÓN / ESTACIÓN",
    meteo_estacao_local: "ESTACIÓN METEOROLÓGICA LOCAL",
    meteo_condicoes: "CONDICIONES METEOROLÓGICAS",
    meteo_temperatura: "TEMPERATURA",
    meteo_sensacao: "SENSACIÓN",
    meteo_min_max: "MÍN / MÁX",
    meteo_vento: "VIENTO",
    meteo_humidade: "HUMEDAD",
    meteo_pressao: "PRESIÓN QNH",
    meteo_uv: "ÍNDICE UV",
    meteo_nascer_sol: "AMANECER",
    meteo_por_sol: "ATARDECER",
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
    opcoes_localizacao_titulo: "UBICACIÓN DEL RADAR",
    opcoes_localizacao_btn: "CAMBIAR CIUDAD O COORDENADAS",
    opcoes_navegacao_titulo: "NAVEGACIÓN ENTRE PANTALLAS (3 PANTALLAS)",
    opcoes_ecra_principal: "1. VUELO PRINCIPAL",
    opcoes_ecra_restantes: "2. RESTANTES",
    opcoes_ecra_meteo: "3. METEOROLOGÍA",
    opcoes_ver_tabela: "VER TABLA COMPLETA DE VUELOS",
    opcoes_guardar_fechar: "GUARDAR Y CERRAR",

    // Modal de Ubicación
    loc_titulo: "Ubicación del Radar",
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
  },
};

// ─── Dicionário Multilíngue de Países ──────────────────────────────────────────

const PAISES_TRADUCOES: Record<string, Record<Idioma, string>> = {
  PORTUGAL: { pt: "PORTUGAL", en: "PORTUGAL", fr: "PORTUGAL", es: "PORTUGAL" },
  SPAIN: { pt: "ESPANHA", en: "SPAIN", fr: "ESPAGNE", es: "ESPAÑA" },
  FRANCE: { pt: "FRANÇA", en: "FRANCE", fr: "FRANCE", es: "FRANCIA" },
  "UNITED KINGDOM": { pt: "REINO UNIDO", en: "UNITED KINGDOM", fr: "ROYAUME-UNI", es: "REINO UNIDO" },
  GERMANY: { pt: "ALEMANHA", en: "GERMANY", fr: "ALLEMAGNE", es: "ALEMANIA" },
  SWITZERLAND: { pt: "SUÍÇA", en: "SWITZERLAND", fr: "SUISSE", es: "SUIZA" },
  NETHERLANDS: { pt: "PAÍSES BAIXOS", en: "NETHERLANDS", fr: "PAYS-BAS", es: "PAÍSES BAJOS" },
  ITALY: { pt: "ITÁLIA", en: "ITALY", fr: "ITALIE", es: "ITALIA" },
  BELGIUM: { pt: "BÉLGICA", en: "BELGIUM", fr: "BELGIQUE", es: "BÉLGICA" },
  IRELAND: { pt: "IRLANDA", en: "IRELAND", fr: "IRLANDE", es: "IRLANDA" },
  AUSTRIA: { pt: "ÁUSTRIA", en: "AUSTRIA", fr: "AUTRICHE", es: "AUSTRIA" },
  POLAND: { pt: "POLÓNIA", en: "POLAND", fr: "POLOGNE", es: "POLONIA" },
  LUXEMBOURG: { pt: "LUXEMBURGO", en: "LUXEMBOURG", fr: "LUXEMBOURG", es: "LUXEMBURGO" },
  NORWAY: { pt: "NORUEGA", en: "NORWAY", fr: "NORVÈGE", es: "NORUEGA" },
  SWEDEN: { pt: "SUÉCIA", en: "SWEDEN", fr: "SUÈDE", es: "SUECIA" },
  DENMARK: { pt: "DINAMARCA", en: "DENMARK", fr: "DANEMARK", es: "DINAMARCA" },
  TURKEY: { pt: "TURQUIA", en: "TURKEY", fr: "TURQUIE", es: "TURQUÍA" },
  "UNITED ARAB EMIRATES": { pt: "EMIRADOS ÁRABES UNIDOS", en: "UNITED ARAB EMIRATES", fr: "ÉMIRATS ARABES UNIS", es: "EMIRATOS ÁRABES UNIDOS" },
  "UNITED STATES": { pt: "ESTADOS UNIDOS", en: "UNITED STATES", fr: "ÉTATS-UNIS", es: "ESTADOS UNIDOS" },
  BRAZIL: { pt: "BRASIL", en: "BRAZIL", fr: "BRÉSIL", es: "BRASIL" },
  CANADA: { pt: "CANADÁ", en: "CANADA", fr: "CANADA", es: "CANADÁ" },
  MOROCCO: { pt: "MARROCOS", en: "MOROCCO", fr: "MAROC", es: "MARRUECOS" },
  CAPE_VERDE: { pt: "CABO VERDE", en: "CAPE VERDE", fr: "CAP-VERT", es: "CABO VERDE" },
  "CAPE VERDE": { pt: "CABO VERDE", en: "CAPE VERDE", fr: "CAP-VERT", es: "CABO VERDE" },
  ANGOLA: { pt: "ANGOLA", en: "ANGOLA", fr: "ANGOLA", es: "ANGOLA" },
  MOZAMBIQUE: { pt: "MOÇAMBIQUE", en: "MOZAMBIQUE", fr: "MOZAMBIQUE", es: "MOZAMBIQUE" },
  GREECE: { pt: "GRÉCIA", en: "GREECE", fr: "GRÈCE", es: "GRECIA" },
  FINLAND: { pt: "FINLÂNDIA", en: "FINLAND", fr: "FINLANDE", es: "FINLANDIA" },
  CZECH_REPUBLIC: { pt: "CHÉQUIA", en: "CZECH REPUBLIC", fr: "TCHÉQUIE", es: "REPÚBLICA CHECA" },
  "CZECH REPUBLIC": { pt: "CHÉQUIA", en: "CZECH REPUBLIC", fr: "TCHÉQUIE", es: "REPÚBLICA CHECA" },
  HUNGARY: { pt: "HUNGRIA", en: "HUNGARY", fr: "HONGRIE", es: "HUNGRÍA" },
  ROMANIA: { pt: "ROMÉNIA", en: "ROMANIA", fr: "ROUMANIE", es: "RUMANÍA" },
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
