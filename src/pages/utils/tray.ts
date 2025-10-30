import { TrayIcon, TrayIconEvent } from '@tauri-apps/api/tray';
import { Menu } from '@tauri-apps/api/menu';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { defaultWindowIcon } from '@tauri-apps/api/app';

export async function setupTray() {
  const window = await getCurrentWindow();

  const menu = await Menu.new({
    items: [
      {
        id: 'open',
        text: 'Open',
        action: async () => {
          await window.show();
          await window.setFocus();
        },
      },
      {
        id: 'exit',
        text: 'Exit',
        action: async () => {
          await window.close();
        },
      },
    ],
  });

  const tray = await TrayIcon.new({
    icon: await defaultWindowIcon(),
    tooltip: 'Steam Guard Authenticator',
    menu,
    menuOnLeftClick: false,
  });

  return tray;
}
