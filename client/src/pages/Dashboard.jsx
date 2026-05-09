import { useState, useEffect } from 'react';
import ListCard from '../components/GroceryList/ListCard';
import { getLists, createList, deleteList } from '../services/api';

export default function Dashboard() {
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', budget: '' });
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    fetchLists();
  }, []);

  const fetchLists = async () => {
    try {
      setError('');
      const data = await getLists();
      setLists(data);
    } catch (err) {
      setError('Failed to load grocery lists. Make sure the server is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setFormError('List name is required');
      return;
    }
    setFormError('');
    setCreating(true);
    try {
      const newList = await createList({
        name: form.name.trim(),
        budget: parseFloat(form.budget) || 0,
      });
      setLists((prev) => [{ ...newList, item_count: 0, total_cost: 0 }, ...prev]);
      setForm({ name: '', budget: '' });
      setShowModal(false);
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to create list');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteList(id);
      setLists((prev) => prev.filter((l) => l.id !== id));
    } catch (err) {
      alert('Failed to delete list');
    }
  };

  const totalSpent = lists.reduce((sum, l) => sum + l.total_cost, 0);
  const totalBudget = lists.reduce((sum, l) => sum + l.budget, 0);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Grocery Lists</h1>
          <p className="text-sm text-gray-500 mt-1">
            {lists.length} {lists.length === 1 ? 'list' : 'lists'} • Total spent: ${totalSpent.toFixed(2)}
            {totalBudget > 0 && ` / $${totalBudget.toFixed(2)} budget`}
          </p>
        </div>
        <button
          onClick={() => { setShowModal(true); setForm({ name: '', budget: '' }); setFormError(''); }}
          className="btn-primary flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New List
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="text-center py-16 text-gray-400">
          <div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full mx-auto mb-3" />
          Loading lists...
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && lists.length === 0 && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">No grocery lists yet</h2>
          <p className="text-gray-500 mb-6">Create your first list to start tracking your grocery budget.</p>
          <button
            onClick={() => { setShowModal(true); setFormError(''); }}
            className="btn-primary"
          >
            Create Your First List
          </button>
        </div>
      )}

      {/* Lists grid */}
      {!loading && lists.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {lists.map((list) => (
            <ListCard key={list.id} list={list} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {/* Create List Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-bold text-gray-900">Create New List</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-4">
                {formError && (
                  <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                    {formError}
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    List Name *
                  </label>
                  <input
                    className="input-field"
                    placeholder="e.g. Weekly Groceries"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Budget (optional)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                    <input
                      className="input-field pl-7"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={form.budget}
                      onChange={(e) => setForm({ ...form, budget: e.target.value })}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Leave empty for no budget limit</p>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={creating} className="btn-primary flex-1">
                    {creating ? 'Creating...' : 'Create List'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
