use std::{env, error::Error, sync::Mutex};

use tauri::Manager;

use std::fs;

use crate::account_manager::accounts_config::{AccountsConfig, AccountsInitError};

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

        let accounts_config = AccountsConfig::from_config(&config_path)
            .inspect_err(|err| match err {
                AccountsInitError::IoError(_) => {
                    panic!("Could not open the configuration file")
                }
                AccountsInitError::DeserializationError => {
                    panic!("The account configuration file is corrupted")
                }
            })
            .unwrap();

        Ok(AppState { accounts_config })
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let state = AppState::init(app)?;
            app.manage(Mutex::new(state));

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            auth::login,
            approval::get_otp,
            account_manager::commands::is_logged_in,
            account_manager::commands::get_accounts,
            account_manager::commands::get_active_account,
            account::commands::get_profile,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
