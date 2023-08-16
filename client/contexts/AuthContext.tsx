import { createContext, useContext, useEffect, useState } from "react";
import { CognitoUser } from "amazon-cognito-identity-js";
import { getUserAttributes, getCurrentUser, getUserSession } from "../cognito/";

export interface UserAttributes {
  sub?: string;
  email?: string;
  phoneNumber?: string;
  username?: string;
}

export interface AuthContextProps {
  user: CognitoUser | null;
  userAttributes: UserAttributes;
  isFetching: boolean;
  login: (user: CognitoUser) => void;
  logout: () => void;
}

const defaultAuthContext: AuthContextProps = {
  user: null,
  userAttributes: {},
  isFetching: true,
  login: () => {},
  logout: () => {},
};

const AuthContext = createContext<AuthContextProps>(defaultAuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<CognitoUser | null>(null);
  const [userAttributes, setUserAttributes] = useState<UserAttributes>({});
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    const call = async () => {
      try {
        const user = getCurrentUser();
        const session = await getUserSession(user);
        if (session.isValid()) {
          const attributes = await getUserAttributes(user);
          const userAttributes = attributes.reduce((acc, { Name, Value }) => {
            if (Name === "sub" || Name === "email") {
              acc[Name] = Value;
            }
            return acc;
          }, {} as UserAttributes);
          userAttributes.username = user?.getUsername();

          setUserAttributes(userAttributes);
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
    <AuthContext.Provider
      value={{ user, userAttributes, isFetching, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
