import Wrapper from "../../components/GlobalWrapper";
import Card from "../../components/Card";
import Header from "./Header";
import Passkeys from "./Passkeys";

const UserManagement = function () {
  return (
    <Wrapper>
      <Card>
        <Header />
        <Passkeys />
      </Card>
    </Wrapper>
  );
};

export default UserManagement;
