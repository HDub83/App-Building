const axios = require('axios');

let cachedToken = null;
let tokenExpiry = null;

async function getToken() {
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) return cachedToken;

  const clientId = process.env.KROGER_CLIENT_ID;
  const clientSecret = process.env.KROGER_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Kroger API credentials are not configured. Please set KROGER_CLIENT_ID and KROGER_CLIENT_SECRET in your .env file.');
  }

  const creds = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const res = await axios.post(
    'https://api.kroger.com/v1/connect/oauth2/token',
    'grant_type=client_credentials&scope=product.compact',
    {
      headers: {
        Authorization: `Basic ${creds}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }
  );

  cachedToken = res.data.access_token;
  tokenExpiry = Date.now() + (res.data.expires_in - 60) * 1000;
  return cachedToken;
}

async function searchProducts(term, locationId) {
  const token = await getToken();

  const params = { 'filter.term': term, 'filter.limit': 10 };
  if (locationId) params['filter.locationId'] = locationId;

  const res = await axios.get('https://api.kroger.com/v1/products', {
    headers: { Authorization: `Bearer ${token}` },
    params
  });

  return (res.data.data || []).map(p => ({
    id: p.productId,
    name: p.description,
    brand: p.brand,
    size: p.items?.[0]?.size,
    price: p.items?.[0]?.price?.regular ?? null,
    imageUrl: p.images?.[0]?.sizes?.find(s => s.size === 'thumbnail')?.url ?? null
  }));
}

module.exports = { searchProducts };
