# Spec 009 — Detalhe do animal no painel (ONG)

> **Status:** aprovada e implementada.  
> Pontos 1–7 fechados em 2026-08-31. Ponto 5 reaberto no mesmo dia: **só Voltar** (sem Editar no detalhe).  
> Depende de: spec 003 (shell + listagem); spec 007 (CRUD + form + `buscarAnimalPorId`); backend spec 005 (`GET /animais/:id`).  
> **Não altera** o `adopet-backend`.  
> Número: a 008 entregou o perfil da instituição. **Esta fatia é a 009.**

O web é **somente ONG**. O detalhe do usuário permanece no mobile (mobile spec 008). Esta página é a consulta no painel — a 007 deixou “tela de detalhes só leitura” fora de escopo de propósito.

## Objetivo

Abrir uma página de **consulta** a partir das três listagens (**Adoção**, **Encontrados**, **Perdidos**), com os dados já existentes na API. Cobre **RF0006** no canal web (descrição, localização e demais informações; foto ainda placeholder), com usabilidade e responsividade (**RNF0001**, **RNF0006**).

Uma página só, parametrizada. As três listas usam o mesmo destino; o copy da situação segue o `status` do animal. A ONG continua podendo **editar** (form da 007) e **excluir** (lista).

## Recorte vs o que já existe

| Fluxo | Onde está | Nesta spec |
|-------|-----------|------------|
| Listagem A / P / E | spec 003 / 007 | **entra** o clique no nome → detalhe; Editar/Excluir **inalterados** |
| Cadastro / edição / exclusão | spec 007 | **inalterados** (form e diálogo ficam onde estão) |
| `GET /animais/:id` | backend 005; `buscarAnimalPorId` na 007 | **consumir** de novo (fonte da verdade) |
| Perfil da ONG | spec 008 | **fora** |
| Detalhe no mobile (A/P/E) | mobile 008 (+ ações em Meus animais, 011) | **fora** — não compartilhar código |
| Foto / Storage | fase 2 | placeholder (iniciais), como na tabela |

## Referência visual

Não há print web de detalhe na Parte 1 (Fig. 16 = cadastro; Fig. 17 = edição, sem print; Fig. 15 é **mobile**). Espelhar o **idioma já no painel**.

| Fonte | Uso |
|-------|--------|
| Spec 007 (`AnimalFormPage`) | Página autenticada: título acima, grade 2/3 + 1/3, cards Informações básicas + Localização, rodapé; **não** usar `AuthLayout` |
| Spec 003 (`AnimalTable`, tokens `--painel-*`) | Avatar com iniciais, ID `#n`, chip/rótulo de situação; paleta **roxa do painel** (não o header verde/terracota/roxo do mobile) |
| Mobile spec 008 | Só o **contrato de dados** (quais campos existem; responsável; omitir o que a API não tem). Layout e tema **não** copiar |

## Escopo (esta tarefa)

1. Na tabela das **três** listas: o **nome** do animal vira atalho para o detalhe (ponto 3)
2. Uma página `AnimalDetailPage` em `/painel/animais/:idAnimal/detalhes` (ponto 6)
3. `animaisService.buscarAnimalPorId` → `GET /animais/:id` (já existe; não duplicar cliente HTTP)
4. Exibir somente campos da API (tabela print × modelo)
5. Estados: loading, erro de rede/API, 404, 401 → logout
6. Rodapé: **Voltar** à lista da situação. Sem Editar e sem Excluir nesta página (ponto 5; ambos ficam na lista)
7. Atualizar `docs/CONTEXTO-PROJETO.md` após implementação

## Fora de escopo

