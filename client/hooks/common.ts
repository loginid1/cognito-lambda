import {
  Dispatch,
  RefObject,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import { useAuth } from "../contexts/AuthContext";
import { getUserIDToken } from "../cognito";
import { PasskeysStorage } from "../storage/passkeys";
import { credentialList } from "../services/credentials";
import { Credential } from "../services/types";
import * as cognito from "../cognito/";

//can be generic
export const useRefFocus = (value: boolean): RefObject<HTMLInputElement> => {
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (value) {
      inputRef.current?.focus();
    } else {
      inputRef.current?.blur();
    }
  }, [value]);
  return inputRef;
};

interface Resources {
  passkeys: Credential[];
  setPasskeys: Dispatch<SetStateAction<Credential[]>>;
  loading: boolean;
  error: string;
}

//might want to have a better error handling method for each resource
//if needed
export const useFetchResources = (): Resources => {
  const [passkeys, setPasskeys] = useState<Credential[]>(
    PasskeysStorage.get("[]")
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const token = await getUserIDToken(user);

        const resources = [credentialList(token)];
        const fetched = await Promise.all(resources);
        const [fetchedCredentialsData] = fetched;

        const { credentials } = fetchedCredentialsData;

        //set to local storage cache
        PasskeysStorage.set(credentials);

        setPasskeys(credentials);
        setLoading(false);
      } catch (e: any) {
        console.error(e);
        setError(e.message);
        setLoading(false);
      }
    };
    fetchResources();
  }, [user]);

  return { passkeys, setPasskeys, loading, error };
};

export const useCheckAuthenticationCode = () => {
  const [codeFound, setCodeFound] = useState(false);
  const url = new URL(window.location.href);
  const params = new URLSearchParams(url.search);
  const code = params.get("code") || "";
  const email = params.get("email") || "";

  useEffect(() => {
    const verify = url.pathname === "/verify" && code && email;
    if (verify) {
      setCodeFound(true);
    }
  }, []);

  return { codeFound, code, email };
};

/*
 * Becareful when using this hook in React strict mode.
 * To test this out make sure strict mode is off or a double request will
 * occur and might fail authentication.
 */
export const useMagicLink = (email: string, code: string) => {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const call = async () => {
      try {
        const user = await cognito.authenticate(email, code, "MAGIC_LINK");
        if (user) {
          await login(user);
          //redirect to base url
          window.location.href = window.location.origin;
        }
      } catch (e: any) {
        console.log(e);
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    setLoading(true);
    call();
  }, []);

  return [loading, error];
};
