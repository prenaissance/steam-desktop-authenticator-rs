import {
  isPermissionGranted,
  requestPermission,
  sendNotification,
} from "@tauri-apps/plugin-notification";

export type NotificationButton = {
  title: string;
  onClick?: () => void | Promise<void>;
};

export type NotificationOptions = {
  title?: string;
  body: string;
  icon?: string;
};

export const notify = async (options: NotificationOptions) => {
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

    sendNotification({
      title: options.title || "Steam Desktop Authenticator",
      body: options.body,
      icon: options.icon || "../../src-tauri/icons/icon.png",
    });
  } catch (err) {
    console.error("Failed to send notification", err);
  }
};
