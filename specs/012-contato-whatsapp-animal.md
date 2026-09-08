# Spec 012 — Contato WhatsApp do responsável do animal (painel web)

> **Status:** aprovada e implementada.  
> Pontos 1–8 fechados em 2026-09-07. Implementada no mesmo dia.  
> Depende de: spec 009 (`AnimalDetailPage` — bloco ONG responsável / Cadastrado por); spec 005 (cadastro ONG); spec 008 (perfil ONG); **backend spec 011** (`contato` no GET de animais e na conta da instituição).  
> **Não altera** o `adopet-mobile` (ícone no app é a mobile spec 014).  
> Reabre o “contato omitir” da spec 009 e o “sem telefone na ONG” das specs 005 / 008.

O web é **somente ONG**. Esta fatia: (1) ícone de WhatsApp no **detalhe** do animal; (2) campo **contato** no cadastro e no perfil da instituição — sem o (2) a ONG não tem número para o (1).

## Objetivo

No detalhe (`AnimalDetailPage`), **abaixo** de “ONG responsável” / “Cadastrado por”, mostrar um ícone de WhatsApp que abre a conversa com o telefone do tutor (`usuario.contato` ou `instituicao.contato`).

Completa **RF0006** no painel (contato com quem cadastrou) e **RNF0001** / **RNF0006** (ação óbvia, usável no desktop e no viewport estreito). Cadastro/perfil da ONG passam a gravar o telefone (**RF0009** parcial), alinhados ao backend 011.

A montagem do link é **no cliente**: `https://wa.me/55{digitos}`. A API só devolve o texto do `contato`.

## Recorte vs o que já existe

| Fluxo | Onde está | Nesta spec |
|-------|-----------|------------|
| Detalhe: label + nome do tutor | spec 009 | **acrescentar** ícone WhatsApp abaixo do nome |
| GET `/animais/:id` sem `contato` no tutor | backend 005; 009 omitia | **consumir** backend 011 |
| Cadastro ONG sem telefone | spec 005 | **acrescentar** campo contato (máscara) |
| Perfil ONG rejeitava contato | spec 008 / API 009 | **acrescentar** campo; `PATCH` agora aceita (backend 011) |
| Lista de animais / tabela | spec 003 / 007 | **inalterada** — sem ícone na tabela |
| Lista de usuários (coluna contato texto) | spec 010 | **inalterada** — não vira `wa.me` nesta fatia |
| Detalhe mobile | mobile 014 | **fora** |

## Referência visual

Não há print de WhatsApp na Parte 1. Espelhar o **idioma já no detalhe** (spec 009): mesma `dl`, tokens `--painel-*`.

| Fonte | Uso |
|-------|------|
| Spec 009 (`AnimalDetailPage`) | Bloco do responsável; ícone **embaixo** do nome, na mesma linha/card |
| Spec 005 / 008 | Campo contato no cadastro e no perfil, no mesmo padrão dos outros inputs |
| Marca WhatsApp | Ícone SVG oficial (glifo de balão); cor `#25D366`; **sem** pacote npm novo |

```
ONG responsável
ONG Testeeee
[ícone WhatsApp]  WhatsApp
```

```
Cadastrado por
Kelli Gutterresssss
[ícone WhatsApp]  WhatsApp
```

O **número não aparece** como texto (só o nome + o atalho). Leitor de tela usa `aria-label`.

## Escopo (esta tarefa)

1. Ícone + rótulo “WhatsApp” abaixo do responsável em `AnimalDetailPage` (A / P / E)
2. Helper `whatsappHref(contato, { nomeAnimal })` → `https://wa.me/…` ou `null`
3. `labelResponsavel` passa a devolver também `contato` do **mesmo** tutor do nome
4. Esconder o atalho se não houver contato válido (não mostrar link quebrado)
5. Campo contato no `RegisterPage` (obrigatório) e no `OngProfilePage` (máscara; entra no dirty)
6. `maskPhone` / `unmaskPhone` / `isPhoneValid` no web (hoje só existem no mobile)
7. Body de cadastro e `PATCH /ongs/me` enviam `contato` só com dígitos
8. Atualizar `docs/CONTEXTO-PROJETO.md` após implementação

