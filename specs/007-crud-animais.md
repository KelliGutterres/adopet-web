# Spec 007 — CRUD de animais no painel (ONG)

> **Status:** aprovada e implementada.  
> Depende de: spec 003 (shell + listagem); spec 002 (JWT ONG); backend specs 005 (`/animais`), 007 (`cidade`/`raca` inline) e **008** (ONG muta qualquer animal).  
> **Altera** o `adopet-backend` **somente** via spec 008 (autorização). Sem mudança de contrato JSON.  
> **Não altera** login, cadastro de ONG nem esqueci senha.

## Objetivo

Ativar o **cadastro, a edição e a exclusão** de animais no painel web da ONG, no layout da listagem (spec 003) e do print de cadastro. Cobre **RF0003** e completa **RF0010**, com usabilidade e responsividade (**RNF0001**, **RNF0006**).

O web continua **somente ONG**. CRUD do `usuario` permanece no mobile.

A ONG **é admin do painel**: edita e exclui **qualquer** animal da lista (próprio ou de usuário). Isso exige a backend spec 008 — hoje a API devolve 403 se não for dona.

## O que já existe (não reinventar)

| Já pronto | Onde |
|-----------|------|
| `GET /animais?status=`, `GET /animais/:id`, `POST /animais`, `PUT`/`PATCH /animais/:id`, `DELETE /animais/:id` | backend spec 005 |
| Body `cidade: { nome, uf }` e `raca: { nome }` (sem IDs) | backend spec 007 |
| ONG muta qualquer animal; usuário só o próprio | backend spec 008 |
| Shell sidebar + header, rotas A/P/E, tabela, filtros cliente | web spec 003 |
| Botões cadastrar / editar / excluir visíveis e **desabilitados** | web spec 003 |
| JWT da ONG; `Authorization: Bearer` | web spec 002 |
| Tokens roxos do painel | web spec 003 |

## Referência visual (TCC)

Prints em `docs/prototipos/`:

| Arquivo | Tela | Uso nesta spec |
|---------|------|----------------|
| [listagem-animais-adocao.png](../docs/prototipos/listagem-animais-adocao.png) | Listagem Adoção | Ações: **+ Cadastrar novo animal**, **Editar**, **Excluir** |
| [cadastro-animal-adocao.png](../docs/prototipos/cadastro-animal-adocao.png) | Cadastro (Fig. 16) | **Fonte do formulário**: título, cards Informações básicas + Localização, rodapé Cancelar / Salvar animal |
| Parte 1 — Fig. 17 | Edição | **Não veio print.** Mesma página do cadastro, modo edição |

Encontrados e Perdidos: mesmo formulário, copy da situação. Item ativo da sidebar = lista de origem (como no print de cadastro, “Animais para Adoção” permanece destacado).

O formulário **não** usa `AuthLayout`. É página autenticada no `PainelLayout`.

O print de cadastro também mostra **Solicitações** no menu e sino com badge — **não** entram nesta fatia (menu extra continua “Em breve”, como na spec 003).

## Escopo (esta tarefa)

1. Ativar **+ Cadastrar novo animal** nas três listagens → página de formulário
2. Ativar **Editar** em **todas** as linhas → mesma página, modo edição
3. Ativar **Excluir** em **todas** as linhas → diálogo no painel + `DELETE`
4. Consumir `POST`, `GET /:id`, `PATCH`, `DELETE` (após backend 008, sem 403 na ONG)
5. Formulário alinhado ao print, **somente campos da API** (ver tabela print × modelo)
6. Estados: loading, validação local, erro de API/rede, 404/409
7. Atualizar `docs/CONTEXTO-PROJETO.md` após aprovação + implementação

## Fora de escopo

- Upload / card **Fotos do animal** / Supabase (RF0007 — fase 2; print tem dropzone, **omitir o card inteiro**)
- Gênero, bairro, “outras informações”, editor rico (negrito/lista) — **não existem** no Animal
- Colunas Gênero / Cadastrado em / “Disponível” na tabela (spec 003)
- Tela de detalhes só leitura
- Campo **Situação** no form (a situação vem da **lista**; ver ponto 4)
- Filtros no servidor, paginação, autocomplete cidade/raça
- Item de menu **Solicitações**
- CRUD no mobile
- IA (RF0008)
- Testes automatizados
- Role `admin` no JWT

