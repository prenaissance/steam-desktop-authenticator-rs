use protobuf::Enum;
use serde::{Deserialize, Serialize};
use steamguard::protobufs::enums::ESessionPersistence;
use steamguard::protobufs::steammessages_auth_steamclient::{
    CAuthentication_GetAuthSessionInfo_Response, EAuthSessionSecurityHistory,
    EAuthTokenPlatformType,
};

/// What even is required, steam?
#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AuthSessionResponse {
    pub ip: Option<String>,
    pub geoloc: Option<String>,
    pub city: Option<String>,
    pub state: Option<String>,
    pub country: Option<String>,
    pub platform_type: Option<EAuthTokenPlatformType>,
    pub device_friendly_name: Option<String>,
    pub version: Option<i32>,
    pub login_history: Option<EAuthSessionSecurityHistory>,
    pub requestor_location_mismatch: Option<bool>,
    pub high_usage_login: Option<bool>,
    pub requested_persistence: Option<ESessionPersistence>,
}

impl From<CAuthentication_GetAuthSessionInfo_Response> for AuthSessionResponse {
    fn from(value: CAuthentication_GetAuthSessionInfo_Response) -> Self {
        Self {
            ip: value.ip.clone(),
            geoloc: value.geoloc.clone(),
            city: value.city.clone(),
            state: value.state.clone(),
            country: value.country.clone(),
            platform_type: value
                .platform_type
                .and_then(|x| EAuthTokenPlatformType::from_i32(x.value())),
            device_friendly_name: value.device_friendly_name.clone(),
            version: value.version,
            login_history: value
                .login_history
                .and_then(|x| EAuthSessionSecurityHistory::from_i32(x.value())),
            requestor_location_mismatch: value.requestor_location_mismatch,
            high_usage_login: value.high_usage_login,
            requested_persistence: value
                .requested_persistence
                .and_then(|x| ESessionPersistence::from_i32(x.value())),
        }
    }
}

#[derive(Debug, Serialize)]
#[serde(tag = "type", content = "message")]
pub enum GetApprovalsError {
    Unauthorized,
    Unknown,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ApproveQrLoginRequest {
    pub challenge_url: String,
    pub persistence: ESessionPersistence,
}
