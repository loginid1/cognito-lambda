import { createStyles } from "@mantine/core";

import {
  PAGE_BACKGROUND_COLOR,
  PAGE_BACKGROUND_IMAGE,
} from "../../environment";

export default createStyles((theme) => ({
  wrapper: {
    width: "100%",
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: `url(${PAGE_BACKGROUND_IMAGE}) center/cover no-repeat, ${
      PAGE_BACKGROUND_COLOR || theme.colors.gray[4]
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
}));
