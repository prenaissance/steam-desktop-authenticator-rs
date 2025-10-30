import { KeyRound, LogIn, ShoppingCart } from "lucide-react";

export const getNavigationItems = (isLocked?: boolean) => [
    {
        icon: KeyRound,
        label: "OTP",
        path: "/totp",
        locked: isLocked
    },
    {
        icon: ShoppingCart,
        label: "Trade & Market",
        path: "/confirmations",
        locked: isLocked
    },
    {
        icon: LogIn,
        label: "Add account",
        path: "/login"
    }
];