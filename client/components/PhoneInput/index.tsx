import useStyles from "./style";
import { useConfig } from "../../contexts/ConfigContext";
import {
  PhoneInput as _PhoneInput,
  defaultCountries,
  parseCountry,
} from "react-international-phone";

interface Props {
  onChange: (phoneNumber: string) => void;
}

//LoginID only accepts American/Candian phone numbers
const countries = defaultCountries.filter((country) => {
  const { iso2 } = parseCountry(country);
  return ["ca", "us"].includes(iso2);
});

const PhoneInput = ({ onChange }: Props) => {
  const { config } = useConfig();
  const { classes } = useStyles(config);
  return (
    <_PhoneInput
      className={classes.phoneInputWrapper}
      inputClassName={classes.phoneInput}
      defaultCountry="ca"
      hideDropdown
      countries={countries}
      onChange={onChange}
    />
  );
};

export default PhoneInput;
