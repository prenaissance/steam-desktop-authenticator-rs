use crate::auth::user_credentials::UserCredentials;
use anyhow::Result;
use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use std::{collections::HashMap, fs, path::PathBuf};

#[derive(Debug, Serialize, Deserialize, Default, Clone)]
pub struct StoredAccounts {
    pub accounts: HashMap<String, UserCredentials>,
    pub active_account: Option<String>,
}

#[derive(Debug)]
pub struct AccountsStore {
    file_path: PathBuf,
    store: Mutex<StoredAccounts>,
}

impl AccountsStore {
    pub fn new(file_path: PathBuf) -> Result<Self> {
        let store = if file_path.exists() {
            let content = fs::read_to_string(&file_path)?;
            serde_json::from_str(&content)?
        } else {
            StoredAccounts::default()
        };

        Ok(Self {
            file_path,
            store: Mutex::new(store),
        })
    }

    fn save(&self) -> Result<()> {
        let store = self.store.lock().unwrap();
        let content = serde_json::to_string_pretty(&*store)?;
        fs::write(&self.file_path, content)?;
        Ok(())
    }

    pub fn get_accounts(&self) -> Result<StoredAccounts> {
        let store = self.store.lock().unwrap();
        Ok((*store).clone())
    }

    pub fn add_account(&self, username: String, credentials: UserCredentials) -> Result<()> {
        let mut store = self.store.lock().unwrap();
        store.accounts.insert(username.clone(), credentials);
        if store.active_account.is_none() {
            store.active_account = Some(username);
        }
        self.save()?;
        Ok(())
    }

    pub fn remove_account(&self, username: &str) -> Result<()> {
        let mut store = self.store.lock().unwrap();
        store.accounts.remove(username);
        if store.active_account.as_deref() == Some(username) {
            store.active_account = store.accounts.keys().next().cloned();
        }
        self.save()?;
        Ok(())
    }

    pub fn set_active_account(&self, username: &str) -> Result<()> {
        let mut store = self.store.lock().unwrap();
        if store.accounts.contains_key(username) {
            store.active_account = Some(username.to_string());
            self.save()?;
            Ok(())
        } else {
            Err(anyhow::anyhow!("Account not found"))
        }
    }
}
