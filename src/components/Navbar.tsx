import { Link, useLocation } from "react-router-dom";
import { useRole } from "../context/RoleContext";

function Navbar() {
  const { pathname } = useLocation();
  const { role, setRole } = useRole();

  const linkClass = (path: string) =>
    `relative px-3 py-2 text-sm font-medium transition-all duration-300 ${
      pathname === path
        ? "text-teal-300"
        : "text-slate-300 hover:text-white"
    }`;

  return (
    <header className="sticky top-0 z-50">
      {/* MOVING GRADIENT SYSTEM BAR */}
      <div
        className="
          backdrop-blur
          border-b border-white/5
          bg-gradient-to-r from-[#020617]/80 via-teal-900/30 to-[#020617]/80
          animate-gradient
        "
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

          {/* BRAND */}
          <Link
            to="/"
            className="flex items-center gap-2 text-slate-100 font-semibold tracking-wide"
          >
            <span className="text-lg">Sentra</span>
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
          </Link>

          {/* NAV LINKS */}
          <nav className="flex items-center gap-8">

            <Link to="/" className={linkClass("/")}>
              Home
            </Link>

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

            {/* MODE SWITCH — RED HEARTBEAT */}
            <div
              className="
                ml-4 flex items-center gap-3
                px-4 py-1.5 rounded-full
                border border-red-500/70
                bg-red-500/20
                animate-heartbeat
              "
            >
              <span className="text-[10px] uppercase tracking-widest text-red-300">
                Mode
              </span>

              <select
                value={role}
                onChange={(e) =>
                  setRole(e.target.value as "citizen" | "responder")
                }
                className="
                  bg-transparent
                  text-white
                  text-xs
                  font-semibold
                  focus:outline-none
                  cursor-pointer
                "
              >
                <option className="text-black" value="citizen">
                  Citizen
                </option>
                <option className="text-black" value="responder">
                  Responder
                </option>
              </select>
            </div>

          </nav>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
