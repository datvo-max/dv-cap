"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { onAuthStateChanged, signInWithPopup, signOut, User } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, googleProvider, db } from "../lib/firebase";
import { toast } from "react-hot-toast";

export interface UserProfile {
  email: string;
  fullName: string;
  phone: string;
  unit: string;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isAllowed: boolean;
  isGuest: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  continueAsGuest: () => void;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAllowed, setIsAllowed] = useState<boolean>(false);
  const [isGuest, setIsGuest] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        // Cho phép mọi người dùng đăng nhập bằng tài khoản Google
        setIsAllowed(true);
        
        try {
          // Lấy hoặc tạo thông tin người dùng trong collection "users"
          const userEmail = currentUser.email || "";
          if (userEmail) {
            const userDocRef = doc(db, "users", userEmail);
            const userDoc = await getDoc(userDocRef);
            
            if (userDoc.exists()) {
              setUserProfile(userDoc.data() as UserProfile);
            } else {
              // Lần đầu đăng nhập, tạo profile mới
              const newProfile: UserProfile = {
                email: userEmail,
                fullName: currentUser.displayName || "",
                phone: "",
                unit: ""
              };
              await setDoc(userDocRef, newProfile);
              setUserProfile(newProfile);
            }
          }
        } catch (error) {
          console.error("Lỗi lấy thông tin người dùng:", error);
          toast.error("Không thể tải thông tin hồ sơ");
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
        setUserProfile(null);
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
      setUserProfile(null);
    } catch (error: unknown) {
      console.error("Lỗi đăng xuất:", error);
      toast.error("Đăng xuất thất bại!");
    }
  };

  const updateUserProfile = async (data: Partial<UserProfile>) => {
    if (!user || !user.email) {
      toast.error("Bạn cần đăng nhập để thực hiện chức năng này");
      return;
    }
    
    try {
      const userDocRef = doc(db, "users", user.email);
      await setDoc(userDocRef, data, { merge: true });
      
      setUserProfile(prev => prev ? { ...prev, ...data } : data as UserProfile);
      toast.success("Đã cập nhật hồ sơ cá nhân!");
    } catch (error) {
      console.error("Lỗi cập nhật hồ sơ:", error);
      toast.error("Có lỗi xảy ra khi cập nhật hồ sơ!");
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, isAllowed, isGuest, login, logout, continueAsGuest, updateUserProfile }}>
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
