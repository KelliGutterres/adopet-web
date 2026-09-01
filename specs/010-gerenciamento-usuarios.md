# Spec 010 — Gerenciamento de usuários no painel (ONG)

> **Status:** aprovada e implementada.  
> Pontos 1–8 fechados em 2026-08-31 (pacote proposto, confirmado pela autora).  
> Depende de: spec 002 (JWT ONG); spec 003 (shell, sidebar, tabela, `ConfirmDialog`); spec 007 (padrão de exclusão na lista); backend spec 009 (`GET`/`DELETE /usuarios`).  
> **Não altera** o `adopet-backend`.  
> Número: a 009 entregou o detalhe do animal. **Esta fatia é a 010.**

O web é **somente ONG**. Edição da conta do usuário permanece no mobile (mobile spec 009 / 010). A ONG **não** edita dados de outro usuário — a API só lista e exclui (backend 009, ponto 5).

## Objetivo

Ativar o item **Usuários** da sidebar e entregar a tela de **consulta + exclusão** das contas de `usuario` no painel. Cobre o caso de uso da ONG “gerenciar usuários” (§4.5 do CONTEXTO) e o restante de **RF0010** (além de animais e da própria instituição), com usabilidade e responsividade (**RNF0001**, **RNF0006**) e mutação autenticada (**RNF0002**).

A Parte 1 **não** tem RF próprio de “listar usuários”; o contrato da API já existe (backend spec 009). Esta fatia só expõe esse fluxo na UI.

## Recorte vs o que já existe

| Fluxo | Onde está | Nesta spec |
|-------|-----------|------------|
| Shell: sidebar + header | spec 003 | **ativar** Usuários; header **inalterado** |
| Listagem / CRUD / detalhe de animais | specs 003 / 007 / 009 | **inalterados** |
| Perfil da ONG | spec 008 | **inalterado** |
| `GET /usuarios`, `GET /usuarios/:id`, `DELETE /usuarios/:id` | backend 009 | **consumir** listagem e exclusão; `GET /:id` **não** entra (ponto 2) |
| `GET`/`PATCH /usuarios/me` | backend 009 / mobile | **fora** — papel `usuario` |
| Cadastro de usuário | `POST /auth/usuarios/cadastro` (mobile) | **fora** — a ONG não cria conta |
| Edição de outro usuário | API **não existe** | **fora** |

A spec 003 continua válida para animais e menu extra. O que muda: **Usuários** deixa de estar disabled. Dashboard, Relatórios e Configurações continuam “Em breve”.

## Referência visual

Não há print web de usuários na Parte 1 (Fig. 14 = login; Fig. 16 = cadastro de animal; Fig. 17 = edição de animal, sem print). Espelhar o **idioma já no painel**.

| Fonte | Uso |
|-------|--------|
| Spec 003 (`AnimaisListPage`, `AnimalTable`, tokens `--painel-*`) | Card, heading, busca, tabela, empty/erro/loading; paleta **roxa do painel** |
| Spec 007 (`ConfirmDialog`) | Exclusão com confirmação; **não** `window.confirm` |
| Spec 009 (`AnimalDetailPage`) | **Não** copiar — não há página de detalhe nesta fatia (ponto 2) |

A tabela **não** reusa `AnimalTable` (colunas e ações são outras). Copia o visual (avatar, ID, botão Excluir).

## Escopo (esta tarefa)

1. Ativar o item **Usuários** da sidebar → `/painel/usuarios` (ponto 7)
2. Página `UsuariosListPage`: `GET /usuarios` via `usuariosService`
3. Tabela: avatar com iniciais, nome, `idUsuario`, e-mail, contato, cidade (ponto 4)
4. Busca **no cliente** (nome / e-mail / contato) (ponto 6)
5. **Excluir** em cada linha → `ConfirmDialog` + `DELETE /usuarios/:id` (ponto 5)
6. Estados: loading, vazio, busca sem resultado, erro de rede/API, 401 → logout, **409** (usuário com animais)
7. Atualizar `docs/CONTEXTO-PROJETO.md` após implementação

## Fora de escopo

