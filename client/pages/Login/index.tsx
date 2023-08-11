import { useState } from "react";
import { Image, Title } from "@mantine/core";
import { inputHandler } from "../../handlers/common";
import { Login as LoginEnum } from "./types";
import useStyle from "./styles";
import Wrapper from "../../components/GlobalWrapper";
import Card from "../../components/Card";
import PasswordlessLogin from "./PasswordlessLogin";
import PasswordLogin from "./PasswordLogin";
import Footer from "./Footer";

import { LOGIN_LOGO } from "../../environment/";

const Login = function () {
  const { classes } = useStyle();
  const [username, setUsername] = useState("");
  const [whichLogin, setWhichLogin] = useState(LoginEnum.Passwordless);

  const handlerUsername = inputHandler(setUsername);
  const handlerWhichLogin = (value: LoginEnum) => {
    return setWhichLogin(value);
  };

  return (
    <Wrapper>
      <Card>
        <Image
          classNames={{ root: classes.logo }}
          src={LOGIN_LOGO}
          alt="Logo"
        />
        <Title className={classes.header} order={2}>
          Unified Technology Industries
        </Title>
        {whichLogin === LoginEnum.Password ? (
          <PasswordLogin
            handlerUsername={handlerUsername}
            handlerWhichLogin={handlerWhichLogin}
            username={username}
          />
        ) : (
          <PasswordlessLogin
            handlerUsername={inputHandler(setUsername)}
            handlerWhichLogin={handlerWhichLogin}
            username={username}
          />
        )}
        <Footer />
      </Card>
    </Wrapper>
  );
};

export default Login;
