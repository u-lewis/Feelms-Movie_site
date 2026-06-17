import { useState } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { AppSplash } from "./components/app-splash";
import "./index.css";

document.documentElement.classList.add("dark");

function Root() {
  const [splashDone, setSplashDone] = useState(false);
  return (
    <>
      {!splashDone && <AppSplash onDone={() => setSplashDone(true)} />}
      <App />
    </>
  );
}

createRoot(document.getElementById("root")!).render(<Root />);
