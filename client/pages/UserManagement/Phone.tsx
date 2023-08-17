import { Text, Title } from "@mantine/core";
import userStyle from "./styles";
import EditIcon from "../../icons/Edit";
import { SmallIconButton } from "../../components/Button/";
import { useAuth } from "../../contexts/AuthContext";
import { useConfig } from "../../contexts/ConfigContext";

const PhoneSection = function () {
  const { config } = useConfig();
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
          <Text color={config.buttons_color} fw="bold" display="inline">
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
