import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { installMobileTapFocusReset } from "@/lib/installMobileTapFocusReset";

installMobileTapFocusReset();

createRoot(document.getElementById("root")!).render(<App />);
