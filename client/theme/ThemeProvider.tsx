import { MantineProvider, MantineThemeOverride } from "@mantine/core";
import { useConfig } from "../contexts/ConfigContext";

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const customTheme = {
  //this is the primary color found for most of the buttons
  primaryButtonColor: "#228BE6",
};

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const { config } = useConfig();
  const theme: MantineThemeOverride = {
    components: {
      Button: {
        styles: (_, __, { variant }) => ({
          root: {
            borderColor: config.buttons_color,
            color: variant === "outline" ? config.buttons_color : undefined,
            backgroundColor:
              variant === "outline" ? undefined : config.buttons_color,
            "&:hover": {
              backgroundColor:
                variant === "outline" ? "transparent" : config.buttons_color,
              opacity: 0.8,
            },
          },
        }),
      },

      Input: {
        styles: {
          input: {
            ":focus": {
              borderColor: config.buttons_color,
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
