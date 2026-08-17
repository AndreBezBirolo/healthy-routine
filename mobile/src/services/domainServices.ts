import { api } from './api';
import { MealPlanItem, TaskItem } from '../types/models';
import { RecipeItem } from '../components/tabs/SpecialTab';
import { ShoppingItemUI } from '../components/tabs/ShoppingTab';
import { ExpenseItem, BalanceSummary } from '../components/tabs/ExpensesTab';
import { WeekDayItem } from '../components/tabs/WeekTab';

// Helper para obter a data local no formato YYYY-MM-DD sem distorção de UTC
export const getLocalDateString = (d = new Date()): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper para formatar os 7 dias da semana a partir da data atual do sistema
export const formatWeekDays = (rawMeals: any[], baseDate = new Date()): WeekDayItem[] => {
  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

  const weekList: WeekDayItem[] = [];

  for (let i = 0; i < 7; i++) {
    const current = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate() + i);
    const dayStr = dayNames[current.getDay()];
    const dateStr = `${current.getDate()} ${monthNames[current.getMonth()]}`;
    const isoDateOnly = getLocalDateString(current);

    // Procura refeições deste dia na lista retornada da API
    const dayMeals = Array.isArray(rawMeals)
      ? rawMeals.filter((m) => {
          if (!m.date) return false;
          const mDateIso = typeof m.date === 'string' ? m.date.split('T')[0] : getLocalDateString(new Date(m.date));
          return mDateIso === isoDateOnly;
        })
      : [];

    const lunchMeal = dayMeals.find((m) => m.mealType === 'LUNCH');
    const dinnerMeal = dayMeals.find((m) => m.mealType === 'DINNER');
    const extraMeals = dayMeals.filter((m) => m.mealType !== 'LUNCH' && m.mealType !== 'DINNER');

    weekList.push({
      day: dayStr,
      date: dateStr,
      lunch: lunchMeal ? lunchMeal.recipeTitle : 'Nenhuma',
      lunchIsPrep: lunchMeal ? lunchMeal.isMealPrep : false,
      lunchMeal,
      dinner: dinnerMeal ? dinnerMeal.recipeTitle : 'Nenhuma',
      dinnerIsPrep: dinnerMeal ? dinnerMeal.isMealPrep : false,
      dinnerMeal,
      isPrep: dayMeals.some((m) => m.isMealPrep),
      isSpecial: dayMeals.some((m) => m.isSpecial),
      extraCount: extraMeals.length,
      extraTitles: extraMeals.map((m) => m.recipeTitle),
      extraMeals,
      rawMeals: dayMeals,
    });
  }

  return weekList;
};

export const mealService = {
  getTodayMeals: async (workspaceId: string): Promise<MealPlanItem[]> => {
    const todayIso = getLocalDateString();
    const res = await api.get(`/workspaces/${workspaceId}/meals/today`, {
      params: { date: todayIso },
    });
    return Array.isArray(res.data) ? res.data : [];
  },

  getWeekMeals: async (workspaceId: string, startDate?: string): Promise<WeekDayItem[]> => {
    const startIso = startDate || getLocalDateString();
    const res = await api.get(`/workspaces/${workspaceId}/meals/week`, {
      params: { startDate: startIso },
    });
    const mealsList = Array.isArray(res.data) ? res.data : [];
    const parts = startIso.split('-');
    const base = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    return formatWeekDays(mealsList, base);
  },

  createMeal: async (workspaceId: string, data: { date: string; mealType: string; recipeTitle: string; ingredients?: string[]; notes?: string; assignedToUserId?: string | null }) => {
    const res = await api.post(`/workspaces/${workspaceId}/meals`, data);
    return res.data;
  },

  updateMeal: async (workspaceId: string, mealId: string, data: { recipeTitle?: string; ingredients?: string[]; notes?: string; assignedToUserId?: string | null; date?: string; mealType?: string }) => {
    const res = await api.put(`/workspaces/${workspaceId}/meals/${mealId}`, data);
    return res.data;
  },

  toggleConsumed: async (workspaceId: string, mealId: string, isConsumed: boolean) => {
    const res = await api.patch(`/workspaces/${workspaceId}/meals/${mealId}/toggle-consumed`, { isConsumed });
    return res.data;
  },

  deleteMeal: async (workspaceId: string, mealId: string) => {
    const res = await api.delete(`/workspaces/${workspaceId}/meals/${mealId}`);
    return res.data;
  },

  batchSchedule: async (workspaceId: string, data: { startDate: string; daysCount: number; mealType?: string; mealTypes?: string[]; recipeTitle: string; ingredients?: string[]; assignedToUserId?: string | null }) => {
    const res = await api.post(`/workspaces/${workspaceId}/meals/batch`, data);
    return res.data;
  },

  createSpecialMeal: async (workspaceId: string, data: { date: string; mealType: string; recipeTitle: string; ingredients?: string[]; notes?: string; assignedToUserId?: string | null }) => {
    const res = await api.post(`/workspaces/${workspaceId}/meals`, {
      ...data,
      isMealPrep: false,
      isSpecial: true,
    });
    return res.data;
  },
};

