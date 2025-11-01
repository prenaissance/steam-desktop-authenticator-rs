/// Add this in scope:
/// ```
/// use steamguard::steamapi::BuildableRequest;
/// ```
#[macro_export]
macro_rules! impl_buildable_req {
    ($type:ty, $needs_auth:literal) => {
        impl BuildableRequest for $type {
            fn method() -> reqwest::Method {
                reqwest::Method::POST
            }

            fn requires_access_token() -> bool {
                $needs_auth
            }
        }
    };
}
