import { ThemeProvider } from "./theme/ThemeProvider";
import { AuthProvider } from "./contexts/AuthContext";
import Protected from "./components/Protected/";
import Login from "./pages/Login";
import UserManagement from "./pages/UserManagement";

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Protected>
          <UserManagement />
          <Login />
        </Protected>
      </AuthProvider>
    </ThemeProvider>
  );
}
