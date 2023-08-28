import { createStyles } from "@mantine/core";
import { Config } from "../../services/types";

export default createStyles(
  (theme, { background_color, background_image }: Config) => ({
    root: {
      width: "100%",
      background: `url(${background_image}) center/cover no-repeat, ${
        background_color || "#fff"
      }`,
      boxShadow: "0px 10px 30px 0px rgba(0,0,0,0.1)",
      borderRadius: "4px",
      padding: theme.spacing.xl,
    },
  })
);
