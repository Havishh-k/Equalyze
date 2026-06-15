"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithCustomToken,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  User,
} from "firebase/auth";
import { auth, db } from "./firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

/* ── RBAC Roles ────────────────────────────────────── */

export type UserRole = "DATA_SCIENTIST" | "DATA_ENGINEER" | "COMPLIANCE_OFFICER";

const DEMO_ROLE_MAP: Record<string, UserRole> = {
  "datascientist@equalyze.io": "DATA_SCIENTIST",
  "compliance@equalyze.io": "COMPLIANCE_OFFICER",
  "dataengineer@equalyze.io": "DATA_ENGINEER",
};

const DEFAULT_ROLE: UserRole = "DATA_SCIENTIST";

/* ── Context Type ──────────────────────────────────── */

interface AuthContextType {
  user: User | null;
  loading: boolean;
  token: string | null;
  role: UserRole | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  demoLogin: (email: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  token: null,
  role: null,
  login: async () => {},
  register: async () => {},
  loginWithGoogle: async () => {},
  demoLogin: async () => {},
  logout: async () => {},
});

/* ── Provider ──────────────────────────────────────── */

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch or assign role from Firestore user profile
  const resolveRole = async (u: User): Promise<UserRole> => {
    // Check demo account mapping first
    const demoRole = DEMO_ROLE_MAP[u.email || ""];
    if (demoRole) return demoRole;

    // Try Firestore user profile
    try {
      const userDoc = await getDoc(doc(db, "users", u.uid));
      if (userDoc.exists() && userDoc.data().role) {
        return userDoc.data().role as UserRole;
      }
      // First login — assign default role and persist
      await setDoc(doc(db, "users", u.uid), {
        email: u.email,
        displayName: u.displayName || u.email?.split("@")[0],
        role: DEFAULT_ROLE,
        createdAt: new Date().toISOString(),
      }, { merge: true });
      return DEFAULT_ROLE;
    } catch {
      // Firestore unavailable — fall back to default
      return DEFAULT_ROLE;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const t = await u.getIdToken();
        setToken(t);
        const resolvedRole = await resolveRole(u);
        setRole(resolvedRole);
      } else {
        setToken(null);
        setRole(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const register = async (email: string, password: string) => {
    await createUserWithEmailAndPassword(auth, email, password);
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const demoLogin = async (email: string) => {
    const res = await fetch("/api/v1/auth/demo-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password: "demo123" }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Demo login failed" }));
      throw new Error(err.detail || "Demo login failed");
    }
    const data = await res.json();
    await signInWithCustomToken(auth, data.custom_token);
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, token, role, login, register, loginWithGoogle, demoLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
