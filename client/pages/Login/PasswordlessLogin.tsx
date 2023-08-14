import { FormEvent, useState } from "react";
import { Button, Input } from "@mantine/core";
import useStyle from "./styles";
import ErrorText from "../../components/ErrorText";
import * as webauthn from "../../webauthn";
import { useAuth } from "../../contexts/AuthContext";
import { CommonFormProps, Login } from "./types";
import {
  fido2AuthenticateComplete,
  fido2AuthenticateInit,
} from "../../services/auth";

const PasswordlessLogin = function ({
  handlerUsername,
  handlerWhichLogin,
  username,
}: CommonFormProps) {
  const { classes } = useStyle();
  const [error, setError] = useState("");
  const { login } = useAuth();

  const handlerSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const initRes = await fido2AuthenticateInit(username);

      const publicKey = await webauthn.get(initRes);
      publicKey.username = username;
      publicKey.session = initRes.session;

      const user = await fido2AuthenticateComplete(publicKey);
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
          onChange={handlerUsername}
          mb="lg"
          placeholder="Username"
          value={username}
        />
        <Button type="submit" classNames={{ root: classes.button }}>
          Login passwordless
        </Button>
        <Button classNames={{ root: classes.button }} variant="outline">
          Login with magic link
        </Button>
        <Button
          onClick={() => handlerWhichLogin(Login.Password)}
          classNames={{ root: classes.button }}
          variant="outline"
        >
          Login with password
        </Button>
      </div>
    </form>
  );
};

export default PasswordlessLogin;
