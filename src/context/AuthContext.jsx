import { createContext, useContext, useEffect, useState } from "react";

import authApi from "../api/authApi";
import trainersApi from "../api/trainersApi";
import vendorsApi from "../api/vendorsApi";

const AuthContext = createContext(null);

const enrichUserWithProfile = async (rawUser) => {
  if (!rawUser) return null;
  let fullUser = { ...rawUser };

  const role = (rawUser.role || "").toUpperCase();

  if (role === "TRAINER" && !fullUser.profilePhotoUrl && !fullUser.avatar) {
    try {
      const res = await trainersApi.getMyProfile();
      if (res?.trainer) {
        fullUser.trainer = res.trainer;
        fullUser.profilePhotoUrl = res.trainer.profilePhotoUrl || "";
        fullUser.avatar = res.trainer.profilePhotoUrl || "";
      }
    } catch (err) {
      console.warn("Could not enrich trainer profile:", err);
    }
  } else if (role === "VENDOR" && !fullUser.logoUrl && !fullUser.avatar) {
    try {
      const res = await vendorsApi.getMyProfile();
      if (res?.vendor) {
        fullUser.vendor = res.vendor;
        fullUser.logoUrl = res.vendor.logoUrl || "";
        fullUser.avatar = res.vendor.logoUrl || "";
      }
    } catch (err) {
      console.warn("Could not enrich vendor profile:", err);
    }
  }

  return fullUser;
};

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

        if (token) {
          try {
            const data = await authApi.getMe();
            const enriched = await enrichUserWithProfile(data.user);
            setUser(enriched);
            return;
          } catch (meError) {
            if (meError.response?.status === 429) {
              console.warn("Session restore rate-limited (429). Preserving session.");
              return;
            }
            throw meError;
          }
        }

        try {
          const refreshData = await authApi.refresh();
          localStorage.setItem("accessToken", refreshData.accessToken);
          const meData = await authApi.getMe();
          const enriched = await enrichUserWithProfile(meData.user);
          setUser(enriched);
        } catch (refreshErr) {
          if (refreshErr.response?.status !== 429) {
            setUser(null);
            localStorage.removeItem("accessToken");
          }
        }
      } catch (error) {
        console.error("Session restore failed:", error);
        if (error.response?.status !== 429) {
          setUser(null);
          localStorage.removeItem("accessToken");
        }
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
    const enriched = await enrichUserWithProfile(data.user);
    setUser(enriched);

    return enriched;
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

  const refreshUser = async () => {
    try {
      const data = await authApi.getMe();
      if (data?.user) {
        const enriched = await enrichUserWithProfile(data.user);
        setUser(enriched);
        return enriched;
      }
    } catch (error) {
      console.error("Failed to refresh user:", error);
    }
    return null;
  };

  const updateUser = (updatedFields) => {
    setUser((prev) => {
      if (!prev) return updatedFields;
      return typeof updatedFields === "function"
        ? updatedFields(prev)
        : { ...prev, ...updatedFields };
    });
  };

  const isAuthenticated = Boolean(user);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        refreshUser,
        updateUser,
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
