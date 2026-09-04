import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { patchReleasePointerCapture } from "@/lib/patchReleasePointerCapture";
import { setupServiceWorker } from "@/lib/serviceWorker";
import "./index.css";

patchReleasePointerCapture();
setupServiceWorker();

createRoot(document.getElementById("root")!).render(<App />);
