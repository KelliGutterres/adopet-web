# Spec 013 — Comparação de similaridade (painel web)

> **Status:** aprovada e implementada (refinamento técnico fechado em 2026-09-19; código em 2026-09-28).  
> Depende de: spec 001 (rotas + `api.js`); spec 003 (sidebar + tabela + estados); spec 009 (`AnimalDetailPage`); spec 011 (`PhotoDropzone` + JPEG + `requestForm`); **backend spec 012** (`POST /animais/comparar`); **mobile spec 016** (mesmo contrato de UI/copy, canal diferente).  
> **Não altera** o `adopet-backend` nesta fatia (contrato já na API 012; JWT `ong` já autorizado).  
> **Não altera** o `adopet-mobile` (RF0008 no app já fechado na spec 016).  
> Fecha **RF0008** no canal web.

O web é **somente ONG**. A comparação roda no **Node + Python**; o painel só envia a foto e mostra os candidatos. A ONG **não** chama o FastAPI nem envia `X-AI-Service-Secret`.

---

## Objetivo

Permitir que a ONG autenticada **envie uma foto** (arquivo, arrastar/soltar ou câmera) e veja **animais perdidos/encontrados visualmente semelhantes**, com score. Entrada: item **Comparação de Similaridade** no menu do painel.

Cobre **RF0008** no web e usabilidade/responsividade (**RNF0001**, **RNF0006**). Sem secret do Python no browser (**RNF0002**).

---

## Recorte vs o que já existe

| Fluxo | Onde está | Nesta spec |
|-------|-----------|------------|
| Sidebar (A / E / P / Usuários / ONG) | spec 003 | **acrescentar** item habilitado **Comparação de Similaridade** |
| Dashboard / Relatórios / Configurações | spec 003 | **inalterados** — continuam “Em breve” |
| `PhotoDropzone` (arquivo, câmera, drag-drop, JPEG) | spec 011 | **reusar** (não é upload de cadastro) |
| `POST /animais/:id/imagem` | spec 011 | **inalterado** — foto da busca **não** grava no Storage |
| `POST /animais/comparar` | backend spec 012 | **consumir** (JWT `ong`) |
| Detalhe A/P/E | spec 009 | toque no candidato navega para o detalhe já existente |
| Listagens A/P/E (CRUD) | specs 003 / 007 | **inalteradas** — sem botão câmera nesta fatia |
| Adoção (`A`) | spec 003 / backend 012 | **não** entra no ranking (API) |
| Busca por foto no mobile | mobile spec 016 | **fora** — mesmo contrato, outro canal |

---

## Referência visual

Não há print de similaridade na Parte 1 (Fig. 16 = cadastro; Fig. 17 = edição). Espelhar o **idioma do painel** (spec 003): sidebar + card + tabela + estados vazio/loading/erro. O dropzone segue o card Fotos da spec 011. Copy e estados vêm da **mobile spec 016**, adaptados ao desktop.

| Fonte | Uso |
|-------|------|
| Spec 003 (`AnimaisListPage` + `AnimalTable`) | Shell, heading, tabela, empty/loading/erro |
| Spec 011 (`PhotoDropzone`) | Escolher arquivo / Tirar foto / arrastar; JPEG no canvas |
| Spec 009 | Nome clicável → `/painel/animais/:id/detalhes?status=` |
| Mobile spec 016 | Copy PT-BR, chip de score, estados da busca |
| Backend 012 | Envelope `{ candidatos: [{ scoreSimilarity, animal }] }` |

```
[sidebar]                         [header ONG]
  …                               Comparação de Similaridade
  Animais Perdidos                Envie uma foto para encontrar animais
  Comparação de Similaridade  ←   perdidos ou encontrados parecidos
  Usuários
  …

── estado inicial ──
[dropzone] Clique para enviar foto ou arraste e solte aqui
[ Escolher arquivo ]  [ Tirar foto ]

── após a busca ──
[foto enviada]   Nova busca
2 animais semelhantes

| Similaridade | Situação   | Animal     | Espécie / Raça | Idade | Porte   |
| 91%          | Encontrado | Luna  #12  | Gato …         | …     | Pequeno |
| 74%          | Perdido    | Thor  #3   | Cão …          | …     | Médio   |
```

