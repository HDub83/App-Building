const express = require('express');
const router = express.Router();
const { searchProducts } = require('../services/kroger');

// GET /api/prices/search?q=milk&locationId=...
router.get('/search', async (req, res) => {
  try {
    const { q, locationId } = req.query;

    if (!q) {
      return res.status(400).json({ error: 'Search query "q" is required' });
    }

    if (!process.env.KROGER_CLIENT_ID || !process.env.KROGER_CLIENT_SECRET) {
      return res.status(503).json({
        error: 'Kroger API is not configured. Please add KROGER_CLIENT_ID and KROGER_CLIENT_SECRET to your .env file.',
        products: []
      });
    }

    const products = await searchProducts(q, locationId);
    res.json({ products });
  } catch (err) {
    console.error('Kroger API error:', err.message);

    if (err.response) {
      return res.status(err.response.status).json({
        error: `Kroger API error: ${err.response.data?.error_description || err.message}`,
        products: []
      });
    }

    res.status(500).json({ error: err.message, products: [] });
  }
});

module.exports = router;
