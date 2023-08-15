import { FormEvent, useState } from "react";
import { Button, Input, UnstyledButton } from "@mantine/core";
import useStyle from "./styles";
import ErrorText from "../../components/ErrorText";
import { CommonFormProps, Login } from "./types";
import { useAuth } from "../../contexts/AuthContext";
import * as cognito from "../../cognito/";

const PasswordlessRegister = ({
  handlerUsername,
  handlerWhichLogin,
  username,
}: CommonFormProps) => {
  const { classes } = useStyle();
  const [error, setError] = useState("");
  const { login } = useAuth();

  const handlerSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
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
