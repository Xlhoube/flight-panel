import { NextResponse } from "next/server";

// Coordenadas da zona de Valadares / Grande Porto
const LAMIN = 40.95;
const LOMIN = -8.80;
const LAMAX = 41.25;
const LOMAX = -8.50;

export async function GET() {
  try {
    const res = await fetch(
      `https://opensky-network.org/api/states/all?lamin=${LAMIN}&lomin=${LOMIN}&lamax=${LAMAX}&lomax=${LOMAX}`,
      {
        // Sem cache: queremos dados em tempo real a cada pedido
        cache: "no-store",
      }
    );

    if (!res.ok) {
      return NextResponse.json(
        { erro: "Falha ao contactar o OpenSky Network." },
        { status: res.status }
      );
    }

    const dados = await res.json();

    // Devolver apenas os estados dos voos (array de arrays)
    return NextResponse.json({ estados: dados.states ?? [] });
  } catch {
    return NextResponse.json(
      { erro: "Erro interno ao obter dados de voos." },
      { status: 500 }
    );
  }
}

