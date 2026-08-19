# Spec 006 — Esqueci a senha da ONG (painel web)

> **Status:** aprovada e implementada.  
> Depende de: spec 002 (sessão JWT + `authService.redefinirSenhaOng`); spec 004 (`AuthLayout`); spec 005 (`Cadastre-se` ativo); backend spec 006 (`PUT /auth/ongs/senha`).  
> **Não altera** o `adopet-backend`.  
> **Não altera** cadastro nem listagem do painel.

## Objetivo

Refinar a tela **Esqueceu sua senha?** do painel web para que o fluxo de redefinir senha da **ONG** fique no mesmo padrão visual e de copy de `/login` e `/cadastro`, consumindo `PUT /auth/ongs/senha`. Após sucesso, a ONG **não** entra autenticada: volta **imediatamente** ao login e entra com a senha nova (**RF0009**). Cobre usabilidade e responsividade (**RNF0001**, **RNF0006**) e senha só no body da API (**RNF0002**).

O web continua **somente ONG**. Recuperação de `usuario` permanece no mobile.

A Parte 1 **não** tem RF próprio de “recuperar senha”; o contrato da API já existe (backend spec 006). Esta fatia só **policia a UI** do fluxo que o login já aponta.

## O que já existe (não reinventar)

A spec 002 já entregou uma primeira versão funcional. Esta spec **não** cria o fluxo do zero: alinha UX, copy e detalhes que ficaram aquém do cadastro (spec 005).

| Já pronto | Onde |
|-----------|------|
| API `PUT /auth/ongs/senha` (público, 204 / 400 / 404) | backend spec 006 |
| Rota `/esqueci-senha` + `ForgotPasswordPage` | spec 002 + shell da spec 004 |
| Link no login “Esqueceu sua senha?” | spec 004 |
| `authService.redefinirSenhaOng` + tratamento de `204` no `api.js` | spec 002 |
| Header Cadastre-se ativo no shell de auth | spec 005 |

### Lacunas que esta spec fecha

1. Copy/botão no mínimo da spec 002 (“Redefinir senha” / “Salvar nova senha”), sem ícone no submit.
2. `/esqueci-senha` **não** usava `PublicOnlyRoute`.
3. Sucesso ficava numa tela intermediária; a autora pediu **redirect imediato** ao login.
4. E-mail digitado no login não ia junto para a recuperação.
5. Não havia spec web dedicada: o fluxo ficou misturado na spec 002.

## Referência visual

Não há print de “esqueci senha” na Parte 1 (Figura 14 é autenticação/login). Fonte de layout: o shell já implementado.

| Arquivo / spec | Uso nesta spec |
|----------------|----------------|
| [login-web.png](../docs/prototipos/login-web.png) | Identidade do cartão split (marca + formulário); o print só tem o **link** “Esqueceu sua senha?” |
| Spec 004 | `AuthLayout`, campos com ícone, paleta `--painel-*`, Inter |
| Spec 002 | Contrato de API, mensagens de erro, regra de não autenticar após o `PUT` |
| Spec 005 | Header contextual (Cadastre-se / Entrar) |

A tela **não** inventa um layout novo: mesma marca à esquerda, mesmo painel branco à direita, mesmos tokens e componentes de campo.

## Escopo (esta tarefa)

1. Refinar `ForgotPasswordPage` no `AuthLayout`: um único form (e-mail, nova senha, confirmar senha), submit com ícone cadeado
2. Envolver `/esqueci-senha` em `PublicOnlyRoute` (ONG logada → `/painel`)
3. Manter `authService.redefinirSenhaOng` → `PUT /auth/ongs/senha` (`{ email, senha }`; sem `senhaConfirmacao`)
4. Sucesso **204**: redirect **imediato** para `/login` (sem tela intermediária; mensagem de confirmação no login)
5. Prefill do e-mail a partir do login (`?email=`), campo **editável**
6. Validação local alinhada à API (e-mail, mínimo 6, senhas iguais)
7. Atualizar `docs/CONTEXTO-PROJETO.md` após aprovação + implementação

## Fora de escopo

