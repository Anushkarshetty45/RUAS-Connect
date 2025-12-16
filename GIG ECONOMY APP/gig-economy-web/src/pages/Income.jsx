import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useTransactionStore } from '../store/transactionStore';
import Navbar from '../components/Navbar';
import Modal from '../components/Modal';
import TransactionCard from '../components/TransactionCard';

export default function Income() {
  const user = useAuthStore((state) => state.user);
  const {
    transactions,
    loading,
    fetchTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    getCurrentMonthIncome,
    getTotalIncome,
  } = useTransactionStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [formData, setFormData] = useState({
    platform: 'Uber',
    amount: '',
    transaction_date: new Date().toISOString().split('T')[0],
    notes: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isCustomPlatform, setIsCustomPlatform] = useState(false);
  const [selectedPresetPlatform, setSelectedPresetPlatform] = useState('Uber');
  const [customPlatformName, setCustomPlatformName] = useState('');

  const platforms = [
    'Uber',
    'Lyft',
    'DoorDash',
    'Uber Eats',
    'Grubhub',
    'Instacart',
    'Postmates',
    'Shipt',
    'TaskRabbit',
    'Roadie',
    'GoPuff',
    'Amazon Flex',
    'Fiverr',
    'Upwork',
    'Freelancer.com',
    'Thumbtack',
    'Care.com',
    'Rover',
    'Wag',
    'VIPKid',
    'Cambly',
    'Rev',
    'UserTesting',
    'Appen',
    'Lionbridge',
    'YouTube',
    'Twitch',
    'Patreon',
    'OnlyFans',
    'Tips/Gratuities',
    'Cash Jobs',
    'Consulting',
    'Freelance',
    'Contract Work',
    'Side Business',
    'Commission',
    'Bonus',
    'Referral Income',
    'Other Income',
    'Custom',
  ];

  useEffect(() => {
    if (user?.id) {
      fetchTransactions(user.id);
    }
  }, [user, fetchTransactions]);

  const handleOpenModal = (transaction = null) => {
    if (transaction) {
      setEditingTransaction(transaction);
      setFormData({
        platform: transaction.platform,
        amount: transaction.amount,
        transaction_date: transaction.transaction_date,
        notes: transaction.notes || '',
      });
      // Check if it's a preset platform or custom
      const isPreset = platforms.slice(0, -1).includes(transaction.platform);
      setIsCustomPlatform(!isPreset);
      setSelectedPresetPlatform(isPreset ? transaction.platform : 'Custom');
      setCustomPlatformName(isPreset ? '' : transaction.platform);
    } else {
      setEditingTransaction(null);
      setFormData({
        platform: 'Uber',
        amount: '',
        transaction_date: new Date().toISOString().split('T')[0],
        notes: '',
      });
      setIsCustomPlatform(false);
      setSelectedPresetPlatform('Uber');
      setCustomPlatformName('');
    }
    setIsModalOpen(true);
    setError('');
    setSuccess('');
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTransaction(null);
    setFormData({
      platform: 'Uber',
      amount: '',
      transaction_date: new Date().toISOString().split('T')[0],
      notes: '',
    });
    setIsCustomPlatform(false);
    setSelectedPresetPlatform('Uber');
    setCustomPlatformName('');
    setError('');
    setSuccess('');
  };

  const handlePlatformChange = (e) => {
    const value = e.target.value;
    setSelectedPresetPlatform(value);

    if (value === 'Custom') {
      setIsCustomPlatform(true);
      setFormData({ ...formData, platform: customPlatformName });
    } else {
      setIsCustomPlatform(false);
      setFormData({ ...formData, platform: value });
    }
  };

  const handleCustomPlatformChange = (e) => {
    const value = e.target.value;
    setCustomPlatformName(value);
    setFormData({ ...formData, platform: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    const transactionData = {
      ...formData,
      user_id: user.id,
      amount: parseFloat(formData.amount),
    };

    const result = editingTransaction
      ? await updateTransaction(editingTransaction.id, transactionData)
      : await addTransaction(transactionData);

    if (result.success) {
      setSuccess(
        editingTransaction ? 'Income updated successfully!' : 'Income added successfully!'
      );
      setTimeout(() => {
        handleCloseModal();
      }, 1000);
    } else {
      setError(result.error || 'An error occurred');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this income entry?')) {
      const result = await deleteTransaction(id);
      if (!result.success) {
        alert(result.error || 'Failed to delete income entry');
      }
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const monthlyIncome = getCurrentMonthIncome();
  const totalIncome = getTotalIncome();

  return (
    <div className="page-layout">
      <Navbar />
      <div className="page-content">
        <div className="page-header">
          <div>
            <h1>Income Tracking</h1>
            <p>Monitor your earnings from all platforms</p>
          </div>
          <button onClick={() => handleOpenModal()} className="btn btn-primary">
            + Add Income
          </button>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-content">
              <h3>This Month</h3>
              <p className="stat-value">
                ${monthlyIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <h3>All Time</h3>
              <p className="stat-value">
                ${totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📈</div>
            <div className="stat-content">
              <h3>Total Entries</h3>
              <p className="stat-value">{transactions.length}</p>
            </div>
          </div>
        </div>

        <div className="content-section">
          {loading ? (
            <div className="loading">Loading income data...</div>
          ) : transactions.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">💰</div>
              <h3>No income entries yet</h3>
              <p>Start tracking your earnings by adding your first income entry</p>
              <button onClick={() => handleOpenModal()} className="btn btn-primary">
                Add First Income
              </button>
            </div>
          ) : (
            <div className="transactions-list">
              {transactions.map((transaction) => (
                <TransactionCard
                  key={transaction.id}
                  transaction={transaction}
                  type="income"
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
          title={editingTransaction ? 'Edit Income' : 'Add New Income'}
        >
          <form onSubmit={handleSubmit} className="form">
            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            <div className="form-group">
              <label htmlFor="platformType">Income Source *</label>
              <select
                id="platformType"
                value={selectedPresetPlatform}
                onChange={handlePlatformChange}
                required={!isCustomPlatform}
                className="form-control"
              >
                <option value="">Select a platform...</option>
                {platforms.map((platform) => (
                  <option key={platform} value={platform}>
                    {platform}
                  </option>
                ))}
              </select>
            </div>

            {isCustomPlatform && (
              <div className="form-group">
                <label htmlFor="customPlatform">Custom Platform Name *</label>
                <input
                  type="text"
                  id="customPlatform"
                  value={customPlatformName}
                  onChange={handleCustomPlatformChange}
                  required
                  className="form-control"
                  placeholder="Enter your income source..."
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
              <label htmlFor="transaction_date">Date *</label>
              <input
                type="date"
                id="transaction_date"
                name="transaction_date"
                value={formData.transaction_date}
                onChange={handleChange}
                required
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label htmlFor="notes">Notes</label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="3"
                className="form-control"
                placeholder="Add any additional notes..."
              />
            </div>

            <div className="form-actions">
              <button type="button" onClick={handleCloseModal} className="btn btn-secondary">
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {editingTransaction ? 'Update' : 'Add'} Income
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
}
