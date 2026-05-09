export default function BudgetBar({ budget, spent }) {
  const pct = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
  const overBudget = spent > budget && budget > 0;
  const remaining = budget - spent;

  return (
    <div className="card mb-6">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold text-gray-800">Budget Overview</h2>
        <span
          className={`text-sm font-medium px-2 py-1 rounded-full ${
            overBudget
              ? 'bg-red-100 text-red-700'
              : 'bg-primary-100 text-primary-700'
          }`}
        >
          {overBudget ? 'Over Budget!' : 'On Track'}
        </span>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden mb-3">
        <div
          className={`h-4 rounded-full transition-all duration-300 ${
            overBudget ? 'bg-red-500' : pct > 75 ? 'bg-yellow-500' : 'bg-primary-500'
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="flex justify-between text-sm text-gray-600">
        <span>
          Spent: <span className="font-semibold text-gray-900">${spent.toFixed(2)}</span>
        </span>
        <span>
          {overBudget ? (
            <span className="text-red-600 font-semibold">
              ${Math.abs(remaining).toFixed(2)} over budget
            </span>
          ) : (
            <>
              Remaining:{' '}
              <span className="font-semibold text-primary-700">${remaining.toFixed(2)}</span>
            </>
          )}
        </span>
        <span>
          Budget: <span className="font-semibold text-gray-900">${budget.toFixed(2)}</span>
        </span>
      </div>
    </div>
  );
}
