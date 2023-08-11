import { ChangeEvent, Dispatch, SetStateAction } from "react";

export const inputHandler = (setter: Dispatch<SetStateAction<string>>) => {
  return (event: ChangeEvent<HTMLInputElement>) => {
    return setter(event.target.value);
  };
};

export const flipHandler = (setter: Dispatch<SetStateAction<boolean>>) => {
  return () => {
    return setter((value) => !value);
  };
};
