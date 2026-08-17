export interface MealPlanItem {
  id: string;
  workspaceId: string;
  date: string;
  mealType: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';
  isMealPrep: boolean;
  isSpecial: boolean;
  isConsumed?: boolean;
  consumedAt?: string | null;
  recipeTitle: string;
  ingredients?: string[];
  notes?: string;
  assignedTo?: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
}

export interface TaskItem {
  id: string;
  workspaceId: string;
  title: string;
  description?: string | null;
  category: 'HOUSEHOLD' | 'CLEANING' | 'HABIT' | 'PET' | 'MAINTENANCE';
  dueDate?: string | null;
  recurrence: 'NONE' | 'DAILY' | 'WEEKLY' | 'MONTHLY';
  completed: boolean;
  completedAt?: string | null;
  completedByUserId?: string | null;
  lastCompletedBy?: string | null;
  assignedToUserId?: string | null;
  assignedTo?: {
    id: string;
    name: string;
    avatarUrl?: string;
  } | null;
  points: number;
  createdAt: string;
}

export interface ShoppingItemUI {
  id: string;
  workspaceId?: string;
  name: string;
  quantity?: string | null;
  price?: number | null;
  category: string;
  recurrence?: 'NONE' | 'WEEKLY' | 'MONTHLY';
  checked: boolean;
  checkedAt?: string | null;
  checkedByUserId?: string | null;
  lastPurchasedAt?: string | null;
  lastPurchasedBy?: string | null;
  nextPeriodLabel?: string | null;
  notes?: string | null;
  addedBy?: {
    id: string;
    name: string;
  } | null;
}

export interface ActivityItem {
  id: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  entity: string;
  entityId: string;
  changes: Record<string, { old: any; new: any }>;
  performedBy?: {
    id: string;
    name: string;
  } | null;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  languagePreference: string;
}

export interface WorkspaceItem {
  id: string;
  name: string;
  inviteCode: string;
  ownerId: string;
}
