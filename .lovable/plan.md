# Plano — Backlog de Alta Prioridade (Opção 2)

Vou implementar três funcionalidades que estavam no documento original do projeto e ainda não existem no app:

1. **US05 — Lista de Compras Automática**
2. **US08 — Substituição de Ingredientes** (sugestões via IA)
3. **RF01 — Modo Visitante** (navegar receitas sem login)

---

## 1. Lista de Compras Automática (US05)

**O que o usuário vai ver**
- Nova página **"Lista de Compras"** (`/lista-compras`) acessível pelo menu do header.
- A lista é gerada automaticamente a partir de:
  - Itens da despensa **vencidos** (precisa repor).
  - Itens **vencendo em até 5 dias**.
  - Itens marcados manualmente como "acabou" pelo usuário na tela da despensa (botão "adicionar à lista").
- Cada item da lista pode ser **marcado como comprado** (checkbox) — ao marcar, ele some da lista.
- Botão **"Limpar comprados"** e **"Exportar/copiar lista"** (texto simples para colar no WhatsApp/Notas).
- Contador no header da página: "12 itens para comprar".

**Como funciona por baixo**
- Nova tabela `shopping_list_items` (id, user_id, name, category, quantity, source, is_purchased, created_at) com RLS por `user_id`.
  - `source` = `"expired" | "expiring" | "manual"` para mostrar a origem com um badge.
- Auto-geração: ao abrir a página, um efeito faz `upsert` dos itens da despensa que estão vencidos/vencendo e ainda não estão na lista (evita duplicatas via unique `(user_id, name)` quando `is_purchased = false`).
- Botão "adicionar à lista" novo na tela `/minha-despensa` em cada card de item.

## 2. Substituição de Ingredientes (US08)

**O que o usuário vai ver**
- Em cada receita exibida (em `/receitas` e `/minhas-receitas`), na lista de ingredientes, um pequeno botão **"substituir"** ao lado de cada ingrediente.
- Ao clicar, abre um popover com **3 sugestões de substitutos** geradas pela IA, considerando o que o usuário tem na despensa. Ex.: "Não tem leite? Tente: leite de coco, iogurte natural, água + manteiga".
- Indicação visual quando o substituto sugerido **já está na despensa do usuário** (badge verde "você tem").

**Como funciona por baixo**
- Nova edge function `ingredient-substitutes` que recebe `{ ingredient, pantry: string[] }` e usa o Lovable AI Gateway (`google/gemini-2.5-flash`) com tool calling para retornar JSON estruturado: `{ substitutes: [{ name, note, inPantry }] }`.
- Cache local simples no componente (Map por nome do ingrediente) para não chamar a IA repetidas vezes na mesma sessão.
- Componente reusável `<IngredientSubstitute ingredient={...} />` consumido pelo `RecipeCard` (e pela tela de detalhe se houver).

## 3. Modo Visitante (RF01)

**O que o usuário vai ver**
- Sem estar logado, ao entrar em `/receitas`, em vez de ver tela vazia ou ser redirecionado, o usuário vê **6 receitas genéricas pré-geradas** (sem filtro por despensa).
- Banner discreto no topo: *"Você está navegando como visitante. Crie uma conta para salvar receitas, gerenciar sua despensa e usar o chat com IA."* com botão "criar conta".
- Funcionalidades **bloqueadas** para visitante (mostram tooltip ou redirecionam pro cadastro):
  - Salvar/favoritar receita
  - Acessar `/minha-despensa`, `/minhas-receitas`, `/perfil`, `/lista-compras`
  - Usar a bolinha de chat (PantryChat fica oculta sem sessão)
- O header também muda: mostra apenas "receitas" no menu quando deslogado.

**Como funciona por baixo**
- Remover qualquer guard que bloqueia `/receitas` para deslogados.
- Ajustar `generate-recipes` para aceitar chamada anônima (a função já roda sem JWT verificado pelo `verify_jwt = false` configurado).
- No `RecipeCard`, ações de salvar/favoritar checam `useAuth()` e, se não houver sessão, abrem um pequeno dialog: "Crie uma conta para salvar receitas".
- `AppHeader` filtra `navItems` baseado em `session`.
- `PantryChat` já checa `user`; vou garantir que ele simplesmente não renderiza a bolinha sem sessão.

---

## Detalhes técnicos

**Migração SQL (uma migração nova)**
```sql
create table public.shopping_list_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  name text not null,
  category text,
  quantity text,
  source text not null default 'manual', -- expired | expiring | manual
  is_purchased boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.shopping_list_items enable row level security;
-- 4 policies (select/insert/update/delete) com auth.uid() = user_id
create index on public.shopping_list_items (user_id, is_purchased);
```

**Arquivos a criar**
- `src/routes/lista-compras.tsx` — nova página (gated por sessão).
- `src/components/IngredientSubstitute.tsx` — popover com sugestões.
- `supabase/functions/ingredient-substitutes/index.ts` — edge function (modelo `google/gemini-2.5-flash`, tool calling).
- Bloco em `supabase/config.toml` para a nova função (`verify_jwt = false`).
- Migração descrita acima.

**Arquivos a editar**
- `src/components/AppHeader.tsx` — adicionar link "lista de compras", filtrar nav por sessão.
- `src/routes/minha-despensa.tsx` — botão "adicionar à lista" em cada item.
- `src/routes/receitas.tsx` — permitir acesso sem login + banner de visitante.
- `src/components/RecipeCard.tsx` — integrar `<IngredientSubstitute>` e gating de salvar/favoritar para visitantes.
- `src/components/PantryChat.tsx` — early return quando `!user` (bolinha não aparece).
- `src/routeTree.gen.ts` — auto-gerado pelo plugin (não edito manualmente).

**Modelos de IA usados**
- `google/gemini-2.5-flash` para substitutos (rápido e barato, ideal para chamadas frequentes).
- Reutilizar a infra existente do `LOVABLE_API_KEY` (já configurada).

**Segurança**
- Toda escrita no `shopping_list_items` passa por RLS.
- Edge function de substitutos é pública (sem dados sensíveis), só recebe o nome do ingrediente e a lista da despensa enviada do cliente.

---

Depois de implementar, te entrego um resumo do que mudou e te aviso para testar: criar uma conta, deixar um item vencer, abrir a lista de compras, clicar em "substituir" numa receita, e fazer logout para ver o modo visitante.