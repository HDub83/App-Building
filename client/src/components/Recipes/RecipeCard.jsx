import { useState } from 'react';
import { getRecipeDetail } from '../../services/api';

export default function RecipeCard({ recipe }) {
  const [expanded, setExpanded] = useState(false);
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleExpand = async () => {
    if (expanded) {
      setExpanded(false);
      return;
    }
    setExpanded(true);
    if (!detail) {
      setLoading(true);
      setError('');
      try {
        const data = await getRecipeDetail(recipe.id);
        setDetail(data);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load recipe details');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="card overflow-hidden">
      <div className="flex gap-4">
        {recipe.image && (
          <img
            src={recipe.image}
            alt={recipe.title}
            className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
          />
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{recipe.title}</h3>
          <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-2">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-primary-500 rounded-full inline-block" />
              {recipe.usedIngredients} used
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-gray-300 rounded-full inline-block" />
              {recipe.missedIngredients} missing
            </span>
          </div>
          {recipe.missedIngredientNames && recipe.missedIngredientNames.length > 0 && (
            <p className="text-xs text-gray-400 truncate">
              Missing: {recipe.missedIngredientNames.slice(0, 3).join(', ')}
              {recipe.missedIngredientNames.length > 3 && ` +${recipe.missedIngredientNames.length - 3} more`}
            </p>
          )}
          <button
            onClick={handleExpand}
            className="mt-2 text-xs text-primary-600 hover:text-primary-800 font-medium"
          >
            {expanded ? 'Hide Details ▲' : 'View Details ▼'}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          {loading && <p className="text-sm text-gray-500 text-center py-4">Loading recipe details...</p>}
          {error && (
            <div className="text-sm text-red-600 bg-red-50 rounded-lg p-3">{error}</div>
          )}
          {detail && !loading && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                {detail.readyInMinutes && (
                  <span>⏱ {detail.readyInMinutes} min</span>
                )}
                {detail.servings && <span>🍽 {detail.servings} servings</span>}
                {detail.sourceUrl && (
                  <a
                    href={detail.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:underline"
                  >
                    View Source ↗
                  </a>
                )}
              </div>

              {detail.summary && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-1">Summary</h4>
                  <p className="text-sm text-gray-600 line-clamp-4">{detail.summary}</p>
                </div>
              )}

              {detail.ingredients && detail.ingredients.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Ingredients</h4>
                  <ul className="grid grid-cols-2 gap-1">
                    {detail.ingredients.map((ing, i) => (
                      <li key={i} className="text-xs text-gray-600 flex items-start gap-1">
                        <span className="text-primary-400 mt-0.5">•</span>
                        {ing.original}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {detail.instructions && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-1">Instructions</h4>
                  <p className="text-sm text-gray-600 whitespace-pre-line leading-relaxed">
                    {detail.instructions}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
