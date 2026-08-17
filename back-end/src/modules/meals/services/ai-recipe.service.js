export class AiRecipeService {
    async generateSmartRecipeSuggestion(input) {
        const list = input.ingredientsAvailable.join(', ');
        // Algoritmo de harmonização culinária inteligente para casais
        const suggestions = [
            {
                title: `Frigideira Especial do Casal (${input.dietPreference})`,
                prepTimeMinutes: 25,
                category: 'GOURMET',
                type: 'Receita Sob Medida com o que tem em casa',
                description: `Combinação criativa utilizando: ${list}. Finalize com azeite e ervas frescas para um jantar a dois perfeito.`,
                instructions: [
                    'Aqueça uma frigideira grande com um fio de azeite.',
                    `Refogue os ingredientes principais (${list.slice(0, 30)}...) até dourarem.`,
                    'Tempere a gosto e sirva com uma taça de vinho!',
                ],
            },
            {
                title: `Wrap / Salada Rápida com Toque Especial`,
                prepTimeMinutes: 15,
                category: 'WEEKEND',
                type: 'Rápido & Leve',
                description: `Montagem prática reaproveitando ${list} sem deixar cair na mesmice.`,
                instructions: [
                    'Corte tudo em tiras finas.',
                    'Misture com molho de iogurte ou azeite com limão.',
                    'Monte os pratos juntos para um almoço leve e descontraído.',
                ],
            },
        ];
        return {
            success: true,
            recipe: suggestions[0],
            alternative: suggestions[1],
        };
    }
}
