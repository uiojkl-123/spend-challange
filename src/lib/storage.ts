import { Budget, Expense, Category } from '@/types';

const STORAGE_KEYS = {
  BUDGET: 'budget',
  EXPENSES: 'expenses',
  CATEGORIES: 'categories',
};

export const defaultCategories: Category[] = [
  { id: '1', name: '식비', color: '#ef4444', icon: '🍽️' },
  { id: '2', name: '교통비', color: '#3b82f6', icon: '🚌' },
  { id: '3', name: '쇼핑', color: '#8b5cf6', icon: '🛍️' },
  { id: '4', name: '문화생활', color: '#f59e0b', icon: '🎬' },
  { id: '5', name: '의료비', color: '#10b981', icon: '🏥' },
  { id: '6', name: '기타', color: '#6b7280', icon: '📝' },
];

// Budget 관련 함수들
export const getBudget = (): Budget | null => {
  if (typeof window === 'undefined') return null;

  const stored = localStorage.getItem(STORAGE_KEYS.BUDGET);
  return stored ? JSON.parse(stored) : null;
};

export const saveBudget = (budget: Budget): void => {
  if (typeof window === 'undefined') return;

  localStorage.setItem(STORAGE_KEYS.BUDGET, JSON.stringify(budget));
};

export const deleteBudget = (): void => {
  if (typeof window === 'undefined') return;

  localStorage.removeItem(STORAGE_KEYS.BUDGET);
};

// Expense 관련 함수들
export const getExpenses = (): Expense[] => {
  if (typeof window === 'undefined') return [];

  const stored = localStorage.getItem(STORAGE_KEYS.EXPENSES);
  return stored ? JSON.parse(stored) : [];
};

export const saveExpense = (expense: Expense): void => {
  if (typeof window === 'undefined') return;

  const expenses = getExpenses();
  const existingIndex = expenses.findIndex((e) => e.id === expense.id);

  if (existingIndex >= 0) {
    expenses[existingIndex] = expense;
  } else {
    expenses.push(expense);
  }

  localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
};

export const deleteExpense = (id: string): void => {
  if (typeof window === 'undefined') return;

  const expenses = getExpenses();
  const filtered = expenses.filter((e) => e.id !== id);
  localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(filtered));
};

// Category 관련 함수들
export const getCategories = (): Category[] => {
  if (typeof window === 'undefined') return defaultCategories;

  const stored = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
  return stored ? JSON.parse(stored) : defaultCategories;
};

export const saveCategory = (category: Category): void => {
  if (typeof window === 'undefined') return;

  const categories = getCategories();
  const existingIndex = categories.findIndex((c) => c.id === category.id);

  if (existingIndex >= 0) {
    categories[existingIndex] = category;
  } else {
    categories.push(category);
  }

  localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
};

export const deleteCategory = (id: string): void => {
  if (typeof window === 'undefined') return;

  const categories = getCategories();
  const filtered = categories.filter((c) => c.id !== id);
  localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(filtered));
};

// 유틸리티 함수들
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const clearAllData = (): void => {
  if (typeof window === 'undefined') return;

  localStorage.removeItem(STORAGE_KEYS.BUDGET);
  localStorage.removeItem(STORAGE_KEYS.EXPENSES);
  localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
};