- Alterar o `adopet-backend` (contrato, envelope, filtro, paginação, contagem de animais, `status`)
- Página de **detalhe** do usuário (`GET /usuarios/:id`) — ponto 2; payload é o mesmo da lista
- **Editar** dados de outro usuário (a API rejeitaria; não há `PATCH /usuarios/:id`)
- **Cadastrar** usuário pelo painel (backend 009: a ONG não cria conta)
- Soft-delete / alterar `Usuario.status` (`A`/`I` — reservado, login não checa)
- ONG excluir a **própria** instituição ou listar outras ONGs
- Foto de perfil / Storage
- Telefone clicável / WhatsApp / `mailto:` (contato é texto)
- Coluna “animais vinculados” (a API não devolve a contagem; o **409** é o sinal)
- Filtros no servidor, paginação
- Alterar listagem/CRUD/detalhe de animais, perfil da ONG, auth
- Dashboard, Relatórios, Configurações, sino
- Testes automatizados
- Role `admin` no JWT

## RF/RNF relacionados

| ID | Cobertura nesta spec |
|----|----------------------|
| RF0010 | Painel ganha gerenciamento de usuários (além de animais e da instituição) |
| RF0001 | **Não** — manter usuário é cadastro/edição da **própria** conta (mobile) |
| RF0009 | **Não** — auth da ONG inalterada |
| RF0003 / RF0004 / RF0006 | **Não** — animais inalterados |
| RNF0001 | Tabela no idioma da 003; loading/erro/409 em PT-BR; exclusão confirmada |
| RNF0002 | GET/DELETE com JWT; senha **nunca** na tela; 401 → logout |
| RNF0006 | Mesmo shell; tabela com scroll horizontal em viewport estreita |

## O que já existe (não reinventar)

| Já pronto | Onde |
|-----------|------|
| `GET /usuarios` → **200** `{ usuarios }` (só `ong`) | backend spec 009 |
| `DELETE /usuarios/:id` → **204** ou **409** / **404** | backend spec 009 |
| Envelope `{ error: { message } }`; `requestJson` já trata **204** | `api.js` |
| `ConfirmDialog` (danger, loading “Excluindo…”) | spec 007 |
| `iniciaisNome`, `labelCidade` | `animalLabels.js` (reusar; não duplicar) |
| Tokens `--painel-*`; card + toolbar da listagem | spec 003 |
| JWT + Bearer injetado | spec 002 / `api.js` |
| Item Usuários no menu, **disabled** | `Sidebar.jsx` (spec 003) |

O painel **não** chama `GET /usuarios/me` nem `/auth/usuarios/*`. Nunca `PATCH` de usuário.

## Contexto técnico (API já pronta)

Base: `VITE_API_URL`. Envelope de erro: `{ "error": { "message": "..." } }`.  
`GET /usuarios` **não** é público (diferente de `GET /animais`): JWT + papel `ong`. O cliente já envia `Authorization: Bearer`.

### `GET /usuarios`

Só ONG. Sem query, sem paginação, sem filtro. Ordem: `idUsuario` crescente.

**200**

```json
{
  "usuarios": [
    {
      "idUsuario": 2,
      "nome": "Usuario Demo",
      "email": "usuario@adopet.local",
      "contato": "51999999999",
      "status": "A",
      "idCidade": 1,
      "cidade": { "idCidade": 1, "nome": "Lajeado", "uf": "RS" }
    }
  ]
}
```

Senha **nunca** vem. `status` vem no JSON e **não** entra na tabela (ponto 4).

| HTTP | Quando | UI |
|------|--------|-----|
| 200 | ok | monta a tabela (ou empty) |
| 401 | token ausente/inválido | logout → `/login` |
| 403 | papel `usuario` (não ocorre no web autenticado) | mensagem da API |
| Rede | API fora | mensagem do `api.js` |

### `DELETE /usuarios/:id`

Só ONG. **204** sem body.

| HTTP | Quando | UI |
|------|--------|-----|
| 204 | ok | fecha o diálogo; recarrega a lista |
| 409 | usuário tem **qualquer** animal | fecha o diálogo; faixa de erro com a mensagem da API |
| 404 | já excluído em outra aba | fecha o diálogo; faixa de erro; recarrega a lista |
| 400 | id inválido | faixa de erro (o cliente só chama com `idUsuario` da linha) |
| 401 | token | logout → `/login` |

Mensagem 409 da API (usar **como veio**): `Usuário possui animais vinculados e não pode ser excluído`.

