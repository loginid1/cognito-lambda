import { ChangeEvent, useState } from "react";
import { Accordion, Button, Input } from "@mantine/core";
import { useRefFocus } from "../../hooks/common";
import { EMPTY_PASSKEY_NAME } from "../../errors/";
import EditIcon from "../../icons/Edit";
import CloseIcon from "../../icons/CloseIcon";
import PasskeyIcon from "../../icons/Passkey";
import useStyles from "./styles";

interface PasskeyProps {
  id: string;
  name: string;
  shouldFocus: boolean;
  handleFocus: (value: string | null) => void;
  handleRename: (id: string, name: string) => void;
  handleOpenModal: () => void;
}

const Passkey = function ({
  handleFocus,
  id,
  name,
  shouldFocus,
  handleRename,
  handleOpenModal,
}: PasskeyProps) {
  const { classes } = useStyles();
  const [error, setError] = useState("");
  const inputRef = useRefFocus(shouldFocus);

  const handleOnBlur = () => {
    if (name.length === 0) {
      setError(EMPTY_PASSKEY_NAME);
    } else {
      handleFocus(null);
      setError("");
    }
  };

  return (
    <Accordion.Item value={id}>
      <Accordion.Control icon={<PasskeyIcon />}>
        {shouldFocus ? (
          <Input.Wrapper error={error}>
            <Input
              ref={inputRef}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                handleRename(id, event.target.value)
              }
              onBlur={handleOnBlur}
              value={name}
            />
          </Input.Wrapper>
        ) : (
          name
        )}
      </Accordion.Control>
      <Accordion.Panel>
        <div className={classes.actionsWrapper}>
          <Button
            onClick={() => handleFocus(id)}
            leftIcon={<EditIcon fill="white" />}
            radius="xl"
            size="xs"
          >
            Rename
          </Button>
          <Button
            onClick={handleOpenModal}
            leftIcon={<CloseIcon fill="white" />}
            radius="xl"
            size="xs"
          >
            Delete
          </Button>
        </div>
      </Accordion.Panel>
    </Accordion.Item>
  );
};

export default Passkey;
