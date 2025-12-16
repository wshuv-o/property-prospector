import { createRoot } from "react-dom/client";
import { ThemeProvider } from "next-themes";
import "./index.css"; // <--- Import this BEFORE App
import App from "./App.tsx";
// import "./App.css"; // <--- DELETE THIS LINE if it exists

createRoot(document.getElementById("root")!).render(
  <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
    <App />
  </ThemeProvider>
);