- Alterar o `adopet-backend` (contrato, `include`, envelope, contato do tutor)
- Excluir e Editar a partir do detalhe (permanecem na lista, spec 007)
- Trocar a situação (A/P/E) nesta tela — edição **já não** envia `status`
- CTA “Entrar em contato”, WhatsApp, telefone, e-mail (API devolve só `id` + `nome` do tutor)
- Upload / card Fotos / Storage (RF0007 — fase 2)
- Gênero, bairro, data de perda/encontro, vacinado, vermifugado, cor, `createdAt`
- Filtros no servidor, paginação
- Dashboard, Usuários, Relatórios, Configurações, sino
- Detalhe no mobile (já existe)
- Deep link público / página sem JWT
- Testes automatizados
- Role `admin` no JWT

## RF/RNF relacionados

| ID | Cobertura nesta spec |
|----|----------------------|
| RF0006 | **Sim** — detalhe com descrição, localização e dados do animal (sem fotos reais) |
| RF0004 | Lista inalterada na estrutura; o nome passa a navegar |
| RF0003 | **Não** — sem mutação nem atalho de edição nesta página (Editar fica na lista) |
| RF0010 | Painel ganha consulta além do CRUD |
| RF0007 | **Não** — placeholder de foto |
| RNF0001 | Idioma do form 007; loading/erro/404 em PT-BR; voltar óbvio |
| RNF0002 | GET público; Bearer já injetado; 401 → logout |
| RNF0006 | Mesma grade do form; empilha em viewport estreita |

## O que já existe (não reinventar)

| Já pronto | Onde |
|-----------|------|
| `GET /animais/:id` → **200** `{ animal }` (público) | backend spec 005 |
| Mesmo `include` da listagem (cidade, raça, instituição, usuário — só id+nome) | `animais.service.js` |
| Envelope `{ error: { message } }`; 404 “Animal não encontrado” | `api.js` / backend |
| `buscarAnimalPorId(id)` | `animaisService.js` (spec 007) |
| Labels espécie / porte / idade / iniciais | `animalLabels.js` |
| Rotas `novo` e `:idAnimal/editar`; `pathFromStatus` | spec 007 / `App.jsx` / `animaisListConfig.js` |
| Editar / Excluir na tabela | `AnimalTable` / spec 007 |
| Tokens `--painel-*` | spec 003 |

O painel chama **somente** `GET /animais/:id` nesta fatia. Nunca `POST`/`PATCH`/`DELETE` a partir desta página. Nunca `/auth/ongs/*`.

## Contexto técnico (API)

Base: `VITE_API_URL`. `GET` é **público**; o cliente **mesmo assim** envia Bearer (já injetado).

### `GET /animais/:id`

**200** — `{ "animal": { ... } }`

```json
{
  "idAnimal": 1,
  "nome": "Thor",
  "status": "A",
  "descricao": "Cachorro dócil disponível para adoção",
  "especie": "CAO",
  "idade": 3,
  "porte": "M",
  "cidade": { "idCidade": 1, "nome": "Lajeado", "uf": "RS" },
  "raca": { "idRaca": 1, "nome": "Vira-lata" },
  "instituicao": { "idInstituicao": 1, "nome": "ONG AdoPet Demo" },
  "usuario": null
}
```

| HTTP | Quando | UI |
|------|--------|-----|
| 200 | ok | monta a página |
| 400 | id inválido | erro + Voltar à lista |
| 404 | não existe (ex.: excluído em outra aba) | “Animal não encontrado.” + Voltar à lista |
| 401 | token | logout → `/login` |
| Rede | API fora | mensagem do `api.js` + Tentar novamente |

Não inventar campo. `usuario` / `instituicao` vêm só com **id + nome** — sem `contato`, sem `email`.

Seed esperado na validação:

| Animal | `status` | Tutor | Entrada |
|--------|----------|-------|---------|
| Thor | `A` | ONG AdoPet Demo | lista Adoção |
| Luna | `P` | ONG AdoPet Demo | lista Perdidos |
| Mel | `E` | Usuario Demo | lista Encontrados |

### Print × modelo (detalhe)

Mesma disciplina das specs 003/007: **não inventar campo**.

