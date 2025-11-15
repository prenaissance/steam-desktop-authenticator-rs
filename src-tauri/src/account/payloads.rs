use serde::Serialize;
use steamguard::transport::TransportError;

use crate::{
    impl_buildable_req,
    protobufs::steammessages_player_steamclient::{
        CPlayer_GetPlayerLinkDetails_Request,
        cplayer_get_player_link_details_response::PlayerLinkDetails,
    },
};

#[derive(Debug, Serialize)]
#[serde(rename_all = "kebab-case")]
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
    fn from(_: TransportError) -> Self {
        GetProfileError::NetworkError
    }
}

impl_buildable_req!(
    CPlayer_GetPlayerLinkDetails_Request,
    reqwest::Method::GET,
    true
);
