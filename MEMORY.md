# MEMORY.md — Flight Panel

> Projecto inicializado sob GEMINI v5.0

---

## Contexto Actual

**Projecto:** Flight Panel — Painel analógico electromecânico de monitorização aérea e meteorológica  
**Objectivo:** Interface ultra-minimalista 100% monocromática com logótipo em estilo **Pixel Art 8-bit de Alta Definição (64x64)**, Número do Voo, Origem e Destino em palhetas mecânicas pretas e brancas (*Split-Flap*).  
**Versão:** v0.4.3  
**Data de início:** 2026-09-06  
**Última sessão:** 2026-09-07  
**Estado:** Resolução de erro de compilação Turbopack no `@swc/helpers` através da limpeza forçada da cache `.next` e reinstalação limpa de `node_modules`.

---

## Stack

| Componente      | Tecnologia                        | Justificação                                       |
|-----------------|-----------------------------------|---------------------------------------------------|
| Framework       | Next.js 16 (App Router)           | SSR + Route Handlers (API segura)                 |
| Linguagem       | TypeScript                        | Segurança estrita de tipos                        |
| Estilos         | Tailwind CSS v4 + Canvas HTML5    | Pixel Art 8-bit (64x64) + Palhetas 3D Split-Flap |
| Áudio           | Web Audio API (Procedural)        | Sintetizador de estalido mecânico de palhetas     |
| Font            | Geist Mono                        | Tipografia aeroportuária monoespaçada clássica    |
| Logótipos       | Canvas HTML5 (Binarização 1-bit)  | Conversão do logótipo em Pixel Art HD             |
| Voos            | OpenSky Network (gratuito)        | Telemetria pública de tráfego aéreo               |
| Meteorologia    | OpenWeatherMap (gratuito)         | API meteorológica em PT                           |

---

## Decisões Técnicas (ADRs)

### ADR-001 a 012 — (Ver sessões anteriores)

### ADR-013 — Correcção de Ficheiro Corrompido no SWC Helpers (2026-09-07)
**Contexto:** Ocorreu um erro de leitura `EOF while parsing a value` num `package.json` interno de `@swc/helpers` gerado por interrupção de processos dev concorrentes.  
**Decisão:** Limpar integralmente as pastas `node_modules` e `.next`, procedendo a uma reinstalação completa via `npm install`.  
**Consequência:** Compilação Turbopack restaurada com sucesso com resposta HTTP 200 OK.

---

## Histórico

| Data       | Versão | Acção                                                                  |
|------------|--------|------------------------------------------------------------------------|
| 2026-09-06 | v0.1.0 | Projecto inicializado, estrutura base criada e segura                  |
| 2026-09-07 | v0.2.0 | Redesign completo para painel analógico Split-Flap (Solari di Udine)   |
| 2026-09-07 | v0.2.1 | Reformulação minimalista (Logótipo + Voo + Rota) e correcção do som    |
| 2026-09-07 | v0.2.2 | Resolução do campo Origem e melhoria visual do layout minimalista      |
| 2026-09-07 | v0.2.3 | Correcção do corte de letras e alinhamento responsivo das palhetas    |
| 2026-09-07 | v0.3.0 | Recriação fiel do painel clássico de partidas (DEPARTURES board)       |
| 2026-09-07 | v0.3.1 | Ajuste para exibição exclusiva de 1 único voo de cada vez              |
| 2026-09-07 | v0.4.0 | Purificação da interface: 100% monocromático (Logo + Voo + Origem + Destino)|
| 2026-09-07 | v0.4.1 | Conversão do logótipo da companhia para Pixel Art 8-bit monocromático  |
| 2026-09-07 | v0.4.2 | Aumento da definição da matriz Pixel Art para 64x64                    |
| 2026-09-07 | v0.4.3 | Correcção do erro de parsing em @swc/helpers e limpeza de cache        |
