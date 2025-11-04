use std::time::{SystemTime, UNIX_EPOCH};

use steamguard::token::TwoFactorSecret;

use crate::AppState;

#[tauri::command]
pub fn get_otp(state: tauri::State<'_, AppState>) -> Option<String> {
    let shared_secret = state
        .accounts_config
        .lock()
        .unwrap()
        .get_active_account()
        .map(|account| account.shared_secret.clone());

    shared_secret.map(|secret| {
        TwoFactorSecret::parse_shared_secret(secret)
            .unwrap()
            .generate_code(
                SystemTime::now()
                    .duration_since(UNIX_EPOCH)
                    .unwrap()
                    .as_secs(),
            )
    })
}