A ONG exclui os animais **antes**, nas listas A/P/E (spec 007). Esta tela **não** lista os animais do usuário.

### `GET /usuarios/:id`

Existe. **Não** entra nesta fatia (ponto 2). Mesmo objeto da lista.

### Print × modelo (o que cabe agora)

Não há print. Disciplina das specs 003/007/009: **não inventar campo**.

| Elemento desejável | No modelo/API? | Nesta fatia |
|--------------------|----------------|-------------|
| Foto | não (Storage futuro) | placeholder (iniciais do `nome`) |
| Nome | `nome` | sim |
| ID | `idUsuario` | `ID: #n` (igual à tabela de animais) |
| E-mail | `email` | sim |
| Contato | `contato` | sim, texto puro (sem máscara, sem `tel:`) |
| Cidade | `cidade.nome` + `uf` | `{cidade} - {uf}` via `labelCidade` |
| Status Ativo/Inativo | `status` `A`/`I` | **omitir coluna** — reservado, login não usa (backend 009 ponto 12) |
| Qtd. de animais | **não vem** | **omitir**; o 409 cobre o conflito |
| Data de cadastro | **não existe** | **omitir** |
| Senha | hash, nunca no GET | **omitir** |
| Editar | API **não** tem `PATCH /usuarios/:id` | **omitir** botão |
| + Cadastrar usuário | cadastro é do mobile | **omitir** botão |
| Excluir | `DELETE` | sim |

Seed esperado na validação:

| Conta | E-mail | Animais | DELETE |
|-------|--------|---------|--------|
| Usuario Demo | `usuario@adopet.local` | Mel (`E`) | **409** |
| Segundo usuário (cadastrar via API/mobile, **sem** animal) | qualquer | nenhum | **204** |

Não usar o usuário do seed como alvo do DELETE feliz.

## Pontos fechados (2026-08-31)

Confirmados pela autora (pacote proposto).

| # | Tema | Proposta |
|---|------|----------|
| 1 | Número / canal | **010** no web. Mobile e backend **intocados**. |
| 2 | Recorte | **Listagem + exclusão.** Sem página de detalhe. |
| 3 | Entrada na lista | Nome **não** é link (não há destino). Avatar + nome + ID só visuais. |
| 4 | Colunas | Usuário, E-mail, Contato, Cidade, Ações. **Sem** status. |
| 5 | Ações | **Só Excluir** (igual animais, sem Editar). Sem cadastrar. |
| 6 | Busca | Só busca texto **no cliente**. Sem selects de filtro. Sem paginação. |
| 7 | Rota | `/painel/usuarios`. Item da sidebar ativo. |
| 8 | Tema | Tokens **roxos do painel**. Tabela nova, `ConfirmDialog` da 007. |

### Ponto 2 — por que sem detalhe nesta fatia

`GET /usuarios/:id` devolve **o mesmo JSON** de cada item da lista (nome, e-mail, contato, cidade, status). Não há descrição, fotos nem tutor extra. Uma `UsuarioDetailPage` copiaria a 009 sem fechar requisito novo.

A lista **já é** a consulta. Excluir na linha (como animais na 007) basta para “gerenciar”.

Se a autora quiser detalhe mesmo assim (**2-B**): uma página `/painel/usuarios/:idUsuario` só leitura, nome clicável, **só Voltar** (Excluir fica na lista, igual spec 009 ponto 5). Pode ser spec **011**. Não misturar nesta.

### Ponto 4 — por que omitir `status`

`Usuario.status` (`A`/`I`) está reservado desde o schema e **não** entra no login (backend 009 ponto 12). Chip “Ativo/Inativo” sugeriria regra que **não existe**. Omitir, como a 003 omitiu “Disponível” e “Cadastrado em”.

O campo continua no JSON; o cliente ignora.

### Ponto 5 — por que só Excluir

| Ação | API | UI |
|------|-----|-----|
| Editar outro usuário | não existe | não inventar botão disabled “Em breve” — a ONG **nunca** fará isso neste MVP |
| Cadastrar | `POST /auth/usuarios/cadastro` é do **usuário** no mobile | não mostrar CTA que a ONG não pode cumprir |
| Excluir | `DELETE /usuarios/:id` | botão na linha + diálogo |

Botão disabled “Em breve” na 003 existia porque o CRUD de animais **viria na spec seguinte**. Aqui a API já fechou: ONG não edita nem cria usuário.

