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
import MagicLinkLogin from "./MagicLinkLogin";
import EmailVerification from "./EmailVerification";
import RegisterComplete from "./RegisterComplete";
import SignUp from "./SignUp";
import Footer from "./Footer";
import { useConfig } from "../../contexts/ConfigContext";

const Login = function () {
  const { config } = useConfig();
  const { classes } = useStyle(config);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [whichLogin, setWhichLogin] = useState(LoginEnum.LoginPasswordless);

  const handlerEmail = inputHandler(setEmail);
  const handlerWhichLogin = (value: LoginEnum) => {
    return setWhichLogin(value);
  };
  const handlerPassword = (password: string) => {
    setPassword(password);
  };

  let Form;
  switch (whichLogin) {
    case LoginEnum.LoginPasswordless:
      Form = (
        <PasswordlessLogin
          handlerEmail={handlerEmail}
          handlerWhichLogin={handlerWhichLogin}
          email={email}
        />
      );
      break;

    case LoginEnum.LoginPassword:
      Form = (
        <PasswordLogin
          handlerEmail={handlerEmail}
          handlerWhichLogin={handlerWhichLogin}
          email={email}
        />
      );
      break;

    case LoginEnum.RegisterPasswordless:
      Form = (
        <PasswordlessRegister
          handlerEmail={handlerEmail}
          handlerWhichLogin={handlerWhichLogin}
          password={password}
          email={email}
        />
      );
      break;

    case LoginEnum.RegisterPassword:
      Form = (
        <PasswordRegister
          handlerEmail={handlerEmail}
          handlerWhichLogin={handlerWhichLogin}
          email={email}
          randomPassword={password}
        />
      );
      break;

    case LoginEnum.EmailVerification:
      Form = (
        <EmailVerification
          handlerEmail={handlerEmail}
          handlerWhichLogin={handlerWhichLogin}
          email={email}
        />
      );
      break;

    case LoginEnum.CompleteRegistration:
      Form = (
        <RegisterComplete
          handlerEmail={handlerEmail}
          handlerWhichLogin={handlerWhichLogin}
          email={email}
        />
      );
      break;

    case LoginEnum.LoginMagicLink:
      Form = (
        <MagicLinkLogin
          handlerEmail={handlerEmail}
          handlerWhichLogin={handlerWhichLogin}
          email={email}
        />
      );
      break;

    case LoginEnum.SignUp:
      Form = (
        <SignUp
          handlerEmail={handlerEmail}
          handlerWhichLogin={handlerWhichLogin}
          handlerPassword={handlerPassword}
          email={email}
        />
      );
      break;
  }

  return (
    <Wrapper>
      <Card>
        <Image
          maw={240}
          classNames={{ root: classes.logo }}
          src={config.login_logo}
          alt="Logo"
        />
        <Title className={classes.header} order={2}>
          {config?.company_name}
        </Title>
        {Form}
        <Footer />
      </Card>
    </Wrapper>
  );
};

export default Login;
