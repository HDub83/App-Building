export default function BudgetSummary({ budget, totalCost, itemCount }) {
  const remaining = budget - totalCost;
  const overBudget = totalCost > budget && budget > 0;
  const pct = budget > 0 ? Math.min((totalCost / budget) * 100, 100) : 0;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
      <div className="bg-gray-50 rounded-lg p-3 text-center">
        <p className="text-xs text-gray-500 uppercase tracking-wide">Items</p>
        <p className="text-xl font-bold text-gray-800">{itemCount}</p>
      </div>
      <div className="bg-gray-50 rounded-lg p-3 text-center">
        <p className="text-xs text-gray-500 uppercase tracking-wide">Total</p>
        <p className="text-xl font-bold text-gray-800">${totalCost.toFixed(2)}</p>
      </div>
      <div className="bg-gray-50 rounded-lg p-3 text-center">
        <p className="text-xs text-gray-500 uppercase tracking-wide">Budget</p>
        <p className="text-xl font-bold text-gray-800">${budget.toFixed(2)}</p>
      </div>
      <div
        className={`rounded-lg p-3 text-center ${
          overBudget ? 'bg-red-50' : 'bg-primary-50'
        }`}
      >
        <p className="text-xs text-gray-500 uppercase tracking-wide">
          {overBudget ? 'Over' : 'Left'}
        </p>
        <p
          className={`text-xl font-bold ${
            overBudget ? 'text-red-600' : 'text-primary-600'
          }`}
        >
          ${Math.abs(remaining).toFixed(2)}
        </p>
      </div>
    </div>
  );
}
