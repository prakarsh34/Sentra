import { db } from "../services/firebase";
import { collection, addDoc } from "firebase/firestore";

export const testFirebase = async () => {
  await addDoc(collection(db, "test"), {
    message: "Firebase connected!",
    time: new Date(),
  });
};
