import useStyles from "./styles";
import { useConfig } from "../../contexts/ConfigContext";

interface UserManagementProps {
  children: React.ReactNode;
}

const UserManagement = function ({ children }: UserManagementProps) {
  const { config } = useConfig();
  const { classes } = useStyles(config);
  return (
    <div className={classes.wrapper}>
      <div className={classes.innerWrapper}>{children}</div>
    </div>
  );
};

export default UserManagement;
