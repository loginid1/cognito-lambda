import { Button, Input } from "@mantine/core";
import useStyle from "./styles";
import { CommonFormProps, Login } from "./types";

const PasswordlessLogin = function ({
  handlerUsername,
  handlerWhichLogin,
  username,
}: CommonFormProps) {
  const { classes } = useStyle();
  return (
    <form>
      <div className={classes.buttonWrapper}>
        <Input
          onChange={handlerUsername}
          mb="lg"
          placeholder="Username"
          value={username}
        />
        <Button classNames={{ root: classes.button }}>
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
