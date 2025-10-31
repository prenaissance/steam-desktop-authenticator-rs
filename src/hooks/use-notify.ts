import { useCallback } from "react";
import {
  isPermissionGranted,
  requestPermission,
  sendNotification,
} from "@tauri-apps/plugin-notification";

export interface NotificationButton {
  title: string;
  onClick?: () => void | Promise<void>;
}

export interface NotificationOptions {
  title?: string;
  body: string;
  icon?: string;
}

export const useNotify = () => {
  const notify = useCallback(async (options: NotificationOptions) => {
    try {
      let permission = await isPermissionGranted();
      if (!permission) {
        const granted = await requestPermission();
        permission = granted === "granted";
      }

      if (!permission) {
        console.warn("Notification permission denied");
        return;
      }

      await sendNotification({
        title: options.title || "Steam Desktop Authenticator",
        body: options.body,
        icon: options.icon || "../../src-tauri/icons/icon.png",
      });

    } catch (err) {
      console.error("Failed to send notification", err);
    }
  }, []);

  return { notify };
};
