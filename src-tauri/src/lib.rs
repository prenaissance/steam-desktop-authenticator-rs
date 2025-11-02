use std::{error::Error, sync::Mutex};

use tauri::{App, Manager};

use crate::account_manager::{AccountsConfig, AccountsInitError};

use tauri::{LogicalSize, Size};
use std::{fs, path::Path};

mod account;
mod account_manager;
mod approval;
mod auth;
mod common;
mod protobufs;
mod steamapi;

pub struct AppState {
    pub accounts_config: AccountsConfig,
}


impl AppState {
    fn init(app: &tauri::App) -> Result<Self, Box<dyn Error>> {
        let config_dir = app.path().app_config_dir()?;
        fs::create_dir_all(&config_dir)?;
        let config_path = config_dir.join("config.json");

        // If the file doesn't exist, create an empty one
        if !config_path.exists() {
            fs::write(&config_path, "{}")?;
        }

        let accounts_config = match AccountsConfig::from_config(&config_path) {
            Ok(cfg) => cfg,
            Err(AccountsInitError::IoError(_)) => {
                AccountsConfig::default()
            }
            Err(AccountsInitError::DeserializationError) => {
                fs::write(&config_path, "{}")?;
                AccountsConfig::default()
            }
        };

        Ok(AppState { accounts_config })
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let state = AppState::init(&app)?;
            app.manage(Mutex::new(state));

            if let Some(window) = app.get_webview_window("main") {
                if let Ok(Some(monitor)) = window.primary_monitor() {
                    let scale = monitor.scale_factor();
                    let size = monitor.size();

                    let width = 600.0;
                    let height = (size.height as f64 / scale) * 0.7;

                    if let Err(e) = window.set_size(Size::Logical(LogicalSize { width, height })) {
                        eprintln!("Failed to resize window: {:?}", e);
                    }
                }
            }

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            auth::login,
            auth::get_accounts,
            approval::get_otp,
            account_manager::is_logged_in,
            account::commands::get_profile,
            account_manager::is_logged_in
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
