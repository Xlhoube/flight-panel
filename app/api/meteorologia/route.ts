import { NextRequest, NextResponse } from "next/server";

function mapearCodigoWmo(code: number) {
  switch (code) {
    case 0: return "CEU LIMPO";
    case 1: case 2: return "POUCO NUBLADO";
    case 3: return "ENCOBERTO";
    case 45: case 48: return "NEVOEIRO";
    case 51: case 53: case 55: return "CHUVISCOS";
    case 61: case 63: case 65: return "CHUVA";
    case 71: case 73: case 75: return "NEVE";
    case 80: case 81: case 82: return "AGUACEIROS";
    case 95: case 96: case 99: return "TROVOADA";
    default: return "ESTAVEL";
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat") || process.env.NEXT_PUBLIC_DEFAULT_LATITUDE || "41.15";
  const lon = searchParams.get("lon") || process.env.NEXT_PUBLIC_DEFAULT_LONGITUDE || "-8.62";

  const apiKey = process.env.OPENWEATHER_API_KEY;

  // 1. Tentar OpenWeatherMap se a chave estiver configurada
  if (apiKey && apiKey !== "a_tua_chave_aqui") {
    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=pt`,
        { next: { revalidate: 600 } }
      );

      if (res.ok) {
        const dados = await res.json();
        return NextResponse.json(dados);
      }
    } catch {
      // Avançar para o fallback Open-Meteo
    }
  }

  // 2. Fallback fiável e 100% gratuito: Open-Meteo (sem necessidade de chaves de API)
  try {
    const urlMeteo = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&timezone=auto`;
    const res = await fetch(urlMeteo, { next: { revalidate: 600 } });

    if (res.ok) {
      const d = await res.json();
      const curr = d.current;
      const payloadFormatado = {
        name: "LOCAL",
        weather: [{ description: mapearCodigoWmo(curr.weather_code), main: "Meteo" }],
        main: {
          temp: curr.temperature_2m,
          humidity: curr.relative_humidity_2m,
          feels_like: curr.apparent_temperature,
        },
        wind: {
          speed: curr.wind_speed_10m / 3.6, // converter de km/h para m/s para compatibilidade
        },
      };
      return NextResponse.json(payloadFormatado);
    }
  } catch {
    // Retornar erro apenas se ambos falharem
  }

  return NextResponse.json(
    { erro: "Não foi possível obter dados meteorológicos." },
    { status: 500 }
  );
}

