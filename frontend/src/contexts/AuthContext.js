import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

function formatApiErrorDetail(detail) {
  if (detail == null) return "Something went wrong. Please try again.";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail))
    return detail.map((e) => (e && typeof e.msg === "string" ? e.msg : JSON.stringify(e))).filter(Boolean).join(" ");
  if (detail && typeof detail.msg === "string") return detail.msg;
  return String(detail);
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    // Authentication disabled for development - skip API call
    setLoading(false);
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email, password) => {
    // Mock login without API call - determine role from email
    try {
      let role = 'student';
      if (email.includes('tpo')) {
        role = 'tpo';
      }
      
      const mockUser = {
        id: '123',
        email: email,
        name: role === 'tpo' ? 'TPO Admin' : 'Student User',
        role: role,
        branch: 'CSE'
      };
      
      setUser(mockUser);
      return { success: true, data: mockUser };
    } catch (error) {
      return { success: false, error: 'Login failed' };
    }
  };

  const register = async (email, password, name, role, branch) => {
    // Mock register without API call
    try {
      const mockUser = {
        id: '123',
        email: email,
        name: name,
        role: role,
        branch: branch
      };
      
      setUser(mockUser);
      return { success: true, data: mockUser };
    } catch (error) {
      return { success: false, error: 'Registration failed' };
    }
  };

  const logout = async () => {
    // Mock logout
    setUser(false);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