### Ponto 6 — por que só busca

A 003 tem espécie/porte porque o `Animal` tem esses enums e as três listas são grandes. Usuário não tem espécie/porte. Filtro de `status` cairia no ponto 4. A API não pagina — a busca é no array já carregado, igual animais.

Placeholder: `Buscar por nome, e-mail ou contato...`

### Ponto 7 — por que `/painel/usuarios`

Alinhado a `/painel/ong` e `/painel/animais/...`. Plural REST. Sem query. `listItemIdFromLocation` passa a devolver `'usuarios'` nessa rota (hoje só trata `ong` e as três listas).

Não criar `/painel/usuarios/:id` nesta fatia.

### Ponto 8 — por que não generalizar `AnimalTable`

As colunas e o conjunto de ações divergem. Forçar `columns`/`render` na tabela de animais para uma fatia só aumenta risco na 003/007/009. `UsuarioTable` nova, mesmos tokens, mesma classe de botão Excluir (roxo/vermelho).

Reusar `AnimaisListPage.module.css` **só** se as classes forem genéricas o bastante (card, heading, search, alert). Senão, módulo próprio copiando o necessário. Toolbar **sem** os dois `<select>` e **sem** botão cadastrar — a busca ocupa a linha.

## Fluxos

### Abrir a lista

```
ONG                         Web                         API
 |  clique Usuários         |                           |
 |  /painel/usuarios         |                           |
 |-------------------------->|  GET /usuarios            |
 |                           |--------------------------->|
 |                           |  200 { usuarios }         |
 |  tabela / empty          |<---------------------------|
```

1. Sidebar **Usuários** → `/painel/usuarios`.
2. Loading → `GET /usuarios`.
3. Sucesso → tabela ou empty; busca filtra o array **local**.
4. Trocar de item do menu (Adoção etc.) **não** precisa de cache — unmount descarta, igual às listas de animais.

### Excluir

```
ONG                         Web                         API
 |  Excluir na linha         |                           |
 |  ConfirmDialog            |                           |
 |  confirmar                |  DELETE /usuarios/:id    |
 |                           |--------------------------->|
 |                           |  204  |  409              |
 |  recarrega  |  erro      |<---------------------------|
```

1. Clique **Excluir** → `ConfirmDialog` com o `nome`.
2. Confirmar → `DELETE`; botão “Excluindo…”.
3. **204** → fecha; `reloadToken++` (novo GET).
4. **409** → fecha; `role="alert"` com a mensagem da API (usuário do seed = Mel).
5. Cancelar / Escape / backdrop → fecha sem request (se não estiver `deleting`).

Não apagar a linha só no estado local: o GET seguinte é a fonte da verdade (igual `AnimaisListPage`).

### Falha

| Situação | UI |
|----------|-----|
| Loading | “Carregando usuários…” + heading visível |
| Lista vazia (sem busca) | “Nenhum usuário cadastrado.” |
| Busca sem match | “Nenhum usuário encontrado com essa busca.” |
| Rede | mensagem do `api.js` (sem tabela) |
| 401 | logout → `/login` |
| 409 no DELETE | alerta; lista **permanece** (o usuário continua lá) |

Sem pull-to-refresh. Recarregar o browser refaz o GET.

## Contrato de UI

Idioma: **PT-BR**. Identificadores em inglês.

### Rotas

| Rota | Auth | Tela |
|------|------|------|
| `/painel/usuarios` | sessão ONG | **esta spec** — listagem |
| `/painel/ong` | sessão ONG | **inalterada** |
| `/painel/animais/*` | sessão ONG | **inalteradas** |
| Auth (`/login`, `/cadastro`, `/esqueci-senha`) | pública | **inalteradas** |

O item **Usuários** fica ativo (`aria-current`) em `/painel/usuarios`. `listItemIdFromLocation` devolve `'usuarios'` nessa rota **antes** de cair no `null`.

### Sidebar (delta da spec 003)

| Item | Hoje (003 / 008) | Nesta spec |
|------|------------------|------------|
| Usuários | disabled, “Em breve” | **ativo**; `to="/painel/usuarios"` |
| ONG / Instituição | ativo | inalterado |
| Adoção / Encontrados / Perdidos | ativos | inalterados |
| Dashboard, Relatórios, Configurações + Sair | inalterados | inalterados |

