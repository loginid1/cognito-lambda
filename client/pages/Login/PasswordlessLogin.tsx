import { FormEvent, useState } from "react";
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

  const handlerSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
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
        />
        <Button type="submit" size="md" classNames={{ root: classes.button }}>
          Login with passkey
        </Button>
        <Button
          onClick={() => handlerWhichLogin(Login.LoginPassword)}
          classNames={{ root: classes.button }}
          variant="outline"
        >
          Login with password
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
