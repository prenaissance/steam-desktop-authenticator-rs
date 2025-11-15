use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize, Serializer};
use steamguard::{Confirmation, ConfirmationId, ConfirmationType};

#[derive(Debug)]
pub struct ConfirmationTypeWrapper(pub ConfirmationType);

impl Serialize for ConfirmationTypeWrapper {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        let value = match self.0 {
            ConfirmationType::Test => "test",
            ConfirmationType::Trade => "trade",
            ConfirmationType::MarketSell => "market-sell",
            ConfirmationType::FeatureOptOut => "feature-opt-out",
            ConfirmationType::PhoneNumberChange => "phone-number-change",
            ConfirmationType::AccountRecovery => "account-recovery",
            ConfirmationType::ApiKeyCreation => "api-key-creation",
            ConfirmationType::JoinSteamFamily => "join-steam-family",
            ConfirmationType::Unknown(_) => "unknown",
        };

        serializer.serialize_str(value)
    }
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ConfirmationResponse {
    #[serde(rename = "type")]
    pub conf_type: ConfirmationTypeWrapper,
    pub type_name: String,
    pub id: String,
    /// Trade offer ID or market transaction ID
    pub creator_id: String,
    pub nonce: String,
    pub creation_time: DateTime<Utc>,
    pub cancel: String,
    pub accept: String,
    pub icon: Option<String>,
    pub multi: bool,
    pub headline: String,
    pub summary: Vec<String>,
}

impl From<Confirmation> for ConfirmationResponse {
    fn from(value: Confirmation) -> Self {
        Self {
            id: value.id,
            conf_type: ConfirmationTypeWrapper(value.conf_type),
            type_name: value.type_name,
            creator_id: value.creator_id,
            nonce: value.nonce,
            creation_time: DateTime::from_timestamp_secs(value.creation_time as i64)
                .expect("Always valid timestamps from Steam"),
            cancel: value.cancel,
            accept: value.accept,
            icon: value.icon,
            multi: value.multi,
            headline: value.headline,
            summary: value.summary,
        }
    }
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ConfirmationDetailsResponse {
    pub html: String,
}

#[derive(Debug, Serialize)]
#[serde(tag = "type", content = "message")]
pub enum GetConfirmationsError {
    Unauthorized,
    ApiError,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ConfirmationActionRequest {
    pub id: String,
    pub nonce: String,
}

impl<'a> From<&'a ConfirmationActionRequest> for ConfirmationId<'a> {
    fn from(value: &'a ConfirmationActionRequest) -> Self {
        Self::new(&value.id, &value.nonce)
    }
}

#[derive(Debug, Serialize)]
pub enum ConfirmationError {
    Unauthorized,
    ApiError,
    DeserializationError,
    NetworkFailure,
}
