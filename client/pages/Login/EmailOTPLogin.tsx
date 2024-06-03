import React from "react";
import { FormEvent, useState } from "react";
import {
  Button,
  Group,
  Input,
  PinInput,
  Text,
  UnstyledButton,
} from "@mantine/core";
import useStyle from "./styles";
import ErrorText from "../../components/ErrorText";
import { CommonFormProps, Login } from "./types";
import { useAuth } from "../../contexts/AuthContext";
import { useConfig } from "../../contexts/ConfigContext";
import { Loginid, getUserSession, getCurrentUser } from "../../cognito";
import {
  AUTHENTICATION_FAILED,
  INVALID_AUTHENTICATION_CODE,
} from "../../errors";

const PhoneOTPLogin = function ({
  handlerEmail,
  handlerWhichLogin,
  email,
}: CommonFormProps) {
  const { config } = useConfig();
  const { classes } = useStyle(config);
  const { login } = useAuth();
  const [error, setError] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [otp, setOtp] = useState("");

  const handlerSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (codeSent) {
      setError("");
      try {
        const res = await Loginid.completeEmailOTP(otp);
        if (res === null) {
          setError(INVALID_AUTHENTICATION_CODE);
          return;
        }

        const user = getCurrentUser();
        if (!user) {
          throw new Error("User does not exist");
        }

        const session = await getUserSession(user);
        if (session.isValid()) {
          login(user);
        } else {
          throw new Error("User failed otp");
        }
      } catch (e) {
        //Please authenticate means that the user does not have any session going on
        if (
          e.message.includes("Please authenticate") ||
          e.message.includes("User failed otp")
        ) {
          setError(INVALID_AUTHENTICATION_CODE);
        } else if (e.message.includes("Incorrect username or password.")) {
          setError(AUTHENTICATION_FAILED);
        } else {
          setError(e.message);
        }
      }
      return;
    }

    try {
      await Loginid.initializeEmailOTP(email);
      setCodeSent(true);
      setError("");
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <form onSubmit={handlerSubmit}>
      <div className={classes.buttonWrapper}>
        {error && <ErrorText>{error}</ErrorText>}
        {!codeSent && (
          <>
            <Input
              onChange={handlerEmail}
              mb="xl"
              placeholder="Email"
              type="email"
              value={email}
            />
            <Text mb="lg">
              An authorization code will be sent to your email
            </Text>
            <Button type="submit" classNames={{ root: classes.button }}>
              Send code
            </Button>
          </>
        )}
        {codeSent && (
          <>
            <Group position="center">
              <PinInput
                ta="center"
                onChange={(value) => setOtp(value)}
                type="number"
                oneTimeCode
                placeholder=" "
                length={6}
                value={otp}
                mb="xl"
                size="lg"
              />
            </Group>
            <Button type="submit" classNames={{ root: classes.button }}>
              {error === AUTHENTICATION_FAILED ? "Resend Code" : "Send Code"}
            </Button>
          </>
        )}
        <Button
          onClick={() => handlerWhichLogin(Login.LoginPasswordless)}
          classNames={{ root: classes.button }}
          variant="outline"
        >
          Back
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

export default PhoneOTPLogin;
