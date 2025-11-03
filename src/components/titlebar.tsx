import { getCurrentWindow } from "@tauri-apps/api/window";
import { Minus, X } from "lucide-react";
import { useCallback } from "react";
import { Button } from "./ui/button";

export const TitleBar = () => {
  const startDrag = async () => {
    const window = getCurrentWindow();
    try {
      await window.startDragging();
    } catch (e) {
      console.error("Window drag failed:", e);
    }
  };

  const handleMinimize = useCallback(async () => {
    const window = getCurrentWindow();
    await window.minimize();
  }, []);

  const handleClose = useCallback(async () => {
    const window = getCurrentWindow();
    await window.hide();
  }, []);

  return (
    <nav
      onMouseDown={startDrag}
      className="fixed top-0 left-0 right-0 h-9 flex items-center justify-end gap-2 px-2 bg-background"
    >
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 rounded-full hover:bg-muted"
        onClick={handleMinimize}
      >
        <Minus className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 rounded-full hover:bg-destructive hover:text-destructive-foreground"
        onClick={handleClose}
      >
        <X className="h-4 w-4" />
      </Button>
    </nav>
  );
};
