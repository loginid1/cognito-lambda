import { ThemeProvider } from "./theme/ThemeProvider";
import Login from "./pages/Login";
import UserManagement from "./pages/UserManagement";

export function App() {
  return (
    <ThemeProvider>
      <UserManagement />
    </ThemeProvider>
  );
}
