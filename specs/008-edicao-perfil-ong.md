# Spec 008 — Edição de perfil da ONG (painel web)

> **Status:** aprovada e implementada.  
> Pontos 1–6 fechados em 2026-08-31. Ponto 1 reaberto no mesmo dia: **A** (sidebar) no lugar de B (header).  
> Depende de: spec 002 (`AuthContext` + sessão JWT); spec 003 (shell, sidebar, `PainelHeader`); spec 005 (validação do cadastro: nome, e-mail, cidade, UF); backend spec 009 (`GET`/`PATCH /ongs/me`).  
> **Não altera** o `adopet-backend` nesta fatia.  
> Número: a 007 entregou o CRUD de animais. **Esta fatia é a 008.**

O web é **somente ONG**. Edição da conta do usuário permanece no mobile (spec 010). Listar/excluir usuários (API já existe) **não** entra aqui — o item “Usuários” da sidebar continua “Em breve”. A entrada desta tela é o item **ONG / Instituição** da sidebar (ponto 1-A). O header (avatar + nome) **permanece só visual**.

## Objetivo

Permitir que a ONG **altere os próprios dados** da instituição (nome, e-mail, cidade) no painel, consumindo `GET` + `PATCH /ongs/me` com JWT. Depois do sucesso, a sessão local e o header refletem o que a API devolveu.

Cobre o restante do cadastro da instituição no canal web (**RF0009** parcial — não é login; é manter a conta da ONG), usabilidade e responsividade (**RNF0001**, **RNF0006**) e mutação autenticada sem senha na tela (**RNF0002**).

A Parte 1 **não** tem RF próprio de “editar ONG”; o contrato da API já existe (backend spec 009). Esta fatia só expõe esse fluxo na UI.

## Recorte vs o que já existe

| Fluxo | Onde está | Nesta spec |
|-------|-----------|------------|
| Cadastro da ONG | spec 005 | **reusar** validação e campos — **sem** senha |
| Login + sessão `ong` no `localStorage` | spec 002 | **inalterado**; falta atualizar só o objeto `ong` |
| Esqueci senha (público, sem JWT) | spec 006 | **inalterado** — não reusar no perfil |
| Shell: sidebar + header (nome + avatar) | spec 003 | **ativar** ONG / Instituição; header **inalterado** (só visual, ponto 1-A) |
| Sair | spec 003 (rodapé da sidebar) | **inalterado** — logout **não** migra para esta tela |
| `GET /auth/me` → `{ id, papel, email }` | spec 002 | **inalterado** (fumaça do JWT; e-mail do token pode ficar stale) |
| API `GET`/`PATCH /ongs/me` | backend spec 009 | **consumir os dois** (ponto 3-B) |
| Edição do usuário / listar usuários | mobile 010 / spec futura web | **fora** |

A spec 003 continua válida para listagem e menu extra. O que muda: **ONG / Instituição** deixa de estar disabled. Dashboard, Usuários, Relatórios e Configurações continuam “Em breve”.

## Referência visual

Não há print de perfil/edição da ONG na Parte 1 (Fig. 14 = login; Fig. 16 = cadastro de animal; Fig. 17 = edição de animal, sem print). Espelhar o **idioma já no painel**.

| Fonte | Uso |
|-------|-----|
| Spec 003 (`PainelLayout`, sidebar, `PainelHeader`) | Shell inalterado; item ONG **ativo** na rota nova; header continua só visual |
| Spec 007 (`AnimalFormPage`) | Página autenticada: título, **card** branco, rodapé Cancelar / Salvar; **não** usar `AuthLayout` |
| Spec 005 (`RegisterPage`) | Campos nome / e-mail / cidade / UF; validação; UF 2 letras |
| `PainelHeader` | Nome + rótulo “ONG” + iniciais — **não** navega (ponto 1-A) |

O formulário **não** inventa layout de auth: é página do painel, tokens `--painel-*`.

## Escopo (esta tarefa)

