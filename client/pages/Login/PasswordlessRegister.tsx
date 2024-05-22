import React from "react";
import { FormEvent, useState } from "react";
import { Button, Input, UnstyledButton } from "@mantine/core";
import useStyle from "./styles";
import ErrorText from "../../components/ErrorText";
import { CommonFormProps, Login } from "./types";
import { validateEmail } from "./validations";
import { useConfig } from "../../contexts/ConfigContext";
import * as cognito from "../../cognito/";
import { Loginid } from "../../cognito/";

export interface Props extends CommonFormProps {
  password: string;
}

const PasswordlessRegister = ({
  handlerEmail,
  handlerWhichLogin,
  password,
  email,
}: Props) => {
  const { config } = useConfig();
  const { classes } = useStyle(config);
  const [error, setError] = useState("");

  const handlerSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      validateEmail(email);

      await cognito.authenticate(email, password, "PASSWORD");
      const token = await cognito.getUserIDToken(null);
      await Loginid.addPasskey(email, token);

      handlerWhichLogin(Login.CompleteRegistration);
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
        />
        <Button type="submit" size="md" classNames={{ root: classes.button }}>
          Signup with passkey
        </Button>
        <Button
          onClick={() => handlerWhichLogin(Login.RegisterPassword)}
          classNames={{ root: classes.button }}
          variant="outline"
        >
          Signup with password
        </Button>
        <UnstyledButton
          onClick={() => handlerWhichLogin(Login.LoginPasswordless)}
          className={classes.signupButton}
        >
          Already have an account?{" "}
          <span className={classes.signup}>Sign in</span>
        </UnstyledButton>
      </div>
    </form>
  );
};

export default PasswordlessRegister;
