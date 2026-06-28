import { createBrowserRouter } from "react-router-dom";
import { Shell } from "./components/Shell";
import { Home } from "./pages/Home";
import { Discover } from "./pages/Discover";
import { Asset } from "./pages/Asset";
import { Hedge } from "./pages/Hedge";
import { Account } from "./pages/Account";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Shell />,
    children: [
      { index: true, element: <Home /> },
      { path: "discover", element: <Discover /> },
      { path: "asset/:kind/:id", element: <Asset /> },
      { path: "hedge", element: <Hedge /> },
      { path: "account", element: <Account /> },
    ],
  },
]);
