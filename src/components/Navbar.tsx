import { Link, useLocation } from "react-router-dom";

function Navbar() {
  const { pathname } = useLocation();

  const linkClass = (path: string) =>
    `px-4 py-2 rounded-md text-sm font-semibold transition ${
      pathname === path
        ? "bg-red-600 text-white"
        : "text-gray-700 hover:bg-gray-100"
    }`;

  return (
    <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <div className="text-2xl font-bold text-red-600">
          🚨 Sentra
        </div>
        <nav className="flex gap-3">
          <Link to="/" className={linkClass("/")}>Home</Link>
          <Link to="/report" className={linkClass("/report")}>Report</Link>
          <Link to="/dashboard" className={linkClass("/dashboard")}>Dashboard</Link>
          <Link to="/map" className={linkClass("/map")}>Map</Link>

        </nav>
      </div>
    </header>
  );
}

export default Navbar;
