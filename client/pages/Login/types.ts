import { ChangeEvent } from "react";

export interface CommonFormProps {
  handlerUsername: (event: ChangeEvent<HTMLInputElement>) => void;
  handlerWhichLogin: (value: Login) => void;
  username: string;
}

export enum Login {
  RegisterPasswordless = "REGISTER_PASSWORDLESS",
  RegisterPassword = "REGISTER_PASSWORD",
  LoginPasswordless = "LOGIN_PASSWORDLESS",
  LoginPassword = "LOGIN_PASSWORD",
  EmailVerification = "EMAIL_VERIFICATION",
  CompleteRegistration = "COMPLETE_REGISTRATION",
}
