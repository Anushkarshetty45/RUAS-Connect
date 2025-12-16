import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export const useSavingsStore = create((set, get) => ({
  goals: [],
  loading: false,
  error: null,

  // Fetch all savings goals for the current user
  fetchGoals: async (userId) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('savings_goals')
        .select('*')
        .eq('user_id', userId)
        .order('priority', { ascending: false })
        .order('deadline', { ascending: true });

      if (error) throw error;

      set({ goals: data || [], loading: false });
      return { success: true, data };
    } catch (error) {
      set({ error: error.message, loading: false });
      return { success: false, error: error.message };
    }
  },

  // Add a new savings goal
  addGoal: async (goal) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('savings_goals')
        .insert([goal])
        .select()
        .single();

      if (error) throw error;

      set((state) => ({
        goals: [...state.goals, data],
        loading: false,
      }));

      return { success: true, data };
    } catch (error) {
      set({ error: error.message, loading: false });
      return { success: false, error: error.message };
    }
  },

  // Update a savings goal
  updateGoal: async (id, updates) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('savings_goals')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      set((state) => ({
        goals: state.goals.map((g) =>
          g.id === id ? data : g
        ),
        loading: false,
      }));

      return { success: true, data };
    } catch (error) {
      set({ error: error.message, loading: false });
      return { success: false, error: error.message };
    }
  },

  // Delete a savings goal
  deleteGoal: async (id) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('savings_goals')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set((state) => ({
        goals: state.goals.filter((g) => g.id !== id),
        loading: false,
      }));

      return { success: true };
    } catch (error) {
      set({ error: error.message, loading: false });
      return { success: false, error: error.message };
    }
  },

  // Add amount to a savings goal
  addToGoal: async (id, amount) => {
    const { goals } = get();
    const goal = goals.find((g) => g.id === id);
    if (!goal) return { success: false, error: 'Goal not found' };

    const newAmount = parseFloat(goal.current_amount) + parseFloat(amount);
    const targetAmount = parseFloat(goal.target_amount);

    const updates = {
      current_amount: newAmount,
      status: newAmount >= targetAmount ? 'completed' : 'active',
    };

    return get().updateGoal(id, updates);
  },

  // Withdraw amount from a savings goal
  withdrawFromGoal: async (id, amount) => {
    const { goals } = get();
    const goal = goals.find((g) => g.id === id);
    if (!goal) return { success: false, error: 'Goal not found' };

    const newAmount = Math.max(0, parseFloat(goal.current_amount) - parseFloat(amount));

    const updates = {
      current_amount: newAmount,
      status: newAmount >= parseFloat(goal.target_amount) ? 'completed' : 'active',
    };

    return get().updateGoal(id, updates);
  },

  // Calculate progress percentage for a goal
  getGoalProgress: (goalId) => {
    const { goals } = get();
    const goal = goals.find((g) => g.id === goalId);
    if (!goal) return 0;

    const current = parseFloat(goal.current_amount || 0);
    const target = parseFloat(goal.target_amount || 1);
    return Math.min(100, (current / target) * 100);
  },

  // Get active goals
  getActiveGoals: () => {
    const { goals } = get();
    return goals.filter((g) => g.status === 'active');
  },

  // Get completed goals
  getCompletedGoals: () => {
    const { goals } = get();
    return goals.filter((g) => g.status === 'completed');
  },

  // Calculate total savings across all goals
  getTotalSavings: () => {
    const { goals } = get();
    return goals.reduce((total, g) => total + parseFloat(g.current_amount || 0), 0);
  },

  // Calculate total target across all active goals
  getTotalTarget: () => {
    const { goals } = get();
    return goals
      .filter((g) => g.status === 'active')
      .reduce((total, g) => total + parseFloat(g.target_amount || 0), 0);
  },

  // Get goals expiring soon (within 30 days)
  getGoalsExpiringSoon: () => {
    const { goals } = get();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    return goals.filter((g) => {
      if (!g.deadline || g.status === 'completed') return false;
      const deadline = new Date(g.deadline);
      return deadline <= thirtyDaysFromNow && deadline >= new Date();
    });
  },

  // Get days remaining for a goal
  getDaysRemaining: (goalId) => {
    const { goals } = get();
    const goal = goals.find((g) => g.id === goalId);
    if (!goal || !goal.deadline) return null;

    const deadline = new Date(goal.deadline);
    const today = new Date();
    const diffTime = deadline - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  },

  // Calculate amount needed per month to reach goal
  getMonthlyNeeded: (goalId) => {
    const { goals } = get();
    const goal = goals.find((g) => g.id === goalId);
    if (!goal || !goal.deadline) return null;

    const remaining = parseFloat(goal.target_amount) - parseFloat(goal.current_amount);
    const daysRemaining = get().getDaysRemaining(goalId);

    if (!daysRemaining || daysRemaining <= 0) return remaining;

    const monthsRemaining = Math.max(1, daysRemaining / 30);
    return remaining / monthsRemaining;
  },

  // Clear all goals (for logout)
  clearGoals: () => set({ goals: [], loading: false, error: null }),
}));
