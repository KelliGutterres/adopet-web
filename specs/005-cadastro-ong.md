# Spec 005 — Cadastro da ONG (painel web)

> **Status:** aprovada e implementada.  
> Depende de: spec 002 (sessão JWT + `AuthContext`); spec 004 (`AuthLayout`); backend specs 003 (cadastro ONG) e 007 (`cidade` inline).  
> **Não altera** o `adopet-backend`.  
> **Não altera** listagem do painel (spec 003).

## Objetivo

Ativar o **Cadastre-se** do login e permitir que uma **ONG** crie conta no painel web, consumindo `POST /auth/ongs/cadastro`. A tela usa o **mesmo shell visual** de `/login` e `/esqueci-senha` (spec 004). Após sucesso, a ONG entra no painel já autenticada (a API devolve JWT).

Cobre a entrada no painel após cadastro (**RF0009** no pós-cadastro), usabilidade e responsividade (**RNF0001**, **RNF0006**) e senha só no body da API (**RNF0002**).

O web continua **somente ONG**. Cadastro de `usuario` permanece no mobile.

A Parte 1 **não** tem RF próprio de “cadastrar ONG”; o contrato da API já existe. Esta fatia só expõe esse fluxo na UI.

## Referência visual

Não há print de cadastro web na Parte 1 (Figura 14 é autenticação/login). Fonte de layout: o shell já implementado.

| Arquivo / spec | Uso nesta spec |
|----------------|----------------|
| [login-web.png](../docs/prototipos/login-web.png) | Identidade do cartão split (marca + formulário) |
| Spec 004 | `AuthLayout`, campos com ícone, paleta `--painel-*`, Inter |
| Spec 002 | Sessão (`localStorage`), `PublicOnlyRoute`, erros em PT-BR |

O cadastro **não** inventa um layout novo: mesma marca à esquerda, mesmo painel branco à direita, mesmos tokens e componentes de campo.

## Escopo (esta tarefa)

1. Rota pública `/cadastro` (se já autenticada → `/painel`, igual ao login)
2. Página `RegisterPage` no `AuthLayout`: nome da ONG, e-mail, cidade, UF, senha, confirmar senha
3. `authService.cadastrarOng` → `POST /auth/ongs/cadastro` com `cidade: { nome, uf }` (sem `idCidade`)
4. Sucesso **201**: persistir `token` + `ong` no `localStorage` (mesmo contrato do login) e ir para `/painel`
5. Ativar **Cadastre-se** no header do `AuthLayout` (hoje desabilitado / “Em breve”)
6. No cadastro, o header inverte: “Já tem uma conta?” + **Entrar** → `/login`
7. Validação local alinhada à API; `senhaConfirmacao` só no cliente
8. Atualizar `docs/CONTEXTO-PROJETO.md` após aprovação + implementação

## Fora de escopo

- Alterar o `adopet-backend` (contrato, validação, envelope)
- Cadastro de `usuario` / `POST /auth/usuarios/cadastro`
- CNPJ, telefone/contato, endereço, logo, documento — **não existem** no model `Instituicao`
- Edição de perfil da ONG
- Autocomplete de cidade (`GET /cidades`) — spec futura; aqui o nome é texto livre
- OAuth (Google/Apple)
- E-mail de confirmação / SMTP
- Captcha, rate limit
- CRUD de animais
- Testes automatizados

## RF/RNF relacionados

| ID | Cobertura nesta spec |
|----|----------------------|
| RF0009 | Pós-cadastro a ONG fica autenticada e acessa o painel |
| RF0001 | **Não** — cadastro de usuário (mobile) |
| RNF0001 | Formulário no mesmo padrão das outras telas de auth; erros em PT-BR |
| RNF0002 | Senha só no body; nunca persistida; hash continua no backend |
| RNF0006 | Mesmo comportamento responsivo da spec 004 |

## Contexto técnico (API já pronta)

Base: `VITE_API_URL`.  
Envelope de erro: `{ "error": { "message": "..." } }`.  
CORS aberto. Cadastro **público** (sem JWT).

### `POST /auth/ongs/cadastro`

Contrato vigente (backend spec 003 + 007). **Não** enviar `idCidade`.

**Body**

```json
{
  "nome": "ONG Amigos Pets",
  "email": "contato@ong.org",
  "senha": "senha123",
  "cidade": { "nome": "Lajeado", "uf": "RS" }
}
```

| Campo | Regra da API |
|-------|----------------|
| `nome` | obrigatório; trim; `Instituicao.nome` até 100 chars |
| `email` | obrigatório; formato e-mail; gravado em minúsculas; unique |
| `senha` | obrigatória; mínimo **6** caracteres |
| `cidade.nome` | obrigatório; trim; 1–60 chars |
| `cidade.uf` | obrigatório; 2 letras; gravado maiúsculo (ex.: `RS`) |
| `senhaConfirmacao` | **não** existe na API — só no cliente |
| `idCidade` | **proibido** — 400 se enviado |

