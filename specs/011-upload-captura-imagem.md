# Spec 011 — Upload e captura de imagem do animal (painel web)

> **Status:** aprovada e implementada.  
> Pontos 1–8 fechados em 2026-09-03.  
> Depende de: spec 007 (`AnimalFormPage` criar/editar); spec 009 (`AnimalDetailPage` + placeholder); spec 003 (`AnimalTable` + iniciais); backend spec 010 (`POST`/`DELETE /animais/:id/imagem`, `urlImagem`).  
> **Não altera** o `adopet-backend` nesta fatia (contrato já pronto).  
> **Não altera** o `adopet-mobile` (RF0007 no app já fechado na mobile spec 012).  
> Fecha **RF0007** no canal web e a parte de **fotos** do **RF0006** / **RF0004** no painel (exibir a URL que a API já devolve).

O web é **somente ONG**. A ONG **é admin**: envia, troca ou remove a foto de **qualquer** animal da lista (próprio ou de usuário) — `assertPodeMutar` já na API. Listas e detalhe **mostram** a foto. Mutação **só** no form (criar/editar).

O print de cadastro (Fig. 16) tem dropzone “até 5 imagens”. A API (backend spec 010) é **uma** foto. Esta fatia **adapta** o card: visual do print, contrato de **uma** imagem.

---

## Objetivo

Permitir que a ONG **escolha um arquivo (galeria / arrastar) ou tire uma foto com a câmera do dispositivo**, anexe **uma** imagem ao animal e veja essa foto na tabela, no detalhe e no preview do form.

Cobre **RF0007** (galeria ou câmera) no painel e completa **RF0006** / **RF0004** no web (hoje o placeholder de iniciais). Armazenamento continua no **Supabase via Node** (**RNF0004**); o browser **não** recebe chave do Storage.

A API já existe (backend spec 010). Esta fatia é **cliente**: picker + dropzone + multipart + exibir `urlImagem`.

---

## Recorte vs o que já existe

| Fluxo | Onde está | Nesta spec |
|-------|-----------|------------|
| `POST /animais` JSON (sem arquivo) | spec 007 / backend 005 | **inalterado na API** — o painel, no cadastro, **sempre** manda a foto em seguida (ponto 3) |
| `PATCH /animais/:id` JSON | spec 007 | **inalterado** — **não** enviar `urlImagem` no body |
| `POST` / `DELETE /animais/:id/imagem` | backend spec 010 | **consumir** |
| `GET` lista/detalhe com `urlImagem` | backend spec 010 | **exibir** (hoje o painel ignora o campo) |
| Placeholder de iniciais na tabela/detalhe | specs 003 / 009 | **fallback** se `urlImagem` for `null` ou a imagem falhar |
| Cadastro / edição no form | spec 007 | **acrescentar** card Fotos (omitido de propósito) |
| Layout do form (2/3 + 1/3) | spec 007 | **restaurar** o card da coluna direita **acima** de Localização |
| Detalhe só leitura | spec 009 | **só exibir**; sem Tirar foto / Editar (ponto 1) |
| Upload no mobile | mobile spec 012 | **fora** |
| IA / similaridade | RF0008 | **fora** |

Duas etapas no servidor (cadastro JSON + foto), **uma** ação “Salvar animal” na UI — igual a backend spec 010 e ao mobile 012. No cadastro o painel **sempre** chama as duas rotas.

---

## Referência visual

Prints em `docs/prototipos/`:

| Arquivo | Tela | Uso nesta spec |
|---------|------|----------------|
| [cadastro-animal-adocao.png](../docs/prototipos/cadastro-animal-adocao.png) | Cadastro (Fig. 16) | **Card Fotos do animal**: dropzone tracejada, ícone de nuvem, copy de clique/arraste. **Desvio:** 5 slots e “até 5 imagens” → **um** preview (API = 1 foto). Gênero / bairro / rich text continuam omitidos (spec 007) |
| [listagem-animais-adocao.png](../docs/prototipos/listagem-animais-adocao.png) | Listagem Adoção | Slot da coluna Animal (hoje iniciais) passa a `<img>` quando houver URL |
| Spec 009 (hero do detalhe) | Detalhe | Quadrado 72×72: foto ou iniciais |
| Spec 007 (`AnimalFormPage`) | Form | Coluna direita: Fotos **depois** Localização no markup empilhado; desktop = fotos acima de localização |

