import { NextRequest, NextResponse } from "next/server";
import { resolverLocalidadePorCoordenadas } from "@/lib/localidades";

export const dynamic = "force-dynamic";

interface RespostaGeorresolucao {
  sucesso: boolean;
  nome: string;
  freguesia?: string;
  concelho?: string;
  pais?: string;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const latStr = searchParams.get("lat");
  const lonStr = searchParams.get("lon");

  if (!latStr || !lonStr) {
    return NextResponse.json({ sucesso: false, nome: "ESTAÇÃO LOCAL" }, { status: 400 });
  }

  const lat = parseFloat(latStr);
  const lon = parseFloat(lonStr);

  if (isNaN(lat) || isNaN(lon)) {
    return NextResponse.json({ sucesso: false, nome: "ESTAÇÃO LOCAL" }, { status: 400 });
  }

  // 1. Tentar obter via OpenStreetMap Nominatim (muito rigoroso com freguesias portuguesas)
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);

    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=14&addressdetails=1`,
      {
        signal: controller.signal,
        headers: {
          "User-Agent": "FlightPanel-Aviation/2.11 (https://flight-panel.vercel.app)",
          "Accept-Language": "pt-PT,pt;q=0.9",
        },
        cache: "no-store",
      }
    );
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};

      const localidade =
        addr.town ||
        addr.village ||
        addr.suburb ||
        addr.neighbourhood ||
        addr.quarter ||
        addr.city_district ||
        addr.municipality ||
        addr.city ||
        "";

      const concelho =
        addr.city ||
        addr.municipality ||
        addr.county ||
        "";

      if (localidade) {
        let nomeFormatado = localidade.toUpperCase();
        if (concelho && concelho.toUpperCase() !== localidade.toUpperCase()) {
          const concelhoCurto = concelho
            .toUpperCase()
            .replace(/^VILA NOVA DE /, "")
            .replace(/^SÃO /, "S. ");
          nomeFormatado = `${nomeFormatado} / ${concelhoCurto}`;
        }

        return NextResponse.json<RespostaGeorresolucao>({
          sucesso: true,
          nome: nomeFormatado,
          freguesia: localidade,
          concelho: concelho,
          pais: addr.country || "Portugal",
        });
      }
    }
  } catch { }

  // 2. Provedor 2 de contingência: BigDataCloud (rápido e sem chave de API)
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);

    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=pt`,
      { signal: controller.signal, cache: "no-store" }
    );
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      const localidade = data.locality || data.city || "";
      const concelho = data.city || data.principalSubdivision || "";

      if (localidade) {
        let nomeFormatado = localidade.toUpperCase().replace(/\s+E\s+PEROSINHO/i, "");
        if (concelho && concelho.toUpperCase() !== localidade.toUpperCase()) {
          const concelhoCurto = concelho
            .toUpperCase()
            .replace(/^VILA NOVA DE /, "")
            .replace(/^SÃO /, "S. ");
          nomeFormatado = `${nomeFormatado} / ${concelhoCurto}`;
        }

        return NextResponse.json<RespostaGeorresolucao>({
          sucesso: true,
          nome: nomeFormatado,
          freguesia: localidade,
          concelho: concelho,
          pais: data.countryName || "Portugal",
        });
      }
    }
  } catch { }

  // 3. Fallback estático da tabela de freguesias offline
  const offlineNome = resolverLocalidadePorCoordenadas(lat, lon);
  return NextResponse.json<RespostaGeorresolucao>({
    sucesso: true,
    nome: offlineNome,
  });
}