1. Ativar o item **ONG / Instituição** da sidebar → `/painel/ong` (ponto 1-A). Header **não** vira link
2. Página autenticada **já é o formulário** (ponto 2-A): nome da ONG, e-mail, cidade, UF — **sem** senha, **sem** contato
3. Ao abrir: `ongsService.buscarMe` → `GET /ongs/me`; prefill + hidratar sessão com o objeto da API (ponto 3-B)
4. `ongsService.atualizarMe` → `PATCH /ongs/me` com Bearer; body com os três campos **só se o form estiver dirty** (ponto 5-B)
5. Sucesso **200**: gravar o `ong` da resposta no `localStorage` **sem** trocar o JWT; atualizar `AuthContext`; header/iniciais acompanham; permanece na página com “Dados atualizados.” (ponto 6-A)
6. Cancelar: `window.confirm` se dirty (ponto 4-B); ao confirmar, **reseta o form** para o snapshot e permanece na página (ponto 6-A)
7. Validação local alinhada ao cadastro (spec 005) e à API; erro de API/rede em PT-BR; 401 → logout
8. Atualizar `docs/CONTEXTO-PROJETO.md` após implementação

## Fora de escopo

- Alterar o `adopet-backend` (contrato, validação, envelope, reemitir JWT)
- Troca de senha **logada** (`senhaAtual` + `senhaNova`) — o `PUT /auth/ongs/senha` é o fluxo **esqueci senha**, público, spec 006
- ONG excluir a **própria** conta
- Foto / logo / Storage
- CNPJ, telefone/contato, endereço — **não existem** no model `Instituicao` (a API rejeita `contato` com 400)
- Header clicável / avatar como atalho de perfil (permanece só visual, ponto 1-A)
- Listar / excluir usuários (`GET`/`DELETE /usuarios`) — item **Usuários** continua “Em breve”
- `GET /auth/me` enriquecido (continua `{ id, papel, email }`)
- Invalidar JWT depois de mudar e-mail (não há blacklist; decisão da API ponto 9)
- Autocomplete de cidade (`GET /cidades`)
- Alterar listagem, CRUD de animais, auth (login/cadastro/esqueci)
- Dashboard, Relatórios, Configurações, notificações
- Testes automatizados
- Role `admin` no JWT

## RF/RNF relacionados

| ID | Cobertura nesta spec |
|----|----------------------|
| RF0009 | **Parcial** — a ONG mantém a própria conta no painel (não é o login) |
| RF0010 | Painel ganha a tela da instituição (além do CRUD de animais) |
| RF0001 | **Não** — conta de usuário (mobile) |
| RNF0001 | Item de menu óbvio; form no padrão do cadastro de animal; erros em PT-BR |
| RNF0002 | Mutação com JWT; senha **nunca** no form, no body nem no storage |
| RNF0006 | Card do form usável em desktop e viewport estreita (~360px) |

## O que já existe (não reinventar)

| Já pronto | Onde |
|-----------|------|
| `PATCH /ongs/me` (parcial; mesmo handler do PUT) | backend spec 009 |
| `GET /ongs/me` → `{ ong }` do banco | backend spec 009 — **chamado ao abrir** (ponto 3-B) |
| Objeto `ong` (sem senha, com `cidade`) | igual login/cadastro |
| Item sidebar **ONG / Instituição** disabled | spec 003 / `Sidebar.jsx` — esta fatia **ativa** |
| Nome + avatar (iniciais) no header | spec 003 / `PainelHeader.jsx` — **permanece** só visual |
| Validação + UF 2 letras | `authService.js` (spec 005) |
| `saveSession(token, ong)` | `session.js` — hoje **sempre** grava os dois |
| `AuthContext` (`login`, `cadastrar`, `logout`) | spec 002/005 — **falta** atualizar só o `ong` |
| Cards + rodapé Cancelar/Salvar | spec 007 (`AnimalFormPage`) |
| 401 → `logout()` | spec 007 (`AnimalFormPage`) |

