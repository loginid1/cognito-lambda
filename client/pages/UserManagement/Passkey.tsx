import { ChangeEvent, KeyboardEvent, useState } from "react";
import { Accordion, Input } from "@mantine/core";
import { useRefFocus } from "../../hooks/common";
import { EMPTY_PASSKEY_NAME } from "../../errors/";
import { SmallIconButton } from "../../components/Button/";
import { renameCredential } from "../../services/loginid";
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

  const handleOnBlur = async () => {
    try {
      if (name.length === 0) throw new Error(EMPTY_PASSKEY_NAME);
      setError("");
      await renameCredential(id, name);
      handleFocus(null);
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handlerOnEnter = async (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      await handleOnBlur();
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
              onKeyDown={handlerOnEnter}
              value={name}
            />
          </Input.Wrapper>
        ) : (
          name
        )}
      </Accordion.Control>
      <Accordion.Panel>
        <div className={classes.actionsWrapper}>
          <SmallIconButton
            onClick={() => handleFocus(id)}
            leftIcon={<EditIcon fill="white" />}
          >
            Rename
          </SmallIconButton>
          <SmallIconButton
            onClick={handleOpenModal}
            leftIcon={<CloseIcon fill="white" />}
          >
            Delete
          </SmallIconButton>
        </div>
      </Accordion.Panel>
    </Accordion.Item>
  );
};

export default Passkey;
