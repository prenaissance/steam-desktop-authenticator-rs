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
    <nav className="sticky top-0 right-0 left-0 z-30 flex h-9 w-full items-center justify-end gap-2 bg-background px-2 pt-1">
      <div
        role="menubar"
        className="absolute top-0 left-0 z-30 mx-2 mt-2 h-9 w-[calc(100%-1rem)] rounded-t-xl"
        onMouseDown={startDrag}
        aria-label="Drag Area"
      />

      <Button
        variant="ghost"
        size="icon"
        className="z-40 h-7 w-7 rounded-md hover:bg-muted"
        onClick={handleMinimize}
      >
        <Minus className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="z-40 h-7 w-7 rounded-md hover:bg-destructive hover:text-destructive-foreground"
        onClick={handleClose}
      >
        <X className="h-4 w-4" />
      </Button>
    </nav>
  );
};
