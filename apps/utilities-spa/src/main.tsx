import React from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App";
import Home from "@pages/Home";
import Events from "@pages/Events";
import Duplicate from "@pages/Duplicate";
import Settings from "@pages/Settings";
import { Providers } from '@components/Providers';

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: "events", element: <Events /> },
      { path: "duplicate", element: <Duplicate /> },
      { path: "settings", element: <Settings /> }
    ]
  }
]);

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Providers>
      <RouterProvider router={router} />
    </Providers>
  </React.StrictMode>
);