---

## Escopo (esta tarefa)

1. Item de menu **Comparação de Similaridade** (habilitado) → rota `/painel/similaridade`
2. Página `SimilarityPage`: vazia → dropzone → loading → resultados (ou vazio após busca)
3. `animaisService.compararAnimais(file)` → `POST /animais/comparar` (multipart `imagem`, JWT ONG)
4. Timeout de **90 s** só nesta rota (ResNet50 em CPU)
5. Tabela com coluna de score (%) + situação (P/E); nome → detalhe (009)
6. Estados: loading, vazio (ninguém no corte), erro (400/503/rede/timeout), 401 → logout
7. Atualizar `docs/CONTEXTO-PROJETO.md` após implementação

---

## Fora de escopo

- Alterar o `adopet-backend` (limiar, limite, modelo, `Transacao`, embedding)
- Guardar a foto da busca no Storage
- Comparar animais de **adoção**
- Query `limite` / `minScore` / `statusAlvo` na UI (usar **padrão da API**: 5, 0,6, `P,E`)
- Botão câmera / “Buscar por foto” nas listas A/P/E (entrada **só** pelo menu)
- Editar / excluir candidato a partir desta tela (CRUD continua nas listas)
- Filtros avançados (RF0005) sobre o ranking
- Ajustar o limiar no painel
- Histórico de buscas / lista de `Transacao`
- Webcam custom com `getUserMedia` (mesmo recorte da spec 011: `capture="environment"`)
- TypeScript, Tailwind, testes automatizados
- Role `admin`

---

## RF/RNF relacionados

| ID | Cobertura nesta spec |
|----|----------------------|
| RF0008 | **Sim** — enviar foto e receber candidatos semelhantes |
| RF0007 | Reusa dropzone/câmera já da spec 011; **não** é o upload do cadastro |
| RF0004 / RF0006 | Resultado usa tabela + detalhe já existentes |
| RF0010 | Novo item no painel administrativo da ONG |
| RNF0001 | Entrada óbvia no menu; loading e vazio explícitos |
| RNF0002 | JWT no multipart; Python só o Node chama |
| RNF0006 | Página usável no desktop e no viewport estreito (tabela com scroll) |

---

## O que já existe (não reinventar)

| Já pronto | Onde |
|-----------|------|
| `POST /animais/comparar` JWT `usuario` **ou** `ong`; campo `imagem`; 200 `{ candidatos }`; 503 se Python fora | backend spec 012 |
| Padrão: `limite=5`, `minScore=0.6`, `statusAlvo=P,E`; lista vazia ainda 200 | backend spec 012 |
| `animal` no candidato = mesmo formato do `GET /animais/:id` (sem `embedding`) | backend spec 012 |
| `PhotoDropzone` + `fileToJpegFile` | spec 011 |
| `requestForm` (multipart, sem `Content-Type: application/json`) | spec 011 / `api.js` |
| Proxy Vite `/animais` | spec 001 — cobre `/animais/comparar` |
| `AnimalTable` / `AnimalDetailPage` / `AnimalPhoto` | specs 003 / 009 / 011 |
| 401 → `logout()` + `/login` | padrão das páginas autenticadas |

O browser **não** chama o FastAPI. Nunca `X-AI-Service-Secret`.

---

## Contrato de API (consumo)

`POST /animais/comparar`  
Auth: Bearer JWT `ong`  
Body: `multipart/form-data`, campo **`imagem`** (JPEG, como a spec 011).  
Query: **omitida** (padrão do servidor).

**200**

```json
{
  "candidatos": [
    {
      "scoreSimilarity": 0.9123,
      "animal": { }
    }
  ]
}
```

**400** arquivo inválido · **401** sem JWT → logout · **503** `{ error: { message } }` (IA fora)

A foto da busca **não** é persistida. Cada busca bem-sucedida grava `Transacao` no servidor (o painel não lê essa tabela).

---

