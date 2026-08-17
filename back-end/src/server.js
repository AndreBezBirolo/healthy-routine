import fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import jwt from '@fastify/jwt';
import crypto from 'node:crypto';
import dotenv from 'dotenv';
import { ZodError } from 'zod';
import { prisma } from './shared/prisma/prisma.js';
import { logger } from './shared/logger/logger.js';
import { AppError } from './shared/errors/app-error.js';
import { requestContext } from './shared/context/request-context.js';
import { AuthUseCase } from './modules/auth/use-cases/auth.use-case.js';
import { registerSchema, loginSchema } from './modules/auth/dtos/auth.dto.js';
import { WorkspaceUseCase } from './modules/workspaces/use-cases/workspace.use-case.js';
import { createWorkspaceSchema, joinWorkspaceSchema } from './modules/workspaces/dtos/workspace.dto.js';
import { MealUseCase } from './modules/meals/use-cases/meal.use-case.js';
import { createMealPlanSchema, updateMealPlanSchema, batchMealPrepSchema } from './modules/meals/dtos/meal.dto.js';
import { TaskUseCase } from './modules/tasks/use-cases/task.use-case.js';
import { createTaskSchema, updateTaskSchema } from './modules/tasks/dtos/task.dto.js';
import { RecipeUseCase } from './modules/meals/use-cases/recipe.use-case.js';
import { createRecipeSchema } from './modules/meals/dtos/recipe.dto.js';
import { AiRecipeService } from './modules/meals/services/ai-recipe.service.js';
import { suggestAiRecipeSchema } from './modules/meals/dtos/ai-recipe.dto.js';
import { ExpenseUseCase } from './modules/expenses/use-cases/expense.use-case.js';
import { createExpenseSchema } from './modules/expenses/dtos/expense.dto.js';
import { ShoppingUseCase } from './modules/shopping/use-cases/shopping.use-case.js';
import { createShoppingItemSchema, updateShoppingItemSchema, toggleShoppingItemSchema } from './modules/shopping/dtos/shopping.dto.js';
import { BillingUseCase } from './modules/billing/use-cases/billing.use-case.js';
import { createCheckoutSchema } from './modules/billing/dtos/billing.dto.js';
import { ActivityUseCase } from './modules/activity/use-cases/activity.use-case.js';
dotenv.config();
const app = fastify({
    logger: false, // Managed through our structured Pino instance
});
// Plugins will be registered inside bootstrap function
// Use Cases Instances
const authUseCase = new AuthUseCase();
const workspaceUseCase = new WorkspaceUseCase();
const mealUseCase = new MealUseCase();
const taskUseCase = new TaskUseCase();
const recipeUseCase = new RecipeUseCase();
const aiRecipeService = new AiRecipeService();
const expenseUseCase = new ExpenseUseCase();
const shoppingUseCase = new ShoppingUseCase();
const billingUseCase = new BillingUseCase();
const activityUseCase = new ActivityUseCase();
// Global Context & Structured Logging Hook
app.addHook('onRequest', (req, reply, done) => {
    const requestId = req.headers['x-request-id'] || crypto.randomUUID();
    reply.header('x-request-id', requestId);
    requestContext.run({
        requestId,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
    }, () => {
        done();
    });
});
// Authentication Decorator
app.decorate('authenticate', async (req, reply) => {
    try {
        await req.jwtVerify();
        const store = requestContext.getStore();
        if (store) {
            store.userId = req.user.id;
        }
    }
    catch (err) {
        reply.status(401).send({
            statusCode: 401,
            error: 'UNAUTHORIZED',
            message: 'Authentication token missing or invalid',
        });
    }
});
// Global Error Handler
app.setErrorHandler((error, req, reply) => {
    const store = requestContext.getStore();
    const requestId = store?.requestId || req.id || 'unknown';
    if (error instanceof ZodError || error?.issues || error?.errors) {
        const list = error.issues || error.errors || [];
        const details = Array.isArray(list)
            ? list.map((e) => ({
                field: Array.isArray(e.path) ? e.path.join('.') : 'input',
                issue: e.message || 'Invalid format',
            }))
            : [];
        return reply.status(400).send({
            statusCode: 400,
            error: 'VALIDATION_ERROR',
            details,
            requestId,
        });
    }
    if (error instanceof AppError) {
        return reply.status(error.statusCode).send({
            statusCode: error.statusCode,
            error: error.errorCode,
            details: error.details,
            requestId,
        });
    }
    logger.error({ err: error, requestId }, `Unhandled Exception: ${error.message}`);
    return reply.status(500).send({
        statusCode: 500,
        error: 'INTERNAL_SERVER_ERROR',
        requestId,
    });
});
// Healthcheck
app.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }));
// --- AUTH ROUTES ---
app.post('/api/v1/auth/register', async (req, reply) => {
    const body = registerSchema.parse(req.body);
    const user = await authUseCase.register(body);
    const token = app.jwt.sign({ id: user.id, email: user.email }, { expiresIn: '7d' });
    return reply.status(201).send({ user, token, accessToken: token });
});
app.post('/api/v1/auth/login', async (req, reply) => {
    const body = loginSchema.parse(req.body);
    const user = await authUseCase.login(body);
    const token = app.jwt.sign({ id: user.id, email: user.email }, { expiresIn: '7d' });
    return reply.send({ user, token, accessToken: token });
});
app.put('/api/v1/auth/password', { preHandler: [app.authenticate] }, async (req, reply) => {
    const { currentPassword, newPassword } = req.body || {};
    if (!currentPassword || !newPassword || newPassword.length < 6) {
        throw new AppError('VALIDATION_ERROR', 400);
    }
    await authUseCase.changePassword(req.user.id, currentPassword, newPassword);
    return reply.send({ success: true });
});
app.put('/api/v1/auth/profile', { preHandler: [app.authenticate] }, async (req, reply) => {
    const { name } = req.body || {};
    if (!name || name.trim().length === 0) {
        throw new AppError('VALIDATION_ERROR', 400);
    }
    const updatedUser = await authUseCase.updateProfile(req.user.id, name.trim());
    return reply.send(updatedUser);
});
// --- WORKSPACE ROUTES ---
app.post('/api/v1/workspaces', { preHandler: [app.authenticate] }, async (req, reply) => {
    const body = createWorkspaceSchema.parse(req.body);
    const workspace = await workspaceUseCase.createWorkspace(req.user.id, body);
    return reply.status(201).send(workspace);
});
app.get('/api/v1/workspaces', { preHandler: [app.authenticate] }, async (req, reply) => {
    const workspaces = await workspaceUseCase.getUserWorkspaces(req.user.id);
    return reply.send(workspaces);
});
app.post('/api/v1/workspaces/join', { preHandler: [app.authenticate] }, async (req, reply) => {
    const body = joinWorkspaceSchema.parse(req.body);
    const workspace = await workspaceUseCase.joinWorkspace(req.user.id, body);
    return reply.send(workspace);
});
app.get('/api/v1/workspaces/:workspaceId/members', { preHandler: [app.authenticate] }, async (req, reply) => {
    const { workspaceId } = req.params;
    const members = await prisma.workspaceMember.findMany({
        where: { workspaceId },
        include: {
            user: {
                select: { id: true, name: true, email: true, avatarUrl: true },
            },
        },
        orderBy: { joinedAt: 'asc' },
    });
    return reply.send(members.map((m) => ({ id: m.user.id, name: m.user.name, email: m.user.email, role: m.role })));
});
// --- MEAL PLANNING ROUTES ---
app.get('/api/v1/workspaces/:workspaceId/meals/today', { preHandler: [app.authenticate] }, async (req, reply) => {
    const { workspaceId } = req.params;
    const dateIso = req.query.date || new Date().toISOString().split('T')[0];
    const meals = await mealUseCase.getTodayMeals(workspaceId, dateIso);
    return reply.send(meals);
});
app.get('/api/v1/workspaces/:workspaceId/meals/week', { preHandler: [app.authenticate] }, async (req, reply) => {
    const { workspaceId } = req.params;
    const startDate = req.query.startDate || new Date().toISOString().split('T')[0];
    const meals = await mealUseCase.getWeekMeals(workspaceId, startDate);
    return reply.send(meals);
});
app.post('/api/v1/workspaces/:workspaceId/meals', { preHandler: [app.authenticate] }, async (req, reply) => {
    const { workspaceId } = req.params;
    const store = requestContext.getStore();
    if (store)
        store.workspaceId = workspaceId;
    const body = createMealPlanSchema.parse(req.body);
    const meal = await mealUseCase.createMeal(workspaceId, body);
    return reply.status(201).send(meal);
});
app.post('/api/v1/workspaces/:workspaceId/meals/batch', { preHandler: [app.authenticate] }, async (req, reply) => {
    const { workspaceId } = req.params;
    const store = requestContext.getStore();
    if (store)
        store.workspaceId = workspaceId;
    const body = batchMealPrepSchema.parse(req.body);
    const meals = await mealUseCase.batchCreateMealPrep(workspaceId, body);
    return reply.status(201).send(meals);
});
app.put('/api/v1/workspaces/:workspaceId/meals/:mealId', { preHandler: [app.authenticate] }, async (req, reply) => {
    const { mealId } = req.params;
    const body = updateMealPlanSchema.parse(req.body);
    const meal = await mealUseCase.updateMeal(mealId, body);
    return reply.send(meal);
});
app.patch('/api/v1/workspaces/:workspaceId/meals/:mealId/toggle-consumed', { preHandler: [app.authenticate] }, async (req, reply) => {
    const { mealId } = req.params;
    const { isConsumed } = req.body || {};
    const meal = await mealUseCase.toggleConsumed(mealId, !!isConsumed);
    return reply.send(meal);
});
app.delete('/api/v1/workspaces/:workspaceId/meals/:mealId', { preHandler: [app.authenticate] }, async (req, reply) => {
    const { mealId } = req.params;
    const result = await mealUseCase.deleteMeal(mealId);
    return reply.send(result);
});
// --- ROUTINE TASKS & HOUSEHOLD ---
app.get('/api/v1/workspaces/:workspaceId/tasks', { preHandler: [app.authenticate] }, async (req, reply) => {
    const { workspaceId } = req.params;
    const tasks = await taskUseCase.getTasks(workspaceId);
    return reply.send(tasks);
});
app.post('/api/v1/workspaces/:workspaceId/tasks', { preHandler: [app.authenticate] }, async (req, reply) => {
    const { workspaceId } = req.params;
    const store = requestContext.getStore();
    if (store)
        store.workspaceId = workspaceId;
    const body = createTaskSchema.parse(req.body);
    const task = await taskUseCase.createTask(workspaceId, body);
    return reply.status(201).send(task);
});
app.put('/api/v1/workspaces/:workspaceId/tasks/:taskId', { preHandler: [app.authenticate] }, async (req, reply) => {
    const { taskId } = req.params;
    const body = updateTaskSchema.parse(req.body);
    const task = await taskUseCase.updateTask(taskId, body);
    return reply.send(task);
});
app.patch('/api/v1/workspaces/:workspaceId/tasks/:taskId/toggle', { preHandler: [app.authenticate] }, async (req, reply) => {
    const { taskId } = req.params;
    const { completed } = req.body || {};
    const task = await taskUseCase.toggleTaskCompleted(taskId, !!completed, req.user?.id);
    return reply.send(task);
});
app.delete('/api/v1/workspaces/:workspaceId/tasks/:taskId', { preHandler: [app.authenticate] }, async (req, reply) => {
    const { taskId } = req.params;
    const result = await taskUseCase.deleteTask(taskId);
    return reply.send(result);
});
// --- RECIPES & SPICE UP ROUTINE ---
app.get('/api/v1/workspaces/:workspaceId/recipes', { preHandler: [app.authenticate] }, async (req, reply) => {
    const { workspaceId } = req.params;
    const category = req.query.category;
    const recipes = await recipeUseCase.getRecipes(workspaceId, category);
    return reply.send(recipes);
});
app.post('/api/v1/workspaces/:workspaceId/recipes', { preHandler: [app.authenticate] }, async (req, reply) => {
    const { workspaceId } = req.params;
    const store = requestContext.getStore();
    if (store)
        store.workspaceId = workspaceId;
    const body = createRecipeSchema.parse(req.body);
    const recipe = await recipeUseCase.createRecipe(workspaceId, body);
    return reply.status(201).send(recipe);
});
app.get('/api/v1/workspaces/:workspaceId/recipes/roulette', { preHandler: [app.authenticate] }, async (req, reply) => {
    const { workspaceId } = req.params;
    const idea = await recipeUseCase.getRandomSpecialIdea(workspaceId);
    if (!idea) {
        return reply.status(404).send({
            statusCode: 404,
            error: 'RECIPES_EMPTY',
        });
    }
    return reply.send(idea);
});
app.post('/api/v1/workspaces/:workspaceId/recipes/ai-suggest', { preHandler: [app.authenticate] }, async (req, reply) => {
    const body = suggestAiRecipeSchema.parse(req.body);
    const suggestion = await aiRecipeService.generateSmartRecipeSuggestion(body);
    return reply.send(suggestion);
});
// --- EXPENSES (SPLITWISE-LIKE SHARED FINANCE) ---
app.get('/api/v1/workspaces/:workspaceId/expenses', { preHandler: [app.authenticate] }, async (req, reply) => {
    const { workspaceId } = req.params;
    const expenses = await expenseUseCase.getExpenses(workspaceId);
    return reply.send(expenses);
});
app.post('/api/v1/workspaces/:workspaceId/expenses', { preHandler: [app.authenticate] }, async (req, reply) => {
    const { workspaceId } = req.params;
    const store = requestContext.getStore();
    if (store)
        store.workspaceId = workspaceId;
    const body = createExpenseSchema.parse(req.body);
    const expense = await expenseUseCase.createExpense(workspaceId, req.user.id, body);
    return reply.status(201).send(expense);
});
app.get('/api/v1/workspaces/:workspaceId/expenses/balance', { preHandler: [app.authenticate] }, async (req, reply) => {
    const { workspaceId } = req.params;
    const summary = await expenseUseCase.getBalanceSummary(workspaceId);
    return reply.send(summary);
});
// --- SHOPPING LIST (INTEGRATED GROCERIES) ---
app.get('/api/v1/workspaces/:workspaceId/shopping', { preHandler: [app.authenticate] }, async (req, reply) => {
    const { workspaceId } = req.params;
    const list = await shoppingUseCase.getShoppingList(workspaceId);
    return reply.send(list);
});
app.post('/api/v1/workspaces/:workspaceId/shopping', { preHandler: [app.authenticate] }, async (req, reply) => {
    const { workspaceId } = req.params;
    const store = requestContext.getStore();
    if (store)
        store.workspaceId = workspaceId;
    const body = createShoppingItemSchema.parse(req.body);
    const item = await shoppingUseCase.addItem(workspaceId, req.user.id, body);
    return reply.status(201).send(item);
});
app.put('/api/v1/workspaces/:workspaceId/shopping/:itemId', { preHandler: [app.authenticate] }, async (req, reply) => {
    const { itemId } = req.params;
    const body = updateShoppingItemSchema.parse(req.body);
    const item = await shoppingUseCase.updateItem(itemId, body);
    return reply.send(item);
});
app.patch('/api/v1/workspaces/:workspaceId/shopping/:itemId/toggle', { preHandler: [app.authenticate] }, async (req, reply) => {
    const { itemId } = req.params;
    const body = toggleShoppingItemSchema.parse(req.body);
    const item = await shoppingUseCase.toggleItem(itemId, body.checked, req.user?.id);
    return reply.send(item);
});
app.delete('/api/v1/workspaces/:workspaceId/shopping/:itemId', { preHandler: [app.authenticate] }, async (req, reply) => {
    const { itemId } = req.params;
    const result = await shoppingUseCase.deleteItem(itemId);
    return reply.send(result);
});
app.delete('/api/v1/workspaces/:workspaceId/shopping/clear-checked', { preHandler: [app.authenticate] }, async (req, reply) => {
    const { workspaceId } = req.params;
    const result = await shoppingUseCase.clearCheckedItems(workspaceId);
    return reply.send(result);
});
// --- BILLING & SUBSCRIPTION (ASAAS / MERCADO PAGO / MOCK) ---
app.get('/api/v1/billing/plans', async (_req, reply) => {
    const plans = await billingUseCase.getPlans();
    return reply.send(plans);
});
app.get('/api/v1/workspaces/:workspaceId/billing/status', { preHandler: [app.authenticate] }, async (req, reply) => {
    const { workspaceId } = req.params;
    const status = await billingUseCase.getSubscriptionStatus(workspaceId);
    return reply.send(status);
});
app.post('/api/v1/workspaces/:workspaceId/billing/checkout', { preHandler: [app.authenticate] }, async (req, reply) => {
    const { workspaceId } = req.params;
    const body = createCheckoutSchema.parse(req.body);
    const checkout = await billingUseCase.createCheckout(workspaceId, req.user.id, body);
    return reply.status(201).send(checkout);
});
// --- ACTIVITY FEED (AUDIT LOGS) ---
app.get('/api/v1/workspaces/:workspaceId/activity', { preHandler: [app.authenticate] }, async (req, reply) => {
    const { workspaceId } = req.params;
    const limit = req.query.limit ? Number(req.query.limit) : 20;
    const cursor = req.query.cursor;
    const feed = await activityUseCase.getActivityFeed(workspaceId, limit, cursor);
    return reply.send(feed);
});
// Start Server
const start = async () => {
    try {
        await app.register(cors, {
            origin: true,
            methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization', 'x-request-id'],
            credentials: true,
        });
        await app.register(helmet);
        await app.register(jwt, {
            secret: process.env.JWT_SECRET || 'dev-secret-key-change-in-production',
        });
        const port = Number(process.env.PORT) || 3333;
        const host = process.env.HOST || '0.0.0.0';
        await app.listen({ port, host });
        logger.info(`🚀 Server running at http://${host}:${port}`);
    }
    catch (err) {
        logger.error(err);
        process.exit(1);
    }
};
start();
