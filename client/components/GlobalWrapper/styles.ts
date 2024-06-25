import { createStyles } from "@mantine/core";
import { Config } from "../../services/types";

export default createStyles(
  (theme, { page_background_color, page_background_image }: Config) => ({
    wrapper: {
      width: "100%",
      height: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      background: `url(${page_background_image}) center/cover no-repeat, ${page_background_color || theme.colors.gray[4]
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
  })
);
