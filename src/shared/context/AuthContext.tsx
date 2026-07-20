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
  isGuest: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  continueAsGuest: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAllowed, setIsAllowed] = useState<boolean>(false);
  const [isGuest, setIsGuest] = useState<boolean>(false);

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
        // Kiểm tra xem có đang ở chế độ khách không
        const guestMode = localStorage.getItem("dv_cap_guest_mode") === "true";
        if (guestMode) {
          setIsGuest(true);
          setIsAllowed(true);
        } else {
          setIsAllowed(false);
          setIsGuest(false);
        }
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async () => {
    try {
      setLoading(true);
      await signInWithPopup(auth, googleProvider);
      // Xóa chế độ khách nếu có
      localStorage.removeItem("dv_cap_guest_mode");
      setIsGuest(false);
    } catch (error: unknown) {
      console.error("Lỗi đăng nhập:", error);
      toast.error("Đăng nhập thất bại: " + (error instanceof Error ? error.message : String(error)));
      setLoading(false);
    }
  };

  const continueAsGuest = () => {
    localStorage.setItem("dv_cap_guest_mode", "true");
    setIsGuest(true);
    setIsAllowed(true);
  };

  const logout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("dv_cap_guest_mode");
      setIsGuest(false);
      setIsAllowed(false);
      setUser(null);
    } catch (error: unknown) {
      console.error("Lỗi đăng xuất:", error);
      toast.error("Đăng xuất thất bại!");
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAllowed, isGuest, login, logout, continueAsGuest }}>
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