- Alterar o `adopet-backend` (contrato, SMTP, token de reset, OTP, envelope)
- Recuperação de `usuario` / `PUT /auth/usuarios/senha` (mobile)
- Troca de senha **logada** (perfil: senha atual + nova)
- Envio real de e-mail / link mágico
- Login automático após o `PUT` (a API não devolve JWT de propósito)
- Invalidar JWTs já emitidos
- Captcha, rate limit
- CRUD de animais
- Testes automatizados

## RF/RNF relacionados

| ID | Cobertura nesta spec |
|----|----------------------|
| RF0009 | ONG volta a autenticar no painel depois de redefinir a senha |
| RF0002 | **Não** — recuperação de usuário (mobile) |
| RF0001 | **Parcial** — só o campo senha; não é edição de perfil |
| RNF0001 | Mesmo padrão das outras telas de auth; erros em PT-BR |
| RNF0002 | Senha só no body; nunca persistida; hash continua no backend |
| RNF0006 | Mesmo comportamento responsivo da spec 004 |

## Contexto técnico (API já pronta)

Base: `VITE_API_URL`.  
Envelope de erro: `{ "error": { "message": "..." } }`.  
CORS aberto. Rota **pública** (sem JWT).

### `PUT /auth/ongs/senha`

Contrato vigente (backend spec 006). **Não** enviar `senhaConfirmacao`.

**Body**

```json
{
  "email": "ong@adopet.local",
  "senha": "novaSenha123"
}
```

| Campo | Regra da API |
|-------|----------------|
| `email` | obrigatório; trim + lowercase no backend |
| `senha` | obrigatória; mínimo **6** caracteres |
| `senhaConfirmacao` | **não** existe na API — só no cliente |

**204** No Content — corpo vazio; hash atualizado. O `api.js` já trata `204` (`requestJson` retorna `null`).

| Status | Quando | `error.message` (hoje) |
|--------|--------|-------------------------|
| `400` | validação | E-mail inválido / Senha deve ter no mínimo 6 caracteres / … |
| `404` | e-mail não encontrado em `Instituicao` | E-mail não encontrado |

E-mail de **usuário** (mobile) **não** redefine a ONG: unique é por tabela. `usuario@adopet.local` no painel → **404**. Comportamento correto; o web não tenta adivinhar o papel.

**Limitação herdada (MVP TCC):** quem souber o e-mail da ONG redefine a senha. Sem SMTP. **Não** expor isso na UI.

Seed local: `ong@adopet.local` / `senha123` (a senha da seed muda depois do `PUT` até um novo seed).

## Fluxo

```
ONG                         Web                         API
 |                           |                           |
 |  /login (e-mail preenchido)|                          |
 |  Esqueceu sua senha?      |                           |
 |  /esqueci-senha?email=…   |                           |
 |  e-mail (editável)        |                           |
 |  + senha + confirm        |                           |
 |-------------------------->|  PUT /auth/ongs/senha     |
 |                           |-------------------------->|
 |                           |  204 (vazio)              |
 |                           |<--------------------------|
 |  redirect imediato /login |                           |
 |  (aviso de senha ok)      |                           |
 |  POST /auth/ongs/login    |                           |
 |  (e-mail + senha nova)    |                           |
```

Não há tela intermediária de “senha atualizada”: o `204` navega na hora para `/login`. A confirmação aparece no login (`location.state`), para a ONG não ficar sem feedback.

Após o `PUT`, **não** chamar `saveSession` / `login`. A ONG precisa autenticar de novo — isso valida o fluxo ponta a ponta.

## Contrato de UI

Idioma: **PT-BR**. Identificadores de código em inglês.

### Rotas

| Rota | Auth | Tela |
|------|------|------|
| `/login` | pública; se já logada → `/painel` | Link “Esqueceu sua senha?” → `/esqueci-senha` (com `?email=` se houver e-mail digitado) |
| `/cadastro` | pública; se já logada → `/painel` | inalterado |
| `/esqueci-senha` | pública; se já logada → `/painel` | Redefinir senha da ONG |
| `/painel` | exige sessão ONG | inalterado |
| `/` | — | inalterado |

### Header do `AuthLayout`

Igual login (spec 005): “Não tem uma conta?” + **Cadastre-se** → `/cadastro`.

