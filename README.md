# Portal de Admissão — Green House

Sistema de admissão digital: formulário admissional, geração e assinatura eletrônica das
fichas (Cadastro, Emergência, Termo de VT), envio de documentação por checklist com
"continue de onde parou", revisão pelo RH e geração do dossiê único em PDF.

**Status:** fase de planejamento.

- 📋 [Visão e decisões de arquitetura](docs/planejamento/01-visao-e-decisoes.md)

## Stack (decidida)

Python/FastAPI · React/Vite · PostgreSQL · MinIO · Redis · SMTP · Docker Compose
(stacks: IP direto, Traefik, Certbot). Configuração via `.env`.
