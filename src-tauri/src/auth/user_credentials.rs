use std::path::Path;
use std::time::{SystemTime, UNIX_EPOCH};

use super::payloads::LoginError;
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

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum RefreshTokensError {
    JwtDecode(String),
    Steam(String),
}

impl std::fmt::Display for RefreshTokensError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::JwtDecode(err) => write!(f, "Failed to decode access token JWT: {err}"),
            Self::Steam(err) => write!(f, "Failed to refresh access token with Steam: {err}"),
        }
    }
}

impl std::error::Error for RefreshTokensError {}

impl UserCredentials {
    pub fn retrieve_credentials(path: &Path) -> Vec<UserCredentials> {
        if !path.exists() {
            return Vec::new();
        }
        unimplemented!()
    }

    pub fn relogin(&mut self, transport: impl Transport + Clone) -> Result<(), LoginError> {
        let tokens = crate::auth::perform_login(
            transport,
            &self.account_name,
            &self.account_password,
            &self.shared_secret,
        )?;

        self.access_token = tokens.access_token().expose_secret().to_string();
        self.refresh_token = tokens.refresh_token().expose_secret().to_string();
        if let Ok(decoded) = tokens.access_token().decode() {
            self.steam_id = decoded.steam_id();
        }

        Ok(())
    }

    pub fn refresh_tokens_if_needed(
        &mut self,
        transport: impl Transport + Clone,
    ) -> Result<bool, RefreshTokensError> {
        let client = AuthenticationClient::new(transport.clone());
        let mut refresher = TokenRefresher::new(client);
        let decoded = Jwt::from(self.access_token.clone())
            .decode()
            .map_err(|err| RefreshTokensError::JwtDecode(err.to_string()))?;
        let is_expired = decoded.exp
            < SystemTime::now()
                .duration_since(UNIX_EPOCH)
                .expect("Time went backwards")
                .as_secs();
        if !is_expired {
            return Ok(false);
        }
        let tokens = Tokens::new(self.access_token.clone(), self.refresh_token.clone());
        match refresher.refresh(self.steam_id, &tokens) {
            Ok(access_token) => {
                self.access_token = access_token.expose_secret().to_owned();
                Ok(true)
            }
            Err(refresh_err) => {
                log::warn!(
                    "Token refresh failed for account '{}': {refresh_err}. Attempting to re-login with stored credentials...",
                    self.account_name
                );
                match self.relogin(transport) {
                    Ok(()) => {
                        log::info!(
                            "Successfully re-authenticated account '{}' with stored credentials",
                            self.account_name
                        );
                        Ok(true)
                    }
                    Err(relogin_err) => Err(RefreshTokensError::Steam(format!(
                        "Token refresh failed ({refresh_err}), and automatic re-login failed ({relogin_err})"
                    ))),
                }
            }
        }
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

#[cfg(test)]
mod tests {
    use super::*;
    use base64::Engine;
    use protobuf::MessageFull;
    use steamguard::steamapi::{ApiRequest, ApiResponse, BuildableRequest};
    use steamguard::transport::{Transport, TransportError};

    fn make_test_jwt(exp: u64, steam_id: u64) -> String {
        let payload = serde_json::json!({
            "exp": exp,
            "iat": exp.saturating_sub(3600),
            "iss": "steam",
            "aud": ["client"],
            "sub": steam_id.to_string(),
            "jti": "mock-jti"
        });
        let payload_b64 =
            base64::engine::general_purpose::URL_SAFE_NO_PAD.encode(payload.to_string());
        format!("mock_header.{payload_b64}.mock_signature")
    }

    #[derive(Clone)]
    struct FailingTransport;

    impl Transport for FailingTransport {
        fn send_request<Req: BuildableRequest + MessageFull, Res: MessageFull>(
            &self,
            _req: ApiRequest<Req>,
        ) -> Result<ApiResponse<Res>, TransportError> {
            Err(TransportError::Unauthorized)
        }

        fn close(&mut self) {}
    }

    #[test]
    fn test_refresh_tokens_unexpired_returns_false() {
        let future_exp = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs()
            + 3600;
        let mut credentials = UserCredentials {
            steam_id: 76561198000000000,
            access_token: make_test_jwt(future_exp, 76561198000000000),
            refresh_token: "mock_refresh_token".to_string(),
            ..Default::default()
        };

        let result = credentials.refresh_tokens_if_needed(FailingTransport);
        assert_eq!(result, Ok(false));
    }

    #[test]
    fn test_refresh_tokens_invalid_jwt_returns_err() {
        let mut credentials = UserCredentials {
            steam_id: 76561198000000000,
            access_token: "invalid_jwt_token".to_string(),
            refresh_token: "mock_refresh_token".to_string(),
            ..Default::default()
        };

        let result = credentials.refresh_tokens_if_needed(FailingTransport);
        assert!(matches!(result, Err(RefreshTokensError::JwtDecode(_))));
    }

    #[test]
    fn test_refresh_tokens_expired_refresh_failure_returns_err() {
        let past_exp = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs()
            - 3600;
        let mut credentials = UserCredentials {
            steam_id: 76561198000000000,
            access_token: make_test_jwt(past_exp, 76561198000000000),
            refresh_token: "mock_refresh_token".to_string(),
            ..Default::default()
        };

        let result = credentials.refresh_tokens_if_needed(FailingTransport);
        assert!(matches!(result, Err(RefreshTokensError::Steam(_))));
    }
}
