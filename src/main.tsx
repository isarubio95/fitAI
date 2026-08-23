import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { patchReleasePointerCapture } from "@/lib/patchReleasePointerCapture";
import "./index.css";

patchReleasePointerCapture();

createRoot(document.getElementById("root")!).render(<App />);
