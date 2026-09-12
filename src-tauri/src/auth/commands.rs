use super::login::perform_login;
use super::payloads::{LoginError, LoginRequest};
use super::user_credentials::UserCredentials;
use crate::AppState;
use steamguard::transport::WebApiTransport;
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
    let tokens = perform_login(
        transport,
        &payload.username,
        &payload.password,
        &payload.shared_secret,
    )?;
    let user_credentials = UserCredentials {
        account_name: payload.username,
        account_password: payload.password,
        shared_secret: payload.shared_secret,
        identity_secret: payload.identity_secret,
        access_token: tokens.access_token().expose_secret().to_string(),
        refresh_token: tokens.refresh_token().expose_secret().to_string(),
        device_id: format!(
            "{} (steam-desktop-authenticator-rs)",
            gethostname::gethostname()
                .into_string()
                .expect("failed to get hostname")
        ),
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
