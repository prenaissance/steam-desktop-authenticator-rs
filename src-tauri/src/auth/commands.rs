use crate::auth::payloads::LoginError;
use crate::auth::{payloads::LoginRequest, user_credentials::UserCredentials};
use crate::AppState;
use std::time::{SystemTime, UNIX_EPOCH};
use steamguard::{
    protobufs::steammessages_auth_steamclient::{EAuthSessionGuardType, EAuthTokenPlatformType},
    token::TwoFactorSecret,
    transport::WebApiTransport,
    DeviceDetails, UserLogin,
};
use tauri::{AppHandle, Manager};
use validator::Validate;

#[tauri::command]
pub fn login(app: AppHandle, payload: LoginRequest) -> Result<(), LoginError> {
    payload.validate()?;
    let config_path = app
        .path()
        .app_config_dir()
        .expect("Expected access to config directory")
        .join("config.json");
    let transport = WebApiTransport::new(reqwest::blocking::Client::new());
    // see https://github.com/dyc3/steamguard-cli/blob/4a70af5bfd073604c2afe9f0eb2f0a0d0f4f5113/src/login.rs#L235
    let mut user_login = UserLogin::new(
        transport.clone(),
        DeviceDetails {
            friendly_name: format!(
                "{} (steam-desktop-authenticator-rs)",
                gethostname::gethostname()
                    .into_string()
                    .expect("failed to get hostname")
            ),
            platform_type: EAuthTokenPlatformType::k_EAuthTokenPlatformType_MobileApp,
            os_type: -500,
            gaming_device_type: 528,
        },
    );
    let confirmation_methods = user_login
        .begin_auth_via_credentials(&payload.username, &payload.password)
        .or(Err(LoginError::WrongCredentials))?;
    let is_device_code_available = confirmation_methods.iter().any(|method| {
        method.confirmation_type == EAuthSessionGuardType::k_EAuthSessionGuardType_DeviceCode
    });
    if !is_device_code_available {
        return Err(LoginError::Unimplemented);
    }
    let two_factor_secret = TwoFactorSecret::parse_shared_secret(payload.shared_secret.clone())
        .expect("Validation done before");
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
        .expect("Didn't get any tokens");
    let user_credentials = UserCredentials {
        account_name: payload.username,
        account_password: payload.password,
        shared_secret: payload.shared_secret,
        identity_secret: payload.identity_secret,
        refresh_token: tokens.refresh_token().expose_secret().to_string(),
        access_token: tokens.access_token().expose_secret().to_string(),
        steam_id: tokens
            .access_token()
            .decode()
            .expect("Could not decode steam auth JWT")
            .steam_id(),
        ..Default::default()
    };
    let state = app.state::<AppState>();
    let config = &mut state.accounts_config.lock().unwrap();
    config.active_account_name = Some(user_credentials.account_name.clone());
    config.accounts.push(user_credentials);
    config
        .save_to_config(&config_path)
        .map_err(|err| LoginError::IOError(err.to_string()))?;
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn fails_login_request_validation_for_non_base64_secrets() {
        let request = LoginRequest {
            username: "matcha_latte".to_string(),
            password: "Password123!".to_string(),
            shared_secret: "[];'!!!".to_string(),
            identity_secret: "~~~~".to_string(),
        };

        assert!(request.validate().is_err())
    }

    #[test]
    fn passes_validation_valid_login_request() {
        let request = LoginRequest {
            username: "matcha_latte".to_string(),
            password: "Password123!".to_string(),
            shared_secret: "FSY2y2mThnpJv1h+lXKTVuH+cvQ=".to_string(),
            identity_secret: "FSY2y2mThnpJv1h+lXKTVuH+cvQ=".to_string(),
        };

        assert_eq!(request.validate(), Ok(()))
    }
}