## RF/RNF relacionados

| ID | Cobertura nesta spec |
|----|----------------------|
| RF0003 | Cadastro, edição e exclusão no painel; qualquer registro |
| RF0010 | Painel de gerenciamento (não só listagem) |
| RF0004 | Listagem inalterada na estrutura; recarrega após mutação |
| RF0006 | **Parcial** — edição carrega o animal por id (sem fotos) |
| RF0007 | **Não** |
| RNF0001 | Layout do print (cards + rodapé); erros em PT-BR; exclusão confirmada |
| RNF0002 | Mutações com JWT |
| RNF0006 | Grade do print no desktop; empilha em viewport estreita |

## Contexto técnico (API)

Base: `VITE_API_URL`. Envelope: `{ "error": { "message": "..." } }`.  
`GET` público; o web envia Bearer assim mesmo. Mutações: JWT `ong`.

### Autorização (depois da backend spec 008)

| Papel | Ao criar | Editar / excluir |
|-------|----------|------------------|
| `ong` (painel) | animal fica da instituição logada | **qualquer** animal |
| `usuario` | (mobile) | (mobile — só o próprio) |

Seed: Thor/Luna (ONG) **e Mel** (usuário) — os três com Editar/Excluir **ativos** para a ONG.

Edição **não** transfere o tutor: Mel continua `usuario`; o body **não** envia `idUsuario` / `idInstituicao`.

### `POST /animais`

Auth: JWT. **201** `{ "animal": { ... } }`.

```json
{
  "nome": "Thor",
  "status": "A",
  "descricao": "Cachorro dócil disponível para adoção",
  "especie": "CAO",
  "idade": 3,
  "porte": "M",
  "cidade": { "nome": "Lajeado", "uf": "RS" },
  "raca": { "nome": "Vira-lata" }
}
```

| Campo | Obrigatório na API | No form web |
|-------|--------------------|-------------|
| `nome` | sim, 1–80 | sim |
| `status` | sim, `A`\|`P`\|`E` | **não aparece**; vem da lista de origem |
| `descricao` | sim, 1–200 | sim (textarea; sem rich text) |
| `especie` | sim, `CAO`\|`GATO` | sim |
| `idade` | não; anos ≥ 0 | opcional (print sem `*`) |
| `porte` | não na API | **obrigatório no form** (print tem `*`) |
| `cidade.nome` | sim, 1–60 | sim |
| `cidade.uf` | sim, 2 letras | sim (API exige; o print não tem UF — campo extra necessário) |
| `raca.nome` | sim, 1–60 | sim (API exige; print sem `*`) |

Não enviar `idCidade` / `idRaca`.

### `GET /animais/:id`

**200** `{ "animal" }`. **400** id inválido; **404** não encontrado.

### `PATCH /animais/:id`

Auth. Update parcial; o form envia os campos editáveis **exceto** `status` (não recategoriza).  
**200** `{ "animal" }`. **404** se não existe.  
Com a spec 008, a ONG **não** recebe 403 por dono.

O web usa **`PATCH`**.

### `DELETE /animais/:id`

**204**. **409** se houver `Transacao`. **404** se não existe.

### Print × modelo (formulário)

| Controle no print | No modelo/API? | Nesta fatia |
|-------------------|----------------|-------------|
| Título / subtítulo por situação | — | copy por lista (tabela abaixo) |
| Card Informações básicas | — | sim |
| Nome do animal `*` | `nome` | sim |
| Espécie `*` (Cachorro/Gato) | `especie` | select **Cão** / **Gato** (label da spec 003; body `CAO`/`GATO`) |
| Raça | `raca.nome` | texto; obrigatório (API) |
| Idade (select) | `idade` anos | select 0–20 anos + vazio; **sem meses** |
| Porte `*` | `porte` P/M/G | select Pequeno / Médio / Grande; obrigatório no cliente |
| Gênero `*` | **não existe** | **omitir** |
| Descrição (editor rico) | `descricao` varchar 200 | textarea simples, máx. 200 + contador |
| Card Fotos (até 5 JPG/PNG) | Storage futuro | **omitir o card** |
| Card Localização | — | sim (sem o card de fotos, ocupa a coluna direita) |
| Cidade `*` | `cidade.nome` | sim |
| UF | `cidade.uf` (API) | sim, ao lado da cidade |
| Bairro | **não existe** | **omitir** |
| Outras informações | **não existe** | **omitir** (descrição já cobre texto livre) |
| Cancelar / Salvar animal | — | rodapé do form, como o print |
| Situação A/P/E no form | `status` | **não**; implícita na lista |
| Tutor | JWT no create | **não** editável |

