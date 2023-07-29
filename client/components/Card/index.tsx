import useStyles from "./styles";

interface CardProps {
  children: React.ReactNode;
}

const Card = function ({ children }: CardProps) {
  const { classes } = useStyles();
  return <div className={classes.root}>{children}</div>;
};

export default Card;
