import { Image, Loader, Text } from "@mantine/core";
import { useConfig } from "../../contexts/ConfigContext";
import { useMagicLink } from "../../hooks/common";
import useStyles from "./styles";
import Wrapper from "../../components/GlobalWrapper";
import Card from "../../components/Card";

interface Props {
  email: string;
  code: string;
}

const MagicLink = ({ code, email }: Props) => {
  const { config } = useConfig();
  const { classes } = useStyles();
  const [loading, error] = useMagicLink(email, code);

  return (
    <Wrapper>
      <Card>
        <Image
          maw={240}
          mx="auto"
          mb="50px"
          src={config.login_logo}
          alt="Logo"
        />
        <div className={classes.loaderWrapper}>
          {loading && (
            <Loader
              variant="dots"
              maw="100%"
              size="xl"
              color={config?.buttons_color}
            />
          )}
        </div>
        <Text align="center" fw="bold" fz="xl">
          {error
            ? "Authentication failed, invalid access link"
            : "Verifying your access link"}
        </Text>
      </Card>
    </Wrapper>
  );
};

export default MagicLink;
