import useStyles from "./styles";
import { useConfig } from "../../contexts/ConfigContext";

interface CardProps {
  children: React.ReactNode;
}

const Card = function ({ children }: CardProps) {
  const { config } = useConfig();
  const { classes } = useStyles(config);
  return <div className={classes.root}>{children}</div>;
};

export default Card;
