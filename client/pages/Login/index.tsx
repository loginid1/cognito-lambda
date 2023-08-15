import { useState } from "react";
import { Image, Title } from "@mantine/core";
import { inputHandler } from "../../handlers/common";
import { Login as LoginEnum } from "./types";
import useStyle from "./styles";
import Wrapper from "../../components/GlobalWrapper";
import Card from "../../components/Card";
import PasswordlessLogin from "./PasswordlessLogin";
import PasswordLogin from "./PasswordLogin";
import PasswordlessRegister from "./PasswordlessRegister";
import PasswordRegister from "./PasswordRegister";
import EmailVerification from "./EmailVerification";
import RegisterComplete from "./RegisterComplete";
import Footer from "./Footer";

import { LOGIN_LOGO } from "../../environment/";

const Login = function () {
  const { classes } = useStyle();
  const [username, setUsername] = useState("");
  const [whichLogin, setWhichLogin] = useState(LoginEnum.LoginPasswordless);

  const handlerUsername = inputHandler(setUsername);
  const handlerWhichLogin = (value: LoginEnum) => {
    return setWhichLogin(value);
  };

  let Form;
  switch (whichLogin) {
    case LoginEnum.LoginPasswordless:
      Form = (
        <PasswordlessLogin
          handlerUsername={handlerUsername}
          handlerWhichLogin={handlerWhichLogin}
          username={username}
        />
      );
      break;

    case LoginEnum.LoginPassword:
      Form = (
        <PasswordLogin
          handlerUsername={handlerUsername}
          handlerWhichLogin={handlerWhichLogin}
          username={username}
        />
      );
      break;

    case LoginEnum.RegisterPasswordless:
      Form = (
        <PasswordlessRegister
          handlerUsername={handlerUsername}
          handlerWhichLogin={handlerWhichLogin}
          username={username}
        />
      );
      break;

    case LoginEnum.RegisterPassword:
      Form = (
        <PasswordRegister
          handlerUsername={handlerUsername}
          handlerWhichLogin={handlerWhichLogin}
          username={username}
        />
      );
      break;

    case LoginEnum.EmailVerification:
      Form = (
        <EmailVerification
          handlerUsername={handlerUsername}
          handlerWhichLogin={handlerWhichLogin}
          username={username}
        />
      );
      break;

    case LoginEnum.CompleteRegistration:
      Form = (
        <RegisterComplete
          handlerUsername={handlerUsername}
          handlerWhichLogin={handlerWhichLogin}
          username={username}
        />
      );
      break;
  }

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
        {Form}
        <Footer />
      </Card>
    </Wrapper>
  );
};

export default Login;