O formulário **não** usa `AuthLayout`. Continua página autenticada no `PainelLayout`.

---

## Escopo (esta tarefa)

1. Card **Fotos do animal** no `AnimalFormPage` (criar **e** editar): dropzone, preview, **Escolher arquivo**, **Tirar foto**, remover
2. `<input type="file">` + arrastar/soltar; captura via `capture="environment"` (sem `getUserMedia` nesta fatia)
3. `animaisService.enviarImagem` / `removerImagem` + `requestForm` no `api.js` (sem `Content-Type: application/json`)
4. Cadastro: foto **obrigatória no painel** (ponto 3, igual ao mobile) → sempre `POST /animais` **e** `POST /animais/:id/imagem` (API continua aceitando animal sem foto)
5. Edição: `PATCH` dos campos (como hoje) **e/ou** `POST` imagem nova **e/ou** `DELETE` se a ONG removeu a foto; foto **não** é obrigatória na edição
6. Exibir `urlImagem` em `AnimalTable` (três listas) e no hero de `AnimalDetailPage`; fallback iniciais
7. Conversão JPEG no cliente (canvas); MIME/8 MB tratados **antes** do upload
8. Atualizar `docs/CONTEXTO-PROJETO.md` após implementação

---

## Fora de escopo

- Alterar o `adopet-backend` (MIME, limite, envelope, várias fotos, thumbnail no servidor)
- Várias fotos por animal / 5 slots do print / carrossel / tabela `Imagem`
- Foto de perfil da ONG ou do usuário
- Upload direto ao Supabase (Publishable key)
- Webcam custom com `getUserMedia` / preview ao vivo / flash (paralelo ao mobile sem `expo-camera`)
- Recorte 1:1 com lib de crop (o mobile usa `allowsEditing`; no web a exibição é `object-fit: cover`)
- Mutar foto no detalhe (spec 009 permanece só Voltar)
- Ativar sino, Solicitações, Dashboard, Relatórios, Configurações
- Gênero, bairro, “outras informações”, editor rico (já omitidos na 007)
- Serviço Python / `Transacao` / RF0008
- TypeScript, Tailwind
- Testes automatizados
- Role `admin` no JWT

---

## RF/RNF relacionados

| ID | Cobertura nesta spec |
|----|----------------------|
| RF0007 | **Sim** — arquivo (galeria/disco) **e** câmera no form do animal |
| RF0003 | Foto entra no cadastro/edição A/P/E da ONG (qualquer registro) |
| RF0004 | Tabela da lista mostra a foto quando houver URL |
| RF0006 | Detalhe mostra a foto quando houver URL |
| RF0008 | **Não** |
| RNF0001 | Dropzone do print; erro em PT-BR; fallback se a URL falhar |
| RNF0002 | Multipart com JWT; Secret do Storage continua só no Node |
| RNF0004 | Blob no Storage; o painel só envia arquivo e lê URL |
| RNF0006 | Card empilha abaixo de ~900px; dropzone usável em ~360px |

---

## O que já existe (não reinventar)

