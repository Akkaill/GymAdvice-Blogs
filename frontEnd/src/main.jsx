import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import {QueryClient,QueryClientProvider} from "@tanstack/react-query"

import { BrowserRouter } from "react-router-dom";
import { ChakraProvider } from "@chakra-ui/react";

// import system here
import { system } from "@chakra-ui/react/preset";
const queryClient = new QueryClient()


createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <ChakraProvider value={system}>
        <App />
      </ChakraProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>
);
