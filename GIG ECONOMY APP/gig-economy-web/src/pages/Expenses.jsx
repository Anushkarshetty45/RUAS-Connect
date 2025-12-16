import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useExpenseStore } from '../store/expenseStore';
import Navbar from '../components/Navbar';
import Modal from '../components/Modal';
import TransactionCard from '../components/TransactionCard';

export default function Expenses() {
  const user = useAuthStore((state) => state.user);
  const {
    expenses,
    loading,
    fetchExpenses,
    addExpense,
    updateExpense,
    deleteExpense,
    getCurrentMonthExpenses,
    getTotalExpenses,
    getDeductibleExpenses,
  } = useExpenseStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [formData, setFormData] = useState({
    category: 'Gas',
    amount: '',
    expense_date: new Date().toISOString().split('T')[0],
    description: '',
    is_deductible: true,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [selectedPresetCategory, setSelectedPresetCategory] = useState('Gas');
  const [customCategoryName, setCustomCategoryName] = useState('');

  const categories = [
    // Vehicle Related
    'Gas/Fuel',
    'Vehicle Maintenance',
    'Car Wash',
    'Car Payment',
    'Auto Insurance',
    'Vehicle Registration',
    'Oil Change',
    'Tires',
    'Repairs',
    'Parking',
    'Tolls',
    'Parking Tickets',
    // Work Equipment
    'Phone Bill',
    'Internet',
    'Phone/Tablet Purchase',
    'Phone Accessories',
    'Work Supplies',
    'Safety Equipment',
    'Bags/Coolers',
    'Cleaning Supplies',
    // Food & Drinks
    'Food/Meals',
    'Coffee/Drinks',
    'Water/Beverages',
    'Snacks',
    // Insurance & Fees
    'Health Insurance',
    'Business Insurance',
    'Liability Insurance',
    'Platform Fees',
    'Subscription Services',
    'Bank Fees',
    // Office & Admin
    'Office Supplies',
    'Software/Apps',
    'Accounting/Bookkeeping',
    'Professional Services',
    'Legal Fees',
    'Business License',
    // Marketing & Advertising
    'Marketing',
    'Advertising',
    'Business Cards',
    'Website',
    // Clothing
    'Work Uniform',
    'Work Clothes',
    'Safety Gear',
    // Misc
    'Tips Paid Out',
    'Gifts/Donations',
    'Training/Education',
    'Memberships',
    'Entertainment',
    'Rent',
    'Utilities',
    'Groceries',
    'Shopping',
    'Healthcare',
    'Personal Care',
    'Other Expense',
    'Custom',
  ];

  useEffect(() => {
    if (user?.id) {
      fetchExpenses(user.id);
    }
  }, [user, fetchExpenses]);

  const handleOpenModal = (expense = null) => {
    if (expense) {
      setEditingExpense(expense);
      setFormData({
        category: expense.category,
        amount: expense.amount,
        expense_date: expense.expense_date,
        description: expense.description || '',
        is_deductible: expense.is_deductible ?? true,
      });
      // Check if it's a preset category or custom
      const isPreset = categories.slice(0, -1).includes(expense.category);
      setIsCustomCategory(!isPreset);
      setSelectedPresetCategory(isPreset ? expense.category : 'Custom');
      setCustomCategoryName(isPreset ? '' : expense.category);
    } else {
      setEditingExpense(null);
      setFormData({
        category: 'Gas/Fuel',
        amount: '',
        expense_date: new Date().toISOString().split('T')[0],
        description: '',
        is_deductible: true,
      });
      setIsCustomCategory(false);
      setSelectedPresetCategory('Gas/Fuel');
      setCustomCategoryName('');
    }
    setIsModalOpen(true);
    setError('');
    setSuccess('');
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingExpense(null);
    setFormData({
      category: 'Gas/Fuel',
      amount: '',
      expense_date: new Date().toISOString().split('T')[0],
      description: '',
      is_deductible: true,
    });
    setIsCustomCategory(false);
    setSelectedPresetCategory('Gas/Fuel');
    setCustomCategoryName('');
    setError('');
    setSuccess('');
  };

  const handleCategoryChange = (e) => {
    const value = e.target.value;
    setSelectedPresetCategory(value);

    if (value === 'Custom') {
      setIsCustomCategory(true);
      setFormData({ ...formData, category: customCategoryName });
    } else {
      setIsCustomCategory(false);
      setFormData({ ...formData, category: value });
    }
  };

  const handleCustomCategoryChange = (e) => {
    const value = e.target.value;
    setCustomCategoryName(value);
    setFormData({ ...formData, category: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    const expenseData = {
      ...formData,
      user_id: user.id,
      amount: parseFloat(formData.amount),
    };

    const result = editingExpense
      ? await updateExpense(editingExpense.id, expenseData)
      : await addExpense(expenseData);

    if (result.success) {
      setSuccess(
        editingExpense ? 'Expense updated successfully!' : 'Expense added successfully!'
      );
      setTimeout(() => {
        handleCloseModal();
      }, 1000);
    } else {
      setError(result.error || 'An error occurred');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      const result = await deleteExpense(id);
      if (!result.success) {
        alert(result.error || 'Failed to delete expense');
      }
    }
  };

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
  };

  const monthlyExpenses = getCurrentMonthExpenses();
  const totalExpenses = getTotalExpenses();
  const deductibleExpenses = getDeductibleExpenses();

  return (
    <div className="page-layout">
      <Navbar />
      <div className="page-content">
        <div className="page-header">
          <div>
            <h1>Expense Tracking</h1>
            <p>Track and manage your business expenses</p>
          </div>
          <button onClick={() => handleOpenModal()} className="btn btn-primary">
            + Add Expense
          </button>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">💳</div>
            <div className="stat-content">
              <h3>This Month</h3>
              <p className="stat-value">
                ${monthlyExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <h3>All Time</h3>
              <p className="stat-value">
                ${totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">💼</div>
            <div className="stat-content">
              <h3>Tax Deductible</h3>
              <p className="stat-value">
                ${deductibleExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>

        <div className="content-section">
          {loading ? (
            <div className="loading">Loading expense data...</div>
          ) : expenses.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">💳</div>
              <h3>No expenses yet</h3>
              <p>Start tracking your business expenses for better financial management</p>
              <button onClick={() => handleOpenModal()} className="btn btn-primary">
                Add First Expense
              </button>
            </div>
          ) : (
            <div className="transactions-list">
              {expenses.map((expense) => (
                <TransactionCard
                  key={expense.id}
                  transaction={expense}
                  type="expense"
                  onEdit={handleOpenModal}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>

        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={editingExpense ? 'Edit Expense' : 'Add New Expense'}
        >
          <form onSubmit={handleSubmit} className="form">
            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            <div className="form-group">
              <label htmlFor="categoryType">Expense Category *</label>
              <select
                id="categoryType"
                value={selectedPresetCategory}
                onChange={handleCategoryChange}
                required={!isCustomCategory}
                className="form-control"
              >
                <option value="">Select a category...</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {isCustomCategory && (
              <div className="form-group">
                <label htmlFor="customCategory">Custom Category Name *</label>
                <input
                  type="text"
                  id="customCategory"
                  value={customCategoryName}
                  onChange={handleCustomCategoryChange}
                  required
                  className="form-control"
                  placeholder="Enter your expense category..."
                />
              </div>
            )}

            <div className="form-group">
              <label htmlFor="amount">Amount *</label>
              <input
                type="number"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                step="0.01"
                min="0"
                required
                className="form-control"
                placeholder="0.00"
              />
            </div>

            <div className="form-group">
              <label htmlFor="expense_date">Date *</label>
              <input
                type="date"
                id="expense_date"
                name="expense_date"
                value={formData.expense_date}
                onChange={handleChange}
                required
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description / Vendor</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                className="form-control"
                placeholder="Add any additional notes..."
              />
            </div>

            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="is_deductible"
                  checked={formData.is_deductible}
                  onChange={handleChange}
                />
                <span>This is a tax-deductible business expense</span>
              </label>
            </div>

            <div className="form-actions">
              <button type="button" onClick={handleCloseModal} className="btn btn-secondary">
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {editingExpense ? 'Update' : 'Add'} Expense
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
}
