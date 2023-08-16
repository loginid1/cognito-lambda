import { Text, Title } from "@mantine/core";
import userStyle from "./styles";
import EditIcon from "../../icons/Edit";
import { SmallIconButton } from "../../components/Button/";
import { BUTTONS_COLOR } from "../../environment";
import { useAuth } from "../../contexts/AuthContext";

const PhoneSection = function () {
  const { classes } = userStyle();
  const { userAttributes } = useAuth();
  return (
    <div className={classes.wrapper}>
      <Title mb={userAttributes.phoneNumber ? "xs" : "lg"} order={4}>
        My phone number
      </Title>
      {userAttributes.phoneNumber && (
        <Text mb="md">
          Your phone number is{" "}
          <Text color={BUTTONS_COLOR} fw="bold" display="inline">
            +1 853 *** *** 2341
          </Text>
        </Text>
      )}
      {userAttributes.phoneNumber ? (
        <SmallIconButton
          onClick={() => console.log("change me")}
          leftIcon={<EditIcon fill="white" />}
        >
          Change my phone number
        </SmallIconButton>
      ) : (
        <SmallIconButton
          onClick={() => console.log("change me")}
          leftIcon={<EditIcon fill="white" />}
        >
          Add a phone number
        </SmallIconButton>
      )}
    </div>
  );
};

export default PhoneSection;
