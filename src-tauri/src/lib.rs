use std::env;

use tauri::Manager as _;

use crate::app_state::AppState;

mod account;
mod account_manager;
mod app_state;
mod approval;
mod auth;
mod authentication_approvals;
mod common;
mod protobufs;
mod steamapi;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let state = AppState::init(app);
            {
                let mut accounts_config = state.accounts_config.lock().unwrap();
                let current_account = accounts_config.get_active_account_mut();
                if let Some(account) = current_account {
                    let has_refreshed = account
                        .refresh_tokens_if_needed(state.transport.clone())
                        .expect("Did not implement token refresh failure");
                    if has_refreshed {
                        accounts_config
                            .save_to_config(
                                &app.path()
                                    .app_config_dir()
                                    .expect("Expected access to config directory")
                                    .join("config.json"),
                            )
                            .expect("Failed to save new access token to config");
                    }
                }
            }
            app.manage(state);

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            auth::commands::login,
            approval::get_otp,
            account_manager::commands::is_logged_in,
            account_manager::commands::get_accounts,
            account_manager::commands::get_active_account,
            account::commands::get_profile,
            authentication_approvals::commands::get_sessions,
            authentication_approvals::commands::approve_qr_login
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
