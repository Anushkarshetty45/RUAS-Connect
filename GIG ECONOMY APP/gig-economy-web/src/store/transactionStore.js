import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export const useTransactionStore = create((set, get) => ({
  transactions: [],
  loading: false,
  error: null,

  // Fetch all transactions for the current user
  fetchTransactions: async (userId) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('transaction_date', { ascending: false });

      if (error) throw error;

      set({ transactions: data || [], loading: false });
      return { success: true, data };
    } catch (error) {
      set({ error: error.message, loading: false });
      return { success: false, error: error.message };
    }
  },

  // Add a new transaction
  addTransaction: async (transaction) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert([transaction])
        .select()
        .single();

      if (error) throw error;

      set((state) => ({
        transactions: [data, ...state.transactions],
        loading: false,
      }));

      return { success: true, data };
    } catch (error) {
      set({ error: error.message, loading: false });
      return { success: false, error: error.message };
    }
  },

  // Update a transaction
  updateTransaction: async (id, updates) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('transactions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      set((state) => ({
        transactions: state.transactions.map((t) =>
          t.id === id ? data : t
        ),
        loading: false,
      }));

      return { success: true, data };
    } catch (error) {
      set({ error: error.message, loading: false });
      return { success: false, error: error.message };
    }
  },

  // Delete a transaction
  deleteTransaction: async (id) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set((state) => ({
        transactions: state.transactions.filter((t) => t.id !== id),
        loading: false,
      }));

      return { success: true };
    } catch (error) {
      set({ error: error.message, loading: false });
      return { success: false, error: error.message };
    }
  },

  // Get transactions by date range
  getTransactionsByDateRange: (startDate, endDate) => {
    const { transactions } = get();
    return transactions.filter((t) => {
      const date = new Date(t.transaction_date);
      return date >= new Date(startDate) && date <= new Date(endDate);
    });
  },

  // Get transactions by platform
  getTransactionsByPlatform: (platform) => {
    const { transactions } = get();
    return transactions.filter((t) => t.platform === platform);
  },

  // Calculate total income
  getTotalIncome: () => {
    const { transactions } = get();
    return transactions.reduce((total, t) => total + parseFloat(t.amount || 0), 0);
  },

  // Calculate income for current month
  getCurrentMonthIncome: () => {
    const { transactions } = get();
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    return transactions
      .filter((t) => {
        const date = new Date(t.transaction_date);
        return date >= firstDay && date <= lastDay;
      })
      .reduce((total, t) => total + parseFloat(t.amount || 0), 0);
  },

  // Get income by platform for current month
  getCurrentMonthIncomeByPlatform: () => {
    const { transactions } = get();
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const platformIncome = {};

    transactions
      .filter((t) => {
        const date = new Date(t.transaction_date);
        return date >= firstDay && date <= lastDay;
      })
      .forEach((t) => {
        if (!platformIncome[t.platform]) {
          platformIncome[t.platform] = 0;
        }
        platformIncome[t.platform] += parseFloat(t.amount || 0);
      });

    return Object.entries(platformIncome).map(([platform, amount]) => ({
      platform,
      amount,
    }));
  },

  // Get monthly income trend (last 6 months)
  getMonthlyIncomeTrend: () => {
    const { transactions } = get();
    const monthlyData = {};

    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const key = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      monthlyData[key] = 0;
    }

    // Sum up transactions by month
    transactions.forEach((t) => {
      const date = new Date(t.transaction_date);
      const key = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      if (monthlyData.hasOwnProperty(key)) {
        monthlyData[key] += parseFloat(t.amount || 0);
      }
    });

    return Object.entries(monthlyData).map(([month, amount]) => ({
      month,
      amount: parseFloat(amount.toFixed(2)),
    }));
  },

  // Clear all transactions (for logout)
  clearTransactions: () => set({ transactions: [], loading: false, error: null }),
}));
