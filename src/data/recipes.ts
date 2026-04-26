import recipe1 from "@/assets/recipe-1.jpg";
import recipe2 from "@/assets/recipe-2.jpg";
import recipe3 from "@/assets/recipe-3.jpg";
import recipe4 from "@/assets/recipe-4.jpg";
import recipe5 from "@/assets/recipe-5.jpg";
import recipe6 from "@/assets/recipe-6.jpg";

export type Recipe = {
  id: string;
  title: string;
  image: string;
  category: string;
  time: number;
  difficulty: "fácil" | "médio" | "difícil";
  diet: string[];
  description: string;
  matchPercent: number;
  saved?: boolean;
};

export const recipes: Recipe[] = [
  {
    id: "risoto-cogumelos",
    title: "Risoto cremoso de cogumelos",
    image: recipe1,
    category: "Prato principal",
    time: 35,
    difficulty: "médio",
    diet: ["vegetariano"],
    description:
      "Arroz arbóreo cozido lentamente com caldo, cogumelos paris e parmesão. Conforto em forma de prato.",
    matchPercent: 100,
    saved: true,
  },
  {
    id: "pasta-pomodoro",
    title: "Spaghetti al pomodoro",
    image: recipe2,
    category: "Massa",
    time: 20,
    difficulty: "fácil",
    diet: ["vegetariano"],
    description:
      "Tomate maduro, manjericão fresco e azeite extra virgem. A pasta italiana mais essencial.",
    matchPercent: 92,
  },
  {
    id: "salada-rome",
    title: "Salada de romã & abacate",
    image: recipe3,
    category: "Salada",
    time: 10,
    difficulty: "fácil",
    diet: ["vegano", "sem glúten"],
    description:
      "Folhas verdes, abacate cremoso e sementes de romã com vinagrete cítrico de limão siciliano.",
    matchPercent: 78,
  },
  {
    id: "frango-assado",
    title: "Frango assado com ervas",
    image: recipe4,
    category: "Prato principal",
    time: 75,
    difficulty: "médio",
    diet: ["sem glúten", "low carb"],
    description:
      "Frango inteiro marinado em alecrim, alho e limão, assado lentamente até a pele dourar.",
    matchPercent: 85,
    saved: true,
  },
  {
    id: "torta-chocolate",
    title: "Torta de chocolate & framboesa",
    image: recipe5,
    category: "Sobremesa",
    time: 60,
    difficulty: "difícil",
    diet: ["vegetariano"],
    description:
      "Massa de cacau com ganache intenso e framboesas frescas. Para os dias que pedem indulgência.",
    matchPercent: 64,
  },
  {
    id: "pao-rustico",
    title: "Pão rústico de fermentação natural",
    image: recipe6,
    category: "Pães",
    time: 240,
    difficulty: "difícil",
    diet: ["vegano"],
    description:
      "Casca crocante, miolo aerado e sabor profundo. Tempo é o ingrediente principal.",
    matchPercent: 70,
  },
];
