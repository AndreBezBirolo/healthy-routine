import { describe, it, expect } from 'vitest';
import { AuthUseCase } from '../modules/auth/use-cases/auth.use-case.js';
import { WorkspaceUseCase } from '../modules/workspaces/use-cases/workspace.use-case.js';
import { MealUseCase } from '../modules/meals/use-cases/meal.use-case.js';
import { ActivityUseCase } from '../modules/activity/use-cases/activity.use-case.js';
import { requestContext } from '../shared/context/request-context.js';
describe('Healthy Routine - Core Integration Flow', () => {
    const authUseCase = new AuthUseCase();
    const workspaceUseCase = new WorkspaceUseCase();
    const mealUseCase = new MealUseCase();
    const activityUseCase = new ActivityUseCase();
    let userA;
    let userB;
    let workspace;
    it('should register User A (Andre) and User B (Partner)', async () => {
        const timestamp = Date.now();
        userA = await authUseCase.register({
            name: 'André',
            email: `andre_${timestamp}@test.com`,
            password: 'password123',
            languagePreference: 'pt-BR',
        });
        userB = await authUseCase.register({
            name: 'Esposa',
            email: `esposa_${timestamp}@test.com`,
            password: 'password123',
            languagePreference: 'pt-BR',
        });
        expect(userA.id).toBeDefined();
        expect(userB.id).toBeDefined();
    });
    it('should allow User A to create a workspace and User B to join via invite code', async () => {
        workspace = await workspaceUseCase.createWorkspace(userA.id, {
            name: 'Lar André & Esposa',
        });
        expect(workspace.inviteCode).toBeDefined();
        const joinedWorkspace = await workspaceUseCase.joinWorkspace(userB.id, {
            inviteCode: workspace.inviteCode,
        });
        expect(joinedWorkspace.id).toBe(workspace.id);
    });
    it('should batch create meal prep (Mon-Fri) and record automated audit log', async () => {
        await requestContext.run({ requestId: 'test-req-1', userId: userA.id, workspaceId: workspace.id }, async () => {
            const meals = await mealUseCase.batchCreateMealPrep(workspace.id, {
                startDay: '2026-08-17',
                daysCount: 5,
                mealType: 'LUNCH',
                recipeTitle: 'Marmita: Frango Grelhado com Legumes e Arroz Integral',
                notes: 'Preparadas no domingo à noite',
            });
            expect(meals.length).toBe(5);
            expect(meals[0].isMealPrep).toBe(true);
            // Schedule special weekend meal (Break monotony)
            const specialMeal = await mealUseCase.createMeal(workspace.id, {
                date: '2026-08-22',
                mealType: 'DINNER',
                isMealPrep: false,
                isSpecial: true,
                recipeTitle: 'Risoto de Parmesão com Alho-poró e Vinho Branco',
                notes: 'Noite especial a dois!',
            });
            expect(specialMeal.isSpecial).toBe(true);
        });
        // Verify Audit Feed
        const feed = await activityUseCase.getActivityFeed(workspace.id, 10);
        expect(feed.items.length).toBeGreaterThan(0);
        expect(feed.items[0].entity).toBe('MEAL_PLAN');
    });
});
