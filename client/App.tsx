import { ThemeProvider } from "./theme/ThemeProvider";
import Login from "./pages/Login";

export function App() {
  return (
    <ThemeProvider>
      <Login />
    </ThemeProvider>
  );
}