## Fluxos

### Cadastrar

```
ONG                         Web                         API
 |  lista (ex. Adoção)       |                           |
 |  + Cadastrar novo animal  |                           |
 |  /painel/animais/novo?status=A                        |
 |  form (sem campo situação)|                           |
 |-------------------------->|  POST /animais            |
 |                           |  status = A (da query)    |
 |                           |  201 { animal }           |
 |  lista Adoção             |                           |
```

1. Clique em **+ Cadastrar novo animal** na lista atual.
2. `/painel/animais/novo?status=A|P|E` conforme a rota (`adocao` → `A`, …). Query inválida/ausente → `A`.
3. **Não** há select de situação. Cidade/UF pré-preenchidas da ONG logada (editáveis).
4. Submit → validação → `POST` com `status` da query.
5. Sucesso → lista daquela situação.
6. Cancelar → lista de origem, sem POST.

### Editar

1. **Editar** em qualquer linha (Thor, Luna **ou Mel**).
2. `/painel/animais/:idAnimal/editar`.
3. `GET /animais/:id` preenche o form. `status` **não** vai no `PATCH` (permanece o atual).
4. Sucesso → lista do `status` do animal.
5. 404 / id inválido → mensagem + voltar à listagem.

### Excluir

1. **Excluir** em qualquer linha.
2. Diálogo: “Excluir **{nome}**? Esta ação não pode ser desfeita.”
3. Confirmar → `DELETE`. **204** → fecha e recarrega a lista.
4. Cancelar / `Esc` / overlay → sem request.
5. **Não** usar `window.confirm`.

### Falha

| Situação | UI |
|----------|----|
| 401 | deslogar → `/login` |
| 404 | `error.message` / “Animal não encontrado” |
| 409 | mensagem da API (transações) |
| Rede | mensagem da spec 002 |

## Contrato de UI

Idioma: **PT-BR**. Identificadores em inglês.

### Rotas

Estáticas **antes** de `:situacao`.

| Rota | Tela |
|------|------|
| `/painel/animais/adocao` | listagem `A`; cadastrar/editar/excluir ativos |
| `/painel/animais/encontrados` | listagem `E` |
| `/painel/animais/perdidos` | listagem `P` |
| `/painel/animais/novo?status=` | formulário criar |
| `/painel/animais/:idAnimal/editar` | formulário editar (`idAnimal` inteiro > 0) |

### Listagem (delta da spec 003)

| Elemento | Agora |
|----------|--------|
| + Cadastrar novo animal | ativo → `/novo?status=` da tela |
| Editar | ativo em **todas** as linhas |
| Excluir | ativo em **todas** as linhas → diálogo |
| Colunas / filtros / menu extra | inalterados |
| Foto na tabela | placeholder (iniciais) |

### Formulário — copy

Alinhado ao print de cadastro; Encontrados/Perdidos só mudam título/subtítulo.

| Situação | Título (cadastro) | Subtítulo (cadastro) |
|----------|-------------------|----------------------|
| `A` | Cadastrar novo animal para adoção | Preencha as informações do animal para disponibilizá-lo para adoção. |
| `E` | Cadastrar novo animal encontrado | Preencha as informações do animal cadastrado como encontrado. |
| `P` | Cadastrar novo animal perdido | Preencha as informações do animal cadastrado como perdido. |

| Elemento | Cadastro | Edição (sem print) |
|----------|----------|-------------------|
| Título | tabela acima | Editar animal |
| Subtítulo | tabela acima | Atualize os dados de {nome}. |
| Seção 1 | Informações básicas | igual |
| Seção 2 | Localização | igual |
| Submit | Salvar animal | Salvar animal |
| Loading | Salvando… | Salvando… |
| Cancelar | Cancelar | Cancelar |
| Loading GET | — | Carregando animal… |

