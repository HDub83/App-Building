import { useNavigate } from 'react-router-dom';

export default function ListCard({ list, onDelete }) {
  const navigate = useNavigate();
  const pct =
    list.budget > 0
      ? Math.min((list.total_cost / list.budget) * 100, 100)
      : 0;
  const overBudget = list.total_cost > list.budget && list.budget > 0;
  const remaining = list.budget - list.total_cost;

  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm(`Delete "${list.name}"?`)) {
      onDelete(list.id);
    }
  };

  return (
    <div
      onClick={() => navigate(`/lists/${list.id}`)}
      className="card cursor-pointer hover:shadow-md hover:border-primary-200 transition-all group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 text-lg truncate group-hover:text-primary-700 transition-colors">
            {list.name}
          </h3>
          <p className="text-sm text-gray-500">
            {list.item_count} {list.item_count === 1 ? 'item' : 'items'}
          </p>
        </div>
        <button
          onClick={handleDelete}
          className="ml-2 text-gray-300 hover:text-red-500 transition-colors p-1 rounded"
          title="Delete list"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      {list.budget > 0 && (
        <>
          <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
            <div
              className={`h-2 rounded-full transition-all ${
                overBudget ? 'bg-red-500' : pct > 75 ? 'bg-yellow-500' : 'bg-primary-500'
              }`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>${list.total_cost.toFixed(2)} spent</span>
            <span
              className={overBudget ? 'text-red-600 font-medium' : 'text-primary-600 font-medium'}
            >
              {overBudget
                ? `$${Math.abs(remaining).toFixed(2)} over`
                : `$${remaining.toFixed(2)} left`}
            </span>
          </div>
        </>
      )}

      {list.budget === 0 && (
        <div className="flex justify-between text-xs text-gray-500">
          <span>Total: ${list.total_cost.toFixed(2)}</span>
          <span className="text-gray-400">No budget set</span>
        </div>
      )}

      <div className="mt-3 pt-3 border-t border-gray-50">
        <span className="text-xs text-primary-600 font-medium group-hover:text-primary-700">
          View List →
        </span>
      </div>
    </div>
  );
}
