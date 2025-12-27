import { useState } from "react";

function Report() {
  const [type, setType] = useState("");
  const [severity, setSeverity] = useState("");

  return (
    <div style={{ padding: "40px", maxWidth: "600px" }}>
      <h1 style={{ fontSize: "28px", marginBottom: "20px" }}>
        Report an Incident
      </h1>

      {/* Incident Type */}
      <label>Incident Type</label>
      <select
        value={type}
        onChange={(e) => setType(e.target.value)}
        style={{ display: "block", width: "100%", marginBottom: "20px" }}
      >
        <option value="">Select</option>
        <option value="Accident">Accident</option>
        <option value="Medical">Medical</option>
        <option value="Fire">Fire</option>
        <option value="Smog">Smog / Low Visibility</option>
      </select>

      {/* Severity */}
      <label>Severity</label>
      <select
        value={severity}
        onChange={(e) => setSeverity(e.target.value)}
        style={{ display: "block", width: "100%", marginBottom: "20px" }}
      >
        <option value="">Select</option>
        <option value="Low">Low</option>
        <option value="Medium">Medium</option>
        <option value="Critical">Critical</option>
      </select>

      <button
        style={{
          padding: "12px 20px",
          backgroundColor: "#dc2626",
          color: "white",
          borderRadius: "8px",
          border: "none",
          fontSize: "16px",
        }}
      >
        Submit Report
      </button>
    </div>
  );
}

export default Report;
