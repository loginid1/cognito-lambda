import { FormEvent, useState } from "react";
import { Button, Input, UnstyledButton } from "@mantine/core";
import useStyle from "./styles";
import ErrorText from "../../components/ErrorText";
import { CommonFormProps, Login } from "./types";
import { inputHandler } from "../../handlers/common";
import { useAuth } from "../../contexts/AuthContext";
import { useConfig } from "../../contexts/ConfigContext";
import * as cognito from "../../cognito/";

const PasswordLogin = function ({
  handlerEmail,
  handlerWhichLogin,
  email,
}: CommonFormProps) {
  const { config } = useConfig();
  const { classes } = useStyle(config);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();

  const handlerSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    //maybe add a curtain componet for loading or button loading
    try {
      const user = await cognito.authenticate(email, password, "PASSWORD");
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
          mb="5px"
          placeholder="Username"
          type="email"
          value={email}
        />
        <Input
          onChange={inputHandler(setPassword)}
          type="password"
          mb="lg"
          placeholder="Password"
          value={password}
        />
        <Button type="submit" classNames={{ root: classes.button }}>
          Login with password
        </Button>
        <Button
          onClick={() => handlerWhichLogin(Login.LoginPasswordless)}
          classNames={{ root: classes.button }}
          variant="outline"
        >
          Login with passwordless
        </Button>
        <Button classNames={{ root: classes.button }} variant="outline">
          Login with magic link
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

export default PasswordLogin;
