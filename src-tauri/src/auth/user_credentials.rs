use std::path::Path;
use std::time::{SystemTime, UNIX_EPOCH};

use serde::{Deserialize, Serialize};
use steamguard::refresher::TokenRefresher;
use steamguard::steamapi::AuthenticationClient;
use steamguard::token::{Jwt, Tokens, TwoFactorSecret};
use steamguard::transport::Transport;
use steamguard::{SecretString, SteamGuardAccount};

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

    pub fn refresh_tokens_if_needed(&mut self, transport: impl Transport) -> Result<bool, String> {
        let client = AuthenticationClient::new(transport);
        let mut refresher = TokenRefresher::new(client);
        let decoded = Jwt::from(self.access_token.clone())
            .decode()
            .map_err(|err| err.to_string())?;
        let is_expired = decoded.exp
            < SystemTime::now()
                .duration_since(UNIX_EPOCH)
                .expect("Time went backwards")
                .as_secs();
        if !is_expired {
            return Ok(false);
        }
        let tokens = Tokens::new(self.access_token.clone(), self.refresh_token.clone());
        let access_token = refresher
            .refresh(self.steam_id, &tokens)
            .map_err(|err| err.to_string())?;
        self.access_token = access_token.expose_secret().to_owned();
        Ok(true)
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
