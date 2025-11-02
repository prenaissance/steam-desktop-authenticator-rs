use std::sync::Mutex;

use crate::account_manager::accounts_response::{AccountResponse, AccountsResponse};
use crate::AppState;

#[tauri::command]
pub fn is_logged_in(state: tauri::State<'_, Mutex<AppState>>) -> bool {
    state
        .lock()
        .unwrap()
        .accounts_config
        .get_active_account()
        .is_some()
}

#[tauri::command]
pub fn get_accounts(state: tauri::State<'_, Mutex<AppState>>) -> AccountsResponse {
    let guard = state.lock().unwrap();
    let accounts_config = &guard.accounts_config;
    accounts_config.into()
}

#[tauri::command]
pub fn get_active_account(state: tauri::State<'_, Mutex<AppState>>) -> Option<AccountResponse> {
    let guard = state.lock().unwrap();
    guard.accounts_config.get_active_account().map(|x| x.into())
}
