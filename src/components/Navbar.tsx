import { Link, useLocation } from "react-router-dom";
import { useRole } from "../context/RoleContext";

function Navbar() {
  const { pathname } = useLocation();
  const { role, setRole } = useRole();

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

        <nav className="flex items-center gap-3">
          <Link to="/" className={linkClass("/")}>Home</Link>

          {role === "citizen" && (
            <Link to="/report" className={linkClass("/report")}>
              Report
            </Link>
          )}

          {role === "responder" && (
            <>
              <Link to="/dashboard" className={linkClass("/dashboard")}>
                Dashboard
              </Link>
              <Link to="/map" className={linkClass("/map")}>
                Map
              </Link>
            </>
          )}

          {/* ROLE SWITCH (DEMO ONLY) */}
          <select
            value={role}
            onChange={(e) =>
              setRole(e.target.value as "citizen" | "responder")
            }
            className="ml-4 border rounded px-2 py-1 text-sm"
          >
            <option value="citizen">Citizen</option>
            <option value="responder">Responder</option>
          </select>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
