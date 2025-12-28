// src/services/auth.service.ts
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  type User, // ADD 'type' keyword here
} from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "./firebase";

// Export this as a type for other files to use correctly
export type UserRole = "citizen" | "responder";

/* =========================
   REGISTER
========================= */
export const registerUser = async (
  email: string,
  password: string,
  role: UserRole
): Promise<User> => {
  const cred = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );

  // Save role in Firestore
  await setDoc(doc(db, "users", cred.user.uid), {
    email,
    role,
    createdAt: serverTimestamp(),
  });

  return cred.user;
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