| Campo | Label (print) | Controle |
|-------|---------------|----------|
| Nome | Nome do animal `*` | texto, máx. 80; placeholder “Ex: Thor” |
| Espécie | Espécie `*` | select Cão / Gato |
| Raça | Raça | texto, máx. 60; placeholder “Ex: SRD, Labrador” |
| Idade | Idade | select: Selecione + 0 a 20 anos (rótulo “0 anos” … “20 anos”) |
| Porte | Porte `*` | select: Selecione / Pequeno / Médio / Grande |
| Descrição | Descrição | textarea, máx. 200; placeholder “Descreva o temperamento, hábitos e outras informações importantes…” |
| Cidade | Cidade `*` | texto, máx. 60; placeholder “Ex: Lajeado” |
| UF | UF `*` | 2 letras; placeholder “Ex: RS” |

Asteriscos visíveis só nos obrigatórios do form (nome, espécie, raça, porte, descrição, cidade, UF).

Contador `{n}/200` na descrição.

### Validação no cliente (antes do POST/PATCH)

| Condição | Mensagem |
|----------|----------|
| Nome vazio | Informe o nome |
| Espécie vazia | Selecione a espécie |
| Raça vazia | Informe a raça |
| Porte vazio | Selecione o porte |
| Idade preenchida e inválida | Informe a idade em anos (0 ou mais) |
| Cidade vazia | Informe a cidade |
| UF inválida | Informe a UF (2 letras, ex.: RS) |
| Descrição vazia | Informe a descrição |
| Descrição > 200 | A descrição deve ter no máximo 200 caracteres |

Exibir `error.message` da API em `role="alert"`.

### Diálogo de exclusão

| Elemento | Copy |
|----------|------|
| Título | Excluir animal |
| Corpo | Excluir **{nome}**? Esta ação não pode ser desfeita. |
| Confirmar | Excluir (`--painel-danger`) |
| Cancelar | Cancelar |
| Loading | Excluindo… |

Foco inicial em Cancelar; `Esc` cancela; `role="dialog"` + `aria-modal="true"`.

### Layout (do print de cadastro)

- `PainelLayout` + tokens `--painel-*`.
- Título e subtítulo **acima** dos cards (não dentro do primeiro card).
- Desktop: grade **~2/3 + 1/3** — esquerda Informações básicas; direita Localização (fotos omitidas).
- Abaixo de ~900px: cards empilhados (básicas, depois localização).
- Campos em grade 2 colunas dentro de Informações básicas (nome pode ocupar a linha inteira; descrição também). Localização: cidade + UF na mesma linha.
- Cards brancos, borda suave, raio do painel.
- Rodapé do conteúdo: **Cancelar** (contorno cinza) à esquerda/direita conforme o print — **Salvar animal** roxo. Preferir barra inferior do card/área, sem sticky se complicar o MVP; se couber com CSS simples, repetir a barra do print.
- Viewport ~360px: uma coluna; sem overflow horizontal.

Sidebar no form: item da **lista de origem** (query `status` no cadastro; `animal.status` na edição) com `aria-current="page"`.

### Acessibilidade mínima

- `<form>` + `<label>`; `*` também em texto ou `aria-required`
- Erro `role="alert"`; loading `aria-busy`
- Diálogo: foco preso; retorno ao botão Excluir
- Outline roxo no foco

## Persistência e sessão

Inalteradas. Animal **não** vai para `localStorage`.

Prefill cidade no cadastro: `ong.cidade.nome` / `ong.cidade.uf` se existirem na sessão. **Não** chamar `GET /auth/me` só por cidade (`/me` não inclui cidade).

Não há checagem de dono na UI.

## Arquitetura de código

```
src/
  pages/
    AnimaisListPage.jsx
    AnimalFormPage.jsx
    AnimalFormPage.module.css
  components/
    AnimalTable.jsx              # Editar/Excluir sempre ativos (ONG)
    ConfirmDialog.jsx
    ConfirmDialog.module.css
  services/
    animaisService.js            # listar, buscarPorId, criar, atualizar, excluir
    animalLabels.js
  App.jsx
```

