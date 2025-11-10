import { LogIn, ShieldCheck, ShoppingCart } from "lucide-react";

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
  {
    icon: ShieldCheck,
    label: "Sign-in requests",
    path: "/sign-in-requests",
  },
];
