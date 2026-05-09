import { useState } from 'react';

export default function ItemRow({ item, listId, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: item.name,
    quantity: item.quantity,
    unit: item.unit,
    price: item.price,
  });
  const [saving, setSaving] = useState(false);

  const handleCheck = async () => {
    await onUpdate(item.id, { checked: item.checked ? 0 : 1 });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onUpdate(item.id, {
        name: form.name,
        quantity: parseFloat(form.quantity) || 1,
        unit: form.unit,
        price: parseFloat(form.price) || 0,
      });
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setForm({
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      price: item.price,
    });
    setEditing(false);
  };

  if (editing) {
    return (
      <tr className="bg-primary-50">
        <td className="px-4 py-2">
          <input
            className="input-field text-sm"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Item name"
          />
        </td>
        <td className="px-4 py-2">
          <input
            className="input-field text-sm w-20"
            type="number"
            min="0"
            step="0.01"
            value={form.quantity}
            onChange={(e) => setForm({ ...form, quantity: e.target.value })}
          />
        </td>
        <td className="px-4 py-2">
          <select
            className="input-field text-sm"
            value={form.unit}
            onChange={(e) => setForm({ ...form, unit: e.target.value })}
          >
            <option value="each">each</option>
            <option value="lb">lb</option>
            <option value="oz">oz</option>
            <option value="kg">kg</option>
            <option value="g">g</option>
            <option value="liter">liter</option>
            <option value="ml">ml</option>
            <option value="bunch">bunch</option>
            <option value="dozen">dozen</option>
            <option value="pkg">pkg</option>
            <option value="can">can</option>
            <option value="box">box</option>
            <option value="bag">bag</option>
          </select>
        </td>
        <td className="px-4 py-2">
          <div className="flex items-center gap-1">
            <span className="text-gray-500 text-sm">$</span>
            <input
              className="input-field text-sm w-24"
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />
          </div>
        </td>
        <td className="px-4 py-2 text-sm font-medium text-gray-700">
          ${((parseFloat(form.price) || 0) * (parseFloat(form.quantity) || 1)).toFixed(2)}
        </td>
        <td className="px-4 py-2">
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="text-xs bg-primary-600 text-white px-2 py-1 rounded hover:bg-primary-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={handleCancel}
              className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded border border-gray-300"
            >
              Cancel
            </button>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr
      className={`hover:bg-gray-50 transition-colors ${item.checked ? 'opacity-60' : ''}`}
    >
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={!!item.checked}
            onChange={handleCheck}
            className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
          />
          <span className={`text-sm font-medium ${item.checked ? 'line-through text-gray-400' : 'text-gray-900'}`}>
            {item.name}
          </span>
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-gray-600">{item.quantity}</td>
      <td className="px-4 py-3 text-sm text-gray-600">{item.unit}</td>
      <td className="px-4 py-3 text-sm text-gray-600">${item.price.toFixed(2)}</td>
      <td className="px-4 py-3 text-sm font-medium text-gray-800">
        ${(item.price * item.quantity).toFixed(2)}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setEditing(true)}
            className="text-gray-400 hover:text-primary-600 transition-colors p-1 rounded"
            title="Edit item"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(item.id)}
            className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded"
            title="Delete item"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </td>
    </tr>
  );
}
