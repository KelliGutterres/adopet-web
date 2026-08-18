# AdoPet Web — painel da ONG

Painel administrativo em React (Vite). O canal **web é exclusivo da ONG**; o usuário usa o mobile.

## Pré-requisitos

- Node.js 20+
- API `adopet-backend` em `http://localhost:3000` (com seed: `ong@adopet.local` / `senha123`)

## Como rodar

```bash
cp .env.example .env
npm install
npm run dev
```

Abra `http://localhost:5173` — redireciona para `/login`.

| Script | Uso |
|--------|-----|
| `npm run dev` | desenvolvimento (porta 5173) |
| `npm run build` | build de produção |
| `npm run preview` | servir o build |

A URL da API fica em `VITE_API_URL` (nunca commitar `.env`).

## Specs

Ver `specs/`. Login JWT da ONG: spec 002.
