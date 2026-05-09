import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: BASE_URL,
});

// ---- Grocery Lists ----

export async function getLists() {
  const res = await api.get('/api/lists');
  return res.data;
}

export async function createList(data) {
  const res = await api.post('/api/lists', data);
  return res.data;
}

export async function getList(id) {
  const res = await api.get(`/api/lists/${id}`);
  return res.data;
}

export async function updateList(id, data) {
  const res = await api.put(`/api/lists/${id}`, data);
  return res.data;
}

export async function deleteList(id) {
  const res = await api.delete(`/api/lists/${id}`);
  return res.data;
}

// ---- Grocery Items ----

export async function addItem(listId, data) {
  const res = await api.post(`/api/lists/${listId}/items`, data);
  return res.data;
}

export async function updateItem(listId, itemId, data) {
  const res = await api.put(`/api/lists/${listId}/items/${itemId}`, data);
  return res.data;
}

export async function deleteItem(listId, itemId) {
  const res = await api.delete(`/api/lists/${listId}/items/${itemId}`);
  return res.data;
}

// ---- Prices ----

export async function searchPrices(q, locationId) {
  const params = { q };
  if (locationId) params.locationId = locationId;
  const res = await api.get('/api/prices/search', { params });
  return res.data;
}

// ---- Recipes (Spoonacular) ----

export async function suggestRecipes(ingredients, maxCost, number = 6) {
  const params = { ingredients, number };
  if (maxCost) params.maxCost = maxCost;
  const res = await api.get('/api/recipes/suggest', { params });
  return res.data;
}

export async function getRecipeDetail(id) {
  const res = await api.get(`/api/recipes/suggest/${id}`);
  return res.data;
}

// ---- User Recipes ----

export async function getUserRecipes() {
  const res = await api.get('/api/recipes/user');
  return res.data;
}

export async function createUserRecipe(data) {
  const res = await api.post('/api/recipes/user', data);
  return res.data;
}

export async function getUserRecipe(id) {
  const res = await api.get(`/api/recipes/user/${id}`);
  return res.data;
}

export async function updateUserRecipe(id, data) {
  const res = await api.put(`/api/recipes/user/${id}`, data);
  return res.data;
}

export async function deleteUserRecipe(id) {
  const res = await api.delete(`/api/recipes/user/${id}`);
  return res.data;
}
