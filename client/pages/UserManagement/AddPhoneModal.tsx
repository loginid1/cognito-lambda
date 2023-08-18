import { useState } from "react";
import { Button, Modal, Text } from "@mantine/core";
import { PhoneInput } from "react-international-phone";
import { useConfig } from "../../contexts/ConfigContext";
import { cleanPhoneNumber } from "./phoneValidations";
import useStyles from "./styles";
import ErrorText from "../../components/ErrorText";

interface Props {
  error: string;
  onClose: () => void;
  opened: boolean;
  handleUpdatePhone: (a: string) => void;
}

const AddPhoneModal = function ({
  error,
  handleUpdatePhone,
  onClose,
  opened,
}: Props) {
  const { config } = useConfig();
  const { classes } = useStyles(config);
  const [phoneNumber, setPhoneNumber] = useState("");
  return (
    <Modal onClose={onClose} opened={opened} centered={true}>
      <div className={classes.modalWrapper}>
        <Text fw="bold" mb="xl" ta="center">
          Please enter your phone number:
        </Text>
        {error && <ErrorText>{error}</ErrorText>}
        <PhoneInput
          className={classes.phoneInputWrapper}
          inputClassName={classes.phoneInput}
          defaultCountry="ca"
          onChange={(phoneNumber: string) => setPhoneNumber(phoneNumber)}
        />
        <Button
          onClick={() => handleUpdatePhone(cleanPhoneNumber(phoneNumber))}
        >
          Update phone
        </Button>
      </div>
    </Modal>
  );
};

export default AddPhoneModal;
