import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useSavingsStore } from '../store/savingsStore';
import { useTransactionStore } from '../store/transactionStore';
import { useExpenseStore } from '../store/expenseStore';
import Navbar from '../components/Navbar';
import Modal from '../components/Modal';
import GoalCard from '../components/GoalCard';

export default function SavingsGoals() {
  const user = useAuthStore((state) => state.user);
  const {
    goals,
    loading,
    fetchGoals,
    addGoal,
    updateGoal,
    deleteGoal,
    addToGoal,
    withdrawFromGoal,
    getTotalSavings,
    getTotalTarget,
    getActiveGoals,
  } = useSavingsStore();
  const { getTotalIncome, fetchTransactions } = useTransactionStore();
  const { getTotalExpenses, fetchExpenses } = useExpenseStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFundsModalOpen, setIsFundsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [fundsAction, setFundsAction] = useState('add');
  const [formData, setFormData] = useState({
    name: '',
    target_amount: '',
    current_amount: '',
    deadline: '',
    color: '#8B5CF6',
  });
  const [isCustomGoal, setIsCustomGoal] = useState(false);
  const [selectedPresetGoal, setSelectedPresetGoal] = useState('');
  const [customGoalName, setCustomGoalName] = useState('');
  const [fundsAmount, setFundsAmount] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const presetGoals = [
    'Emergency Fund',
    'Vacation',
    'Home Down Payment',
    'New Car',
    'Wedding',
    'Education/College Fund',
    'Retirement',
    'Investment Portfolio',
    'Home Renovation',
    'Business Startup',
    'Debt Payoff',
    'Medical Expenses',
    'Electronics/Gadgets',
    'Holiday Shopping',
    'Custom',
  ];

  const goalColors = [
    '#8B5CF6',
    '#EC4899',
    '#F59E0B',
    '#10B981',
    '#3B82F6',
    '#EF4444',
    '#14B8A6',
    '#6366F1',
  ];

  useEffect(() => {
    if (user?.id) {
      fetchGoals(user.id);
      fetchTransactions(user.id);
      fetchExpenses(user.id);
    }
  }, [user, fetchGoals, fetchTransactions, fetchExpenses]);

  const handleOpenModal = (goal = null) => {
    if (goal) {
      setEditingGoal(goal);
      setFormData({
        name: goal.name,
        target_amount: goal.target_amount,
        current_amount: goal.current_amount,
        deadline: goal.deadline || '',
        color: goal.color || '#8B5CF6',
      });
      // Check if it's a preset goal or custom
      const isPreset = presetGoals.slice(0, -1).includes(goal.name);
      setIsCustomGoal(!isPreset);
      setSelectedPresetGoal(isPreset ? goal.name : 'Custom');
      setCustomGoalName(isPreset ? '' : goal.name);
    } else {
      setEditingGoal(null);
      setFormData({
        name: '',
        target_amount: '',
        current_amount: '0',
        deadline: '',
        color: '#8B5CF6',
      });
      setIsCustomGoal(false);
      setSelectedPresetGoal('');
      setCustomGoalName('');
    }
    setIsModalOpen(true);
    setError('');
    setSuccess('');
  };

  const handleGoalTypeChange = (e) => {
    const value = e.target.value;
    setSelectedPresetGoal(value);

    if (value === 'Custom') {
      setIsCustomGoal(true);
      setFormData({ ...formData, name: customGoalName });
    } else {
      setIsCustomGoal(false);
      setFormData({ ...formData, name: value });
    }
  };

  const handleCustomGoalChange = (e) => {
    const value = e.target.value;
    setCustomGoalName(value);
    setFormData({ ...formData, name: value });
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingGoal(null);
    setError('');
    setSuccess('');
  };

  const handleOpenFundsModal = (goal, action = 'add') => {
    setSelectedGoal(goal);
    setFundsAction(action);
    setFundsAmount('');
    setIsFundsModalOpen(true);
    setError('');
    setSuccess('');
  };

  const handleCloseFundsModal = () => {
    setIsFundsModalOpen(false);
    setSelectedGoal(null);
    setFundsAmount('');
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.target_amount || parseFloat(formData.target_amount) <= 0) {
      setError('Please enter a valid target amount');
      return;
    }

    const goalData = {
      ...formData,
      user_id: user.id,
      target_amount: parseFloat(formData.target_amount),
      current_amount: parseFloat(formData.current_amount || 0),
      deadline: formData.deadline || null,
    };

    const result = editingGoal
      ? await updateGoal(editingGoal.id, goalData)
      : await addGoal(goalData);

    if (result.success) {
      setSuccess(editingGoal ? 'Goal updated successfully!' : 'Goal created successfully!');
      setTimeout(() => {
        handleCloseModal();
      }, 1000);
    } else {
      setError(result.error || 'An error occurred');
    }
  };

  const handleFundsSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const amount = parseFloat(fundsAmount);
    if (!amount || amount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    // Validate available balance when adding funds
    if (fundsAction === 'add') {
      if (amount > availableBalance) {
        setError(`Insufficient balance. You only have ${availableBalance.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} available.`);
        return;
      }
    }

    // Validate goal balance when withdrawing
    if (fundsAction === 'withdraw') {
      const currentGoalAmount = parseFloat(selectedGoal?.current_amount || 0);
      if (amount > currentGoalAmount) {
        setError(`Cannot withdraw more than ${currentGoalAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} from this goal.`);
        return;
      }
    }

    const result =
      fundsAction === 'add'
        ? await addToGoal(selectedGoal.id, amount)
        : await withdrawFromGoal(selectedGoal.id, amount);

    if (result.success) {
      setSuccess(
        fundsAction === 'add'
          ? 'Funds added successfully!'
          : 'Funds withdrawn successfully!'
      );
      setTimeout(() => {
        handleCloseFundsModal();
      }, 1000);
    } else {
      setError(result.error || 'An error occurred');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this savings goal?')) {
      const result = await deleteGoal(id);
      if (!result.success) {
        alert(result.error || 'Failed to delete goal');
      }
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const totalSavings = getTotalSavings();
  const totalTarget = getTotalTarget();
  const activeGoals = getActiveGoals();
  const overallProgress =
    totalTarget > 0 ? ((totalSavings / totalTarget) * 100).toFixed(1) : 0;

  // Calculate available balance
  const openingBalance = parseFloat(localStorage.getItem(`openingBalance_${user?.id}`) || 0);
  const totalIncome = getTotalIncome();
  const totalExpenses = getTotalExpenses();
  const availableBalance = openingBalance + totalIncome - totalExpenses - totalSavings;

  return (
    <div className="page-layout">
      <Navbar />
      <div className="page-content">
        <div className="page-header">
          <div>
            <h1>Savings Goals</h1>
            <p>Set and track your financial targets</p>
          </div>
          <button onClick={() => handleOpenModal()} className="btn btn-primary">
            + Create Goal
          </button>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-content">
              <h3>Total Saved</h3>
              <p className="stat-value">
                ${totalSavings.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🎯</div>
            <div className="stat-content">
              <h3>Active Goals</h3>
              <p className="stat-value">{activeGoals.length}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <h3>Overall Progress</h3>
              <p className="stat-value">{overallProgress}%</p>
            </div>
          </div>
        </div>

        <div className="content-section">
          {loading ? (
            <div className="loading">Loading savings goals...</div>
          ) : goals.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🎯</div>
              <h3>No savings goals yet</h3>
              <p>Create your first savings goal to start building towards your financial targets</p>
              <button onClick={() => handleOpenModal()} className="btn btn-primary">
                Create First Goal
              </button>
            </div>
          ) : (
            <div className="goals-grid">
              {goals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onEdit={handleOpenModal}
                  onDelete={handleDelete}
                  onAddFunds={(goal) => handleOpenFundsModal(goal, 'add')}
                  onWithdraw={(goal) => handleOpenFundsModal(goal, 'withdraw')}
                />
              ))}
            </div>
          )}
        </div>

        {/* Goal Creation/Edit Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={editingGoal ? 'Edit Savings Goal' : 'Create New Savings Goal'}
          size="large"
        >
          <form onSubmit={handleSubmit} className="form">
            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="goalType">Savings Goal Type *</label>
                <select
                  id="goalType"
                  value={selectedPresetGoal}
                  onChange={handleGoalTypeChange}
                  required={!isCustomGoal}
                  className="form-control"
                >
                  <option value="">Select a goal...</option>
                  {presetGoals.map((goal) => (
                    <option key={goal} value={goal}>
                      {goal}
                    </option>
                  ))}
                </select>
              </div>

              {isCustomGoal && (
                <div className="form-group">
                  <label htmlFor="customGoal">Custom Goal Name *</label>
                  <input
                    type="text"
                    id="customGoal"
                    value={customGoalName}
                    onChange={handleCustomGoalChange}
                    required
                    className="form-control"
                    placeholder="Enter your custom goal..."
                  />
                </div>
              )}

              <div className="form-group">
                <label htmlFor="target_amount">Target Amount *</label>
                <input
                  type="number"
                  id="target_amount"
                  name="target_amount"
                  value={formData.target_amount}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  required
                  className="form-control"
                  placeholder="5000.00"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="current_amount">Current Amount</label>
                <input
                  type="number"
                  id="current_amount"
                  name="current_amount"
                  value={formData.current_amount}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className="form-control"
                  placeholder="0.00"
                />
              </div>

              <div className="form-group">
                <label htmlFor="deadline">Deadline</label>
                <input
                  type="date"
                  id="deadline"
                  name="deadline"
                  value={formData.deadline}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Color</label>
              <div className="color-selector">
                {goalColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`color-option ${formData.color === color ? 'selected' : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => setFormData({ ...formData, color })}
                  />
                ))}
              </div>
            </div>

            <div className="form-actions">
              <button type="button" onClick={handleCloseModal} className="btn btn-secondary">
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {editingGoal ? 'Update' : 'Create'} Goal
              </button>
            </div>
          </form>
        </Modal>

        {/* Add/Withdraw Funds Modal */}
        <Modal
          isOpen={isFundsModalOpen}
          onClose={handleCloseFundsModal}
          title={
            fundsAction === 'add'
              ? `Add Funds to ${selectedGoal?.name}`
              : `Withdraw from ${selectedGoal?.name}`
          }
        >
          <form onSubmit={handleFundsSubmit} className="form">
            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            {fundsAction === 'add' ? (
              <div className="goal-current-amount">
                <p>Available Balance:</p>
                <h3>
                  ${availableBalance.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                  })}
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginTop: '0.5rem' }}>
                  Spendable money after all expenses and existing savings
                </p>
              </div>
            ) : (
              <div className="goal-current-amount">
                <p>Goal Balance:</p>
                <h3>
                  ${parseFloat(selectedGoal?.current_amount || 0).toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                  })}
                </h3>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="fundsAmount">Amount *</label>
              <input
                type="number"
                id="fundsAmount"
                value={fundsAmount}
                onChange={(e) => setFundsAmount(e.target.value)}
                step="0.01"
                min="0"
                required
                className="form-control"
                placeholder="0.00"
                autoFocus
              />
            </div>

            <div className="form-actions">
              <button
                type="button"
                onClick={handleCloseFundsModal}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {fundsAction === 'add' ? 'Add Funds' : 'Withdraw'}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
}
