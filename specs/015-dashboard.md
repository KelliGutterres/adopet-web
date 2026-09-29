# Spec 015 — Dashboard do painel

> **Status:** aprovada e implementada (2026-09-28).  
> Depende de: spec 003 (sidebar) e spec 014 (Dashboard continuava “Em breve”).  
> Consome o backend spec 014 (`GET /dashboard`). Não altera listagens, detalhe, usuários, ONG nem similaridade.

---

## Objetivo

Ativar a aba **Dashboard** com quatro métricas e um filtro de período: 7 dias, 1 mês e 3 meses.

---

## Recorte vs o que já existe

| Fluxo | Onde está | Nesta spec |
|-------|-----------|------------|
| Item Dashboard desabilitado | specs 003 e 014 | **vira link** para `/painel/dashboard` |
| Login cai em `/painel` → adoção | spec 002 | **inalterado** |
| Marca da sidebar → adoção | spec 003 | **inalterada** |
| Métricas | backend spec 014 | **só consumir** |

---

## Escopo

1. Rota `/painel/dashboard`, protegida pelo JWT da ONG (mesmo layout do painel).
2. Filtro com três opções. A seleção inicial é **7 dias**. Trocar o filtro busca de novo.
3. Quatro cartões:
   - **Para adoção** — cadastrados no período (`status` A)
   - **Encontrados** — cadastrados no período (`status` E)
   - **Perdidos** — cadastrados no período (`status` P)
   - **Adotados** — animais para adoção excluídos no período
4. Estados de carregando e de erro (com tentar de novo). 401 encerra a sessão e volta ao login.
5. Item **Dashboard** do menu fica ativo nessa rota.
6. Proxy do Vite inclui `/dashboard`.

O texto da tela deixa explícito que os números são do período, e que “adotados” são animais que estavam para adoção e saíram do sistema.

---

## Fora de escopo

- Gráficos, exportação e um período “tudo”.
- Mudar a página inicial do login.
- Contar exclusão de encontrados ou perdidos como adoção (regra da API).
- Relatórios e Configurações (spec 014).

---

## Critérios de pronto

- [x] O menu Dashboard abre `/painel/dashboard` e fica marcado como ativo.
- [x] Os quatro números vêm de `GET /dashboard?periodo=`.
- [x] 7 dias, 1 mês e 3 meses disparam `7d`, `30d` e `90d`.
- [ ] Erro de rede mostra mensagem e permite tentar de novo; 401 volta ao login.
- [x] As outras abas do menu continuam iguais.
