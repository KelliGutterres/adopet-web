# Specs (SDD)

Especificações obrigatórias **antes** de implementar (Spec-Driven Development).

## Regras

- Uma spec por feature/fatia relevante.
- Nome sugerido: `NNN-nome-curto.md` (ex.: `001-auth-jwt.md`).
- Conteúdo mínimo: objetivo, escopo, RF/RNF, contratos (API/UI), critérios de pronto, fora de escopo.
- Atualizar a spec se a decisão mudar durante a implementação.

Ver `docs/CONTEXTO-PROJETO.md` (seção SDD).

## Índice

| Spec | Tema | Status |
|------|------|--------|
| [001](./001-estrutura-inicial-web.md) | Scaffold Vite + React (painel ONG) | aprovada e implementada |
| [002](./002-login-ong.md) | Tela de login da ONG + JWT + esqueci senha | aprovada e implementada |
| [003](./003-listagem-animais.md) | Listagem de animais no painel (A / P / E) | aprovada e implementada |
| [004](./004-layout-login.md) | Layout do login conforme o protótipo (sem OAuth) | aprovada e implementada |
| [005](./005-cadastro-ong.md) | Cadastro da ONG no painel (mesmo layout do login) | aprovada e implementada |
| [006](./006-esqueci-senha-ong.md) | Esqueci a senha da ONG (refino da tela) | aprovada e implementada |
