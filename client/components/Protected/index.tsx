import { Children } from "react";
import { useAuth } from "../../contexts/AuthContext";

interface Props {
  children: React.ReactNode;
}

/*
 * Since this application is only 2 pages, react-router-dom is not needed.
 * However, if this application were to grow, it would be a good idea to
 * use react-router-dom to handle routing.
 */
const Protected = function ({ children }: Props) {
  const { user, isFetching } = useAuth();
  const [protectedChild, defaultChild] = Children.toArray(children);
  return <>{isFetching ? null : user ? protectedChild : defaultChild}</>;
  //return <>{user ? protectedChild : defaultChild}</>;
};

export default Protected;
