# Grocery Budget Tracker

A full-stack app to help you manage grocery budgets, track spending, and discover budget-friendly recipes.

## Tech Stack

- **Backend**: Node.js + Express, SQLite (better-sqlite3), dotenv, cors, axios
- **Frontend**: React + Vite, React Router v6, TailwindCSS

## Features

1. **Grocery Lists** — Create and manage multiple grocery lists
2. **Budget Tracking** — Set a budget per list and see spending in real time
3. **Price Search** — Search Kroger API for real grocery prices and add items directly
4. **Recipe Suggestions** — Get recipe ideas from Spoonacular based on your ingredients
5. **My Recipes** — Create and save your own budget-friendly recipes with cost estimates

## Setup

### 1. Install dependencies

```bash
npm install --prefix server
npm install --prefix client
```

### 2. Configure environment

Copy the example env file and add your API keys:

```bash
cp server/.env.example server/.env
```

Edit `server/.env`:

```
PORT=3001
KROGER_CLIENT_ID=your_kroger_client_id
KROGER_CLIENT_SECRET=your_kroger_client_secret
SPOONACULAR_API_KEY=your_spoonacular_api_key
```

- **Kroger API**: Register at https://developer.kroger.com (free)
- **Spoonacular API**: Register at https://spoonacular.com/food-api (free tier: 150 points/day)

> The app works without API keys — price search and Spoonacular suggestions will show helpful error messages, but all other features (lists, budgets, custom recipes) work without them.

### 3. Start the servers

```bash
# Terminal 1 — Backend
cd server && npm run dev

# Terminal 2 — Frontend
cd client && npm run dev
```

Open http://localhost:5173

## Project Structure

```
├── server/
│   ├── src/
│   │   ├── routes/       # Express route handlers
│   │   ├── services/     # Kroger & Spoonacular API clients
│   │   ├── db/           # SQLite setup & schema
│   │   └── index.js
│   └── .env.example
└── client/
    └── src/
        ├── components/   # Reusable UI components
        ├── pages/        # Route-level page components
        └── services/     # API client functions
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/lists | All grocery lists |
| POST | /api/lists | Create list |
| GET | /api/lists/:id | List with items |
| PUT | /api/lists/:id | Update list |
| DELETE | /api/lists/:id | Delete list |
| POST | /api/lists/:id/items | Add item |
| PUT | /api/lists/:id/items/:itemId | Update item |
| DELETE | /api/lists/:id/items/:itemId | Delete item |
| GET | /api/prices/search?q=milk | Search Kroger prices |
| GET | /api/recipes/suggest?ingredients=... | Spoonacular suggestions |
| GET | /api/recipes/user | User's custom recipes |
| POST | /api/recipes/user | Create recipe |
| PUT | /api/recipes/user/:id | Update recipe |
| DELETE | /api/recipes/user/:id | Delete recipe |