## Fora de escopo

- Alterar o `adopet-backend` nesta fatia (contrato = backend 011; **implementar a API antes**)
- Ícone na tabela / listagens
- Exibir o número em claro no detalhe
- `mailto:`, `tel:`, SMS
- WhatsApp na lista de usuários (spec 010 continua texto)
- Mensagem via WhatsApp Business API / servidor
- Foto / CNPJ / endereço da ONG
- Deep link público sem JWT
- Testes automatizados
- Role `admin`

## RF/RNF relacionados

| ID | Cobertura nesta spec |
|----|----------------------|
| RF0006 | **Sim** — detalhe ganha o meio de contato |
| RF0009 | Cadastro e perfil da ONG passam a ter telefone |
| RF0010 | Painel: ONG e animais de usuário ficam contatáveis |
| RNF0001 | Ícone abaixo do nome; some se não houver número |
| RNF0002 | GET já público; não logar JWT; não mostrar e-mail do tutor |
| RNF0006 | Alvo ≥ 44px no viewport estreito; sem overflow |

## O que já existe (não reinventar)

| Já pronto | Onde |
|-----------|------|
| `labelResponsavel` (label + `value` nome) | `animalLabels.js` |
| Bloco `<dt>` / `<dd>` do responsável | `AnimalDetailPage.jsx` |
| `GET /animais/:id` via `buscarAnimalPorId` | spec 009 / 007 |
| Cadastro ONG (`RegisterPage`) | spec 005 |
| Perfil ONG (`OngProfilePage` + `atualizarMe`) | spec 008 |
| Máscara 10/11 dígitos (referência) | mobile `authService.js` |

O painel **não** chama endpoint novo. Detalhe = mesmo GET. Cadastro/perfil = mesmos POST/PATCH, agora com `contato`.

## Contexto técnico (API — backend 011)

Implementar o **backend 011 antes** desta fatia. Sem `contato` no JSON, o ícone nunca aparece para Thor/Luna.

### `GET /animais/:id` (tutor)

```json
{
  "instituicao": { "idInstituicao": 1, "nome": "ONG AdoPet Demo", "contato": "51888888888" },
  "usuario": null
}
```

Não inventar campo. Não usar e-mail. `contato` pode ser `null` (ONG antiga) → esconder o ícone.

### Cadastro / perfil ONG

`POST /auth/ongs/cadastro` exige `contato`. `PATCH /ongs/me` aceita `contato`. Body só **dígitos** (máscara só na UI), 10 ou 11 chars, `maxLength` efetivo 20 na API.

Seed esperado na validação:

| Animal | Tutor na UI | WhatsApp |
|--------|-------------|----------|
| Thor (`A`) | ONG AdoPet Demo | `51888888888` → `wa.me/5551888888888` |
| Luna (`P`) | ONG AdoPet Demo | idem |
| Mel (`E`) | Usuario Demo | `51999999999` → `wa.me/5551999999999` |

## Pontos fechados (2026-09-07)

| # | Tema | Decisão |
|---|------|---------|
| 1 | Onde o ícone entra | **Só no detalhe**, abaixo do nome do responsável. Sem botão na tabela. |
| 2 | Número visível? | **Não.** Só ícone + texto “WhatsApp”. `aria-label` com o nome do tutor. |
| 3 | URL | `https://wa.me/{e164}?text=…` em nova aba (`target="_blank"` + `rel="noopener noreferrer"`). |
| 4 | Prefixo 55 | 10 ou 11 dígitos → prefixar `55`. 12–13 dígitos já começando com `55` → usar como está. Outro comprimento → sem link. |
| 5 | Texto pré-preenchido | **Sim:** `Olá! Vi o animal {nome} no AdoPet e gostaria de saber mais.` |
| 6 | Sem contato válido | **Omitir** o atalho; manter o nome. |
| 7 | Cadastro + perfil ONG | **Entram nesta spec.** Sem telefone na conta, a ONG não tem WhatsApp. |
| 8 | Número da spec | **012** no web. Backend **011**. Mobile **014**. |

