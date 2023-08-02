import { Button } from "@mantine/core";

interface Props {
  onClick: () => void;
  leftIcon: React.ReactNode;
  children: React.ReactNode;
}

export const SmallIconButton = function ({
  onClick,
  leftIcon,
  children,
}: Props) {
  return (
    <Button onClick={onClick} leftIcon={leftIcon} radius="xl" size="xs">
      {children}
    </Button>
  );
};
