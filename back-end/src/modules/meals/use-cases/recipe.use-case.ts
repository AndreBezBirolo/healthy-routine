import { prisma } from '../../../shared/prisma/prisma.js';
import { CreateRecipeInput } from '../dtos/recipe.dto.js';

export class RecipeUseCase {
  async getRecipes(workspaceId: string, category?: string) {
    const recipes = await prisma.recipe.findMany({
      where: {
        workspaceId,
        category: category ? category : undefined,
      },
      orderBy: [{ isFavorite: 'desc' }, { title: 'asc' }],
    });

    return recipes.map((r) => ({
      ...r,
      ingredients: JSON.parse(r.ingredients || '[]'),
    }));
  }

  async createRecipe(workspaceId: string, data: CreateRecipeInput) {
    const recipe = await prisma.recipe.create({
      data: {
        workspaceId,
        title: data.title,
        category: data.category,
        ingredients: JSON.stringify(data.ingredients),
        instructions: data.instructions,
        prepTimeMinutes: data.prepTimeMinutes,
        isFavorite: data.isFavorite,
      },
    });

    return {
      ...recipe,
      ingredients: JSON.parse(recipe.ingredients),
    };
  }

  async getRandomSpecialIdea(workspaceId: string) {
    const specials = await prisma.recipe.findMany({
      where: {
        workspaceId,
        category: { in: ['GOURMET', 'WEEKEND', 'DESSERT'] },
      },
    });

    if (specials.length === 0) {
      return null;
    }

    const randomIndex = Math.floor(Math.random() * specials.length);
    const selected = specials[randomIndex];

    return {
      ...selected,
      ingredients: JSON.parse(selected.ingredients || '[]'),
    };
  }
}
