use serde::Serialize;
use steamguard::steamapi::ApiRequest;
use steamguard::token::Tokens;
use steamguard::transport::{Transport, TransportError, WebApiTransport};

use crate::protobufs::steammessages_player_steamclient::cplayer_get_player_link_details_response::PlayerLinkDetails;
use crate::protobufs::steammessages_player_steamclient::{
    CPlayer_GetPlayerLinkDetails_Request, CPlayer_GetPlayerLinkDetails_Response,
};
use crate::{AppState, impl_buildable_req};

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub enum GetProfileError {
    NoValidAccount,
    NetworkError,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ProfileResponse {
    pub steam_id: u64,
    pub persona_name: Option<String>,
    pub profile_url: Option<String>,
    pub account_name: String,
}

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

impl From<PlayerLinkDetails> for ProfileResponse {
    fn from(value: PlayerLinkDetails) -> Self {
        Self {
            steam_id: value.public_data.steamid(),
            persona_name: Some(value.public_data.persona_name().to_string()),
            profile_url: Some(value.public_data.profile_url().to_string()),
            account_name: value.private_data.account_name().to_string(),
        }
    }
}

impl From<TransportError> for GetProfileError {
    fn from(value: TransportError) -> Self {
        dbg!(value);
        GetProfileError::NetworkError
    }
}

impl_buildable_req!(
    CPlayer_GetPlayerLinkDetails_Request,
    reqwest::Method::GET,
    true
);