O web chama **somente** `GET /ongs/me` e `PATCH /ongs/me` nesta fatia (além do `/auth/*` já existente). Nunca `/usuarios/*`. Nunca `/auth/ongs/senha`.

## Contexto técnico (API já pronta)

Base: `VITE_API_URL` / proxy Vite.  
Envelope de erro: `{ "error": { "message": "..." } }`.  
CORS aberto. Consulta e mutação **com JWT** + papel `ong`.

Papel `usuario` em `/ongs/me` → **403** (o painel da ONG não deve chegar nesse caso). Sem JWT → **401**.

A ONG **não** tem `contato` no MER — não inventar o campo. `PATCH` com `contato` → **400**.

### `GET /ongs/me`

**200** `{ "ong": { … } }` lido do banco (não do JWT). Chamado **ao montar** `/painel/ong` (ponto 3-B).

Não substitui o `GET /auth/me` do bootstrap: o `/auth/me` continua sendo a fumaça do JWT (`papel === "ong"`). **Não** sobrescrever a sessão com o e-mail do `/auth/me` depois de um PATCH — o claim `email` do token fica velho até o próximo login (backend spec 009, ponto 9). O `ongFromMe` da spec 002 já prefere `storedOng.email` quando existe — isso é o que impede o e-mail stale de apagar a edição.

Resposta de sucesso do GET **hidrata** a sessão (`saveOng` + `setOng`) **e** o snapshot do form. Header passa a mostrar o nome que veio do banco, mesmo se o `localStorage` estava defasado.

| Status | Quando |
|--------|--------|
| `200` | `{ "ong": { … } }` |
| `401` | sem JWT ou token inválido → logout |
| `403` | papel não é `ong` |
| `404` | instituição do token não existe mais |

Enquanto o GET não volta: estado **loading** (“Carregando…”). Se falhar (rede/API, não 401): faixa de erro; **não** habilitar Salvar sobre dados duvidosos — o form só monta depois do 200.

### `PATCH /ongs/me` (preferir PATCH; PUT é o mesmo handler)

Campos **opcionais** na API; só atualiza o que vier. Body vazio → **400** `Nenhum campo para atualizar`.

Quando o form está **dirty**, o cliente envia **os três campos** (não é PATCH campo a campo). Se nada mudou (ponto 5-B), **não** chama a API — evita o 400 e um round-trip inútil. Permanece na página; **não** mostra “Dados atualizados.” (não houve gravação).

**Body**

```json
{
  "nome": "ONG Amigos Pets",
  "email": "contato@ong.org",
  "cidade": { "nome": "Estrela", "uf": "RS" }
}
```

| Campo | Regra da API | Regra do cliente |
|-------|----------------|------------------|
| `nome` | se vier: trim; 1–**100** | obrigatório no form; `maxLength` 100 (cadastro spec 005) |
| `email` | se vier: mesmo regex do cadastro; minúsculo; **409** se **outra** instituição já usa | `isEmailValid`; trim |
| `cidade` | se vier: find-or-create (backend spec 007) | `{ nome, uf }`; UF 2 letras; **não** enviar `idCidade` |
| `senha` | **400** se enviado | **não** existe no form |
| `contato` | **400** se enviado | **não** existe no form |
| `status` | **400** se enviado | **não** enviar |
| `idCidade` | **400** | **não** enviar |

**200**

```json
{
  "ong": {
    "idInstituicao": 1,
    "nome": "ONG Amigos Pets",
    "email": "contato@ong.org",
    "idCidade": 3,
    "cidade": { "idCidade": 3, "nome": "Estrela", "uf": "RS" }
  }
}
```

**Não** devolve token novo. O JWT atual permanece. O cliente **substitui** o objeto `ong` da sessão pelo da resposta e atualiza o snapshot do form (deixa de estar dirty).

