import React from "react";
import { meApi } from "../api/auth";
import AuthContext from "./AuthContext.jsx"; 
export default function AuthProvider({ children }) {
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { setLoading(false); return; }
    meApi()
      .then(({ data }) => setUser(data.user))
      .catch(() => localStorage.removeItem("token"))
      .finally(() => setLoading(false));
  }, []);

  const value = {
    user,
    setUser,
    loading,
    logout: () => { localStorage.removeItem("token"); setUser(null); }
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