| Elemento desejável | No modelo/API? | Nesta fatia |
|--------------------|----------------|-------------|
| Foto | não (Storage futuro) | placeholder maior (iniciais do `nome`) |
| Título | `nome` | **sempre** o `nome` (as três listas do web já mostram nome; não repetir o título genérico do card mobile) |
| Situação | `status` | chip: Para adoção / Perdido / Encontrado |
| ID | `idAnimal` | sim — `ID: #n`, como na tabela |
| Descrição | `descricao` | sim, completa (sem truncar) |
| Localização | `cidade.nome` + `uf` | `{cidade} - {uf}` |
| Espécie / raça / idade / porte | sim | sim; idade/porte vazios → “—” (igual à tabela, não omitir a linha) |
| Gênero | **não existe** | **omitir** |
| Data | **não existe** | **omitir** |
| Vacinado / vermifugado / cor / bairro | **não existem** | **omitir** |
| Responsável Adoção | `instituicao.nome` | “ONG responsável”; fallback `usuario.nome` |
| Quem cadastrou P/E | `usuario.nome` ou `instituicao.nome` | “Cadastrado por” |
| Telefone / e-mail / WhatsApp | **não vêm no GET** | **omitir** |
| Editar | form 007 | **omitir** nesta página (botão na tabela) |
| Excluir | lista 007 | **omitir** nesta página |
| Sino | — | **não** nesta página |

## Pontos fechados (2026-08-31)

Confirmados pela autora (pacote proposto).

| # | Tema | Decisão |
|---|------|-------------------|
| 1 | Número / canal | **009** no web. Mobile 008 já cobriu o app. Backend **intocado**. |
| 2 | Uma página vs três | **Uma** (`AnimalDetailPage`) para A, P e E. Copy pelo `status` do animal, não pela aba. |
| 3 | Entrada na lista | **Nome clicável** (não a linha inteira, para não brigar com Editar/Excluir). Sem botão extra “Ver detalhes”. |
| 4 | Fonte dos dados | Sempre `GET /animais/:id`. A lista **não** é a fonte da verdade. Param: `idAnimal`. |
| 5 | Ações no detalhe | **Só Voltar.** Sem Editar e sem Excluir aqui (os dois ficam na lista). |
| 6 | Rota | `/painel/animais/:idAnimal/detalhes?status=` — sufixo estático, sem colidir com `:situacao`. |
| 7 | Tema | Tokens **roxos do painel**. Chip de situação; **não** pintar o header como no mobile. |

### Ponto 2 — por que uma página

As três listas já compartilham `AnimaisListPage` + o mesmo form. O detalhe é o mesmo objeto `Animal` com `status` diferente. Três arquivos copiados quebram labels e estados. A lista de origem **não** redefine a situação: se o registro for `E`, o detalhe é Encontrado mesmo que a URL `?status=` esteja errada — o GET manda.

### Ponto 3 — por que só o nome

A linha já tem dois botões. Tornar a `<tr>` inteira clicável compete com Editar/Excluir e com seleção de texto. O nome como `<button>`/`<Link>` (estilo link, não botão roxo) é o atalho óbvio, com `aria-label="Ver detalhes de {nome}"`.

O avatar **não** precisa ser alvo separado: clicar no nome basta. Foto continua visual.

### Ponto 4 — por que GET por id

```
Lista (GET ?status=)  →  clique no nome  →  /detalhes
                                              →  GET /animais/:id
                                              →  200 monta  |  404 “não encontrado”
```

A 007 já faz isso no form de edição. Pintar com o item da lista evitaria o loading, mas mostraria dado velho se outra aba tiver editado. O GET por id é barato e é o contrato do RF0006.

Não passar o objeto `animal` como fonte. `?status=` da lista serve **só** para destacar a sidebar e o Voltar **antes** do GET; se a resposta divergir, lista/tema seguem `animal.status`.

`idAnimal` ausente ou não inteiro > 0 → não chamar a API; mensagem + Voltar (query `status` se houver, senão Adoção).

### Ponto 5 — por que sem Editar nem Excluir no detalhe

