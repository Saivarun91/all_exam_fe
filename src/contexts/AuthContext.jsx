"use client";

import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user & token from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken) {
      setToken(storedToken);
      setIsLoggedIn(true);

      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (error) {
          localStorage.removeItem("user");
        }
      }

      fetchUserProfile(storedToken).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserProfile = async (authToken) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    try {
      const res = await fetch(`${API_BASE}/api/users/profile/`, {
        headers: { Authorization: `Bearer ${authToken}` },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data && data.profile) {
          setUser(data.profile);

          if (typeof window !== "undefined") {
            localStorage.setItem("user", JSON.stringify(data.profile));
          }
        }
      } else {
        const status = res.status;
        if (status === 401 || status === 403) {
          // Token is invalid or expired
          logout();
        } else {
          // Other server errors - don't logout, just log
          console.warn("Failed to fetch user profile, but keeping user logged in:", status);
        }
      }
    } catch (error) {
      clearTimeout(timeoutId);
      console.error("Error fetching user profile:", error);
      
      // Handle abort (timeout)
      if (error.name === 'AbortError') {
        console.warn("User profile fetch timed out, but keeping user logged in");
      } else if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
        // Network error - don't logout
        console.warn("Network error fetching user profile, but keeping user logged in");
      } else {
        // Unknown error - don't logout
        console.warn("Unknown error fetching user profile, but keeping user logged in:", error.message);
      }
    }
  };

  const login = async (authToken) => {
    setIsLoggedIn(true);
    setToken(authToken);

    if (typeof window !== "undefined") {
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("token", authToken);
    }

    await fetchUserProfile(authToken);
  };

  const logout = () => {
    setIsLoggedIn(false);
    setToken(null);
    setUser(null);

    if (typeof window !== "undefined") {
      localStorage.clear();
    }
  };

  return (
    <AuthContext.Provider
      value={{ isLoggedIn, token, user, loading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
