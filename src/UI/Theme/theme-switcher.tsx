import { useState } from "react";
import { Sun, Moon } from "lucide-react";
import { Button } from "~/components/ui/button";
import { useTheme } from "~/hooks/use-theme";

export const ThemeSwitcher = () => {
  const { theme, toggleTheme } = useTheme();
  const [flipped, setFlipped] = useState(false);

  const handleClick = () => {
    setFlipped(true);
    setTimeout(() => {
      toggleTheme();
      setFlipped(false);
    }, 220);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleClick}
      className="absolute top-13 right-8 rounded-full hover:bg-secondary transition-colors duration-200"
    >
      <span
        className={`flip-theme ${flipped ? "flip-theme-enter" : "flip-theme-exit"}`}
      >
        {theme === "dark" ? (
          <Sun className="h-5 w-5 text-black" />
        ) : (
          <Moon className="h-5 w-5 text-white" />
        )}
      </span>
    </Button>
  );
};
