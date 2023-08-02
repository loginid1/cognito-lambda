import { useState } from "react";
import { Accordion, ActionIcon, Button, Title } from "@mantine/core";
import useStyles from "./styles";
import Passkey from "./Passkey";
import AddIcon from "../../icons/Add";
import FAQIcon from "../../icons/FAQ";
import DeletePasskeyModal from "./DeletePasskeyModal";
import FAQModal from "./FAQModal";

const Passkeys = function () {
  const { classes } = useStyles();
  const [data, setData] = useState<{ id: string; name: string }[]>([
    { id: "0", name: "Android" },
    { id: "1", name: "iOS" },
    { id: "2", name: "issssssssssssssssss" },
    { id: "3", name: "a".repeat(100) },
  ]);
  const [passkeyID, setPasskeyID] = useState<string | null>(null);
  const [tempPasskeyID, setTempPasskeyID] = useState<string | null>(null);
  const [openedDeletePasskey, setOpenedDeletePasskey] = useState(false);
  const [openedFAQ, setOpenedFAQ] = useState(false);

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
    const newData = data.map((passkey) => {
      return passkey.id === id ? { ...passkey, name } : passkey;
    });
    setData(newData);
  };

  const handleDelete = () => {
    const newData = data.filter((passkey) => passkey.id !== passkeyID);
    setData(newData);
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
        {data.map((passkey, index) => (
          <Passkey
            key={passkey.name + index}
            id={passkey.id}
            name={passkey.name}
            handleFocus={handleFocus}
            handleRename={handleRename}
            handleOpenModal={handleOpenDeleteModal}
            shouldFocus={tempPasskeyID === passkey.id}
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
