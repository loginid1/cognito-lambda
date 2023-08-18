import { useState } from "react";
import { Text, Title } from "@mantine/core";
import userStyle from "./styles";
import EditIcon from "../../icons/Edit";
import AddPhoneModal from "./AddPhoneModal";
import { SmallIconButton } from "../../components/Button/";
import { CognitoUserAttribute } from "amazon-cognito-identity-js";
import { updateUserAttributes } from "../../cognito";
import { useAuth } from "../../contexts/AuthContext";
import { useConfig } from "../../contexts/ConfigContext";

const PhoneSection = function () {
  const { config } = useConfig();
  const { classes } = userStyle(config);
  const { getLatestAttributes, user, userAttributes } = useAuth();
  const [openModal, setOpenModal] = useState(false);
  const [error, setError] = useState("");

  const handleUpdatePhone = async (phoneNumber: string) => {
    const attributeList = [];
    const data = {
      Name: "phone_number",
      Value: phoneNumber,
    };
    const attribute = new CognitoUserAttribute(data);

    attributeList.push(attribute);
    try {
      await updateUserAttributes(user, attributeList);
      await getLatestAttributes();
      setOpenModal(false);
    } catch (e: any) {
      console.log(e);
      setError(e.message);
    }
  };

  return (
    <div className={classes.wrapper}>
      <Title mb={userAttributes.phoneNumber ? "xs" : "lg"} order={4}>
        My phone number
      </Title>
      {userAttributes.phoneNumber && (
        <Text mb="md">
          Your phone number is{" "}
          <Text color={config.buttons_color} fw="bold" display="inline">
            {userAttributes.phoneNumber}
          </Text>
        </Text>
      )}
      <SmallIconButton
        onClick={() => setOpenModal(true)}
        leftIcon={<EditIcon fill="white" />}
      >
        {userAttributes.phoneNumber
          ? "Change my phone number"
          : "Add my phone number"}
      </SmallIconButton>

      {/*Add Phone Modal*/}
      <AddPhoneModal
        error={error}
        handleUpdatePhone={handleUpdatePhone}
        opened={openModal}
        onClose={() => setOpenModal(false)}
      />
    </div>
  );
};

export default PhoneSection;
