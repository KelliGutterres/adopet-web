# Spec 002 — Tela de login da ONG (painel web)

> **Status:** aguardando refinamento / aprovação.  
> **Não implementar** até a autora aprovar esta spec **e** a spec 001.  
> Depende de: spec 001 (scaffold Vite + pastas); backend specs 003 (login JWT) e 006 (esqueci senha).  
> **Não altera** o `adopet-backend`.

## Objetivo

Permitir que a **ONG** autentique no painel web com **e-mail e senha**, consumindo `POST /auth/ongs/login`, persistindo o JWT e entrando numa área autenticada mínima (placeholder do painel). Cobre **RF0009**, com usabilidade e responsividade (**RNF0001**, **RNF0006**) e sem expor a senha (**RNF0002**).

Referência visual da Parte 1: **Figura 14** (Web — Autenticação). O print ainda **não** está em `docs/`; o layout abaixo é proposta até a autora anexar o protótipo.

O web é **somente ONG**. Login de `usuario` permanece no mobile (`POST /auth/usuarios/login` **não** é chamado aqui).

## Escopo (esta tarefa)

1. Página de login (`/login`): e-mail, senha, botão Entrar, estados de loading/erro
2. Serviço `authService` → `POST /auth/ongs/login`
3. Persistência do `token` + dados da `ong` no `localStorage`
4. `AuthContext` + rota protegida `/painel` (placeholder) e rota pública `/login`
5. Logout no placeholder (limpa storage; **sem** endpoint de logout — a API não tem)
6. Fluxo **Esqueci minha senha** (tela + `PUT /auth/ongs/senha`), ligado a partir do login — API já existe (backend spec 006)
7. Bootstrap: se houver token, validar com `GET /auth/me`; se `papel !== "ong"` ou 401, deslogar
8. Atualizar `docs/CONTEXTO-PROJETO.md` após aprovação + implementação

## Fora de escopo

- Cadastro de ONG (`POST /auth/ongs/cadastro`) — spec futura
- CRUD / listagem de animais (RF0010 / RF0003) — o `/painel` é só placeholder
- Login de usuário / papéis mistos
- Refresh token, blacklist, cookie httpOnly
- “Lembrar-me” além do `localStorage` (JWT já expira em `7d` no backend)
- Rate limiting / captcha / OAuth
- Alterar CORS, envelope de erro ou contratos da API
- Anexar a Figura 14 (opcional; pode entrar em `docs/` se a autora fornecer)
- Testes automatizados

## RF/RNF relacionados

| ID | Cobertura nesta spec |
|----|----------------------|
| RF0009 | Login e-mail/senha no painel da ONG |
| RF0001 | **Não** — cadastro/edição de conta |
| RNF0001 | Formulário claro, erros em PT-BR, loading no botão |
| RNF0002 | Senha só no body da API; nunca logada; token só no cliente |
| RNF0006 | Layout usável em desktop e viewport estreito (~360px) |

## Contexto técnico (API já pronta)

Base: `VITE_API_URL` (ex.: `http://localhost:3000`).  
Envelope de erro: `{ "error": { "message": "..." } }`.  
CORS aberto no backend (`app.use(cors())`).

### `POST /auth/ongs/login`

**Body**

```json
{
  "email": "ong@adopet.local",
  "senha": "senha123"
}
```

**200**

```json
{
  "ong": {
    "idInstituicao": 1,
    "nome": "ONG AdoPet Demo",
    "email": "ong@adopet.local",
    "idCidade": 1,
    "cidade": { "idCidade": 1, "nome": "Lajeado", "uf": "RS" }
  },
  "token": "<jwt>"
}
```

JWT (claim): `{ "sub": idInstituicao, "papel": "ong", "email": "..." }` — HS256, expiração `JWT_EXPIRES_IN` (hoje `7d`).

**401** — `{ "error": { "message": "Credenciais inválidas" } }`  
(e-mail inexistente, senha errada ou body vazio — mensagem genérica; **não** distinguir se o e-mail existe).

### `GET /auth/me`

Header: `Authorization: Bearer <token>`  
**200:** `{ "id", "papel", "email" }`  
**401:** token ausente, inválido ou expirado.

Usar no bootstrap para recusar token de `usuario` colado no storage.

### `PUT /auth/ongs/senha` (esqueci senha)

Público, sem JWT.

```json
{
  "email": "ong@adopet.local",
  "senha": "novaSenha123"
}
```

| Status | Quando |
|--------|--------|
| `204` | Hash atualizado; corpo vazio |
| `400` | E-mail inválido; senha ausente ou &lt; 6 caracteres |
| `404` | `{ "error": { "message": "E-mail não encontrado" } }` |

