"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { onAuthStateChanged, signInWithPopup, signOut, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, googleProvider, db } from "../lib/firebase";
import { toast } from "react-hot-toast";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAllowed: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAllowed, setIsAllowed] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        // Kiểm tra xem user có trong whitelist trên Firestore không
        try {
          const userDoc = await getDoc(doc(db, "allowed_users", currentUser.email || ""));
          if (userDoc.exists() && userDoc.data().allowed === true) {
            setIsAllowed(true);
          } else {
            setIsAllowed(false);
          }
        } catch (error) {
          console.error("Lỗi kiểm tra quyền truy cập:", error);
          setIsAllowed(false);
        }
      } else {
        setIsAllowed(false);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async () => {
    try {
      setLoading(true);
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error("Lỗi đăng nhập:", error);
      toast.error("Đăng nhập thất bại: " + error.message);
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setIsAllowed(false);
      setUser(null);
    } catch (error: any) {
      console.error("Lỗi đăng xuất:", error);
      toast.error("Đăng xuất thất bại!");
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAllowed, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth phải được sử dụng bên trong AuthProvider");
  }
  return context;
}
