import { List, Modal, Text } from "@mantine/core";
import useStyles from "./styles";
import PasskeyHeroIcon from "../../icons/PasskeyHero";

interface Props {
  onClose: () => void;
  opened: boolean;
}

const DeleteModal = function ({ onClose, opened }: Props) {
  const { classes } = useStyles();
  return (
    <Modal onClose={onClose} opened={opened} centered={true}>
      <div className={classes.modalFAQWrapper}>
        <PasskeyHeroIcon />
        <Text fw="bold" mb="xl">
          With passkeys, you don’t need to remember complex passwords.
        </Text>
        <List>
          <List.Item>
            <Text fw="bold">What are passkeys?</Text>
            <Text>
              Passkeys are encrypted digital keys you create using your
              fingerprint, face, or screen lock.
            </Text>
          </List.Item>
          <List.Item>
            <Text fw="bold">Where are passkeys saved?</Text>
            <Text>
              Passkeys are saved to your password manager, so you can sign in on
              other devices.
            </Text>
          </List.Item>
        </List>
      </div>
    </Modal>
  );
};

export default DeleteModal;
