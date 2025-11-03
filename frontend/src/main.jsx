import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import QueryProvider from "./app/QueryProvider.jsx";
import "./index.css";
import { LangaugeProvider } from "./utils/LanguageContext.jsx";
import { Toaster } from "react-hot-toast";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <LangaugeProvider>
        <QueryProvider>
          <App />
          <Toaster position="top-right" reverseOrder={false} />
        </QueryProvider>
      </LangaugeProvider>
    </BrowserRouter>
  </StrictMode>
);
