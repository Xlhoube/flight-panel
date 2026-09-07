import { NextRequest, NextResponse } from "next/server";

export interface WeatherData {
  temperature: number;
  apparentTemperature: number;
  relativeHumidity: number;
  windSpeedKmh: number;
  windSpeedKnots: number;
  windDirection: number;
  surfacePressureHpa: number;
  weatherCode: number;
  conditionText: string;
  conditionShort: string;
  isDay: boolean;
  updatedAt: string;
}

// Códigos meteorológicos WMO traduzidos para estilo de painel de aeroporto em PT-PT
function mapWmoToCondition(code: number): { full: string; short: string } {
  switch (code) {
    case 0:
      return { full: "CÉU LIMPO", short: "LIMPO" };
    case 1:
      return { full: "PREDOMINIO LIMPO", short: "BOM TEMPO" };
    case 2:
      return { full: "PARCIALMENTE NUBLADO", short: "PARC NUBL" };
    case 3:
      return { full: "NUBLADO ENCOBERTO", short: "ENCOBERTO" };
    case 45:
    case 48:
      return { full: "NEVOEIRO VISIB REDUZIDA", short: "NEVOEIRO" };
    case 51:
    case 53:
    case 55:
      return { full: "CHUVISCO LIGEIRO", short: "CHUVISCO" };
    case 61:
      return { full: "CHUVA LIGEIRA", short: "CHUVA FRA" };
    case 63:
      return { full: "CHUVA MODERADA", short: "CHUVA MOD" };
    case 65:
      return { full: "CHUVA FORTE INTENSA", short: "CHUVA FOR" };
    case 71:
    case 73:
    case 75:
      return { full: "QUEDA DE NEVE", short: "NEVE" };
    case 80:
    case 81:
    case 82:
      return { full: "AGUACEIROS DISPERSOS", short: "AGUACEIROS" };
    case 95:
      return { full: "TROVOADA COM ACTIVIDADE", short: "TROVOADA" };
    case 96:
    case 99:
      return { full: "TEMPESTADE COM GRANIZO", short: "TEMPESTADE" };
    default:
      return { full: "CONDIÇÕES ESTÁVEIS", short: "ESTÁVEL" };
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const latStr = searchParams.get("lat");
  const lonStr = searchParams.get("lon");

  const lat = latStr ? parseFloat(latStr) : 38.7742;
  const lon = lonStr ? parseFloat(lonStr) : -9.1342;

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m&timezone=auto`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(url, {
      signal: controller.signal,
      next: { revalidate: 60 },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return NextResponse.json(
        { error: `Open-Meteo devolveu código ${response.status}` },
        { status: 502 }
      );
    }

    const data = await response.json();
    const current = data.current;

    const condition = mapWmoToCondition(current.weather_code);
    const windKmh = Math.round(current.wind_speed_10m);
    const windKnots = Math.round(windKmh * 0.539957);

    const weather: WeatherData = {
      temperature: Math.round(current.temperature_2m * 10) / 10,
      apparentTemperature: Math.round(current.apparent_temperature * 10) / 10,
      relativeHumidity: Math.round(current.relative_humidity_2m),
      windSpeedKmh: windKmh,
      windSpeedKnots: windKnots,
      windDirection: Math.round(current.wind_direction_10m),
      surfacePressureHpa: Math.round(current.surface_pressure),
      weatherCode: current.weather_code,
      conditionText: condition.full,
      conditionShort: condition.short,
      isDay: Boolean(current.is_day),
      updatedAt: current.time,
    };

    return NextResponse.json(weather);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
