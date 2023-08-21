import { ThemeProvider } from "./theme/ThemeProvider";
import { AuthProvider } from "./contexts/AuthContext";
import { ConfigProvider } from "./contexts/ConfigContext";
import Router from "./components/Router/";

export function App() {
  return (
    <ConfigProvider>
      <ThemeProvider>
        <AuthProvider>
          <Router />
        </AuthProvider>
      </ThemeProvider>
    </ConfigProvider>
  );
}
