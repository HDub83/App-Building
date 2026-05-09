import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import ListDetail from './pages/ListDetail';
import RecipesPage from './pages/RecipesPage';
import MyRecipes from './pages/MyRecipes';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-6xl mx-auto px-4 py-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/lists/:id" element={<ListDetail />} />
            <Route path="/recipes" element={<RecipesPage />} />
            <Route path="/my-recipes" element={<MyRecipes />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
