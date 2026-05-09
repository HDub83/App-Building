import { useState, useEffect } from 'react';
import UserRecipeForm from '../components/Recipes/UserRecipeForm';
import { getUserRecipes, createUserRecipe, updateUserRecipe, deleteUserRecipe } from '../services/api';

function RecipeDetailModal({ recipe, onEdit, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-start justify-between mb-5">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{recipe.title}</h2>
              <div className="flex flex-wrap gap-3 mt-1 text-sm text-gray-500">
                {recipe.servings && <span>🍽 {recipe.servings} servings</span>}
                {recipe.estimated_cost > 0 && (
                  <span className="text-primary-600 font-medium">
                    ~${recipe.estimated_cost.toFixed(2)} estimated
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors ml-4"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {recipe.description && (
            <p className="text-gray-600 text-sm mb-4">{recipe.description}</p>
          )}

          {recipe.ingredients && recipe.ingredients.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Ingredients</h3>
              <ul className="space-y-1">
                {recipe.ingredients.map((ing) => (
                  <li key={ing.id} className="flex items-center justify-between text-sm text-gray-600 py-1 border-b border-gray-50 last:border-0">
                    <span>
                      {ing.quantity} {ing.unit} {ing.name}
                    </span>
                    {ing.estimated_price > 0 && (
                      <span className="text-gray-400">${ing.estimated_price.toFixed(2)}</span>
                    )}
                  </li>
                ))}
              </ul>
              {recipe.ingredients.some((i) => i.estimated_price > 0) && (
                <p className="text-xs text-gray-400 mt-2">
                  Ingredient total: $
                  {recipe.ingredients
                    .reduce((s, i) => s + i.estimated_price * i.quantity, 0)
                    .toFixed(2)}
                </p>
              )}
            </div>
          )}

          {recipe.instructions && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Instructions</h3>
              <p className="text-sm text-gray-600 whitespace-pre-line leading-relaxed">
                {recipe.instructions}
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button onClick={onEdit} className="btn-primary text-sm">Edit Recipe</button>
            <button onClick={onClose} className="btn-secondary text-sm">Close</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MyRecipes() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [viewingRecipe, setViewingRecipe] = useState(null);

  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    try {
      setError('');
      const data = await getUserRecipes();
      setRecipes(data);
    } catch (err) {
      setError('Failed to load recipes');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data) => {
    const created = await createUserRecipe(data);
    setRecipes((prev) => [created, ...prev]);
    setShowForm(false);
  };

  const handleUpdate = async (data) => {
    const updated = await updateUserRecipe(editingRecipe.id, data);
    setRecipes((prev) => prev.map((r) => (r.id === editingRecipe.id ? updated : r)));
    setEditingRecipe(null);
    setViewingRecipe(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this recipe?')) return;
    try {
      await deleteUserRecipe(id);
      setRecipes((prev) => prev.filter((r) => r.id !== id));
      setViewingRecipe(null);
    } catch (err) {
      alert('Failed to delete recipe');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Recipes</h1>
          <p className="text-sm text-gray-500 mt-1">
            {recipes.length} custom budget-friendly {recipes.length === 1 ? 'recipe' : 'recipes'}
          </p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditingRecipe(null); }}
          className="btn-primary flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Recipe
        </button>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">
          {error}
        </div>
      )}

      {loading && (
        <div className="text-center py-16 text-gray-400">
          <div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full mx-auto mb-3" />
          Loading recipes...
        </div>
      )}

      {!loading && !error && recipes.length === 0 && !showForm && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📖</div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">No recipes yet</h2>
          <p className="text-gray-500 mb-6">
            Create your own budget-friendly recipes to track costs per meal.
          </p>
          <button onClick={() => setShowForm(true)} className="btn-primary">
            Add Your First Recipe
          </button>
        </div>
      )}

      {/* Create / Edit Form */}
      {(showForm || editingRecipe) && (
        <div className="card mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {editingRecipe ? 'Edit Recipe' : 'New Recipe'}
          </h2>
          <UserRecipeForm
            initial={editingRecipe || null}
            onSave={editingRecipe ? handleUpdate : handleCreate}
            onCancel={() => { setShowForm(false); setEditingRecipe(null); }}
          />
        </div>
      )}

      {/* Recipes Grid */}
      {!loading && recipes.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {recipes.map((recipe) => (
            <div
              key={recipe.id}
              className="card cursor-pointer hover:shadow-md hover:border-primary-200 transition-all group"
              onClick={() => setViewingRecipe(recipe)}
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-gray-900 group-hover:text-primary-700 transition-colors flex-1 pr-2">
                  {recipe.title}
                </h3>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(recipe.id); }}
                  className="text-gray-300 hover:text-red-500 transition-colors p-1 rounded flex-shrink-0"
                  title="Delete recipe"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>

              {recipe.description && (
                <p className="text-sm text-gray-500 mb-3 line-clamp-2">{recipe.description}</p>
              )}

              <div className="flex flex-wrap gap-3 text-sm">
                {recipe.servings && (
                  <span className="flex items-center gap-1 text-gray-500">
                    <span>🍽</span> {recipe.servings} servings
                  </span>
                )}
                {recipe.estimated_cost > 0 && (
                  <span className="text-primary-600 font-semibold">
                    ~${recipe.estimated_cost.toFixed(2)}
                  </span>
                )}
              </div>

              {recipe.ingredients && recipe.ingredients.length > 0 && (
                <p className="text-xs text-gray-400 mt-2">
                  {recipe.ingredients.length} ingredient{recipe.ingredients.length !== 1 ? 's' : ''}
                </p>
              )}

              <div className="mt-3 pt-3 border-t border-gray-50">
                <span className="text-xs text-primary-600 font-medium group-hover:text-primary-700">
                  View Details →
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {viewingRecipe && !editingRecipe && (
        <RecipeDetailModal
          recipe={viewingRecipe}
          onEdit={() => { setEditingRecipe(viewingRecipe); setViewingRecipe(null); }}
          onClose={() => setViewingRecipe(null)}
        />
      )}
    </div>
  );
}
