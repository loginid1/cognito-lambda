import { ThemeProvider } from "./theme/ThemeProvider";
import { AuthProvider } from "./contexts/AuthContext";
import { ConfigProvider } from "./contexts/ConfigContext";
import Protected from "./components/Protected/";
import Login from "./pages/Login";
import UserManagement from "./pages/UserManagement";

export function App() {
  return (
    <ConfigProvider>
      <ThemeProvider>
        <AuthProvider>
          <Protected>
            <UserManagement />
            <Login />
          </Protected>
        </AuthProvider>
      </ThemeProvider>
    </ConfigProvider>
  );
}
