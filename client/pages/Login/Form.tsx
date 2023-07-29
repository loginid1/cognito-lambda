import { Button, Input } from "@mantine/core";
import useStyle from "./styles";

const Login = function () {
  const { classes } = useStyle();
  return (
    <form>
      <div className={classes.buttonWrapper}>
        <Input mb="lg" placeholder="Username" />
        <Button classNames={{ root: classes.button }}>
          Login passwordless
        </Button>
        <Button classNames={{ root: classes.button }} variant="outline">
          Login with magic link
        </Button>
        <Button classNames={{ root: classes.button }} variant="outline">
          Login with password
        </Button>
      </div>
    </form>
  );
};

export default Login;
