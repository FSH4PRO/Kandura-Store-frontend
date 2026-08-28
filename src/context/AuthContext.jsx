import { useCallback, useMemo, useState } from 'react';
import { AuthContext } from './authStore';
import { getToken, getStoredUser } from '../services/api';
import { loginCustomer, registerCustomer, logoutCustomer } from '../services/auth';
import { getProfile } from '../services/profile';

// Centralizes auth state so every consumer (navbar, protected routes,
// login/register forms) reacts to the SAME state instantly — instead of
// each component independently re-reading localStorage, which only
// happened to "work" before because a route change forced a re-render
// after login/logout. Editing a profile, for example, previously had no
// way to make the navbar pick up a new avatar without a full page nav.
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUser());
  const [token, setTokenState] = useState(() => getToken());

  const login = useCallback(async (phone, password) => {
    const response = await loginCustomer(phone, password);
    const { access_token, token_type, ...profile } = response; // eslint-disable-line no-unused-vars
    setTokenState(access_token);
    setUser(profile);
    return response;
  }, []);

  const register = useCallback(async (payload) => {
    const response = await registerCustomer(payload);
    const { access_token, token_type, ...profile } = response; // eslint-disable-line no-unused-vars
    setTokenState(access_token);
    setUser(profile);
    return response;
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutCustomer();
    } finally {
      setTokenState(null);
      setUser(null);
    }
  }, []);

  // Called after a profile edit, or on app load if we want fresher data
  // than what's cached in localStorage.
  const refreshUser = useCallback(async () => {
    const profile = await getProfile();
    setUser(profile);
    return profile;
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: !!token,
      login,
      register,
      logout,
      refreshUser,
      setUser, // exposed for the rare case a screen already has the fresh object (avoids a redundant refetch)
    }),
    [user, token, login, register, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
