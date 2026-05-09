import { useState } from 'react';
import RecipeCard from '../components/Recipes/RecipeCard';
import { suggestRecipes } from '../services/api';

export default function RecipesPage() {
  const [ingredients, setIngredients] = useState('');
  const [maxCost, setMaxCost] = useState('');
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!ingredients.trim()) return;

    setLoading(true);
    setError('');
    setRecipes([]);
    setSearched(true);

    try {
      const data = await suggestRecipes(
        ingredients.trim(),
        maxCost ? parseFloat(maxCost) : undefined,
        9
      );
      setRecipes(data.recipes || []);
      if ((data.recipes || []).length === 0) {
        setError(data.error || 'No recipes found for those ingredients. Try different ones!');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to find recipes. Check your API configuration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Recipe Suggestions</h1>
        <p className="text-sm text-gray-500">
          Enter your ingredients to discover recipes you can make. Powered by Spoonacular.
        </p>
      </div>

      {/* Search Form */}
      <div className="card mb-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ingredients (comma-separated) *
            </label>
            <input
              className="input-field"
              placeholder="e.g. eggs, milk, butter, flour, chicken"
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
            />
            <p className="text-xs text-gray-400 mt-1">
              Enter ingredients you have on hand separated by commas
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Budget per Recipe (optional)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                <input
                  className="input-field pl-7"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="No limit"
                  value={maxCost}
                  onChange={(e) => setMaxCost(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-end">
              <button type="submit" disabled={loading || !ingredients.trim()} className="btn-primary w-full sm:w-auto">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                    Searching...
                  </span>
                ) : (
                  'Find Recipes'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Error */}
      {error && !loading && (
        <div className="mb-6 bg-amber-50 border border-amber-200 text-amber-700 rounded-xl p-4 text-sm">
          {error}
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="flex gap-4">
                <div className="w-24 h-24 bg-gray-200 rounded-lg flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                  <div className="h-3 bg-gray-200 rounded w-2/3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Results */}
      {!loading && recipes.length > 0 && (
        <div>
          <p className="text-sm text-gray-500 mb-4">
            Found {recipes.length} recipe{recipes.length !== 1 ? 's' : ''} using your ingredients
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        </div>
      )}

      {/* Empty initial state */}
      {!loading && !searched && recipes.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <div className="text-6xl mb-4">🍳</div>
          <h2 className="text-xl font-semibold text-gray-600 mb-2">What's in your pantry?</h2>
          <p className="text-sm">Enter your ingredients above to get recipe ideas.</p>
        </div>
      )}
    </div>
  );
}
