import { useState } from "react";
import { Text, Title } from "@mantine/core";
import { CognitoUserAttribute } from "amazon-cognito-identity-js";
import userStyle from "./styles";
import EditIcon from "../../icons/Edit";
import AddPhoneModal from "./AddPhoneModal";
import { SmallIconButton } from "../../components/Button/";
import { maskPhoneNumber } from "./phoneValidations";
import { useAuth } from "../../contexts/AuthContext";
import { useConfig } from "../../contexts/ConfigContext";
import {
  deleteUserAttributes,
  getUserIDToken,
  updateUserAttributes,
} from "../../cognito";
import {
  credentialList,
  credentialsPhoneComplete,
  credentialsPhoneInit,
  revokeCredential,
} from "../../services/credentials";

const PhoneSection = function () {
  const { config } = useConfig();
  const { classes } = userStyle(config);
  const { getLatestAttributes, user, userAttributes } = useAuth();
  const [retryCount, setRetryCount] = useState(0);
  const [tempCredentialUUID, setTempCredentialUUID] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [error, setError] = useState("");

  const handleInit = async (phoneNumber: string) => {
    try {
      const token = await getUserIDToken(user);
      const res = await credentialsPhoneInit(phoneNumber, "sms", token);
      setTempCredentialUUID(res?.credential_uuid || "");
      setError("");
    } catch (e: any) {
      console.log(e);
      setError(e.message);
      throw e;
    }
  };

  const handleComplete = async (phoneNumber: string, otp: string) => {
    try {
      const token = await getUserIDToken(user);
      //complete on loginid
      await credentialsPhoneComplete(
        tempCredentialUUID,
        phoneNumber,
        otp,
        token
      );

      //complete on cognito
      const list = [];
      const attribute = {
        Name: "phone_number",
        Value: phoneNumber,
      };
      list.push(new CognitoUserAttribute(attribute));

      //attempt to update if it fails revoke loginid credential
      try {
        await updateUserAttributes(user, list);
      } catch (e) {
        await revokeCredential(tempCredentialUUID, token);
        throw e;
      }

      await getLatestAttributes();
      setOpenModal(false);
      setError("");
    } catch (e: any) {
      console.log(e);
      setError(e.message);
      setRetryCount((count) => count + 1);
      if (retryCount >= 2) {
        setError("Retry limit reached");
      }
      throw e;
    }
  };

  const handleRevoke = async () => {
    try {
      const token = await getUserIDToken(user);
      const { credentials } = await credentialList(token, "phone_otp");
      if (credentials.length === 0) {
        throw new Error("No credentials to revoke");
      }

      const cred = credentials.find((cred) => {
        const last4 = cred.name.slice(-4);
        if (userAttributes.phoneNumber?.endsWith(last4)) {
          return true;
        }
      });

      if (cred) {
        await revokeCredential(cred.uuid, token);
        await deleteUserAttributes(user, ["phone_number"]);
        await getLatestAttributes();
        setOpenModal(false);
      }
    } catch (e: any) {
      console.log(e);
      setError(e.message);
      throw e;
    }
  };

  const handleClose = () => {
    setOpenModal(false);
    setError("");
    setRetryCount(0);
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
            {maskPhoneNumber(userAttributes.phoneNumber)}
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
        allowRetry={retryCount < 3}
        error={error}
        handleInit={handleInit}
        handleComplete={handleComplete}
        handleRevoke={handleRevoke}
        opened={openModal}
        onClose={handleClose}
        userPhoneNumber={userAttributes?.phoneNumber || ""}
      />
    </div>
  );
};

export default PhoneSection;
