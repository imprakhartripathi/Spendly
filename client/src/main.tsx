import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
  Outlet,
  useNavigate,
} from "react-router-dom";
import Authenticator from "./components/Authenticator/Authenticator";
import NotFound from "./components/NotFound/NotFound";
import Dashboard from "./components/Dashboard/Dashboard";
import MakePayment from "./components/MakePayment/MakePayment";
import Transactions from "./components/Transactions/Transactions";
import MonthlySummary from "./components/MonthlySummary/MonthlySummary";
// import Settings from "./pages/Settings/Settings";
import CategoryTrends from "./components/CategoryTrends/CategoryTrends";
// import AutoPays from "./pages/AutoPays/AutoPays";
import Layout from "./components/Layout/Layout";
import AutoPays from "./components/AutoPays/AutoPays";
import Settings from "./components/Settings/Settings";

// Protected layout to dynamically redirect
const ProtectedLayout: React.FC = () => {
  const [isAuth, setIsAuth] = useState<boolean | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setIsAuth(false);
      navigate("/auth");
    } else {
      setIsAuth(true);
    }
  }, [navigate]);

  if (isAuth === null) return <div>Loading...</div>;

  return isAuth ? <Outlet /> : null;
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/dashboard" />,
  },
  {
    path: "/auth",
    element: <Authenticator />,
  },
  {
    element: <ProtectedLayout />, // wrapper layout for protected routes
    children: [
      {
        element: <Layout />, // Layout with sidebar
        children: [
          {
            path: "/dashboard",
            element: <Dashboard />,
          },
          {
            path: "/transactions",
            element: <Transactions />,
          },
          {
            path: "/monthly-summary",
            element: <MonthlySummary />,
          },
          {
            path: "/category-trends",
            element: <CategoryTrends />,
          },
          {
            path: "/autopays",
            element: <AutoPays />,
          },
          {
            path: "/settings",
            element: <Settings />,
          },
          {
            path: "/payment",
            element: <MakePayment />,
          },
        ],
      },
    ],
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
