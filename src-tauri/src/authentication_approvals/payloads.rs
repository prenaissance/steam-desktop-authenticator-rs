use protobuf::Enum;
use serde::{Deserialize, Serialize};
use steamguard::ApproverError;
use steamguard::protobufs::enums::ESessionPersistence;
use steamguard::protobufs::steammessages_auth_steamclient::{
    CAuthentication_GetAuthSessionInfo_Response, EAuthSessionSecurityHistory,
    EAuthTokenPlatformType,
};

/// What even is required, steam?
#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AuthSessionResponse {
    pub client_id: u64,
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

impl AuthSessionResponse {
    pub fn new(client_id: u64, response: CAuthentication_GetAuthSessionInfo_Response) -> Self {
        Self {
            client_id,
            ip: response.ip.clone(),
            geoloc: response.geoloc.clone(),
            city: response.city.clone(),
            state: response.state.clone(),
            country: response.country.clone(),
            platform_type: response
                .platform_type
                .and_then(|x| EAuthTokenPlatformType::from_i32(x.value())),
            device_friendly_name: response.device_friendly_name.clone(),
            version: response.version,
            login_history: response
                .login_history
                .and_then(|x| EAuthSessionSecurityHistory::from_i32(x.value())),
            requestor_location_mismatch: response.requestor_location_mismatch,
            high_usage_login: response.high_usage_login,
            requested_persistence: response
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
pub struct AuthApproveRequest {
    pub client_id: u64,
    pub persistence: ESessionPersistence,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AuthDenyRequest {
    pub client_id: u64,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "kebab-case")]
pub enum AuthApprovalError {
    Unknown,
    Unauthorized,
    Expired,
    DuplicateRequest,
}

impl From<ApproverError> for AuthApprovalError {
    fn from(err: ApproverError) -> Self {
        match err {
            ApproverError::DuplicateRequest => Self::DuplicateRequest,
            ApproverError::Expired => Self::Expired,
            ApproverError::Unauthorized => Self::Unauthorized,
            _ => Self::Unknown,
        }
    }
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ApproveQrLoginRequest {
    pub challenge_url: String,
    pub persistence: ESessionPersistence,
}
