import { useState } from 'react';

const UNITS = ['each', 'lb', 'oz', 'kg', 'g', 'liter', 'ml', 'bunch', 'dozen', 'pkg', 'can', 'box', 'bag', 'tsp', 'tbsp', 'cup', 'clove'];

const emptyIngredient = () => ({ name: '', quantity: 1, unit: 'each', estimated_price: '' });

export default function UserRecipeForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState({
    title: initial?.title || '',
    description: initial?.description || '',
    servings: initial?.servings || 4,
    estimated_cost: initial?.estimated_cost || '',
    instructions: initial?.instructions || '',
  });
  const [ingredients, setIngredients] = useState(
    initial?.ingredients?.length
      ? initial.ingredients.map((i) => ({ ...i, estimated_price: i.estimated_price || '' }))
      : [emptyIngredient()]
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const updateIngredient = (idx, field, value) => {
    setIngredients((prev) => prev.map((ing, i) => (i === idx ? { ...ing, [field]: value } : ing)));
  };

  const addIngredient = () => setIngredients((prev) => [...prev, emptyIngredient()]);

  const removeIngredient = (idx) => {
    if (ingredients.length === 1) return;
    setIngredients((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError('Recipe title is required');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const payload = {
        ...form,
        servings: parseInt(form.servings) || 4,
        estimated_cost: parseFloat(form.estimated_cost) || 0,
        ingredients: ingredients
          .filter((i) => i.name.trim())
          .map((i) => ({
            name: i.name.trim(),
            quantity: parseFloat(i.quantity) || 1,
            unit: i.unit,
            estimated_price: parseFloat(i.estimated_price) || 0,
          })),
      };
      await onSave(payload);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save recipe');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Recipe Title *</label>
          <input
            className="input-field"
            placeholder="e.g. Budget Pasta Primavera"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            className="input-field resize-none"
            rows={2}
            placeholder="Brief description of the recipe..."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Servings</label>
          <input
            className="input-field"
            type="number"
            min="1"
            value={form.servings}
            onChange={(e) => setForm({ ...form, servings: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Cost ($)</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
            <input
              className="input-field pl-6"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={form.estimated_cost}
              onChange={(e) => setForm({ ...form, estimated_cost: e.target.value })}
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Ingredients</label>
        <div className="space-y-2">
          {ingredients.map((ing, idx) => (
            <div key={idx} className="flex gap-2 items-center">
              <input
                className="input-field flex-1"
                placeholder="Ingredient name"
                value={ing.name}
                onChange={(e) => updateIngredient(idx, 'name', e.target.value)}
              />
              <input
                className="input-field w-16"
                type="number"
                min="0"
                step="0.01"
                placeholder="Qty"
                value={ing.quantity}
                onChange={(e) => updateIngredient(idx, 'quantity', e.target.value)}
              />
              <select
                className="input-field w-24"
                value={ing.unit}
                onChange={(e) => updateIngredient(idx, 'unit', e.target.value)}
              >
                {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
              <div className="relative w-24">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">$</span>
                <input
                  className="input-field pl-5 text-sm"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Price"
                  value={ing.estimated_price}
                  onChange={(e) => updateIngredient(idx, 'estimated_price', e.target.value)}
                />
              </div>
              <button
                type="button"
                onClick={() => removeIngredient(idx)}
                className="text-gray-300 hover:text-red-500 transition-colors flex-shrink-0"
                disabled={ingredients.length === 1}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addIngredient}
          className="mt-2 text-sm text-primary-600 hover:text-primary-800 font-medium flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Ingredient
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Instructions</label>
        <textarea
          className="input-field resize-none"
          rows={5}
          placeholder="Step-by-step cooking instructions..."
          value={form.instructions}
          onChange={(e) => setForm({ ...form, instructions: e.target.value })}
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Saving...' : initial ? 'Update Recipe' : 'Create Recipe'}
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancel
        </button>
      </div>
    </form>
  );
}