Find-or-create (spec 007): se a cidade já existir (`nome` case-insensitive + `uf`), reutiliza; senão cria (`pais` = `"Brasil"`, `endereco` = `"-"`).

**201**

```json
{
  "ong": {
    "idInstituicao": 2,
    "nome": "ONG Amigos Pets",
    "email": "contato@ong.org",
    "idCidade": 1,
    "cidade": { "idCidade": 1, "nome": "Lajeado", "uf": "RS" }
  },
  "token": "<jwt>"
}
```

JWT igual ao login: `{ "sub": idInstituicao, "papel": "ong", "email": "..." }`.

| Status | Quando | `error.message` (hoje) |
|--------|--------|-------------------------|
| `400` | validação | Nome é obrigatório / E-mail inválido / Senha deve ter no mínimo 6 caracteres / cidade é obrigatória / uf inválido (use 2 letras, ex.: RS) / … |
| `409` | e-mail já em `Instituicao` | E-mail já cadastrado |

E-mail de **usuário** (mobile) **não** colide com ONG: unique é por tabela. O mesmo endereço pode existir nos dois papéis — comportamento herdado da API; o web não tenta impedir.

## Fluxo

```
ONG                         Web                         API
 |                           |                           |
 |  /login → Cadastre-se     |                           |
 |  /cadastro                |                           |
 |  nome + email + cidade    |                           |
 |  + uf + senha + confirm   |                           |
 |-------------------------->|  POST /auth/ongs/cadastro |
 |                           |-------------------------->|
 |                           |  201 { ong, token }       |
 |                           |<--------------------------|
 |                           |  saveSession (igual login)|
 |  redirect /painel         |                           |
 |<--------------------------|                           |
```

Não há tela intermediária de “cadastro ok, faça login”: a API já autentica. Isso é o mesmo padrão do backend spec 003 (“Cadastro retorna token”).

## Contrato de UI

Idioma: **PT-BR**. Identificadores de código em inglês.

### Rotas

| Rota | Auth | Tela |
|------|------|------|
| `/login` | pública; se já logada → `/painel` | Login — Cadastre-se **ativo** → `/cadastro` |
| `/cadastro` | pública; se já logada → `/painel` | Cadastro da ONG |
| `/esqueci-senha` | pública | Redefinir senha — Cadastre-se também ativo |
| `/painel` | exige sessão ONG | inalterado |
| `/` | — | inalterado |

### Header do `AuthLayout` (contextual)

O botão do canto superior direito deixa de ser fixo/desabilitado. O shell recebe uma variante:

| Tela | Hint | Ação |
|------|------|------|
| `/login`, `/esqueci-senha` | Não tem uma conta? | **Cadastre-se** → `/cadastro` (Link estilizado como o botão atual) |
| `/cadastro` | Já tem uma conta? | **Entrar** → `/login` |

Nota de segurança no rodapé permanece: “Seus dados estão protegidos com segurança.”

### Cadastro — campos e copy

| Elemento | Copy |
|----------|----------------|
| Título | Crie a conta da ONG |
| Subtítulo | Preencha os dados da instituição para acessar o painel |
| Nome | label “Nome da ONG”; placeholder “Digite o nome da instituição”; ícone predio/pata |
| E-mail | label “E-mail”; placeholder “Digite seu e-mail”; mesmo `TextField` do login |
| Cidade | label “Cidade”; placeholder “Ex.: Lajeado”; ícone de mapa |
| UF | label “UF”; texto livre, 2 letras; placeholder “Ex.: RS” |
| Senha | label “Senha”; placeholder “Crie uma senha”; `PasswordField` + olho |
| Confirmar senha | label “Confirmar senha”; `PasswordField`; `autoComplete="new-password"` |
| Submit | Cadastrar (+ ícone); loading “Cadastrando…” |
| Link extra | Já tem conta? Entrar — o header já cobre; no rodapé do form **não** repetir, para não duplicar o login |
| Erro 409 | E-mail já cadastrado |
| Erro 400 | `error.message` da API |
| Erro de rede | Não foi possível conectar à API. Verifique se o backend está no ar. |
| Validação local | ver tabela abaixo |

### Validação no cliente (antes do POST)

| Condição | Mensagem |
|----------|----------|
| Nome vazio (após trim) | Informe o nome da ONG |
| E-mail inválido | Informe um e-mail válido |
| Cidade vazia | Informe a cidade |
| UF inválida | Informe a UF (2 letras, ex.: RS) |
| Senha &lt; 6 | A senha deve ter no mínimo 6 caracteres |
| Senhas diferentes | As senhas não coincidem |

A API continua sendo a fonte da verdade.

### Layout

- Reutilizar `AuthLayout` (split, onda, foto, tokens `--painel-*`, Inter).
- Formulário ~400px, centrado na coluna direita — igual login.
- Mais campos que o login: o painel do form **pode rolar** internamente se a viewport for baixa; a página não ganha scroll horizontal.
- Cidade e UF na **mesma linha** (cidade flex-grow; UF ~88px / 5rem) para não esticar demais a coluna.
- Viewport estreito (~360px): mesma regra da spec 004 (marca compacta; cidade+UF podem empilhar se a linha ficar apertada).
- Ícones: SVG inline em `AuthIcons.jsx`. Sem lib nova.
- UF é **texto** (2 letras), não select; mesmo visual dos outros inputs. O cliente normaliza para maiúsculas antes do POST.

