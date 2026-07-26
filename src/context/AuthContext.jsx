import { createContext, useContext, useEffect, useState } from "react";

import authApi from "../api/authApi";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(true);

  /*
  |--------------------------------------------------------------------------
  | Restore Session
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const token = localStorage.getItem("accessToken");

        /*
         * If access token exists,
         * Axios will send it.
         */

        if (token) {
          const data = await authApi.getMe();

          setUser(data.user);

          return;
        }

        /*
         * No access token.
         *
         * Try HTTP-only refresh
         * cookie.
         */

        try {
          const refreshData = await authApi.refresh();

          localStorage.setItem("accessToken", refreshData.accessToken);

          const meData = await authApi.getMe();

          setUser(meData.user);
        } catch {
          setUser(null);

          localStorage.removeItem("accessToken");
        }
      } catch (error) {
        console.error("Session restore failed:", error);

        setUser(null);

        localStorage.removeItem("accessToken");
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Login
  |--------------------------------------------------------------------------
  */

  const login = async (email, password) => {
    const data = await authApi.login({
      email,
      password,
    });

    localStorage.setItem("accessToken", data.accessToken);

    setUser(data.user);

    return data.user;
  };

  /*
  |--------------------------------------------------------------------------
  | Logout
  |--------------------------------------------------------------------------
  */

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error("Logout request failed:", error);
    } finally {
      localStorage.removeItem("accessToken");

      setUser(null);
    }
  };

  const isAuthenticated = Boolean(user);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};

export default AuthContext;
