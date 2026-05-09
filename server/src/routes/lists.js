const express = require('express');
const router = express.Router();
const db = require('../db/database');

// GET /api/lists — all lists with total cost and budget
router.get('/', (req, res) => {
  try {
    const lists = db.prepare(`
      SELECT
        gl.id,
        gl.name,
        gl.budget,
        gl.created_at,
        COUNT(gi.id) AS item_count,
        COALESCE(SUM(gi.price * gi.quantity), 0) AS total_cost
      FROM grocery_lists gl
      LEFT JOIN grocery_items gi ON gi.list_id = gl.id
      GROUP BY gl.id
      ORDER BY gl.created_at DESC
    `).all();

    res.json(lists);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/lists — create list
router.post('/', (req, res) => {
  try {
    const { name, budget = 0 } = req.body;
    if (!name) return res.status(400).json({ error: 'List name is required' });

    const result = db.prepare('INSERT INTO grocery_lists (name, budget) VALUES (?, ?)').run(name, budget);
    const list = db.prepare('SELECT * FROM grocery_lists WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/lists/:id — list + all items
router.get('/:id', (req, res) => {
  try {
    const list = db.prepare('SELECT * FROM grocery_lists WHERE id = ?').get(req.params.id);
    if (!list) return res.status(404).json({ error: 'List not found' });

    const items = db.prepare('SELECT * FROM grocery_items WHERE list_id = ? ORDER BY id ASC').all(req.params.id);
    const totalCost = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    res.json({ ...list, items, total_cost: totalCost });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/lists/:id — update name or budget
router.put('/:id', (req, res) => {
  try {
    const list = db.prepare('SELECT * FROM grocery_lists WHERE id = ?').get(req.params.id);
    if (!list) return res.status(404).json({ error: 'List not found' });

    const { name = list.name, budget = list.budget } = req.body;
    db.prepare('UPDATE grocery_lists SET name = ?, budget = ? WHERE id = ?').run(name, budget, req.params.id);
    const updated = db.prepare('SELECT * FROM grocery_lists WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/lists/:id
router.delete('/:id', (req, res) => {
  try {
    const list = db.prepare('SELECT * FROM grocery_lists WHERE id = ?').get(req.params.id);
    if (!list) return res.status(404).json({ error: 'List not found' });

    db.prepare('DELETE FROM grocery_lists WHERE id = ?').run(req.params.id);
    res.json({ message: 'List deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/lists/:id/items — add item
router.post('/:id/items', (req, res) => {
  try {
    const list = db.prepare('SELECT * FROM grocery_lists WHERE id = ?').get(req.params.id);
    if (!list) return res.status(404).json({ error: 'List not found' });

    const { name, quantity = 1, unit = 'each', price = 0, kroger_product_id = null } = req.body;
    if (!name) return res.status(400).json({ error: 'Item name is required' });

    const result = db.prepare(
      'INSERT INTO grocery_items (list_id, name, quantity, unit, price, kroger_product_id) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(req.params.id, name, quantity, unit, price, kroger_product_id);

    const item = db.prepare('SELECT * FROM grocery_items WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/lists/:id/items/:itemId — update item
router.put('/:id/items/:itemId', (req, res) => {
  try {
    const item = db.prepare('SELECT * FROM grocery_items WHERE id = ? AND list_id = ?').get(req.params.itemId, req.params.id);
    if (!item) return res.status(404).json({ error: 'Item not found' });

    const {
      name = item.name,
      quantity = item.quantity,
      unit = item.unit,
      price = item.price,
      checked = item.checked,
      kroger_product_id = item.kroger_product_id
    } = req.body;

    db.prepare(
      'UPDATE grocery_items SET name = ?, quantity = ?, unit = ?, price = ?, checked = ?, kroger_product_id = ? WHERE id = ?'
    ).run(name, quantity, unit, price, checked ? 1 : 0, kroger_product_id, req.params.itemId);

    const updated = db.prepare('SELECT * FROM grocery_items WHERE id = ?').get(req.params.itemId);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/lists/:id/items/:itemId
router.delete('/:id/items/:itemId', (req, res) => {
  try {
    const item = db.prepare('SELECT * FROM grocery_items WHERE id = ? AND list_id = ?').get(req.params.itemId, req.params.id);
    if (!item) return res.status(404).json({ error: 'Item not found' });

    db.prepare('DELETE FROM grocery_items WHERE id = ?').run(req.params.itemId);
    res.json({ message: 'Item deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
