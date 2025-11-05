use std::sync::MutexGuard;

use serde::Serialize;

use crate::account_manager::accounts_config::AccountsConfig;
use crate::auth::user_credentials::UserCredentials;

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AccountResponse {
    username: String,
    avatar_url: Option<String>,
}

impl From<&UserCredentials> for AccountResponse {
    fn from(value: &UserCredentials) -> Self {
        Self {
            username: value.account_name.clone(),
            avatar_url: None,
        }
    }
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AccountsResponse {
    accounts: Vec<AccountResponse>,
    active_account_name: Option<String>,
}

impl From<MutexGuard<'_, AccountsConfig>> for AccountsResponse {
    fn from(value: MutexGuard<'_, AccountsConfig>) -> Self {
        Self {
            accounts: value.accounts.iter().map(|x| x.into()).collect(),
            active_account_name: value.active_account_name.clone(),
        }
    }
}
