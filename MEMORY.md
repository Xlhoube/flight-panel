# MEMORY.md — Flight Panel

> Projecto inicializado sob GEMINI v5.0

---

## Contexto Actual

**Projecto:** Flight Panel — Painel analógico electromecânico de monitorização aérea e meteorológica  
**Objectivo:** Apresentar voos em tempo real sobre Valadares (Porto) em formato de painel analógico vintage de palhetas mecânicas (Split-Flap / Solari di Udine). Quando não há aeronaves no espaço aéreo, apresenta boletim meteorológico local.  
**Versão:** v0.2.0  
**Data de início:** 2026-09-06  
**Última sessão:** 2026-09-07  
**Estado:** Interface analógica Split-Flap completa com suporte a múltiplos voos, lâmpadas piloto, efeitos sonoros mecânicos e telemetria. Aguarda chave da API do OpenWeatherMap para dados meteorológicos reais.

---

## Stack

| Componente      | Tecnologia                        | Justificação                                       |
|-----------------|-----------------------------------|---------------------------------------------------|
| Framework       | Next.js 16 (App Router)           | SSR + Route Handlers (API segura)                 |
| Linguagem       | TypeScript                        | Segurança estrita de tipos                        |
| Estilos         | Tailwind CSS v4 + Vanilla CSS     | Palhetas 3D Split-Flap, parafusos, lâmpadas piloto |
| Áudio           | Web Audio API (Procedural)        | Efeito sonoro sintético de flaps sem ficheiros    |
| Font            | Geist Mono                        | Tipografia aeroportuária monoespaçada clássica    |
| Voos            | OpenSky Network (gratuito)        | Telemetria pública de tráfego aéreo               |
| Meteorologia    | OpenWeatherMap (gratuito)         | API meteorológica em PT                           |
| Hosting         | Vercel (futuro)                   | CI/CD automático via GitHub                       |
| Versionamento   | Git                               | Versionamento atómico                             |

---

## Estrutura de Ficheiros

```
flight-panel/
├── .env.local                    ← CHAVE DA API AQUI (nunca no git)
├── .gitignore                    ← inclui .env*, node_modules, .next
├── next.config.ts                ← allowedDevOrigins para rede local
├── app/
│   ├── layout.tsx                ← Layout raiz (Geist Mono, bg-black)
│   ├── page.tsx                  ← Redirect → /painel
│   ├── globals.css               ← Regras CSS 3D mecânicas e animações flap
│   ├── painel/
│   │   └── page.tsx              ← PAINEL ANALÓGICO SOLARI DI UDINE (client)
│   └── api/
│       ├── voos/
│       │   └── route.ts          ← Proxy OpenSky (servidor, sem CORS)
│       └── meteorologia/
│           └── route.ts          ← Proxy OpenWeatherMap (chave segura)
```

---

## Decisões Técnicas (ADRs)

### ADR-001 — API Keys no Servidor (2026-09-06)
**Contexto:** O código original tinha a chave do OpenWeatherMap no cliente.  
**Decisão:** Mover todas as chamadas externas para Route Handlers (`/api/voos`, `/api/meteorologia`).  
**Consequência:** Chaves protegidas e sem restrições de CORS.

### ADR-002 — Cache na Meteorologia (2026-09-06)
**Contexto:** Meteorologia não altera em pequenos intervalos.  
**Decisão:** `next: { revalidate: 600 }` (cache de 10 minutos).  
**Consequência:** Redução do consumo de quota gratuita da API.

### ADR-003 — Prioridade a Voos em Ar (2026-09-06)
**Contexto:** Aeronaves em taxiway/solo têm menos interesse visual imediato.  
**Decisão:** Ordenar e priorizar aeronaves com `!on_ground` e maior altitude.

### ADR-004 — Estética Electromecânica Split-Flap (2026-09-07)
**Contexto:** Pedido de estilo de painel analógico clássico de aeroporto.  
**Decisão:** Criação de motor de células Split-Flap (corte horizontal, pinos de rotor mecânico, iluminação 3D com abas superior e inferior, rotação CSS) e gerador de som procedural via Web Audio API com comutador liga/desliga. Suporte a tabela com múltiplos voos simultâneos e telemetria de voo selecionado.  
**Consequência:** Experiência analógica nostálgica autêntica de aeroporto vintage.

---

## Open Issues

- [ ] **Chave OpenWeatherMap** — Utilizador ainda não tem chave. Instruções no `.env.local`.
- [ ] **Deploy Vercel** — Por fazer. Trigger: utilizador dizer "AUTORIZO BUILD".
- [ ] **GitHub remote** — Repositório local criado. Ainda não há remote configurado.

---

## Histórico

| Data       | Versão | Acção                                                                  |
|------------|--------|------------------------------------------------------------------------|
| 2026-09-06 | v0.1.0 | Projecto inicializado, estrutura base criada e segura                  |
| 2026-09-07 | v0.2.0 | Redesign completo para painel analógico Split-Flap (Solari di Udine)   |
