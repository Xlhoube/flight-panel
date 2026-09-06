import { NextResponse } from "next/server";

// Coordenadas de Valadares
const LAT = 41.084;
const LON = -8.655;

export async function GET() {
  const apiKey = process.env.OPENWEATHER_API_KEY;

  // Verificar se a chave foi configurada
  if (!apiKey || apiKey === "a_tua_chave_aqui") {
    return NextResponse.json(
      { erro: "Chave da API de meteorologia não configurada. Edita o ficheiro .env.local." },
      { status: 503 }
    );
  }

  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${LAT}&lon=${LON}&appid=${apiKey}&units=metric&lang=pt`,
      {
        // Cache de 10 minutos — a meteorologia não muda a cada 30 segundos
        next: { revalidate: 600 },
      }
    );

    if (!res.ok) {
      const erro = await res.json();
      return NextResponse.json(
        { erro: erro.message ?? "Falha ao contactar o OpenWeatherMap." },
        { status: res.status }
      );
    }

    const dados = await res.json();
    return NextResponse.json(dados);
  } catch {
    return NextResponse.json(
      { erro: "Erro interno ao obter dados meteorológicos." },
      { status: 500 }
    );
  }
}

