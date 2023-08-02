import { Button, Modal, Text } from "@mantine/core";
import useStyles from "./styles";

interface Props {
  onClose: () => void;
  opened: boolean;
  handleDelete: () => void;
}

const DeleteModal = function ({ handleDelete, onClose, opened }: Props) {
  const { classes } = useStyles();
  return (
    <Modal onClose={onClose} opened={opened} centered={true}>
      <div className={classes.modalWrapper}>
        <Text fw="bold" mb="xl">
          Are you sure you want to delete this passkey?
        </Text>
        <Button onClick={handleDelete} className={classes.deleteButton}>
          Delete
        </Button>
      </div>
    </Modal>
  );
};

export default DeleteModal;
