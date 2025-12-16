import { MdEdit, MdDelete } from 'react-icons/md';

export default function TransactionCard({ transaction, onEdit, onDelete, type = 'income' }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getPlatformIcon = (platform) => {
    const icons = {
      Uber: '🚗',
      Lyft: '🚘',
      DoorDash: '🍔',
      'Uber Eats': '🍕',
      Grubhub: '🥡',
      Instacart: '🛒',
      Fiverr: '💼',
      Upwork: '💻',
      Freelance: '✨',
      Other: '💰',
    };
    return icons[platform] || '💰';
  };

  const getCategoryIcon = (category) => {
    const icons = {
      Gas: '⛽',
      'Vehicle Maintenance': '🔧',
      'Car Payment': '🚗',
      Insurance: '🛡️',
      'Phone Bill': '📱',
      Supplies: '📦',
      Food: '🍔',
      Parking: '🅿️',
      Tolls: '🛣️',
      Other: '💳',
    };
    return icons[category] || '💳';
  };

  // Extract merchant name from receipt scan descriptions
  const getDisplayName = () => {
    if (type === 'income') {
      return transaction.platform;
    }

    // Check if this expense came from a receipt scan
    if (transaction.description && transaction.description.includes(' - Receipt scan')) {
      // Extract merchant name (everything before " - Receipt scan")
      return transaction.description.replace(' - Receipt scan', '');
    }

    // Otherwise show the category
    return transaction.category;
  };

  return (
    <div className="transaction-card">
      <div className="transaction-icon">
        {type === 'income'
          ? getPlatformIcon(transaction.platform)
          : getCategoryIcon(transaction.category)}
      </div>
      <div className="transaction-details">
        <div className="transaction-main">
          <h3 className="transaction-title">
            {getDisplayName()}
          </h3>
          <p className="transaction-amount">
            {formatAmount(transaction.amount)}
          </p>
        </div>
        <div className="transaction-meta">
          <span className="transaction-date">
            {formatDate(
              type === 'income' ? transaction.transaction_date : transaction.expense_date
            )}
          </span>
          {(transaction.notes || transaction.description) && (
            <span className="transaction-notes">
              {transaction.notes || transaction.description}
            </span>
          )}
        </div>
      </div>
      <div className="transaction-actions">
        <button
          onClick={() => onEdit(transaction)}
          className="btn-icon btn-edit"
          title="Edit"
        >
          <MdEdit size={18} />
        </button>
        <button
          onClick={() => onDelete(transaction.id)}
          className="btn-icon btn-delete"
          title="Delete"
        >
          <MdDelete size={18} />
        </button>
      </div>
    </div>
  );
}