| Já pronto | Onde |
|-----------|------|
| `POST /animais/:id/imagem` multipart campo **`imagem`**; JPEG/PNG/WebP; **8 MB** | backend spec 010 |
| `DELETE /animais/:id/imagem` → **204** (idempotente) | backend spec 010 |
| `GET` devolve `urlImagem` (`null` ou URL pública) | backend spec 010 |
| JSON create/update **recusa** `urlImagem` (**400**) | backend spec 010 |
| ONG muta qualquer animal; usuário só o próprio | backend spec 008 |
| `AnimalFormPage` criar + editar; 401 → logout | spec 007 |
| Placeholder iniciais na tabela e no detalhe | `AnimalTable` / `AnimalDetailPage` / `iniciaisNome` |
| `request()` força `Content-Type: application/json` e `JSON.stringify` | `api.js` — **não serve** para arquivo |
| Vite + React JS; CSS Modules; tokens `--painel-*` | spec 001 / 003 |
| Seed: Thor, Luna, Mel **sem** foto (`urlImagem` null) | backend spec 010 |

O painel passa a chamar `POST`/`DELETE .../imagem` além do JSON já existente. Nunca `/auth/usuarios/*`. A ONG **pode** mutar a foto da Mel (admin).

---

## Refinamento técnico

### Papéis (inalterados)

```
Painel (React)  --JWT+multipart-->  Node  --service_role-->  Supabase Storage
Painel (React)  <-- urlImagem -----  GET /animais
```

O cliente **não** conhece `SUPABASE_URL` / Secret. Só a URL pública que o GET já traz. Sem `@supabase/supabase-js` no web.

### Duas etapas (cadastro) — sempre as duas rotas

No **cadastro** o painel exige foto **só no front** (ponto 3, igual ao mobile). A API **não muda**: `POST /animais` ainda aceita animal sem `urlImagem`. O form recusa Salvar sem preview local.

1. Validar form (spec 007) **e** foto presente (MIME/tamanho no cliente).
2. `POST /animais` → **201** `{ animal }`.
3. **Sempre** `POST /animais/:id/imagem` com o mesmo JWT (não há cadastro no painel sem este segundo passo).
4. Sucesso das duas → lista da situação (spec 007).
5. JSON 201 e imagem falha → ponto 4 (animal existe sem foto; aviso).

Na UI continua um único **Salvar animal**.

Na **edição** o `PATCH` continua como hoje (body completo dos campos editáveis, **sem** `status` e **sem** `urlImagem`). POST/DELETE de imagem **só** se a foto mudou.

O web **não** replica o dirty de campos do mobile 011: o form 007 já manda o PATCH inteiro. O que entra de novo é o **dirty da foto** (arquivo local ou flag de remoção).

### Estado da foto no form

```
remoteUrl: string | null   // urlImagem do GET (edição) ou null (cadastro)
localFile: File | null     // arquivo escolhido, ainda não enviado
removed: boolean           // ONG tocou Remover sobre a URL remota
```

Preview = object URL do `localFile` **ou** (`!removed` && `remoteUrl`) **ou** placeholder.

| Estado no save (edição) | Ação HTTP extra |
|-------------------------|-----------------|
| Sem mudança (`localFile` null e `removed` false) | não chama imagem; só PATCH |
| `localFile` novo | `POST .../imagem` (substitui no servidor) |
| Tinha URL e a ONG tocou **Remover foto** (`removed` e sem `localFile`) | `DELETE .../imagem` |
| Campos + foto | PATCH e depois POST/DELETE (nessa ordem) |
| Só foto mudou | PATCH (body atual, igual hoje) **e** POST/DELETE |

Ordem PATCH → imagem: se o PATCH falhar, **não** envia a foto (form permanece, erro no alerta).

No **cadastro**, Remover só limpa `localFile` (não há `DELETE` — o animal ainda não existe).

### Lib e captura (sem dependência nova)

HTML + File API. **Sem** lib de upload, crop ou compressão.

| Ação | Mecanismo |
|------|-----------|
| Escolher arquivo / galeria | `<input type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif">` + clique na dropzone |
| Arrastar e soltar | `dragover` / `drop` na dropzone (um arquivo; se vierem vários, usa o **primeiro** e avisa) |
| Tirar foto | segundo input **oculto** com `accept="image/*"` e **`capture="environment"`** |

