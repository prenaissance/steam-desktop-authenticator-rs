use base64::Engine;
use validator::ValidationError;

pub fn validate_base_64_of_length(length: usize, str: &str) -> Result<(), ValidationError> {
    let engine = base64::engine::general_purpose::STANDARD;
    match engine.decode(str) {
        Ok(bytes) => {
            if bytes.len() == length {
                Ok(())
            } else {
                Err(ValidationError::new("invalid_base64").with_message(
                    format!(
                        "The provided base64 string does not have the expected length of {}",
                        length
                    )
                    .into(),
                ))
            }
        }
        Err(_) => {
            let err = ValidationError::new("invalid_base64")
                .with_message("The provided string is not a valid base64 string".into());
            Err(err)
        }
    }
}

pub fn validate_steam_secret(str: &str) -> Result<(), ValidationError> {
    validate_base_64_of_length(20, str)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn fails_base64_validation_invalid_encoding() {
        assert!(validate_base_64_of_length(20, "[];'!!!").is_err())
    }

    #[test]
    fn fails_base64_validation_wrong_length() {
        assert!(validate_base_64_of_length(20, "RGF0YVdpdGhFbm91Z2hQYWRkaW5n").is_err())
    }

    #[test]
    fn passes_base64_validation_expected_length() {
        assert!(validate_base_64_of_length(20, "FSY2y2mThnpJv1h+lXKTVuH+cvQ=").is_ok())
    }
}
