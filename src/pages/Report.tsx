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

  const submit = () => {
    if (!type || !severity) {
      alert("Fill all fields");
      return;
    }

    navigator.geolocation.getCurrentPosition(async (pos) => {
      await createIncident({
        type,
        severity, // ✅ now correctly typed
        status: "Reported",
        location: {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        },
        createdAt: new Date(),
      });

      alert("Incident Reported 🚨");
      setType("");
      setSeverity("");
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6">Report Incident</h2>

        {/* INCIDENT TYPE */}
        <select
          value={type}
          onChange={(e) => setType(e.target.value as IncidentType)}
          className="w-full border p-3 rounded mb-4"
        >
          <option value="">Incident Type</option>
          <option value="Accident">Accident</option>
          <option value="Medical">Medical</option>
          <option value="Fire">Fire</option>
          <option value="Smog">Smog</option>
        </select>

        {/* SEVERITY */}
        <select
          value={severity}
          onChange={(e) => setSeverity(e.target.value as Severity)}
          className="w-full border p-3 rounded mb-6"
        >
          <option value="">Severity</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="Critical">Critical</option>
        </select>

        <button
          onClick={submit}
          className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded font-semibold"
        >
          Submit
        </button>
      </div>
    </div>
  );
}

export default Report;
