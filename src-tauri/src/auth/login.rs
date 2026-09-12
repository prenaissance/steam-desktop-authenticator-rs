use std::time::{SystemTime, UNIX_EPOCH};

use steamguard::protobufs::steammessages_auth_steamclient::{
    EAuthSessionGuardType, EAuthTokenPlatformType,
};
use steamguard::token::{Tokens, TwoFactorSecret};
use steamguard::transport::Transport;
use steamguard::{DeviceDetails, UserLogin};

use super::payloads::LoginError;

pub fn perform_login(
    transport: impl Transport + Clone,
    username: &str,
    password: &str,
    shared_secret: &str,
) -> Result<Tokens, LoginError> {
    let device_id = format!(
        "{} (steam-desktop-authenticator-rs)",
        gethostname::gethostname()
            .into_string()
            .unwrap_or_else(|_| "localhost".to_string())
    );
    // see https://github.com/dyc3/steamguard-cli/blob/4a70af5bfd073604c2afe9f0eb2f0a0d0f4f5113/src/login.rs#L235
    let mut user_login = UserLogin::new(
        transport,
        DeviceDetails {
            friendly_name: device_id,
            platform_type: EAuthTokenPlatformType::k_EAuthTokenPlatformType_MobileApp,
            os_type: -500, // Android Unknown
            gaming_device_type: 528,
        },
    );
    let confirmation_methods = user_login
        .begin_auth_via_credentials(username, password)
        .or(Err(LoginError::WrongCredentials))?;
    let is_device_code_available = confirmation_methods.iter().any(|method| {
        method.confirmation_type == EAuthSessionGuardType::k_EAuthSessionGuardType_DeviceCode
    });
    if !is_device_code_available {
        return Err(LoginError::Unimplemented);
    }
    let two_factor_secret = TwoFactorSecret::parse_shared_secret(shared_secret.to_string())
        .map_err(|_| LoginError::OtpError)?;
    let totp = two_factor_secret.generate_code(
        SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs(),
    );
    user_login
        .submit_steam_guard_code(
            EAuthSessionGuardType::k_EAuthSessionGuardType_DeviceCode,
            totp,
        )
        .or(Err(LoginError::OtpError))?;
    let tokens = user_login
        .poll_until_tokens()
        .map_err(|_| LoginError::OtpError)?;
    Ok(tokens)
}
