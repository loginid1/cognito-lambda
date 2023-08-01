import { createStyles } from "@mantine/core";

import {
  BACKGROUND_COLOR,
  BACKGROUND_IMAGE,
  BUTTONS_COLOR,
} from "../../environment/";

export default createStyles((theme) => ({
  wrapper: {
    width: "100%",
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: `url(${BACKGROUND_IMAGE}) center/cover no-repeat, ${
      BACKGROUND_COLOR || theme.colors.gray[4]
    }`,
  },
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
    maxWidth: 350,
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
    marginBottom: theme.spacing.sm,
    borderRadius: theme.radius.lg,
  },
  footer: {
    display: "flex",
    justifyContent: "space-evenly",
  },
}));
