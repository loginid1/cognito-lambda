import { FormEvent, useState } from "react";
import { Button, Input, UnstyledButton } from "@mantine/core";
import useStyle from "./styles";
import ErrorText from "../../components/ErrorText";
import * as cognito from "../../cognito/";
import { useAuth } from "../../contexts/AuthContext";
import { useConfig } from "../../contexts/ConfigContext";
import { CommonFormProps, Login } from "./types";

const PasswordlessLogin = function ({
  handlerUsername,
  handlerWhichLogin,
  username,
}: CommonFormProps) {
  const { config } = useConfig();
  const { classes } = useStyle(config);
  const [error, setError] = useState("");
  const { login } = useAuth();

  const handlerSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const user = await cognito.authenticate(
        username.toLowerCase(),
        "",
        "FIDO2"
      );
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
          onChange={handlerUsername}
          mb="lg"
          placeholder="Username"
          value={username}
        />
        <Button type="submit" classNames={{ root: classes.button }}>
          Login with passkey
        </Button>
        <Button classNames={{ root: classes.button }} variant="outline">
          Login with magic link
        </Button>
        <Button
          onClick={() => handlerWhichLogin(Login.LoginPassword)}
          classNames={{ root: classes.button }}
          variant="outline"
        >
          Login with password
        </Button>
        <UnstyledButton
          onClick={() => handlerWhichLogin(Login.RegisterPasswordless)}
          className={classes.signupButton}
        >
          Don't have an account? <span className={classes.signup}>Sign up</span>
        </UnstyledButton>
      </div>
    </form>
  );
};

export default PasswordlessLogin;
