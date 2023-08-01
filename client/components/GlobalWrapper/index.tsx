import useStyles from "./styles";

interface UserManagementProps {
  children: React.ReactNode;
}

const UserManagement = function ({ children }: UserManagementProps) {
  const { classes } = useStyles();
  return (
    <div className={classes.wrapper}>
      <div className={classes.innerWrapper}>{children}</div>
    </div>
  );
};

export default UserManagement;