| Status | Quando | `error.message` (hoje) |
|--------|--------|-------------------------|
| `400` | validação / senha / contato / `idCidade` / body vazio | nome é obrigatório / E-mail inválido / Nenhum campo para atualizar / contato não é aceito neste endpoint / … |
| `401` | sem JWT ou token inválido | (middleware) |
| `403` | papel não é `ong` | Acesso negado |
| `409` | e-mail já usado por **outra** `Instituicao` | E-mail já cadastrado |

E-mail igual ao atual: ok, sem 409. Unique só contra **outro** `idInstituicao`.  
E-mail de **usuário** (mobile) **não** colide: unique é por tabela.

## Fluxo

```
ONG                         Web                         API
 |                           |                           |
 |  sidebar ONG / Instituição|
 |  → /painel/ong            |                           |
 |-------------------------->|  GET /ongs/me             |
 |                           |-------------------------->|
 |                           |  200 { ong }              |
 |                           |<--------------------------|
 |                           |  saveOng + prefill form   |
 |  form preenchido          |                           |
 |  altera campos → Salvar   |                           |
 |-------------------------->|  PATCH /ongs/me           |
 |                           |  Authorization: Bearer    |
 |                           |-------------------------->|
 |                           |  200 { ong }              |
 |                           |<--------------------------|
 |                           |  saveOng (token igual)    |
 |                           |  setOng(resposta)         |
 |  mesma página + header    |                           |
 |  + “Dados atualizados.”   |                           |
 |<--------------------------|                           |
```

Salvar **sem** mudança (ponto 5-B): não chama PATCH; permanece na página **sem** mensagem de sucesso.

401 no GET ou no PATCH: `logout()` + `/login` (mesmo padrão do cadastro de animal).

Quem não está autenticada **não** vê esta tela (`ProtectedRoute`).

## Decisões desta rodada (2026-08-31)

Herdado da API (não reabrir, salvo a autora querer o contrário):

- JWT **não** é reemitido; se o e-mail mudar, o claim do token fica stale até o próximo login; a sessão local usa o objeto da resposta.
- Sem senha, sem contato, sem exclusão da própria conta, sem foto.
- Sem listar usuários nesta fatia.

| # | Tema | Decisão |
|---|------|---------|
| 1 | Entrada | **A:** só a sidebar **ONG / Instituição** → `/painel/ong`. Header (avatar + nome) **permanece só visual** |
| 2 | Consulta vs form | **A:** `/painel/ong` **já é o formulário** (prefill + Cancelar / Salvar). Sem modo consulta, sem lápis |
| 3 | Prefill | **B:** ao abrir, `GET /ongs/me`; form e sessão hidratam com o banco |
| 4 | Descartar | **B:** `window.confirm` se dirty; senão reseta/ignora na hora |
| 5 | Save sem mudança | **B:** se nada mudou, **não** chama a API |
| 6 | Depois do 200 / Cancelar | **A:** permanece em `/painel/ong`. Sucesso: “Dados atualizados.” Cancelar dirty + confirmou: **reseta o form** para o snapshot |

Copy do confirm (ponto 4-B):

| | Texto |
|--|--------|
| Título / pergunta | Descartar alterações? |
| Corpo | As alterações não salvas serão perdidas. |
| Cancelar o diálogo | Continuar editando |
| Confirmar | Descartar |

`window.confirm` nativo junta título + corpo numa frase só — usar:  
`Descartar alterações?\n\nAs alterações não salvas serão perdidas.`  
OK = Descartar; Cancelar = Continuar editando.

Logout da sidebar **não** pede esse confirm (continua imediato, spec 003).

Dirty = nome trim, e-mail trim/lower, cidade trim, UF maiúscula diferentes do snapshot do **GET** (ou do PATCH seguinte).

## Contrato de UI

Idioma: **PT-BR**. Identificadores de código em inglês.

### Rotas

