import { createContext, useContext } from "react";

export const AuthContext = createContext({ user: null, profile: null, ready: false, syncState: "idle", refreshProfile: async () => {} });
export const useAuth = () => useContext(AuthContext);