### Página `/painel/usuarios`

Dentro do `PainelLayout`. **Não** usar `AuthLayout`.

```
Usuários
Consulte e exclua as contas de usuários do sistema.

  [ 🔍 Buscar por nome, e-mail ou contato...                    ]

  [erro, se houver]

  ┌──────────────────────────────────────────────────────────────┐
  │ Usuário          │ E-mail              │ Contato │ Cidade │ Ações
  │ (avatar) Nome    │ usuario@adopet.local│ 51999…  │ Lajeado - RS │ [ Excluir ]
  │          ID: #2 │                      │         │        │
  └──────────────────────────────────────────────────────────────┘
```

| Elemento | Copy / regra |
|----------|----------------|
| Título | Usuários |
| Subtítulo | Consulte e exclua as contas de usuários do sistema. |
| Busca | `type="search"`; filtra nome, e-mail e contato (case insensitive, includes) |
| Avatar | iniciais (`iniciaisNome`) — **não** navega |
| Nome | texto (não botão/link) |
| ID | `ID: #{idUsuario}` |
| E-mail | `email` |
| Contato | `contato`; vazio na prática não ocorre (obrigatório no Prisma); se vier vazio → “—” |
| Cidade | `labelCidade` |
| Excluir | botão perigo, ícone lixeira (mesmo da `AnimalTable`) |
| Loading | Carregando usuários… (`aria-busy`) |
| Empty | Nenhum usuário cadastrado. |
| Empty + busca | Nenhum usuário encontrado com essa busca. |

Nome **não** tem hover de link (ponto 3).

### Diálogo de exclusão

Reusar `ConfirmDialog` (`danger`, `confirmLabel="Excluir"`).

| Elemento | Texto |
|----------|--------|
| Título | Excluir usuário |
| Corpo | Excluir **{nome}**? Esta ação não pode ser desfeita. |
| Confirmar | Excluir |
| Loading | Excluindo… |
| Cancelar | Cancelar (já é o default do componente) |

409: **não** deixar o diálogo aberto com o erro dentro — a 007 fecha e joga o erro na página. Igual.

### Copy compartilhada

| Elemento | Texto |
|----------|--------|
| Item menu | Usuários |
| Título | Usuários |
| Subtítulo | Consulte e exclua as contas de usuários do sistema. |
| Placeholder busca | Buscar por nome, e-mail ou contato... |
| Loading | Carregando usuários… |
| Empty | Nenhum usuário cadastrado. |
| Empty filtrado | Nenhum usuário encontrado com essa busca. |
| Título diálogo | Excluir usuário |
| Corpo diálogo | Excluir **{nome}**? Esta ação não pode ser desfeita. |
| 409 | Usuário possui animais vinculados e não pode ser excluído (API) |
| Rede | Não foi possível conectar à API. Verifique se o backend está no ar. |

### Acessibilidade mínima

- Item de menu ativo com `aria-current="page"`
- Busca com `<label>` (sr-only) associado ao input
- Botão Excluir: `aria-label="Excluir {nome}"` (a linha já mostra o nome; o label evita só “Excluir” genérico com várias linhas)
- Erro `role="alert"`; loading `aria-busy`
- `ConfirmDialog` já é `aria-modal` + Escape
- Foco visível (outline roxo da spec 003)
- Viewport ~360px: tabela com `overflow-x: auto` (min-width parecido com a de animais); busca em coluna única

## Arquitetura de código

```
src/
  pages/
    UsuariosListPage.jsx
    UsuariosListPage.module.css   # card/heading/search/alert; toolbar só busca
    animaisListConfig.js         # + id 'usuarios' em listItemIdFromLocation
  components/
    UsuarioTable.jsx
    UsuarioTable.module.css       # visual da AnimalTable; sem nameLink / Editar
    Sidebar.jsx                  # item Usuários deixa de ser disabled
    ConfirmDialog.jsx            # inalterado
  services/
    usuariosService.js           # GET /usuarios, DELETE /usuarios/:id
    usuarioLabels.js             # usuarioMatchesBusca (reusa labelCidade / iniciaisNome)
  App.jsx                        # rota /painel/usuarios
```

Não misturar `/usuarios` em `authService.js` nem em `ongsService.js`. Auth continua `/auth/*`.

