import { FormEvent, useState } from "react";
import { Button, Input, Text, UnstyledButton } from "@mantine/core";
import useStyle from "./styles";
import ErrorText from "../../components/ErrorText";
import { sendAccessLink } from "../../services/credentials";
import { useConfig } from "../../contexts/ConfigContext";
import { CommonFormProps, Login } from "./types";

const MagicLinkLogin = function ({
  handlerEmail,
  handlerWhichLogin,
  email,
}: CommonFormProps) {
  const { config } = useConfig();
  const { classes } = useStyle(config);
  const [error, setError] = useState("");
  const [accessLinkSent, setAccessLinkSent] = useState(false);

  const handlerSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      await sendAccessLink(email);
      setAccessLinkSent(true);
      setError("");
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <form onSubmit={handlerSubmit}>
      <div className={classes.buttonWrapper}>
        <Text fw="bold" mb="lg">
          {accessLinkSent
            ? "Please check your email for your access link"
            : "An access link will be sent to your email address"}
        </Text>

        {error && <ErrorText>{error}</ErrorText>}
        <Input
          onChange={handlerEmail}
          mb="md"
          placeholder="Email"
          type="email"
          value={email}
        />
        <Button type="submit" classNames={{ root: classes.button }}>
          {accessLinkSent ? "Resend access link" : "Send access link"}
        </Button>
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

export default MagicLinkLogin;
