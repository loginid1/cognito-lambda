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
    borderRadius: "0.25rem",
    marginBottom: theme.spacing.xl,
    "&:focus": {
      outline: "none",
      borderColor: config?.buttons_color,
    },
  },
  countrySelect: {
    maxHeight: "100%",
  },
  phoneInputWrapper: {
    display: "flex",
    "& div button": {
      height: "34px",
      borderRadius: "0.25rem",
      border: "0.0625rem solid #ced4da",
    },
  },
  wrapper: {
    marginBottom: theme.spacing.xl,
  },
  addPasskeyRow: {
    width: "100%",
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  actionsWrapper: {
    padding: theme.spacing.xs,
    display: "flex",
    alignItems: "center",
    "& > *:not(:last-child)": {
      marginRight: 10,
    },
  },
  actionWrapper: {
    display: "flex",
    cursor: "pointer",
    alignItems: "center",
    "& > *:not(:last-child)": {
      marginRight: 3,
    },
  },
  modalWrapper: {
    padding: theme.spacing.md,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  modalFAQWrapper: {
    padding: theme.spacing.md,
    display: "flex",
    flexDirection: "column",
    "& li": {
      marginBottom: theme.spacing.md,
    },
    "& svg": {
      alignSelf: "center",
      marginBottom: theme.spacing.xl,
    },
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  deleteButton: {
    backgroundColor: theme.colors.red[6],
    borderColor: theme.colors.red[6],
    "&:hover": {
      backgroundColor: theme.colors.red[5],
      opacity: 1,
    },
  },
}));
