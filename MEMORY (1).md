# MEMORY.md — Flight Panel

## Contexto e Objectivo do Projecto
Aplicação móvel de rastreio de voos em tempo real com estética analógica de aeroporto (split-flap / Solari board) desenvolvida com Three.js.
Detecta aeronaves num raio de 20 km da localização do utilizador, apresentando número de voo, origem, destino, logótipo da transportadora aérea e rota. Quando não existirem aeronaves no espaço aéreo imediato, o painel roda mecanicamente para exibir as condições meteorológicas locais.

## Decisões de Arquitectura (ADR)
- **Data de Início:** 2026-09-07
- **Versão:** v0.1.0
- **Ambiente:** Telemóvel (iOS / Android) com suporte Web via Expo (React Native)
- **Nível de Risco:** 1 (Baixo impacto / lazer)
- **Ritmo:** B (Desenvolvimento sólido)
- **Frontend / 3D:** React Native + Expo com Three.js / Expo-GL para renderização 3D mecânica das palhetas analógicas
- **APIs em Tempo Real:** 
  - OpenSky Network / ADS-B para telemetria de voos em tempo real
  - Open-Meteo para dados meteorológicos locais sem necessidade de chaves complexas
  - API de logótipos / dados de companhias aéreas
- **Infraestrutura Padrão:**
  - Base de dados / Backend: Appwrite
  - Versionamento: GitHub
  - Deploy / Distribuição: EAS / Expo / Vercel Web preview

## Estado Actual
- Pasta inicializada em G:\Outros computadores\O meu portátil\Projetos Antigravity\Flight Panel
- Projecto inicializado sob GEMINI v5.0

## Registo de Alterações
- [2026-09-07] | Inicialização do projecto via protocolo START | Definição da stack React Native + Expo + Three.js | Sem dívida técnica | Base sólida configurada
