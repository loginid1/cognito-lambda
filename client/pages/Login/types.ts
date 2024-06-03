import { ChangeEvent } from "react";

export interface CommonFormProps {
  handlerEmail: (event: ChangeEvent<HTMLInputElement>) => void;
  handlerWhichLogin: (value: Login) => void;
  email: string;
}

export enum Login {
  SignUp = "SIGN_UP",
  RegisterPasswordless = "REGISTER_PASSWORDLESS",
  RegisterPassword = "REGISTER_PASSWORD",
  LoginPasswordless = "LOGIN_PASSWORDLESS",
  LoginPassword = "LOGIN_PASSWORD",
  LoginPhoneOTP = "LOGIN_PHONE_OTP",
  LoginEmailOTP = "LOGIN_EMAIL_OTP",
  LoginMagicLink = "LOGIN_MAGIC_LINK",
  EmailVerification = "EMAIL_VERIFICATION",
  CompleteRegistration = "COMPLETE_REGISTRATION",
}