`senhaConfirmacao` **não** vai na API. O web compara os dois campos e só dispara o `PUT` se forem iguais.

Seed local (backend spec 004): `ong@adopet.local` / `senha123`.

## Fluxos

### Login

```
ONG                         Web                         API
 |                           |                           |
 |  e-mail + senha           |                           |
 |-------------------------->|  POST /auth/ongs/login    |
 |                           |-------------------------->|
 |                           |  200 { ong, token }       |
 |                           |<--------------------------|
 |                           |  localStorage             |
 |  redirect /painel         |                           |
 |<--------------------------|                           |
```

### Já autenticada

1. App sobe → lê `localStorage`.
2. Sem token → rotas privadas redirecionam para `/login`.
3. Com token → `GET /auth/me`. Se `papel === "ong"` → sessão ok. Senão (401 ou `usuario`) → limpar storage e ir para `/login`.

### Esqueci senha

```
ONG                         Web                         API
 |  /login → link            |                           |
 |  /esqueci-senha           |                           |
 |  e-mail + senha + confirm |                           |
 |-------------------------->|  PUT /auth/ongs/senha     |
 |                           |-------------------------->|
 |                           |  204                      |
 |                           |<--------------------------|
 |  mensagem + link /login   |                           |
```

Depois a ONG entra de novo com a senha nova (a API **não** devolve JWT no `PUT`).

**Limitação herdada da spec 006 (MVP TCC):** quem souber o e-mail da ONG redefine a senha. Sem e-mail/SMTP. Documentar na UI de forma discreta **não** é necessário; não expor essa limitação na tela.

## Contrato de UI

Idioma: **PT-BR**. Identificadores de código em inglês.

### Rotas

| Rota | Auth | Tela |
|------|------|------|
| `/login` | pública; se já logada → `/painel` | Login |
| `/esqueci-senha` | pública | Redefinir senha |
| `/painel` | exige sessão ONG | Placeholder (“Olá, {nome}” + Sair) |
| `/` | — | Redirect: logada → `/painel`; senão → `/login` |

### Login — campos e copy (proposta)

| Elemento | Copy proposta |
|----------|----------------|
| Título | Entrar no painel |
| Subtítulo | Área exclusiva para ONGs |
| E-mail | placeholder “E-mail” |
| Senha | placeholder “Senha”; `type="password"` |
| Submit | Entrar |
| Loading | botão desabilitado; texto “Entrando…” |
| Link | Esqueci minha senha → `/esqueci-senha` |
| Erro API 401 | Credenciais inválidas |
| Erro de rede | Não foi possível conectar à API. Verifique se o backend está no ar. |
| Validação local | Informe um e-mail válido / A senha deve ter no mínimo 6 caracteres |

Não incluir link “Criar conta” nesta fatia.

### Esqueci senha — campos e copy (proposta)

| Elemento | Copy proposta |
|----------|----------------|
| Título | Redefinir senha |
| E-mail | obrigatório |
| Nova senha | mínimo 6 |
| Confirmar senha | deve coincidir (só no cliente) |
| Submit | Salvar nova senha |
| Sucesso | Senha atualizada. Faça login com a nova senha. + link para `/login` |
| Senhas diferentes | As senhas não coincidem |
| 404 | E-mail não encontrado |
| Voltar | Voltar ao login |

### Layout (proposta até existir Figura 14)

- Página cheia, card centralizado (máx. ~400px), fundo claro.
- Paleta simples: fundo `#F7F4EF`, destaque `#2F6F4E` (botão), texto `#1F1F1F`.
- Logo textual “AdoPet” no topo do card (sem asset obrigatório).
- Empilhar campos em coluna; botão 100% da largura do card.
- Viewport estreito: card com padding, sem scroll horizontal.

Se a autora anexar a Figura 14, **esta seção cede** ao protótipo (cores, logo, disposição).

### Acessibilidade mínima

- `<form>` com submit via Enter
- `<label>` associado a cada input (ou `aria-label`)
- Erro da API em região visível (`role="alert"`)
- Foco visível nos campos

## Persistência e sessão

Chaves propostas:

| Chave | Valor |
|-------|--------|
| `adopet.token` | string JWT |
| `adopet.ong` | JSON da `ong` pública (sem senha) |

- **Não** guardar a senha.
- Header das próximas chamadas (CRUD futuro): `Authorization: Bearer ${token}` — o helper `api.js` da spec 001 ganha injeção do token nesta fatia.
- Logout: `removeItem` nas duas chaves + navigate `/login`.
- Token de `usuario` no storage **nunca** libera o painel.

