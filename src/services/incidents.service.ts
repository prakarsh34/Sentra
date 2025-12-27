import { db } from "./firebase";
import { collection, addDoc, doc, updateDoc } from "firebase/firestore";

/* =========================
   CREATE INCIDENT (Citizen)
========================= */
export const createIncident = async (incident: {
  type: string;
  severity: "Low" | "Medium" | "Critical";
  status: "Reported" | "Verified" | "Assigned" | "Resolved";
  location: {
    lat: number;
    lng: number;
  };
  createdAt: Date;
}) => {
  const ref = collection(db, "incidents");
  await addDoc(ref, incident);
};

/* =========================
   UPDATE INCIDENT STATUS (Responder)
========================= */
export const updateIncidentStatus = async (
  id: string,
  status: "Reported" | "Verified" | "Assigned" | "Resolved"
) => {
  const ref = doc(db, "incidents", id);
  await updateDoc(ref, { status });
};
