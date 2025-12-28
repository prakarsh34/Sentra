// src/context/AuthContext.tsx
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
  type Dispatch,
  type SetStateAction,
} from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "../services/firebase";
import { 
  getUserRole, 
  registerUser, // Import your service functions
  loginUser,
  logoutUser,
  type UserRole 
} from "../services/auth.service";

/* =====================
   TYPES
===================== */
interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  setRole: Dispatch<SetStateAction<UserRole | null>>;
  loading: boolean;
  // ADD THESE:
  register: typeof registerUser;
  login: typeof loginUser;
  logout: typeof logoutUser;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/* =====================
   PROVIDER
===================== */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (!firebaseUser) {
        setUser(null);
        setRole(null);
        setLoading(false);
        return;
      }
      setUser(firebaseUser);
      try {
        const r = await getUserRole(firebaseUser.uid);
        setRole(r);
      } catch (err) {
        setRole(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        setRole,
        loading,
        // PASS THE FUNCTIONS HERE:
        register: registerUser,
        login: loginUser,
        logout: logoutUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}