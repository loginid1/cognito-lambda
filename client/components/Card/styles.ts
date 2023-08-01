import { createStyles } from "@mantine/core";

import { BACKGROUND_COLOR } from "../../environment";

export default createStyles((theme) => ({
  root: {
    width: "100%",
    background: BACKGROUND_COLOR || "#fff",
    boxShadow: "0px 10px 30px 0px rgba(0,0,0,0.1)",
    borderRadius: "4px",
    padding: theme.spacing.xl,
  },
}));
