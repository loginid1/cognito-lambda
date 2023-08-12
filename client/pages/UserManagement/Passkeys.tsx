import { useState } from "react";
import { Accordion, ActionIcon, Button, Title } from "@mantine/core";
import useStyles from "./styles";
import Passkey from "./Passkey";
import AddIcon from "../../icons/Add";
import FAQIcon from "../../icons/FAQ";
import DeletePasskeyModal from "./DeletePasskeyModal";
import FAQModal from "./FAQModal";
import { useFetchResources } from "../../hooks/common";

const Passkeys = function () {
  const { classes } = useStyles();
  /*
  const [data, setData] = useState<Credential[]>([
    { uuid: "0", name: "Android", status: "active" },
    { uuid: "1", name: "iOS", status: "active" },
    { uuid: "2", name: "issssssssssssssssss", status: "active" },
    { uuid: "3", name: "a".repeat(100), status: "active" },
  ]);
   */
  const [passkeyID, setPasskeyID] = useState<string | null>(null);
  const [tempPasskeyID, setTempPasskeyID] = useState<string | null>(null);
  const [openedDeletePasskey, setOpenedDeletePasskey] = useState(false);
  const [openedFAQ, setOpenedFAQ] = useState(false);

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

  const handleRename = (id: string, name: string) => {
    const newData = passkeys.map((passkey) => {
      return passkey.uuid === id ? { ...passkey, name } : passkey;
    });
    setPasskeys(newData);
  };

  const handleDelete = () => {
    const newData = passkeys.filter((passkey) => passkey.uuid !== passkeyID);
    setPasskeys(newData);
    setOpenedDeletePasskey(false);
  };

  return (
    <section className={classes.wrapper}>
      <Title mb="xs" order={4}>
        My Passkeys
      </Title>
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
        <Button mr="sm" variant="outline" size="sm" leftIcon={<AddIcon />}>
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
