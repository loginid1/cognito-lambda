import { Accordion, ActionIcon, Button, Title } from "@mantine/core";
import useStyles from "./styles";
import Passkey from "./Passkey";
import AddIcon from "../../icons/Add";
import FAQIcon from "../../icons/FAQ";

const Passkeys = function () {
  const { classes } = useStyles();
  const data: { name: string }[] = [
    { name: "Android" },
    { name: "iOS" },
    { name: "issssssssssssssssss" },
    { name: "a".repeat(100) },
  ];
  return (
    <section className={classes.wrapper}>
      <Title mb="xs" order={3}>
        My Passkeys
      </Title>
      <Accordion mb="sm" chevronPosition="right" variant="contained">
        {data.map((passkey, index) => (
          <Passkey key={passkey.name + index} name={passkey.name} />
        ))}
      </Accordion>
      <div className={classes.addPasskeyRow}>
        <Button mr="lg" variant="outline" leftIcon={<AddIcon />}>
          Add new passkey
        </Button>
        <ActionIcon size="lg">
          <FAQIcon />
        </ActionIcon>
      </div>
    </section>
  );
};

export default Passkeys;
