import { Text, Title } from "@mantine/core";
import userStyle from "./styles";

const UserManagement = function () {
  const { classes } = userStyle();
  return (
    <header className={classes.wrapper}>
      <Title mb="xs" order={2}>
        Manage account:
      </Title>
      <Text>Michael Braga (michael@loginid.io)</Text>
    </header>
  );
};

export default UserManagement;
