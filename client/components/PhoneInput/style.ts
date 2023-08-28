import { createStyles } from "@mantine/core";
import { Config } from "../../services/types";

export default createStyles((theme, config: Config) => ({
  phoneInput: {
    fontFamily:
      "-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial,sans-serif,Apple Color Emoji,Segoe UI Emoji",
    height: "2.25rem",
    WebkitTapHighlightColor: "transparent",
    lineHeight: "calc(2.25rem - 0.125rem)",
    appearance: "none",
    resize: "none",
    boxSizing: "border-box",
    fontSize: "0.875rem",
    width: "100%",
    color: "#000",
    display: "block",
    textAlign: "left",
    border: "0.0625rem solid #ced4da",
    backgroundColor: "#fff",
    transition: "border-color 100ms ease",
    minHeight: "2.25rem",
    paddingLeft: "calc(2.25rem  / 3)",
    paddingRight: "calc(2.25rem  / 3)",
    padding: theme.spacing.lg,
    borderRadius: "0.25rem",
    marginBottom: theme.spacing.xl,
    "&:focus": {
      outline: "none",
      borderColor: `${config?.buttons_color} !important`,
    },
  },
  countrySelect: {
    maxHeight: "100%",
  },
  phoneInputWrapper: {
    display: "flex",
    "& div button": {
      padding: "8px",
      borderRadius: "0.25rem",
      border: "0.0625rem solid #ced4da",
    },
  },
}));
