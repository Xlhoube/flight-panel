# MEMORY.md — Flight Panel

> Projecto inicializado sob GEMINI v5.0

---

## Contexto Actual

**Projecto:** Flight Panel — Painel analógico electromecânico de monitorização aérea e meteorológica  
**Objectivo:** Apresentar o voo detetado em tempo real sobre Valadares (Porto) num formato ultra-minimalista com palhetas mecânicas (*Split-Flap*), exibindo unicamente o Logótipo da Companhia Aérea, o Número do Voo e a Rota (Origem ➔ Destino).  
**Versão:** v0.2.1  
**Data de início:** 2026-09-06  
**Última sessão:** 2026-09-07  
**Estado:** Interface minimalista funcional com som mecânico procedural Web Audio API reativado e logótipos CDN de companhias aéreas.

---

## Stack

| Componente      | Tecnologia                        | Justificação                                       |
|-----------------|-----------------------------------|---------------------------------------------------|
| Framework       | Next.js 16 (App Router)           | SSR + Route Handlers (API segura)                 |
| Linguagem       | TypeScript                        | Segurança estrita de tipos                        |
| Estilos         | Tailwind CSS v4 + Vanilla CSS     | Palhetas 3D Split-Flap e animações                |
| Áudio           | Web Audio API (Procedural)        | Sintetizador de estalido mecânico de palhetas     |
| Font            | Geist Mono                        | Tipografia aeroportuária monoespaçada clássica    |
| Logótipos       | Aviasales CDN (`pics.avs.io`)     | Logótipos oficiais de companhias por IATA          |
| Voos            | OpenSky Network (gratuito)        | Telemetria pública de tráfego aéreo               |
| Meteorologia    | OpenWeatherMap (gratuito)         | API meteorológica em PT                           |

---

## Decisões Técnicas (ADRs)

### ADR-001 a 004 — (Ver sessões anteriores)

### ADR-005 — Simplificação Minimalista & Áudio Interativo (2026-09-07)
**Contexto:** O utilizador solicitou um layout minimalista focado exclusivamente nas letras/palhetas, número do voo, logótipo da companhia e rota, reportando também falha de som.  
**Decisão:** Eliminar elementos visuais secundários. Adicionar inicialização do `AudioContext` da Web Audio API através de gesto de utilizador (clique) e sintetizar proceduralmente o efeito sonoro de viragem de palhetas.  
**Consequência:** Design ultra limpo e reprodução de som infalível em qualquer navegador moderno.

---

## Histórico

| Data       | Versão | Acção                                                                  |
|------------|--------|------------------------------------------------------------------------|
| 2026-09-06 | v0.1.0 | Projecto inicializado, estrutura base criada e segura                  |
| 2026-09-07 | v0.2.0 | Redesign completo para painel analógico Split-Flap (Solari di Udine)   |
| 2026-09-07 | v0.2.1 | Reformulação minimalista (Logótipo + Voo + Rota) e correcção do som    |
