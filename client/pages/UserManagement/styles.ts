import { createStyles } from "@mantine/core";

export default createStyles((theme) => ({
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
}));
