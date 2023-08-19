import { useState } from "react";
import { Button, Group, Modal, PinInput, Text } from "@mantine/core";
import { useConfig } from "../../contexts/ConfigContext";
import { cleanPhoneNumber } from "./phoneValidations";
import useStyles from "./styles";
import ErrorText from "../../components/ErrorText";
import {
  PhoneInput,
  defaultCountries,
  parseCountry,
} from "react-international-phone";

type ModalView = "ADD" | "REVOKE" | "CONFIRM_ADD" | "CONFIRM_REVOKE";

interface Props {
  error: string;
  onClose: () => void;
  opened: boolean;
  handleInit: (a: string) => Promise<void>;
  handleComplete: (a: string, b: string) => Promise<void>;
  handleRevoke: () => Promise<void>;
  userPhoneNumber: string;
  allowRetry: boolean;
}

//LoginID only accepts American/Candian phone numbers
const countries = defaultCountries.filter((country) => {
  const { iso2 } = parseCountry(country);
  return ["ca", "us"].includes(iso2);
});

const AddPhoneModal = function ({
  allowRetry,
  error,
  handleInit,
  handleComplete,
  handleRevoke,
  onClose,
  opened,
  userPhoneNumber,
}: Props) {
  const { config } = useConfig();
  const { classes } = useStyles(config);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [view, setView] = useState<ModalView>(
    userPhoneNumber ? "REVOKE" : "ADD"
  );

  const handleEnteredPhoneNumber = async () => {
    try {
      await handleInit(cleanPhoneNumber(phoneNumber));
      setView("CONFIRM_ADD");
      setOtp("");
    } catch (e: any) {
      console.log(e);
    }
  };

  const handleConfirmedPhoneNumber = async () => {
    try {
      await handleComplete(cleanPhoneNumber(phoneNumber), otp);
      setView("REVOKE");
    } catch (e: any) {
      console.log(e);
    }
  };

  const handleRevokedPhoneNumber = async () => {
    try {
      await handleRevoke();
      setView("ADD");
    } catch (e: any) {
      console.log(e);
    }
  };

  const handleOnClose = () => {
    setPhoneNumber("");
    setOtp("");
    setView(userPhoneNumber ? "REVOKE" : "ADD");
    onClose();
  };

  return (
    <Modal onClose={handleOnClose} opened={opened} centered={true}>
      <div className={classes.modalWrapper}>
        {view === "ADD" ? (
          <>
            <Text fw="bold" mb="xl" ta="center">
              Please enter your phone number:
            </Text>
            {error && <ErrorText>{error}</ErrorText>}
            <PhoneInput
              className={classes.phoneInputWrapper}
              inputClassName={classes.phoneInput}
              defaultCountry="ca"
              countries={countries}
              onChange={(phoneNumber: string) => setPhoneNumber(phoneNumber)}
            />
            <Button onClick={handleEnteredPhoneNumber}>Next</Button>
          </>
        ) : view === "CONFIRM_ADD" ? (
          <>
            <Text fw="bold" mb="xl" ta="center">
              Please enter the 6-digit verification code
            </Text>
            <Text fw="bold" size="lg" mb="xl" ta="center">
              <span className={classes.span}>{phoneNumber}</span>
            </Text>
            {error && <ErrorText>{error}</ErrorText>}
            <Group position="center">
              <PinInput
                onChange={(value) => setOtp(value)}
                type="number"
                oneTimeCode
                placeholder=" "
                disabled={!allowRetry}
                length={6}
                value={otp}
                mb="xl"
                size="lg"
              />
            </Group>
            <Button onClick={handleConfirmedPhoneNumber} disabled={!allowRetry}>
              Confirm
            </Button>
          </>
        ) : view === "REVOKE" ? (
          <>
            <Text fw="bold" mb="xl" ta="center">
              If you would like to update your phone number, please revoke your
              existing phone number.
            </Text>
            <Text fw="bold" size="lg" mb="xl" ta="center">
              <span className={classes.span}>{userPhoneNumber}</span>
            </Text>
            {error && <ErrorText>{error}</ErrorText>}
            <Button
              className={classes.deleteButton}
              onClick={() => setView("CONFIRM_REVOKE")}
            >
              Revoke
            </Button>
          </>
        ) : (
          <>
            <Text fw="bold" mb="xl" ta="center">
              Are you sure you want to revoke your phone number?
            </Text>
            <Text fw="bold" size="lg" mb="xl" ta="center">
              <span className={classes.span}>{userPhoneNumber}</span>
            </Text>
            {error && <ErrorText>{error}</ErrorText>}
            <Button
              className={classes.deleteButton}
              onClick={handleRevokedPhoneNumber}
            >
              OK
            </Button>
          </>
        )}
      </div>
    </Modal>
  );
};

export default AddPhoneModal;
