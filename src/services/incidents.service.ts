import { db } from "./firebase";
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

/* =========================
   TYPES
========================= */
export type Status =
  | "Reported"
  | "Verified"
  | "Assigned"
  | "Resolved";

/* =========================
   CREATE INCIDENT
========================= */
export const createIncident = async (incident: {
  type: string;
  severity: "Low" | "Medium" | "Critical";
  status: Status;
  location: {
    lat: number;
    lng: number;
  };
  sensorVerified?: boolean;
  verificationSource?: "IR_CAMERA" | "MANUAL";
}) => {
  await addDoc(collection(db, "incidents"), {
    ...incident,
    createdAt: serverTimestamp(), // ✅ CRITICAL FIX
    sensorVerified: false,
  });
};

/* =========================
   UPDATE STATUS
========================= */
export const updateIncidentStatus = async (
  id: string,
  status: Status
) => {
  await updateDoc(doc(db, "incidents", id), { status });
};

/* =========================
   VERIFY VIA SENSOR
========================= */
export const verifyViaSensor = async (id: string) => {
  await updateDoc(doc(db, "incidents", id), {
    sensorVerified: true,
    verificationSource: "IR_CAMERA",
    status: "Verified",
  });
};
