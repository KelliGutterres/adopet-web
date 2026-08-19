# Spec 003 — Listagem de animais no painel (ONG)

> **Status:** aprovada e implementada.  
> Depende de: spec 002 (login JWT); backend specs 005 (`GET /animais`) e 007 (cidade/raça no payload).  
> **Não altera** o `adopet-backend` nesta fatia.  
> Card Trello: [Listagem de animais no painel](https://trello.com/c/6z4dDcI6/45-listagem-de-animais-no-painel)

## Objetivo

Substituir o placeholder de `/painel` por um **shell de dashboard** (sidebar + header) e **três listagens em tabela**: animais para adoção (`A`), encontrados (`E`) e perdidos (`P`). Cobre **RF0004** (listagem) e o início de **RF0010** (painel da ONG), com usabilidade e responsividade (**RNF0001**, **RNF0006**).

O web continua **somente ONG**. Listagem do usuário no app (card Trello 53) fica em spec futura no `adopet-mobile`.

## Referência visual (TCC)

Prints anexados em `docs/prototipos/`:

| Arquivo | Tela | Uso nesta spec |
|---------|------|----------------|
| [listagem-animais-adocao.png](../docs/prototipos/listagem-animais-adocao.png) | Painel — Animais para Adoção | **Fonte de layout** desta fatia (sidebar, header, tabela, filtros, ações) |
| [login-web.png](../docs/prototipos/login-web.png) | Login split (marca + formulário) | Fonte da **identidade visual** (roxo). **Não** redesenhar o login nesta fatia |

As telas Encontrados e Perdidos **não** vieram em print. Reutilizar o mesmo layout da Adoção, trocando título, subtítulo, item ativo do menu e `status` da API.

O layout **substitui** a proposta anterior (abas + cards + paleta verde do login atual).

## Escopo (esta tarefa)

1. Shell autenticado: sidebar + header de perfil; Sair no rodapé da sidebar
2. Três rotas de listagem (não abas): Adoção, Encontrados, Perdidos
3. Consumir `GET /animais?status=A|P|E` via `animaisService`
4. Tabela no estilo do print: foto placeholder, nome, `idAnimal`, espécie/raça, idade, porte
5. Busca e filtros de espécie/porte **no cliente** (sobre a lista já carregada)
6. Estados: loading, vazio, erro de rede/API
7. Itens de menu ainda sem tela: visíveis e **desabilitados** (“Em breve”)
8. Tokens CSS da identidade roxa (para o painel; login atual fica como está)
9. Atualizar `docs/CONTEXTO-PROJETO.md` após aprovação + implementação

## Fora de escopo

- Redesenhar a tela de login (print `login-web.png`) — spec futura
- Cadastro de ONG, Google/Apple, “Cadastre-se”
- Formulário de cadastro/edição de animal (print tem o botão; nesta fatia o botão existe e fica **desabilitado** ou “Em breve”)
- `DELETE` / `PATCH` reais — botões Editar/Excluir visíveis e **desabilitados** até a spec de CRUD web
- Tela de detalhes (RF0006)
- Páginas: Dashboard, Usuários, ONG/Instituição, Relatórios, Configurações, notificações
- Colunas **Gênero** e **Cadastrado em** — **não existem** no MER/Prisma; não inventar campo
- Status “Disponível” como conceito novo (o `status` da API é `A`/`P`/`E`)
- Idade em meses (API guarda `idade` em **anos**)
- Foto real / Supabase Storage
- Paginação no servidor (API devolve a lista inteira; spec 005)
- Filtros avançados no backend (RF0005)
- IA (RF0008)
- Listagem mobile
- Alterar contratos da API
- Testes automatizados

## RF/RNF relacionados

| ID | Cobertura nesta spec |
|----|----------------------|
| RF0004 | Lista adoção, perdidos e encontrados no painel |
| RF0010 | Shell do painel + primeira tela útil após o login |
| RF0003 | **Parcial visual** — botões cadastrar/editar/excluir no layout, sem mutação |
| RF0005 | **Parcial no cliente** — busca + espécie + porte; sem query extra na API |
| RF0006 | **Não** |
| RNF0001 | Tabela, empty/erro em PT-BR, loading visível |
| RNF0006 | Shell usável em desktop; viewport estreito com sidebar recolhida ou empilhada |

## Contexto técnico (API já pronta)

Base: `VITE_API_URL` / proxy Vite em `/animais` (spec 001).  
Envelope de erro: `{ "error": { "message": "..." } }`.  
`GET` é **público** (spec 005); o cliente web **mesmo assim** envia `Authorization: Bearer`.

### `GET /animais`

| Query | Valores | Efeito |
|-------|---------|--------|
| `status` | `A` \| `P` \| `E` | Filtra pela situação |
| (ausente) | — | Todos |

**200** — `{ "animais": [ Animal, ... ] }`

Campos disponíveis hoje (sem foto, sem gênero, sem `createdAt`):

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

**400** — `status` inválido (o cliente só envia `A`/`P`/`E`).

### Print × modelo (o que cabe agora)

| Coluna / controle no print | No modelo/API? | Nesta fatia |
|----------------------------|----------------|-------------|
| Foto | não (Storage futuro) | placeholder (iniciais ou ícone) |
| Nome | `nome` | sim |
| ID | `idAnimal` | `ID: #{idAnimal}` (seed: 1, 2, 3 — não `#1023`) |
| Espécie / raça | `especie`, `raca.nome` | Cão/Gato + nome da raça |
| Idade | `idade` anos | `{n} anos`; se `null`, “—”; **sem meses** |
| Porte | `porte` P/M/G | Pequeno / Médio / Grande; se `null`, “—” |
| Gênero | **não existe** | **omitir coluna** |
| Status “Disponível” | `status` é A/P/E | **omitir coluna** nesta tela (a rota já é a situação) |
| Cadastrado em | **não existe** | **omitir coluna** |
| Editar / Excluir | API existe, tela não | botões visíveis, `disabled`, `title="Em breve"` |
| + Cadastrar novo animal | idem | botão visível, `disabled` |
| Busca nome/raça/espécie | não na API | filtro **no cliente** |
| Dropdown Espécie / Porte | não na API | filtro **no cliente** |
| Dropdown Status | conflita com A/P/E e “Disponível” | **omitir** (a rota já filtra situação) |
| Paginação 24 itens | API sem page/limit | **omitir** nesta fatia (lista cabe; seed tem 3) |
| Sino com badge “2” | não existe | ícone opcional **sem** badge / sem ação |
| Papel “Administrador” | ONG = admin do painel | rótulo **ONG** (sem role `admin` no JWT) |

### Mapeamento menu ↔ API

| Item do menu (print) | Rota | `GET` |
|----------------------|------|--------|
| Animais para Adoção | `/painel/animais/adocao` | `?status=A` |
| Animais Encontrados | `/painel/animais/encontrados` | `?status=E` |
| Animais Perdidos | `/painel/animais/perdidos` | `?status=P` |

Seed (spec 004): Thor=`A`/ONG, Luna=`P`/ONG, Mel=`E`/usuário.

### Quem aparece na lista

Nas **três** telas, mostrar **todos** os animais daquela situação, independente do tutor (ONG ou usuário). Decisão da autora em 2026-08-19.

`GET /animais` já devolve a lista completa; o cliente **não** filtra por `idInstituicao`. Editar/Excluir, quando existirem, continuam só para o **dono**.

## Fluxos

### Entrar autenticada

```
ONG                         Web                         API
 |  sessão JWT               |                           |
 |-------------------------->|  GET /animais?status=A    |
 |  (home → /adocao)         |-------------------------->|
 |                           |  200 { animais }          |
 |                           |<--------------------------|
 |  tabela Adoção            |                           |
 |<--------------------------|                           |
```

### Trocar de lista (sidebar)

1. Clique em Encontrados ou Perdidos.
2. Navega a rota correspondente.
3. Novo `GET /animais?status=E|P`.
4. Busca/filtros da tela **resetam**.

### Busca e filtros (cliente)

Aplicados **depois** do GET, sem nova request:

- texto: `nome`, `raca.nome`, label de espécie (cão/gato)
- espécie: Todas | Cão | Gato
- porte: Todos | Pequeno | Médio | Grande

### Sem resultados / falha

| Situação | UI |
|----------|----|
| Array vazio (API) | empty da tela (“Nenhum animal para adoção cadastrado.” etc.) |
| GET ok, filtros sem match | “Nenhum animal encontrado com esses filtros.” |
| API fora / rede | mensagem da spec 002 |
| 401 | deslogar e ir para `/login` |

## Contrato de UI

Idioma: **PT-BR**. Identificadores de código em inglês.

### Rotas

| Rota | Auth | Tela |
|------|------|------|
| `/painel` | exige sessão ONG | redirect → `/painel/animais/adocao` |
| `/painel/animais/adocao` | idem | tabela `status=A` |
| `/painel/animais/encontrados` | idem | tabela `status=E` |
| `/painel/animais/perdidos` | idem | tabela `status=P` |
| `/login` | pública | **inalterado** (spec 002) |

### Shell

**Sidebar**

| Item | Estado |
|------|--------|
| Logo pata + AdoPet | sempre; clique → `/painel/animais/adocao` |
| Dashboard | desabilitado, “Em breve” |
| Animais para Adoção | ativo na rota `adocao` |
| Animais Encontrados | ativo na rota `encontrados` |
| Animais Perdidos | ativo na rota `perdidos` |
| Usuários | desabilitado |
| ONG / Instituição | desabilitado |
| Relatórios | desabilitado |
| Configurações | desabilitado |
| Sair | funcional (logout spec 002); destaque vermelho como no print |

**Header**

- Nome da ONG da sessão (`ong.nome`)
- Rótulo: `ONG` (não “Administrador” — não há role admin no JWT)
- Avatar: iniciais ou círculo com “ONG”
- Sino: omitir ou ícone sem ação e sem badge

### Copy por tela

| Tela | Título | Subtítulo |
|------|--------|-----------|
| Adoção | Animais para Adoção | Gerencie os animais disponíveis para adoção. |
| Encontrados | Animais Encontrados | Consulte os animais cadastrados como encontrados. |
| Perdidos | Animais Perdidos | Consulte os animais cadastrados como perdidos. |

| Elemento | Texto |
|----------|--------|
| Busca | placeholder “Buscar por nome, raça ou espécie...” |
| Espécie | Todas / Cão / Gato |
| Porte | Todos / Pequeno / Médio / Grande |
| Cadastrar | + Cadastrar novo animal (disabled) |
| Loading | Carregando animais… |
| Vazio `A`/`P`/`E` | Nenhum animal para adoção/perdido/encontrado cadastrado. |
| Erro de rede | Não foi possível conectar à API. Verifique se o backend está no ar. |
| Sair | Sair |
| Editar / Excluir | labels visíveis; disabled |

### Tabela

Colunas **desta fatia**:

1. Animal (placeholder + nome + `ID: #{idAnimal}`)
2. Espécie / Raça
3. Idade
4. Porte
5. Ações (Editar, Excluir — disabled)

Sem Gênero, sem Status “Disponível”, sem Cadastrado em.

### Identidade visual (do print)

Proposta de tokens (aproximados do mockup; ajustar se a autora passar hex exato):

| Token | Valor |
|-------|--------|
| Primária | `#7C3AED` (roxo botão/menu ativo) |
| Primária suave (item ativo) | `#F3E8FF` |
| Fundo da área | `#F3F4F6` |
| Superfície (sidebar, card, header) | `#FFFFFF` |
| Texto | `#111827` |
| Texto secundário | `#6B7280` |
| Borda | `#E5E7EB` |
| Perigo (Sair / Excluir) | `#DC2626` |
| Raio | ~8–12px |
| Fonte | `system-ui` (já no projeto; sem Google Fonts obrigatória) |

Login atual (verde `#2F6F4E` / fundo `#F7F4EF`) **não muda** nesta spec.

Viewport estreito: sidebar vira menu (botão abrir/fechar) ou empilha; tabela com scroll horizontal se necessário — sem cortar o layout.

### Acessibilidade mínima

- `<nav>` na sidebar; item ativo com `aria-current="page"`
- Itens “Em breve”: `disabled` ou `aria-disabled` + `title`
- Tabela com `<th>` reais
- Loading `aria-busy`; erro `role="alert"`
- Foco visível (outline roxo)

## Arquitetura de código

```
src/
  styles/
    tokens.css                 # variáveis da identidade roxa
  layouts/
    PainelLayout.jsx           # sidebar + header + <Outlet />
    PainelLayout.module.css
  pages/
    AnimaisListPage.jsx        # uma página, parametrizada pela rota
    AnimaisListPage.module.css
  components/
    Sidebar.jsx
    PainelHeader.jsx
    AnimalTable.jsx
    AnimalTable.module.css
  services/
    animaisService.js          # listarAnimais({ status })
    animalLabels.js            # status/especie/porte → PT-BR
  App.jsx                      # rotas aninhadas em /painel
```

`PainelPage.jsx` (placeholder da spec 002) foi **substituído** por `PainelLayout`.

Fluxo: rota → `status` → `animaisService.listarAnimais` → estado local → tabela + filtros cliente.

Sem `AnimaisContext`.

## Regras de negócio (cliente)

1. Chamar **somente** `GET /animais` (além do auth da spec 002).
2. Situação só pela **rota** ↔ `status`; não misturar as três listas numa tabela.
3. Busca/espécie/porte só no cliente.
4. Não persistir a lista no `localStorage`.
5. Não logar o JWT.
6. Labels em PT-BR; códigos `A`/`P`/`E` e `CAO`/`GATO` só no código.
7. Placeholder de foto local/CSS — sem URL externa.
8. Botões de mutação visíveis e inativos — **não** chamar POST/PATCH/DELETE.

## Decisões técnicas (fechadas na aprovação)

| Item | Escolha |
|------|---------|
| Canal | **Web** (painel ONG) |
| Backend | **sem mudança** |
| Layout | dashboard do print (sidebar + tabela), não cards |
| Paleta do painel | roxo `#7C3AED` |
| Login | **não** redesenhar agora |
| Dados | **todos** os animais da situação, independente do tutor |
| Home | `/painel` → Adoção |
| Menu extra | visível, desabilitado |
| Cadastrar / Editar / Excluir | visíveis, desabilitados (só listar) |
| Gênero / Cadastrado em / Disponível | **omitir** |
| Busca + espécie + porte | cliente |
| Dropdown Status do print | omitir |
| Paginação | omitir nesta fatia |
| Foto | placeholder |
| Sino | omitir |

## Pontos abertos para refinamento

Fechados em 2026-08-19:

1. **Todos os animais** da situação, independente do tutor.
2. **Só listar** — botões Cadastrar/Editar/Excluir visíveis e desabilitados.
3. **Gênero e data** — omitir.
4. **Login** — redesenhar depois.
5. **Menu extra** — visível + “Em breve”.
6. **Paginação e dropdown Status** — fora.
7. **Roxo** — `#7C3AED`.

## Critérios de pronto

- [x] Spec aprovada (pontos 1–7 fechados)
- [x] Spec 002 já implementada
- [x] Login `ong@adopet.local` / `senha123` → tabela Adoção com **Thor**
- [x] Menu Encontrados → **Mel**; Perdidos → **Luna**
- [x] Item ativo do menu acompanha a rota
- [x] Busca por “Thor” deixa só Thor; limpar volta a lista
- [x] Lista vazia / filtros sem match com empty visível
- [x] Backend parado → erro de rede
- [x] Sair no sidebar volta ao login
- [x] Botões cadastrar/editar/excluir visíveis e inativos
- [x] Sem colunas gênero / cadastrado em / “Disponível”
- [x] Login verde **não** foi reescrito
- [x] Backend intocado
- [x] Layout reconhecível em relação ao print (sidebar + tabela + roxo)
- [x] Viewport estreito usável
- [x] CONTEXTO atualizado

## Como validar (após implementação)

Pré-requisito: API + seed (`npm run prisma:seed` no backend).

```bash
# terminal 1
cd ~/adopet-backend && npm run dev

# terminal 2
cd ~/adopet-web && npm run dev
```

1. Login da ONG → `/painel/animais/adocao` com **Thor**
2. Sidebar → Encontrados (**Mel**) e Perdidos (**Luna**)
3. Recarregar em Encontrados → permanece na mesma lista
4. Buscar “Luna” em Perdidos → só Luna; espécie Gato → Luna
5. Sair → `/login`
6. Parar o backend e recarregar a lista → erro de rede
7. Conferir visualmente com `docs/prototipos/listagem-animais-adocao.png`

## Checklist de implementação (após aprovação)

1. `tokens.css` (roxo)
2. `PainelLayout` + `Sidebar` + `PainelHeader`
3. Rotas aninhadas em `App.jsx`
4. `animaisService` + `animalLabels`
5. `AnimaisListPage` + `AnimalTable`
6. Busca/filtros no cliente
7. Empty / loading / erro
8. CONTEXTO (checklist web; decisão na tabela §8)