## Decisões desta rodada (2026-09-19)

| # | Tema | Decisão |
|---|------|---------|
| 1 | Entrada | **Só o menu** — item **Comparação de Similaridade** após Perdidos. Sem atalho nas listas (o painel já é gestão; o atalho P/E no mobile existia porque a aba era fácil de não achar) |
| 2 | Picker | **Reusar `PhotoDropzone`** (arquivo + câmera + drag-drop). Conversão JPEG igual à 011 |
| 3 | Disparo | Ao confirmar o arquivo (depois do JPEG), **dispara a comparação na hora** — equivalente ao picker do mobile. Trocar a foto = nova busca |
| 4 | Catálogo | Padrão da API (`P` e `E`); **sem** `statusAlvo` cruzado na UI |
| 5 | Score | Inteiro `91%` (`Math.round(score * 100)`); `aria-label` “91% semelhante” |
| 6 | Timeout | **90 s** só em `/animais/comparar`. `requestForm` distingue abort de rede. Demais rotas inalteradas |
| 7 | Resultados | **Tabela** (idioma do painel), não cards. Colunas extra: Similaridade + Situação. Sem Editar/Excluir |
| 8 | Foto enviada | Preview local (`URL.createObjectURL`); **não** sobe ao Storage. Revogar o object URL ao resetar |
| 9 | Rota | `/painel/similaridade` (identificador em inglês, rótulo em PT-BR) |
| 10 | Ícone do menu | Dois círculos sobrepostos (similaridade visual); SVG inline como os demais ícones da sidebar |

Cancelar o seletor de arquivo **não** dispara POST. Filtros das listagens e CRUD **inalterados**.

---

## Contrato de UI

Idioma: **PT-BR**. Identificadores de código em inglês.

### Sidebar

| Item | Hoje (003) | Nesta spec |
|------|------------|------------|
| Comparação de Similaridade | não existe | **habilitado**; `NavLink` para `/painel/similaridade` |

Ordem: Dashboard (disabled) → Adoção → Encontrados → Perdidos → **Comparação de Similaridade** → Usuários → ONG → Relatórios (disabled) → Configurações (disabled).

`listItemIdFromLocation`: pathname `/painel/similaridade` → `similaridade`. Detalhe aberto **a partir desta tela** não precisa marcar o item de A/P/E; o `?status=` do detalhe continua só para o “voltar” visual das listas.

### Página `SimilarityPage`

Heading: título **Comparação de Similaridade**.

| Estado | Copy |
|--------|------|
| Inicial | subtítulo “Envie uma foto para encontrar animais perdidos ou encontrados parecidos”; dropzone visível |
| Loading | “Comparando imagens… Pode levar alguns segundos.” Dropzone desabilitado |
| Vazio após busca | “Nenhum animal semelhante encontrado.” |
| Erro | mensagem da API (`error.message`) ou rede/timeout; botão “Tentar novamente” |
| Resultados | “N animal semelhante” / “N animais semelhantes”; tabela com score + situação |
| Nova busca | “Nova busca” (limpa preview, candidatos e erro; volta ao dropzone) |

Toque no **nome** do candidato → `AnimalDetailPage` (`idAnimal` + `status` do animal retornado), só leitura, como nas listas.

401 em qualquer passo → `logout()` + `/login` (igual às outras telas).

### Copy compartilhada (alinhada à mobile 016)

| Elemento | Texto |
|----------|--------|
| Menu / título | Comparação de Similaridade |
| Subtítulo | Envie uma foto para encontrar animais perdidos ou encontrados parecidos |
| Dropzone | Clique para enviar foto ou arraste e solte aqui |
| Loading | Comparando imagens… Pode levar alguns segundos. |
| Vazio | Nenhum animal semelhante encontrado. |
| Timeout | A comparação demorou demais. Tente novamente. |
| 503 | Serviço de comparação indisponível (texto da API) |
| Nova busca | Nova busca |
| Tentar novamente | Tentar novamente |
| Foto enviada | Foto enviada |

### Tabela de candidatos

