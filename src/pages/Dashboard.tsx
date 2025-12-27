import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../services/firebase";
import {
  updateIncidentStatus,
  verifyViaSensor,
} from "../services/incidents.service";
import { calculatePriorityWithReasons } from "../utils/priority";

interface Incident {
  id: string;
  type: string;
  severity: "Low" | "Medium" | "Critical";
  status: "Reported" | "Verified" | "Assigned" | "Resolved";
  createdAt: any;
  location: { lat: number; lng: number };
  sensorVerified?: boolean;
}

function Dashboard() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    return onSnapshot(collection(db, "incidents"), (snap) => {
      setIncidents(
        snap.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Incident, "id">),
        }))
      );
    });
  }, []);

  const enriched = incidents.map((i) => {
    const result = calculatePriorityWithReasons(
      i.severity,
      i.status,
      i.createdAt,
      i.sensorVerified
    );
    return { ...i, priority: result.score, reasons: result.reasons };
  });

  const sorted = [...enriched].sort((a, b) => b.priority - a.priority);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold mb-6">
        🧠 Explainable Emergency Dashboard
      </h1>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-4">Type</th>
              <th className="p-4">Severity</th>
              <th className="p-4">Status</th>
              <th className="p-4">Priority</th>
              <th className="p-4">Explain</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>

          <tbody>
            {sorted.map((i) => (
              <>
                <tr key={i.id} className="border-t hover:bg-gray-50">
                  <td className="p-4 font-medium">{i.type}</td>
                  <td className="p-4">{i.severity}</td>
                  <td className="p-4">{i.status}</td>
                  <td className="p-4 font-semibold text-purple-700">
                    {i.priority}
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() =>
                        setExpandedId(expandedId === i.id ? null : i.id)
                      }
                      className="text-blue-600 hover:underline text-sm"
                    >
                      Why?
                    </button>
                  </td>
                  <td className="p-4 flex gap-2">
                    {!i.sensorVerified && i.type === "Smog" && (
                      <button
                        onClick={() => verifyViaSensor(i.id)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded text-sm"
                      >
                        Simulate IR
                      </button>
                    )}

                    {i.status !== "Resolved" && (
                      <button
                        onClick={() =>
                          updateIncidentStatus(i.id, "Resolved")
                        }
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                      >
                        Resolve
                      </button>
                    )}
                  </td>
                </tr>

                {expandedId === i.id && (
                  <tr className="bg-gray-50">
                    <td colSpan={6} className="p-4">
                      <ul className="list-disc ml-6 text-sm text-gray-700">
                        {i.reasons.map((r, idx) => (
                          <li key={idx}>{r}</li>
                        ))}
                      </ul>
                    </td>
                  </tr>
                )}
              </>
            ))}

            {sorted.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="p-6 text-center text-gray-500"
                >
                  No incidents available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Dashboard;
