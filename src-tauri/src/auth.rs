use crate::common::validators::validate_base_64;
use serde::{Deserialize, Serialize};
use std::time::{SystemTime, UNIX_EPOCH};
use steamguard::{
    protobufs::steammessages_auth_steamclient::{EAuthSessionGuardType, EAuthTokenPlatformType},
    token::TwoFactorSecret,
    transport::WebApiTransport,
    userlogin::UpdateAuthSessionError,
    DeviceDetails, UserLogin,
};
use tauri::{AppHandle, Manager};
use tokio;
use validator::{Validate, ValidationErrors};

mod user_credentials;

#[derive(Debug, Validate, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LoginRequest {
    #[validate(length(min = 1))]
    username: String,

    #[validate(length(min = 1))]
    password: String,

    #[validate(length(equal = 28), custom(function = validate_base_64))]
    shared_secret: String,

    #[validate(length(equal = 28), custom(function = validate_base_64))]
    identity_secret: String,
}

#[derive(Debug, Serialize)]
pub enum LoginError {
    WrongCredentials,
    ValidationError(String),
    OtpError,
}

impl From<ValidationErrors> for LoginError {
    fn from(value: ValidationErrors) -> Self {
        LoginError::ValidationError(value.to_string())
    }
}

impl From<UpdateAuthSessionError> for LoginError {
    fn from(value: UpdateAuthSessionError) -> Self {
        dbg!("Encountered {} kind OTP error", value);
        LoginError::OtpError
    }
}

impl From<steamguard::LoginError> for LoginError {
    fn from(_: steamguard::LoginError) -> Self {
        LoginError::WrongCredentials
    }
}

#[tauri::command]
pub async fn login(app: AppHandle, payload: LoginRequest) -> Result<(), LoginError> {
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
    let confirmation_methods =
        user_login.begin_auth_via_credentials(&payload.username, &payload.password)?;
    let is_device_code_available = confirmation_methods.iter().any(|method| {
        method.confirmation_type == EAuthSessionGuardType::k_EAuthSessionGuardType_DeviceCode
    });
    if !is_device_code_available {
        unimplemented!("Non TOTP authentication not implemented");
    }
    let two_factor_secret = TwoFactorSecret::parse_shared_secret(payload.shared_secret)
        .expect("Validation done before");
    user_login.submit_steam_guard_code(
        EAuthSessionGuardType::k_EAuthSessionGuardType_DeviceCode,
        two_factor_secret.generate_code(
            SystemTime::now()
                .duration_since(UNIX_EPOCH)
                .unwrap()
                .as_secs(),
        ),
    )?;
    let tokens = user_login
        .poll_until_tokens()
        .expect("Didn't get any tokens");
    tokio::fs::write(config_path, "").await.unwrap();
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
            shared_secret: "RGF0YVdpdGhFbm91Z2hQYWRkaW5n".to_string(),
            identity_secret: "RGF0YVdpdGhFbm91Z2hQYWRkaW5n".to_string(),
        };

        assert_eq!(request.validate(), Ok(()))
    }
}
