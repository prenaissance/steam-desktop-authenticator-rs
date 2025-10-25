use std::path::Path;

use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone, Default)]
pub struct UserCredentials {
    pub account_name: String,
    pub account_password: String,
    pub shared_secret: String,
    pub identity_secret: String,
    pub revocation_code: Option<String>,
    pub secret_1: Option<String>,
    pub refresh_token: String,
    pub access_token: String,
    pub cookies: Option<String>,
}

impl UserCredentials {
    pub fn retrieve_credentials(path: &Path) -> Vec<UserCredentials> {
        if !path.exists() {
            return Vec::new();
        }
        unimplemented!()
    }
}
