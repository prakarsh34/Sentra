import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";

function Navbar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  // Added 'user' and 'logout' from AuthContext
  const { user, role, setRole, logout } = useAuth(); 
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      setOpen(false);
      navigate("/login"); // Redirect to login after signing out
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const linkClass = (path: string) =>
    `relative px-3 py-2 text-sm font-medium transition-all duration-300 ${
      pathname === path
        ? "text-teal-300"
        : "text-slate-300 hover:text-white"
    }`;

  return (
    <header className="sticky top-0 z-50">
      <div className="
        backdrop-blur
        border-b border-white/5
        bg-gradient-to-r from-[#020617]/80 via-teal-900/30 to-[#020617]/80
        animate-gradient
      ">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

          {/* BRAND */}
          <Link
            to="/"
            className="flex items-center gap-2 text-slate-100 font-semibold tracking-wide"
          >
            <span className="text-lg">Sentra</span>
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
          </Link>

          {/* NAV */}
          <nav className="flex items-center gap-8 relative">
            <Link to="/" className={linkClass("/")}>Home</Link>

            {user && role === "citizen" && (
              <Link to="/report" className={linkClass("/report")}>
                Report
              </Link>
            )}

            {user && role === "responder" && (
              <>
                <Link to="/dashboard" className={linkClass("/dashboard")}>
                  Dashboard
                </Link>
                <Link to="/map" className={linkClass("/map")}>
                  Map
                </Link>
              </>
            )}

            {/* AUTH / MODE SWITCH */}
            <div className="relative">
              {user ? (
                <button
                  onClick={() => setOpen((o) => !o)}
                  className="
                    ml-4 flex items-center gap-3
                    px-4 py-1.5 rounded-full
                    border border-white/10
                    bg-white/5 hover:bg-white/10
                    transition-all
                    text-slate-200 text-xs font-semibold
                  "
                >
                  <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                  {role === "citizen" ? "Citizen Mode" : "Responder Mode"}
                </button>
              ) : (
                <Link 
                  to="/login"
                  className="px-5 py-1.5 rounded-full bg-teal-500 text-[#020617] text-xs font-bold hover:bg-teal-400 transition"
                >
                  Sign In
                </Link>
              )}

              {/* DROPDOWN */}
              {open && user && (
                <div
                  className="
                    absolute right-0 mt-3 w-56
                    rounded-xl overflow-hidden
                    bg-[#020617] border border-white/10
                    shadow-2xl
                    animate-fade-up
                  "
                >
                  <div className="px-4 py-2 border-b border-white/5">
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Account</p>
                    <p className="text-xs text-slate-300 truncate">{user.email}</p>
                  </div>

                  {/* Citizen Toggle */}
                  <button
                    onClick={() => { setRole("citizen"); setOpen(false); }}
                    className={`w-full px-4 py-3 flex items-center gap-3 text-left transition ${role === "citizen" ? "bg-teal-500/10 text-teal-300" : "text-slate-400 hover:bg-white/5"}`}
                  >
                    <span>🧑</span>
                    <span className="text-sm font-medium">Switch to Citizen</span>
                  </button>

                  {/* Responder Toggle */}
                  <button
                    onClick={() => { setRole("responder"); setOpen(false); }}
                    className={`w-full px-4 py-3 flex items-center gap-3 text-left transition ${role === "responder" ? "bg-red-500/10 text-red-300" : "text-slate-400 hover:bg-white/5"}`}
                  >
                    <span>🧑‍✈️</span>
                    <span className="text-sm font-medium">Switch to Responder</span>
                  </button>

                  {/* LOGOUT BUTTON */}
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-3 flex items-center gap-3 text-left text-red-400 hover:bg-red-500/10 transition border-t border-white/5"
                  >
                    <span>🚪</span>
                    <span className="text-sm font-medium">Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}

export default Navbar;