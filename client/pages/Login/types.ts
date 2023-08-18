import { ChangeEvent } from "react";

export interface CommonFormProps {
  handlerEmail: (event: ChangeEvent<HTMLInputElement>) => void;
  handlerWhichLogin: (value: Login) => void;
  email: string;
}

export enum Login {
  RegisterPasswordless = "REGISTER_PASSWORDLESS",
  RegisterPassword = "REGISTER_PASSWORD",
  LoginPasswordless = "LOGIN_PASSWORDLESS",
  LoginPassword = "LOGIN_PASSWORD",
  EmailVerification = "EMAIL_VERIFICATION",
  CompleteRegistration = "COMPLETE_REGISTRATION",
}
