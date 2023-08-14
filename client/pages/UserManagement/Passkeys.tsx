import { useState } from "react";
import { Accordion, ActionIcon, Button, Title } from "@mantine/core";
import useStyles from "./styles";
import Passkey from "./Passkey";
import AddIcon from "../../icons/Add";
import FAQIcon from "../../icons/FAQ";
import DeletePasskeyModal from "./DeletePasskeyModal";
import FAQModal from "./FAQModal";
import ErrorText from "../../components/ErrorText";
import { useFetchResources } from "../../hooks/common";
import { commonError } from "../../errors";
import * as webauthn from "../../webauthn/";
import {
  fido2CreateComplete,
  fido2CreateInit,
  revokeCredential,
} from "../../services/loginid";

const Passkeys = function () {
  const { classes } = useStyles();
  const [passkeyID, setPasskeyID] = useState<string | null>(null);
  const [tempPasskeyID, setTempPasskeyID] = useState<string | null>(null);
  const [openedDeletePasskey, setOpenedDeletePasskey] = useState(false);
  const [openedFAQ, setOpenedFAQ] = useState(false);
  const [error, setError] = useState("");

  const { passkeys, setPasskeys } = useFetchResources();

  const handleAccordionChange = (id: string) => {
    if (tempPasskeyID) {
      setPasskeyID(null);
    } else {
      setPasskeyID(id);
    }
  };

  const handleOpenDeleteModal = () => setOpenedDeletePasskey(true);

  const handleFocus = (value: string | null) => {
    setTempPasskeyID(value);
    setPasskeyID(null);
  };

  const handleRename = async (id: string, name: string) => {
    const newData = passkeys.map((passkey) => {
      return passkey.uuid === id ? { ...passkey, name } : passkey;
    });
    setPasskeys(newData);
  };

  const handleDelete = async () => {
    try {
      if (!passkeyID) throw new Error("No passkey ID");
      await revokeCredential(passkeyID);
      const newData = passkeys.filter((passkey) => passkey.uuid !== passkeyID);
      setPasskeys(newData);
      setError("");
    } catch (e: any) {
      setError(commonError(e));
    } finally {
      setOpenedDeletePasskey(false);
    }
  };

  const handleAddPasskey = async () => {
    try {
      const initRes = await fido2CreateInit();
      const pulicKey = await webauthn.create(initRes);
      const completeRes = await fido2CreateComplete(pulicKey);
      //add new passkey to the list
      if (completeRes) {
        const { credential } = completeRes;
        setPasskeys([...passkeys, credential]);
      }
      setError("");
    } catch (e: any) {
      setError(commonError(e));
    }
  };

  return (
    <section className={classes.wrapper}>
      <Title mb="xs" order={4}>
        My Passkeys
      </Title>
      {error && <ErrorText>{error}</ErrorText>}
      <Accordion
        onChange={handleAccordionChange}
        value={passkeyID}
        mb="sm"
        chevronPosition="right"
        variant="contained"
      >
        {passkeys.map((passkey, index) => (
          <Passkey
            key={passkey.name + index}
            id={passkey.uuid}
            name={passkey.name}
            handleFocus={handleFocus}
            handleRename={handleRename}
            handleOpenModal={handleOpenDeleteModal}
            shouldFocus={tempPasskeyID === passkey.uuid}
          />
        ))}
      </Accordion>
      <div className={classes.addPasskeyRow}>
        <Button
          onClick={handleAddPasskey}
          mr="sm"
          variant="outline"
          size="sm"
          leftIcon={<AddIcon />}
        >
          Add new passkey
        </Button>
        <ActionIcon onClick={() => setOpenedFAQ(true)} size="lg">
          <FAQIcon />
        </ActionIcon>
      </div>

      {/* Modal Delete Passkey */}
      <DeletePasskeyModal
        onClose={() => setOpenedDeletePasskey(false)}
        opened={openedDeletePasskey}
        handleDelete={handleDelete}
      />

      {/* Modal FAQ Passkey */}
      <FAQModal onClose={() => setOpenedFAQ(false)} opened={openedFAQ} />
    </section>
  );
};

export default Passkeys;
