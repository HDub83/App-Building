import { Link, NavLink } from 'react-router-dom';

export default function Navbar() {
  const linkClass = ({ isActive }) =>
    `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'bg-primary-700 text-white'
        : 'text-primary-100 hover:bg-primary-700 hover:text-white'
    }`;

  return (
    <nav className="bg-primary-600 shadow-md">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 text-white font-bold text-xl">
            <span className="text-2xl">🛒</span>
            <span>Grocery Budget Tracker</span>
          </Link>
          <div className="flex items-center gap-1">
            <NavLink to="/" end className={linkClass}>
              Dashboard
            </NavLink>
            <NavLink to="/recipes" className={linkClass}>
              Recipes
            </NavLink>
            <NavLink to="/my-recipes" className={linkClass}>
              My Recipes
            </NavLink>
          </div>
        </div>
      </div>
    </nav>
  );
}