`capture="environment"` no celular/tablet abre a câmera traseira. No **desktop** o browser em geral cai no seletor de arquivos (ou oferece a webcam se o SO mapear). Isso cobre RF0007 sem UI de câmera própria.

**Não** usar `navigator.mediaDevices.getUserMedia` nesta fatia (permissão extra, preview ao vivo, canvas de snapshot — fora, como o mobile não usou `expo-camera`).

Permissão de câmera é do **browser/SO**, pedida no toque de **Tirar foto**. Negada → mensagem PT-BR no alerta do form; não crashar.

### MIME, HEIC e 8 MB (ponto 7)

A API só aceita `image/jpeg`, `image/png`, `image/webp`. Depois da escolha, o painel **sempre** regrava em JPEG no canvas:

1. `createImageBitmap(file)` (fallback: `Image` + object URL)
2. Redimensionar se o lado maior > **1920 px** (mantém proporção)
3. `canvas.toBlob('image/jpeg', 0.7)`
4. Se o blob > **8 MB** → mensagem no form, **sem** HTTP de imagem
5. `FormData`: campo **`imagem`**, `name` `foto.jpg`, `type` `image/jpeg`

HEIC/HEIF do iPhone (Safari) vira JPEG **se** o browser conseguir decodificar. Se `createImageBitmap` / `Image` falhar → “tipo de arquivo inválido (use JPEG, PNG ou WebP)”.

Não enviar `base64` no body JSON. Não inventar `urlImagem` no PATCH. Revogar `URL.createObjectURL` ao trocar arquivo ou desmontar.

### Exibir a foto

`<img alt="">` com `object-fit: cover`. Sem lib de imagem.

| Superfície | Com `urlImagem` / preview | Sem URL / `onError` |
|------------|---------------------------|---------------------|
| `AnimalTable` | 44×44, raio 10 (slot atual) | iniciais |
| `AnimalDetailPage` hero | 72×72, raio 12 | iniciais |
| Form (card Fotos) | área da dropzone (~largura do card, altura mínima ~160px) | ícone nuvem + copy |

`onError` → volta às iniciais / placeholder. Não quebrar o layout.

A tabela **não** navega pelo avatar (o nome continua o atalho da spec 009).

### Multipart no `api.js`

`request()` hoje força JSON. Upload precisa de `requestForm(path, formData, options)` que:

- injeta `Authorization: Bearer`
- **não** seta `Content-Type` (o browser coloca o boundary)
- **não** faz `JSON.stringify`
- reusa parse de envelope `{ error: { message } }`, 204 e `ApiError`

`enviarImagem(id, file)` recusa id inválido e arquivo vazio. Monta `FormData` com campo `imagem`.

### Layout do form (print × spec 007)

Hoje a coluna direita é só Localização (fotos omitidas). Restaurar o print:

```
Desktop (~2/3 + 1/3)
┌─────────────────────────┬─────────────────────┐
│ Informações básicas     │ Fotos do animal     │
│                         │ Localização         │
└─────────────────────────┴─────────────────────┘

< 900px (empilhar)
Informações básicas
Fotos do animal
Localização
```

Implementação: wrapper `.aside` na coluna direita (`display: flex; flex-direction: column; gap`). Tokens `--painel-*`. Dropzone: borda tracejada, fundo `--painel-primary-soft` (ou equivalente claro), raio do card.

Viewport ~360px: dropzone em largura total; botões empilhados; sem overflow horizontal.

---

## Contexto técnico (API já pronta)

Base: `VITE_API_URL`. Envelope: `{ "error": { "message": "..." } }`. Mutações: JWT `ong`.

### `POST /animais/:id/imagem`

**Content-Type:** `multipart/form-data`  
**Campo:** `imagem` (um arquivo)  
**Auth:** JWT `ong` + `assertPodeMutar` (ONG = qualquer animal)

