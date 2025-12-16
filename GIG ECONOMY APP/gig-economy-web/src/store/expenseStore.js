import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export const useExpenseStore = create((set, get) => ({
  expenses: [],
  loading: false,
  error: null,

  // Fetch all expenses for the current user
  fetchExpenses: async (userId) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', userId)
        .order('expense_date', { ascending: false });

      if (error) throw error;

      set({ expenses: data || [], loading: false });
      return { success: true, data };
    } catch (error) {
      set({ error: error.message, loading: false });
      return { success: false, error: error.message };
    }
  },

  // Add a new expense
  addExpense: async (expense) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('expenses')
        .insert([expense])
        .select()
        .single();

      if (error) throw error;

      set((state) => ({
        expenses: [data, ...state.expenses],
        loading: false,
      }));

      return { success: true, data };
    } catch (error) {
      set({ error: error.message, loading: false });
      return { success: false, error: error.message };
    }
  },

  // Update an expense
  updateExpense: async (id, updates) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('expenses')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      set((state) => ({
        expenses: state.expenses.map((e) =>
          e.id === id ? data : e
        ),
        loading: false,
      }));

      return { success: true, data };
    } catch (error) {
      set({ error: error.message, loading: false });
      return { success: false, error: error.message };
    }
  },

  // Delete an expense
  deleteExpense: async (id) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set((state) => ({
        expenses: state.expenses.filter((e) => e.id !== id),
        loading: false,
      }));

      return { success: true };
    } catch (error) {
      set({ error: error.message, loading: false });
      return { success: false, error: error.message };
    }
  },

  // Get expenses by date range
  getExpensesByDateRange: (startDate, endDate) => {
    const { expenses } = get();
    return expenses.filter((e) => {
      const date = new Date(e.expense_date);
      return date >= new Date(startDate) && date <= new Date(endDate);
    });
  },

  // Get expenses by category
  getExpensesByCategory: (category) => {
    const { expenses } = get();
    return expenses.filter((e) => e.category === category);
  },

  // Calculate total expenses
  getTotalExpenses: () => {
    const { expenses } = get();
    return expenses.reduce((total, e) => total + parseFloat(e.amount || 0), 0);
  },

  // Calculate expenses for current month
  getCurrentMonthExpenses: () => {
    const { expenses } = get();
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    return expenses
      .filter((e) => {
        const date = new Date(e.expense_date);
        return date >= firstDay && date <= lastDay;
      })
      .reduce((total, e) => total + parseFloat(e.amount || 0), 0);
  },

  // Get expenses by category for current month
  getCurrentMonthExpensesByCategory: () => {
    const { expenses } = get();
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const categoryExpenses = {};

    expenses
      .filter((e) => {
        const date = new Date(e.expense_date);
        return date >= firstDay && date <= lastDay;
      })
      .forEach((e) => {
        if (!categoryExpenses[e.category]) {
          categoryExpenses[e.category] = 0;
        }
        categoryExpenses[e.category] += parseFloat(e.amount || 0);
      });

    return Object.entries(categoryExpenses).map(([category, amount]) => ({
      category,
      amount,
    }));
  },

  // Get monthly expense trend (last 6 months)
  getMonthlyExpenseTrend: () => {
    const { expenses } = get();
    const monthlyData = {};

    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const key = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      monthlyData[key] = 0;
    }

    // Sum up expenses by month
    expenses.forEach((e) => {
      const date = new Date(e.expense_date);
      const key = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      if (monthlyData.hasOwnProperty(key)) {
        monthlyData[key] += parseFloat(e.amount || 0);
      }
    });

    return Object.entries(monthlyData).map(([month, amount]) => ({
      month,
      amount: parseFloat(amount.toFixed(2)),
    }));
  },

  // Get deductible expenses total
  getDeductibleExpenses: () => {
    const { expenses } = get();
    return expenses
      .filter((e) => e.is_deductible)
      .reduce((total, e) => total + parseFloat(e.amount || 0), 0);
  },

  // Clear all expenses (for logout)
  clearExpenses: () => set({ expenses: [], loading: false, error: null }),
}));
