import { Button, Modal, Text } from "@mantine/core";
import useStyles from "./styles";

interface Props {
  onClose: () => void;
  opened: boolean;
  passkeyName: string;
  handleDelete: () => void;
}

const DeleteModal = function ({
  handleDelete,
  onClose,
  opened,
  passkeyName,
}: Props) {
  const { classes } = useStyles({});
  //passkeyName can only be 50 characters long
  passkeyName = passkeyName || "this";
  if (passkeyName.length > 30) {
    passkeyName = passkeyName.slice(0, 30) + "...";
  }

  return (
    <Modal onClose={onClose} opened={opened} centered={true}>
      <div className={classes.modalWrapper}>
        <Text fw="bold" mb="xl" ta="center">
          Are you sure you want to delete "{passkeyName}" passkey?
        </Text>
        <Button onClick={handleDelete} className={classes.deleteButton}>
          Delete
        </Button>
      </div>
    </Modal>
  );
};

export default DeleteModal;
