import React from "react";
import { ChangeEvent, KeyboardEvent, useState } from "react";
import { Accordion, Input } from "@mantine/core";
import { Loginid } from "../../cognito";
import { useRefFocus } from "../../hooks/common";
import { EMPTY_PASSKEY_NAME } from "../../errors/";
import { SmallIconButton } from "../../components/Button/";
import { commonError } from "../../errors";
import { useConfig } from "../../contexts/ConfigContext";
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
  const { config } = useConfig();
  const { classes } = useStyles(config);
  const [error, setError] = useState("");
  const inputRef = useRefFocus(shouldFocus);

  const handleOnBlur = async () => {
    try {
      if (name.length === 0) throw new Error(EMPTY_PASSKEY_NAME);
      setError("");
      Loginid.renamePasskey(id, name);

      handleFocus(null);
    } catch (e: any) {
      setError(commonError(e));
    }
  };

  const handlerOnEnter = async (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      await handleOnBlur();
    }
  };

  return (
    <Accordion.Item value={id}>
      <Accordion.Control icon={<PasskeyIcon fill={config.buttons_color} />}>
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