Não criar variante nova. Nota de segurança no rodapé permanece.

### Esqueci senha — campos e copy

| Elemento | Copy |
|----------|------|
| Título | Esqueceu a senha? |
| Subtítulo | Informe o e-mail da ONG e escolha uma nova senha |
| E-mail | label “E-mail”; placeholder “Digite seu e-mail”; mesmo `TextField` do login; **pré-preenchido** se vier `?email=`; **editável** |
| Nova senha | label “Nova senha”; placeholder “Digite a nova senha”; `PasswordField` + olho; `autoComplete="new-password"` |
| Confirmar senha | label “Confirmar senha”; `PasswordField`; placeholder “Confirme a nova senha”; `autoComplete="new-password"` |
| Submit | Redefinir senha (+ ícone cadeado); loading “Redefinindo…” |
| Link extra (form) | Voltar ao login → `/login` |
| Sucesso | redirect imediato; no login: “Senha atualizada. Faça login com a nova senha.” |
| Erro 404 | E-mail não encontrado |
| Erro 400 | `error.message` da API |
| Erro de rede | Não foi possível conectar à API. Verifique se o backend está no ar. |
| Validação local | ver tabela abaixo |

O link do login permanece **“Esqueceu sua senha?”** (spec 004 / print). Não mudar o texto.

### Prefill do e-mail

- No login, o link monta `/esqueci-senha?email=` + e-mail digitado (trim + `encodeURIComponent`). Sem e-mail → `/esqueci-senha`.
- `ForgotPasswordPage` lê `useSearchParams().get('email')` e inicia o campo com esse valor.
- A ONG **pode alterar** o e-mail antes do `PUT`.
- “Voltar ao login” devolve o e-mail atual (query ou state), para não perder o que já estava no campo.
- Após o `204`, o login recebe o e-mail usado no `PUT` via `location.state` (pré-preenche o campo de login).

### Validação no cliente (antes do PUT)

| Condição | Mensagem |
|----------|----------|
| E-mail inválido | Informe um e-mail válido |
| Senha &lt; 6 | A senha deve ter no mínimo 6 caracteres |
| Senhas diferentes | As senhas não coincidem |

A API continua sendo a fonte da verdade. Senhas diferentes **não** disparam o `PUT`.

### Layout

- Reutilizar `AuthLayout` (split, onda, foto, tokens `--painel-*`, Inter).
- Formulário ~400px, centrado na coluna direita — igual login.
- **Um único form** com três campos empilhados; viewport baixa: o painel do form **pode rolar** internamente; sem scroll horizontal.
- Viewport estreito (~360px): mesma regra da spec 004.
- Ícones: SVG inline em `AuthIcons.jsx`. Reutilizar `LockIcon` no submit. Sem lib nova.

### Pós-sucesso (204)

- **Redirect imediato** para `/login` (`replace: true`).
- Sem tela de sucesso em `/esqueci-senha` (sem botão “Ir para o login”, sem timer).
- `navigate('/login', { replace: true, state: { senhaAtualizada: true, email } })`.
- Login exibe a mensagem com `role="status"` e pré-preenche o e-mail. A senha do login fica vazia.

### Acessibilidade mínima

Igual spec 002/004/005: `<form>`, `<label>`, `role="alert"` no erro, `role="status"` no aviso do login, foco visível, olho com `aria-label`. Links com texto visível.

## Persistência e sessão

**Não** gravar `adopet.token` nem `adopet.ong` neste fluxo.

- Logout, bootstrap `GET /auth/me` e recusa de `papel !== "ong"` **inalterados**.
- Se a ONG já estiver autenticada e abrir `/esqueci-senha`, `PublicOnlyRoute` manda para `/painel`. Troca de senha logada é outra spec.

## Arquitetura de código

```
src/
  pages/
    ForgotPasswordPage.jsx  # copy, ícone no submit, prefill ?email=, redirect 204
    LoginPage.jsx           # link com ?email=; aviso + e-mail via location.state
  components/
    AuthLayout.jsx          # inalterado (variante login = Cadastre-se)
    AuthIcons.jsx           # reutilizar LockIcon
    TextField.jsx           # inalterado
    PasswordField.jsx       # inalterado
  services/
    authService.js          # redefinirSenhaOng já existe
  App.jsx                   # /esqueci-senha dentro de PublicOnlyRoute
```

