import { Text, Title } from "@mantine/core";
import userStyle from "./styles";
import { useAuth } from "../../contexts/AuthContext";

const UserManagement = function () {
  const { classes } = userStyle();
  const { userAttributes } = useAuth();
  return (
    <header className={classes.wrapper}>
      <Title mb="xs" order={2}>
        Manage account:
      </Title>
      <Text>
        {userAttributes.username} ({userAttributes.email})
      </Text>
    </header>
  );
};

export default UserManagement;
