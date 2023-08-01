import { Accordion, Button, Text } from "@mantine/core";
import EditIcon from "../../icons/Edit";
import CloseIcon from "../../icons/CloseIcon";
import PasskeyIcon from "../../icons/Passkey";
import useStyles from "./styles";

interface PasskeyProps {
  name: string;
}

const Passkey = function ({ name }: PasskeyProps) {
  const { classes } = useStyles();
  return (
    <Accordion.Item value={name}>
      <Accordion.Control icon={<PasskeyIcon />}>{name}</Accordion.Control>
      <Accordion.Panel>
        <div className={classes.actionsWrapper}>
          <Button leftIcon={<EditIcon fill="white" />} radius="xl" size="xs">
            Rename
          </Button>
          <Button leftIcon={<CloseIcon fill="white" />} radius="xl" size="xs">
            Delete
          </Button>
        </div>
      </Accordion.Panel>
    </Accordion.Item>
  );
};

export default Passkey;
