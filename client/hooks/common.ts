import { RefObject, useEffect, useRef } from "react";

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