### Ponto 1 — por que só no detalhe

A autora pediu o ícone **abaixo** de “Cadastrado por” / “ONG responsável”, que existe só no detalhe. A tabela já tem Editar/Excluir; um `wa.me` por linha compete com essas ações e vaza o telefone na listagem (o GET já traz, mas a UI da lista não destaca).

### Ponto 3 — por que `wa.me` e não `whatsapp://`

`https://wa.me/` funciona no desktop (WhatsApp Web / app) e no mobile. Não exige esquema custom no browser. Nova aba evita sair do painel sem querer.

### Ponto 4 — DDD 55 (SC)

Não usar “se começa com 55, já tem país”: DDD **55** existe (Santa Catarina). Só tratar como E.164 quando houver **12 ou 13** dígitos começando em `55`. 10–11 dígitos = nacional → prefixar `55`.

### Ponto 5 — por que mensagem pré-preenchida

O destinatário entende o contexto (qual animal, origem AdoPet). `?text=` é suporte oficial do `wa.me`. Sem isso a conversa abre em branco.

### Ponto 7 — por que cadastro/perfil nesta mesma spec

Backend 011 torna `contato` obrigatório no cadastro da ONG. Se o painel não mandar o campo, o `Cadastre-se` quebra. O perfil é o único jeito de a ONG demo (e as já criadas) **completar ou trocar** o número.

## Fluxos

### Abrir WhatsApp no detalhe

1. ONG abre o detalhe (spec 009 — `GET /animais/:id`).
2. `labelResponsavel` escolhe o tutor (mesma regra A vs P/E).
3. Se `whatsappHref` ≠ `null`, renderiza o `<a>`.
4. Clique → nova aba no WhatsApp / WhatsApp Web.

Não chamar API extra. Não gravar clique.

### Cadastro ONG

Igual spec 005 + campo contato com máscara. Body: `contato: unmaskPhone(...)`. Erros: “Informe o contato” / “Informe um contato válido” (10 ou 11 dígitos).

### Perfil ONG

Prefill com `maskPhone(ong.contato)`. Dirty inclui os dígitos do contato. Salvar manda `contato` junto dos outros campos quando dirty (mesmo “enviar o form inteiro” da 008). Validação local igual ao cadastro.

ONG legado com `contato` null: campo vazio; Salvar **exige** o número (não gravar vazio).

## Contrato de UI

Idioma: **PT-BR**. Identificadores em inglês.

### Detalhe — bloco responsável

| Elemento | Regra |
|----------|--------|
| Label | inalterado (ONG responsável / Cadastrado por) |
| Valor | `nome` inalterado |
| Atalho | abaixo do nome; ícone 24px + texto “WhatsApp”; cor `#25D366` no ícone |
| Link | `whatsappHref`; `aria-label="Conversar no WhatsApp com {nome}"` |
| Ausência | se `href` null, não renderizar o atalho |
| Alvo toque | ≥ 44px de altura no viewport estreito |

`labelResponsavel` passa a:

```js
{ label, value, contato }
```

`contato` vem do **mesmo** objeto do `value` (`instituicao` ou `usuario`). Não misturar nome da ONG com telefone do usuário.

### Helper `whatsappHref(contato, { nomeAnimal })`

1. Dígitos: `String(contato).replace(/\D/g, '')`.
2. Se length 10 ou 11 → `e164 = '55' + digits`.
3. Se length 12 ou 13 **e** `digits.startsWith('55')` → `e164 = digits`.
4. Senão → `null`.
5. `text = encodeURIComponent(\`Olá! Vi o animal ${nomeAnimal} no AdoPet e gostaria de saber mais.\`)`.
6. Return `https://wa.me/${e164}?text=${text}`.

`nomeAnimal` = `animal.nome` (Thor / Luna / Mel). Não usar o título genérico do mobile.

Colocar o helper em `src/services/whatsapp.js` (web e a lógica é a mesma da mobile 014 — **copiar** o contrato, não compartilhar módulo entre repos).

### Cadastro / perfil

