import { createContext, useContext, useEffect, useState } from "react";
import { CognitoUser } from "amazon-cognito-identity-js";
import { getCurrentUser, getUserSession } from "../cognito/";

export interface AuthContextProps {
  user: CognitoUser | null;
  isFetching: boolean;
  login: (user: CognitoUser) => void;
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
  const [user, setUser] = useState<CognitoUser | null>(null);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    const call = async () => {
      try {
        const user = getCurrentUser();
        const session = await getUserSession(user);
        if (session.isValid()) {
          setUser(user);
        }
      } catch (e) {
        setUser(null);
      } finally {
        setIsFetching(false);
      }
    };
    call();
  }, []);

  const login = (user: CognitoUser) => {
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