Fluxo: `ForgotPasswordPage` → `authService.redefinirSenhaOng` → `api.js` (`fetch`) → `PUT /auth/ongs/senha`.

O body enviado **não** inclui `senhaConfirmacao`. Não precisa passar pelo `AuthContext` (não há sessão a salvar).

## Regras de negócio (cliente)

1. Chamar **somente** `PUT /auth/ongs/senha` (além das rotas de auth já usadas no restante do app).
2. Validar no cliente **antes** do PUT; a API valida de novo.
3. Exibir `error.message` da API; fallback genérico se o JSON não vier.
4. Não logar senha nem JWT.
5. Após 204, **não** autenticar — redirect imediato ao login; a ONG entra com a senha nova.
6. E-mail da seed (`ong@adopet.local`) redefine a senha da ONG demo; e-mail de usuário (`usuario@adopet.local`) → 404.
7. JWTs antigos dessa ONG continuam válidos até expirar (limitação da API; fora de escopo).

## Decisões técnicas (fechadas na aprovação — 2026-08-19)

| Item | Escolha |
|------|---------|
| Rota | `/esqueci-senha` (já existe) |
| Layout | mesmo `AuthLayout` da spec 004 (variante login) |
| Copy | desta spec (título “Esqueceu a senha?”, botão Redefinir senha) |
| Passos | um único formulário |
| Pós-sucesso | redirect imediato para `/login` (aviso no login; sem JWT) |
| Confirmar senha | sim, só no cliente |
| PublicOnlyRoute | sim (já logada → `/painel`) |
| Prefill e-mail | sim (`?email=` do login); campo editável |
| Ícone no submit | sim (`LockIcon`) |
| SMTP / token | não (API opção A) |
| Backend | intocado |

## Critérios de pronto

- [x] Spec aprovada (pontos 1–6 fechados em 2026-08-19)
- [x] `/esqueci-senha` no mesmo shell de login (marca + formulário)
- [x] “Esqueceu sua senha?” no login leva o e-mail digitado (`?email=`); o campo continua editável
- [x] ONG já autenticada em `/esqueci-senha` vai para `/painel`
- [x] `PUT` 204 → redirect imediato a `/login` com aviso; login posterior com a senha nova entra no painel
- [x] Login com a senha antiga falha após o `PUT`
- [x] E-mail de usuário (`usuario@adopet.local`) → “E-mail não encontrado”
- [x] Senhas diferentes → não chama a API
- [x] Senha nunca no `localStorage`
- [x] Viewport ~360px usável, sem overflow horizontal
- [x] Backend intocado
- [x] CONTEXTO atualizado

## Como validar (após implementação)

Pré-requisito: API + seed no ar.

```bash
# terminal 1
cd ~/adopet-backend && npm run dev

# terminal 2
cd ~/adopet-web && npm run dev
```

1. `/login` → digitar um e-mail → Esqueceu sua senha? → `/esqueci-senha` com o e-mail preenchido (editável)
2. Redefinir `ong@adopet.local` para uma senha nova (≥ 6) → cai no `/login` na hora, com aviso
3. Entrar com a senha **antiga** (`senha123`) → “Credenciais inválidas”
4. Entrar com a senha **nova** → `/painel`
5. Repetir com `usuario@adopet.local` na tela de esqueci senha → 404 (permanece na tela)
6. Senhas diferentes → mensagem local, Network sem PUT
7. Logada no painel, abrir `/esqueci-senha` → redireciona para `/painel`
8. Largura ~360px: formulário usável

> Depois do teste, se quiser a seed de volta: `npm run prisma:seed` no backend.

## Checklist de implementação (após aprovação)

1. Spec 006 + índice em `specs/README.md`
2. `ForgotPasswordPage`: copy, ícone, prefill `?email=`, redirect 204
3. `LoginPage`: link com e-mail; aviso + prefill via `location.state`
4. `PublicOnlyRoute` em `/esqueci-senha` (`App.jsx`)
5. CONTEXTO (checklist web; decisão na tabela §8)
