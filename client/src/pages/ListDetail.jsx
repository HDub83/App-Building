import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import BudgetBar from '../components/Budget/BudgetBar';
import BudgetSummary from '../components/Budget/BudgetSummary';
import ItemRow from '../components/GroceryList/ItemRow';
import AddItemForm from '../components/GroceryList/AddItemForm';
import RecipeCard from '../components/Recipes/RecipeCard';
import { getList, addItem, updateItem, deleteItem, searchPrices, suggestRecipes, updateList } from '../services/api';

export default function ListDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [list, setList] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Price search
  const [priceQuery, setPriceQuery] = useState('');
  const [priceResults, setPriceResults] = useState([]);
  const [priceLoading, setPriceLoading] = useState(false);
  const [priceError, setPriceError] = useState('');

  // Recipe suggestions
  const [recipes, setRecipes] = useState([]);
  const [recipesLoading, setRecipesLoading] = useState(false);
  const [recipesError, setRecipesError] = useState('');
  const [showRecipes, setShowRecipes] = useState(false);

  // Edit budget inline
  const [editingBudget, setEditingBudget] = useState(false);
  const [newBudget, setNewBudget] = useState('');

  useEffect(() => {
    fetchList();
  }, [id]);

  const fetchList = async () => {
    try {
      setError('');
      const data = await getList(id);
      setList(data);
    } catch (err) {
      if (err.response?.status === 404) {
        navigate('/');
      } else {
        setError('Failed to load list');
      }
    } finally {
      setLoading(false);
    }
  };

  const totalCost = list?.items?.reduce((sum, i) => sum + i.price * i.quantity, 0) ?? 0;

  const handleAddItem = async (itemData) => {
    const item = await addItem(id, itemData);
    setList((prev) => ({ ...prev, items: [...prev.items, item] }));
  };

  const handleUpdateItem = async (itemId, data) => {
    const updated = await updateItem(id, itemId, data);
    setList((prev) => ({
      ...prev,
      items: prev.items.map((i) => (i.id === itemId ? updated : i)),
    }));
  };

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm('Remove this item?')) return;
    await deleteItem(id, itemId);
    setList((prev) => ({
      ...prev,
      items: prev.items.filter((i) => i.id !== itemId),
    }));
  };

  const handlePriceSearch = async (e) => {
    e.preventDefault();
    if (!priceQuery.trim()) return;
    setPriceLoading(true);
    setPriceError('');
    setPriceResults([]);
    try {
      const data = await searchPrices(priceQuery.trim());
      setPriceResults(data.products || []);
      if ((data.products || []).length === 0) {
        setPriceError(data.error || 'No products found');
      }
    } catch (err) {
      setPriceError(err.response?.data?.error || 'Price search failed');
    } finally {
      setPriceLoading(false);
    }
  };

  const handleAddFromPrice = async (product) => {
    await handleAddItem({
      name: product.name,
      quantity: 1,
      unit: 'each',
      price: product.price || 0,
      kroger_product_id: product.id,
    });
    setPriceResults((prev) => prev.filter((p) => p.id !== product.id));
  };

  const handleGetRecipes = async () => {
    if (!list?.items?.length) return;
    setShowRecipes(true);
    setRecipesLoading(true);
    setRecipesError('');
    setRecipes([]);
    try {
      const ingredients = list.items.map((i) => i.name).join(',');
      const data = await suggestRecipes(ingredients);
      setRecipes(data.recipes || []);
      if ((data.recipes || []).length === 0) {
        setRecipesError(data.error || 'No recipe suggestions found');
      }
    } catch (err) {
      setRecipesError(err.response?.data?.error || 'Failed to get recipe suggestions');
    } finally {
      setRecipesLoading(false);
    }
  };

  const handleSaveBudget = async () => {
    try {
      const updated = await updateList(id, { budget: parseFloat(newBudget) || 0 });
      setList((prev) => ({ ...prev, budget: updated.budget }));
      setEditingBudget(false);
    } catch (err) {
      alert('Failed to update budget');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-16 text-gray-400">
        <div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full mx-auto mb-3" />
        Loading list...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-red-600 mb-4">{error}</p>
        <button onClick={() => navigate('/')} className="btn-secondary">Back to Dashboard</button>
      </div>
    );
  }

  if (!list) return null;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <button
          onClick={() => navigate('/')}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-2xl font-bold text-gray-900 flex-1">{list.name}</h1>
        {editingBudget ? (
          <div className="flex items-center gap-2">
            <div className="relative">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
              <input
                className="input-field w-28 pl-5 text-sm"
                type="number"
                min="0"
                step="0.01"
                value={newBudget}
                onChange={(e) => setNewBudget(e.target.value)}
                autoFocus
              />
            </div>
            <button onClick={handleSaveBudget} className="btn-primary text-sm py-1.5">Save</button>
            <button onClick={() => setEditingBudget(false)} className="btn-secondary text-sm py-1.5">Cancel</button>
          </div>
        ) : (
          <button
            onClick={() => { setEditingBudget(true); setNewBudget(list.budget || ''); }}
            className="text-sm text-primary-600 hover:text-primary-800 font-medium"
          >
            {list.budget > 0 ? `Budget: $${list.budget.toFixed(2)}` : 'Set Budget'}
          </button>
        )}
      </div>

      {/* Budget bar */}
      {list.budget > 0 && (
        <BudgetBar budget={list.budget} spent={totalCost} />
      )}

      {/* Budget summary */}
      <BudgetSummary budget={list.budget} totalCost={totalCost} itemCount={list.items.length} />

      {/* Price Search */}
      <div className="card mb-4">
        <h2 className="text-base font-semibold text-gray-800 mb-3">Find Prices (Kroger)</h2>
        <form onSubmit={handlePriceSearch} className="flex gap-2 mb-3">
          <input
            className="input-field flex-1"
            placeholder="Search for a product (e.g. milk, eggs, bread)"
            value={priceQuery}
            onChange={(e) => setPriceQuery(e.target.value)}
          />
          <button type="submit" disabled={priceLoading} className="btn-primary whitespace-nowrap">
            {priceLoading ? 'Searching...' : 'Find Prices'}
          </button>
        </form>

        {priceError && (
          <div className="text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mb-3">
            {priceError}
          </div>
        )}

        {priceResults.length > 0 && (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {priceResults.map((product) => (
              <div
                key={product.id}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-primary-50 transition-colors"
              >
                {product.imageUrl && (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-10 h-10 object-contain rounded"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                  <p className="text-xs text-gray-500">
                    {product.brand && `${product.brand} • `}
                    {product.size && product.size}
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-sm font-semibold text-primary-700">
                    {product.price != null ? `$${product.price.toFixed(2)}` : 'N/A'}
                  </span>
                  <button
                    onClick={() => handleAddFromPrice(product)}
                    className="text-xs btn-primary py-1 px-2"
                  >
                    + Add
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Items Table */}
      <div className="card mb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-800">
            Items ({list.items.length})
          </h2>
          {list.items.length > 0 && (
            <button
              onClick={handleGetRecipes}
              className="btn-secondary text-sm flex items-center gap-1"
            >
              <span>🍳</span> Get Recipe Ideas
            </button>
          )}
        </div>

        {list.items.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-6">
            No items yet. Add items below or search for prices above.
          </p>
        ) : (
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs text-gray-500 uppercase tracking-wide border-b border-gray-100">
                  <th className="px-4 py-2">Item</th>
                  <th className="px-4 py-2">Qty</th>
                  <th className="px-4 py-2">Unit</th>
                  <th className="px-4 py-2">Price</th>
                  <th className="px-4 py-2">Subtotal</th>
                  <th className="px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {list.items.map((item) => (
                  <ItemRow
                    key={item.id}
                    item={item}
                    listId={id}
                    onUpdate={handleUpdateItem}
                    onDelete={handleDeleteItem}
                  />
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-gray-200 bg-gray-50">
                  <td colSpan={4} className="px-4 py-3 text-sm font-semibold text-gray-700">Total</td>
                  <td className="px-4 py-3 text-sm font-bold text-gray-900">${totalCost.toFixed(2)}</td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        <div className="mt-4">
          <AddItemForm onAdd={handleAddItem} />
        </div>
      </div>

      {/* Recipe Suggestions Panel */}
      {showRecipes && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-800">Recipe Suggestions</h2>
            <button
              onClick={() => setShowRecipes(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {recipesLoading && (
            <div className="text-center py-8 text-gray-400">
              <div className="animate-spin w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full mx-auto mb-2" />
              Finding recipes...
            </div>
          )}

          {recipesError && !recipesLoading && (
            <div className="text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
              {recipesError}
            </div>
          )}

          {!recipesLoading && recipes.length > 0 && (
            <div className="space-y-4">
              {recipes.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
