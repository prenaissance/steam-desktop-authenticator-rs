use base64::Engine;
use validator::ValidationError;

pub fn validate_base_64(str: &str) -> Result<(), ValidationError> {
    let engine = base64::engine::general_purpose::STANDARD;
    match engine.decode(str) {
        Ok(_) => Ok(()),
        Err(_) => {
            let err = ValidationError::new("invalid_base64")
                .with_message("The provided string is not a valid base64 string".into());
            Err(err)
        }
    }
}