| HTTP | UI |
|------|-----|
| **200** `{ animal }` com `urlImagem` | segue o fluxo de sucesso |
| **400** | `error.message` no form (sem arquivo, MIME, 8 MB) |
| **401** | logout → `/login` |
| **403** | `error.message`; sessão permanece (ONG admin em geral **não** vê isto) |
| **404** | “Animal não encontrado.” |
| **503** | “Serviço de imagens indisponível” |

### `DELETE /animais/:id/imagem`

**204**. Animal já sem foto também **204**. 401 / 403 / 404 iguais ao POST.

### `GET /animais` e `GET /animais/:id`

Públicos; o painel envia Bearer assim mesmo. Campo `urlImagem`: `null` ou URL `https://…`. Sem cache além do estado da tela; a lista já refaz o GET ao voltar.

---

## Pontos fechados (2026-09-03)

Confirmados pela autora.

| # | Tema | Decisão |
|---|------|---------|
| 1 | Onde escolher/tirar a foto | **A** — no `AnimalFormPage` ao **cadastrar** e ao **editar**. Sem foto no detalhe nem tela extra |
| 2 | Câmera e arquivo | **A** — os dois: dropzone/arquivo **e** **Tirar foto** (`capture`). Sem `getUserMedia` |
| 3 | Foto obrigatória? | **Igual ao mobile** — obrigatória **só no front** no cadastro. API continua opcional. Sempre as **duas** rotas. Edição **não** exige foto |
| 4 | POST JSON ok, POST imagem falha | **Igual ao mobile** — animal permanece; aviso + ir à lista; completar na edição |
| 5 | Onde **mostrar** a foto | **A** — tabela (A/P/E) + detalhe + preview do form |
| 6 | Remover foto | **A** — no form de edição (e no criar, se já escolheu local, para trocar). Sem foto no cadastro → não salva (ponto 3) |
| 7 | HEIC / tipos | **B** — canvas converte **sempre** para JPEG (0.7; lado máx. 1920) antes do upload |
| 8 | Print “até 5 fotos” | **Uma** foto (contrato da API). Card do print, copy e **um** preview — sem 5 slots |

### Ponto 1

Captura no form de **cadastro e edição** — o mesmo ponto de mutação da 007. O detalhe (009) é consulta: só **mostra** a URL. Sem segundo lugar para enviar foto.

### Ponto 2

RF0007 pede galeria **ou** câmera. No web: disco/arraste = galeria; `capture="environment"` = câmera no dispositivo que tiver. Sem lib extra e sem modal de webcam.

### Ponto 3 — obrigatoriedade só no painel (igual ao mobile)

A API **não** ganha campo obrigatório. O painel, no cadastro A/P/E:

- Validação local: sem foto → “Adicione uma foto”; **não** chama nenhuma rota.
- Com foto → **sempre** `POST /animais` e em seguida `POST /animais/:id/imagem`.

Na edição: foto não é obrigatória (Thor/Luna/Mel do seed não têm foto; a ONG pode adicionar). Remover (ponto 6) deixa `urlImagem` null de novo.

### Ponto 4

Animal já gravado. Aviso na lista: “Animal salvo, mas a foto não foi enviada. Você pode adicioná-la ao editar.” Reset da spec 007 (lista da situação). Edição: PATCH ok + imagem falha → permanece no form com o erro.

### Ponto 5

RF0004/RF0006: foto na listagem e no detalhe. Placeholder só sem URL ou se o `<img>` falhar.

### Ponto 6

`DELETE` idempotente. Remover no form, junto do Salvar (não chama HTTP até o submit). No cadastro, Remover só limpa o preview local — aí o Salvar volta a exigir foto.

### Ponto 7

Safari/iPhone no painel (ONG no celular) pode entregar HEIC. Conversão JPEG no canvas, **sem** dependência nova (o mobile usou `expo-image-manipulator` porque não há canvas RN equivalente tão direto).

### Ponto 8

Backend spec 010 fechou **uma** foto. Os 5 thumbnails do print **não** entram. Copy honesta no card.

---

