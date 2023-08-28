import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { customTheme } from "../theme/ThemeProvider";
import { initalLoad, getConfig } from "../services/credentials";
import { Config } from "../services/types";
import { ConfigStorage } from "../storage/config";

interface ConfigContextProps {
  config: Config;
  error: string;
}

const defaultConfig: Config = {};

const ConfigContext = createContext<ConfigContextProps>({
  config: defaultConfig,
  error: "",
});

const defaultedConfig = (config: Config) => {
  if (!config?.buttons_color) {
    config.buttons_color = customTheme.primaryButtonColor;
  }

  if (!config.login_logo) {
    const logo = new URL("../images/loginid.svg", import.meta.url).toString();
    config.login_logo = logo;
  }

  if (!config?.company_name) {
    config.company_name = "LoginID";
  }
  return config;
};

export const ConfigProvider = ({ children }: { children: ReactNode }) => {
  const [config, setConfig] = useState<Config>(
    defaultedConfig(ConfigStorage.get())
  );
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        await initalLoad();
        const _config = await getConfig();
        const config = defaultedConfig(_config);

        //cache config
        ConfigStorage.set(config);

        setConfig(config);
      } catch (e: any) {
        console.log(e);
        setError(e.message);
      }
    };
    fetchConfig();
  }, []);

  return (
    <ConfigContext.Provider value={{ config, error }}>
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = () => {
  return useContext(ConfigContext);
};