| Coluna | Origem |
|--------|--------|
| Similaridade | chip `91%` a partir de `scoreSimilarity` |
| Situação | `labelStatus` (`Perdido` / `Encontrado`) |
| Animal | foto + nome clicável + `ID: #n` (igual spec 003) |
| Espécie / Raça | igual `AnimalTable` |
| Idade | igual `AnimalTable` |
| Porte | igual `AnimalTable` |
| Ações | **omitir** |

Ordem das linhas = ordem da API (já ranqueada). Sem sort/filtro extra no cliente.

### Acessibilidade mínima

- Item de menu com `aria-current="page"` quando ativo
- Dropzone: `aria-label="Enviar foto para comparar"`; `aria-busy` no loading
- Chip: `aria-label="{n}% semelhante"`
- Nome do animal: `aria-label="Ver detalhes de {nome}"`
- Loading com `aria-live="polite"`
- Área de toque ≥ 44px em Nova busca / Tentar novamente

---

## Refinamento técnico

### Sequência

```
ONG  →  PhotoDropzone (JPEG)  →  compararAnimais(file)
                                      │
                                      ▼
                                 POST /animais/comparar
                                 Authorization: Bearer {JWT ong}
                                 multipart campo imagem
                                      │
                    Node (embedding Python + cosseno + Transacao)
                                      │
                                      ▼
                                 { candidatos: [...] }
                                      │
ONG  ←  SimilarityPage (preview + tabela ou empty/erro)
         clique no nome → /painel/animais/:id/detalhes?status=P|E
```

Timeout 90 s no `fetch`. Abort → copy de timeout, sessão preservada. Python parado → 503 da API, sessão preservada.

### Arquitetura de código

```
src/
  App.jsx                         # + Route path="similaridade"
  components/
    Sidebar.jsx                   # item + ícone similaridade
    AnimalTable.jsx               # variant similarity: score + situação; sem ações
    PhotoDropzone.jsx             # reusar; aria-label/copy via props se preciso
  pages/
    SimilarityPage.jsx            # nova
    SimilarityPage.module.css     # nova (heading + query row + estados)
    animaisListConfig.js          # listItemIdFromLocation → similaridade
  services/
    api.js                        # timeoutMs + timeoutMessage no requestForm
    animaisService.js             # compararAnimais (90 s)
    animalLabels.js               # labelScoreSimilarity
```

Fluxo: JPEG `File` → `compararAnimais(file)` → lista `candidatos` → detalhe.

Sem Context novo. Sem persistir o blob da busca. Sem chamar `/embed`. Sem query string na comparação.

### Contratos de código

**`requestForm(path, formData, options)`** — passa a aceitar `timeoutMs` e `timeoutMessage` (opcionais). Implementação: `AbortController` + `setTimeout` (mesmo padrão do mobile), **não** só `AbortSignal.timeout` (o `catch` atual do `fetch` engole abort como “rede”). Abort → `ApiError` com `timeoutMessage`. Sem `timeoutMs`, comportamento atual (sem limite extra).

**`compararAnimais(file)`**

- Recusa blob vazio (`ApiError` 400, copy já usada no upload: `imagem é obrigatório`)
- `FormData.append('imagem', file, 'foto.jpg')`
- `requestForm('/animais/comparar', formData, { timeoutMs: 90000, timeoutMessage: 'A comparação demorou demais. Tente novamente.' })`
- Retorna `Array.isArray(data?.candidatos) ? data.candidatos : []`

**`labelScoreSimilarity(score)`** — `null`/não finito → `''`; senão `` `${Math.round(Number(score) * 100)}%` ``.

**`AnimalTable`** — prop opcional `variant`: `'crud'` (padrão, inalterado) | `'similarity'`. Em `similarity`:

- `animais` é a lista de candidatos `{ scoreSimilarity, animal }`
- colunas Similaridade e Situação à esquerda
- sem `onEdit` / `onDelete` / coluna Ações
- `onOpen(animal)` recebe o `animal` interno

Não duplicar a tabela. Listagens A/P/E não passam `variant`.

