import { FormEvent, useState } from "react";
import {
  Button,
  Group,
  Input,
  PinInput,
  Text,
  UnstyledButton,
} from "@mantine/core";
import { CognitoUser } from "amazon-cognito-identity-js";
import useStyle from "./styles";
import ErrorText from "../../components/ErrorText";
import * as cognito from "../../cognito/";
import { CommonFormProps, Login } from "./types";
import { useAuth } from "../../contexts/AuthContext";
import { useConfig } from "../../contexts/ConfigContext";
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
  const [user, setUser] = useState<CognitoUser | null>(null);

  const handlerSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    //if failed after 3 attempts
    if (error === AUTHENTICATION_FAILED) {
      setError("");
      setOtp("");

      //resend new code
      const user = await cognito.authenticate(email, "", "PHONE_OTP");
      setUser(user);
      return;
    }

    //after sent code
    if (codeSent) {
      setError("");
      if (!user) {
        throw new Error("User does not exist");
      }

      try {
        await cognito.respondToAuthChallenge(user, "PHONE_OTP", otp);

        const session = await cognito.getUserSession(user);
        if (session.isValid()) {
          login(user);
        } else {
          throw new Error("User failed otp");
        }
      } catch (e: any) {
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

    //first to happen
    try {
      const user = await cognito.authenticate(email, "", "PHONE_OTP");
      setCodeSent(true);
      setUser(user);
      setError("");
    } catch (e: any) {
      console.log(e);
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
              An authorization code will be sent to your phone
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
