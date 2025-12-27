import { db } from "./firebase";
import { collection, addDoc } from "firebase/firestore";
import type { Incident } from "../types/Incident";

export const createIncident = async (incident: Incident) => {
  const ref = await addDoc(collection(db, "incidents"), incident);
  return ref.id;
};
