// main.tsx or index.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

const router = createBrowserRouter([
  // {
  //   path: "/",
  //   element: <HomePage />,
  // },
  // {
  //   path: "*",
  //   element: <NotFoundPage />,
  // },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
