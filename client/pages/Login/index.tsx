import { Image, Title } from "@mantine/core";
import useStyle from "./styles";
import Wrapper from "../../components/GlobalWrapper";
import Card from "../../components/Card";
import Form from "./Form";
import Footer from "./Footer";

import { LOGIN_LOGO } from "../../environment/";

const Login = function () {
  const { classes } = useStyle();
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
        <Form />
        <Footer />
      </Card>
    </Wrapper>
  );
};

export default Login;