export const taskService = {
  getTasks: async (workspaceId: string): Promise<TaskItem[]> => {
    const res = await api.get(`/workspaces/${workspaceId}/tasks`);
    return Array.isArray(res.data) ? res.data : [];
  },

  createTask: async (workspaceId: string, data: { title: string; category?: string; dueDate?: string; recurrence?: string; assignedToUserId?: string | null }) => {
    const res = await api.post(`/workspaces/${workspaceId}/tasks`, data);
    return res.data;
  },

  updateTask: async (workspaceId: string, taskId: string, data: Partial<TaskItem>) => {
    const res = await api.put(`/workspaces/${workspaceId}/tasks/${taskId}`, data);
    return res.data;
  },

  toggleTask: async (workspaceId: string, taskId: string, completed: boolean) => {
    const res = await api.patch(`/workspaces/${workspaceId}/tasks/${taskId}/toggle`, { completed });
    return res.data;
  },

  deleteTask: async (workspaceId: string, taskId: string) => {
    const res = await api.delete(`/workspaces/${workspaceId}/tasks/${taskId}`);
    return res.data;
  },
};

export const recipeService = {
  getRecipes: async (workspaceId: string): Promise<RecipeItem[]> => {
    const res = await api.get(`/workspaces/${workspaceId}/recipes`);
    return Array.isArray(res.data) ? res.data : [];
  },

  createRecipe: async (workspaceId: string, data: { title: string; category: string; prepTimeMinutes: number; description?: string }) => {
    const res = await api.post(`/workspaces/${workspaceId}/recipes`, data);
    return res.data;
  },

  spinRoulette: async (workspaceId: string) => {
    const res = await api.get(`/workspaces/${workspaceId}/recipes/roulette`);
    return res.data;
  },
};

export const shoppingService = {
  getItems: async (workspaceId: string): Promise<ShoppingItemUI[]> => {
    const res = await api.get(`/workspaces/${workspaceId}/shopping`);
    return Array.isArray(res.data) ? res.data : [];
  },

  addItem: async (workspaceId: string, data: { name: string; quantity?: string; category: string; price?: number; recurrence?: string; notes?: string }) => {
    const res = await api.post(`/workspaces/${workspaceId}/shopping`, data);
    return res.data;
  },

  updateItem: async (workspaceId: string, itemId: string, data: Partial<ShoppingItemUI>) => {
    const res = await api.put(`/workspaces/${workspaceId}/shopping/${itemId}`, data);
    return res.data;
  },

  toggleItem: async (workspaceId: string, itemId: string, checked: boolean) => {
    const res = await api.patch(`/workspaces/${workspaceId}/shopping/${itemId}/toggle`, { checked });
    return res.data;
  },

  deleteItem: async (workspaceId: string, itemId: string) => {
    const res = await api.delete(`/workspaces/${workspaceId}/shopping/${itemId}`);
    return res.data;
  },

  clearChecked: async (workspaceId: string) => {
    const res = await api.delete(`/workspaces/${workspaceId}/shopping/clear-checked`);
    return res.data;
  },
};

export const expenseService = {
  getExpenses: async (workspaceId: string): Promise<ExpenseItem[]> => {
    const res = await api.get(`/workspaces/${workspaceId}/expenses`);
    return Array.isArray(res.data) ? res.data : [];
  },

  createExpense: async (workspaceId: string, data: { title: string; amount: number; category: string; date: string; notes?: string }) => {
    const res = await api.post(`/workspaces/${workspaceId}/expenses`, data);
    return res.data;
  },

  getBalance: async (workspaceId: string): Promise<BalanceSummary> => {
    const res = await api.get(`/workspaces/${workspaceId}/expenses/balance`);
    return res.data || { totalSpent: 0, fairSharePerPerson: 0, balances: [] };
  },
};

export const activityService = {
  getActivities: async (workspaceId: string) => {
    const res = await api.get(`/workspaces/${workspaceId}/activity`);
    return Array.isArray(res.data?.items) ? res.data.items : Array.isArray(res.data) ? res.data : [];
  },
};
