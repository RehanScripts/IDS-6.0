import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);
const AUTH_STORAGE_KEY = 'placementhub_user';
const API_BASE_URL = (
  process.env.REACT_APP_API_URL ||
  process.env.REACT_APP_BACKEND_URL ||
  'http://127.0.0.1:8000'
).replace(/\/$/, '');

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
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        setUser(null);
        localStorage.removeItem(AUTH_STORAGE_KEY);
        setLoading(false);
        return;
      }

      const data = await response.json();
      setUser(data);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      const savedUser = localStorage.getItem(AUTH_STORAGE_KEY);
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch {
          localStorage.removeItem(AUTH_STORAGE_KEY);
          setUser(null);
        }
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        return { success: false, error: formatApiErrorDetail(data?.detail) };
      }

      setUser(data);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data));
      return { success: true, data };
    } catch (error) {
      return { success: false, error: 'Login failed. Please check backend availability.' };
    }
  };

  const register = async (email, password, name, role, branch, profile = {}) => {
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);
      formData.append('password', password);
      formData.append('role', role);
      if (branch) formData.append('branch', branch);
      if (profile.collegeName) formData.append('college_name', profile.collegeName);
      if (profile.year) formData.append('year', profile.year);
      if (profile.about) formData.append('about', profile.about);
      if (profile.resumeFile) formData.append('resume', profile.resumeFile);

      const response = await fetch(`${API_BASE_URL}/api/auth/register-profile`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        return { success: false, error: formatApiErrorDetail(data?.detail) };
      }

      setUser(data);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data));
      return { success: true, data };
    } catch (error) {
      return { success: false, error: 'Registration failed. Please try again.' };
    }
  };

  const logout = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch {
      // Ignore network errors on logout and clear local auth state regardless.
    }
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setUser(null);
  };

  const updateProfileAbout = async (about) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/student/profile`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ about }),
      });

      const data = await response.json();
      if (!response.ok) {
        return { success: false, error: formatApiErrorDetail(data?.detail) };
      }

      setUser(data);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data));
      return { success: true, data };
    } catch (error) {
      return { success: false, error: 'Unable to update profile right now.' };
    }
  };

  const updateProfileResume = async (resumeFile) => {
    try {
      const formData = new FormData();
      formData.append('resume', resumeFile);

      const response = await fetch(`${API_BASE_URL}/api/student/resume`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        return { success: false, error: formatApiErrorDetail(data?.detail) };
      }

      setUser(data);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data));
      return { success: true, data };
    } catch (error) {
      return { success: false, error: 'Unable to update resume right now.' };
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, checkAuth, updateProfileAbout, updateProfileResume, apiBaseUrl: API_BASE_URL }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