RF0006 é consulta. A ONG já edita e exclui na tabela (spec 007). Duplicar Editar ou `ConfirmDialog` nesta fatia aumenta superfície sem fechar requisito novo.

### Ponto 6 — por que `/detalhes` e não `/:idAnimal`

Rotas atuais:

| Rota | Papel |
|------|--------|
| `/painel/animais/novo` | cadastro |
| `/painel/animais/:idAnimal/editar` | edição |
| `/painel/animais/:situacao` | `adocao` \| `encontrados` \| `perdidos` |

`/painel/animais/:idAnimal` (sem sufixo) competiria com `:situacao` (`adocao` seria capturado como id). O sufixo `/detalhes` é explícito e entra **antes** de `:situacao`, junto de `novo` e `editar`.

### Ponto 7 — por que não copiar o mobile

O painel é roxo (specs 003–008). Headers verde/terracota/roxo quebrariam o shell (`PainelHeader` + sidebar). Situação = chip no heading. Responsável e labels de campo **sim** alinhados ao mobile 008, porque o dado é o mesmo.

## Fluxos

### Abrir detalhe

```
ONG                         Web                         API
 |  lista A / P / E          |                           |
 |  clique no nome          |                           |
 |  /painel/animais/:id/detalhes?status=                |
 |-------------------------->|  GET /animais/:id        |
 |                           |--------------------------->|
 |                           |  200 { animal }           |
 |  página detalhe          |<---------------------------|
```

1. Clique no **nome** (qualquer uma das três listas).
2. `navigate(`/painel/animais/${idAnimal}/detalhes?status=${screen.status}`)`.
3. Loading → `GET /animais/:id`.
4. Sucesso → seções preenchidas; sidebar = `animal.status` (sincronizar query se divergir, como o form 007).
5. Voltar → lista da situação do animal (`pathFromStatus`); **sem** resetar busca da lista (estado da lista morre no unmount — aceitável, igual ao form).

### Falha

| Situação | UI |
|----------|----|
| Loading | “Carregando detalhes…” + heading já visível (título “Detalhes do animal”) |
| 404 / 400 | texto de erro + botão Voltar à lista |
| Rede | mensagem do `api.js` + Tentar novamente (repete o GET) |
| 401 | logout → `/login` |

Sem pull-to-refresh. Recarregar o browser refaz o GET.

## Contrato de UI

Idioma: **PT-BR**. Identificadores em inglês.

### Rotas

Estáticas **antes** de `:situacao` (igual 007).

| Rota | Tela |
|------|------|
| `/painel/animais/adocao` | listagem `A` — nome navega |
| `/painel/animais/encontrados` | listagem `E` |
| `/painel/animais/perdidos` | listagem `P` |
| `/painel/animais/novo?status=` | formulário criar (**inalterado**) |
| `/painel/animais/:idAnimal/editar` | formulário editar (**inalterado**) |
| `/painel/animais/:idAnimal/detalhes?status=` | **esta spec** — consulta (`idAnimal` inteiro > 0) |

`listItemIdFromLocation`: tratar `/detalhes` como o form (`?status=` → item A/P/E). Sem isso a sidebar perde o destaque.

### Listagem (delta da spec 007)

| Elemento | Agora |
|----------|--------|
| Nome do animal | `<Link>` ou `<button class=link>` → detalhe |
| Editar / Excluir | **inalterados** |
| + Cadastrar / filtros / colunas | inalterados |
| Foto na tabela | placeholder (não navega sozinho) |

### Heading

| Elemento | Texto / regra |
|----------|----------------|
| Título da página | Detalhes do animal |
| Subtítulo | Consulte as informações cadastradas. |
| Avatar | iniciais, maior que a tabela (~72px), tokens `--painel-primary-soft` |
| Nome em destaque | `animal.nome` |
| Linha auxiliar | `ID: #{idAnimal}` · chip de situação |
| Chip | Para adoção / Perdido / Encontrado |

### Seções (cards, mesma grade do form 007)

