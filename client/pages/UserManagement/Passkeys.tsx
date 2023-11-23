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
import { useConfig } from "../../contexts/ConfigContext";
import { useAuth } from "../../contexts/AuthContext";
import { getUserIDToken } from "../../cognito";
import * as cognito from "../../cognito/";
import { Loginid } from "../../cognito";
import { credentialList, revokeCredential } from "../../services/credentials";

const Passkeys = function () {
  const { config } = useConfig();
  const { classes } = useStyles(config);
  const [passkeyID, setPasskeyID] = useState<string | null>(null);
  const [tempPasskeyID, setTempPasskeyID] = useState<string | null>(null);
  const [openedDeletePasskey, setOpenedDeletePasskey] = useState(false);
  const [openedFAQ, setOpenedFAQ] = useState(false);
  const [error, setError] = useState("");
  const { user } = useAuth();

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
      return passkey.cred_uuid === id
        ? { ...passkey, cred_name: name }
        : passkey;
    });
    setPasskeys(newData);
  };

  const handleDelete = async () => {
    try {
      if (!passkeyID) throw new Error("No passkey ID");
      const token = await getUserIDToken(user);
      //no await
      revokeCredential(passkeyID, token);

      const newData = passkeys.filter(
        (passkey) => passkey.cred_uuid !== passkeyID
      );
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
      const username = user?.getUsername() || "";
      const token = await cognito.getUserIDToken(user);

      await Loginid.addPasskey(username, token);

      const { credentials } = await credentialList(token);
      setPasskeys([...credentials]);
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
            key={passkey.cred_name || index}
            id={passkey.cred_uuid}
            name={passkey.cred_name || "Passkey"}
            handleFocus={handleFocus}
            handleRename={handleRename}
            handleOpenModal={handleOpenDeleteModal}
            shouldFocus={tempPasskeyID === passkey.cred_uuid}
          />
        ))}
      </Accordion>
      <div className={classes.addPasskeyRow}>
        <Button
          onClick={handleAddPasskey}
          mr="sm"
          variant="outline"
          size="sm"
          leftIcon={<AddIcon fill={config.buttons_color} />}
        >
          Add new passkey
        </Button>
        <ActionIcon onClick={() => setOpenedFAQ(true)} size="lg">
          <FAQIcon fill={config.buttons_color} />
        </ActionIcon>
      </div>

      {/* Modal Delete Passkey */}
      <DeletePasskeyModal
        passkeyName={
          passkeys.find((passkey) => passkey.cred_uuid === passkeyID)
            ?.cred_name || ""
        }
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
