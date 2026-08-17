import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  ScrollView,
  StatusBar,
  Alert,
  View,
  ActivityIndicator,
  Text,
} from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import './src/i18n';
import { useAppTheme, ThemeProvider } from './src/theme/theme';
import { MealPlanItem, TaskItem, ActivityItem } from './src/types/models';
import { Header } from './src/components/layout/Header';
import { NavigationTabs, TabType } from './src/components/layout/NavigationTabs';
import { BottomNavBar, BottomNavTab } from './src/components/layout/BottomNavBar';
import { TodayTab } from './src/components/tabs/TodayTab';
import { WeekTab, WeekDayItem } from './src/components/tabs/WeekTab';
import { SpecialTab, RecipeItem } from './src/components/tabs/SpecialTab';
import { ShoppingTab, ShoppingItemUI } from './src/components/tabs/ShoppingTab';
import { ExpensesTab, ExpenseItem, BalanceSummary } from './src/components/tabs/ExpensesTab';
import { HistoryTab } from './src/components/tabs/HistoryTab';
import { TasksTab } from './src/components/tabs/TasksTab';
import { ProfileTab } from './src/components/tabs/ProfileTab';
import { MealModal, ModalType, WorkspaceMemberOption } from './src/components/modals/MealModal';
import { MealDetailModal } from './src/components/modals/MealDetailModal';
import { TaskDetailModal } from './src/components/modals/TaskDetailModal';
import { ShoppingDetailModal } from './src/components/modals/ShoppingDetailModal';
import { SubscriptionModal } from './src/components/modals/SubscriptionModal';
import { AuthScreen } from './src/components/screens/AuthScreen';
import { WorkspaceSetupScreen } from './src/components/screens/WorkspaceSetupScreen';
import { ToastProvider, useToast } from './src/components/common/Toast';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  mealService,
  taskService,
  recipeService,
  shoppingService,
  expenseService,
  activityService,
} from './src/services/domainServices';
import { api, getErrorMessage } from './src/services/api';

const queryClient = new QueryClient();

