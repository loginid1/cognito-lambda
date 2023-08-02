import Wrapper from "../../components/GlobalWrapper";
import Card from "../../components/Card";
import Header from "./Header";
import Passkeys from "./Passkeys";
import PhoneSection from "./Phone";

const UserManagement = function () {
  return (
    <Wrapper>
      <Card>
        <Header />
        <Passkeys />
        <PhoneSection />
      </Card>
    </Wrapper>
  );
};

export default UserManagement;
