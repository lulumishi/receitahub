// Matcher compartilhado de emojis por receita.
// Prioridade: palavras-chave do título > ingredientes > categoria.

export type RecipeStyle = { emojis: string; bg: string };

const CATEGORY_STYLE: Record<string, RecipeStyle> = {
  "prato principal": { emojis: "🍗🥔🌿", bg: "from-amber-900/40 to-amber-800/20" },
  "massa":           { emojis: "🍝🍅🧀", bg: "from-orange-900/40 to-orange-800/20" },
  "salada":          { emojis: "🥗🥑🍅", bg: "from-green-900/40 to-green-800/20" },
  "sobremesa":       { emojis: "🍰🍓✨", bg: "from-pink-900/40 to-pink-800/20" },
  "pães":            { emojis: "🍞🌾🧈", bg: "from-yellow-900/40 to-yellow-800/20" },
  "pao":             { emojis: "🍞🌾🧈", bg: "from-yellow-900/40 to-yellow-800/20" },
  "sopa":            { emojis: "🍲🥕🌶️", bg: "from-red-900/40 to-red-800/20" },
  "café da manhã":   { emojis: "🥞🍳☕", bg: "from-yellow-900/40 to-amber-800/20" },
  "lanche":          { emojis: "🥪🍟🥤", bg: "from-lime-900/40 to-lime-800/20" },
  "bebida":          { emojis: "🥤🍋🧊", bg: "from-cyan-900/40 to-cyan-800/20" },
  "conserva":        { emojis: "🫙🥒🌶️", bg: "from-zinc-800/60 to-zinc-700/30" },
  "acompanhamento":  { emojis: "🥦🥕🌽", bg: "from-emerald-900/40 to-emerald-800/20" },
  "entrada":         { emojis: "🥟🧀🌿", bg: "from-stone-800/60 to-stone-700/30" },
  "frutos do mar":   { emojis: "🦐🍋🌶️", bg: "from-blue-900/40 to-cyan-800/20" },
  "peixe":           { emojis: "🐟🍋🌿", bg: "from-sky-900/40 to-sky-800/20" },
  "frango":          { emojis: "🍗🌶️🧄", bg: "from-amber-900/40 to-orange-800/20" },
  "carne":           { emojis: "🥩🔥🧂", bg: "from-red-900/50 to-amber-900/30" },
  "vegano":          { emojis: "🌱🥑🥦", bg: "from-green-900/40 to-emerald-800/20" },
  "vegetariano":     { emojis: "🥕🥬🌿", bg: "from-emerald-900/40 to-green-800/20" },
  "default":         { emojis: "🍽️✨🌿", bg: "from-zinc-800/60 to-zinc-700/30" },
};

