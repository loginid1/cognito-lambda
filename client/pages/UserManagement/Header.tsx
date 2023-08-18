import { Button, Text, Title } from "@mantine/core";
import userStyle from "./styles";
import { useAuth } from "../../contexts/AuthContext";

const UserManagement = function () {
  const { classes } = userStyle({});
  const { logout, userAttributes } = useAuth();
  return (
    <header className={classes.wrapper}>
      <div className={classes.header}>
        <Title mb="xs" order={2}>
          Manage account:
        </Title>
        <Button onClick={() => logout()} size="xs">
          Logout
        </Button>
      </div>
      <Text>{userAttributes.email}</Text>
    </header>
  );
};

export default UserManagement;