**`PhotoDropzone`** — reusar. Se o `aria-label` / texto do placeholder precisarem diferir do cadastro, aceitar props opcionais (`ariaLabel`, `placeholder`); default = copy atual da 011. Sem segundo componente de dropzone.

**`SimilarityPage`** — estados locais: `file`, `previewUrl`, `candidatos`, `loading`, `error`, `searched`. `useEffect` de cleanup revoga `URL.revokeObjectURL(previewUrl)`. “Tentar novamente” reenvia o mesmo `file` se ainda houver; senão volta ao dropzone.

Registrar a rota **antes** de `animais/:situacao` não é necessário (`similaridade` não colide). Fica irmã de `usuarios` / `ong`:

```jsx
<Route path="similaridade" element={<SimilarityPage />} />
```

### Regras de negócio (cliente)

1. Não chamar o Python. Não enviar `embedding` no body.
2. Não persistir a foto da busca; não chamar `POST /animais/:id/imagem` neste fluxo.
3. Não comparar adoção no cliente (a API já exclui `A`).
4. Não inventar query `limite` / `minScore` / `statusAlvo`.
5. 401 → logout. 503 / timeout → mensagem na tela, sessão preservada.
6. Cancelar o seletor de arquivo não dispara POST.
7. Não logar JWT nem o vetor.
8. Object URL da preview só existe na sessão da página; F5 volta ao estado inicial.

### Responsividade

Mesmos tokens `--painel-*`. Tabela com `overflow-x: auto` (já em `AnimalTable`). Dropzone e query row empilham no viewport estreito. Sidebar recolhida (spec 003) inalterada.

---

## Critérios de pronto

- [x] Pontos 1–7 fechados nesta spec (após aprovação)
- [x] Item **Comparação de Similaridade** no menu abre a página e **não** está “Em breve”
- [x] Listas A/P/E **sem** botão extra de busca por foto
- [x] Dropzone arquivo/câmera/drag-drop → `POST /animais/comparar` → tabela com % e situação
- [x] Lista vazia 200 mostra o empty state (não é erro)
- [x] Nome do candidato abre o detalhe (009)
- [x] 401 desloga; 503 mostra a mensagem da API; timeout mostra a copy desta spec
- [x] Foto da busca não aparece nas listas (não gravou Storage)
- [x] Backend e mobile intocados
- [x] CONTEXTO + `specs/README.md` atualizados

---

## Como validar (após implementação)

Pré-requisito: API Node **e** serviço Python (`ai/`) no ar; animais P/E **com foto** (embedding gerado no upload).

```bash
# terminal 1 — API
cd D:\adopet-backend
npm run dev

# terminal 2 — IA
cd D:\adopet-backend\ai
# venv + uvicorn na porta 8000 (README em ai/)

# terminal 3 — painel
cd D:\adopet-web
npm run dev
```

1. Login da ONG (`ong@adopet.local` / `senha123`)
2. Menu **Comparação de Similaridade** → enviar foto (arquivo ou câmera) → loading → tabela ou vazio
3. Conferir % e situação Perdido/Encontrado; abrir um detalhe; voltar (navegador) preserva a página se o estado ainda estiver montado — F5 zera a busca (esperado)
4. Listas A/P/E: CRUD inalterado; sem botão de busca por foto
5. Cancelar o seletor de arquivo não chama a API
6. Parar o Python → 503 na tela, ONG continua logada
7. Adoção **não** aparece no ranking (mesmo com foto parecida)

Seed sem foto **não** entra no ranking (sem embedding). Para ver score > 0, usar animais cadastrados com imagem (spec 011 / backend 012).

---

## Checklist de implementação (após aprovação)

1. [x] Spec (este arquivo) + índice no `specs/README.md`
2. [x] `requestForm` com `timeoutMs` / `timeoutMessage`; `compararAnimais` com 90 s
3. [x] `labelScoreSimilarity`; `AnimalTable` variant `similarity`
4. [x] `SimilarityPage` + CSS
5. [x] Rota `/painel/similaridade` + item na sidebar + `listItemIdFromLocation`
6. [x] CONTEXTO (RF0008 no web; decisão §8; rota do painel)
