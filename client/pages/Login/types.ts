import { ChangeEvent } from "react";

export interface CommonFormProps {
  handlerUsername: (event: ChangeEvent<HTMLInputElement>) => void;
  handlerWhichLogin: (value: Login) => void;
  username: string;
}

export enum Login {
  Passwordless = "PASSWORDLESS",
  Password = "PASSWORD",
}
