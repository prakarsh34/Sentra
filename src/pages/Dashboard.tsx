import { useEffect, useState } from "react";
import { db } from "../services/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { updateIncidentStatus } from "../services/incidents.service";

interface Incident {
  id: string;
  type: string;
  severity: "Low" | "Medium" | "Critical";
  status: "Reported" | "Verified" | "Assigned" | "Resolved";
}

function Dashboard() {
  const [incidents, setIncidents] = useState<Incident[]>([]);

  useEffect(() => {
    return onSnapshot(collection(db, "incidents"), (snapshot) => {
      const data = snapshot.docs.map((doc) => {
        const d = doc.data() as Omit<Incident, "id">;
        return { id: doc.id, ...d };
      });
      setIncidents(data);
    });
  }, []);

  const total = incidents.length;
  const critical = incidents.filter(i => i.severity === "Critical").length;
  const active = incidents.filter(i => i.status !== "Resolved").length;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold mb-8">🚑 Responder Dashboard</h1>

      {/* STATS */}
      <div className="grid md:grid-cols-3 gap-6 mb-10">
        <StatCard title="Total Incidents" value={total} color="blue" />
        <StatCard title="Critical" value={critical} color="red" />
        <StatCard title="Active" value={active} color="yellow" />
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-4 text-left">Type</th>
              <th className="p-4 text-left">Severity</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {incidents.map((i) => (
              <tr key={i.id} className="border-t">
                <td className="p-4">{i.type}</td>
                <td className="p-4">
                  <SeverityBadge severity={i.severity} />
                </td>
                <td className="p-4">{i.status}</td>
                <td className="p-4 flex gap-2">
                  {i.status === "Reported" && (
                    <ActionButton
                      label="Verify"
                      color="blue"
                      onClick={() =>
                        updateIncidentStatus(i.id, "Verified")
                      }
                    />
                  )}
                  {i.status === "Verified" && (
                    <ActionButton
                      label="Assign"
                      color="yellow"
                      onClick={() =>
                        updateIncidentStatus(i.id, "Assigned")
                      }
                    />
                  )}
                  {i.status !== "Resolved" && (
                    <ActionButton
                      label="Resolve"
                      color="green"
                      onClick={() =>
                        updateIncidentStatus(i.id, "Resolved")
                      }
                    />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------------- COMPONENTS ---------------- */

function StatCard({
  title,
  value,
  color,
}: {
  title: string;
  value: number;
  color: "red" | "blue" | "yellow";
}) {
  const map = {
    red: "bg-red-100 text-red-700",
    blue: "bg-blue-100 text-blue-700",
    yellow: "bg-yellow-100 text-yellow-700",
  };

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <p className="text-sm text-gray-500 mb-2">{title}</p>
      <p className={`text-3xl font-bold px-4 py-2 rounded-lg inline-block ${map[color]}`}>
        {value}
      </p>
    </div>
  );
}

function SeverityBadge({ severity }: { severity: Incident["severity"] }) {
  const map = {
    Low: "bg-green-100 text-green-700",
    Medium: "bg-yellow-100 text-yellow-700",
    Critical: "bg-red-100 text-red-700",
  };

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${map[severity]}`}>
      {severity}
    </span>
  );
}

function ActionButton({
  label,
  color,
  onClick,
}: {
  label: string;
  color: "blue" | "yellow" | "green";
  onClick: () => void;
}) {
  const map = {
    blue: "bg-blue-600 hover:bg-blue-700",
    yellow: "bg-yellow-600 hover:bg-yellow-700",
    green: "bg-green-600 hover:bg-green-700",
  };

  return (
    <button
      onClick={onClick}
      className={`${map[color]} text-white px-3 py-1 rounded text-sm`}
    >
      {label}
    </button>
  );
}

export default Dashboard;
