import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface RespostaGeoIp {
  sucesso: boolean;
  lat?: number;
  lon?: number;
  cidade?: string;
  regiao?: string;
  pais?: string;
  provedor?: string;
  erro?: string;
}

export async function GET(request: NextRequest) {
  // 1. Extração do IP do cliente a partir dos cabeçalhos comuns de proxies e CDNs
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const cfConnectingIp = request.headers.get("cf-connecting-ip");

  let clienteIp = cfConnectingIp || realIp || (forwardedFor ? forwardedFor.split(",")[0].trim() : "");

  // Se for localhost ou IP privado, deixar vazio para que os serviços detectem o IP público de saída
  const isPrivadoOuLocal =
    !clienteIp ||
    clienteIp === "::1" ||
    clienteIp === "127.0.0.1" ||
    clienteIp.startsWith("192.168.") ||
    clienteIp.startsWith("10.") ||
    clienteIp.startsWith("172.16.");

  const ipParam = isPrivadoOuLocal ? "" : `/${clienteIp}`;

  // 2. Provedor 1: ipapi.co (muito preciso para Portugal e Espanha)
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(`https://ipapi.co${ipParam}/json/`, {
      signal: controller.signal,
      headers: { "User-Agent": "FlightPanel-Radar/2.0" },
      cache: "no-store",
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      if (typeof data.latitude === "number" && typeof data.longitude === "number") {
        return NextResponse.json<RespostaGeoIp>({
          sucesso: true,
          lat: Number(data.latitude.toFixed(4)),
          lon: Number(data.longitude.toFixed(4)),
          cidade: data.city || data.region || "LOCALIDADE DETETADA",
          regiao: data.region,
          pais: data.country_name || "Portugal",
          provedor: "ipapi.co",
        });
      }
    }
  } catch {
    // Continuar para o próximo provedor em cascata
  }

  // 3. Provedor 2: ipwhois.app (excelente fallback gratuito)
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);

    const targetUrl = isPrivadoOuLocal
      ? "https://ipwho.is/"
      : `https://ipwho.is/${clienteIp}`;

    const res = await fetch(targetUrl, {
      signal: controller.signal,
      cache: "no-store",
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      if (data.success && typeof data.latitude === "number" && typeof data.longitude === "number") {
        return NextResponse.json<RespostaGeoIp>({
          sucesso: true,
          lat: Number(data.latitude.toFixed(4)),
          lon: Number(data.longitude.toFixed(4)),
          cidade: data.city || data.region || "LOCALIDADE DETETADA",
          regiao: data.region,
          pais: data.country || "Portugal",
          provedor: "ipwho.is",
        });
      }
    }
  } catch {
    // Continuar para o próximo provedor
  }

  // 4. Provedor 3: freeipapi.com
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);

    const targetUrl = isPrivadoOuLocal
      ? "https://freeipapi.com/api/json"
      : `https://freeipapi.com/api/json/${clienteIp}`;

    const res = await fetch(targetUrl, {
      signal: controller.signal,
      cache: "no-store",
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      if (typeof data.latitude === "number" && typeof data.longitude === "number") {
        return NextResponse.json<RespostaGeoIp>({
          sucesso: true,
          lat: Number(data.latitude.toFixed(4)),
          lon: Number(data.longitude.toFixed(4)),
          cidade: data.cityName || data.regionName || "LOCALIDADE DETETADA",
          regiao: data.regionName,
          pais: data.countryName || "Portugal",
          provedor: "freeipapi.com",
        });
      }
    }
  } catch {
    // Falha em todos os provedores
  }

  return NextResponse.json<RespostaGeoIp>(
    {
      sucesso: false,
      erro: "Não foi possível determinar a localização através do IP.",
    },
    { status: 500 }
  );
}