## Fluxos (pontos 1–6)

### Cadastrar (sempre com foto; duas rotas)

```
ONG                         Web                         API
 |  form + dropzone/câmera   |                           |
 |  preview local            |                           |
 |  Salvar animal            |                           |
 |-------------------------->|  POST /animais            |
 |                           |-------------------------->|
 |                           |  201 { animal }           |
 |                           |  POST /animais/:id/imagem |
 |                           |-------------------------->|
 |                           |  200 { animal, urlImagem }|
 |  lista + foto na tabela   |<--------------------------|
```

Cancelar o picker / drop vazio → form inalterado, sem POST.  
Salvar **sem** foto → “Adicione uma foto”; **nenhuma** rota.  
Arquivo inválido / > 8 MB após JPEG → mensagem; **nenhum** POST (o JSON **não** parte até o arquivo estar ok).

### Editar foto

Lista → **Editar** → form com preview da URL (ou placeholder) → arquivo/câmera ou Remover → Salvar.

Mel (usuário) é editável: a ONG **pode** anexar foto nela.

### Falha

| Situação | UI |
|----------|-----|
| Picker / drop cancelado | nada |
| Vários arquivos no drop | usa o primeiro; alerta “Envie só uma foto.” |
| MIME inválido / decode falhou / > 8 MB (cliente) | mensagem no topo do form; sem HTTP de imagem |
| Cadastro sem foto | “Adicione uma foto”; sem HTTP |
| Cadastro: arquivo inválido no submit | validação local; **nenhum** POST |
| 400 / 503 no POST imagem (criar, JSON já 201) | ponto 4 |
| 400 / 503 no POST/DELETE imagem (editar) | erro no form; não volta |
| 401 | logout → `/login` |
| 403 | `error.message` |
| URL da tabela/detalhe falha ao carregar | iniciais |
| Câmera recusada pelo browser | “Não foi possível abrir a câmera. Você pode escolher um arquivo.” |

---

## Contrato de UI

Idioma: **PT-BR**. Identificadores em inglês.

### Formulário — card Fotos do animal

Na coluna direita, **acima** de Localização. Mesmo card branco, raio ~12.

| Elemento | Texto / regra |
|----------|----------------|
| Título da seção | Fotos do animal |
| Apoio (cadastro) | Obrigatória. Uma foto (JPEG, PNG ou WebP). Máximo 8 MB. A nova substitui a anterior. |
| Apoio (edição) | Uma foto (JPEG, PNG ou WebP). Máximo 8 MB. A nova substitui a anterior. Pode remover. |
| Dropzone (sem preview) | Ícone nuvem (SVG, cor `--painel-primary`) + “Clique para enviar foto ou arraste e solte aqui” |
| Dropzone com preview | `<img>` cobrindo a área; `alt="Foto do animal"` |
| Botão 1 | Escolher arquivo |
| Botão 2 | Tirar foto |
| Remover | visível se houver preview (local ou URL); “Remover foto” |
| A11y dropzone | `role="button"` (ou `<label>` do input); “Enviar foto do animal” |
| A11y Escolher arquivo | “Escolher foto do computador” |
| A11y Tirar foto | “Tirar foto do animal” |
| A11y Remover | “Remover foto do animal” |
| Inputs file | visualmente ocultos; acionados pelos botões / dropzone |

Dropzone com `aria-busy` durante a conversão JPEG (rápida; se demorar, texto “Preparando foto…”).

Estilo da dropzone (do print): borda **tracejada**, fundo lilás claro, área clicável ≥ 44px de altura útil; highlight da borda no `dragover`.

### Listas e detalhe (ponto 5)

| Superfície | Com `urlImagem` | Sem URL / erro |
|------------|-----------------|----------------|
| `AnimalTable` (A, P, E) | `<img>` 44×44 | iniciais |
| `AnimalDetailPage` hero | `<img>` no quadrado atual | iniciais |

Sem botão de foto nas listas. Sem overlay de câmera no avatar. Nome clicável **inalterado**.

