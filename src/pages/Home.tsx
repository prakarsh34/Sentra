import { Link } from "react-router-dom";
import { useRole } from "../context/RoleContext";

function Home() {
  const { setRole } = useRole();

  return (
    <main className="bg-[#020617] text-slate-100 overflow-x-hidden">

      {/* ================= HERO : SPLIT CAVITY ================= */}
      <section className="min-h-screen relative flex items-center overflow-hidden">
        {/* MOVING DEPTH BACKGROUND */}
        <div
          className="
            absolute inset-0
            bg-gradient-to-br from-indigo-900 via-slate-900 to-black
            animate-gradient
          "
        />

        {/* WHITE CAVITY */}
        <div className="absolute right-[-25%] top-[-15%] w-[900px] h-[900px] rounded-full bg-white shadow-[inset_0_0_120px_rgba(0,0,0,0.25)]" />
        <div className="absolute right-[-30%] top-[-20%] w-[1100px] h-[1100px] rounded-full bg-teal-400/20 blur-3xl animate-gradient" />

        {/* CONTENT */}
        <div className="relative z-10 max-w-7xl mx-auto px-8 grid md:grid-cols-2 gap-20 items-center">
          <div>
            <p className="text-xs tracking-[0.35em] uppercase text-teal-400 mb-6 animate-text-in">
              Emergency Intelligence Platform
            </p>

            <h1 className="text-5xl md:text-6xl font-semibold leading-tight mb-10 animate-text-in animate-delay-1">
              Calm decisions <br /> emerge from clarity
            </h1>

            <p className="text-lg text-slate-300 leading-relaxed mb-10 max-w-xl animate-text-in animate-delay-2">
              Sentra is a real-time emergency intelligence system designed to
              reduce noise, verify signals, and guide responders toward what
              truly matters.
            </p>

            <p className="text-slate-400 leading-relaxed mb-14 max-w-xl animate-text-in animate-delay-3">
              Built for high-stress environments, Sentra transforms fragmented
              citizen reports and sensor inputs into a single, explainable
              operational surface.
            </p>

            <div className="flex gap-6 animate-text-in animate-delay-4">
              {/* FORCE CITIZEN MODE */}
              <Link
                to="/report"
                onClick={() => setRole("citizen")}
                className="px-8 py-4 rounded-full bg-teal-500 text-slate-900 font-medium hover:bg-teal-400 transition"
              >
                Report an Incident
              </Link>

             <Link
  to="/operations"
  onClick={() => setRole("responder")}
  className="px-8 py-4 rounded-full border border-slate-500 text-slate-200 hover:bg-white/5 transition"
>
  Operations View
</Link>

            </div>
          </div>

          <div />
        </div>
      </section>

      {/* ================= THINKING / ANALYSIS ================= */}
      <section className="relative overflow-hidden text-slate-800">
        <div
          className="
            absolute inset-0
            bg-gradient-to-br from-[#F4F7FB] via-[#EEF2FF] to-[#F4F7FB]
            animate-gradient
          "
        />
        <div className="absolute -left-40 top-40 w-[500px] h-[500px] rounded-full bg-indigo-200/30 blur-3xl animate-gradient" />

        <div className="relative max-w-7xl mx-auto px-8 py-48 grid md:grid-cols-2 gap-24">
          <div className="space-y-24">
            <h2 className="text-5xl font-semibold leading-tight animate-text-in">
              Emergency response <br /> fails quietly
            </h2>

            <p className="text-xl text-slate-500 leading-[1.9] max-w-md animate-text-in animate-delay-1">
              Not because of lack of effort — but because information arrives
              without structure, clarity, or prioritization.
            </p>
          </div>

          <div className="space-y-32">
            <div className="animate-text-in animate-delay-1">
              <p className="text-xs tracking-[0.3em] uppercase text-teal-600 mb-4">
                The challenge
              </p>
              <h3 className="text-2xl font-semibold mb-4">
                Information without structure
              </h3>
              <p className="text-lg text-slate-600 leading-[1.9]">
                Multiple reports describe the same incident with conflicting
                details. Responders must act while filtering noise and
                misinformation.
              </p>
            </div>

            <div className="ml-10 animate-text-in animate-delay-2">
              <p className="text-xs tracking-[0.3em] uppercase text-teal-600 mb-4">
                The insight
              </p>
              <h3 className="text-2xl font-semibold mb-4">
                Urgency is contextual
              </h3>
              <ul className="text-lg text-slate-600 space-y-3 list-disc ml-6">
                <li>Severity</li>
                <li>Recency</li>
                <li>Verification</li>
                <li>Proximity</li>
              </ul>
            </div>

            <div className="animate-text-in animate-delay-3">
              <p className="text-xs tracking-[0.3em] uppercase text-teal-600 mb-4">
                The principle
              </p>
              <h3 className="text-2xl font-semibold mb-4">
                Designed for explainability
              </h3>
              <p className="text-lg text-slate-600 leading-[1.9]">
                Every incident is prioritized transparently so responders know{" "}
                <span className="font-medium text-slate-800">
                  not just what to do, but why.
                </span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= EXECUTION / FLOW ================= */}
      <section className="relative overflow-hidden text-slate-800">
        <div
          className="
            absolute inset-0
            bg-gradient-to-br from-[#F9FBFA] via-[#ECFEFF] to-[#F9FBFA]
            animate-gradient
          "
        />
        <div className="absolute right-[-200px] top-[200px] w-[600px] h-[600px] rounded-full bg-teal-200/20 blur-3xl animate-gradient" />

        <div className="relative max-w-7xl mx-auto px-8 py-48">
          <h2 className="text-4xl font-semibold mb-28 animate-text-in">
            How Sentra operates <br /> in real time
          </h2>

          <div className="space-y-32">
            {[
              ["01", "Incident reported", "Citizens submit reports in seconds with live location."],
              ["02", "Signal verification", "Reports are cross-checked using sensor-assisted logic."],
              ["03", "Priority calculated", "Severity, time, verification, and proximity are combined."],
              ["04", "Responder coordination", "Responders act via a live operational dashboard."],
              ["05", "Resolution & accountability", "Every action is tracked until closure."]
            ].map(([step, title, desc], i) => (
              <div
                key={step}
                className={`grid md:grid-cols-2 gap-20 items-start animate-text-in ${
                  i % 2 === 1 ? "md:pl-32 animate-delay-2" : "animate-delay-1"
                }`}
              >
                <div className="text-teal-500 text-6xl font-light">{step}</div>
                <div>
                  <h3 className="text-2xl font-semibold mb-4">{title}</h3>
                  <p className="text-lg text-slate-600 leading-relaxed max-w-md">
                    {desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= CLOSING ================= */}
      <section className="min-h-[70vh] bg-[#020617] flex items-center justify-center text-center">
        <div className="max-w-4xl px-8 animate-text-in">
          <h2 className="text-4xl font-semibold mb-8">
            A system, not a website
          </h2>
          <p className="text-lg text-slate-400 mb-14">
            Sentra is an emergency intelligence interface — designed to scale
            from prototype to real-world deployment.
          </p>

          <Link
            to="/report"
            onClick={() => setRole("citizen")}
            className="inline-block px-10 py-4 rounded-full bg-teal-500 text-slate-900 font-medium hover:bg-teal-400 transition"
          >
            Start a Report
          </Link>
        </div>
      </section>

    </main>
  );
}

export default Home;
