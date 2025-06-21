import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initializeData } from "./lib/dataUtils";

// Initialize mock data on app start
initializeData();

createRoot(document.getElementById("root")!).render(<App />);
