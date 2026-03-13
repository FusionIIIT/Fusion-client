import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { store } from "./redux/store";
import App from "./App";
import { runOcmsSmokeFlow } from "./Modules/online_cms/services/onlineCmsService";

import "./index.css";

const queryClient = new QueryClient();

if (import.meta.env.DEV) {
  window.runOcmsSmokeFlow = runOcmsSmokeFlow;
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <Provider store={store}>
          <App />
        </Provider>
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>,
);
