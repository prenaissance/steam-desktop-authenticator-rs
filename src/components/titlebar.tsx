import { getCurrentWindow } from "@tauri-apps/api/window";
import { Minus, X } from "lucide-react";
import { Button } from "./ui/button";

const startDrag = async () => {
  const window = getCurrentWindow();
  try {
    await window.startDragging();
  } catch (e) {
    console.error("Window drag failed:", e);
  }
};

const handleMinimize = async () => {
  const window = getCurrentWindow();
  await window.minimize();
};

const handleClose = async () => {
  const window = getCurrentWindow();
  await window.hide();
};

export const TitleBar = () => {
  return (
    <nav className="sticky w-full top-0 left-0 right-0 h-9 flex items-center justify-end gap-2 pt-1 px-2 bg-background z-30">
      <div
        role="menubar"
        className="absolute top-0 left-0 w-full h-9 z-30"
        onMouseDown={startDrag}
        aria-label="Drag Area"
      />

      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 rounded-md hover:bg-muted z-40"
        onClick={handleMinimize}
      >
        <Minus className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 rounded-md hover:bg-destructive hover:text-destructive-foreground z-40"
        onClick={handleClose}
      >
        <X className="h-4 w-4" />
      </Button>
    </nav>
  );
};
