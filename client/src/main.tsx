// main.tsx or index.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Authenticator } from "./components/Authenticator/Authenticator";
import NotFound from "./components/NotFound/NotFound";

const router = createBrowserRouter([
  {
    path: "/auth",
    element: <Authenticator />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);


// #38b6ff
// #fae04a
// #f5c141