| Seção | Conteúdo |
|--------|----------|
| Informações básicas | Espécie, raça, idade, porte, descrição, responsável — cada um numa linha label / valor (`<dl>`) |
| Localização | `{cidade.nome} - {uf}` |

Não são `<input>` — consulta. Sem `*`, sem contador 200.

#### Copy do responsável

| `status` | Label | Valor |
|----------|--------|-------|
| `A` | ONG responsável | `instituicao.nome`; se `null`, `usuario.nome`; se ambos `null`, omitir a linha |
| `P` / `E` | Cadastrado por | `usuario.nome` ou `instituicao.nome` (o que não for `null`) |

Não mostrar ids de tutor (`idUsuario`, `idInstituicao`) na UI. `idAnimal` **sim**, no heading (já está na tabela).

### Labels de campo (iguais ao form / tabela)

| Campo | Label |
|-------|--------|
| Espécie | Espécie (`Cão` / `Gato`) |
| Raça | Raça |
| Idade | Idade (`{n} ano` / `{n} anos` / `—`) |
| Porte | Porte (Pequeno / Médio / Grande / `—`) |
| Descrição | Descrição |
| Cidade | Localização |

### Rodapé

| Elemento | Regra |
|----------|--------|
| Voltar | contorno cinza (classe do Cancelar do form); `pathFromStatus(status)` |
| Editar | **não** nesta página |
| Viewport estreita | Voltar em largura total |

### Layout

- **Não** usar `AuthLayout`. `PainelLayout` + tokens `--painel-*`.
- Título e subtítulo **acima** dos cards.
- Desktop: grade **~2/3 + 1/3**.
- Abaixo de ~900px: cards empilhados.
- Viewport ~360px: uma coluna; sem overflow horizontal.

### Acessibilidade mínima

- Nome na tabela: `aria-label="Ver detalhes de {nome}"`
- Heading `h1` + nome do animal em `h2` ou strong visível
- Erro `role="alert"`; loading `aria-busy`
- Chip de situação: texto, não só cor
- Outline roxo no foco (spec 003)
- Voltar é `<button>`, alvo ≥ 44px no mobile

## Arquitetura de código

```
src/
  pages/
    AnimalDetailPage.jsx          # novo — GET por id + seções
    AnimalDetailPage.module.css    # reusar tokens/cards da spec 007
    AnimaisListPage.jsx            # passa onOpen / navega no nome
    animaisListConfig.js          # + /detalhes em listItemIdFromLocation
  components/
    AnimalTable.jsx               # + onOpen (nome clicável)
  services/
    animalLabels.js               # + labelStatus (Para adoção / …)
    animaisService.js             # inalterado (já tem buscarAnimalPorId)
  App.jsx                          # rota :idAnimal/detalhes
```

Sem `AnimaisContext`. Sem persistir o detalhe. Sem lib nova.

`AnimalFormPage` **não** muda além de conviver com a rota irmã (zero alteração de form se o navigate do detalhe só usa a URL já existente).

## Regras de negócio (cliente)

1. Chamar `GET /animais/:id` ao abrir o detalhe. Não usar o item da lista como verdade.
2. Não chamar `POST` / `PATCH` / `DELETE` nesta página.
3. Não logar o JWT.
4. Labels em PT-BR; códigos `A`/`P`/`E` e `CAO`/`GATO` só no código.
5. Placeholder de foto local — sem URL e sem Storage.
6. Quem aparece: o registro pedido, **independente** de ser da ONG logada (GET público, igual à lista; ONG admin vê Mel).
7. Campos opcionais vazios: “—” na linha (idade/porte), alinhado à tabela.
8. Responsável: omitir a linha só se os dois tutores forem `null`.

## Decisões técnicas (fechadas em 2026-08-31)

