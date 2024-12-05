import React from "react";
import ReactDOM from "react-dom/client";
import router from "./routes/index.tsx";
import "react-toastify/dist/ReactToastify.css";
import { RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ToastContainer } from "react-toastify";
import { Provider } from "react-redux";
import { store } from "./redux/store.ts";
import { ConfigProvider } from "antd";
import { useMediaQuery } from "react-responsive";
import "./index.css";

const queryClient = new QueryClient();

function App() {
  const isTabletOrMobile = useMediaQuery({ query: "(max-width: 1023px)" });

  return (
    <ConfigProvider
      theme={{
        token: {
          fontFamily: "Cabin Condensed, sans-serif",
          fontSize: isTabletOrMobile ? 14 : 18,
        },
      }}
    >
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
          <ReactQueryDevtools initialIsOpen={false} />
          <ToastContainer />
        </QueryClientProvider>
      </Provider>
    </ConfigProvider>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
