import { FormEvent, useState } from "react";
import { Button, Input, UnstyledButton } from "@mantine/core";
import useStyle from "./styles";
import ErrorText from "../../components/ErrorText";
import { CommonFormProps, Login } from "./types";
import { inputHandler } from "../../handlers/common";
import { useConfig } from "../../contexts/ConfigContext";
import * as cognito from "../../cognito/";

const EmailVerification = ({
  username,
  handlerWhichLogin,
}: CommonFormProps) => {
  const { config } = useConfig();
  const { classes } = useStyle(config);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const handlerSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      await cognito.confirmSignUp(username, code);
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
          onChange={inputHandler(setCode)}
          mb="lg"
          placeholder="Enter verification code"
          value={code}
        />
        <Button type="submit" classNames={{ root: classes.button }}>
          Confirm
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

export default EmailVerification;