## Arquitetura de código

Camadas web (contexto): **pages / components / services / hooks**.

```
src/
  pages/
    LoginPage.jsx
    ForgotPasswordPage.jsx
    PainelPage.jsx          # placeholder
  components/
    ProtectedRoute.jsx
  services/
    api.js                  # + Bearer token
    authService.js          # loginOng, redefinirSenhaOng, me
  hooks/                    # se fizer sentido (ex.: useAuth)
  context/
    AuthContext.jsx         # session, login, logout, bootstrap
  App.jsx                   # rotas
```

Fluxo: página → `useAuth` / context → `authService` → `api.js` (`fetch`) → backend.

## Regras de negócio (cliente)

1. Chamar **somente** `/auth/ongs/*` e `GET /auth/me`.
2. Validar e-mail/senha no cliente **antes** do POST (menos round-trip); a API continua sendo a fonte da verdade.
3. Exibir `error.message` da API quando houver; fallback genérico se o JSON não vier.
4. Não logar `senha` nem o JWT no `console` em produção; no MVP, evitar `console.log` do token.
5. Credencial de **usuário** no formulário da ONG → 401 “Credenciais inválidas” (comportamento correto da API).
6. Após `PUT` de senha, **não** autenticar automaticamente — voltar ao login.

## Decisões técnicas (propostas)

| Item | Proposta | Refinar? |
|------|----------|----------|
| Storage | `localStorage` (casa com JWT `7d`) | sim — `sessionStorage`? |
| Esqueci senha | **nesta** spec (link no login) | sim — adiar? |
| Cadastro ONG | **fora** (spec seguinte) | sim |
| Pós-login | `/painel` placeholder | sim — já listar animais? |
| Visual | card + paleta acima até ter Fig. 14 | sim |
| Context vs Redux | `AuthContext` | |
| “Mostrar senha” | olho no input | sim — incluir? |

## Pontos abertos para refinamento

1. **Figura 14** — seguir o protótipo da Parte 1 ou a paleta desta spec até anexar o print?
2. **Esqueci senha agora ou depois?** — proposta: agora (API pronta; fluxo começa no login).
3. **Cadastro de ONG no web nesta fatia?** — proposta: não (login primeiro).
4. **`localStorage` vs `sessionStorage`** — proposta: `localStorage`.
5. **Placeholder vs já entrar no CRUD de animais** — proposta: placeholder; CRUD = spec 003.
6. **Mostrar/ocultar senha** — proposta: sim (usabilidade).
7. Copy dos títulos/botões — ajustar se a banca/protótipo usar outros textos.

## Critérios de pronto

- [ ] Spec aprovada (pontos 1–7 fechados)
- [ ] Spec 001 já implementada
- [ ] Login com `ong@adopet.local` / `senha123` entra no `/painel`
- [ ] Senha errada ou e-mail de usuário → mensagem “Credenciais inválidas”, permanece em `/login`
- [ ] Token e `ong` no `localStorage`; senha nunca persistida
- [ ] Recarregar a página autenticada mantém a sessão (token válido)
- [ ] Token expirado / `papel !== "ong"` → volta ao login
- [ ] `/painel` sem token redireciona para `/login`
- [ ] Esqueci senha: `PUT` 204 + login posterior com a senha nova
- [ ] Layout usável em largura estreita
- [ ] Backend intocado
- [ ] CONTEXTO atualizado (checklist RF0009 web)

## Como validar (após implementação)

Pré-requisito: API + seed (`npm run prisma:seed` no backend).

```bash
# terminal 1
cd ~/adopet-backend && npm run dev

# terminal 2
cd ~/adopet-web && npm run dev
```

1. Abrir `http://localhost:5173` → `/login`
2. Entrar com `ong@adopet.local` / `senha123` → `/painel` com o nome da ONG
3. Recarregar → continua no painel
4. Sair → volta ao login; storage limpo
5. Tentar `usuario@adopet.local` / `senha123` → erro de credenciais
6. Esqueci senha da ONG → nova senha → login com a nova funciona
7. Parar o backend e clicar Entrar → mensagem de falha de rede

## Checklist de implementação (após aprovação)

1. `authService` + Bearer no `api.js`
2. `AuthContext` (login, logout, bootstrap `/auth/me`)
3. `LoginPage` + estilos (CSS Module)
4. `ForgotPasswordPage`
5. `PainelPage` placeholder + `ProtectedRoute`
6. Rotas em `App.jsx`
7. CONTEXTO (checklist web RF0009; decisão na tabela §8)
