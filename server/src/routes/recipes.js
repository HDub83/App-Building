const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { findByIngredients, getRecipeInfo } = require('../services/spoonacular');

// GET /api/recipes/suggest?ingredients=milk,eggs,bread&maxCost=20
router.get('/suggest', async (req, res) => {
  try {
    const { ingredients, maxCost, number = 6 } = req.query;

    if (!ingredients) {
      return res.status(400).json({ error: 'ingredients query param is required (comma-separated)' });
    }

    if (!process.env.SPOONACULAR_API_KEY) {
      return res.status(503).json({
        error: 'Spoonacular API is not configured. Please add SPOONACULAR_API_KEY to your .env file.',
        recipes: []
      });
    }

    const ingredientList = ingredients.split(',').map(s => s.trim()).filter(Boolean);
    const recipes = await findByIngredients(ingredientList, parseInt(number, 10));

    res.json({ recipes });
  } catch (err) {
    console.error('Spoonacular API error:', err.message);

    if (err.response) {
      return res.status(err.response.status).json({
        error: `Spoonacular API error: ${err.response.data?.message || err.message}`,
        recipes: []
      });
    }

    res.status(500).json({ error: err.message, recipes: [] });
  }
});

// GET /api/recipes/suggest/:id — get full recipe details from Spoonacular
router.get('/suggest/:id', async (req, res) => {
  try {
    if (!process.env.SPOONACULAR_API_KEY) {
      return res.status(503).json({
        error: 'Spoonacular API is not configured. Please add SPOONACULAR_API_KEY to your .env file.'
      });
    }

    const recipe = await getRecipeInfo(req.params.id);
    res.json(recipe);
  } catch (err) {
    console.error('Spoonacular API error:', err.message);

    if (err.response) {
      return res.status(err.response.status).json({
        error: `Spoonacular API error: ${err.response.data?.message || err.message}`
      });
    }

    res.status(500).json({ error: err.message });
  }
});

// GET /api/recipes/user — all user's custom recipes with ingredients
router.get('/user', (req, res) => {
  try {
    const recipes = db.prepare('SELECT * FROM user_recipes ORDER BY created_at DESC').all();
    const result = recipes.map(recipe => {
      const ingredients = db.prepare('SELECT * FROM recipe_ingredients WHERE recipe_id = ?').all(recipe.id);
      return { ...recipe, ingredients };
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/recipes/user — create recipe
router.post('/user', (req, res) => {
  try {
    const { title, description, servings = 4, estimated_cost = 0, instructions, ingredients = [] } = req.body;
    if (!title) return res.status(400).json({ error: 'Recipe title is required' });

    const insertRecipe = db.transaction(() => {
      const result = db.prepare(
        'INSERT INTO user_recipes (title, description, servings, estimated_cost, instructions) VALUES (?, ?, ?, ?, ?)'
      ).run(title, description, servings, estimated_cost, instructions);

      const recipeId = result.lastInsertRowid;

      for (const ing of ingredients) {
        db.prepare(
          'INSERT INTO recipe_ingredients (recipe_id, name, quantity, unit, estimated_price) VALUES (?, ?, ?, ?, ?)'
        ).run(recipeId, ing.name, ing.quantity ?? 1, ing.unit ?? 'each', ing.estimated_price ?? 0);
      }

      return recipeId;
    });

    const recipeId = insertRecipe();
    const recipe = db.prepare('SELECT * FROM user_recipes WHERE id = ?').get(recipeId);
    const recipeIngredients = db.prepare('SELECT * FROM recipe_ingredients WHERE recipe_id = ?').all(recipeId);
    res.status(201).json({ ...recipe, ingredients: recipeIngredients });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/recipes/user/:id
router.get('/user/:id', (req, res) => {
  try {
    const recipe = db.prepare('SELECT * FROM user_recipes WHERE id = ?').get(req.params.id);
    if (!recipe) return res.status(404).json({ error: 'Recipe not found' });

    const ingredients = db.prepare('SELECT * FROM recipe_ingredients WHERE recipe_id = ?').all(req.params.id);
    res.json({ ...recipe, ingredients });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/recipes/user/:id
router.put('/user/:id', (req, res) => {
  try {
    const recipe = db.prepare('SELECT * FROM user_recipes WHERE id = ?').get(req.params.id);
    if (!recipe) return res.status(404).json({ error: 'Recipe not found' });

    const {
      title = recipe.title,
      description = recipe.description,
      servings = recipe.servings,
      estimated_cost = recipe.estimated_cost,
      instructions = recipe.instructions,
      ingredients
    } = req.body;

    const updateRecipe = db.transaction(() => {
      db.prepare(
        'UPDATE user_recipes SET title = ?, description = ?, servings = ?, estimated_cost = ?, instructions = ? WHERE id = ?'
      ).run(title, description, servings, estimated_cost, instructions, req.params.id);

      if (ingredients !== undefined) {
        db.prepare('DELETE FROM recipe_ingredients WHERE recipe_id = ?').run(req.params.id);
        for (const ing of ingredients) {
          db.prepare(
            'INSERT INTO recipe_ingredients (recipe_id, name, quantity, unit, estimated_price) VALUES (?, ?, ?, ?, ?)'
          ).run(req.params.id, ing.name, ing.quantity ?? 1, ing.unit ?? 'each', ing.estimated_price ?? 0);
        }
      }
    });

    updateRecipe();

    const updated = db.prepare('SELECT * FROM user_recipes WHERE id = ?').get(req.params.id);
    const updatedIngredients = db.prepare('SELECT * FROM recipe_ingredients WHERE recipe_id = ?').all(req.params.id);
    res.json({ ...updated, ingredients: updatedIngredients });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/recipes/user/:id
router.delete('/user/:id', (req, res) => {
  try {
    const recipe = db.prepare('SELECT * FROM user_recipes WHERE id = ?').get(req.params.id);
    if (!recipe) return res.status(404).json({ error: 'Recipe not found' });

    db.prepare('DELETE FROM user_recipes WHERE id = ?').run(req.params.id);
    res.json({ message: 'Recipe deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
