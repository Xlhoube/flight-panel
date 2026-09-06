# MEMORY.md — Flight Panel

> Projecto inicializado sob GEMINI v5.0

---

## Contexto Actual

**Projecto:** Flight Panel — Painel de monitorização aérea e meteorológica  
**Objectivo:** Mostrar voos em tempo real sobre Valadares (Porto). Quando não há aviões, mostra meteorologia local.  
**Versão:** v0.1.0  
**Data de início:** 2026-09-06  
**Última sessão:** 2026-09-06  
**Estado:** Estrutura base criada. Aguarda chave da API do OpenWeatherMap.

---

## Stack

| Componente      | Tecnologia                        | Justificação                          |
|-----------------|-----------------------------------|---------------------------------------|
| Framework       | Next.js 14 (App Router)           | SSR + Route Handlers (API segura)     |
| Linguagem       | TypeScript                        | Segurança de tipos                    |
| Estilos         | Tailwind CSS                      | Rapid UI + consistência               |
| Font            | Geist Mono (Google Fonts)         | Estética de painel aeroporto          |
| Voos            | OpenSky Network (gratuito)        | API pública de tracking aéreo         |
| Meteorologia    | OpenWeatherMap (gratuito)         | API de meteorologia em PT             |
| Hosting         | Vercel (futuro)                   | CI/CD automático via GitHub           |
| Versionamento   | Git (local por agora)             | Já inicializado pelo create-next-app  |

---

## Estrutura de Ficheiros

```
flight-panel/
├── .env.local                    ← CHAVE DA API AQUI (nunca no git)
├── .gitignore                    ← inclui .env*, node_modules, .next
├── app/
│   ├── layout.tsx                ← Layout raiz (Geist Mono, bg-black)
│   ├── page.tsx                  ← Redirect → /painel
│   ├── globals.css
│   ├── painel/
│   │   └── page.tsx              ← COMPONENTE PRINCIPAL (client)
│   └── api/
│       ├── voos/
│       │   └── route.ts          ← Proxy OpenSky (servidor, sem CORS)
│       └── meteorologia/
│           └── route.ts          ← Proxy OpenWeatherMap (chave segura)
```

---

## Decisões Técnicas (ADRs)

### ADR-001 — API Keys no Servidor (2026-09-06)
**Contexto:** O código original tinha a chave do OpenWeatherMap hardcoded no componente cliente.  
**Decisão:** Mover todas as chamadas a APIs externas para Route Handlers (`/api/voos`, `/api/meteorologia`).  
**Consequência:** A chave nunca chega ao browser. Sem CORS issues com o OpenSky.

### ADR-002 — Cache na Meteorologia (2026-09-06)
**Contexto:** A meteorologia não muda a cada 30 segundos.  
**Decisão:** `next: { revalidate: 600 }` na route de meteorologia (cache de 10 minutos).  
**Consequência:** Menos chamadas à API gratuita. Dados de voos continuam sem cache (`no-store`).

### ADR-003 — Prioridade a Voos em Ar (2026-09-06)
**Contexto:** O OpenSky pode devolver aviões no chão (on_ground: true).  
**Decisão:** Filtrar primeiro por `!v[8]` (não está no chão) antes de mostrar o primeiro voo.

---

## Open Issues

- [ ] **Chave OpenWeatherMap** — Utilizador ainda não tem chave. Instruções no `.env.local`.
- [ ] **Deploy Vercel** — Por fazer. Trigger: utilizador dizer "AUTORIZO BUILD".
- [ ] **GitHub remote** — Repositório local criado. Ainda não há remote configurado.
- [ ] **Múltiplos voos** — Actualmente mostra apenas o primeiro. Futura melhoria: carousel de voos.

---

## Histórico

| Data       | Versão | Acção                                                    |
|------------|--------|----------------------------------------------------------|
| 2026-09-06 | v0.1.0 | Projecto inicializado, estrutura base criada e segura    |

