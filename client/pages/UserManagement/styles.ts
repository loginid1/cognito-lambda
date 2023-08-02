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
  deleteButton: {
    backgroundColor: theme.colors.red[6],
    "&:hover": {
      backgroundColor: theme.colors.red[5],
      opacity: 1,
    },
  },
}));
