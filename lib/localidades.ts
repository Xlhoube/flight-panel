// ─── Base de Localidades & Resolução Geográfica de Estações Meteorológicas ────────
// Permite resolver concelho/cidade mais próxima através de coordenadas GPS.

interface LocalidadeRef {
  nome: string;
  lat: number;
  lon: number;
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export const LOCALIDADES_PORTUGAL_IBERIA: LocalidadeRef[] = [
  // Grande Porto & Litoral Norte
  { nome: "VALADARES / GAIA", lat: 41.091, lon: -8.642 },
  { nome: "VILA NOVA DE GAIA", lat: 41.133, lon: -8.617 },
  { nome: "PORTO", lat: 41.150, lon: -8.611 },
  { nome: "MATOSINHOS", lat: 41.182, lon: -8.690 },
  { nome: "MAIA", lat: 41.233, lon: -8.621 },
  { nome: "GONDOMAR", lat: 41.144, lon: -8.533 },
  { nome: "ESPINHO", lat: 40.993, lon: -8.641 },
  { nome: "SANTA MARIA DA FEIRA", lat: 40.926, lon: -8.543 },
  { nome: "S. JOÃO DA MADEIRA", lat: 40.902, lon: -8.490 },
  { nome: "OVAR", lat: 40.859, lon: -8.625 },
  { nome: "VALONGO", lat: 41.189, lon: -8.498 },
  { nome: "PAREDES", lat: 41.208, lon: -8.331 },
  { nome: "PENAFIEL", lat: 41.206, lon: -8.284 },
  { nome: "PAÇOS DE FERREIRA", lat: 41.277, lon: -8.377 },
  { nome: "SANTO TIRSO", lat: 41.343, lon: -8.474 },
  { nome: "TROFA", lat: 41.339, lon: -8.560 },
  { nome: "VILA DO CONDE", lat: 41.355, lon: -8.743 },
  { nome: "PÓVOA DE VARZIM", lat: 41.383, lon: -8.761 },

  // Minho
  { nome: "BRAGA", lat: 41.550, lon: -8.420 },
  { nome: "GUIMARÃES", lat: 41.444, lon: -8.296 },
  { nome: "FAMALICÃO", lat: 41.408, lon: -8.519 },
  { nome: "BARCELOS", lat: 41.532, lon: -8.618 },
  { nome: "ESPOSENDE", lat: 41.533, lon: -8.783 },
  { nome: "VIANA DO CASTELO", lat: 41.693, lon: -8.832 },
  { nome: "PONTE DE LIMA", lat: 41.767, lon: -8.583 },
  { nome: "CAMINHA", lat: 41.874, lon: -8.838 },
  { nome: "VALENÇA", lat: 42.029, lon: -8.634 },
  { nome: "MONÇÃO", lat: 42.079, lon: -8.482 },
  { nome: "ARCOS DE VALDEVEZ", lat: 41.847, lon: -8.418 },

  // Douro, Trás-os-Montes & Tâmega
  { nome: "AMARANTE", lat: 41.272, lon: -8.082 },
  { nome: "FELGUEIRAS", lat: 41.368, lon: -8.200 },
  { nome: "MARCO DE CANAVESES", lat: 41.185, lon: -8.147 },
  { nome: "VILA REAL", lat: 41.296, lon: -7.746 },
  { nome: "PESO DA RÉGUA", lat: 41.166, lon: -7.789 },
  { nome: "LAMEGO", lat: 41.097, lon: -7.810 },
  { nome: "CHAVES", lat: 41.740, lon: -7.472 },
  { nome: "BRAGANÇA", lat: 41.806, lon: -6.757 },
  { nome: "MIRANDELA", lat: 41.488, lon: -7.187 },

  // Centro & Beiras
  { nome: "AVEIRO", lat: 40.640, lon: -8.653 },
  { nome: "ÍLHAVO", lat: 40.601, lon: -8.667 },
  { nome: "ÁGUEDA", lat: 40.575, lon: -8.444 },
  { nome: "ANADIA", lat: 40.441, lon: -8.434 },
  { nome: "MEALHADA", lat: 40.378, lon: -8.452 },
  { nome: "COIMBRA", lat: 40.206, lon: -8.417 },
  { nome: "FIGUEIRA DA FOZ", lat: 40.151, lon: -8.856 },
  { nome: "CANTANHEDE", lat: 40.347, lon: -8.594 },
  { nome: "VISEU", lat: 40.657, lon: -7.914 },
  { nome: "MANGUALDE", lat: 40.606, lon: -7.763 },
  { nome: "TONDELA", lat: 40.517, lon: -8.081 },
  { nome: "GUARDA", lat: 40.537, lon: -7.268 },
  { nome: "COVILHÃ", lat: 40.283, lon: -7.504 },
  { nome: "FUNDÃO", lat: 40.138, lon: -7.502 },
  { nome: "CASTELO BRANCO", lat: 40.823, lon: -7.493 },
  { nome: "LEIRIA", lat: 39.744, lon: -8.807 },
  { nome: "MARINHA GRANDE", lat: 39.749, lon: -8.932 },
  { nome: "POMBAL", lat: 39.916, lon: -8.628 },
  { nome: "NAZARÉ", lat: 39.601, lon: -9.071 },
  { nome: "CALDAS DA RAINHA", lat: 39.403, lon: -9.137 },
  { nome: "PENICHE", lat: 39.356, lon: -9.381 },
  { nome: "TOMAR", lat: 39.604, lon: -8.409 },
  { nome: "ABRANTES", lat: 39.464, lon: -8.198 },
  { nome: "TORRES NOVAS", lat: 39.480, lon: -8.539 },
  { nome: "SANTARÉM", lat: 39.237, lon: -8.686 },

  // Grande Lisboa & Vale do Tejo
  { nome: "LISBOA", lat: 38.722, lon: -9.139 },
  { nome: "CASCAIS", lat: 38.697, lon: -9.422 },
  { nome: "OEIRAS", lat: 38.692, lon: -9.311 },
  { nome: "SINTRA", lat: 38.800, lon: -9.380 },
  { nome: "AMADORA", lat: 38.758, lon: -9.224 },
  { nome: "ODIVELAS", lat: 38.793, lon: -9.182 },
  { nome: "LOURES", lat: 38.831, lon: -9.172 },
  { nome: "VILA FRANCA DE XIRA", lat: 38.955, lon: -8.990 },
  { nome: "MAFRA", lat: 38.937, lon: -9.327 },
  { nome: "TORRES VEDRAS", lat: 39.091, lon: -9.260 },
  { nome: "ALMADA", lat: 38.680, lon: -9.158 },
  { nome: "SEIXAL", lat: 38.643, lon: -9.103 },
  { nome: "BARREIRO", lat: 38.663, lon: -9.072 },
  { nome: "MONTIJO", lat: 38.706, lon: -8.974 },
  { nome: "SETÚBAL", lat: 38.524, lon: -8.893 },
  { nome: "SESIMBRA", lat: 38.444, lon: -9.101 },

  // Alentejo
  { nome: "ÉVORA", lat: 38.571, lon: -7.909 },
  { nome: "BEJA", lat: 38.015, lon: -7.863 },
  { nome: "PORTALEGRE", lat: 39.294, lon: -7.431 },
  { nome: "ELVAS", lat: 38.881, lon: -7.164 },
  { nome: "SINES", lat: 37.956, lon: -8.871 },

  // Algarve
  { nome: "FARO", lat: 37.019, lon: -7.930 },
  { nome: "OLHÃO", lat: 37.028, lon: -7.841 },
  { nome: "TAVIRA", lat: 37.126, lon: -7.649 },
  { nome: "VILA REAL S. ANTÓNIO", lat: 37.195, lon: -7.417 },
  { nome: "ALBUFEIRA", lat: 37.089, lon: -8.248 },
  { nome: "PORTIMÃO", lat: 37.138, lon: -8.538 },
  { nome: "LAGOS", lat: 37.102, lon: -8.673 },
  { nome: "SILVES", lat: 37.189, lon: -8.439 },
  { nome: "LOULÉ", lat: 37.138, lon: -8.023 },

  // Madeira & Açores
  { nome: "FUNCHAL", lat: 32.651, lon: -16.908 },
  { nome: "SANTA CRUZ", lat: 32.688, lon: -16.793 },
  { nome: "PORTO SANTO", lat: 33.060, lon: -16.336 },
  { nome: "PONTA DELGADA", lat: 37.741, lon: -25.669 },
  { nome: "RIBEIRA GRANDE", lat: 37.822, lon: -25.521 },
  { nome: "ANGRA DO HEROÍSMO", lat: 38.654, lon: -27.218 },
  { nome: "HORTA", lat: 38.533, lon: -28.629 },

  // Galiza & Espanha de Proximidade
  { nome: "VIGO", lat: 42.240, lon: -8.720 },
  { nome: "PONTEVEDRA", lat: 42.431, lon: -8.644 },
  { nome: "SANTIAGO COMPOSTELA", lat: 42.880, lon: -8.545 },
  { nome: "A CORUÑA", lat: 43.362, lon: -8.411 },
  { nome: "OURENSE", lat: 42.336, lon: -7.864 },
  { nome: "BADAJOZ", lat: 38.879, lon: -6.971 },
  { nome: "SEVILHA", lat: 37.389, lon: -5.984 },
  { nome: "MADRID", lat: 40.416, lon: -3.703 },
];

/**
 * Determina a localidade mais próxima das coordenadas GPS fornecidas.
 * Se estiver a menos de 35 km de um centro conhecido, devolve o nome da localidade.
 * Caso contrário, devolve "ESTAÇÃO LOCAL".
 */
export function resolverLocalidadePorCoordenadas(lat: number, lon: number, raioMaxKm = 35): string {
  let maisProxima: string | null = null;
  let menorDistancia = Infinity;

  for (const loc of LOCALIDADES_PORTUGAL_IBERIA) {
    const dist = haversineKm(lat, lon, loc.lat, loc.lon);
    if (dist < menorDistancia) {
      menorDistancia = dist;
      maisProxima = loc.nome;
    }
  }

  if (menorDistancia <= raioMaxKm && maisProxima) {
    return maisProxima;
  }

  return "ESTAÇÃO LOCAL";
}

/**
 * Higieniza o nome da estação meteorológica para exibição nos painéis Split-Flap.
 * Remove termos técnicos (GPS, SATÉLITE, parêntesis soltos) e garante tamanho compatível.
 */
export function formatarNomeEstacaoDisplay(
  nomeBruto: string | null | undefined,
  lat?: number,
  lon?: number
): string {
  if (!nomeBruto || nomeBruto.trim() === "") {
    if (lat != null && lon != null) {
      return resolverLocalidadePorCoordenadas(lat, lon);
    }
    return "ESTAÇÃO LOCAL";
  }

  const upper = nomeBruto.trim().toUpperCase();

  // Se o nome contiver lixo técnico de satélite/dispositivo, resolver geograficamente
  if (
    upper.startsWith("GPS") ||
    upper.includes("SATÉLITE") ||
    upper.includes("SATELITE") ||
    upper.includes("DISPOSITIVO") ||
    upper.includes("(±")
  ) {
    if (lat != null && lon != null) {
      return resolverLocalidadePorCoordenadas(lat, lon);
    }
    return "ESTAÇÃO LOCAL";
  }

  // Se for genérico e tivermos coordenadas válidas
  if (upper === "ESTAÇÃO LOCAL" && lat != null && lon != null) {
    const resolvida = resolverLocalidadePorCoordenadas(lat, lon);
    if (resolvida !== "ESTAÇÃO LOCAL") {
      return resolvida;
    }
  }

  // Limpar pontuações terminais indesejadas (ex: "(", "/", "-")
  const limpo = upper.replace(/[\(\[\/\-]$/, "").trim();
  return limpo || "ESTAÇÃO LOCAL";
}
