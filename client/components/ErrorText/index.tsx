import { Text } from "@mantine/core";

interface Props {
  children: React.ReactNode;
}

const ErrorText = function ({ children }: Props) {
  return (
    <Text color="red" fw={650} mb="lg">
      {children}
    </Text>
  );
};

export default ErrorText;
