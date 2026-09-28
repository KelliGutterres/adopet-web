# Spec 014 — Remover abas Relatórios e Configurações

> **Status:** aprovada e implementada (2026-09-28).  
> Depende de: spec 003 (sidebar do painel).  
> **Não altera** rotas, API, páginas existentes nem o `adopet-backend` / `adopet-mobile`.  
> Substitui, no menu, os itens **Relatórios** e **Configurações** nascidos na spec 003 (e citados como “Em breve” nas specs 008, 010 e 013).

---

## Objetivo

Tirar do painel da ONG os itens de menu **Relatórios** e **Configurações**. Eles nunca tiveram tela: apareciam desabilitados, com o título “Em breve”.

---

## Recorte vs o que já existe

| Fluxo | Onde está | Nesta spec |
|-------|-----------|------------|
| Sidebar | spec 003 (itens disabled); ordem atual na spec 013 | **remover** Relatórios e Configurações |
| Dashboard | spec 003 | **inalterado** — continua “Em breve” |
| Adoção, Encontrados, Perdidos, Similaridade, Usuários, ONG | specs 003, 007, 008, 010, 013 | **inalterados** |
| Sair | spec 002 | **inalterado** |
| Rotas `/painel/*` | specs 001–013 | **inalteradas** — não havia rota para essas abas |

---

## Escopo (esta tarefa)

1. Remover os itens `relatorios` e `config` de `NAV_ITEMS` em `Sidebar.jsx`.
2. Remover os ícones SVG desses dois itens (não são usados em outro lugar).
3. Atualizar `docs/CONTEXTO-PROJETO.md` e o índice em `specs/README.md`.

Ordem do menu depois da mudança:

Dashboard (disabled) → Adoção → Encontrados → Perdidos → Comparação de Similaridade → Usuários → ONG / Instituição → Sair.

---

## Fora de escopo

- Ativar ou remover o Dashboard.
- Criar páginas, rotas ou endpoints de relatórios ou configurações.
- Alterar header, sino, listagens, detalhe, usuários, perfil da ONG ou comparação de similaridade.
- Reescrever o texto histórico das specs 003, 008, 010 e 013.

---

## Critérios de pronto

- [x] O menu do painel não mostra “Relatórios” nem “Configurações”.
- [x] Os demais itens (incluindo Dashboard desabilitado e Sair) permanecem no mesmo lugar e com o mesmo comportamento.
- [x] Nenhuma rota nova ou removida.
- [x] Contexto do projeto e índice de specs atualizados.
