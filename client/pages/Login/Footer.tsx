import { Anchor, Text } from "@mantine/core";
import useStyle from "./styles";

const Footer = function () {
  const { classes } = useStyle();
  return (
    <footer className={classes.footer}>
      <Text size="xs" fw={500}>
        Copyright @ UTI 2023
      </Text>
      <Anchor size="xs" fw={500} href="https://example.com" target="_blank">
        Privacy policy
      </Anchor>
    </footer>
  );
};

export default Footer;