function MainApp() {
  const { t, i18n } = useTranslation();
  const { showToast } = useToast();
  const { colors, isDark } = useAppTheme();

  // Auth & Workspace states
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ id: string; name: string; email: string } | null>(null);
  const [currentWorkspace, setCurrentWorkspace] = useState<{ id: string; name: string; inviteCode: string } | null>(null);
  const [workspaceMembers, setWorkspaceMembers] = useState<WorkspaceMemberOption[]>([]);
  const [isPro, setIsPro] = useState(false);

  // App Navigation states
  const [bottomTab, setBottomTab] = useState<BottomNavTab>('meals');
  const [mealsSubTab, setMealsSubTab] = useState<TabType>('today');
  const [planningSubTab, setPlanningSubTab] = useState<TabType>('shopping');

  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<ModalType>('batch');
  const [subscriptionModalVisible, setSubscriptionModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedMealForDetail, setSelectedMealForDetail] = useState<MealPlanItem | null>(null);
  const [taskDetailModalVisible, setTaskDetailModalVisible] = useState(false);
  const [selectedTaskForDetail, setSelectedTaskForDetail] = useState<TaskItem | null>(null);
  const [shoppingDetailModalVisible, setShoppingDetailModalVisible] = useState(false);
  const [selectedShoppingForDetail, setSelectedShoppingForDetail] = useState<ShoppingItemUI | null>(null);

  // Form states
  const [recipeTitle, setRecipeTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [batchDays, setBatchDays] = useState('5');
  const [batchMealSelection, setBatchMealSelection] = useState<'LUNCH' | 'DINNER' | 'BOTH'>('LUNCH');
  const [customMealType, setCustomMealType] = useState<'BREAKFAST' | 'SNACK'>('BREAKFAST');
  const [assignedMemberId, setAssignedMemberId] = useState<string | null>(null);
  const [recipeCategory, setRecipeCategory] = useState<'GOURMET' | 'WEEKEND' | 'DESSERT'>('GOURMET');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [shoppingPrice, setShoppingPrice] = useState('');
  const [shoppingRecurrence, setShoppingRecurrence] = useState<'NONE' | 'WEEKLY' | 'MONTHLY'>('NONE');

  // Real Domain Data States
  const [todayMeals, setTodayMeals] = useState<MealPlanItem[]>([]);
  const [weekDays, setWeekDays] = useState<WeekDayItem[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [specialCatalog, setSpecialCatalog] = useState<RecipeItem[]>([]);
  const [shoppingItems, setShoppingItems] = useState<ShoppingItemUI[]>([]);
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [expenseSummary, setExpenseSummary] = useState<BalanceSummary>({
    totalSpent: 0,
    fairSharePerPerson: 0,
    balances: [],
  });
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  // Carrega autenticação e workspace do AsyncStorage na inicialização
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem('@healthy_routine_token');
        const storedUser = await AsyncStorage.getItem('@healthy_routine_user');
        const storedWs = await AsyncStorage.getItem('@healthy_routine_workspace');
        const savedLang = await AsyncStorage.getItem('@healthy_routine_language');

        if (savedLang) {
          await i18n.changeLanguage(savedLang);
        }

        if (token && storedUser) {
          setIsAuthenticated(true);
          setUser(JSON.parse(storedUser));
          if (storedWs) {
            setCurrentWorkspace(JSON.parse(storedWs));
          }
        }
      } catch (err) {
        console.error('Failed to load session', err);
      } finally {
        setLoadingInitial(false);
      }
    };
    checkAuth();
  }, []);

  // Carrega dados da API quando o Workspace está conectado
  const loadWorkspaceData = async (wsId: string) => {
    try {
      // 1. Membros do Workspace
      const mems = await api.get(`/workspaces/${wsId}/members`).catch(() => ({ data: [] }));
      setWorkspaceMembers(mems.data || []);

      // 2. Refeições de Hoje
      const today = await mealService.getTodayMeals(wsId).catch(() => []);
      setTodayMeals(today);

      // 3. Refeições da Semana
      const week = await mealService.getWeekMeals(wsId).catch(() => []);
      setWeekDays(week);

      // 4. Receitas Especiais
      const recipes = await recipeService.getRecipes(wsId).catch(() => []);
      setSpecialCatalog(recipes);

      // 5. Tarefas de Casa & Hábitos
      const taskList = await taskService.getTasks(wsId).catch(() => []);
      setTasks(taskList);

      // 6. Lista de Compras
      const shop = await shoppingService.getItems(wsId).catch(() => []);
      setShoppingItems(shop);

      // 7. Despesas & Balanço
      const expList = await expenseService.getExpenses(wsId).catch(() => []);
      setExpenses(expList);
      const balance = await expenseService.getBalance(wsId).catch(() => ({
        totalSpent: 0,
        fairSharePerPerson: 0,
        balances: [],
      }));
      setExpenseSummary(balance);

      // 8. Atividades (Audit Log)
      const acts = await activityService.getActivities(wsId).catch(() => []);
      setActivities(acts);

      // 9. Status de Assinatura
      const subRes = await api.get(`/workspaces/${wsId}/billing/status`).catch(() => ({ data: { isActive: false } }));
      setIsPro(subRes.data.isActive);
    } catch (err) {
      console.error('Error fetching workspace real data', err);
    }
  };

  useEffect(() => {
    if (currentWorkspace?.id) {
      loadWorkspaceData(currentWorkspace.id);
    }
  }, [currentWorkspace?.id]);

  const handleLogout = async () => {
    await AsyncStorage.clear();
    setIsAuthenticated(false);
    setUser(null);
    setCurrentWorkspace(null);
  };

  const handleToggleTask = async (taskId: string, completed: boolean) => {
    if (!currentWorkspace) return;
    try {
      const updated = tasks.map((tItem) => (tItem.id === taskId ? { ...tItem, completed } : tItem));
      setTasks(updated);
      await taskService.toggleTask(currentWorkspace.id, taskId, completed);
      showToast(completed ? t('tasks.completedToast') : t('tasks.uncompletedToast'), 'info');
    } catch (err: any) {
      const msg = err.translatedMessage || getErrorMessage(err);
      showToast(msg, 'error');
      loadWorkspaceData(currentWorkspace.id);
    }
  };

  const handleCreateTask = async (data: { title: string; category: string; dueDate?: string; recurrence: string; assignedToUserId?: string | null }) => {
    if (!currentWorkspace) return;
    try {
      const newTask = await taskService.createTask(currentWorkspace.id, data);
      setTasks([newTask, ...tasks]);
      showToast(t('tasks.createdToast'), 'success');
      loadWorkspaceData(currentWorkspace.id);
    } catch (err: any) {
      const msg = err.translatedMessage || getErrorMessage(err);
      showToast(msg, 'error');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!currentWorkspace) return;
    try {
      setTasks(tasks.filter((tItem) => tItem.id !== taskId));
      await taskService.deleteTask(currentWorkspace.id, taskId);
      showToast(t('tasks.deletedToast'), 'info');
      loadWorkspaceData(currentWorkspace.id);
    } catch (err: any) {
      const msg = err.translatedMessage || getErrorMessage(err);
      showToast(msg, 'error');
      loadWorkspaceData(currentWorkspace.id);
    }
  };

  const handleUpdateTask = async (taskId: string, data: Partial<TaskItem>) => {
    if (!currentWorkspace) return;
    try {
      const updated = await taskService.updateTask(currentWorkspace.id, taskId, data);
      setSelectedTaskForDetail(updated);
      showToast(t('taskDetail.updatedToast'), 'success');
      loadWorkspaceData(currentWorkspace.id);
    } catch (err: any) {
      const msg = err.translatedMessage || getErrorMessage(err);
      showToast(msg, 'error');
    }
  };

  const handleUpdateShoppingItem = async (itemId: string, data: Partial<ShoppingItemUI>) => {
    if (!currentWorkspace) return;
    try {
      const updated = await shoppingService.updateItem(currentWorkspace.id, itemId, data);
      setSelectedShoppingForDetail(updated);
      showToast(t('shoppingDetail.updatedToast'), 'success');
      loadWorkspaceData(currentWorkspace.id);
    } catch (err: any) {
      const msg = err.translatedMessage || getErrorMessage(err);
      showToast(msg, 'error');
    }
  };

  const handleDeleteShoppingItem = async (itemId: string) => {
    if (!currentWorkspace) return;
    try {
      await shoppingService.deleteItem(currentWorkspace.id, itemId);
      setShoppingDetailModalVisible(false);
      setSelectedShoppingForDetail(null);
      showToast(t('shoppingDetail.deletedToast'), 'info');
      loadWorkspaceData(currentWorkspace.id);
    } catch (err: any) {
      const msg = err.translatedMessage || getErrorMessage(err);
      showToast(msg, 'error');
    }
  };

  // Handlers para o Modal de Detalhes da Refeição
  const handleToggleMealConsumed = async (mealId: string, isConsumed: boolean) => {
    if (!currentWorkspace) return;
    try {
      if (selectedMealForDetail && selectedMealForDetail.id === mealId) {
        setSelectedMealForDetail({ ...selectedMealForDetail, isConsumed });
      }
      await mealService.toggleConsumed(currentWorkspace.id, mealId, isConsumed);
      showToast(isConsumed ? t('mealDetail.consumedToast') : t('mealDetail.pendingToast'), 'info');
      loadWorkspaceData(currentWorkspace.id);
    } catch (err: any) {
      const msg = err.translatedMessage || getErrorMessage(err);
      showToast(msg, 'error');
    }
  };

  const handleUpdateMeal = async (mealId: string, data: { recipeTitle: string; ingredients?: string[]; notes?: string; assignedToUserId?: string | null }) => {
    if (!currentWorkspace) return;
    try {
      const updated = await mealService.updateMeal(currentWorkspace.id, mealId, data);
      setSelectedMealForDetail(updated);
      showToast(t('mealDetail.updatedToast'), 'success');
      loadWorkspaceData(currentWorkspace.id);
    } catch (err: any) {
      const msg = err.translatedMessage || getErrorMessage(err);
      showToast(msg, 'error');
    }
  };

  const handleDeleteMeal = async (mealId: string) => {
    if (!currentWorkspace) return;
    try {
      await mealService.deleteMeal(currentWorkspace.id, mealId);
      setDetailModalVisible(false);
      setSelectedMealForDetail(null);
      showToast(t('mealDetail.deletedToast'), 'info');
      loadWorkspaceData(currentWorkspace.id);
    } catch (err: any) {
      const msg = err.translatedMessage || getErrorMessage(err);
      showToast(msg, 'error');
    }
  };

  const handleAddMultipleIngredientsToMarket = async (ingredients: string[], mealName: string) => {
    if (!currentWorkspace) return;
    try {
      const newItems: ShoppingItemUI[] = [];
      for (const ing of ingredients) {
        if (!ing.trim()) continue;
        const item = await shoppingService.addItem(currentWorkspace.id, {
          name: ing.trim(),
          category: 'GROCERIES',
        });
        newItems.push({
          id: item.id || `ing-${Date.now()}-${Math.random()}`,
          name: ing.trim(),
          category: 'GROCERIES',
          recurrence: 'NONE',
          checked: false,
        });
      }

      const updatedShop = [...newItems, ...shoppingItems];
      setShoppingItems(updatedShop);
      await AsyncStorage.setItem(`@healthy_routine_shop_${currentWorkspace.id}`, JSON.stringify(updatedShop));
      showToast(t('mealDetail.ingredientsSentToast', { count: ingredients.length, meal: mealName }), 'success');
    } catch (err: any) {
      const msg = err.translatedMessage || getErrorMessage(err);
      showToast(msg, 'error');
    }
  };

  const spinRoulette = async () => {
    if (!currentWorkspace) return;
    try {
      const selected = await recipeService.spinRoulette(currentWorkspace.id);
      if (!selected?.title) {
        showToast(t('apiErrors.RECIPES_EMPTY'), 'warning');
        return;
      }

      Alert.alert(
        t('alerts.rouletteDialogTitle'),
        t('alerts.rouletteDialogMsg', { title: selected.title, type: selected.category }),
        [
          { text: t('alerts.spinAgain'), onPress: spinRoulette },
          {
            text: t('alerts.addToDinner'),
            onPress: async () => {
              await mealService.createSpecialMeal(currentWorkspace.id, {
                date: new Date().toISOString().split('T')[0],
                mealType: 'DINNER',
                recipeTitle: selected.title,
                notes: 'Sorteado pela roleta!',
              });
              loadWorkspaceData(currentWorkspace.id);
              showToast(t('alerts.rouletteAddedSuccess'), 'success');
            },
          },
        ]
      );
    } catch (err: any) {
      const msg = err.translatedMessage || getErrorMessage(err);
      showToast(msg, 'warning');
    }
  };

  const handleAddMeal = async () => {
    if (!recipeTitle.trim()) {
      showToast(t('alerts.fillRecipeName'), 'warning');
      return;
    }

    if (!currentWorkspace) return;

    try {
      if (modalType === 'new_shopping_item') {
        const parsedPrice = parseFloat(shoppingPrice.replace(',', '.')) || undefined;
        await shoppingService.addItem(currentWorkspace.id, {
          name: recipeTitle,
          quantity: notes || '1 un',
          price: parsedPrice,
          category: 'GROCERIES',
          recurrence: shoppingRecurrence,
        });

        loadWorkspaceData(currentWorkspace.id);
        showToast('Item adicionado à lista de compras! 🛒', 'success');
      } else if (modalType === 'new_expense') {
        const parsedAmount = parseFloat(expenseAmount.replace(',', '.')) || 0;
        if (parsedAmount <= 0) {
          showToast('Informe um valor válido para o gasto.', 'warning');
          return;
        }
        await expenseService.createExpense(currentWorkspace.id, {
          title: recipeTitle,
          amount: parsedAmount,
          category: 'GROCERIES',
          date: new Date().toISOString().split('T')[0],
          notes,
        });
        showToast('Gasto registrado com sucesso! 💰', 'success');
      } else if (modalType === 'batch') {
        const mealTypes =
          batchMealSelection === 'BOTH'
            ? ['LUNCH', 'DINNER']
            : [batchMealSelection];

        await api.post(`/workspaces/${currentWorkspace.id}/meals/batch`, {
          startDate: new Date().toISOString().split('T')[0],
          daysCount: parseInt(batchDays, 10) || 5,
          mealTypes,
          recipeTitle,
          assignedToUserId: assignedMemberId,
        });

        const days = parseInt(batchDays, 10) || 5;
        const total = batchMealSelection === 'BOTH' ? days * 2 : days;
        showToast(`Agendadas ${total} marmitas com sucesso! 🍱`, 'success');
      } else if (modalType === 'dinner') {
        await api.post(`/workspaces/${currentWorkspace.id}/meals`, {
          date: new Date().toISOString().split('T')[0],
          mealType: 'DINNER',
          recipeTitle,
          notes,
          assignedToUserId: assignedMemberId,
          isMealPrep: false,
          isSpecial: false,
        });
        showToast('Jantar de hoje salvo com sucesso! 🌙', 'success');
      } else if (modalType === 'custom_meal') {
        await api.post(`/workspaces/${currentWorkspace.id}/meals`, {
          date: new Date().toISOString().split('T')[0],
          mealType: customMealType,
          recipeTitle,
          notes,
          assignedToUserId: assignedMemberId,
          isMealPrep: false,
          isSpecial: false,
        });
        showToast('Refeição extra adicionada com sucesso! ☕', 'success');
      } else if (modalType === 'new_recipe') {
        await recipeService.createRecipe(currentWorkspace.id, {
          title: recipeTitle,
          prepTimeMinutes: 30,
          category: recipeCategory,
          description: notes,
        });
        showToast(t('alerts.recipeCreatedSuccess'), 'success');
      } else {
        await mealService.createSpecialMeal(currentWorkspace.id, {
          date: new Date().toISOString().split('T')[0],
          mealType: 'DINNER',
          recipeTitle,
          notes,
        });
        showToast(t('alerts.specialAddedSuccess'), 'success');
      }

      loadWorkspaceData(currentWorkspace.id);
    } catch (err: any) {
      const msg = err.translatedMessage || getErrorMessage(err);
      showToast(msg, 'error');
    }

    setRecipeTitle('');
    setNotes('');
    setExpenseAmount('');
    setShoppingPrice('');
    setShoppingRecurrence('NONE');
    setAssignedMemberId(null);
    setModalVisible(false);
  };

  const handleToggleShoppingItem = async (id: string, newCheckedState?: boolean) => {
    const item = shoppingItems.find((i) => i.id === id);
    if (!item || !currentWorkspace) return;
    const targetState = newCheckedState !== undefined ? newCheckedState : !item.checked;
    
    try {
      const updatedItem = await shoppingService.toggleItem(currentWorkspace.id, id, targetState);
      if (selectedShoppingForDetail && selectedShoppingForDetail.id === id) {
        setSelectedShoppingForDetail(updatedItem);
      }
      const updated = shoppingItems.map((i) => (i.id === id ? { ...i, ...updatedItem, checked: targetState } : i));
      setShoppingItems(updated);
      await AsyncStorage.setItem(`@healthy_routine_shop_${currentWorkspace.id}`, JSON.stringify(updated));
      loadWorkspaceData(currentWorkspace.id);
    } catch {
      loadWorkspaceData(currentWorkspace.id);
    }
  };

  const handleClearCheckedShopping = async () => {
    if (!currentWorkspace) return;
    try {
      await shoppingService.clearChecked(currentWorkspace.id);
      const refreshed = await shoppingService.getItems(currentWorkspace.id);
      setShoppingItems(refreshed);
      showToast('Lista de compras limpa! Itens recorrentes foram agendados para o próximo período 🔄', 'success');
    } catch (err: any) {
      const msg = err.translatedMessage || getErrorMessage(err);
      showToast(msg, 'error');
    }
  };

  const handleAddIngredientsToMarket = async (recipe: RecipeItem) => {
    if (!currentWorkspace) return;
    if (!recipe.ingredients || recipe.ingredients.length === 0) {
      showToast('Esta receita não possui ingredientes listados.', 'warning');
      return;
    }

    for (const ing of recipe.ingredients) {
      await shoppingService.addItem(currentWorkspace.id, {
        name: ing,
        quantity: '1 un',
        category: 'GROCERIES',
      });
    }

    loadWorkspaceData(currentWorkspace.id);
    showToast(`Ingredientes de "${recipe.title}" adicionados à Lista de Compras! 🛒`, 'success');
  };

  if (loadingInitial) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textMuted }]}>Carregando Healthy Routine...</Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <AuthScreen
        onSuccess={async () => {
          const storedUser = await AsyncStorage.getItem('@healthy_routine_user');
          const storedWs = await AsyncStorage.getItem('@healthy_routine_workspace');
          if (storedUser) setUser(JSON.parse(storedUser));
          if (storedWs) setCurrentWorkspace(JSON.parse(storedWs));
          setIsAuthenticated(true);
        }}
      />
    );
  }

  if (!currentWorkspace) {
    return <WorkspaceSetupScreen onSuccess={(ws) => setCurrentWorkspace(ws)} />;
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.card} />

      {/* Header com Indicador de Plano */}
      <Header
        workspaceName={currentWorkspace.name}
        inviteCode={currentWorkspace.inviteCode}
        isPro={isPro}
        onOpenUpgrade={() => setSubscriptionModalVisible(true)}
      />

      {/* Sub-abas de Refeições */}
      {bottomTab === 'meals' && (
        <NavigationTabs
          activeTab={mealsSubTab}
          onSelectTab={setMealsSubTab}
          allowedTabs={['today', 'week', 'special']}
        />
      )}

      {/* Sub-abas de Planejamento */}
      {bottomTab === 'planning' && (
        <NavigationTabs
          activeTab={planningSubTab}
          onSelectTab={setPlanningSubTab}
          allowedTabs={['shopping', 'expenses', 'history']}
        />
      )}

      {/* Conteúdo Principal Dinâmico */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {bottomTab === 'meals' && (
          <>
            {mealsSubTab === 'today' && (
              <TodayTab
                meals={todayMeals}
                currentUserId={user?.id}
                isPro={isPro}
                onOpenSpecialModal={() => {
                  setModalType('special');
                  setModalVisible(true);
                }}
                onOpenDinnerModal={() => {
                  setModalType('dinner');
                  setModalVisible(true);
                }}
                onOpenCustomMealModal={() => {
                  setModalType('custom_meal');
                  setModalVisible(true);
                }}
                onOpenBatchModal={() => {
                  setModalType('batch');
                  setModalVisible(true);
                }}
                onSpinRoulette={spinRoulette}
                onOpenUpgradeModal={() => setSubscriptionModalVisible(true)}
                onSelectMealDetail={(meal) => {
                  setSelectedMealForDetail(meal);
                  setDetailModalVisible(true);
                }}
              />
            )}

            {mealsSubTab === 'week' && (
              <WeekTab
                days={weekDays}
                onOpenBatchModal={() => {
                  setModalType('batch');
                  setModalVisible(true);
                }}
                onSelectMeal={(meal) => {
                  setSelectedMealForDetail(meal);
                  setDetailModalVisible(true);
                }}
              />
            )}

            {mealsSubTab === 'special' && (
              <SpecialTab
                recipes={specialCatalog}
                onSelectRecipe={(recipe) => {
                  setRecipeTitle(recipe.title);
                  setModalType('special');
                  setModalVisible(true);
                }}
                onOpenNewRecipeModal={() => {
                  setModalType('new_recipe');
                  setModalVisible(true);
                }}
                onSpinRoulette={spinRoulette}
                onAddIngredientsToMarket={handleAddIngredientsToMarket}
              />
            )}
          </>
        )}

        {/* Aba de Rotina & Casa (Tarefas e Afazeres Domésticos) */}
        {bottomTab === 'tasks' && (
          <TasksTab
            tasks={tasks}
            workspaceMembers={workspaceMembers}
            currentUserId={user?.id}
            isPro={isPro}
            onToggleTask={handleToggleTask}
            onCreateTask={handleCreateTask}
            onDeleteTask={handleDeleteTask}
            onOpenUpgradeModal={() => setSubscriptionModalVisible(true)}
            onSelectTaskDetail={(task) => {
              setSelectedTaskForDetail(task);
              setTaskDetailModalVisible(true);
            }}
          />
        )}

        {bottomTab === 'planning' && (
          <>
            {planningSubTab === 'shopping' && (
              <ShoppingTab
                items={shoppingItems}
                onToggleItem={(id, checked) => handleToggleShoppingItem(id, checked)}
                onOpenAddItemModal={() => {
                  setModalType('new_shopping_item');
                  setModalVisible(true);
                }}
                onClearChecked={handleClearCheckedShopping}
                onSelectItemDetail={(item) => {
                  setSelectedShoppingForDetail(item);
                  setShoppingDetailModalVisible(true);
                }}
              />
            )}

            {planningSubTab === 'expenses' && (
              <ExpensesTab
                expenses={expenses}
                summary={expenseSummary}
                onOpenNewExpenseModal={() => {
                  setModalType('new_expense');
                  setModalVisible(true);
                }}
              />
            )}

            {planningSubTab === 'history' && <HistoryTab activities={activities} />}
          </>
        )}

        {bottomTab === 'profile' && user && (
          <ProfileTab
            user={user}
            workspace={currentWorkspace}
            onUpdateUser={setUser}
            onLogout={handleLogout}
          />
        )}

        <View style={{ height: 30 }} />
      </ScrollView>

      {/* Barra de Navegação Inferior */}
      <BottomNavBar activeTab={bottomTab} onSelectTab={setBottomTab} />

      {/* Modal de Detalhes da Refeição (Edição, Marcação de Consumido e Compra de Ingredientes) */}
      <MealDetailModal
        visible={detailModalVisible}
        meal={selectedMealForDetail}
        workspaceMembers={workspaceMembers}
        onClose={() => setDetailModalVisible(false)}
        onToggleConsumed={handleToggleMealConsumed}
        onUpdateMeal={handleUpdateMeal}
        onDeleteMeal={handleDeleteMeal}
        onAddIngredientsToMarket={handleAddMultipleIngredientsToMarket}
      />

      {/* Modal de Detalhes da Tarefa (Edição, Conclusão, Auditoria e Exclusão) */}
      <TaskDetailModal
        visible={taskDetailModalVisible}
        task={selectedTaskForDetail}
        workspaceMembers={workspaceMembers}
        onClose={() => setTaskDetailModalVisible(false)}
        onToggleTask={handleToggleTask}
        onUpdateTask={handleUpdateTask}
        onDeleteTask={handleDeleteTask}
      />

      {/* Modal de Detalhes do Item de Compra (Edição, Próximo Ciclo, Preço e Exclusão) */}
      <ShoppingDetailModal
        visible={shoppingDetailModalVisible}
        item={selectedShoppingForDetail}
        onClose={() => setShoppingDetailModalVisible(false)}
        onToggleItem={handleToggleShoppingItem}
        onUpdateItem={handleUpdateShoppingItem}
        onDeleteItem={handleDeleteShoppingItem}
      />

      {/* Modal de Ações com Marmitas (Almoço/Jantar/Ambos), Membros e Refeições Extras */}
      <MealModal
        visible={modalVisible}
        type={modalType}
        recipeTitle={recipeTitle}
        onChangeRecipeTitle={setRecipeTitle}
        notes={notes}
        onChangeNotes={setNotes}
        batchDays={batchDays}
        onChangeBatchDays={setBatchDays}
        batchMealSelection={batchMealSelection}
        onChangeBatchMealSelection={setBatchMealSelection}
        customMealType={customMealType}
        onChangeCustomMealType={setCustomMealType}
        assignedMemberId={assignedMemberId}
        onChangeAssignedMemberId={setAssignedMemberId}
        workspaceMembers={workspaceMembers}
        recipeCategory={recipeCategory}
        onChangeRecipeCategory={setRecipeCategory}
        expenseAmount={expenseAmount}
        onChangeExpenseAmount={setExpenseAmount}
        shoppingPrice={shoppingPrice}
        onChangeShoppingPrice={setShoppingPrice}
        shoppingRecurrence={shoppingRecurrence}
        onChangeShoppingRecurrence={setShoppingRecurrence}
        onClose={() => setModalVisible(false)}
        onConfirm={handleAddMeal}
      />

      {/* Modal de Assinatura */}
      <SubscriptionModal
        visible={subscriptionModalVisible}
        workspaceId={currentWorkspace.id}
        onClose={() => setSubscriptionModalVisible(false)}
        onSuccess={() => setIsPro(true)}
      />
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <ToastProvider>
            <MainApp />
          </ToastProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '600',
  },
});
