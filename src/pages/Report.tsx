import { useState } from "react";
import { createIncident } from "../services/incidents.service";
import type { IncidentType, IncidentSeverity } from "../types/Incident";

function Report() {
  const [type, setType] = useState<IncidentType | "">("");
  const [severity, setSeverity] = useState<IncidentSeverity | "">("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!type || !severity) {
      alert("Please select all fields");
      return;
    }

    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        await createIncident({
          type,
          severity,
          status: "Reported",
          location: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          },
          createdAt: new Date(),
        });

        alert("Incident reported successfully 🚨");
        setLoading(false);
        setType("");
        setSeverity("");
      },
      () => {
        alert("Location permission required");
        setLoading(false);
      }
    );
  };

  return (
    <div style={{ padding: "40px", maxWidth: "600px" }}>
      <h1 style={{ fontSize: "28px", marginBottom: "20px" }}>
        Report an Incident
      </h1>

      <label>Incident Type</label>
      <select
        value={type}
        onChange={(e) => setType(e.target.value as IncidentType)}
        style={{ display: "block", width: "100%", marginBottom: "20px" }}
      >
        <option value="">Select</option>
        <option value="Accident">Accident</option>
        <option value="Medical">Medical</option>
        <option value="Fire">Fire</option>
        <option value="Smog">Smog / Low Visibility</option>
      </select>

      <label>Severity</label>
      <select
        value={severity}
        onChange={(e) =>
          setSeverity(e.target.value as IncidentSeverity)
        }
        style={{ display: "block", width: "100%", marginBottom: "20px" }}
      >
        <option value="">Select</option>
        <option value="Low">Low</option>
        <option value="Medium">Medium</option>
        <option value="Critical">Critical</option>
      </select>

      <button
        onClick={handleSubmit}
        disabled={loading}
        style={{
          padding: "12px 20px",
          backgroundColor: "#dc2626",
          color: "white",
          borderRadius: "8px",
          border: "none",
          fontSize: "16px",
        }}
      >
        {loading ? "Reporting..." : "Submit Report"}
      </button>
    </div>
  );
}

export default Report;
