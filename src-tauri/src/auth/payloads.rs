use serde::{Deserialize, Serialize};
use validator::{Validate, ValidationErrors};

use crate::common::validators::validate_steam_secret;

#[derive(Debug, Validate, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LoginRequest {
    #[validate(length(min = 1))]
    pub username: String,

    #[validate(length(min = 1))]
    pub password: String,

    #[validate(length(equal = 28), custom(function = validate_steam_secret))]
    pub shared_secret: String,

    #[validate(length(equal = 28), custom(function = validate_steam_secret))]
    pub identity_secret: String,
}

#[derive(Debug, Serialize)]
#[serde(tag = "type", content = "message")]
pub enum LoginError {
    WrongCredentials,
    ValidationError(String),
    OtpError,
    IOError(String),
    Unimplemented,
}

impl From<ValidationErrors> for LoginError {
    fn from(value: ValidationErrors) -> Self {
        LoginError::ValidationError(value.to_string())
    }
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
