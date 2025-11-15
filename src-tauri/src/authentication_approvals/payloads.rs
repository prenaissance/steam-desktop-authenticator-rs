use protobuf::Enum;
use serde::{Deserialize, Serialize};
use serde_with::{DisplayFromStr, serde_as};
use steamguard::ApproverError;
use steamguard::protobufs::enums::ESessionPersistence;
use steamguard::protobufs::steammessages_auth_steamclient::{
    CAuthentication_GetAuthSessionInfo_Response, EAuthSessionSecurityHistory,
    EAuthTokenPlatformType,
};

use crate::authentication_approvals::format_user_agent::format_user_agent;

/// What even is required, steam?
#[serde_as]
#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AuthSessionResponse {
    #[serde_as(as = "DisplayFromStr")]
    pub client_id: u64,
    pub ip: Option<String>,
    pub geoloc: Option<String>,
    pub city: Option<String>,
    pub state: Option<String>,
    pub country: Option<String>,
    pub platform_type: Option<EAuthTokenPlatformType>,
    pub device_user_agent: Option<String>,
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
            device_user_agent: response.device_friendly_name.clone(),
            device_friendly_name: response
                .device_friendly_name
                .as_deref()
                .map(format_user_agent),
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
#[serde(rename_all = "kebab-case")]
pub enum GetApprovalsError {
    Unauthorized,
    Unknown,
}

#[serde_as]
#[derive(Debug, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct AuthApproveRequest {
    #[serde_as(as = "DisplayFromStr")]
    pub client_id: u64,
    pub persistence: ESessionPersistence,
}

#[serde_as]
#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AuthDenyRequest {
    #[serde_as(as = "DisplayFromStr")]
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
        log::debug!("Received authentication request approval error: {err:?}");
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

#[cfg(test)]
mod tests {
    use serde_json::json;

    use super::*;

    #[test]
    fn serializes_client_id_as_numeric_string() {
        let user_agent = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36";
        let response = AuthSessionResponse {
            client_id: 9377380837889810614,
            ip: Some("8.8.8.8".to_string()),
            country: None,
            city: None,
            state: None,
            geoloc: None,
            device_user_agent: Some(user_agent.to_string()),
            device_friendly_name: Some(format_user_agent(user_agent)),
            high_usage_login: Some(false),
            login_history: Some(EAuthSessionSecurityHistory::k_EAuthSessionSecurityHistory_Invalid),
            platform_type: Some(EAuthTokenPlatformType::k_EAuthTokenPlatformType_WebBrowser),
            requested_persistence: Some(ESessionPersistence::k_ESessionPersistence_Persistent),
            requestor_location_mismatch: Some(false),
            version: Some(1),
        };
        let json = serde_json::to_string_pretty(&response).expect("Could not serialize response");
        let expected_fragment = "\"clientId\": \"9377380837889810614\"";

        assert!(
            json.contains(expected_fragment),
            "JSON did not contain the expected fragment.\nExpected: {}\nActual JSON: {}",
            expected_fragment,
            json
        );
    }

    #[test]
    fn deserializes_client_id_from_numeric_string() {
        let json = json!({
            "clientId": "9377380837889810614",
            "persistence": "k_ESessionPersistence_Persistent"
        })
        .to_string();
        let parsed = serde_json::from_str::<'_, AuthApproveRequest>(&json)
            .expect("Could not parse auth approve request");
        assert_eq!(
            parsed,
            AuthApproveRequest {
                client_id: 9377380837889810614,
                persistence: ESessionPersistence::k_ESessionPersistence_Persistent
            }
        );
    }
}
