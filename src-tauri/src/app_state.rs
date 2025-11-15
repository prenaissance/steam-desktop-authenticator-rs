use std::{fs, sync::Mutex};

use steamguard::{SteamGuardAccount, transport::WebApiTransport};
use tauri::Manager;

use crate::account_manager::accounts_config::{AccountsConfig, AccountsInitError};

pub struct AppState {
    pub accounts_config: Mutex<AccountsConfig>,
    /// Feel free to clone this
    pub transport: WebApiTransport,
}

impl AppState {
    /// # Panics
    ///
    /// The function will fail on any initialization error. The state is absolutely necessary for application startup.
    pub fn init(app: &tauri::App) -> Self {
        let config_dir = app
            .path()
            .app_config_dir()
            .expect("Could not get app config dir");
        fs::create_dir_all(&config_dir).expect("Could not initialize the configuration path");
        let config_path = config_dir.join("config.json");

        let accounts_config = AccountsConfig::from_config(&config_path)
            .inspect_err(|err| match err {
                AccountsInitError::IoError(err) => {
                    panic!("Could not open the configuration file: {:?}", err)
                }
                AccountsInitError::DeserializationError => {
                    panic!("The account configuration file is corrupted")
                }
            })
            .unwrap();
        let accounts_config = Mutex::new(accounts_config);

        let transport = WebApiTransport::new(reqwest::blocking::Client::new());

        AppState {
            accounts_config,
            transport,
        }
    }

    pub fn get_active_steam_guard_account(&self) -> Option<SteamGuardAccount> {
        let accounts_config = self.accounts_config.lock().unwrap();
        let active_account = accounts_config.get_active_account()?;
        let steam_guard_account: SteamGuardAccount = active_account.clone().into();
        Some(steam_guard_account)
    }
}