| Item | Escolha |
|------|---------|
| Canal | Web (painel ONG) |
| Backend | **intocado** |
| Páginas | uma para A/P/E |
| HTTP | só `GET /animais/:id` |
| Mutação nesta página | nenhuma |
| Entrada | nome clicável |
| Rodapé | só Voltar |
| Editar / Excluir | só na lista |
| Contato | omitir |
| Foto | placeholder |
| Gênero / data / vacina / bairro | omitir |
| Tema | tokens do painel (não statusTheme do mobile) |
| Rota | `/painel/animais/:idAnimal/detalhes` |
| Número | **009** |

## Critérios de pronto (após implementação)

- [x] Pontos 1–7 confirmados pela autora
- [x] Login ONG → Adoção → clique em **Thor** → detalhe com nome, descrição, ONG, Lajeado - RS, chip Para adoção
- [x] Perdidos → **Luna** → detalhe com chip Perdido; cadastrado por ONG AdoPet Demo
- [x] Encontrados → **Mel** → detalhe com nome Mel, chip Encontrado, cadastrado por Usuario Demo
- [x] As três listas navegam para a **mesma** rota `…/detalhes`
- [x] Editar / Excluir na tabela **continuam** funcionando (não quebram ao clicar no nome)
- [x] Voltar retorna à lista da situação do animal
- [x] Sem botão Editar no detalhe (edição só na lista)
- [x] Backend parado → erro de rede + Tentar novamente
- [x] Id inexistente (ex.: `/painel/animais/99999/detalhes`) → “Animal não encontrado.”
- [x] 401 → login
- [x] Sem fotos reais, gênero, data, vacina, contato, Excluir nesta página
- [x] Sidebar destaca a lista da situação; perfil ONG / cadastro / exclusão **não** reescritos
- [x] Viewport ~360px usável, sem overflow horizontal
- [x] Backend intocado
- [x] CONTEXTO atualizado (checklist RF0006 no web; decisão na tabela §8)
- [x] `specs/README.md` — status aprovada e implementada (só depois de codar)

## Como validar (após implementação)

Pré-requisito: API + seed.

```bash
# terminal 1
cd D:\adopet-backend
npm run dev

# terminal 2
cd D:\adopet-web
npm run dev
```

1. Login `ong@adopet.local` / `senha123` → Adoção → clique em **Thor**
2. Conferir descrição do seed, ONG AdoPet Demo, Lajeado - RS, ID visível
3. Voltar → mesma lista Adoção
4. Encontrados → **Mel** → cadastrado por Usuario Demo
5. Perdidos → Luna → chip Perdido
6. No detalhe **não** há Editar; na lista, **Editar** e **Excluir** continuam
7. Na lista, **Excluir** continua com o diálogo
8. Parar o backend → reabrir um nome → erro de rede
9. Abrir `/painel/animais/99999/detalhes` → não encontrado
10. Largura ~360px: cards empilhados

## Checklist de implementação (após a autora aprovar)

1. [x] Fechar pontos 1–7 nesta spec + índice no `specs/README.md`
2. [x] `labelStatus` em `animalLabels.js`
3. [x] `AnimalDetailPage` + CSS (heading, cards, estados, rodapé)
4. [x] Rota em `App.jsx` + `listItemIdFromLocation`
5. [x] `AnimalTable`: `onOpen` no nome
6. [x] `AnimaisListPage`: navigate para `/detalhes?status=`
7. [x] CONTEXTO

## Relação com as specs 003, 007 e 008 (web)

- **003** nasceu a tabela. Esta 009 **só** torna o nome um atalho. Colunas, filtros e cadastrar ficam.
- **007** deixou o detalhe só leitura fora. O form e o `ConfirmDialog` **não** mudam. `buscarAnimalPorId` é reusado.
- **008** (perfil da ONG) não se mistura: `/painel/ong` continua o único destino do item Instituição.

## Relação com o mobile 008 e o backend 005

- Backend 005 já fechou `GET /animais/:id`. Esta fatia **consome**. Sem novo `include`.
- Mobile 008 é o paralelo de consulta no app (tema por situação, título genérico em Encontrados). Aqui o painel mostra **sempre** o `nome` (a tabela já faz isso) e usa a paleta roxa. Não compartilhar código entre repos.
