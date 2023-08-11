import { createContext, useContext, useEffect, useState } from "react";
import { User } from "./types";
import { checkAuth } from "../services/user";

export interface AuthContextProps {
  user: User | null;
  isFetching: boolean;
  login: (user: User) => void;
  logout: () => void;
}

const defaultAuthContext: AuthContextProps = {
  user: null,
  isFetching: true,
  login: () => {},
  logout: () => {},
};

const AuthContext = createContext<AuthContextProps>(defaultAuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    const call = async () => {
      try {
        const response = await checkAuth();
        setUser(response);
      } catch (e) {
        setUser(null);
      } finally {
        setIsFetching(false);
      }
    };
    call();
  }, []);

  const login = (user: User) => {
    setUser(user);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isFetching, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
