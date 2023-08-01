import { MantineProvider, MantineThemeOverride } from "@mantine/core";

import { BUTTONS_COLOR } from "../environment";

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const theme: MantineThemeOverride = {
    components: {
      Button: {
        styles: (_, __, { variant }) => ({
          root: {
            borderColor: BUTTONS_COLOR,
            color: variant === "outline" ? BUTTONS_COLOR : undefined,
            backgroundColor: variant === "outline" ? undefined : BUTTONS_COLOR,
            "&:hover": {
              backgroundColor:
                variant === "outline" ? "transparent" : BUTTONS_COLOR,
              opacity: 0.8,
            },
          },
        }),
      },

      Input: {
        styles: {
          input: {
            ":focus": {
              borderColor: BUTTONS_COLOR,
            },
          },
        },
      },
    },
  };
  return (
    <MantineProvider theme={theme} withNormalizeCSS withGlobalStyles>
      {children}
    </MantineProvider>
  );
};
