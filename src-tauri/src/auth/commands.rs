use crate::{auth::accounts_store::StoredAccounts, AppState};
use serde::Serialize;
use std::{path::PathBuf, sync::Mutex};
use tauri::State;

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Account {
    pub username: String,
    pub avatar_url: Option<String>,
    pub credentials: Option<AccountCredentials>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AccountCredentials {
    pub password: String,
    pub shared_secret: String,
    pub identity_secret: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct StoredAccountsResponse {
    pub accounts: std::collections::HashMap<String, Account>,
    pub active_account: Option<String>,
}

#[tauri::command]
pub async fn get_stored_accounts(
    state: State<'_, Mutex<AppState>>,
) -> Result<StoredAccountsResponse, String> {
    let state = state.lock().unwrap();
    let config = &state.accounts_config;

    let accounts = config
        .accounts
        .iter()
        .map(|cred| {
            (
                cred.account_name.clone(),
                Account {
                    username: cred.account_name.clone(),
                    avatar_url: cred.avatar_url.clone(),
                    credentials: Some(AccountCredentials {
                        password: cred.account_password.clone(),
                        shared_secret: cred.shared_secret.clone(),
                        identity_secret: cred.identity_secret.clone(),
                    }),
                },
            )
        })
        .collect();

    Ok(StoredAccountsResponse {
        accounts,
        active_account: config.active_account_name.clone(),
    })
}

#[tauri::command]
pub async fn store_account(
    state: State<'_, Mutex<AppState>>,
    username: String,
) -> Result<(), String> {
    let state = state.lock().unwrap();
    Ok(())
}

#[tauri::command]
pub async fn remove_account(
    state: State<'_, Mutex<AppState>>,
    username: String,
) -> Result<(), String> {
    let mut state = state.lock().unwrap();
    let config_path = state.config_path.clone();
    let config = &mut state.accounts_config;

    config.accounts.retain(|acc| acc.account_name != username);
    if config.active_account_name.as_deref() == Some(&username) {
        config.active_account_name = config.accounts.first().map(|acc| acc.account_name.clone());
    }

    config
        .save_to_config(&config_path)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn set_active_account(
    state: State<'_, Mutex<AppState>>,
    username: String,
) -> Result<(), String> {
    let mut state = state.lock().unwrap();
    let config_path = state.config_path.clone();
    let config = &mut state.accounts_config;

    if config
        .accounts
        .iter()
        .any(|acc| acc.account_name == username)
    {
        config.active_account_name = Some(username);
        config
            .save_to_config(&config_path)
            .map_err(|e| e.to_string())
    } else {
        Err("Account not found".to_string())
    }
}
