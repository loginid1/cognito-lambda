import { FormEvent, useState } from "react";
import { Button, Input, Text } from "@mantine/core";
import useStyle from "./styles";
import { CommonFormProps, Login } from "./types";
import { inputHandler } from "../../handlers/common";
import { passwordAuthenticate } from "../../services/auth";

const PasswordLogin = function ({
  handlerUsername,
  handlerWhichLogin,
  username,
}: CommonFormProps) {
  const { classes } = useStyle();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handlerSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    //maybe add a curtain componet for loading or button loading
    try {
      const res = await passwordAuthenticate(username, password);
      console.log(res);
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <form onSubmit={handlerSubmit}>
      <div className={classes.buttonWrapper}>
        {error && (
          <Text color="red" fw={650} mb="lg">
            {error}
          </Text>
        )}
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
