import { useState } from 'react';

const UNITS = ['each', 'lb', 'oz', 'kg', 'g', 'liter', 'ml', 'bunch', 'dozen', 'pkg', 'can', 'box', 'bag'];

export default function AddItemForm({ onAdd }) {
  const [form, setForm] = useState({
    name: '',
    quantity: 1,
    unit: 'each',
    price: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError('Item name is required');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await onAdd({
        name: form.name.trim(),
        quantity: parseFloat(form.quantity) || 1,
        unit: form.unit,
        price: parseFloat(form.price) || 0,
      });
      setForm({ name: '', quantity: 1, unit: 'each', price: '' });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border-t border-gray-100 pt-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Add Item Manually</h3>
      {error && (
        <div className="mb-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          {error}
        </div>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="sm:col-span-2">
          <input
            className="input-field"
            placeholder="Item name *"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>
        <div className="flex gap-2">
          <input
            className="input-field w-20"
            type="number"
            min="0"
            step="0.01"
            placeholder="Qty"
            value={form.quantity}
            onChange={(e) => setForm({ ...form, quantity: e.target.value })}
          />
          <select
            className="input-field"
            value={form.unit}
            onChange={(e) => setForm({ ...form, unit: e.target.value })}
          >
            {UNITS.map((u) => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
            <input
              className="input-field pl-6"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary whitespace-nowrap"
          >
            {loading ? '...' : 'Add'}
          </button>
        </div>
      </div>
    </form>
  );
}
