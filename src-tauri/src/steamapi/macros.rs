#[macro_export]
macro_rules! impl_buildable_req {
    ($type:ty, $method:expr, $needs_auth:literal) => {
        impl ::steamguard::steamapi::BuildableRequest for $type {
            fn method() -> ::reqwest::Method {
                $method
            }

            fn requires_access_token() -> bool {
                $needs_auth
            }
        }
    };

    ($type:ty, $needs_auth:literal) => {
        impl_buildable_req!($type, ::reqwest::Method::POST, $needs_auth);
    };
}
