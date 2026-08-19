# AdoPet Web — painel da ONG

Painel administrativo em React (Vite). O canal **web é exclusivo da ONG**; o usuário usa o mobile.

## Pré-requisitos

- Node.js 20+
- API `adopet-backend` em `http://127.0.0.1:3000` (com seed: `ong@adopet.local` / `senha123`)

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

Em desenvolvimento o Vite encaminha `/auth`, `/animais` e `/health` para a API em `127.0.0.1:3000`. Se quiser chamar a API direto, use `VITE_API_URL=http://127.0.0.1:3000` (nunca `localhost` no Windows — o Chrome pode responder `ERR_CONNECTION_RESET`). Não commitar `.env`.

## Specs

Ver `specs/`. Login JWT da ONG: spec 002. Listagem do painel: spec 003 (`/painel/animais/adocao`).
