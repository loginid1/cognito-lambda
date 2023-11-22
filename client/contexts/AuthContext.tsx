import { createContext, useContext, useEffect, useState } from "react";
import { CognitoUser } from "amazon-cognito-identity-js";
import { PasskeysStorage } from "../storage/passkeys";
import {
  getUserAttributes,
  getCurrentUser,
  getUserSession,
  signOutUser,
} from "../cognito/";

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
  getLatestAttributes: () => Promise<void>;
  login: (user: CognitoUser) => Promise<void>;
  logout: () => void;
}

const defaultAuthContext: AuthContextProps = {
  user: null,
  userAttributes: {},
  isFetching: true,
  getLatestAttributes: async () => {},
  login: async () => {},
  logout: () => {},
};

const AuthContext = createContext<AuthContextProps>(defaultAuthContext);

const findUserAttributes = async (user: CognitoUser | null) => {
  const attributes = await getUserAttributes(user);
  const userAttributes = attributes.reduce((acc, { Name, Value }) => {
    if (Name === "sub" || Name === "email") {
      acc[Name] = Value;
    }
    if (Name === "phone_number") {
      acc.phoneNumber = Value;
    }
    return acc;
  }, {} as UserAttributes);
  userAttributes.username = user?.getUsername();
  return userAttributes;
};

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
          const attributes = await findUserAttributes(user);
          setUserAttributes(attributes);
          setUser(user);
        }
      } catch (e) {
        PasskeysStorage.clear();
        setUser(null);
      } finally {
        setIsFetching(false);
      }
    };
    call();
  }, []);

  const login = async (user: CognitoUser) => {
    const attributes = await findUserAttributes(user);
    setUserAttributes(attributes);
    setUser(user);
  };

  const logout = () => {
    setUser(null);
    signOutUser(user);
  };

  const getLatestAttributes = async () => {
    try {
      const attributes = await findUserAttributes(user);
      setUserAttributes(attributes);
    } catch (e: any) {
      console.log(e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        getLatestAttributes,
        user,
        userAttributes,
        isFetching,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
