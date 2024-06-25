import React from "react";
import { FormEvent, useEffect, useRef, useState } from "react";
import { Button, Input, UnstyledButton } from "@mantine/core";
import useStyle from "./styles";
import ErrorText from "../../components/ErrorText";
import * as cognito from "../../cognito/";
import { Loginid } from "../../cognito/";
import { useAuth } from "../../contexts/AuthContext";
import { useConfig } from "../../contexts/ConfigContext";
import { CommonFormProps, Login } from "./types";

const PasswordlessLogin = function ({
  handlerEmail,
  handlerWhichLogin,
  email,
}: CommonFormProps) {
  const { config } = useConfig();
  const { classes } = useStyle(config);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const [abortController] = useState(new AbortController());
  const count = useRef(0);

  useEffect(() => {
    const conditionalUI = async () => {
      try {
        const isConditionalUIAvailable =
          window.PublicKeyCredential?.isConditionalMediationAvailable;
        if (!isConditionalUIAvailable) return;

        const result = await isConditionalUIAvailable();
        if (!result) return;

        const options = { abortController: abortController };
        await Loginid.signInWithPasskeyAutofill(options);

        const user = cognito.getCurrentUser();
        await cognito.getUserSession(user);

        if (user) {
          login(user);
        }
      } catch (e) {
        setError(e.message);
      }
    };

    if (count.current === 0) {
      count.current++;
      conditionalUI();
    }

    return () => {
      count.current++;
      if (count.current < 3) return;
      abortController.abort();
    };
  }, []);

  const handlerSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      abortController.abort("Cancel conditional UI");
      await Loginid.signInPasskey(email.toLowerCase());

      //NOTE: get user session needs to be called to authenticate fully
      const user = cognito.getCurrentUser();
      await cognito.getUserSession(user);

      if (user) {
        login(user);
      }
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <form onSubmit={handlerSubmit}>
      <div className={classes.buttonWrapper}>
        {error && <ErrorText>{error}</ErrorText>}
        <Input
          onChange={handlerEmail}
          mb="lg"
          placeholder="Email"
          type="email"
          value={email}
          autoComplete="username webauthn"
        />
        <Button type="submit" size="md" classNames={{ root: classes.button }}>
          Login with passkey
        </Button>
        {/* reference for password login
        <Button
          onClick={() => handlerWhichLogin(Login.LoginPassword)}
          classNames={{ root: classes.button }}
          variant="outline"
        >
          Login with password
        </Button>*/}
        <Button
          onClick={() => handlerWhichLogin(Login.LoginEmailOTP)}
          classNames={{ root: classes.button }}
          variant="outline"
        >
          Login with email
        </Button>
        <UnstyledButton
          onClick={() => handlerWhichLogin(Login.SignUp)}
          className={classes.signupButton}
        >
          Don't have an account? <span className={classes.signup}>Sign up</span>
        </UnstyledButton>
      </div>
    </form>
  );
};

export default PasswordlessLogin;
