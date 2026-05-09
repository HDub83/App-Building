const axios = require('axios');

async function findByIngredients(ingredients, number = 6) {
  const apiKey = process.env.SPOONACULAR_API_KEY;

  if (!apiKey) {
    throw new Error('Spoonacular API key is not configured. Please set SPOONACULAR_API_KEY in your .env file.');
  }

  const res = await axios.get('https://api.spoonacular.com/recipes/findByIngredients', {
    params: {
      ingredients: ingredients.join(','),
      number,
      apiKey,
      ignorePantry: true,
      ranking: 1
    }
  });

  return res.data.map(r => ({
    id: r.id,
    title: r.title,
    image: r.image,
    usedIngredients: r.usedIngredients?.length ?? 0,
    missedIngredients: r.missedIngredients?.length ?? 0,
    missedIngredientNames: r.missedIngredients?.map(i => i.name) ?? []
  }));
}

async function getRecipeInfo(id) {
  const apiKey = process.env.SPOONACULAR_API_KEY;

  if (!apiKey) {
    throw new Error('Spoonacular API key is not configured. Please set SPOONACULAR_API_KEY in your .env file.');
  }

  const res = await axios.get(`https://api.spoonacular.com/recipes/${id}/information`, {
    params: {
      apiKey,
      includeNutrition: false
    }
  });

  const r = res.data;
  return {
    id: r.id,
    title: r.title,
    image: r.image,
    servings: r.servings,
    readyInMinutes: r.readyInMinutes,
    summary: r.summary?.replace(/<[^>]*>/g, ''),
    instructions: r.instructions?.replace(/<[^>]*>/g, ''),
    ingredients: r.extendedIngredients?.map(i => ({
      name: i.name,
      amount: i.amount,
      unit: i.unit,
      original: i.original
    })) ?? [],
    sourceUrl: r.sourceUrl
  };
}

module.exports = { findByIngredients, getRecipeInfo };
