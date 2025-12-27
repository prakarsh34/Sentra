import { useState } from "react";
import { createIncident } from "../services/incidents.service";

/* =====================
   TYPES
===================== */
type Severity = "Low" | "Medium" | "Critical";
type IncidentType = "Accident" | "Medical" | "Fire" | "Smog";

function Report() {
  const [type, setType] = useState<IncidentType | "">("");
  const [severity, setSeverity] = useState<Severity | "">("");
  const [submitting, setSubmitting] = useState(false);

  const submit = () => {
    if (!type || !severity) {
      alert("Please select incident type and severity.");
      return;
    }

    setSubmitting(true);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        await createIncident({
          type,
          severity,
          status: "Reported",
          location: {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          },
        });

        setType("");
        setSeverity("");
        setSubmitting(false);

        alert("Incident reported successfully. Help is on the way.");
      },
      () => {
        setSubmitting(false);
        alert("Unable to access location. Please enable GPS.");
      }
    );
  };

  return (
    <main className="min-h-screen bg-[#020617] flex items-center justify-center px-6">
      <div
        className="
          w-full max-w-md
          bg-white/5 backdrop-blur
          border border-white/10
          rounded-2xl p-8
        "
      >
        {/* HEADER */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-slate-100 mb-2">
            Report an Incident
          </h2>
          <p className="text-sm text-slate-400">
            Share what you’re seeing. We’ll handle the rest.
          </p>
        </div>

        {/* INCIDENT TYPE */}
        <div className="mb-5">
          <label className="block text-xs uppercase tracking-widest text-slate-400 mb-2">
            Incident type
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as IncidentType)}
            className="
              w-full rounded-lg px-4 py-3
              bg-[#020617] text-slate-100
              border border-white/10
              focus:outline-none focus:ring-2 focus:ring-teal-400
            "
          >
            <option value="">Select type</option>
            <option value="Accident">Accident</option>
            <option value="Medical">Medical</option>
            <option value="Fire">Fire</option>
            <option value="Smog">Smog</option>
          </select>
        </div>

        {/* SEVERITY */}
        <div className="mb-8">
          <label className="block text-xs uppercase tracking-widest text-slate-400 mb-2">
            Severity
          </label>
          <select
            value={severity}
            onChange={(e) => setSeverity(e.target.value as Severity)}
            className="
              w-full rounded-lg px-4 py-3
              bg-[#020617] text-slate-100
              border border-white/10
              focus:outline-none focus:ring-2 focus:ring-red-400
            "
          >
            <option value="">Select severity</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="Critical">Critical</option>
          </select>
        </div>

        {/* SUBMIT */}
        <button
          onClick={submit}
          disabled={submitting}
          className={`
            w-full py-3 rounded-full
            font-semibold transition
            ${
              submitting
                ? "bg-red-500/40 cursor-not-allowed"
                : "bg-red-500 hover:bg-red-400"
            }
            text-white
          `}
        >
          {submitting ? "Submitting…" : "Submit Report"}
        </button>

        {/* FOOTNOTE */}
        <p className="mt-6 text-xs text-slate-500 text-center">
          Your location is used only to help responders reach you faster.
        </p>
      </div>
    </main>
  );
}

export default Report;
