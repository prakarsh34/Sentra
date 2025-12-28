// src/services/auth.service.ts
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "./firebase";

// Export this as a type for other files
export type UserRole = "citizen" | "responder";

/* =========================
   REGISTER (FIXED)
========================= */
export const registerUser = async (
  email: string,
  password: string,
  role: UserRole
): Promise<User> => {
  // 1️⃣ Create Auth user (this is the critical success step)
  const cred = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );

  const user = cred.user;

  // 2️⃣ Save role in Firestore (NON-BLOCKING)
  try {
    await setDoc(doc(db, "users", user.uid), {
      email,
      role,
      createdAt: serverTimestamp(),
    });
  } catch (err) {
    // 🔴 IMPORTANT: Do NOT throw here
    console.error(
      "⚠️ User created but Firestore role save failed:",
      err
    );
  }

  // 3️⃣ Always return user if Auth succeeded
  return user;
};

/* =========================
   LOGIN
========================= */
export const loginUser = async (
  email: string,
  password: string
): Promise<User> => {
  const cred = await signInWithEmailAndPassword(
    auth,
    email,
    password
  );
  return cred.user;
};

/* =========================
   LOGOUT
========================= */
export const logoutUser = async () => {
  await signOut(auth);
};

/* =========================
   GET USER ROLE
========================= */
export const getUserRole = async (
  uid: string
): Promise<UserRole | null> => {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;
  return snap.data().role as UserRole;
};
