import React, { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext(null);
const AUTH_STORAGE_KEY = 'placementhub_user';
const ACCESS_TOKEN_STORAGE_KEY = 'placementhub_access_token';
const REFRESH_TOKEN_STORAGE_KEY = 'placementhub_refresh_token';
const PROFILE_OVERRIDES_STORAGE_KEY = 'placementhub_profile_overrides';

const resolveApiBaseUrl = () => {
  const configured = (process.env.REACT_APP_API_URL || 'http://localhost:8000').trim().replace(/\/$/, '');
  try {
    const parsed = new URL(configured);
    const appHost = window.location.hostname;
    if ((appHost === 'localhost' && parsed.hostname === '127.0.0.1') || (appHost === '127.0.0.1' && parsed.hostname === 'localhost')) {
      parsed.hostname = appHost;
    }
    return parsed.toString().replace(/\/$/, '');
  } catch (_error) {
    return configured;
  }
};

const API_BASE_URL = resolveApiBaseUrl();

const readAccessTokenFromCookies = () => {
  const cookies = document.cookie.split(';').map((c) => c.trim());
  const accessTokenCookie = cookies.find((c) => c.startsWith('access_token='));
  return accessTokenCookie ? accessTokenCookie.split('=')[1] : null;
};

const readAccessToken = () => localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY) || readAccessTokenFromCookies();
const readRefreshToken = () => localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY) || null;

const PROFILE_EDITABLE_KEYS = ['name', 'branch', 'college_name', 'year', 'about'];

const readProfileOverrides = () => {
  try {
    return JSON.parse(localStorage.getItem(PROFILE_OVERRIDES_STORAGE_KEY) || '{}');
  } catch (_error) {
    return {};
  }
};

const writeProfileOverrides = (value) => {
  localStorage.setItem(PROFILE_OVERRIDES_STORAGE_KEY, JSON.stringify(value || {}));
};

const getUserOverrideKey = (data) => data?.id || data?.email;

const mergeWithProfileOverrides = (data) => {
  if (!data) return data;
  const key = getUserOverrideKey(data);
  if (!key) return data;
  const overrides = readProfileOverrides();
  return { ...data, ...(overrides[key] || {}) };
};

const persistProfileOverrides = (data, fields = {}) => {
  const key = getUserOverrideKey(data);
  if (!key) return;
  const existing = readProfileOverrides();
  const nextFields = {};
  PROFILE_EDITABLE_KEYS.forEach((field) => {
    if (Object.prototype.hasOwnProperty.call(fields, field) && fields[field] != null) {
      nextFields[field] = fields[field];
    }
  });
  existing[key] = { ...(existing[key] || {}), ...nextFields };
  writeProfileOverrides(existing);
};

const refreshAuthSession = async () => {
  const storedRefreshToken = readRefreshToken();
  const headers = storedRefreshToken ? { 'X-Refresh-Token': storedRefreshToken } : {};
  const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
    headers,
  });

  if (response.ok) {
    try {
      const data = await response.json();
      if (data?.access_token) localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, data.access_token);
      if (data?.refresh_token) localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, data.refresh_token);
    } catch (_error) {
      // Keep cookie-only refresh behavior if JSON parsing fails.
    }
  }

  return response.ok;
};

function formatApiErrorDetail(detail) {
  if (detail == null) return 'Something went wrong. Please try again.';
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) {
    return detail
      .map((e) => (e && typeof e.msg === 'string' ? e.msg : JSON.stringify(e)))
      .filter(Boolean)
      .join(' ');
  }
  if (detail && typeof detail.msg === 'string') return detail.msg;
  return String(detail);
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const getAuthToken = () => readAccessToken();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(() => readAccessToken());

  const refreshToken = () => {
    const currentToken = readAccessToken();
    setToken(currentToken);
    return currentToken;
  };

  const persistTokensFromPayload = (payload) => {
    if (payload?.access_token) localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, payload.access_token);
    if (payload?.refresh_token) localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, payload.refresh_token);
    refreshToken();
  };

  const checkAuth = async () => {
    try {
      const authToken = readAccessToken();
      const headers = authToken ? { Authorization: `Bearer ${authToken}` } : {};

      let response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        method: 'GET',
        credentials: 'include',
        headers,
      });

      if (response.status === 401) {
        const refreshed = await refreshAuthSession();
        if (refreshed) {
          response = await fetch(`${API_BASE_URL}/api/auth/me`, {
            method: 'GET',
            credentials: 'include',
          });
        }
      }

      if (!response.ok) {
        setUser(null);
        localStorage.removeItem(AUTH_STORAGE_KEY);
        localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
        localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
        setLoading(false);
        return;
      }

      const data = await response.json();
      const merged = mergeWithProfileOverrides(data);
      setUser(merged);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(merged));
      persistTokensFromPayload(merged);
    } catch (error) {
      const savedUser = localStorage.getItem(AUTH_STORAGE_KEY);
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (parseError) {
          localStorage.removeItem(AUTH_STORAGE_KEY);
          setUser(null);
        }
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

      const merged = mergeWithProfileOverrides(data);
      setUser(merged);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(merged));
      persistTokensFromPayload(merged);
      return { success: true, data: merged };
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
      if (profile.resume || profile.resumeFile) formData.append('resume', profile.resume || profile.resumeFile);

      const response = await fetch(`${API_BASE_URL}/api/auth/register-profile`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        return { success: false, error: formatApiErrorDetail(data?.detail) };
      }

      persistProfileOverrides(data, {
        name,
        branch,
        college_name: profile.collegeName,
        year: profile.year,
        about: profile.about,
      });
      const merged = mergeWithProfileOverrides(data);
      setUser(merged);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(merged));
      persistTokensFromPayload(merged);
      return { success: true, data: merged };
    } catch (error) {
      return { success: false, error: 'Registration failed. Please check backend availability.' };
    }
  };

  const logout = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      // Ignore network errors on logout and clear local auth state regardless.
    }

    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
    localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
    setUser(null);
    setToken(null);

    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i += 1) {
      const cookie = cookies[i];
      const eqPos = cookie.indexOf('=');
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    }
  };

  const updateProfileAbout = async (about) => {
    return updateProfileDetails({ about });
  };

  const updateProfileDetails = async (fields = {}) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/student/profile`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          ...(readAccessToken() ? { Authorization: `Bearer ${readAccessToken()}` } : {}),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(fields),
      });

      const data = await response.json();
      if (!response.ok) {
        return { success: false, error: formatApiErrorDetail(data?.detail) };
      }

      persistProfileOverrides(data, fields);
      const merged = mergeWithProfileOverrides(data);
      setUser(merged);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(merged));
      return { success: true, data: merged };
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
        headers: readAccessToken() ? { Authorization: `Bearer ${readAccessToken()}` } : {},
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        return { success: false, error: formatApiErrorDetail(data?.detail) };
      }

      const merged = mergeWithProfileOverrides(data);
      setUser(merged);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(merged));
      return { success: true, data: merged };
    } catch (error) {
      return { success: false, error: 'Unable to update resume right now.' };
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    checkAuth,
    updateProfileAbout,
    updateProfileDetails,
    updateProfileResume,
    apiBaseUrl: API_BASE_URL,
    getAuthToken: refreshToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
