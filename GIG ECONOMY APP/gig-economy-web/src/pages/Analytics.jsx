import { useEffect, useState, useMemo } from 'react';
import { useAuthStore } from '../store/authStore';
import { useTransactionStore } from '../store/transactionStore';
import { useExpenseStore } from '../store/expenseStore';
import Navbar from '../components/Navbar';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export default function Analytics() {
  const user = useAuthStore((state) => state.user);
  const {
    transactions,
    fetchTransactions,
    getMonthlyIncomeTrend,
    getCurrentMonthIncomeByPlatform,
  } = useTransactionStore();
  const {
    expenses,
    fetchExpenses,
    getMonthlyExpenseTrend,
    getCurrentMonthExpensesByCategory,
  } = useExpenseStore();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (user?.id) {
        setLoading(true);
        await Promise.all([fetchTransactions(user.id), fetchExpenses(user.id)]);
        setLoading(false);
      }
    };
    fetchData();
  }, [user, fetchTransactions, fetchExpenses]);

  // Get data for charts - recalculate when data changes
  const monthlyIncome = useMemo(() => getMonthlyIncomeTrend(), [transactions, getMonthlyIncomeTrend]);
  const monthlyExpenses = useMemo(() => getMonthlyExpenseTrend(), [expenses, getMonthlyExpenseTrend]);
  const incomeByPlatform = useMemo(() => getCurrentMonthIncomeByPlatform(), [transactions, getCurrentMonthIncomeByPlatform]);
  const expensesByCategory = useMemo(() => getCurrentMonthExpensesByCategory(), [expenses, getCurrentMonthExpensesByCategory]);

  // Combine income and expense trends
  const incomeVsExpenses = monthlyIncome.map((income, index) => ({
    month: income.month,
    income: income.amount,
    expenses: monthlyExpenses[index]?.amount || 0,
    net: income.amount - (monthlyExpenses[index]?.amount || 0),
  }));

  // Calculate totals
  const totalIncome = transactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);
  const netIncome = totalIncome - totalExpenses;

  // Current month calculations
  const currentMonthIncome = monthlyIncome[monthlyIncome.length - 1]?.amount || 0;
  const currentMonthExpenses = monthlyExpenses[monthlyExpenses.length - 1]?.amount || 0;
  const currentMonthNet = currentMonthIncome - currentMonthExpenses;

  // Colors for charts
  const COLORS = ['#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#3B82F6', '#EF4444', '#14B8A6', '#6366F1'];

  if (loading) {
    return (
      <div className="page-layout">
        <Navbar />
        <div className="page-content">
          <div className="loading">Loading analytics data...</div>
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
            <h1>Analytics Dashboard</h1>
            <p>Visualize your financial data and trends</p>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="stats-grid-four">
          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-content">
              <h3>Total Income</h3>
              <p className="stat-value positive">
                ${totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">💳</div>
            <div className="stat-content">
              <h3>Total Expenses</h3>
              <p className="stat-value negative">
                ${totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <h3>Net Income</h3>
              <p className={`stat-value ${netIncome >= 0 ? 'positive' : 'negative'}`}>
                ${netIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📈</div>
            <div className="stat-content">
              <h3>This Month Net</h3>
              <p className={`stat-value ${currentMonthNet >= 0 ? 'positive' : 'negative'}`}>
                ${currentMonthNet.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="charts-container">
          {/* Income vs Expenses Trend */}
          <div className="chart-card full-width">
            <h3 className="chart-title">Income vs Expenses (Last 6 Months)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={incomeVsExpenses}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                  }}
                  formatter={(value) =>
                    `$${parseFloat(value).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                  }
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="income"
                  stroke="#10B981"
                  strokeWidth={2}
                  name="Income"
                />
                <Line
                  type="monotone"
                  dataKey="expenses"
                  stroke="#EF4444"
                  strokeWidth={2}
                  name="Expenses"
                />
                <Line
                  type="monotone"
                  dataKey="net"
                  stroke="#8B5CF6"
                  strokeWidth={2}
                  name="Net"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Income by Platform */}
          <div className="chart-card">
            <h3 className="chart-title">Income by Platform (This Month)</h3>
            {incomeByPlatform.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={incomeByPlatform}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ platform, amount }) =>
                      `${platform}: $${amount.toFixed(0)}`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="amount"
                  >
                    {incomeByPlatform.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                    }}
                    formatter={(value) =>
                      `$${parseFloat(value).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                    }
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-chart">No income data for this month</div>
            )}
          </div>

          {/* Expenses by Category */}
          <div className="chart-card">
            <h3 className="chart-title">Expenses by Category (This Month)</h3>
            {expensesByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={expensesByCategory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="category" stroke="#9CA3AF" angle={-45} textAnchor="end" height={100} />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                    }}
                    formatter={(value) =>
                      `$${parseFloat(value).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                    }
                  />
                  <Bar dataKey="amount" fill="#EF4444" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-chart">No expense data for this month</div>
            )}
          </div>

          {/* Monthly Income Trend */}
          <div className="chart-card">
            <h3 className="chart-title">Income Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyIncome}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                  }}
                  formatter={(value) =>
                    `$${parseFloat(value).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                  }
                />
                <Bar dataKey="amount" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Monthly Expense Trend */}
          <div className="chart-card">
            <h3 className="chart-title">Expense Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyExpenses}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                  }}
                  formatter={(value) =>
                    `$${parseFloat(value).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                  }
                />
                <Bar dataKey="amount" fill="#EF4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Insights Section */}
        {transactions.length > 0 && (
          <div className="insights-section">
            <h2>Key Insights</h2>
            <div className="insights-grid">
              <div className="insight-card">
                <h4>Average Daily Income</h4>
                <p className="insight-value">
                  ${(totalIncome / Math.max(transactions.length, 1)).toFixed(2)}
                </p>
              </div>
              <div className="insight-card">
                <h4>Average Daily Expense</h4>
                <p className="insight-value">
                  ${(totalExpenses / Math.max(expenses.length, 1)).toFixed(2)}
                </p>
              </div>
              <div className="insight-card">
                <h4>Savings Rate</h4>
                <p className="insight-value">
                  {totalIncome > 0 ? ((netIncome / totalIncome) * 100).toFixed(1) : 0}%
                </p>
              </div>
              <div className="insight-card">
                <h4>Top Platform</h4>
                <p className="insight-value">
                  {incomeByPlatform.length > 0
                    ? incomeByPlatform.reduce((max, p) =>
                        p.amount > max.amount ? p : max
                      ).platform
                    : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