| Rota | Auth | Tela |
|------|------|------|
| `/painel/ong` | sessão ONG | Dados da instituição (form — ponto 2-A) |
| `/painel/animais/*` | sessão ONG | **inalteradas** |
| Auth (`/login`, `/cadastro`, `/esqueci-senha`) | pública | **inalteradas** |

O item **ONG / Instituição** fica ativo (`aria-current`) em `/painel/ong`. `listItemIdFromLocation` passa a devolver `'ong'` nessa rota.

### Sidebar (delta da spec 003)

| Item | Hoje (003) | Nesta spec |
|------|------------|------------|
| ONG / Instituição | disabled, “Em breve” | **ativo**; `to="/painel/ong"`; `aria-current` nesta rota |
| Demais itens + Sair | inalterados | inalterados |

### Header (delta da spec 003)

| Elemento | Hoje | Nesta spec (ponto 1-A) |
|----------|------|------------------------|
| Avatar + nome + “ONG” | só visual | **inalterado** — não navega, sem `pointer`, sem `aria-label` de perfil |
| Iniciais | 1 nome → até 3 letras; 2+ → 1ª de cada | **inalterado** (já existe `iniciaisOng`) |

Sem lápis no header. O nome/iniciais **atualizam** depois do GET/PATCH porque leem o `AuthContext`.

### Página `/painel/ong` (ponto 2-A)

Dentro do `PainelLayout`. **Não** usar `AuthLayout` nem `PasswordField`.

```
ONG / Instituição
Atualize os dados da instituição.

  ┌─ Dados da instituição ─────────────────────────┐
  │ Nome da ONG  [ ONG AdoPet Demo               ] │
  │ E-mail       [ ong@adopet.local              ] │
  │ Cidade       [ Lajeado     ]  UF [ RS ]        │
  └────────────────────────────────────────────────┘

  [erro, se houver]
  [sucesso, se houver]

  [ Cancelar ]                    [ Salvar ]
```

Enquanto o GET carrega: título visível + “Carregando…” (`aria-busy`); form oculto ou campos disabled. Sem Salvar até o 200.

| Elemento | Copy / regra |
|----------|----------------|
| Título | ONG / Instituição |
| Subtítulo | Atualize os dados da instituição. |
| Nome | label “Nome da ONG”; `maxLength` 100; `autoComplete="organization"` |
| E-mail | label “E-mail”; mesmo padrão do cadastro |
| Cidade + UF | mesma linha; UF só letras, 2 chars, maiúsculo |
| Senha | **não** listar (nem “alterar senha”) |
| Contato | **não** listar |
| Cancelar | se dirty → confirm (ponto 4-B); ao descartar, reseta o form (ponto 6-A). Se **não** dirty: no-op (já está no snapshot) |
| Salvar | dirty + válido → PATCH; **não** dirty → sem request (ponto 5-B); durante o request: “Salvando…” e disabled |
| Sucesso | Dados atualizados. (`role="status"`) — some no próximo edit |
| Erro | faixa vermelha, `role="alert"` |
| Loading GET | Carregando… |

Prefill: resposta do `GET /ongs/me` (ponto 3-B). Fallback **não** monta o form com a sessão se o GET falhou.

### Copy compartilhada

| Elemento | Texto |
|----------|--------|
| Título | ONG / Instituição |
| Subtítulo | Atualize os dados da instituição. |
| Loading GET | Carregando… |
| Salvar | Salvar |
| Salvando | Salvando… |
| Cancelar | Cancelar |
| Sucesso | Dados atualizados. |
| Confirm | Descartar alterações?\n\nAs alterações não salvas serão perdidas. |
| Erro nome | Informe o nome da ONG |
| Erro e-mail | Informe um e-mail válido |
| Erro cidade | Informe a cidade |
| Erro UF | Informe a UF (2 letras, ex.: RS) |
| 409 | E-mail já cadastrado (mensagem da API) |
| Rede | Não foi possível conectar à API. Verifique se o backend está no ar. |
| Item menu | ONG / Instituição |

