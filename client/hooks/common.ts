import {
  Dispatch,
  RefObject,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import { Credential, credentialList } from "../services/loginid";

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
  const [passkeys, setPasskeys] = useState<Credential[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const resources = [credentialList()];
        const fetched = await Promise.all(resources);
        const [fetchedCredentialsData] = fetched;

        const { credentials } = fetchedCredentialsData;

        setPasskeys(credentials);
        setLoading(false);
      } catch (e: any) {
        console.error(e);
        setError(e.message);
        setLoading(false);
      }
    };
    fetchResources();
  }, []);

  return { passkeys, setPasskeys, loading, error };
};