| Campo | Label | Regra |
|-------|--------|--------|
| Contato | Contato | máscara `(51) 99999-9999`; body só dígitos; 10 ou 11 |

Copiar `unmaskPhone` (slice 0–11), `maskPhone` e `isPhoneValid` do mobile para `authService.js` do web.

Ícone do campo no cadastro: telefone (novo SVG em `AuthIcons.jsx`, no estilo dos atuais). Perfil: mesmo input texto dos outros campos (sem `AuthLayout`).

## Arquitetura de código

```
src/
  pages/
    AnimalDetailPage.jsx       # atalho abaixo do responsável
    AnimalDetailPage.module.css
    RegisterPage.jsx           # + contato
    OngProfilePage.jsx         # + contato no form / dirty / PATCH
  services/
    animalLabels.js            # labelResponsavel + contato
    whatsapp.js                # novo — whatsappHref
    authService.js             # máscara + cadastrarOng manda contato
    ongsService.js             # inalterado (já PATCH genérico)
  components/
    AuthIcons.jsx              # PhoneIcon
```

Sem lib nova (`whatsapp-button`, etc.). Sem mudar rotas.

## Regras de negócio (cliente)

1. Não inventar telefone. Só o `contato` do tutor do GET.
2. Não mostrar e-mail do tutor (a API não manda).
3. Não logar JWT.
4. Cadastro ONG: não chamar POST se o contato for inválido.
5. Perfil: contato entra no dirty; body só dígitos.
6. Detalhe: nenhum `POST`/`PATCH` nesta página (inalterado).

## Decisões técnicas

| Item | Escolha |
|------|---------|
| Canal | Web (painel ONG) |
| Backend | spec 011 (implementar **antes**) |
| Superfície do ícone | só detalhe |
| Número na UI | oculto |
| URL | `wa.me` + `55` + `?text=` |
| Cadastro/perfil ONG | nesta spec |
| Libs novas | nenhuma |
| Número | **012** |

## Critérios de pronto (após implementação)

- [x] Pontos 1–8 fechados nesta spec
- [x] Backend 011 no ar + seed
- [x] Adoção → Thor → abaixo de ONG AdoPet Demo, ícone abre WhatsApp (`5551888888888`)
- [x] Encontrados → Mel → WhatsApp do Usuario Demo (`5551999999999`)
- [x] Perdidos → Luna → WhatsApp da ONG
- [x] Sem `contato` no JSON → nome permanece, ícone some
- [x] Cadastro ONG exige contato mascarado; POST manda só dígitos
- [x] `/painel/ong` preenche e salva `contato`
- [x] Tabela de animais **sem** ícone novo
- [x] Viewport ~360px: atalho clicável, sem overflow
- [x] CONTEXTO atualizado

## Como validar (após implementação)

Pré-requisito: API com backend 011 + seed; `npm run dev` no web.

1. Login `ong@adopet.local` / `senha123` → Adoção → Thor → ícone abaixo da ONG → nova aba `wa.me` (conferir número 5551888888888 e o texto com “Thor”)
2. Encontrados → Mel → WhatsApp do usuário demo
3. Cadastro de ONG nova com contato → entra no painel; o animal que ela cadastrar herda o número no detalhe
4. Perfil → alterar contato → salvar → reabrir um animal da ONG → `wa.me` com o novo número
5. Largura ~360px: ícone usável

## Checklist de implementação (após a autora pedir o código)

1. [x] Spec 012 no índice web
2. [x] `whatsapp.js` + `labelResponsavel.contato`
3. [x] Ícone no `AnimalDetailPage`
4. [x] Máscara no `authService.js`
5. [x] `RegisterPage` + `OngProfilePage`
6. [x] CONTEXTO

## Relação com outras specs

- **009:** o detalhe permanece só leitura; só entra o atalho. Editar/Excluir continuam na lista.
- **005 / 008:** o “não inventar contato” deixa de valer — o campo passa a existir (backend 011).
- **010:** coluna contato da tabela de usuários **não** vira WhatsApp aqui.
- **Backend 011 / mobile 014:** mesmo contrato de URL; cada repo com o próprio helper.
