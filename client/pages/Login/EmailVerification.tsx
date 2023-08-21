import { FormEvent, useState } from "react";
import { Button, Group, PinInput, Text, UnstyledButton } from "@mantine/core";
import useStyle from "./styles";
import ErrorText from "../../components/ErrorText";
import { CommonFormProps, Login } from "./types";
import { useConfig } from "../../contexts/ConfigContext";
import * as cognito from "../../cognito/";

const EmailVerification = ({ email, handlerWhichLogin }: CommonFormProps) => {
  const { config } = useConfig();
  const { classes } = useStyle(config);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const handlerSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      await cognito.confirmSignUp(email.toLowerCase(), code);
      handlerWhichLogin(Login.CompleteRegistration);
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <form onSubmit={handlerSubmit}>
      <div className={classes.buttonWrapper}>
        {error && <ErrorText>{error}</ErrorText>}
        <Text mb="md" fw="bold" ta="center">
          Please check your email for a verification code
        </Text>
        <Group position="center">
          <PinInput
            ta="center"
            onChange={(value) => setCode(value)}
            type="number"
            oneTimeCode
            placeholder=" "
            length={6}
            value={code}
            mb="xl"
            size="lg"
          />
        </Group>
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