Validação local **antes** do PATCH, na mesma ordem do cadastro (spec 005), **sem** os passos de senha.

### Acessibilidade mínima

- `<form>` com submit via Enter
- `<label>` visível em cada campo
- Item de menu ativo com `aria-current="page"`
- Erro `role="alert"`; sucesso `role="status"`; loading `aria-busy`
- Foco visível (outline roxo da spec 003)
- Viewport ~360px: cidade+UF podem empilhar; sem overflow horizontal

## Arquitetura de código

```
src/
  pages/
    OngProfilePage.jsx         # nova — GET + form da instituição
    OngProfilePage.module.css  # reusar tokens/cards da spec 007
    animaisListConfig.js       # + id 'ong' em listItemIdFromLocation
  components/
    Sidebar.jsx                # item ONG deixa de ser disabled
  context/
    AuthContext.jsx            # + atualizarOng(ongDaApi)
  services/
    session.js                 # + saveOng(ong) — token intacto
    ongsService.js             # novo — GET e PATCH /ongs/me
    authService.js             # inalterado (só /auth/* + helpers)
  App.jsx                      # rota /painel/ong
```

`PainelHeader.jsx` **não** muda nesta fatia (ponto 1-A).

Não misturar `/ongs/me` em `authService.js`: auth continua cadastro/login/senha/`/auth/me`.

### Sessão

Hoje `saveSession(token, ong)` grava os dois. Depois do GET/PATCH o token **não** muda.

```
saveOng(ong)
  → localStorage ONG_KEY
  → setOng no AuthContext
  → TOKEN_KEY intocado
```

`atualizarOng` no contexto: recebe o objeto `ong` da resposta (GET ou PATCH). **Não** chamar `login()` de novo.

Bootstrap (`GET /auth/me` + `ongFromMe`) **inalterado**: se existe `storedOng.email`, usa o storage. Abrir `/painel/ong` é o que sincroniza com o banco.

### Cliente HTTP

```js
buscarMe()
  → requestJson('/ongs/me')
  → { ong }

atualizarMe({ nome, email, cidade })
  → requestJson('/ongs/me', { method: 'PATCH', body })
  → { ong }
```

Bearer já é injetado por `api.js`. Telas não chamam `fetch`. Sem `OngContext` novo.

Cadastro de animal que pré-preenche cidade da sessão (`emptyForm(ong)` na spec 007) passa a usar a cidade **nova** depois do GET/PATCH, sem código extra.

## Regras de negócio (cliente)

1. Papel `ong` só consulta/edita a **própria** instituição (`/ongs/me`). Nunca PATCH com `:id`.
2. Não enviar `senha`, `contato`, `status`, `idCidade` nem `idInstituicao`.
3. Cidade no body é `{ nome, uf }`, find-or-create no servidor.
4. UF sempre em maiúsculas no body (`RS`, não `rs`).
5. GET 200 e PATCH 200: substituir o `ong` da sessão pelo da resposta; **não** gravar token novo.
6. 401 → `logout()` + `/login`. Demais erros → faixa na tela (`err.message`).
7. Não logar JWT nem senha (senha nem entra).
8. Não chamar `/usuarios/*` nem `/auth/ongs/senha`.
9. E-mail de usuário e de ONG **podem** coincidir (unique por tabela) — o web não tenta impedir.
10. Header (avatar + nome) **não** navega.

## Critérios de pronto (após implementação)

