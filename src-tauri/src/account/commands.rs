use steamguard::steamapi::ApiRequest;
use steamguard::token::Tokens;
use steamguard::transport::{Transport, WebApiTransport};

use crate::AppState;
use crate::account::payloads::{GetProfileError, ProfileResponse};
use crate::protobufs::steammessages_player_steamclient::{
    CPlayer_GetPlayerLinkDetails_Request, CPlayer_GetPlayerLinkDetails_Response,
};

/// Profile picture WIP
#[tauri::command]
pub fn get_profile(state: tauri::State<'_, AppState>) -> Result<ProfileResponse, GetProfileError> {
    let accounts_config = state.accounts_config.lock().unwrap();
    let active_account = accounts_config
        .get_active_account()
        .ok_or(GetProfileError::NoValidAccount)?;
    let transport = WebApiTransport::new(reqwest::blocking::Client::new());
    let tokens = Tokens::new(
        active_account.access_token.clone(),
        active_account.refresh_token.clone(),
    );

    let request = CPlayer_GetPlayerLinkDetails_Request {
        steamids: vec![active_account.steam_id],
        ..Default::default()
    };
    let request = ApiRequest::new("IPlayerService", "GetPlayerLinkDetails", 1, request)
        .with_access_token(tokens.access_token());
    let response = transport.send_request::<CPlayer_GetPlayerLinkDetails_Request, CPlayer_GetPlayerLinkDetails_Response>(request)?;
    Ok(response.into_response_data().accounts.pop().unwrap().into())
}
