import { Button, Text } from "@mantine/core";
import useStyle from "./styles";
import { CommonFormProps, Login } from "./types";

const RegisterComplete = ({ handlerWhichLogin, username }: CommonFormProps) => {
  const { classes } = useStyle();
  return (
    <div>
      <Text ta="center" mb="xl">
        <span className={classes.signup}>{username}</span> is fully registered!
      </Text>
      <div className={classes.buttonWrapper}>
        <Button
          onClick={() => handlerWhichLogin(Login.LoginPasswordless)}
          classNames={{ root: classes.button }}
        >
          Login with passkey
        </Button>
        <Button
          onClick={() => handlerWhichLogin(Login.LoginPassword)}
          classNames={{ root: classes.button }}
          variant="outline"
        >
          Login with password
        </Button>
      </div>
    </div>
  );
};

export default RegisterComplete;
