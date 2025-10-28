use std::{error::Error, sync::Mutex};

use tauri::{App, Manager};

use crate::account_manager::AccountsConfig;

mod account_manager;
mod approval;
mod auth;
mod common;

pub struct AppState {
    pub accounts_config: AccountsConfig,
}

impl AppState {
    fn init(app: &App) -> Result<Self, Box<dyn Error>> {
        let config_path = app.path().app_config_dir()?.join("config.json");
        Ok(AppState {
            accounts_config: AccountsConfig::from_config(&config_path)?,
        })
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            app.manage(Mutex::new(AppState::init(&app)?));
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            auth::login,
            auth::get_accounts,
            approval::get_otp,
            account_manager::is_logged_in
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
