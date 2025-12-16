import { MdEdit, MdDelete } from 'react-icons/md';

export default function GoalCard({ goal, onEdit, onDelete, onAddFunds, onWithdraw }) {
  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No deadline';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getDaysRemaining = (deadline) => {
    if (!deadline) return null;
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getProgress = () => {
    const current = parseFloat(goal.current_amount || 0);
    const target = parseFloat(goal.target_amount || 1);
    return Math.min(100, (current / target) * 100);
  };

  const progress = getProgress();
  const daysRemaining = getDaysRemaining(goal.deadline);
  const remaining = parseFloat(goal.target_amount) - parseFloat(goal.current_amount);

  return (
    <div className={`goal-card ${goal.status === 'completed' ? 'completed' : ''}`}>
      <div className="goal-header">
        <div className="goal-title-section">
          <h3 className="goal-title">{goal.name}</h3>
          {goal.description && <p className="goal-description">{goal.description}</p>}
        </div>
      </div>

      <div className="goal-progress-section">
        <div className="goal-amounts">
          <span className="goal-current">{formatAmount(goal.current_amount)}</span>
          <span className="goal-target">of {formatAmount(goal.target_amount)}</span>
        </div>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{
              width: `${progress}%`,
              backgroundColor: goal.color || '#8B5CF6',
            }}
          />
        </div>
        <div className="progress-percentage">{progress.toFixed(1)}% Complete</div>
      </div>

      <div className="goal-info">
        <div className="goal-info-item">
          <span className="label">Deadline:</span>
          <span className="value">{formatDate(goal.deadline)}</span>
        </div>
        {daysRemaining !== null && (
          <div className="goal-info-item">
            <span className="label">Days Left:</span>
            <span className={`value ${daysRemaining < 30 ? 'urgent' : ''}`}>
              {daysRemaining > 0 ? daysRemaining : 'Overdue'}
            </span>
          </div>
        )}
        <div className="goal-info-item">
          <span className="label">Remaining:</span>
          <span className="value">{formatAmount(Math.max(0, remaining))}</span>
        </div>
      </div>

      <div className="goal-actions">
        <button
          onClick={() => onAddFunds(goal)}
          className="btn btn-primary btn-sm"
          disabled={goal.status === 'completed'}
        >
          Add Funds
        </button>
        <button
          onClick={() => onWithdraw(goal)}
          className="btn btn-secondary btn-sm"
          disabled={parseFloat(goal.current_amount) === 0}
        >
          Withdraw
        </button>
        <button
          onClick={() => onEdit(goal)}
          className="btn btn-icon btn-edit"
          title="Edit"
        >
          <MdEdit size={18} />
        </button>
        <button
          onClick={() => onDelete(goal.id)}
          className="btn btn-icon btn-delete"
          title="Delete"
        >
          <MdDelete size={18} />
        </button>
      </div>

      {goal.status === 'completed' && (
        <div className="goal-completed-badge">Completed!</div>
      )}
    </div>
  );
}
