import { db } from "./firebase";
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  arrayUnion,
  increment,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";

import type { Incident, Status } from "../types/Incident";

/* =====================
   CREATE INCIDENT
===================== */
export const createIncident = async (
  incident: Omit<
    Incident,
    | "id"
    | "status"
    | "createdAt"
    | "sensorVerified"
    | "confidence"
  >
) => {
  await addDoc(collection(db, "incidents"), {
    ...incident,

    // System-controlled fields
    status: "Reported" as Status,
    createdAt: serverTimestamp(),

    // Verification logic
    crowdVerifyCount: 0,
    crowdVerifiedBy: [],
    sensorVerified: false,

    // Initial confidence (future AI-ready)
    confidence: 40,
  });
};

/* =====================
   CROWD VERIFY INCIDENT
===================== */
export const crowdVerifyIncident = async (
  id: string,
  userId: string
) => {
  const ref = doc(db, "incidents", id);
  const snap = await getDoc(ref);

  if (!snap.exists()) return;

  const data = snap.data();

  // 🛑 Prevent duplicate verification
  if (data.crowdVerifiedBy?.includes(userId)) {
    console.warn("Already verified by this user/session");
    return;
  }

  await updateDoc(ref, {
    crowdVerifyCount: increment(1),
    crowdVerifiedBy: arrayUnion(userId),

    // Soft escalation
    status: "Verified" as Status,

    // Increase confidence gradually
    confidence: increment(10),
  });
};

/* =====================
   SENSOR VERIFY
===================== */
export const verifyViaSensor = async (id: string) => {
  await updateDoc(doc(db, "incidents", id), {
    sensorVerified: true,
    status: "Verified" as Status,
    confidence: increment(25),
  });
};

/* =====================
   STATUS UPDATE
===================== */
export const updateIncidentStatus = async (
  id: string,
  status: Status
) => {
  await updateDoc(doc(db, "incidents", id), { status });
};