### Loading do Salvar

Inalterado: **Salvando…** cobre JSON + conversão + imagem. Não segundo spinner no rodapé. Dropzone pode mostrar “Preparando foto…” só na conversão se for perceptível.

### Navegação

**Nenhuma rota nova.** `AnimalFormPage` / `AnimalDetailPage` / listas inalterados em params.

```
/painel/animais/novo?status=
/painel/animais/:idAnimal/editar
/painel/animais/:idAnimal/detalhes?status=
/painel/animais/{adocao|encontrados|perdidos}
```

---

## Arquitetura de código

```
src/
  services/
    api.js                       # + requestForm (multipart)
    animaisService.js            # + enviarImagem(id, file) + removerImagem(id)
    imageFile.js                 # validar, JPEG via canvas, limite 8 MB
  pages/
    AnimalFormPage.jsx           # card Fotos; estado da foto; save em duas etapas
    AnimalFormPage.module.css    # .aside + dropzone
    AnimalDetailPage.jsx         # <img> no hero
  components/
    AnimalTable.jsx              # <img> ou iniciais
    AnimalPhoto.jsx              # opcional: slot compartilhado (tabela + detalhe + form)
    AnimalPhoto.module.css
    PhotoDropzone.jsx            # dropzone + inputs file + botões
    PhotoDropzone.module.css
```

Sem Context de imagens. Sem persistir arquivo além do estado do form. Sem dependência npm nova.

`AnimalPhoto`: um componente pequeno evita três cópias de `onError` → iniciais (tamanho via className / variant `table` | `detail` | `form`).

`PhotoDropzone` não conhece a API — só devolve um `File` (já JPEG) ou `null` no remover.

---

## Regras de negócio (cliente)

1. Nunca enviar `urlImagem` / `keyImagem` no JSON.
2. A ONG **pode** mutar a foto de qualquer animal da lista (incluindo Mel).
3. Uma foto; POST novo substitui (servidor).
4. Cadastro web: foto obrigatória no form; API continua opcional. Sempre duas rotas no create.
5. Validar MIME/decode e 8 MB **antes** do multipart.
6. 401 → logout. 403 → mensagem, sessão permanece.
7. Não logar JWT nem o `FormData`.
8. Listas e detalhe só **leem** `urlImagem`; não abrem o file picker.
9. Não inventar galeria de 5 fotos.

---

## Decisões técnicas (fechadas em 2026-09-03)

| Item | Escolha |
|------|---------|
| Canal | Web (painel ONG) |
| Backend / mobile | **intocados** |
| HTTP cadastro | **sempre** `POST /animais` + `POST /animais/:id/imagem` |
| HTTP edição | PATCH (como 007) e/ou POST/DELETE imagem |
| Foto no cadastro | obrigatória **só no painel** (igual mobile) |
| Picker | `<input type="file">` + drag-and-drop |
| Câmera | `capture="environment"` |
| Webcam `getUserMedia` | não |
| Conversão JPEG | canvas (`toBlob`, 0.7, lado máx. 1920) |
| Recorte 1:1 | não (exibição `cover`) |
| Print 5 fotos | **uma** foto (ponto 8) |
| Layout form | card Fotos acima de Localização na coluna direita |
| Rota nova | não |
| Lib npm | **nenhuma** |
| RF0008 | fora |

---

## Critérios de pronto (após aprovação + implementação)

