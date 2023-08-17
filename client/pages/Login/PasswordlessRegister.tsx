import { FormEvent, useState } from "react";
import { Button, Input, UnstyledButton } from "@mantine/core";
import useStyle from "./styles";
import ErrorText from "../../components/ErrorText";
import { CommonFormProps, Login } from "./types";
import { inputHandler } from "../../handlers/common";
import { validateEmail } from "./validations";
import { useConfig } from "../../contexts/ConfigContext";
import * as webauthn from "../../webauthn/";
import {
  fido2RegisterComplete,
  fido2RegisterInit,
} from "../../services/credentials";

const PasswordlessRegister = ({
  handlerUsername,
  handlerWhichLogin,
  username,
}: CommonFormProps) => {
  const { config } = useConfig();
  const { classes } = useStyle(config);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const handlerSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      validateEmail(email);

      const resInit = await fido2RegisterInit(username);
      const publicKey = await webauthn.create(resInit);

      const completeReqPayload = {
        ...publicKey,
        username: username,
        email: email,
      };
      await fido2RegisterComplete(completeReqPayload);

      handlerWhichLogin(Login.EmailVerification);
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <form onSubmit={handlerSubmit}>
      <div className={classes.buttonWrapper}>
        {error && <ErrorText>{error}</ErrorText>}
        <Input
          onChange={handlerUsername}
          mb="lg"
          placeholder="Username"
          value={username}
        />
        <Input
          onChange={inputHandler(setEmail)}
          mb="lg"
          placeholder="Email"
          type="email"
          value={email}
        />
        <Button type="submit" classNames={{ root: classes.button }}>
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
