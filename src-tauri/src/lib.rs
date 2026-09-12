use std::env;

use tauri::Manager as _;
use tauri_plugin_notification::NotificationExt as _;

use crate::app_state::AppState;

mod account;
mod account_manager;
mod app_state;
mod auth;
mod authentication_approvals;
mod common;
mod confirmations;
mod protobufs;
mod steamapi;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let enabled_targets = env::var("APP_LOG_TARGET_PREFIXES")
        .unwrap_or_else(|_| "steam_desktop_authenticator_rs".to_string())
        .split(',')
        .map(|s| s.to_string())
        .collect::<Vec<String>>();

    tauri::Builder::default()
        .plugin(
            tauri_plugin_log::Builder::new()
                .level(tauri_plugin_log::log::LevelFilter::Debug)
                .filter(move |metadata| {
                    enabled_targets
                        .iter()
                        .any(|prefix| metadata.target().starts_with(prefix))
                })
                // .target(tauri_plugin_log::Target::new(
                //     tauri_plugin_log::TargetKind::Stdout,
                // ))
                .build(),
        )
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let state = AppState::init(app);
            {
                let mut accounts_config = state.accounts_config.lock().unwrap();
                let current_account = accounts_config.get_active_account_mut();
                if let Some(account) = current_account {
                    match account.refresh_tokens_if_needed(state.transport.clone()) {
                        Ok(true) => {
                            log::info!(
                                "Refreshed access token for active account '{}'",
                                account.account_name
                            );
                            let config_path = app
                                .path()
                                .app_config_dir()
                                .expect("Expected access to config directory")
                                .join("config.json");
                            if let Err(err) = accounts_config.save_to_config(&config_path) {
                                log::error!(
                                    "Failed to save refreshed access token to config: {err}"
                                );
                            }
                        }
                        Ok(false) => {
                            log::debug!(
                                "Access token for account '{}' is still valid",
                                account.account_name
                            );
                        }
                        Err(err) => {
                            log::error!(
                                "Failed to refresh session for account '{}': {err}",
                                account.account_name
                            );
                            if let Err(notification_err) = app
                                .notification()
                                .builder()
                                .title("Token Refresh Failed")
                                .body(format!(
                                    "Failed to refresh session for account '{}'. You may need to log in again.",
                                    account.account_name
                                ))
                                .show()
                            {
                                log::warn!("Failed to show notification: {notification_err}");
                            }
                        }
                    }
                }
            }
            app.manage(state);

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            auth::commands::login,
            account_manager::commands::is_logged_in,
            account_manager::commands::get_accounts,
            account_manager::commands::get_active_account,
            account::commands::get_profile,
            authentication_approvals::commands::get_otp,
            authentication_approvals::commands::get_sessions,
            authentication_approvals::commands::approve_qr_login,
            authentication_approvals::commands::approve_session,
            authentication_approvals::commands::deny_session,
            confirmations::commands::get_confirmations,
            confirmations::commands::get_confirmation_details,
            confirmations::commands::accept_confirmation,
            confirmations::commands::deny_confirmation,
            confirmations::commands::accept_bulk_confirmations,
            confirmations::commands::deny_bulk_confirmations,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
