# Spec 016 — Notificações no painel

> **Status:** aprovada e implementada (2026-10-05).  
> Depende de: backend spec 015 (`GET/PATCH /notificacoes`).  
> O painel é o canal da ONG (`papel: "ong"`).

---

## Objetivo

Mostrar no header do painel os avisos de animais cadastrados por outras contas (usuário do app ou outra ONG), com contagem de não lidas e atalho para o detalhe do animal.

---

## Decisões

1. O sino fica no header, à esquerda do perfil da ONG. Não entra um item novo na sidebar.
2. O painel consulta `GET /notificacoes` ao abrir e a cada 30 segundos.
3. O número no sino é `naoLidas`. Acima de 9, o badge mostra `9+`.
4. O clique no sino abre um painel com a lista (título, mensagem, data). Lista vazia: “Nenhuma notificação ainda.”
5. Clicar num aviso marca `PATCH /notificacoes/:id/lida` (se ainda não lido) e, se `animal` existir, navega para `/painel/animais/:id/detalhes?status=`.
6. Se `animal` for `null`, o texto permanece e não há navegação (“Animal não está mais no sistema”).
7. “Marcar todas como lidas” chama `PATCH /notificacoes/lidas`.
8. 401 encerra a sessão e volta ao login. O proxy do Vite inclui `/notificacoes`.

---

## Fora de escopo

- Push do navegador.
- Página dedicada fora do header.
- Alterar o cadastro de animal além de passar a disparar o aviso que a API já grava.

---

## Critérios de pronto

- [ ] O sino aparece no header com a quantidade de não lidas.
- [ ] Um cadastro feito por usuário do app aparece no painel sem recarregar a página inteira (no máximo um ciclo de 30 s, ou ao reabrir o sino).
- [ ] O cadastro feito pela própria ONG logada não aparece para ela.
- [ ] Clicar no aviso abre o detalhe do animal e zera a não lida daquele item.
- [ ] “Marcar todas como lidas” zera o badge.