### Acessibilidade mínima

Igual spec 002/004: `<form>`, `<label>`, `role="alert"`, foco visível, olho com `aria-label`. Links do header com texto visível (não só ícone).

## Persistência e sessão

Reutilizar `saveSession` / `AuthContext` da spec 002.

| Chave | Valor |
|-------|--------|
| `adopet.token` | JWT do **201** |
| `adopet.ong` | JSON da `ong` pública (inclui `cidade`; sem senha) |

Proposta: extrair um `setSession({ token, ong })` no `AuthContext` (ou um método `cadastrar` que chama o mesmo `saveSession` do `login`) para não duplicar persistência.

- **Não** guardar a senha.
- Logout, bootstrap `GET /auth/me` e recusa de `papel !== "ong"` **inalterados**.

## Arquitetura de código

```
src/
  components/
    AuthLayout.jsx          # + variante header (cadastro vs login)
    AuthLayout.module.css   # botão Cadastre-se deixa de ser disabled
    AuthForm.module.css     # row cidade+UF
    AuthIcons.jsx           # ícones novos (prédio / pin)
    TextField.jsx           # inalterado
    PasswordField.jsx       # inalterado
  pages/
    RegisterPage.jsx        # nova
    LoginPage.jsx           # só passa a variante do layout (se necessário)
    ForgotPasswordPage.jsx  # idem
  services/
    authService.js          # + cadastrarOng
  context/
    AuthContext.jsx         # + cadastrar (mesmo saveSession do login)
  App.jsx                   # rota /cadastro + PublicOnlyRoute
```

Fluxo: `RegisterPage` → `useAuth().cadastrar` → `authService.cadastrarOng` → `api.js` (`fetch`) → `POST /auth/ongs/cadastro`.

O body enviado **não** inclui `senhaConfirmacao` nem `idCidade`.

## Regras de negócio (cliente)

1. Chamar **somente** `POST /auth/ongs/cadastro` (além das rotas de auth já usadas).
2. Validar no cliente **antes** do POST; a API valida de novo.
3. UF sempre em maiúsculas no body (`RS`, não `rs`).
4. Cidade: trim; a API faz find-or-create — não listar cidades do seed.
5. Exibir `error.message` da API; fallback genérico se o JSON não vier.
6. Não logar senha nem JWT.
7. E-mail da seed (`ong@adopet.local`) → 409 se alguém tentar cadastrar de novo.
8. Após 201, **autenticar** (não mandar de volta ao login).

## Decisões técnicas (fechadas na aprovação)

| Item | Escolha |
|------|---------|
| Rota | `/cadastro` |
| Layout | mesmo `AuthLayout` da spec 004 |
| Copy | desta spec (título, placeholders, botão Cadastrar) |
| Pós-cadastro | login automático → `/painel` |
| UF | texto livre, 2 letras (não select) |
| Cidade + UF | mesma linha |
| Cidade | texto livre (find-or-create da API) |
| Confirmar senha | sim, só no cliente |
| Campos extras (CNPJ / contato) | **não** |
| Header | Cadastre-se ativo no login; Entrar no cadastro |
| Backend | intocado |

## Critérios de pronto

- [x] Spec aprovada (pontos 1–6 fechados em 2026-08-19)
- [x] `/cadastro` no mesmo shell de login (marca + formulário)
- [x] Cadastre-se no login navega para `/cadastro` (não está mais “Em breve”)
- [x] Cadastro válido entra no `/painel` com nome da ONG na sidebar
- [x] E-mail já usado (`ong@adopet.local`) → “E-mail já cadastrado”, permanece em `/cadastro`
- [x] Senhas diferentes → não chama a API
- [x] Cidade nova (ex.: “Estrela” + “RS”) cadastra e a API cria/reusa a cidade
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

1. `/login` → Cadastre-se → `/cadastro` (mesmo visual)
2. Cadastrar ONG nova (e-mail inédito) → `/painel`
3. Recarregar → sessão permanece
4. Sair → cadastrar de novo o **mesmo** e-mail → 409
5. Tentar `ong@adopet.local` → 409
6. Senhas diferentes → mensagem local, Network sem POST
7. Largura ~360px: formulário usável
8. No cadastro, Entrar volta ao login

## Checklist de implementação (após aprovação)

1. Spec 005 + índice em `specs/README.md`
2. `cadastrarOng` no `authService` + método no `AuthContext`
3. `AuthLayout` contextual (Cadastre-se / Entrar)
4. `RegisterPage` + estilos cidade/UF
5. Rota `/cadastro` em `App.jsx`
6. CONTEXTO (checklist web; decisão na tabela §8)
