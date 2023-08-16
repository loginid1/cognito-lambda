import { FormEvent, useState } from "react";
import { Button, Input, UnstyledButton } from "@mantine/core";
import useStyle from "./styles";
import ErrorText from "../../components/ErrorText";
import { CommonFormProps, Login } from "./types";
import { inputHandler } from "../../handlers/common";
import { validateEmail } from "./validations";
import * as cognito from "../../cognito/";

const PasswordRegister = ({
  handlerUsername,
  handlerWhichLogin,
  username,
}: CommonFormProps) => {
  const { classes } = useStyle();
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const handlerSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      validateEmail(email);

      const user = await cognito.signUp(
        username.toLowerCase(),
        email,
        password
      );
      if (user) {
        handlerWhichLogin(Login.EmailVerification);
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
        <Input
          onChange={inputHandler(setEmail)}
          mb="lg"
          placeholder="Email"
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
          Signup with password
        </Button>
        <Button
          onClick={() => handlerWhichLogin(Login.RegisterPasswordless)}
          classNames={{ root: classes.button }}
          variant="outline"
        >
          Signup with passkey
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

export default PasswordRegister;
