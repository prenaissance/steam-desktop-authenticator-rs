/// Formats a user agent string into: "<Browser> Browser (<Platform>)"
pub fn format_user_agent(user_agent_string: &str) -> String {
    let browser = get_browser(user_agent_string);
    let platform = get_platform(user_agent_string);

    format!("{} Browser ({})", browser, platform)
}

/// Identifies the browser from the user agent string.
/// Order is important here, as many UAs contain "Chrome" and "Safari".
fn get_browser(ua: &str) -> &str {
    if ua.contains("Edg/") {
        "Edge"
    } else if ua.contains("OPR/") {
        "Opera"
    } else if ua.contains("Chrome/") {
        "Chrome"
    } else if ua.contains("Firefox/") {
        "Firefox"
    } else if ua.contains("Safari/") {
        // Must be checked *after* Chrome, Edge, and Opera
        "Safari"
    } else if ua.contains("Trident/") {
        // Internet Explorer
        "Internet Explorer"
    } else {
        "Unknown"
    }
}

/// Identifies the platform (OS) from the user agent string.
/// Order is important here, as "Android" UAs also contain "Linux".
fn get_platform(ua: &str) -> &str {
    if ua.contains("Windows NT") {
        "Windows"
    } else if ua.contains("Android") {
        // Must be checked *before* Linux
        "Android"
    } else if ua.contains("iPhone") || ua.contains("iPad") {
        "iOS"
    } else if ua.contains("Macintosh") || ua.contains("Mac OS X") {
        "macOS"
    } else if ua.contains("Linux") {
        "Linux"
    } else {
        "Unknown Platform"
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_chrome_windows() {
        let ua = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.36";
        assert_eq!(format_user_agent(ua), "Chrome Browser (Windows)");
    }

    #[test]
    fn test_firefox_macos() {
        let ua =
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:99.0) Gecko/20100101 Firefox/99.0";
        assert_eq!(format_user_agent(ua), "Firefox Browser (macOS)");
    }

    #[test]
    fn test_safari_macos() {
        let ua = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.4 Safari/605.1.15";
        assert_eq!(format_user_agent(ua), "Safari Browser (macOS)");
    }

    #[test]
    fn test_edge_windows() {
        let ua = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.88 Safari/537.36 Edg/100.0.1185.39";
        assert_eq!(format_user_agent(ua), "Edge Browser (Windows)");
    }

    #[test]
    fn test_chrome_android() {
        let ua = "Mozilla/5.0 (Linux; Android 12; Pixel 6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.88 Mobile Safari/537.36";
        // This test ensures "Android" is picked before "Linux"
        assert_eq!(format_user_agent(ua), "Chrome Browser (Android)");
    }

    #[test]
    fn test_safari_iphone() {
        let ua = "Mozilla/5.0 (iPhone; CPU iPhone OS 15_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.4 Mobile/15E148 Safari/604.1";
        assert_eq!(format_user_agent(ua), "Safari Browser (iOS)");
    }

    #[test]
    fn test_safari_ipad() {
        let ua = "Mozilla/5.0 (iPad; CPU OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1";
        assert_eq!(format_user_agent(ua), "Safari Browser (iOS)");
    }

    #[test]
    fn test_chrome_linux() {
        let ua = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.36";
        assert_eq!(format_user_agent(ua), "Chrome Browser (Linux)");
    }

    #[test]
    fn test_opera_windows() {
        let ua = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36 OPR/86.0.4363.59";
        assert_eq!(format_user_agent(ua), "Opera Browser (Windows)");
    }

    #[test]
    fn test_unknown() {
        let ua = "SomeRandomBot/1.0 (some.other.info)";
        assert_eq!(format_user_agent(ua), "Unknown Browser (Unknown Platform)");
    }

    #[test]
    fn test_ie_11() {
        let ua = "Mozilla/5.0 (Windows NT 10.0; WOW64; Trident/7.0; rv:11.0) like Gecko";
        assert_eq!(format_user_agent(ua), "Internet Explorer Browser (Windows)");
    }
}
