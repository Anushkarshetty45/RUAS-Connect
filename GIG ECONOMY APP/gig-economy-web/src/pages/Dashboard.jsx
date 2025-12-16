import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useTransactionStore } from '../store/transactionStore';
import { useExpenseStore } from '../store/expenseStore';
import { useSavingsStore } from '../store/savingsStore';
import Navbar from '../components/Navbar';
import Modal from '../components/Modal';
import {
  MdAttachMoney,
  MdCreditCard,
  MdBarChart,
  MdFlag,
  MdAdd,
  MdAccountBalanceWallet,
  MdEdit
} from 'react-icons/md';

export default function Dashboard() {
  const user = useAuthStore((state) => state.user);
  const {
    transactions,
    fetchTransactions,
    getCurrentMonthIncome,
    getTotalIncome,
  } = useTransactionStore();
  const {
    expenses,
    fetchExpenses,
    getCurrentMonthExpenses,
    getTotalExpenses,
  } = useExpenseStore();
  const {
    goals,
    fetchGoals,
    getTotalSavings,
    getActiveGoals,
  } = useSavingsStore();

  const [loading, setLoading] = useState(true);
  const [openingBalance, setOpeningBalance] = useState(() => {
    const saved = localStorage.getItem(`openingBalance_${user?.id}`);
    return saved ? parseFloat(saved) : 0;
  });
  const [isBalanceModalOpen, setIsBalanceModalOpen] = useState(false);
  const [balanceInput, setBalanceInput] = useState('');

  const handleUpdateBalance = () => {
    const newBalance = parseFloat(balanceInput);
    if (!isNaN(newBalance) && newBalance >= 0) {
      setOpeningBalance(newBalance);
      localStorage.setItem(`openingBalance_${user?.id}`, newBalance.toString());
      setIsBalanceModalOpen(false);
      setBalanceInput('');
    }
  };

  const handleOpenBalanceModal = () => {
    setBalanceInput(openingBalance.toString());
    setIsBalanceModalOpen(true);
  };

  useEffect(() => {
    const fetchData = async () => {
      if (user?.id) {
        setLoading(true);
        await Promise.all([
          fetchTransactions(user.id),
          fetchExpenses(user.id),
          fetchGoals(user.id),
        ]);
        setLoading(false);
      }
    };
    fetchData();
  }, [user, fetchTransactions, fetchExpenses, fetchGoals]);

  const monthlyIncome = getCurrentMonthIncome();
  const monthlyExpenses = getCurrentMonthExpenses();
  const netIncome = monthlyIncome - monthlyExpenses;
  const totalSavings = getTotalSavings();
  const activeGoals = getActiveGoals();

  // Calculate current balance
  const totalIncome = getTotalIncome();
  const totalExpenses = getTotalExpenses();
  const currentBalance = openingBalance + totalIncome - totalExpenses - totalSavings;

  // Get recent transactions (last 5)
  const recentTransactions = [...transactions].slice(0, 5);
  const recentExpenses = [...expenses].slice(0, 5);

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="page-layout">
        <Navbar />
        <div className="page-content">
          <div className="loading">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-layout">
      <Navbar />
      <div className="page-content">
        <div className="page-header">
          <div>
            <h1>Dashboard</h1>
            <p>Welcome back! Here is your financial overview</p>
          </div>
        </div>

        {/* Main Stats */}
        <div className="stats-grid-five">
          <div className="stat-card highlight current-balance-card">
            <div className="stat-icon"><MdAccountBalanceWallet size={32} /></div>
            <div className="stat-content">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3>Available Balance</h3>
                <button
                  onClick={handleOpenBalanceModal}
                  className="btn-icon btn-edit"
                  title="Set Opening Balance"
                  style={{ marginLeft: '8px' }}
                >
                  <MdEdit size={18} />
                </button>
              </div>
              <p className="stat-value">{formatAmount(currentBalance)}</p>
              <span className="stat-label">Current spendable money</span>
            </div>
          </div>
          <div className="stat-card highlight">
            <div className="stat-icon"><MdAttachMoney size={32} /></div>
            <div className="stat-content">
              <h3>Income This Month</h3>
              <p className="stat-value positive">{formatAmount(monthlyIncome)}</p>
              <span className="stat-label">{transactions.length} transactions</span>
            </div>
          </div>
          <div className="stat-card highlight">
            <div className="stat-icon"><MdCreditCard size={32} /></div>
            <div className="stat-content">
              <h3>Expenses This Month</h3>
              <p className="stat-value negative">{formatAmount(monthlyExpenses)}</p>
              <span className="stat-label">{expenses.length} expenses</span>
            </div>
          </div>
          <div className="stat-card highlight">
            <div className="stat-icon"><MdBarChart size={32} /></div>
            <div className="stat-content">
              <h3>Net Income</h3>
              <p className={`stat-value ${netIncome >= 0 ? 'positive' : 'negative'}`}>
                {formatAmount(netIncome)}
              </p>
              <span className="stat-label">
                {netIncome >= 0 ? 'Profit' : 'Loss'} this month
              </span>
            </div>
          </div>
          <div className="stat-card highlight">
            <div className="stat-icon"><MdFlag size={32} /></div>
            <div className="stat-content">
              <h3>Total Savings</h3>
              <p className="stat-value">{formatAmount(totalSavings)}</p>
              <span className="stat-label">{activeGoals.length} active goals</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="action-buttons">
            <Link to="/income" className="action-button">
              <div className="action-icon"><MdAttachMoney size={28} /></div>
              <div>
                <h4>Add Income</h4>
                <p>Record new earnings</p>
              </div>
            </Link>
            <Link to="/expenses" className="action-button">
              <div className="action-icon"><MdCreditCard size={28} /></div>
              <div>
                <h4>Add Expense</h4>
                <p>Track spending</p>
              </div>
            </Link>
            <Link to="/savings-goals" className="action-button">
              <div className="action-icon"><MdFlag size={28} /></div>
              <div>
                <h4>Manage Goals</h4>
                <p>Update savings targets</p>
              </div>
            </Link>
            <Link to="/analytics" className="action-button">
              <div className="action-icon"><MdBarChart size={28} /></div>
              <div>
                <h4>View Analytics</h4>
                <p>See detailed charts</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="dashboard-grid">
          {/* Recent Income */}
          <div className="dashboard-section">
            <div className="section-header">
              <h2>Recent Income</h2>
              <Link to="/income" className="view-all-link">
                View All
              </Link>
            </div>
            {recentTransactions.length > 0 ? (
              <div className="recent-list">
                {recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="recent-item">
                    <div className="recent-icon positive"><MdAttachMoney size={24} /></div>
                    <div className="recent-details">
                      <h4>{transaction.platform}</h4>
                      <p>{formatDate(transaction.transaction_date)}</p>
                    </div>
                    <div className="recent-amount positive">
                      {formatAmount(transaction.amount)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state-small">
                <p>No income entries yet</p>
                <Link to="/income" className="btn btn-sm btn-primary">
                  Add Income
                </Link>
              </div>
            )}
          </div>

          {/* Recent Expenses */}
          <div className="dashboard-section">
            <div className="section-header">
              <h2>Recent Expenses</h2>
              <Link to="/expenses" className="view-all-link">
                View All
              </Link>
            </div>
            {recentExpenses.length > 0 ? (
              <div className="recent-list">
                {recentExpenses.map((expense) => {
                  // Show merchant name if from receipt scan, otherwise show category
                  const displayName = expense.description?.includes(' - Receipt scan')
                    ? expense.description.replace(' - Receipt scan', '')
                    : expense.category;

                  return (
                    <div key={expense.id} className="recent-item">
                      <div className="recent-icon negative"><MdCreditCard size={24} /></div>
                      <div className="recent-details">
                        <h4>{displayName}</h4>
                        <p>{formatDate(expense.expense_date)}</p>
                      </div>
                      <div className="recent-amount negative">
                        {formatAmount(expense.amount)}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="empty-state-small">
                <p>No expenses yet</p>
                <Link to="/expenses" className="btn btn-sm btn-primary">
                  Add Expense
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Savings Goals Progress */}
        {activeGoals.length > 0 && (
          <div className="dashboard-section full-width">
            <div className="section-header">
              <h2>Active Savings Goals</h2>
              <Link to="/savings-goals" className="view-all-link">
                View All
              </Link>
            </div>
            <div className="goals-progress">
              {activeGoals.slice(0, 3).map((goal) => {
                const progress = Math.min(
                  100,
                  (parseFloat(goal.current_amount) / parseFloat(goal.target_amount)) * 100
                );
                return (
                  <div key={goal.id} className="goal-progress-item">
                    <div className="goal-progress-header">
                      <span className="goal-progress-icon" style={{ backgroundColor: goal.color }}>
                        {goal.icon}
                      </span>
                      <div className="goal-progress-info">
                        <h4>{goal.name}</h4>
                        <p>
                          {formatAmount(goal.current_amount)} of{' '}
                          {formatAmount(goal.target_amount)}
                        </p>
                      </div>
                      <span className="goal-progress-percentage">{progress.toFixed(0)}%</span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${progress}%`, backgroundColor: goal.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Financial Health Score */}
        <div className="health-score-section">
          <h2>Financial Health</h2>
          <div className="health-cards">
            <div className="health-card">
              <h4>Savings Rate</h4>
              <div className="health-score">
                {monthlyIncome > 0
                  ? ((netIncome / monthlyIncome) * 100).toFixed(1)
                  : 0}%
              </div>
              <p className="health-label">
                {monthlyIncome > 0 && (netIncome / monthlyIncome) * 100 >= 20
                  ? 'Excellent!'
                  : 'Keep improving'}
              </p>
            </div>
            <div className="health-card">
              <h4>Active Goals</h4>
              <div className="health-score">{activeGoals.length}</div>
              <p className="health-label">
                {activeGoals.length > 0 ? 'Stay focused!' : 'Set some goals'}
              </p>
            </div>
            <div className="health-card">
              <h4>Transaction Count</h4>
              <div className="health-score">{transactions.length + expenses.length}</div>
              <p className="health-label">Total tracked</p>
            </div>
          </div>
        </div>

        {/* Opening Balance Modal */}
        <Modal
          isOpen={isBalanceModalOpen}
          onClose={() => setIsBalanceModalOpen(false)}
          title="Set Opening Balance"
        >
          <div className="form">
            <p style={{ marginBottom: '1rem', color: 'var(--color-text-secondary)' }}>
              Enter the initial amount of money you started with. Your current balance will be automatically calculated based on your income, expenses, and savings goals.
            </p>
            <div className="form-group">
              <label htmlFor="balance">Opening Balance *</label>
              <input
                type="number"
                id="balance"
                value={balanceInput}
                onChange={(e) => setBalanceInput(e.target.value)}
                step="0.01"
                min="0"
                className="form-control"
                placeholder="0.00"
                autoFocus
              />
            </div>
            <div className="form-actions">
              <button
                type="button"
                onClick={() => setIsBalanceModalOpen(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpdateBalance}
                className="btn btn-primary"
              >
                Set Balance
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}
