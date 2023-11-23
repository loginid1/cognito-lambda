import { FormEvent, useState } from "react";
import { Button, Input, UnstyledButton } from "@mantine/core";
import useStyle from "./styles";
import ErrorText from "../../components/ErrorText";
import { CommonFormProps, Login } from "./types";
import { validateEmail } from "./validations";
import { useConfig } from "../../contexts/ConfigContext";
import * as cognito from "../../cognito";

export interface Props extends CommonFormProps {
  handlerPassword: (password: string) => void;
}

const PasswordlessRegister = ({
  handlerEmail,
  handlerWhichLogin,
  handlerPassword,
  email,
}: Props) => {
  const { config } = useConfig();
  const { classes } = useStyle(config);
  const [error, setError] = useState("");

  const handlerSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      validateEmail(email);

      const password = Math.random().toString(36).slice(-16) + "X";
      email = email.toLowerCase();
      await cognito.signUp(email, email, password);

      handlerPassword(password);
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
          onChange={handlerEmail}
          mb="lg"
          placeholder="Email"
          type="email"
          value={email}
        />
        <Button type="submit" size="md" classNames={{ root: classes.button }}>
          Continue
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