// Ordem importa: regras mais específicas primeiro.
const KEYWORDS: Array<{ match: RegExp; emojis: string; bg: string }> = [
  // Brasil
  { match: /feijoada/i,                    emojis: "🍲🥓🍊", bg: "from-stone-900/60 to-amber-950/40" },
  { match: /feijão|feijao|tutu|baião|baiao/i, emojis: "🫘🥓🌿", bg: "from-stone-900/60 to-amber-950/40" },
  { match: /moqueca|bobó|bobo de camarão/i, emojis: "🦐🥘🌴", bg: "from-orange-900/40 to-red-800/20" },
  { match: /acarajé|acaraje|vatapá|vatapa|caruru/i, emojis: "🫘🌶️🥥", bg: "from-amber-900/40 to-red-900/30" },
  { match: /carne seca|carne de sol|charque/i, emojis: "🥩🌵🧂", bg: "from-red-950/50 to-amber-900/30" },
  { match: /estrogonofe|strogonoff|estrogonofe/i, emojis: "🍛🍄🥄", bg: "from-orange-900/40 to-stone-800/40" },
  { match: /escondidinho|purê|pure de|mandioca|aipim|macaxeira/i, emojis: "🥔🧈🌿", bg: "from-amber-900/40 to-stone-800/40" },
  { match: /pinhão|pinhao/i,               emojis: "🌰🔥🌿", bg: "from-amber-950/60 to-stone-900/40" },
  { match: /coxinha|croquete|bolinho de queijo|pastel|empada|empadão/i, emojis: "🥟🧀🌿", bg: "from-amber-900/40 to-yellow-800/20" },
  { match: /pão de queijo|pao de queijo/i, emojis: "🧆🧀☕", bg: "from-yellow-900/40 to-amber-800/20" },
  { match: /bolinho de chuva|churros|sonho/i, emojis: "🍩🍯✨", bg: "from-amber-900/40 to-rose-800/20" },
  { match: /brigadeiro|beijinho|paçoca|pacoca|doce de leite/i, emojis: "🍫🍬✨", bg: "from-amber-950/60 to-stone-900/40" },
  { match: /pudim|flan|manjar/i,           emojis: "🍮🥛✨", bg: "from-amber-900/40 to-yellow-800/20" },
  { match: /tapioca|beiju|cuscuz/i,        emojis: "🫓🥥🧈", bg: "from-stone-800/60 to-amber-900/30" },
  { match: /açaí|acai/i,                   emojis: "🍇🥣🍌", bg: "from-fuchsia-950/60 to-purple-900/30" },
  { match: /farofa/i,                      emojis: "🌾🥓🧅", bg: "from-amber-900/40 to-stone-800/40" },
  { match: /churrasco|picanha|espetinho|linguiça|linguica/i, emojis: "🥩🔥🧂", bg: "from-red-900/50 to-amber-900/30" },
  { match: /caipirinha|batida/i,           emojis: "🍹🍋🧊", bg: "from-lime-900/40 to-cyan-800/20" },

  // Massas e pizzas
  { match: /lasanha|lasagna/i,             emojis: "🍝🧀🍅", bg: "from-red-900/40 to-orange-800/20" },
  { match: /nhoque|gnocchi/i,              emojis: "🥟🌿🧀", bg: "from-amber-900/40 to-stone-800/40" },
  { match: /pizza|calzone/i,               emojis: "🍕🍅🌿", bg: "from-red-900/40 to-orange-800/20" },
  { match: /macarrão|macarrao|espaguete|spaghetti|penne|talharim|massa|pasta|carbonara/i, emojis: "🍝🍅🧀", bg: "from-orange-900/40 to-red-800/20" },

  // Arroz e grãos
  { match: /risoto|risotto/i,              emojis: "🍚🍄🧈", bg: "from-stone-800/60 to-amber-900/30" },
  { match: /arroz/i,                       emojis: "🍚🌿✨", bg: "from-stone-800/60 to-amber-900/30" },
  { match: /quinoa|grão de bico|grao de bico|lentilha/i, emojis: "🫘🥗🌿", bg: "from-emerald-900/40 to-stone-800/40" },
  { match: /polenta|angu/i,                emojis: "🌽🧈🌿", bg: "from-yellow-900/40 to-amber-800/20" },

  // Proteínas
  { match: /frango|chicken|galinha|coxa|sobrecoxa|peito de/i, emojis: "🍗🌶️🧄", bg: "from-amber-900/40 to-orange-800/20" },
  { match: /costela|bife|contra ?filé|patinho|alcatra|carne moída|carne moida|hambúrguer|hamburguer|burger|carne/i, emojis: "🥩🔥🧂", bg: "from-red-900/50 to-amber-900/30" },
  { match: /porco|lombo|bacon|pernil|costelinha/i, emojis: "🥓🔥🌿", bg: "from-red-950/50 to-amber-900/30" },
  { match: /salmão|salmao|atum|tilápia|tilapia|bacalhau|peixe|sardinha|merluza/i, emojis: "🐟🍋🌿", bg: "from-sky-900/40 to-cyan-800/20" },
  { match: /camarão|camarao|lula|polvo|mexilhão|frutos do mar|marisco/i, emojis: "🦐🍋🌶️", bg: "from-orange-900/40 to-red-800/20" },
  { match: /ovo|omelete|fritada|mexido|frittata/i, emojis: "🍳🧀🌿", bg: "from-yellow-900/40 to-orange-800/20" },
  { match: /tofu|proteína de soja|proteina de soja|falafel/i, emojis: "🌱🥢🌿", bg: "from-emerald-900/40 to-green-800/20" },

  // Sopas e caldos
  { match: /canja/i,                       emojis: "🍲🍗🌿", bg: "from-amber-900/40 to-yellow-800/20" },
  { match: /sopa|caldo|creme de|ensopado|cozido/i, emojis: "🍲🥕🌶️", bg: "from-red-900/40 to-amber-800/20" },

  // Saladas e vegetais
  { match: /salada|folhas|rúcula|rucula|alface/i, emojis: "🥗🥑🍅", bg: "from-green-900/40 to-emerald-800/20" },
  { match: /abobrinha|berinjela|abóbora|abobora|couve|brócolis|brocolis|legumes|vegetais|verduras|refogado/i, emojis: "🥦🥕🌽", bg: "from-emerald-900/40 to-green-800/20" },
  { match: /batata|frita|rústica|rustica/i, emojis: "🥔🧄🌿", bg: "from-amber-900/40 to-yellow-800/20" },
  { match: /cogumelo|shitake|shimeji|champignon/i, emojis: "🍄🧄🌿", bg: "from-stone-800/60 to-amber-900/30" },
  { match: /milho|pamonha/i,               emojis: "🌽🧈✨", bg: "from-yellow-900/40 to-amber-800/20" },
  { match: /tomate|caprese/i,              emojis: "🍅🧀🌿", bg: "from-red-900/40 to-green-800/20" },
  { match: /cenoura/i,                     emojis: "🥕🌿✨", bg: "from-orange-900/40 to-amber-800/20" },

  // Pães e massas doces
  { match: /focaccia|ciabatta|baguete|pão|pao|bread|brioche|sourdough|fermenta/i, emojis: "🍞🌾🧈", bg: "from-yellow-900/40 to-amber-800/20" },
  { match: /panqueca|pancake|waffle|crepe|rabanada/i, emojis: "🥞🍯🍓", bg: "from-amber-900/40 to-yellow-800/20" },
  { match: /torta|quiche|tarte/i,          emojis: "🥧🧀🌿", bg: "from-amber-900/40 to-rose-800/20" },
  { match: /cookie|biscoito|bolacha/i,     emojis: "🍪🍫✨", bg: "from-amber-900/40 to-stone-800/40" },
  { match: /muffin|cupcake|brownie/i,      emojis: "🧁🍫✨", bg: "from-pink-900/40 to-amber-900/30" },
  { match: /bolo|cake/i,                   emojis: "🎂🧁✨", bg: "from-pink-900/40 to-rose-800/20" },

  // Sobremesas e frutas
  { match: /chocolate|cacau|ganache/i,     emojis: "🍫🧁✨", bg: "from-amber-950/60 to-stone-900/40" },
  { match: /sorvete|gelato|picolé|picole|milk ?shake/i, emojis: "🍦🍓✨", bg: "from-pink-900/40 to-cyan-800/20" },
  { match: /morango|framboesa|amora|frutas vermelhas/i, emojis: "🍓🥣🌿", bg: "from-pink-900/40 to-rose-800/20" },
  { match: /banana/i,                      emojis: "🍌🥣✨", bg: "from-yellow-900/40 to-amber-800/20" },
  { match: /abacaxi/i,                     emojis: "🍍🌴✨", bg: "from-yellow-900/40 to-lime-800/20" },
  { match: /manga|mango/i,                 emojis: "🥭🌴✨", bg: "from-orange-900/40 to-amber-800/20" },
  { match: /maçã|maca assada|apple/i,      emojis: "🍎🍯🌿", bg: "from-red-900/40 to-amber-800/20" },
  { match: /limão|limao|lemon/i,           emojis: "🍋🌿✨", bg: "from-lime-900/40 to-yellow-800/20" },
  { match: /laranja|tangerina/i,           emojis: "🍊🌿✨", bg: "from-orange-900/40 to-yellow-800/20" },
  { match: /coco|cocada/i,                 emojis: "🥥🌴✨", bg: "from-stone-800/60 to-amber-900/30" },
  { match: /uva|vinho/i,                   emojis: "🍇🍷✨", bg: "from-purple-950/60 to-fuchsia-900/30" },
  { match: /melancia|melão|melao/i,        emojis: "🍉🌿✨", bg: "from-rose-900/40 to-green-800/20" },
  { match: /mel|granola|aveia|iogurte/i,   emojis: "🥣🍯🌾", bg: "from-amber-900/40 to-yellow-800/20" },
  { match: /queijo|cheese|requeijão/i,     emojis: "🧀🌿✨", bg: "from-yellow-900/40 to-amber-800/20" },

  // Mundo
  { match: /sushi|temaki|sashimi/i,        emojis: "🍣🥢🍚", bg: "from-red-950/50 to-stone-900/40" },
  { match: /ramen|yakisoba|missô|misso|teriyaki|japon|shoyu/i, emojis: "🍜🥢🌿", bg: "from-red-950/50 to-amber-900/30" },
  { match: /taco|burrito|nacho|guacamole|mexican|chili/i, emojis: "🌮🌶️🥑", bg: "from-orange-900/40 to-red-800/20" },
  { match: /curry|tikka|indiana|masala/i,  emojis: "🍛🌶️🧄", bg: "from-amber-900/40 to-orange-800/20" },
  { match: /hummus|árabe|arabe|kibe|esfiha|shawarma/i, emojis: "🫓🌿🧄", bg: "from-amber-900/40 to-stone-800/40" },
  { match: /pad thai|tailand|thai|wok|chinês|chines/i, emojis: "🍜🥢🌶️", bg: "from-orange-900/40 to-red-800/20" },
  { match: /grego|tzatziki|souvlaki/i,     emojis: "🫒🧀🌿", bg: "from-sky-900/40 to-emerald-800/20" },

  // Bebidas
  { match: /café|cafe|cappuccino|latte/i,  emojis: "☕🌾✨", bg: "from-stone-900/60 to-amber-950/40" },
  { match: /chá|cha verde|matcha/i,        emojis: "🍵🌿✨", bg: "from-emerald-900/40 to-green-800/20" },
  { match: /suco|smoothie|vitamina|limonada|drink/i, emojis: "🥤🍋🧊", bg: "from-cyan-900/40 to-sky-800/20" },
  { match: /bowl|tropical/i,               emojis: "🥣🍓🥭", bg: "from-fuchsia-900/40 to-pink-800/20" },

  // Lanches
  { match: /sanduíche|sanduiche|sandwich|wrap|tostex|misto quente/i, emojis: "🥪🧀🍅", bg: "from-lime-900/40 to-amber-800/20" },
  { match: /pipoca|snack|petisco/i,        emojis: "🍿🧂✨", bg: "from-yellow-900/40 to-stone-800/40" },
];

export function getRecipeStyle(
  title?: string | null,
  category?: string | null,
  ingredients?: string[] | null,
): RecipeStyle {
  const t = title ?? "";
  const byTitle = KEYWORDS.find((k) => k.match.test(t));
  if (byTitle) return { emojis: byTitle.emojis, bg: byTitle.bg };

  const ing = (ingredients ?? []).join(" ");
  if (ing) {
    const byIng = KEYWORDS.find((k) => k.match.test(ing));
    if (byIng) return { emojis: byIng.emojis, bg: byIng.bg };
  }

  const lower = (category ?? "").toLowerCase();
  const key = Object.keys(CATEGORY_STYLE).find((k) => lower.includes(k));
  return CATEGORY_STYLE[key ?? "default"]!;
}
