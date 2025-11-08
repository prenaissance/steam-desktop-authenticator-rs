use super::accounts_response::{AccountResponse, AccountsResponse};
use crate::AppState;

#[tauri::command]
pub fn is_logged_in(state: tauri::State<'_, AppState>) -> bool {
    state
        .accounts_config
        .lock()
        .unwrap()
        .get_active_account()
        .is_some()
}

#[tauri::command]
pub fn get_accounts(state: tauri::State<'_, AppState>) -> AccountsResponse {
    state.accounts_config.lock().unwrap().into()
}

#[tauri::command]
pub fn get_active_account(state: tauri::State<'_, AppState>) -> Option<AccountResponse> {
    state
        .accounts_config
        .lock()
        .unwrap()
        .get_active_account()
        .map(|x| x.into())
}
