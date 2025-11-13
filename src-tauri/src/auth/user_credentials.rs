use std::path::Path;
use std::time::{SystemTime, UNIX_EPOCH};

use serde::{Deserialize, Serialize};
use sha1::{Digest as _, Sha1};
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
    /// Set this on first login. Used later to differentiate between sessions
    pub device_id: String,
    pub revocation_code: Option<String>,
    pub secret_1: Option<String>,
    pub access_token: String,
    pub refresh_token: String,
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

    /// Migrated from https://github.com/DoctorMcKay/node-steam-totp/blob/master/index.js#L154
    ///
    /// To be used for quirky APIs that fail because of the device id
    pub fn consistent_device_id(&self) -> String {
        let mut hasher = Sha1::new();
        hasher.update(self.steam_id.to_string().as_bytes());
        let hash = hex::encode(hasher.finalize());
        let formatted_id = format!(
            "{}-{}-{}-{}-{}",
            &hash[0..8],
            &hash[8..12],
            &hash[12..16],
            &hash[16..20],
            &hash[20..32]
        );
        format!("android:{}", formatted_id)
    }
}

impl From<UserCredentials> for SteamGuardAccount {
    fn from(value: UserCredentials) -> Self {
        SteamGuardAccount {
            device_id: value.consistent_device_id(),
            account_name: value.account_name,
            steam_id: value.steam_id,
            serial_number: "".to_string(),
            revocation_code: value.revocation_code.unwrap_or_default().parse().unwrap(),
            shared_secret: TwoFactorSecret::parse_shared_secret(value.shared_secret)
                .expect("Validated before"),
            identity_secret: SecretString::new(value.identity_secret),
            token_gid: "".to_string(),
            uri: SecretString::new("".to_string()),
            secret_1: SecretString::new("".to_string()),
            tokens: Some(Tokens::new(value.access_token, value.refresh_token)),
        }
    }
}
