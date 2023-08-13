import { FormEvent, useState } from "react";
import { Button, Input } from "@mantine/core";
import useStyle from "./styles";
import ErrorText from "../../components/ErrorText";
import { CommonFormProps, Login } from "./types";
import { inputHandler } from "../../handlers/common";
import { passwordAuthenticate } from "../../services/auth";
import { useAuth } from "../../contexts/AuthContext";

const PasswordLogin = function ({
  handlerUsername,
  handlerWhichLogin,
  username,
}: CommonFormProps) {
  const { classes } = useStyle();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();

  const handlerSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    //maybe add a curtain componet for loading or button loading
    try {
      const user = await passwordAuthenticate(username, password);
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
        <Input
          onChange={inputHandler(setPassword)}
          type="password"
          mb="lg"
          placeholder="Password"
          value={password}
        />
        <Button type="submit" classNames={{ root: classes.button }}>
          Login with password
        </Button>
        <Button
          onClick={() => handlerWhichLogin(Login.Passwordless)}
          classNames={{ root: classes.button }}
          variant="outline"
        >
          Login with passwordless
        </Button>
        <Button classNames={{ root: classes.button }} variant="outline">
          Login with magic link
        </Button>
      </div>
    </form>
  );
};

export default PasswordLogin;