- [x] Pontos 1–6 fechados nesta spec (1-A, 2-A, 3-B, 4-B, 5-B, 6-A)
- [x] Specs 001–007 já implementadas; API de contas no ar
- [x] Login `ong@adopet.local` / `senha123` → sidebar **ONG / Instituição** ativa (não mais “Em breve”)
- [x] Header (avatar + nome) **não** navega
- [x] Ao abrir, GET preenche nome, e-mail, cidade e UF do banco (seed: ONG AdoPet Demo, Lajeado - RS)
- [x] Salvar nome novo → 200 → mesma página + “Dados atualizados.” + header com o nome novo
- [x] Salvar e-mail já usado por outra ONG → faixa “E-mail já cadastrado”; sessão **não** muda
- [x] Cancelar com mudança → confirm; Descartar → form volta ao snapshot; Continuar → form intacto
- [x] Salvar sem mudar nada → **sem** PATCH e **sem** mensagem de sucesso
- [x] Senha e contato **não** aparecem no form; esqueci senha (006) inalterado
- [x] Fechar/reabrir o browser → sessão continua logada com os dados **novos** (JWT antigo + `ong` atualizado)
- [x] Cadastro de animal (`+`) usa a cidade **nova** da sessão
- [x] 401 no GET ou no PATCH desloga
- [x] Viewport ~360px usável, sem overflow horizontal
- [x] Auth (login/cadastro/esqueci) e CRUD de animais **não** reescritos
- [x] `PainelHeader` **não** reescrito
- [x] Backend intocado
- [x] CONTEXTO atualizado (checklist web; decisão §8)
- [x] `specs/README.md` — status aprovada e implementada (só depois de codar)

## Como validar (após implementação)

Pré-requisito: API + seed (`npm run prisma:seed` no backend).

```bash
# terminal 1
cd D:\adopet-backend
npm run dev

# terminal 2
cd D:\adopet-web
npm run dev
```

1. Login `ong@adopet.local` / `senha123` → Adoção → menu **ONG / Instituição**
2. Conferir GET/prefill (seed: ONG AdoPet Demo, `ong@adopet.local`, Lajeado / RS)
3. Alterar só o nome → Salvar → permanece na página, “Dados atualizados.”, header com o nome novo
4. Editar de novo → e-mail de uma segunda ONG (cadastrar antes) → 409 visível; sessão intacta
5. Alterar cidade/UF → Salvar → `+ Cadastrar novo animal` já vem com a cidade nova
6. Alterar um campo → Cancelar → confirm → Descartar → valores do GET de volta
7. Salvar sem mudar → Network **sem** PATCH
8. Recarregar a página → continua logada, dados novos
9. Item ativo da sidebar em `/painel/ong`; clicar no header **não** navega; Adoção/Encontrados/Perdidos intactos
10. Sair na sidebar continua imediato

Não usar o `PUT /auth/ongs/senha` neste fluxo.

## Checklist de implementação (após aprovação)

1. [x] Fechar pontos 1–6 nesta spec + índice no `specs/README.md`
2. [x] `session.saveOng` + `AuthContext.atualizarOng`
3. [x] `ongsService.js` (`GET` + `PATCH /ongs/me`)
4. [x] `OngProfilePage` + rota em `App.jsx`
5. [x] `Sidebar`: item ONG ativo; `listItemIdFromLocation`
6. [x] **Não** tornar o header clicável
7. [x] CONTEXTO (checklist web RF0009/RF0010; tabela §8)

## Relação com as specs 003, 005, 006 e 007

- **003** nasceu o item disabled. Esta 008 **só** o ativa e abre a tela. Header continua visual. Dashboard, Usuários, Relatórios e Configurações continuam “Em breve”.
- **005** nasceu a conta; validação e cidade/UF **reusam**. Senha fica no cadastro, não na edição.
- **006** continua o único jeito de trocar senha (deslogada, e-mail + senha nova). Não criar “alterar senha” no perfil.
- **007** empresta o idioma visual do form autenticado (card + rodapé). Não misturar campos de animal.

## Relação com o mobile 010 e o backend 009

- Backend 009 já fechou o contrato. Esta fatia **consome** `GET` e `PATCH /ongs/me`.
- Mobile 010 é o paralelo para `usuario` (`/usuarios/me`), com prefill só da sessão (sem GET). Aqui o GET entra de propósito (ponto 3-B). Não compartilhar código entre repos; só o padrão (PATCH, sessão sem reemitir JWT, sem senha).
