use std::path::Path;
use std::{fs, io};

use serde::{Deserialize, Serialize};

use crate::auth::user_credentials::UserCredentials;

#[derive(Debug, Serialize, Deserialize, Default)]
pub struct AccountsConfig {
    pub accounts: Vec<UserCredentials>,
    pub active_account_name: Option<String>,
}

#[derive(Debug)]
pub enum AccountsInitError {
    IoError(io::Error),
    DeserializationError,
}

impl AccountsConfig {
    pub fn from_config(config_path: &Path) -> Result<Self, AccountsInitError> {
        if !config_path.exists() {
            return Ok(Default::default());
        }
        let json_content = fs::read_to_string(config_path).map_err(AccountsInitError::IoError)?;
        serde_json::from_str(&json_content).map_err(|_| AccountsInitError::DeserializationError)
    }

    pub fn save_to_config(&self, config_path: &Path) -> io::Result<()> {
        if let Some(parent) = config_path.parent() {
            fs::create_dir_all(parent)?;
        }
        fs::write(config_path, serde_json::to_string_pretty(&self).unwrap())
    }

    pub fn get_active_account(&self) -> Option<&UserCredentials> {
        self.active_account_name
            .as_ref()
            .and_then(|active_account_name| {
                self.accounts
                    .iter()
                    .find(|account| account.account_name.as_str() == active_account_name)
            })
    }

    pub fn get_active_account_mut(&mut self) -> Option<&mut UserCredentials> {
        self.active_account_name
            .as_ref()
            .and_then(|active_account_name| {
                // Use iter_mut() to get mutable references to the items
                self.accounts
                    .iter_mut()
                    .find(|account| account.account_name.as_str() == active_account_name)
            })
    }
}
