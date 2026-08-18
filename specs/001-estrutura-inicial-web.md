# Spec 001 — Estrutura inicial do painel web

> **Status:** aprovada e implementada.  
> Depende de: nada no repo web (hoje só `docs/`, `specs/` e `.cursor/rules/`).  
> Próxima fatia: spec 002 (tela de login da ONG).

## Objetivo

Criar a base do repositório `adopet-web` com **React**, para o painel da ONG (administrador do sistema — sem role `admin` separado), alinhado ao contexto e às boas práticas: páginas / componentes / serviços / hooks.

Esta fatia **não** entrega a tela de login. Só o scaffold para a spec 002 plugar o fluxo de autenticação.

## Escopo (esta tarefa)

1. Scaffold **Vite + React** (JavaScript)
2. Organização de pastas do MVP
3. Roteamento mínimo (`react-router-dom`)
4. Cliente HTTP base apontando para a API (`VITE_API_URL`)
5. CSS global mínimo (reset + tipografia), sem design system completo
6. `.env.example`, `.gitignore`, `README.md` de desenvolvimento
7. Atualizar `docs/CONTEXTO-PROJETO.md` após aprovação + implementação

## Fora de escopo

- Tela de login / JWT / `localStorage` (spec 002)
- Cadastro de ONG, esqueci senha, CRUD de animais
- TypeScript
- Biblioteca de UI (MUI, Chakra, Ant Design, etc.)
- Tailwind / styled-components
- Testes automatizados
- Deploy (Vercel/Netlify)
- Alterações no `adopet-backend`

## RF/RNF relacionados

| ID | Cobertura nesta spec |
|----|----------------------|
| RF0009 / RF0010 | Fundação do canal web da ONG |
| RNF0006 | App sobe em viewport desktop e estreito (layout base) |
| RNF0002 | URL da API só em `.env` (sem secrets) |

## Contexto técnico (hoje)

| Item | Estado |
|------|--------|
| `adopet-web` | Sem `package.json`, sem `src/` |
| API | `adopet-backend` em `http://localhost:3000` (`GET /health` → `{ "status": "ok" }`) |
| CORS | Backend já usa `cors()` aberto — o browser pode chamar a API no MVP local |
| Papel do web | Somente ONG (`papel: "ong"`). Usuário fica no mobile |

## Stack proposta

| Item | Escolha | Motivo |
|------|---------|--------|
| Bundler | **Vite** | Padrão atual para React; rápido; `.env` com prefixo `VITE_` |
| UI | **React** (componentes funcionais) | Parte 1 / contexto |
| Linguagem | **JavaScript** (não TypeScript) | Alinhado ao backend Node em JS; menor atrito no TCC |
| Router | **react-router-dom** | Rotas `/login` e `/painel` na spec 002 |
| HTTP | **fetch** nativo | Sem Axios nesta fatia; um helper em `src/services/api.js` |
| Estilo | **CSS puro** (arquivo global + CSS Modules nas páginas) | Sem dependência extra; suficiente para o MVP |
| Porta dev | **5173** (padrão Vite) | Não colide com a API na `3000` |

## Contratos

### Variáveis de ambiente

`.env.example`:

```
VITE_API_URL=http://localhost:3000
```

- Nunca commitar `.env`
- O helper HTTP prefixa todas as chamadas com `VITE_API_URL`

### Rotas nesta fatia

| Rota | Página | Comportamento |
|------|--------|----------------|
| `/` | placeholder | Texto “AdoPet — painel da ONG” + link para `/login` (rota ainda dummy) |
| `*` | — | Redirect para `/` |

Login de verdade entra na spec 002. A rota `/painel` fica para a spec 002.

### Fumaça

Com a API no ar:

```bash
curl http://localhost:3000/health
# { "status": "ok" }
```

O web **não** precisa chamar `/health` na UI nesta fatia. O helper `api.js` só precisa existir e exportar `apiUrl()` / `request()`.

## Arquitetura de pastas

```
adopet-web/
├── docs/
├── specs/
├── public/
├── src/
│   ├── pages/           # telas (LoginPage entra na 002)
│   ├── components/      # pedaços reutilizáveis
│   ├── services/        # chamadas HTTP (api.js agora; authService na 002)
│   ├── hooks/           # hooks (auth na 002)
│   ├── App.jsx
│   ├── main.jsx
│   └── styles/
│       └── global.css
├── index.html
├── vite.config.js
├── .env.example
├── .gitignore
└── package.json
```

Scripts: `npm run dev`, `npm run build`, `npm run preview`.

## Decisões técnicas (fechadas na aprovação)

| Item | Escolha |
|------|---------|
| Linguagem | **JavaScript** (não TypeScript) |
| CSS | `global.css` + CSS Modules |
| HTTP | `fetch` + helper `api.js` (sem Axios) |
| Rota do painel | `/painel` (entra na spec 002) |
| Alias `@/` → `src/` | sim, no Vite |
| StrictMode | sim |
| Pasta `context/` | **não** nesta fatia; AuthContext na 002 |

## Pontos abertos para refinamento

Fechados em 2026-08-17:

1. **JavaScript vs TypeScript** — JS (igual backend).
2. **CSS Modules vs Tailwind** — CSS Modules + `global.css`.
3. **Axios vs fetch** — `fetch`.
4. **Nome da rota do painel** — `/painel` (usada de fato na spec 002).

## Critérios de pronto

- [x] Spec aprovada (pontos abertos fechados)
- [x] `npm install` e `npm run dev` sobem o app em `http://localhost:5173`
- [x] Pastas `pages`, `components`, `services`, `hooks` existem
- [x] `.env.example` documenta `VITE_API_URL`
- [x] Sem secrets commitados
- [x] `docs/CONTEXTO-PROJETO.md` atualizado (stack web + decisão Vite)

## Como validar (após implementação)

```bash
cd ~/adopet-web
cp .env.example .env
npm install
npm run dev
# abrir http://localhost:5173 — placeholder visível
```

## Checklist de implementação (após aprovação)

1. `npm create vite@latest` (React + JS) no repo, sem apagar `docs/` / `specs/` / `.cursor/`
2. Pastas combinadas com o contexto
3. Router + placeholder
4. `src/services/api.js` + `.env.example`
5. `global.css` mínimo
6. CONTEXTO
