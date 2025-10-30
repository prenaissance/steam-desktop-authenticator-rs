import { Window } from "@tauri-apps/api/window";
import { Minus, X } from "lucide-react";
import { Button } from "./ui/button";
import { useCallback } from "react";

export const TitleBar = () => {
  const handleMinimize = useCallback(async () => {
    const window = Window.getCurrent();
    await window.minimize();
  }, []);

  const handleClose = useCallback(async () => {
    const window = Window.getCurrent();
    await window.close();
  }, []);

  return (
    <div
      data-tauri-drag-region
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
    </div>
  );
};