use std::path::Path;

use serde::{Deserialize, Serialize};
use steamguard::{
    token::{Tokens, TwoFactorSecret},
    SecretString, SteamGuardAccount,
};

#[derive(Debug, Serialize, Deserialize, Clone, Default)]
pub struct UserCredentials {
    pub steam_id: u64,
    pub account_name: String,
    pub account_password: String,
    pub shared_secret: String,
    pub identity_secret: String,
    pub revocation_code: Option<String>,
    pub secret_1: Option<String>,
    pub refresh_token: String,
    pub access_token: String,
    pub cookies: Option<String>,
}

impl UserCredentials {
    pub fn retrieve_credentials(path: &Path) -> Vec<UserCredentials> {
        if !path.exists() {
            return Vec::new();
        }
        unimplemented!()
    }
}

impl From<UserCredentials> for SteamGuardAccount {
    fn from(value: UserCredentials) -> Self {
        SteamGuardAccount {
            account_name: value.account_name,
            steam_id: 0,
            serial_number: "".to_string(),
            revocation_code: value.revocation_code.unwrap_or_default().parse().unwrap(),
            shared_secret: TwoFactorSecret::parse_shared_secret(value.shared_secret)
                .expect("Validated before"),
            identity_secret: SecretString::new(value.identity_secret),
            token_gid: "".to_string(),
            uri: SecretString::new("".to_string()),
            device_id: "testing".to_string(),
            secret_1: SecretString::new("".to_string()),
            tokens: Some(Tokens::new(value.access_token, value.refresh_token)),
        }
    }
}
