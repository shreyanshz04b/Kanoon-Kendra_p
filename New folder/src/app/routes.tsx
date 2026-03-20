import { createBrowserRouter } from "react-router";

import { MainLayout } from "./components/MainLayout";
import { DashboardLayout } from "./components/DashboardLayout";
import { Home } from "./components/Home";
import { Auth } from "./components/Auth";
import { DashboardHome } from "./components/DashboardHome";
import { Chat } from "./components/Chat";
import { Upload } from "./components/Upload";
import { Drafting } from "./components/Drafting";
import { Advocates } from "./components/Advocates";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: MainLayout,
    children: [
      { index: true, Component: Home },
      { path: "login", element: <Auth type="login" /> },
      { path: "signup", element: <Auth type="signup" /> },
    ],
  },
  {
    path: "/dashboard",
    Component: DashboardLayout,
    children: [
      { index: true, Component: DashboardHome },
      { path: "chat", Component: Chat },
      { path: "upload", Component: Upload },
      { path: "drafting", Component: Drafting },
      { path: "advocates", Component: Advocates },
      // Fallback views for uncreated routes
      { path: "documents", element: <div className="p-8 text-center text-gray-500 font-medium">My Documents View</div> },
      { path: "settings", element: <div className="p-8 text-center text-gray-500 font-medium">Settings View</div> },
    ],
  },
]);
