## O que vamos construir

Duas funcionalidades novas para impressionar na aula:

### 1. Contador de calorias (kcal)
- Cada receita salva passa a ter um campo **calorias por porção** estimado pela IA.
- Quando uma receita é gerada (Chef Despensa, "Receitas para você", import por URL), a IA já devolve a estimativa de kcal junto com os outros campos.
- No card e no detalhe da receita, mostramos um badge "≈ 320 kcal/porção".
- Em **Minhas Receitas** adicionamos um pequeno painel no topo: **"Hoje você consumiu: 0 kcal"** com botão "+ Comi isso" em cada receita salva, que registra o consumo do dia.
- Painel mostra total do dia + lista do que foi consumido, com opção de remover. Reseta automaticamente a cada novo dia.

### 2. Avaliações e notas pessoais
- Em cada receita salva: estrelas (1–5) + campo de observação livre ("ficou ótimo, da próxima usar menos sal").
- Botão "Já fiz essa" que conta quantas vezes você preparou.
- Ordenação extra em Minhas Receitas: "Melhor avaliadas" e "Mais feitas".

---

## Detalhes técnicos

**Banco (migration):**
- `user_recipes`: adicionar colunas `calories_per_serving` (int), `rating` (int 1-5), `notes` (text), `times_cooked` (int default 0).
- Nova tabela `calorie_log`: `id`, `user_id`, `recipe_id` (nullable), `recipe_title`, `calories`, `consumed_at` (date default today), `created_at`. RLS por `user_id`.

**Edge functions:**
- `generate-recipes`, `pantry-chat`, `parse-recipe`: atualizar prompt + JSON schema para incluir `calories_per_serving` (estimativa por porção).
- Sem nova função — estimativa vai junto da geração existente.

**Frontend:**
- `RecipeCard.tsx`: badge de kcal ao lado de tempo/dificuldade.
- `minhas-receitas.tsx`:
  - Painel "Calorias hoje" no topo (soma do `calorie_log` do dia).
  - Botão "+ Comi isso" em cada card salvo → insere em `calorie_log`.
  - Componente de estrelas + textarea de notas (salva direto em `user_recipes`).
  - Botão "Já fiz" incrementa `times_cooked` e registra calorias.
  - Filtros novos: "Melhor avaliadas", "Mais feitas".
- `PantryChat.tsx`: extrair `calories_per_serving` da resposta da IA ao salvar.

**Aviso ao usuário:** deixar claro na UI que os valores de kcal são **estimativas da IA** (não substituem rótulo nutricional).

---

## O que NÃO entra agora
- Macros (proteína/carbo/gordura) — você escolheu só kcal.
- Meta diária personalizada / gráficos históricos — fica para depois se quiser evoluir.
