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
