import { NextRequest, NextResponse } from "next/server";

function mapearCodigoWmo(code: number) {
  switch (code) {
    case 0: return "CEU LIMPO";
    case 1: return "BOM TEMPO";
    case 2: return "POUCO NUBLADO";
    case 3: return "ENCOBERTO";
    case 45: case 48: return "NEVOEIRO";
    case 51: case 53: case 55: return "CHUVISCOS";
    case 61: return "CHUVA FRACA";
    case 63: return "CHUVA MODERADA";
    case 65: return "CHUVA FORTE";
    case 71: case 73: case 75: return "NEVE";
    case 80: case 81: case 82: return "AGUACEIROS";
    case 95: case 96: case 99: return "TROVOADA";
    default: return "ESTAVEL";
  }
}

function calcularRumoRosa(graus: number): string {
  const direcoes = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  const indice = Math.round(((graus %= 360) < 0 ? graus + 360 : graus) / 22.5) % 16;
  return direcoes[indice];
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
        const windKmh = Math.round((dados.wind?.speed ?? 0) * 3.6);
        const windKts = Math.round((dados.wind?.speed ?? 0) * 1.94384);
        const windDeg = dados.wind?.deg ?? 0;
        const pressure = dados.main?.pressure ?? 1013;
        
        return NextResponse.json({
          name: dados.name || "LOCAL",
          weather: [{ description: (dados.weather?.[0]?.description || "CEU LIMPO").toUpperCase(), main: "Meteo", code: dados.weather?.[0]?.id ?? 800 }],
          main: {
            temp: dados.main?.temp ?? 18,
            humidity: dados.main?.humidity ?? 65,
            feels_like: dados.main?.feels_like ?? dados.main?.temp ?? 18,
            temp_min: dados.main?.temp_min != null ? Math.round(dados.main.temp_min) : Math.round(dados.main?.temp - 3),
            temp_max: dados.main?.temp_max != null ? Math.round(dados.main.temp_max) : Math.round(dados.main?.temp + 3),
            pressure: pressure,
          },
          wind: {
            speed: dados.wind?.speed ?? 3.5,
            speed_kmh: windKmh,
            speed_kts: windKts,
            direction_deg: windDeg,
            direction_cardinal: calcularRumoRosa(windDeg),
            gusts_kmh: dados.wind?.gust ? Math.round(dados.wind.gust * 3.6) : windKmh,
          },
          aviation: {
            qnh: pressure,
            condition: dados.visibility && dados.visibility > 8000 ? "CAVOK" : "VMC",
            flight_category: "VFR",
          },
          environment: {
            is_day: dados.weather?.[0]?.icon ? !dados.weather[0].icon.includes("n") : true,
            precipitation_mm: dados.rain?.["1h"] ?? 0,
            uv_index: 3,
            sunrise: dados.sys?.sunrise ? new Date(dados.sys.sunrise * 1000).toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" }) : "07:15",
            sunset: dados.sys?.sunset ? new Date(dados.sys.sunset * 1000).toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" }) : "19:50",
          }
        });
      }
    } catch {
      // Avançar para o fallback Open-Meteo
    }
  }

  // 2. Fallback fiável e gratuito: Open-Meteo com telemetria avançada
  try {
    const urlMeteo = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max&timezone=auto`;
    const res = await fetch(urlMeteo, { next: { revalidate: 600 } });

    if (res.ok) {
      const d = await res.json();
      const curr = d.current;
      const windKmh = Math.round(curr.wind_speed_10m ?? 0);
      const windKts = Math.round(windKmh * 0.539957);
      const windDeg = Math.round(curr.wind_direction_10m ?? 0);
      const pressure = Math.round(curr.surface_pressure ?? 1013);
      const wCode = curr.weather_code ?? 0;
      const desc = mapearCodigoWmo(wCode);

      const isCavok = (wCode <= 2) && (curr.precipitation ?? 0) === 0;

      const sunriseStr = d.daily?.sunrise?.[0] ? d.daily.sunrise[0].split("T")[1]?.slice(0, 5) : "07:10";
      const sunsetStr = d.daily?.sunset?.[0] ? d.daily.sunset[0].split("T")[1]?.slice(0, 5) : "19:55";

      const payloadFormatado = {
        name: "AERÓDROMO LOCAL",
        weather: [{ description: desc, main: "Meteo", code: wCode }],
        main: {
          temp: curr.temperature_2m,
          humidity: curr.relative_humidity_2m,
          feels_like: curr.apparent_temperature,
          temp_min: d.daily?.temperature_2m_min?.[0] != null ? Math.round(d.daily.temperature_2m_min[0]) : Math.round(curr.temperature_2m - 3),
          temp_max: d.daily?.temperature_2m_max?.[0] != null ? Math.round(d.daily.temperature_2m_max[0]) : Math.round(curr.temperature_2m + 4),
          pressure: pressure,
        },
        wind: {
          speed: curr.wind_speed_10m / 3.6, // m/s para compatibilidade
          speed_kmh: windKmh,
          speed_kts: windKts,
          direction_deg: windDeg,
          direction_cardinal: calcularRumoRosa(windDeg),
          gusts_kmh: Math.round(curr.wind_gusts_10m ?? windKmh),
        },
        aviation: {
          qnh: pressure,
          condition: isCavok ? "CAVOK" : "VMC",
          flight_category: wCode >= 61 ? "IFR" : "VFR",
        },
        environment: {
          is_day: curr.is_day === 1,
          precipitation_mm: curr.precipitation ?? 0,
          uv_index: d.daily?.uv_index_max?.[0] != null ? Math.round(d.daily.uv_index_max[0]) : 3,
          sunrise: sunriseStr,
          sunset: sunsetStr,
        },
      };
      return NextResponse.json(payloadFormatado);
    }
  } catch {
    // Retornar erro apenas se falhar
  }

  return NextResponse.json(
    { erro: "Não foi possível obter dados meteorológicos." },
    { status: 500 }
  );
}
