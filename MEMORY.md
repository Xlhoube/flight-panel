# MEMORY.md — Flight Panel

> Projecto inicializado sob GEMINI v5.0

---

## Contexto Actual

**Projecto:** Flight Panel — Painel analógico electromecânico de monitorização aérea e meteorológica  
**Objectivo:** Apresentar o voo detetado em tempo real sobre Valadares (Porto) num formato minimalista de alto impacto visual (*Split-Flap*), exibindo o Logótipo da Companhia Aérea, o Número do Voo e a Rota (Origem ➔ Destino).  
**Versão:** v0.2.3  
**Data de início:** 2026-09-06  
**Última sessão:** 2026-09-07  
**Estado:** Ajuste das dimensões responsivas das palhetas (*Split-Flap*) e nomes limpos de Origem/Destino (ex: `PARIS ➔ PORTO`) eliminando qualquer corte horizontal no ecrã.

---

## Stack

| Componente      | Tecnologia                        | Justificação                                       |
|-----------------|-----------------------------------|---------------------------------------------------|
| Framework       | Next.js 16 (App Router)           | SSR + Route Handlers (API segura)                 |
| Linguagem       | TypeScript                        | Segurança estrita de tipos                        |
| Estilos         | Tailwind CSS v4 + Vanilla CSS     | Palhetas 3D Split-Flap e moldura Solari minimalista|
| Áudio           | Web Audio API (Procedural)        | Sintetizador de estalido mecânico de palhetas     |
| Font            | Geist Mono                        | Tipografia aeroportuária monoespaçada clássica    |
| Logótipos       | Aviasales CDN (`pics.avs.io`)     | Logótipos oficiais de companhias por IATA          |
| Voos            | OpenSky Network (gratuito)        | Telemetria pública de tráfego aéreo               |
| Meteorologia    | OpenWeatherMap (gratuito)         | API meteorológica em PT                           |

---

## Decisões Técnicas (ADRs)

### ADR-001 a 006 — (Ver sessões anteriores)

### ADR-007 — Optimização Responsiva de Palhetas & Nomes Limpos (2026-09-07)
**Contexto:** Na imagem enviada pelo utilizador, o nome da cidade de origem `PARIS` e o destino `PORTO (OPO)` sofriam cortes horizontais nas pontas devido à largura excessiva de 12 palhetas por bloco.  
**Decisão:** Reduzir o número de palhetas por bloco para 8 e simplificar nomes (ex: `PARIS` e `PORTO`), ajustando o tamanho responsivo da célula `w-6 h-9 sm:w-8 sm:h-12 md:w-10 md:h-14` com `shrink-0`.  
**Consequência:** Nenhuma letra fica cortada independentemente da resolução ou dispositivo.

---

## Histórico

| Data       | Versão | Acção                                                                  |
|------------|--------|------------------------------------------------------------------------|
| 2026-09-06 | v0.1.0 | Projecto inicializado, estrutura base criada e segura                  |
| 2026-09-07 | v0.2.0 | Redesign completo para painel analógico Split-Flap (Solari di Udine)   |
| 2026-09-07 | v0.2.1 | Reformulação minimalista (Logótipo + Voo + Rota) e correcção do som    |
| 2026-09-07 | v0.2.2 | Resolução do campo Origem e melhoria visual do layout minimalista      |
| 2026-09-07 | v0.2.3 | Correcção do corte de letras e alinhamento responsivo das palhetas    |
