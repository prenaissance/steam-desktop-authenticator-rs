import { LogIn, ShoppingCart } from "lucide-react";

export const getNavigationItems = (isLocked?: boolean) => [
  {
    icon: ShoppingCart,
    label: "Trade & Market",
    path: "/confirmations",
    locked: isLocked,
  },
  {
    icon: LogIn,
    label: "Add account",
    path: "/login",
  },
];