- [x] Pontos 1–8 confirmados pela autora
- [x] Login `ong@adopet.local` → Adoção → cadastrar **com** foto (arquivo) → as duas rotas → tabela **mostra a foto**
- [x] Mesmo fluxo **Tirar foto** (aparelho com câmera / browser que exponha) → 200 e foto no detalhe
- [x] Cadastro **sem** foto → “Adicione uma foto”; **nenhum** POST
- [x] Cadastro com arquivo inválido (ex.: `.pdf` se o SO permitir) → mensagem local; **nenhum** POST
- [x] Editar Thor → adicionar foto → PATCH + POST → detalhe e lista mostram a foto
- [x] Editar Mel (usuário) → adicionar foto → 200 (ONG admin); card na lista Encontrados com a foto
- [x] Editar → Remover foto → `DELETE` → volta o placeholder
- [x] Segundo POST de imagem no mesmo animal → foto nova na tabela (substituição)
- [x] Arrastar um JPEG para a dropzone → preview; Salvar envia
- [x] POST JSON ok + Storage fora (503) → ponto 4 (animal na lista, aviso de foto)
- [x] 401 no POST imagem → login
- [x] Detalhe **sem** botão de câmera / Editar (009 intacta)
- [x] Sem 5 thumbnails; copy de uma foto
- [x] Viewport ~360px: dropzone usável, sem overflow horizontal
- [x] Backend intocado; mobile intocado
- [x] CONTEXTO: checklist RF0007 no web; RF0006 foto real; decisão §8; spec 011 no texto
- [x] `specs/README.md` — status aprovada e implementada (só depois de codar)

## Como validar (após implementação)

Pré-requisito: API + seed + `.env` de Storage no backend (bucket `animais` público). JWT ONG.

```bash
# terminal 1
cd D:\adopet-backend
npm run dev

# terminal 2
cd D:\adopet-web
npm run dev
```

1. Login `ong@adopet.local` / `senha123` → Adoção → **+ Cadastrar novo animal**
2. Conferir o card Fotos com `docs/prototipos/cadastro-animal-adocao.png` (uma foto, sem 5 slots, sem gênero)
3. Anexar JPEG → Salvar “Bidu” → lista Adoção com foto no slot
4. Abrir o detalhe pelo nome → hero com a mesma foto (não iniciais)
5. Editar Bidu → **Remover foto** → Salvar → placeholder na tabela
6. Editar **Thor** (seed) → escolher arquivo → Salvar → foto na Adoção
7. Encontrados → Editar **Mel** → foto → 200; detalhe mostra a foto
8. Cadastro sem foto → “Adicione uma foto”; conferir no backend que **não** nasceu animal
9. Parar o Storage / env (se reproduzível) no segundo passo do cadastro com foto → aviso do ponto 4; animal na lista sem foto
10. Largura ~360px: cards empilhados; dropzone clicável

No mobile (opcional, regressão): Adoção → Thor passa a mostrar a foto que a ONG enviou (mobile 012 já lê `urlImagem`).

## Checklist de implementação (após a autora aprovar)

1. [x] Fechar pontos 1–8 nesta spec + índice no `specs/README.md`
2. [x] `requestForm` + `enviarImagem` / `removerImagem`
3. [x] `imageFile.js` (JPEG canvas, 8 MB, HEIC)
4. [x] `PhotoDropzone` + card no `AnimalFormPage` (criar/editar, ponto 4)
5. [x] `AnimalTable` + `AnimalDetailPage` com `<img>` e fallback
6. [x] Layout `.aside` (Fotos acima de Localização)
7. [x] CONTEXTO

## Relação com as specs 007, 009 e o mobile 012

A **007** omitiu o card Fotos de propósito (fase 2). Esta 011 **restaura** o card, alinhado ao print, com o contrato de **uma** foto da backend 010. Gênero, bairro e rich text **continuam** fora.

A **009** usou placeholder no hero. Esta fatia **só** troca o slot por `<img>`. Sem Editar, sem câmera no detalhe.

O **mobile 012** já fechou RF0007 no app (foto obrigatória no cadastro P/E, `expo-image-picker`). O painel alinha o ponto 3/4 ao app: foto **obrigatória no cadastro**, dropzone do print, JWT `ong`, mutação em qualquer animal. Não compartilhar código entre repos.

## Relação com o backend 010

A 010 entregou Storage + rotas. Esta fatia **consome**. Sem migration, sem mudar MIME, sem várias fotos.
