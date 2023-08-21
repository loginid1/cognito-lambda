import { createStyles } from "@mantine/core";
import { Config } from "../../services/types";

export default createStyles((theme, { buttons_color }: Config) => ({
  innerWrapper: {
    width: 550,
    [theme.fn.smallerThan("md")]: {
      width: "66.66%",
    },
    [theme.fn.smallerThan("sm")]: {
      maxWidth: theme.breakpoints.md,
      width: "100%",
      padding: "0 16px",
    },
  },
  logo: {
    margin: `0 auto ${theme.spacing.xl}`,
  },
  header: {
    textAlign: "center",
    marginBottom: "40px",
  },
  buttonWrapper: {
    maxWidth: 350,
    margin: "0 auto 40px",
  },
  button: {
    width: "100%",
    marginBottom: "5px",
    borderRadius: theme.radius.md,
  },
  signupButton: {
    marginTop: theme.spacing.lg,
    width: "100%",
    textAlign: "center",
    fontSize: "0.9rem",
  },
  signup: {
    color: buttons_color,
    fontWeight: "bold",
  },
  footer: {
    display: "flex",
    justifyContent: "space-evenly",
  },
}));
