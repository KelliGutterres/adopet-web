# Spec 004 — Layout da tela de login (protótipo web)

> **Status:** aprovada e implementada.  
> Depende de: spec 002 (login JWT + esqueci senha).  
> **Não altera** o `adopet-backend`.  
> **Não altera** contratos de API, sessão, rotas nem validação da spec 002.

## Objetivo

Substituir o card verde da spec 002 pela **identidade visual do print** em `docs/prototipos/login-web.png` (Figura 14 / TCC): cartão split (marca à esquerda, formulário à direita), paleta roxa já usada no painel (spec 003). Cobre **RNF0001** e **RNF0006** no login. O fluxo **RF0009** permanece o da spec 002.

O web continua **somente ONG**. Cadastro de ONG e OAuth **não** entram nesta fatia.

## Referência visual

| Arquivo | Uso nesta spec |
|---------|----------------|
| [login-web.png](../docs/prototipos/login-web.png) | **Fonte de layout** do login (e do shell de `/esqueci-senha`) |
| Tokens `--painel-*` da spec 003 | Cor primária `#7C3AED` — mesma identidade do painel |

O print inclui botões “Entrar com Google” e “Entrar com Apple”. **Não implementar** (pedido da autora). Sem divisor “ou”.

## Escopo (esta tarefa)

1. Shell split: painel de marca (logo, slogan, texto, onda roxa, foto dos pets) + painel do formulário
2. Copy e hierarquia do print no login (título, placeholders, link, botão, nota de segurança)
3. Inputs com ícone à esquerda; senha com olho (em vez do texto Mostrar/Ocultar)
4. Botão **Cadastre-se** visível e **desabilitado** (`title="Em breve"`) — cadastro ONG é spec futura
5. `/esqueci-senha` reutiliza o **mesmo shell** (não ficar com o card verde antigo)
6. Responsivo: viewport estreito empilha ou compacta a marca; formulário usável (~360px)
7. Asset da foto dos pets em `public/` (recorte isolado; o PNG do print é baixo demais para recortar)
8. Atualizar `docs/CONTEXTO-PROJETO.md`

## Fora de escopo

- Login Google / Apple / qualquer OAuth
- Cadastro de ONG (`POST /auth/ongs/cadastro`) — o botão existe só visualmente
- Mudar `authService`, `AuthContext`, rotas, `localStorage` ou envelope de erro
- Alterar o painel (sidebar/listagem) além de extrair o logo da pata se for compartilhado
- Fig. 13 (mobile)
- Testes automatizados

## RF/RNF relacionados

| ID | Cobertura nesta spec |
|----|----------------------|
| RF0009 | **Inalterado** — só o visual do login |
| RF0001 | **Não** — Cadastre-se desabilitado |
| RNF0001 | Hierarquia do print, erros em PT-BR (já existem) |
| RNF0002 | Nota de segurança só visual; senha continua só no body da API |
| RNF0006 | Split no desktop; coluna única no viewport estreito |

## Contrato de UI

Idioma: **PT-BR**. Identificadores de código em inglês.

### Rotas

Iguais à spec 002. Nenhuma rota nova.

### Login — copy (do print)

| Elemento | Copy |
|----------|------|
| Logo | AdoPet (pata + nome) |
| Slogan | Conectando pets a novos começos 💜 |
| Heading da marca | Ajude a encontrar, adotar e **transformar vidas**. |
| Texto da marca | AdoPet é a plataforma que conecta pessoas, ONGs e animais em busca de um lar ou do reencontro com quem ama. |
| Cadastro | “Não tem uma conta?” + botão Cadastre-se (**disabled**) |
| Título do form | Bem-vindo de volta! |
| Subtítulo | Faça login para acessar sua conta |
| E-mail | label “E-mail”; placeholder “Digite seu e-mail” |
| Senha | label “Senha”; placeholder “Digite sua senha”; `type="password"` + toggle olho |
| Link | Esqueceu sua senha? → `/esqueci-senha` |
| Submit | Entrar (+ ícone); loading “Entrando…” |
| Rodapé | Seus dados estão protegidos com segurança. |
| Erros | os da spec 002 |

### Esqueci senha

Mesmo shell de marca. Título “Redefinir senha”; campos e mensagens da spec 002. Link “Voltar ao login”.

### Layout

- Página: fundo cinza claro (`--painel-bg`), cartão centralizado, cantos ~24px, sombra suave.
- Duas colunas no desktop (~50/50). Esquerda: lavanda clara, patas decorativas, onda roxa na base, foto dos pets sobre a onda. Direita: branco.
- Formulário ~400px, centrado na coluna direita. Cadastre-se no canto superior direito. Nota de segurança no rodapé da coluna.
- Viewport estreito: coluna única; marca compacta (logo + slogan); foto/heading longos podem ocultar; sem scroll horizontal.
- Ícones: SVG inline (mesmo padrão do painel). Sem lib de ícones nova.
- Fonte: Inter (Google Fonts) nas telas de auth; tokens roxos da spec 003.

### Acessibilidade mínima

Mantém a spec 002 (`<form>`, `<label>`, `role="alert"`, foco visível). Toggle da senha com `aria-label`. Cadastre-se com `aria-disabled` / `disabled`. Foto dos pets com `alt=""` (decorativa).

## Arquitetura de código

```
src/
  components/
    AuthLayout.jsx          # shell split
    AuthLayout.module.css
    AuthForm.module.css     # campos/botão (login + esqueci senha)
    TextField.jsx
    PasswordField.jsx       # olho + cadeado
    PawLogo.jsx             # compartilhado com a Sidebar
  pages/
    LoginPage.jsx
    ForgotPasswordPage.jsx
public/
  login-pets.png
```

`AuthCard` da spec 002 **sai** (substituído pelo `AuthLayout`).

## Decisões técnicas (fechadas)

| Item | Escolha |
|------|---------|
| Print | `docs/prototipos/login-web.png` manda no layout |
| Google / Apple | **não** nesta fatia |
| Cadastre-se | visível, desabilitado, “Em breve” |
| Esqueci senha | mesmo shell visual |
| Paleta | tokens `--painel-*` (`#7C3AED`) |
| Foto | asset em `public/login-pets.png` (não recortar o print 532px) |
| Fluxo JWT | spec 002 intacta |

## Critérios de pronto

- [x] Spec alinhada ao print (sem OAuth)
- [x] `/login` reconhecível em relação a `login-web.png`
- [x] Sem botões Google/Apple e sem “ou”
- [x] Cadastre-se visível e inativo
- [x] Login `ong@adopet.local` / `senha123` continua indo ao painel
- [x] Esqueci senha no mesmo shell; fluxo da spec 002 intacto
- [x] Viewport estreito usável
- [x] Backend intocado
- [x] CONTEXTO atualizado

## Como validar

1. Abrir `/login` e conferir com `docs/prototipos/login-web.png` (ignorando Google/Apple)
2. Entrar com a seed → `/painel`
3. “Esqueceu sua senha?” → `/esqueci-senha` no mesmo visual
4. Cadastre-se não navega
5. Largura ~360px: formulário usável, sem overflow horizontal

## Checklist de implementação

1. Spec 004 + índice em `specs/README.md`
2. `public/login-pets.png` + Inter no `index.html`
3. `AuthLayout` + `AuthForm` + `TextField` / `PasswordField` / `PawLogo`
4. `LoginPage` + `ForgotPasswordPage`
5. Remover `AuthCard`
6. CONTEXTO (decisão + checklist visual do login)
