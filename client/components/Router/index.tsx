import { useAuth } from "../../contexts/AuthContext";
import { useCheckAuthenticationCode } from "../../hooks/common";
import Login from "../../pages/Login";
import MagicLink from "../../pages/MagicLink";
import UserManagement from "../../pages/UserManagement";

/*
 * Since this application is only 2 pages, react-router-dom is not needed.
 * However, if this application were to grow, it would be a good idea to
 * use react-router-dom to handle routing.
 */
const Router = function () {
  const { user, isFetching } = useAuth();
  const { codeFound, code, email } = useCheckAuthenticationCode();

  //null could be  a loader screen
  if (isFetching) return null;

  const child = codeFound ? (
    <MagicLink code={code} email={email} />
  ) : user ? (
    <UserManagement />
  ) : (
    <Login />
  );

  return <>{child}</>;
};

export default Router;
