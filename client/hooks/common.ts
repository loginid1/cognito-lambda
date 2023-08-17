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
