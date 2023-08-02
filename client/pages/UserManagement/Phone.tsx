import { Text, Title } from "@mantine/core";
import userStyle from "./styles";
import EditIcon from "../../icons/Edit";
import { SmallIconButton } from "../../components/Button/";
import { BUTTONS_COLOR } from "../../environment";

const PhoneSection = function () {
  const { classes } = userStyle();
  return (
    <div className={classes.wrapper}>
      <Title mb="xs" order={4}>
        My phone number
      </Title>
      <Text mb="md">
        Your phone number is{" "}
        <Text color={BUTTONS_COLOR} fw="bold" display="inline">
          +1 853 *** *** 2341
        </Text>
      </Text>
      <SmallIconButton
        onClick={() => console.log("change me")}
        leftIcon={<EditIcon fill="white" />}
      >
        Change my phone number
      </SmallIconButton>
    </div>
  );
};

export default PhoneSection;
