use std::{
    sync::Mutex,
    time::{SystemTime, UNIX_EPOCH},
};

use steamguard::token::TwoFactorSecret;

use crate::AppState;

#[tauri::command]
pub fn get_otp(state: tauri::State<'_, Mutex<AppState>>) -> Option<String> {
    let state_guard = state.lock().unwrap();
    let shared_secret = state_guard
        .accounts_config
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