`animalLabels.js` **não** ganha helpers de usuário — evita acoplar domínio. `iniciaisNome` e `labelCidade` podem ser **importados** de `animalLabels.js` (já são genéricos) **ou** extraídos depois se doer; nesta fatia importar é suficiente, sem refactor amplo.

### Cliente HTTP

```js
listarUsuarios()
  → requestJson('/usuarios')
  → Array.isArray(data?.usuarios) ? data.usuarios : []

excluirUsuario(id)
  → requestJson(`/usuarios/${id}`, { method: 'DELETE' })
  → 204 → null
```

Não criar `buscarUsuarioPorId` nesta fatia.

`id` na URL: `encodeURIComponent`, igual `animaisService`.

### Navegação / sidebar

```js
// listItemIdFromLocation — acrescentar no topo, junto de /painel/ong
if (/\/painel\/usuarios\/?$/.test(pathname)) {
  return 'usuarios';
}
```

`Sidebar` `NAV_ITEMS`: `{ id: 'usuarios', label: 'Usuários', to: '/painel/usuarios' }` (tirar `disabled: true`).

### Página

Espelhar o ciclo de vida de `AnimaisListPage`:

- `useEffect` com cancel flag + `reloadToken`
- 401 → `logout()` + `navigate('/login', { replace: true })`
- `useMemo` da lista filtrada
- `toDelete` + `deleting` + `ConfirmDialog`

Sem `useParams` de situação. Sem `Navigate` de fallback além do `ProtectedRoute`.

## Regras de negócio (UI)

1. Só ONG autenticada vê a tela (o `ProtectedRoute` já exige sessão; a API reforça o papel).
2. A lista é **todos** os `Usuario` do sistema — a ONG admin não filtra por cidade nem por “só quem cadastrou animal”.
3. Exclusão é **hard delete**. 409 se houver animal; a UI não tenta cascade.
4. Senha, hash e JWT de usuários **nunca** aparecem.
5. Busca não dispara request.
6. Não logar token nem body de DELETE.

## Critérios de pronto (após aprovação + implementação)

- [x] Pontos 1–8 confirmados nesta spec
- [x] Sidebar: Usuários ativo; `aria-current` em `/painel/usuarios`; demais itens inalterados
- [x] Login ONG → Usuários → lista inclui o seed (`usuario@adopet.local`, Lajeado - RS)
- [x] Busca por recorte do e-mail / nome / contato reduz a tabela; limpar volta a lista
- [x] Sem JWT / 401 → login
- [x] Excluir o seed (tem a Mel) → diálogo → 409 na faixa; linha **permanece**
- [x] Cadastrar um segundo usuário **sem** animais (API ou mobile) e Excluir → 204; some da lista
- [x] Sem botão Editar, sem Cadastrar, sem coluna status, sem página `/painel/usuarios/:id`
- [x] Listagem/CRUD/detalhe de animais e `/painel/ong` **inalterados**
- [x] CONTEXTO: checklist web “gerenciamento de usuários”; tabela §8; índice da spec

## Como validar (após implementação)

Pré-requisito: API + seed. Painel logado com `ong@adopet.local` / `senha123`.

1. Abrir **Usuários** na sidebar → heading + tabela com o Usuario Demo  
2. Buscar `usuario@` → a linha permanece; buscar `zzzz` → empty filtrado  
3. Excluir o Usuario Demo → confirmar → alerta 409; a linha continua  
4. `POST /auth/usuarios/cadastro` de um e-mail novo (sem criar animal) → recarregar Usuários → Excluir → some  
5. Adoção / ONG / Instituição → telas anteriores iguais  
6. Viewport estreita: busca empilha; tabela scroll horizontal; Excluir acessível

## Checklist de implementação (após aprovação)

1. [x] Confirmar pontos 1–8 nesta spec + índice no `specs/README.md`
2. [x] `usuariosService.js` + `usuarioLabels.js` (match da busca)
3. [x] `UsuarioTable` + `UsuariosListPage` + CSS
4. [x] `Sidebar` + rota em `App.jsx` + `listItemIdFromLocation`
5. [x] `ConfirmDialog` no fluxo de exclusão (reuso)
6. [x] CONTEXTO (checklist RF0010 usuários; decisão §8; pendência)
7. [x] **Não** alterar o backend nem o mobile nesta fatia
