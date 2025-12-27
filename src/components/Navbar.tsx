import { Link, useLocation } from "react-router-dom";
import { useRole } from "../context/RoleContext";
import { useState } from "react";

function Navbar() {
  const { pathname } = useLocation();
  const { role, setRole } = useRole();
  const [open, setOpen] = useState(false);

  const linkClass = (path: string) =>
    `relative px-3 py-2 text-sm font-medium transition-all duration-300 ${
      pathname === path
        ? "text-teal-300"
        : "text-slate-300 hover:text-white"
    }`;

  return (
    <header className="sticky top-0 z-50">
      {/* MOVING GRADIENT BAR */}
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

            {/* MODE SWITCH */}
            <div className="relative">
              <button
                onClick={() => setOpen((o) => !o)}
                className="
                  ml-4 flex items-center gap-3
                  px-4 py-1.5 rounded-full
                  border border-red-500/70
                  bg-red-500/20
                  animate-heartbeat
                  text-red-300 text-xs font-semibold
                "
              >
                Mode
                <span className="opacity-70">
                  {role === "citizen" ? "Citizen" : "Responder"}
                </span>
              </button>

              {/* DROPDOWN */}
              {open && (
                <div
                  className="
                    absolute right-0 mt-3 w-48
                    rounded-xl overflow-hidden
                    bg-[#020617] border border-white/10
                    shadow-2xl
                    animate-fade-up
                  "
                >
                  {/* Citizen */}
                  <button
                    onClick={() => {
                      setRole("citizen");
                      setOpen(false);
                    }}
                    className={`
                      w-full px-4 py-3 flex items-center gap-3 text-left
                      transition
                      ${
                        role === "citizen"
                          ? "bg-teal-500/20 text-teal-300"
                          : "text-slate-300 hover:bg-white/5"
                      }
                    `}
                  >
                    <span className="text-lg">🧑</span>
                    <div>
                      <p className="text-sm font-medium">Citizen</p>
                      <p className="text-xs text-slate-400">
                        Report emergencies
                      </p>
                    </div>
                  </button>

                  {/* Responder */}
                  <button
                    onClick={() => {
                      setRole("responder");
                      setOpen(false);
                    }}
                    className={`
                      w-full px-4 py-3 flex items-center gap-3 text-left
                      transition
                      ${
                        role === "responder"
                          ? "bg-red-500/20 text-red-300"
                          : "text-slate-300 hover:bg-white/5"
                      }
                    `}
                  >
                    <span className="text-lg">🧑‍✈️</span>
                    <div>
                      <p className="text-sm font-medium">Responder</p>
                      <p className="text-xs text-slate-400">
                        Manage incidents
                      </p>
                    </div>
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
