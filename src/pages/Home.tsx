import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Home() {
  const { user, role, loading } = useAuth();

  return (
    <main className="bg-[#020617] text-slate-100 overflow-x-hidden">

      {/* ================= HERO : SPLIT CAVITY ================= */}
      <section className="min-h-screen relative flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-slate-900 to-black animate-gradient" />
        <div className="absolute right-[-25%] top-[-15%] w-[900px] h-[900px] rounded-full bg-white shadow-[inset_0_0_120px_rgba(0,0,0,0.25)]" />
        <div className="absolute right-[-30%] top-[-20%] w-[1100px] h-[1100px] rounded-full bg-emerald-700 blur-3xl animate-gradient" />

        <div className="relative z-10 max-w-7xl mx-auto px-8 grid md:grid-cols-2 gap-20 items-center">
          <div>
            <p className="text-xs tracking-[0.35em] uppercase text-teal-400 mb-6 animate-text-in">
              Emergency Intelligence Platform
            </p>

            <h1 className="text-5xl md:text-6xl font-semibold leading-tight mb-10 text-white animate-text-in animate-delay-1">
              Calm decisions <br /> emerge from clarity
            </h1>

            <p className="text-lg text-white leading-relaxed mb-10 max-w-xl animate-text-in animate-delay-2">
              Sentra is a real-time emergency intelligence system designed to
              reduce noise, verify signals, and guide responders toward what
              truly matters.
            </p>

            <div className="flex flex-wrap gap-6 animate-text-in animate-delay-4">
              {!loading && user ? (
                <>
                  <Link
                    to="/report"
                    className="px-8 py-4 rounded-full bg-teal-500 text-slate-900 font-bold hover:bg-teal-400 transition shadow-lg shadow-teal-500/20"
                  >
                    Report Incident
                  </Link>
                  <Link
                    to="/operations"
                    className="px-8 py-4 rounded-full border border-slate-500 text-slate-200 hover:bg-white/5 transition"
                  >
                    Operations View
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-8 py-4 rounded-full bg-white text-slate-900 font-bold hover:bg-slate-200 transition"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="px-8 py-4 rounded-full border border-teal-500/50 text-teal-400 font-medium hover:bg-teal-500/10 transition"
                  >
                    Join the Network
                  </Link>
                </>
              )}
            </div>

            {!loading && user && (
              <p className="mt-8 text-xs text-slate-500 font-mono tracking-widest uppercase flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                Active Session: <span className="text-teal-400">{role}</span>
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ================= PHILOSOPHY : THE NOISE PROBLEM ================= */}
      <section className="py-32 bg-white text-[#020617]">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid md:grid-cols-3 gap-16">
            <div className="col-span-2">
              <h2 className="text-4xl font-bold mb-8 leading-tight">
                In a crisis, the bottleneck isn't <br /> 
                effort—it is verified intelligence.
              </h2>
              <p className="text-xl text-slate-600 leading-relaxed">
                Most emergency systems are built for data collection, not decision making. 
                They overwhelm responders with raw, unverified reports that create "fog of war." 
                Sentra flips this hierarchy. We treat every report as a raw signal that must be 
                processed, weighted, and cross-referenced before it reaches the dispatcher.
              </p>
            </div>
            <div className="flex flex-col justify-end">
              <div className="p-8 bg-slate-100 rounded-3xl border border-slate-200">
                <p className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4">Core Metric</p>
                <p className="text-4xl font-bold text-teal-600">84%</p>
                <p className="text-slate-600 text-sm mt-2">Reduction in dispatch cognitive load through signal prioritization.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= THE ARCHITECTURE ================= */}
      <section className="py-32 bg-[#020617] border-y border-white/5">
        <div className="max-w-7xl mx-auto px-8">
          <div className="mb-24">
            <p className="text-teal-400 font-mono text-xs uppercase tracking-[0.3em] mb-4">Platform Capabilities</p>
            <h2 className="text-4xl font-bold text-white">Engineered for Extremes</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="p-10 rounded-3xl bg-white/5 border border-white/10 hover:border-teal-500/50 transition-colors group">
              <div className="text-3xl mb-6">🛰️</div>
              <h3 className="text-xl font-bold mb-4">Spatial Truth</h3>
              <p className="text-slate-400 leading-relaxed">
                Beyond simple coordinates. Sentra utilizes multi-point trilateration to 
                verify the physical presence of a reporter, ensuring the incident isn't 
                just "at a location," but that the observer is actually there.
              </p>
            </div>

            <div className="p-10 rounded-3xl bg-white/5 border border-white/10 hover:border-teal-500/50 transition-colors group">
              <div className="text-3xl mb-6">🧠</div>
              <h3 className="text-xl font-bold mb-4">Priority Logic</h3>
              <p className="text-slate-400 leading-relaxed">
                Our proprietary algorithm weights severity based on time-decay, 
                cluster density, and reporter reputation. A lone signal is a warning; 
                a verified cluster is an emergency.
              </p>
            </div>

            <div className="p-10 rounded-3xl bg-white/5 border border-white/10 hover:border-teal-500/50 transition-colors group">
              <div className="text-3xl mb-6">🛡️</div>
              <h3 className="text-xl font-bold mb-4">Zero-Trust Intake</h3>
              <p className="text-slate-400 leading-relaxed">
                In high-stress zones, misinformation is as dangerous as the crisis. 
                Sentra's intake system requires minimal interaction to maximize speed 
                while capturing high-fidelity metadata.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= WRITTEN CONTENT : THE SENTRA DIFFERENCE ================= */}
      <section className="py-32 bg-slate-50 text-slate-900">
        <div className="max-w-5xl mx-auto px-8">
          <h2 className="text-3xl font-bold mb-12 text-center">Beyond the Dashboard</h2>
          <div className="space-y-12 text-lg text-slate-600 leading-relaxed">
            <p>
              Sentra was born from the observation that modern communication technology has actually made 
              emergency response <span className="text-slate-900 font-semibold italic">harder</span>. While everyone 
              has a smartphone, the volume of social media noise and fragmented messaging during an event 
              often delays the arrival of official help.
            </p>
            <p>
              Our platform serves as a <strong>Universal Signal Layer</strong>. Whether it is a citizen using 
              their mobile device to report a fire or a responder managing a complex multi-agency evacuation, 
              Sentra provides a single source of operational truth. We believe that in the first ten minutes of 
              an emergency, <strong>clarity is more valuable than resources.</strong>
            </p>
            <div className="grid md:grid-cols-2 gap-8 pt-8">
              <div className="border-l-4 border-teal-500 pl-6">
                <h4 className="font-bold text-slate-900 mb-2">For Citizens</h4>
                <p className="text-sm">A frictionless way to contribute to public safety without the need for complex calls or apps. Rapid, anonymous, and location-aware.</p>
              </div>
              <div className="border-l-4 border-indigo-500 pl-6">
                <h4 className="font-bold text-slate-900 mb-2">For Responders</h4>
                <p className="text-sm">A military-grade operational surface that visualizes threats, manages resource allocation, and tracks incident resolution in real-time.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= CLOSING ================= */}
      <section className="min-h-[60vh] bg-[#020617] flex items-center justify-center text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-teal-500/5 mix-blend-overlay" />
        <div className="max-w-4xl px-8 animate-text-in relative z-10">
          <h2 className="text-5xl font-semibold mb-8">
            The infrastructure of <br /> public trust
          </h2>
          <p className="text-lg text-slate-400 mb-14 max-w-2xl mx-auto">
            Sentra isn't just a tool; it's the layer where community vigilance 
            meets professional response. Join the intelligence-led safety movement.
          </p>

          <div className="flex justify-center gap-6">
            {!user ? (
              <Link
                to="/register"
                className="px-10 py-4 rounded-full bg-teal-500 text-slate-900 font-bold hover:bg-teal-400 transition"
              >
                Create Account
              </Link>
            ) : (
              <Link
                to={role === "citizen" ? "/report" : "/dashboard"}
                className="px-10 py-4 rounded-full bg-teal-500 text-slate-900 font-bold hover:bg-teal-400 transition"
              >
                Access System
              </Link>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

export default Home;