Sem `AnimaisContext`. Sem lib de form/modal. Campos nativos com tokens do painel (não `AuthLayout`/`TextField` de login, salvo se o visual casar sem esforço).

Implementar **depois** (ou junto) da backend spec 008 — senão Mel quebra com 403.

## Regras de negócio (cliente)

1. Só os endpoints `/animais` listados (+ auth já existente).
2. Não enviar `idCidade`, `idRaca`, `idInstituicao`, `idUsuario`.
3. `status` no POST = query da lista; no PATCH **omitir** `status`.
4. Idade vazia → não enviar `idade`. Porte sempre envia `P`\|`M`\|`G`.
5. Validar no cliente antes; a API valida de novo.
6. Não logar o JWT.
7. Labels PT-BR; códigos só no body.
8. Após mutação, novo `GET` da lista.
9. Hard-delete; sem lixeira.

## Decisões técnicas (fechadas em 2026-08-19)

| Item | Escolha |
|------|---------|
| Canal | Web (painel ONG) |
| Backend | spec **008**: ONG muta qualquer animal |
| Listas | CRUD nas **três** (A/P/E) |
| Layout cadastro | print `cadastro-animal-adocao.png` (página, não modal) |
| Layout edição | mesmo form (sem print 17) |
| Foto | omitir (fase 2) |
| Gênero / bairro / outras info / rich text | omitir |
| Cidade no cadastro | prefill da ONG, editável |
| UF | no card Localização (API exige) |
| Porte | obrigatório no form |
| HTTP update | `PATCH` |
| Exclusão | diálogo no painel |
| Dono na UI | **não** restringe; Mel é editável |

## Ponto 4 — situação no formulário (fechado em 2026-08-19)

O print de cadastro **não tem** um campo “Adoção / Perdido / Encontrado”. Confirmado pela autora: a situação vem da **lista**.

- Cadastro em Adoção → grava `status=A` (oculto)
- Cadastro em Perdidos → `P`; em Encontrados → `E`
- Edição **não** troca a situação

## Critérios de pronto

- [x] Spec aprovada (ponto 4 confirmado)
- [x] Backend spec 008 implementada (ONG edita Mel sem 403)
- [x] Login ONG → Adoção → cadastrar → animal na tabela Adoção
- [x] Cadastrar a partir de Perdidos → aparece em Perdidos
- [x] Editar Thor → `PATCH` 200 → lista atualizada; **não** muda de lista
- [x] Editar **Mel** → 200; Mel continua da usuária
- [x] Excluir (diálogo) → some da lista
- [x] Sem card de fotos, sem gênero, sem bairro
- [x] Sem select de situação no form
- [x] Validação local impede salvar sem nome
- [x] Backend parado → erro de rede
- [x] 401 → login
- [x] Viewport ~360px usável
- [x] Layout reconhecível em relação a `cadastro-animal-adocao.png`
- [x] CONTEXTO atualizado (web + backend)

## Como validar (após implementação)

```bash
cd ~/adopet-backend && npm run dev
cd ~/adopet-web && npm run dev
```

1. Login `ong@adopet.local` / `senha123` → Adoção → **+ Cadastrar novo animal**
2. Conferir visual com `docs/prototipos/cadastro-animal-adocao.png` (sem o card de fotos)
3. Salvar “Bidu”, Cão, SRD, porte médio, Lajeado/RS → volta à Adoção com Bidu
4. Encontrados → **Editar Mel** → alterar descrição → salvar → Mel segue em Encontrados
5. Excluir Bidu → confirma → some
6. Cancelar no form → lista sem POST
7. Largura ~360px: cards empilhados

> Seed de volta: `npm run prisma:seed` no backend.

## Checklist de implementação (após aprovação)

1. Backend spec 008 (`assertPodeMutar`)
2. Spec 007 + índice web
3. `animaisService` completo
4. Rotas `novo` e `:idAnimal/editar`
5. `AnimalFormPage` (cards do print)
6. Botões da listagem + `ConfirmDialog`
7. CONTEXTO web e backend
